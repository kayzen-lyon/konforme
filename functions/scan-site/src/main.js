// Konforme — moteur d'audit d'accessibilité (RGAA 4.1.2 / WCAG 2.2)
// Fonction Appwrite (Node). Deux modes :
//  - { scan_id } : crawle le site (max_pages du scan), exécute ~40 règles
//    RGAA maison + axe-core (~60 règles WCAG suppl.) et complète scan+issues ;
//  - { url } (mode public, sans compte) : analyse la page d'accueil seule et
//    renvoie un mini-rapport directement, sans écrire en base.
const { Client, TablesDB, Teams, Query, Permission, Role } = require('node-appwrite')
const { parse } = require('node-html-parser')
const { JSDOM, VirtualConsole } = require('jsdom')
const axe = require('axe-core')
const axeLocaleFr = require('axe-core/locales/fr.json')

const DB_ID = 'konforme'
const T = {
  sites: 'sites',
  scans: 'scans',
  scan_issues: 'scan_issues',
  criteria_reviews: 'criteria_reviews',
  alerts: 'alerts',
}

const DEFAULT_MAX_PAGES = 5
const MAX_PAGES_HARD_CAP = 30
const FETCH_TIMEOUT_MS = 10_000
const MAX_HTML_BYTES = 1_500_000
const MAX_PER_RULE_PER_PAGE = 10
const MAX_TOTAL_ISSUES = 400

/** Poids des sévérités dans le score (un critique pèse 6× un mineur). */
const SEVERITY_WEIGHT = { critical: 3, serious: 2, moderate: 1, minor: 0.5 }

/* ------------------------------------------------------------------ */
/* Helpers DOM (node-html-parser)                                      */
/* ------------------------------------------------------------------ */

function cssPath(el) {
  const parts = []
  let cur = el
  let depth = 0
  while (cur && cur.tagName && depth < 4) {
    let part = cur.tagName.toLowerCase()
    const id = cur.getAttribute('id')
    if (id) {
      parts.unshift(`${part}#${id}`)
      break
    }
    const cls = (cur.getAttribute('class') || '').trim().split(/\s+/).filter(Boolean)[0]
    if (cls) part += `.${cls}`
    parts.unshift(part)
    cur = cur.parentNode
    depth++
  }
  return parts.join(' > ')
}

function snippet(el) {
  const html = el.toString()
  return html.length > 280 ? html.slice(0, 277) + '…' : html
}

function v(el, detail) {
  return { selector: cssPath(el), snippet: snippet(el), detail }
}

function text(el) {
  return (el.text || '').replace(/\s+/g, ' ').trim()
}

const idMapCache = new WeakMap()

function rootOf(el) {
  let r = el
  while (r.parentNode) r = r.parentNode
  return r
}

function idMap(root) {
  let map = idMapCache.get(root)
  if (!map) {
    map = new Map()
    for (const el of root.querySelectorAll('[id]')) {
      const id = el.getAttribute('id')
      if (id && !map.has(id)) map.set(id, el)
    }
    idMapCache.set(root, map)
  }
  return map
}

function accessibleName(el) {
  const aria = (el.getAttribute('aria-label') || '').trim()
  if (aria) return aria
  const labelledby = (el.getAttribute('aria-labelledby') || '').trim()
  if (labelledby) {
    const map = idMap(rootOf(el))
    const resolved = labelledby
      .split(/\s+/)
      .map((id) => {
        const target = map.get(id)
        return target ? text(target) : ''
      })
      .filter(Boolean)
      .join(' ')
    // Ids introuvables : on considère quand même qu'un nom est déclaré
    // (la règle « Référence ARIA vers un id inexistant » signale le cas).
    return resolved || labelledby
  }
  const title = (el.getAttribute('title') || '').trim()
  if (title) return title
  const t = text(el)
  if (t) return t
  for (const img of el.querySelectorAll('img')) {
    const alt = (img.getAttribute('alt') || '').trim()
    if (alt) return alt
  }
  for (const st of el.querySelectorAll('svg title')) {
    const s = text(st)
    if (s) return s
  }
  return ''
}

function isHidden(el) {
  const style = (el.getAttribute('style') || '').toLowerCase()
  return style.includes('display:none') || style.includes('display: none') || el.hasAttribute('hidden')
}

function hasLabel(doc, ids, f) {
  if ((f.getAttribute('aria-label') || '').trim()) return true
  if ((f.getAttribute('aria-labelledby') || '').trim()) return true
  if ((f.getAttribute('title') || '').trim()) return true
  const id = f.getAttribute('id')
  if (id && doc.querySelectorAll('label').some((l) => l.getAttribute('for') === id)) return true
  let p = f.parentNode
  while (p && p.tagName) {
    if (p.tagName === 'LABEL') return true
    p = p.parentNode
  }
  return false
}

/* ------------------------------------------------------------------ */
/* Règles                                                              */
/* ------------------------------------------------------------------ */

const GENERIC_LINKS = [
  'cliquez ici', 'cliquer ici', 'ici', 'en savoir plus', 'lire la suite',
  'plus', 'voir', 'voir plus', 'click here', 'read more', 'more', 'link', 'lien',
]

const RULES = [
  {
    id: 'RGAA 1.1 / WCAG 1.1.1', rgaa: true, wcag: true, severity: 'critical', category: 'Images',
    title: 'Image sans alternative textuelle',
    description: "Chaque image porteuse d'information doit avoir un attribut alt. Sans lui, les lecteurs d'écran annoncent le nom du fichier ou rien du tout.",
    fix: 'Ajoutez alt="description de l\'image" (ou alt="" si l\'image est purement décorative).',
    check(doc) {
      const imgs = doc.querySelectorAll('img')
      if (imgs.length === 0) return null
      return imgs
        .filter((i) => i.getAttribute('alt') === undefined && i.getAttribute('role') !== 'presentation' && !isHidden(i))
        .map((i) => v(i))
    },
  },
  {
    id: 'RGAA 1.3 / WCAG 1.1.1', rgaa: true, wcag: true, severity: 'serious', category: 'Images',
    title: 'Alternative textuelle non pertinente',
    description: "L'attribut alt semble contenir un nom de fichier ou un texte générique, sans information pour l'utilisateur.",
    fix: "Remplacez l'alt par une description réelle du contenu ou de la fonction de l'image.",
    check(doc) {
      const imgs = doc.querySelectorAll('img').filter((i) => i.getAttribute('alt') !== undefined)
      if (imgs.length === 0) return null
      const bad = /\.(png|jpe?g|gif|webp|svg|avif)$|^(image|img|photo|picture|icon|logo)$|^[-_0-9]+$/i
      return imgs
        .filter((i) => {
          const alt = (i.getAttribute('alt') || '').trim()
          return alt !== '' && bad.test(alt)
        })
        .map((i) => v(i, `alt="${i.getAttribute('alt')}"`))
    },
  },
  {
    id: 'RGAA 8.3 / WCAG 3.1.1', rgaa: true, wcag: true, severity: 'serious', category: 'Éléments obligatoires',
    title: 'Langue du document absente ou invalide',
    description: 'La balise <html> doit porter un attribut lang valide (ex. lang="fr") pour que les synthèses vocales utilisent la bonne prononciation.',
    fix: 'Ajoutez lang="fr" (ou la langue réelle du contenu) sur la balise <html>.',
    check(doc) {
      const html = doc.querySelector('html')
      if (!html) return []
      const lang = (html.getAttribute('lang') || '').trim()
      if (!lang || !/^[a-z]{2,3}(-[A-Za-z0-9]+)*$/i.test(lang)) {
        return [{ selector: 'html', snippet: `<html lang="${lang}">`, detail: undefined }]
      }
      return []
    },
  },
  {
    id: 'RGAA 8.5 / WCAG 2.4.2', rgaa: true, wcag: true, severity: 'serious', category: 'Éléments obligatoires',
    title: 'Titre de page absent ou vide',
    description: "Chaque page doit avoir un <title> renseigné : première information lue par un lecteur d'écran et signal SEO majeur.",
    fix: 'Ajoutez un <title> unique et descriptif dans le <head>.',
    check(doc) {
      const title = doc.querySelector('head title') || doc.querySelector('title')
      if (!title || !text(title)) {
        return [{ selector: 'head > title', snippet: title ? title.toString() : '<title> manquant', detail: undefined }]
      }
      return []
    },
  },
  {
    id: 'RGAA 9.1 / WCAG 1.3.1', rgaa: true, wcag: true, severity: 'moderate', category: 'Structuration',
    title: 'Hiérarchie de titres incorrecte',
    description: 'La page doit contenir un h1 unique et une hiérarchie de titres sans saut de niveau (h2 avant h3, etc.).',
    fix: 'Structurez la page avec un seul h1, puis des h2/h3 sans sauter de niveau.',
    check(doc) {
      const hs = doc.querySelectorAll('h1,h2,h3,h4,h5,h6')
      const out = []
      const h1s = hs.filter((h) => h.tagName === 'H1')
      if (h1s.length === 0) out.push({ selector: 'body', snippet: null, detail: 'Aucun <h1> sur la page' })
      if (h1s.length > 1) h1s.slice(1).forEach((h) => out.push(v(h, 'h1 multiple')))
      let prev = 0
      for (const h of hs) {
        const lvl = Number(h.tagName[1])
        if (prev > 0 && lvl > prev + 1) out.push(v(h, `saut de h${prev} à h${lvl}`))
        prev = lvl
      }
      return out
    },
  },
  {
    id: 'RGAA 11.1 / WCAG 3.3.2', rgaa: true, wcag: true, severity: 'critical', category: 'Formulaires',
    title: 'Champ de formulaire sans étiquette',
    description: 'Chaque champ (<input>, <select>, <textarea>) doit être associé à un <label>, un aria-label ou un aria-labelledby.',
    fix: 'Associez un <label for="id-du-champ"> ou ajoutez aria-label="…" sur le champ.',
    check(doc, ids) {
      const fields = doc.querySelectorAll('input, select, textarea').filter((f) => {
        const type = (f.getAttribute('type') || '').toLowerCase()
        return !['hidden', 'submit', 'button', 'reset', 'image'].includes(type) && !isHidden(f)
      })
      if (fields.length === 0) return null
      return fields.filter((f) => !hasLabel(doc, ids, f)).map((f) => v(f))
    },
  },
  {
    id: 'RGAA 11.10 / WCAG 3.3.2', rgaa: true, wcag: true, severity: 'serious', category: 'Formulaires',
    title: 'Placeholder utilisé comme seule étiquette',
    description: "Le placeholder disparaît à la saisie : il ne peut pas servir d'étiquette unique.",
    fix: 'Conservez le placeholder comme exemple, mais ajoutez un vrai <label> ou un aria-label.',
    check(doc, ids) {
      const fields = doc.querySelectorAll('input, textarea').filter((f) => f.getAttribute('placeholder'))
      if (fields.length === 0) return null
      return fields.filter((f) => !hasLabel(doc, ids, f)).map((f) => v(f))
    },
  },
  {
    id: 'RGAA 6.2 / WCAG 2.4.4', rgaa: true, wcag: true, severity: 'critical', category: 'Liens',
    title: 'Lien sans intitulé',
    description: "Un lien sans texte accessible est annoncé « lien » par les lecteurs d'écran, sans indication de destination.",
    fix: "Ajoutez un texte visible, un aria-label ou un alt sur l'image contenue dans le lien.",
    check(doc) {
      const links = doc.querySelectorAll('a').filter((a) => a.getAttribute('href'))
      if (links.length === 0) return null
      return links.filter((a) => !isHidden(a) && accessibleName(a) === '').map((a) => v(a))
    },
  },
  {
    id: 'RGAA 6.1 / WCAG 2.4.4', rgaa: true, wcag: true, severity: 'moderate', category: 'Liens',
    title: 'Intitulé de lien non explicite',
    description: 'Des intitulés comme « cliquez ici » ne permettent pas de comprendre la destination du lien hors contexte.',
    fix: "Reformulez l'intitulé pour décrire la destination, ou complétez avec aria-label.",
    check(doc) {
      const links = doc.querySelectorAll('a').filter((a) => a.getAttribute('href'))
      if (links.length === 0) return null
      return links
        .filter((a) => {
          if ((a.getAttribute('aria-label') || '').trim()) return false
          const t = accessibleName(a).toLowerCase().replace(/[«»"']/g, '').trim()
          return GENERIC_LINKS.includes(t)
        })
        .map((a) => v(a, `intitulé : « ${accessibleName(a)} »`))
    },
  },
  {
    id: 'RGAA 11.9 / WCAG 4.1.2', rgaa: true, wcag: true, severity: 'critical', category: 'Formulaires',
    title: 'Bouton sans intitulé',
    description: "Un <button> vide (icône seule, sans alternative) est inutilisable avec un lecteur d'écran.",
    fix: 'Ajoutez un texte, un aria-label, ou un <title> dans le SVG du bouton.',
    check(doc) {
      const buttons = [
        ...doc.querySelectorAll('button'),
        ...doc.querySelectorAll('[role="button"]'),
        ...doc.querySelectorAll('input').filter((i) => ['button', 'submit'].includes((i.getAttribute('type') || '').toLowerCase())),
      ]
      if (buttons.length === 0) return null
      return buttons
        .filter((b) => {
          if (isHidden(b)) return false
          if (b.tagName === 'INPUT') return !(b.getAttribute('value') || '').trim() && !(b.getAttribute('aria-label') || '').trim()
          return accessibleName(b) === ''
        })
        .map((b) => v(b))
    },
  },
  {
    id: 'RGAA 8.2 / HTML valide', rgaa: true, wcag: false, severity: 'moderate', category: 'Éléments obligatoires',
    title: 'Identifiants (id) dupliqués',
    description: 'Des id dupliqués cassent les associations label/champ et aria-labelledby.',
    fix: 'Rendez chaque id unique dans la page.',
    check(doc) {
      const seen = new Map()
      for (const el of doc.querySelectorAll('[id]')) {
        const id = el.getAttribute('id')
        if (!id) continue
        const arr = seen.get(id) || []
        arr.push(el)
        seen.set(id, arr)
      }
      const out = []
      for (const [id, els] of seen) {
        if (els.length > 1) out.push(v(els[1], `id="${id}" présent ${els.length} fois`))
      }
      return out
    },
  },
  {
    id: 'RGAA 2.1 / WCAG 4.1.2', rgaa: true, wcag: true, severity: 'serious', category: 'Cadres',
    title: 'Cadre (iframe) sans titre',
    description: "Chaque <iframe> doit avoir un attribut title décrivant son contenu.",
    fix: 'Ajoutez title="description du contenu du cadre" sur l\'iframe.',
    check(doc) {
      const frames = doc.querySelectorAll('iframe, frame')
      if (frames.length === 0) return null
      return frames.filter((f) => !(f.getAttribute('title') || '').trim()).map((f) => v(f))
    },
  },
  {
    id: 'RGAA 5.6 / WCAG 1.3.1', rgaa: true, wcag: true, severity: 'moderate', category: 'Tableaux',
    title: 'Tableau de données sans en-têtes',
    description: 'Un tableau de données doit déclarer ses en-têtes avec <th> (et scope).',
    fix: 'Utilisez <th scope="col"> / <th scope="row"> pour les en-têtes du tableau.',
    check(doc) {
      const tablesEls = doc.querySelectorAll('table')
      if (tablesEls.length === 0) return null
      return tablesEls
        .filter((t) => t.getAttribute('role') !== 'presentation' && t.querySelectorAll('th').length === 0 && t.querySelectorAll('td').length > 2)
        .map((t) => v(t))
    },
  },
  {
    id: 'RGAA 13.2 / WCAG 3.2.5', rgaa: true, wcag: true, severity: 'minor', category: 'Consultation',
    title: 'Nouvelle fenêtre sans avertissement',
    description: "Les liens target=\"_blank\" ouvrent une nouvelle fenêtre sans prévenir l'utilisateur.",
    fix: "Indiquez l'ouverture dans une nouvelle fenêtre dans l'intitulé (texte ou aria-label).",
    check(doc) {
      const links = doc.querySelectorAll('a[target="_blank"]')
      if (links.length === 0) return null
      const mention = /nouvel|nouvelle|new window|new tab|externe/i
      return links
        .filter((a) => !mention.test(accessibleName(a)) && !mention.test(a.getAttribute('title') || ''))
        .map((a) => v(a))
    },
  },
  {
    id: 'RGAA 13.1 / WCAG 2.2.1', rgaa: true, wcag: true, severity: 'serious', category: 'Consultation',
    title: 'Redirection automatique (meta refresh)',
    description: 'Une balise <meta http-equiv="refresh"> impose une limite de temps non contrôlable.',
    fix: 'Supprimez le meta refresh, utilisez une redirection serveur ou un lien explicite.',
    check(doc) {
      return doc
        .querySelectorAll('meta[http-equiv]')
        .filter((m) => (m.getAttribute('http-equiv') || '').toLowerCase() === 'refresh')
        .map((m) => v(m))
    },
  },
  {
    id: 'WCAG 1.4.4 / Zoom', rgaa: false, wcag: true, severity: 'serious', category: 'Présentation',
    title: 'Zoom utilisateur bloqué',
    description: 'Le meta viewport interdit le zoom (user-scalable=no ou maximum-scale < 2).',
    fix: 'Retirez user-scalable=no et maximum-scale du meta viewport.',
    check(doc) {
      const vp = doc.querySelector('meta[name="viewport"]')
      if (!vp) return []
      const content = (vp.getAttribute('content') || '').toLowerCase()
      const noScale = /user-scalable\s*=\s*(no|0)/.test(content)
      const maxScale = content.match(/maximum-scale\s*=\s*([\d.]+)/)
      if (noScale || (maxScale && parseFloat(maxScale[1]) < 2)) return [v(vp, content)]
      return []
    },
  },
  {
    id: 'RGAA 12.8 / WCAG 2.4.3', rgaa: true, wcag: true, severity: 'moderate', category: 'Navigation',
    title: 'tabindex positif',
    description: "Un tabindex supérieur à 0 casse l'ordre naturel de tabulation.",
    fix: 'Utilisez uniquement tabindex="0" ou tabindex="-1".',
    check(doc) {
      const els = doc.querySelectorAll('[tabindex]')
      if (els.length === 0) return null
      return els
        .filter((el) => parseInt(el.getAttribute('tabindex') || '0', 10) > 0)
        .map((el) => v(el, `tabindex="${el.getAttribute('tabindex')}"`))
    },
  },
  {
    id: 'RGAA 4.10 / WCAG 1.4.2', rgaa: true, wcag: true, severity: 'serious', category: 'Multimédia',
    title: 'Lecture automatique de média',
    description: "Un média lancé automatiquement gêne les utilisateurs de lecteurs d'écran.",
    fix: "Supprimez l'attribut autoplay, ou coupez le son par défaut (muted).",
    check(doc) {
      return doc
        .querySelectorAll('audio[autoplay], video[autoplay]')
        .filter((m) => m.getAttribute('muted') === undefined)
        .map((m) => v(m))
    },
  },
  {
    id: 'RGAA 4.3 / WCAG 1.2.2', rgaa: true, wcag: true, severity: 'moderate', category: 'Multimédia',
    title: 'Vidéo sans sous-titres détectés',
    description: 'Aucune piste <track kind="captions"> détectée pour cette vidéo.',
    fix: 'Ajoutez <track kind="captions" srclang="fr" src="…"> à la vidéo.',
    check(doc) {
      const videos = doc.querySelectorAll('video')
      if (videos.length === 0) return null
      return videos
        .filter((vd) => !vd.querySelectorAll('track').some((t) => ['captions', 'subtitles'].includes(t.getAttribute('kind'))))
        .map((vd) => v(vd))
    },
  },
  {
    id: 'RGAA 12.6 / Landmarks', rgaa: true, wcag: false, severity: 'moderate', category: 'Navigation',
    title: 'Zone de contenu principal non identifiée',
    description: 'La page ne contient pas de repère <main> (ou role="main").',
    fix: 'Encadrez le contenu principal dans une balise <main> unique.',
    check(doc) {
      const mains = [...new Set([...doc.querySelectorAll('main'), ...doc.querySelectorAll('[role="main"]')])]
      if (mains.length === 0) return [{ selector: 'body', snippet: null, detail: 'Aucun <main> détecté' }]
      if (mains.length > 1) return mains.slice(1).map((m) => v(m, '<main> multiple'))
      return []
    },
  },
  {
    id: 'RGAA 12.7 / WCAG 2.4.1', rgaa: true, wcag: true, severity: 'moderate', category: 'Navigation',
    title: "Lien d'évitement absent",
    description: 'Aucun lien « aller au contenu » détecté en début de page.',
    fix: 'Ajoutez en premier élément focusable un lien interne vers le contenu principal.',
    check(doc) {
      const anchors = doc.querySelectorAll('a').filter((a) => (a.getAttribute('href') || '').startsWith('#'))
      const hasSkip = anchors.some((a) => /contenu|skip|main content|navigation/.test(accessibleName(a).toLowerCase()))
      if (!hasSkip) return [{ selector: 'body', snippet: null, detail: undefined }]
      return []
    },
  },
  {
    id: 'WCAG 4.1.2 / aria-hidden', rgaa: false, wcag: true, severity: 'serious', category: 'ARIA',
    title: "Élément focusable masqué aux lecteurs d'écran",
    description: 'Un élément interactif porte aria-hidden="true" : atteignable au clavier mais invisible pour les lecteurs d\'écran.',
    fix: "Retirez aria-hidden, ou rendez l'élément non focusable (tabindex=\"-1\", disabled).",
    check(doc) {
      const hidden = doc.querySelectorAll('[aria-hidden="true"]')
      if (hidden.length === 0) return null
      const focusableSel = (el) =>
        (el.tagName === 'A' && el.getAttribute('href')) ||
        ['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(el.tagName) ||
        el.getAttribute('tabindex') !== undefined
      const out = []
      for (const h of hidden) {
        const candidates = focusableSel(h) ? [h] : h.querySelectorAll('a, button, input, select, textarea, [tabindex]')
        for (const f of candidates) {
          if (!focusableSel(f)) continue
          if (f.getAttribute('tabindex') !== '-1' && f.getAttribute('disabled') === undefined) {
            out.push(v(f))
            break
          }
        }
      }
      return out
    },
  },
  {
    id: 'ARIA refs / WCAG 1.3.1', rgaa: false, wcag: true, severity: 'serious', category: 'ARIA',
    title: 'Référence ARIA vers un id inexistant',
    description: "aria-labelledby / aria-describedby pointe vers un id absent de la page : l'étiquette annoncée est vide.",
    fix: "Corrigez l'id référencé ou remplacez par aria-label.",
    check(doc, ids) {
      const els = [...doc.querySelectorAll('[aria-labelledby]'), ...doc.querySelectorAll('[aria-describedby]')]
      if (els.length === 0) return null
      const out = []
      for (const el of els) {
        for (const attr of ['aria-labelledby', 'aria-describedby']) {
          const val = el.getAttribute(attr)
          if (!val) continue
          for (const id of val.split(/\s+/)) {
            if (id && !ids.has(id)) out.push(v(el, `${attr}="${val}" → id "${id}" introuvable`))
          }
        }
      }
      return out
    },
  },
  {
    id: 'RGAA 11.6 / WCAG 1.3.1', rgaa: true, wcag: true, severity: 'moderate', category: 'Formulaires',
    title: 'Groupe de champs sans légende',
    description: 'Un <fieldset> sans <legend> ne fournit pas le contexte commun des champs regroupés.',
    fix: 'Ajoutez une <legend> en premier enfant du fieldset.',
    check(doc) {
      const sets = doc.querySelectorAll('fieldset')
      if (sets.length === 0) return null
      return sets.filter((f) => f.querySelectorAll('legend').length === 0).map((f) => v(f))
    },
  },
  {
    id: 'RGAA 10.1 / Présentation', rgaa: true, wcag: false, severity: 'minor', category: 'Présentation',
    title: 'Balises de présentation obsolètes',
    description: 'Les balises <font>, <center>, <marquee> ou <blink> sont obsolètes en HTML5.',
    fix: 'Supprimez ces balises et gérez la présentation en CSS.',
    check(doc) {
      return doc.querySelectorAll('font, center, marquee, blink').slice(0, MAX_PER_RULE_PER_PAGE).map((el) => v(el))
    },
  },
  {
    id: 'RGAA 6.1 / Lien-image', rgaa: true, wcag: true, severity: 'critical', category: 'Liens',
    title: 'Lien-image sans alternative',
    description: "Le lien ne contient qu'une image sans alt : destination inconnue pour un lecteur d'écran.",
    fix: "Renseignez l'alt de l'image avec la destination du lien (ex. alt=\"Accueil\").",
    check(doc) {
      const links = doc.querySelectorAll('a').filter((a) => a.getAttribute('href'))
      if (links.length === 0) return null
      return links
        .filter((a) => {
          if (text(a) !== '') return false
          if ((a.getAttribute('aria-label') || '').trim()) return false
          const imgs = a.querySelectorAll('img')
          return imgs.length > 0 && imgs.every((i) => !(i.getAttribute('alt') || '').trim())
        })
        .map((a) => v(a))
    },
  },
  {
    id: 'Contraste inline / WCAG 1.4.3', rgaa: true, wcag: true, severity: 'serious', category: 'Couleurs',
    title: 'Contraste de texte insuffisant (styles inline)',
    description: 'Le texte et son fond, déclarés en styles inline, présentent un rapport de contraste inférieur à 4,5:1.',
    fix: 'Ajustez les couleurs pour atteindre au moins 4,5:1 (texte normal) ou 3:1 (grand texte).',
    check(doc) {
      const els = doc.querySelectorAll('[style]').filter((el) => (el.getAttribute('style') || '').includes('color'))
      if (els.length === 0) return null
      const out = []
      for (const el of els) {
        const style = el.getAttribute('style') || ''
        const fg = parseColor(matchProp(style, 'color'))
        const bg = parseColor(matchProp(style, 'background-color') || matchProp(style, 'background'))
        if (!fg || !bg) continue
        if (text(el) === '') continue
        const ratio = contrastRatio(fg, bg)
        if (ratio < 4.5) out.push(v(el, `ratio ≈ ${ratio.toFixed(2)}:1`))
      }
      return out
    },
  },
  {
    id: 'RGAA 1.1 / WCAG 1.1.1 (area)', rgaa: true, wcag: true, severity: 'critical', category: 'Images',
    title: "Zone cliquable d'image réactive sans alternative",
    description: "Chaque zone <area> d'une image map doit avoir un attribut alt décrivant sa destination.",
    fix: 'Ajoutez alt="destination de la zone" sur chaque <area href="…">.',
    check(doc) {
      const areas = doc.querySelectorAll('area[href]')
      if (areas.length === 0) return null
      return areas
        .filter((a) => !(a.getAttribute('alt') || '').trim() && !(a.getAttribute('aria-label') || '').trim())
        .map((a) => v(a))
    },
  },
  {
    id: 'RGAA 1.1 / WCAG 1.1.1 (input image)', rgaa: true, wcag: true, severity: 'critical', category: 'Images',
    title: 'Bouton image sans alternative',
    description: 'Un <input type="image"> sans alt est annoncé « bouton » sans indication de sa fonction.',
    fix: 'Ajoutez alt="fonction du bouton" sur l\'input type="image".',
    check(doc) {
      const inputs = doc.querySelectorAll('input[type="image"]')
      if (inputs.length === 0) return null
      return inputs
        .filter((i) => !(i.getAttribute('alt') || '').trim() && !(i.getAttribute('aria-label') || '').trim())
        .map((i) => v(i))
    },
  },
  {
    id: 'RGAA 1.1 / WCAG 1.1.1 (svg)', rgaa: true, wcag: true, severity: 'serious', category: 'Images',
    title: 'SVG porteur d\'information sans nom accessible',
    description: 'Un <svg role="img"> doit avoir un nom accessible (aria-label, aria-labelledby ou <title> interne).',
    fix: 'Ajoutez aria-label="description" ou un élément <title> en premier enfant du SVG.',
    check(doc) {
      const svgs = doc.querySelectorAll('svg[role="img"]')
      if (svgs.length === 0) return null
      return svgs
        .filter(
          (s) =>
            !(s.getAttribute('aria-label') || '').trim() &&
            !(s.getAttribute('aria-labelledby') || '').trim() &&
            !s.querySelectorAll('title').some((t) => text(t)),
        )
        .map((s) => v(s))
    },
  },
  {
    id: 'RGAA 9.1 / WCAG 1.3.1 (titre vide)', rgaa: true, wcag: true, severity: 'serious', category: 'Structuration',
    title: 'Titre (h1-h6) vide',
    description: "Un titre sans contenu perturbe la navigation par titres des lecteurs d'écran.",
    fix: 'Renseignez le texte du titre ou supprimez la balise vide.',
    check(doc) {
      const hs = doc.querySelectorAll('h1,h2,h3,h4,h5,h6')
      if (hs.length === 0) return null
      return hs
        .filter(
          (h) =>
            !isHidden(h) &&
            text(h) === '' &&
            !(h.getAttribute('aria-label') || '').trim() &&
            !h.querySelectorAll('img').some((i) => (i.getAttribute('alt') || '').trim()),
        )
        .map((h) => v(h))
    },
  },
  {
    id: 'RGAA 11.1 / WCAG 3.3.2 (label orphelin)', rgaa: true, wcag: true, severity: 'serious', category: 'Formulaires',
    title: 'Étiquette (label) sans champ associé',
    description: "L'attribut for du <label> pointe vers un id qui n'existe pas : l'association étiquette/champ est cassée.",
    fix: "Faites correspondre le for du label à l'id du champ.",
    check(doc, ids) {
      const labels = doc.querySelectorAll('label[for]')
      if (labels.length === 0) return null
      return labels
        .filter((l) => {
          const f = (l.getAttribute('for') || '').trim()
          return f && !ids.has(f)
        })
        .map((l) => v(l, `for="${l.getAttribute('for')}" sans champ correspondant`))
    },
  },
  {
    id: 'ARIA role / WCAG 4.1.2', rgaa: false, wcag: true, severity: 'serious', category: 'ARIA',
    title: 'Rôle ARIA invalide',
    description: "L'attribut role contient une valeur inconnue de la spécification ARIA : il est ignoré par les technologies d'assistance.",
    fix: 'Utilisez un rôle ARIA valide (button, navigation, dialog…) ou retirez l\'attribut.',
    check(doc) {
      const els = doc.querySelectorAll('[role]')
      if (els.length === 0) return null
      return els
        .filter((el) => {
          const tokens = (el.getAttribute('role') || '').trim().toLowerCase().split(/\s+/).filter(Boolean)
          return tokens.length > 0 && !tokens.some((t) => VALID_ROLES.has(t))
        })
        .map((el) => v(el, `role="${el.getAttribute('role')}"`))
    },
  },
  {
    id: 'Imbrication / WCAG 4.1.2', rgaa: false, wcag: true, severity: 'serious', category: 'Liens',
    title: 'Éléments interactifs imbriqués',
    description: 'Un lien ou bouton contient un autre élément interactif : comportement imprévisible au clavier et au lecteur d\'écran.',
    fix: "Sortez l'élément imbriqué du lien/bouton parent.",
    check(doc) {
      const hosts = [...doc.querySelectorAll('a[href]'), ...doc.querySelectorAll('button')]
      if (hosts.length === 0) return null
      return hosts
        .filter((h) =>
          h.querySelectorAll('a[href], button, input, select, textarea, [role="button"], [role="link"]').length > 0,
        )
        .map((h) => v(h))
    },
  },
  {
    id: 'RGAA 7.3 / WCAG 2.1.1', rgaa: true, wcag: true, severity: 'serious', category: 'Scripts',
    title: 'Élément cliquable non accessible au clavier',
    description: 'Un élément non interactif (div, span…) porte un gestionnaire onclick sans rôle ni tabindex : inutilisable au clavier.',
    fix: 'Utilisez un <button>, ou ajoutez role="button" + tabindex="0" + gestion des touches Entrée/Espace.',
    check(doc) {
      const els = doc.querySelectorAll('[onclick]')
      if (els.length === 0) return null
      const interactive = new Set(['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'OPTION', 'SUMMARY', 'LABEL', 'AREA', 'DETAILS'])
      return els
        .filter(
          (el) =>
            !interactive.has(el.tagName) &&
            !(el.getAttribute('role') || '').trim() &&
            el.getAttribute('tabindex') === undefined,
        )
        .map((el) => v(el))
    },
  },
  {
    id: 'WCAG 3.2.2 / Formulaire', rgaa: true, wcag: true, severity: 'moderate', category: 'Formulaires',
    title: "Formulaire sans bouton d'envoi",
    description: "Un formulaire sans bouton de soumission force l'envoi implicite (touche Entrée), non découvrable pour tous.",
    fix: 'Ajoutez un <button type="submit"> (ou input type="submit") visible dans le formulaire.',
    check(doc) {
      const forms = doc.querySelectorAll('form')
      if (forms.length === 0) return null
      return forms
        .filter((f) => {
          const fields = f
            .querySelectorAll('input, select, textarea')
            .filter((i) => (i.getAttribute('type') || '').toLowerCase() !== 'hidden')
          if (fields.length === 0) return false
          return !f.querySelectorAll('button, input').some((b) => {
            const type = (b.getAttribute('type') || (b.tagName === 'BUTTON' ? 'submit' : '')).toLowerCase()
            return type === 'submit' || type === 'image'
          })
        })
        .map((f) => v(f))
    },
  },
  {
    id: 'RGAA 8.2 / Listes', rgaa: true, wcag: true, severity: 'moderate', category: 'Structuration',
    title: 'Élément de liste hors liste',
    description: 'Un <li> doit être enfant direct de <ul>, <ol> ou <menu> : hors liste, la structure annoncée est incohérente.',
    fix: 'Placez les <li> dans une balise <ul> ou <ol>.',
    check(doc) {
      const lis = doc.querySelectorAll('li')
      if (lis.length === 0) return null
      return lis
        .filter((li) => {
          const p = li.parentNode
          if (!p || !p.tagName) return true
          if (['UL', 'OL', 'MENU'].includes(p.tagName)) return false
          return (p.getAttribute('role') || '').toLowerCase() !== 'list'
        })
        .map((li) => v(li))
    },
  },
  {
    id: 'WCAG 1.4.10 / Viewport', rgaa: false, wcag: true, severity: 'minor', category: 'Présentation',
    title: 'Meta viewport absent',
    description: "Sans meta viewport, la page n'est pas adaptée aux mobiles et le contenu peut nécessiter un défilement horizontal.",
    fix: 'Ajoutez <meta name="viewport" content="width=device-width, initial-scale=1"> dans le <head>.',
    check(doc) {
      const vp = doc.querySelector('meta[name="viewport"]')
      if (!vp) return [{ selector: 'head', snippet: null, detail: 'meta viewport absent' }]
      return []
    },
  },
  {
    id: 'RGAA 1.3 / Alt trop long', rgaa: true, wcag: false, severity: 'minor', category: 'Images',
    title: 'Alternative textuelle trop longue',
    description: "Un alt de plus de 250 caractères est pénible à écouter ; une description longue relève d'une légende ou d'aria-describedby.",
    fix: "Raccourcissez l'alt et déplacez la description détaillée dans le contenu adjacent.",
    check(doc) {
      const imgs = doc.querySelectorAll('img')
      if (imgs.length === 0) return null
      return imgs
        .filter((i) => ((i.getAttribute('alt') || '').trim().length > 250))
        .map((i) => v(i, `alt de ${(i.getAttribute('alt') || '').trim().length} caractères`))
    },
  },
  {
    id: 'WCAG 1.3.5 / Autocomplete', rgaa: false, wcag: true, severity: 'minor', category: 'Formulaires',
    title: 'Champ personnel sans autocomplete',
    description: 'Les champs e-mail/téléphone sans attribut autocomplete privent les utilisateurs du remplissage automatique (WCAG 1.3.5).',
    fix: 'Ajoutez autocomplete="email" (ou "tel") sur le champ.',
    check(doc) {
      const fields = doc
        .querySelectorAll('input')
        .filter((i) => ['email', 'tel'].includes((i.getAttribute('type') || '').toLowerCase()) && !isHidden(i))
      if (fields.length === 0) return null
      return fields.filter((f) => !(f.getAttribute('autocomplete') || '').trim()).map((f) => v(f))
    },
  },
]

// Rôles ARIA 1.2 valides (rôles abstraits exclus : ils ne doivent pas être utilisés).
const VALID_ROLES = new Set([
  'alert', 'alertdialog', 'application', 'article', 'banner', 'blockquote', 'button', 'caption', 'cell',
  'checkbox', 'code', 'columnheader', 'combobox', 'complementary', 'contentinfo', 'definition', 'deletion',
  'dialog', 'directory', 'document', 'emphasis', 'feed', 'figure', 'form', 'generic', 'grid', 'gridcell',
  'group', 'heading', 'img', 'insertion', 'link', 'list', 'listbox', 'listitem', 'log', 'main', 'marquee',
  'math', 'menu', 'menubar', 'menuitem', 'menuitemcheckbox', 'menuitemradio', 'meter', 'navigation', 'none',
  'note', 'option', 'paragraph', 'presentation', 'progressbar', 'radio', 'radiogroup', 'region', 'row',
  'rowgroup', 'rowheader', 'scrollbar', 'search', 'searchbox', 'separator', 'slider', 'spinbutton', 'status',
  'strong', 'subscript', 'superscript', 'switch', 'tab', 'table', 'tablist', 'tabpanel', 'term', 'textbox',
  'time', 'timer', 'toolbar', 'tooltip', 'tree', 'treegrid', 'treeitem',
])

function matchProp(style, prop) {
  const re = new RegExp(`(?:^|;)\\s*${prop}\\s*:\\s*([^;]+)`, 'i')
  const m = style.match(re)
  return m ? m[1].trim() : null
}

function parseColor(raw) {
  if (!raw) return null
  const hex = raw.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)
  if (hex) {
    let h = hex[1]
    if (h.length === 3) h = h.split('').map((c) => c + c).join('')
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
  }
  const rgb = raw.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i)
  if (rgb) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])]
  const named = { white: [255, 255, 255], black: [0, 0, 0], red: [255, 0, 0], gray: [128, 128, 128], grey: [128, 128, 128] }
  return named[raw.toLowerCase()] || null
}

function contrastRatio(a, b) {
  const lum = (c) => {
    const [r, g, bl] = c.map((ch) => {
      const s = ch / 255
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl
  }
  const l1 = lum(a)
  const l2 = lum(b)
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
}

/* ------------------------------------------------------------------ */
/* axe-core (jsdom) — profondeur WCAG complémentaire                   */
/* ------------------------------------------------------------------ */

// Règles axe déjà couvertes par nos règles RGAA (évite les doublons dans le
// rapport) ou non fiables sans rendu CSS/layout (jsdom).
const AXE_SKIP = new Set([
  // Doublons de nos règles maison
  'image-alt', 'input-image-alt', 'area-alt', 'svg-img-alt', 'role-img-alt',
  'html-has-lang', 'html-lang-valid', 'document-title', 'label', 'link-name',
  'button-name', 'frame-title', 'duplicate-id', 'duplicate-id-active',
  'duplicate-id-aria', 'meta-refresh', 'meta-viewport', 'tabindex',
  'video-caption', 'audio-caption', 'region', 'skip-link', 'bypass',
  'nested-interactive', 'empty-heading', 'heading-order', 'list', 'listitem',
  'aria-roles', 'aria-hidden-focus', 'marquee', 'blink', 'landmark-one-main',
  'page-has-heading-one', 'autocomplete-valid',
  // Dépendants du rendu visuel : peu fiables dans jsdom
  'color-contrast', 'color-contrast-enhanced', 'link-in-text-block',
  'scrollable-region-focusable', 'target-size',
])

function axeWcagRef(tags) {
  const t = tags.find((x) => /^wcag\d{3,4}$/.test(x))
  if (!t) return null
  const d = t.slice(4)
  return `WCAG ${d[0]}.${d[1]}.${d.slice(2)}`
}

// Au-delà de cette taille, axe est ignoré : sur le CPU contraint des
// fonctions, il exploserait le délai (les règles maison suffisent alors).
const AXE_MAX_HTML_BYTES = 250_000
const AXE_TIMEOUT_MS = 15_000

/**
 * Exécute axe-core sur le HTML via jsdom. Renvoie { issues, applicable,
 * failed } dans le même format que le moteur maison (ids "axe:<rule>").
 * En cas d'échec, de page trop lourde ou de dépassement du budget temps,
 * renvoie un résultat vide : les règles maison restent la base du rapport.
 */
async function runAxe(url, html, { timeoutMs = AXE_TIMEOUT_MS } = {}) {
  const applicable = new Map()
  const failed = new Set()
  const issues = []
  if (html.length > AXE_MAX_HTML_BYTES) return { issues, applicable, failed }
  let dom
  let timer
  try {
    const virtualConsole = new VirtualConsole() // silencieux (erreurs CSS…)
    dom = new JSDOM(html, { url, runScripts: 'outside-only', pretendToBeVisual: true, virtualConsole })
    dom.window.eval(axe.source)
    dom.window.axe.configure({ locale: axeLocaleFr })
    const results = await Promise.race([
      dom.window.axe.run(dom.window.document, {
        resultTypes: ['violations', 'passes'],
        elementRef: false,
        pingWaitTime: 10,
      }),
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error('axe: budget temps dépassé')), timeoutMs)
      }),
    ])
    for (const p of results.passes) {
      if (AXE_SKIP.has(p.id)) continue
      applicable.set(`axe:${p.id}`, { severity: p.impact || 'moderate', rgaa: false, wcag: true })
    }
    for (const v of results.violations) {
      if (AXE_SKIP.has(v.id)) continue
      const id = `axe:${v.id}`
      const severity = ['critical', 'serious', 'moderate', 'minor'].includes(v.impact) ? v.impact : 'moderate'
      applicable.set(id, { severity, rgaa: false, wcag: true })
      failed.add(id)
      const wcagRef = axeWcagRef(v.tags)
      for (const node of v.nodes.slice(0, MAX_PER_RULE_PER_PAGE)) {
        issues.push({
          rule: {
            id,
            severity,
            category: 'WCAG approfondi',
            title: v.help,
            description: wcagRef ? `${v.description} (${wcagRef})` : v.description,
            fix: (node.failureSummary || '').replace(/^Corrigez[^:]*:\s*/i, '') || `Documentation : ${v.helpUrl}`,
          },
          selector: Array.isArray(node.target) ? node.target.join(' ') : String(node.target || ''),
          snippet: (node.html || '').slice(0, 500),
          detail: undefined,
        })
      }
    }
  } catch {
    /* axe indisponible ou trop lent sur cette page : on garde les règles maison */
  } finally {
    clearTimeout(timer)
    try { if (dom) dom.window.close() } catch { /* rien */ }
  }
  return { issues, applicable, failed }
}

/* ------------------------------------------------------------------ */
/* Crawl + analyse                                                     */
/* ------------------------------------------------------------------ */

async function fetchPage(url) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'KonformeBot/1.0 (+https://konforme.kayzen-lyon.com) audit accessibilite',
        Accept: 'text/html,application/xhtml+xml',
      },
    })
    if (!res.ok) return null
    const type = res.headers.get('content-type') || ''
    if (!type.includes('text/html') && !type.includes('xhtml')) return null
    const body = await res.text()
    return body.length > MAX_HTML_BYTES ? body.slice(0, MAX_HTML_BYTES) : body
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

// Suffixes publics composés les plus courants (évite de considérer
// « co.uk » ou « gouv.fr » comme un domaine enregistrable).
const TWO_PART_SUFFIXES = new Set([
  'co.uk', 'org.uk', 'ac.uk', 'gov.uk', 'com.au', 'net.au', 'org.au',
  'co.jp', 'co.nz', 'co.za', 'com.br', 'com.mx', 'com.tr', 'com.cn',
  'asso.fr', 'gouv.fr', 'com.fr',
])

/** Domaine enregistrable approché : exemple.fr, sous.exemple.fr → exemple.fr */
function registrableDomain(hostname) {
  const labels = hostname.toLowerCase().split('.').filter(Boolean)
  if (labels.length <= 2) return labels.join('.')
  const lastTwo = labels.slice(-2).join('.')
  const size = TWO_PART_SUFFIXES.has(lastTwo) ? 3 : 2
  return labels.slice(-size).join('.')
}

/** Même site = même domaine enregistrable (les sous-domaines sont crawlés). */
function isSameSite(urlObj, base) {
  return registrableDomain(urlObj.hostname) === registrableDomain(base.hostname)
}

/** Fetch texte générique (sitemap…) avec timeout, sans exigence de type. */
async function fetchText(url, maxBytes = 500_000) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      redirect: 'follow',
      headers: { 'User-Agent': 'KonformeBot/1.0 (+https://konforme.kayzen-lyon.com) audit accessibilite' },
    })
    if (!res.ok) return null
    const body = await res.text()
    return body.length > maxBytes ? body.slice(0, maxBytes) : body
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

function parseSitemapLocs(xml) {
  const out = []
  const re = /<loc>\s*([^<\s][^<]*?)\s*<\/loc>/g
  let m
  while ((m = re.exec(xml)) !== null && out.length < 500) out.push(m[1].trim())
  return out
}

/**
 * Plan B pour les SPA sans <a href> dans le HTML brut : découvre les pages
 * via /sitemap.xml (les index de sitemaps sont suivis d'un niveau).
 */
async function discoverFromSitemap(base, maxPages) {
  for (const p of ['/sitemap.xml', '/sitemap_index.xml']) {
    const xml = await fetchText(new URL(p, base).toString())
    if (!xml || !xml.includes('<loc>')) continue
    let locs = parseSitemapLocs(xml)
    if (locs.length && locs.every((l) => l.endsWith('.xml'))) {
      // Index de sitemaps : on suit le premier sous-sitemap du même site
      const sub = locs.find((l) => {
        try { return isSameSite(new URL(l), base) } catch { return false }
      })
      const subXml = sub ? await fetchText(sub) : null
      locs = subXml ? parseSitemapLocs(subXml) : []
    }
    const urls = []
    const baseNorm = base.toString().replace(/\/$/, '')
    for (const loc of locs) {
      try {
        const u = new URL(loc)
        if (!['http:', 'https:'].includes(u.protocol)) continue
        if (!isSameSite(u, base) || isForbiddenTarget(u)) continue
        if (/\.(xml|pdf|jpg|jpeg|png|gif|svg|zip|mp4|webp)$/i.test(u.pathname)) continue
        u.hash = ''
        u.search = ''
        const norm = u.toString().replace(/\/$/, '')
        if (norm !== baseNorm && !urls.includes(norm)) urls.push(norm)
        if (urls.length >= maxPages - 1) break
      } catch {
        /* loc invalide */
      }
    }
    if (urls.length) return urls
  }
  return []
}

function discoverLinks(doc, base, maxPages = DEFAULT_MAX_PAGES) {
  const found = new Set()
  for (const a of doc.querySelectorAll('a')) {
    const href = a.getAttribute('href') || ''
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) continue
    try {
      const u = new URL(href, base)
      if (!['http:', 'https:'].includes(u.protocol)) continue
      // Même site : sous-domaines du même domaine enregistrable inclus
      // (internet.exemple.fr peut renvoyer vers exemple.fr et inversement)
      if (!isSameSite(u, base)) continue
      if (isForbiddenTarget(u)) continue
      u.hash = ''
      u.search = ''
      if (/\.(pdf|jpg|jpeg|png|gif|svg|zip|mp4|webp|css|js|xml|ico)$/i.test(u.pathname)) continue
      const norm = u.toString().replace(/\/$/, '')
      if (norm !== base.toString().replace(/\/$/, '')) found.add(norm)
    } catch {
      /* URL invalide */
    }
  }
  return [...found].slice(0, maxPages - 1)
}

/**
 * Garde anti-SSRF : refuse les cibles locales/privées (le moteur fetch des
 * URL fournies par l'utilisateur, y compris en mode public sans compte).
 */
function isForbiddenTarget(u) {
  const host = u.hostname.toLowerCase()
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || host.endsWith('.internal')) return true
  if (host === '0.0.0.0' || host === '[::1]' || host === '::1') return true
  const ip4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)
  if (ip4) {
    const [a, b] = [Number(ip4[1]), Number(ip4[2])]
    if (a === 10 || a === 127 || a === 0) return true
    if (a === 172 && b >= 16 && b <= 31) return true
    if (a === 192 && b === 168) return true
    if (a === 169 && b === 254) return true // link-local / métadonnées cloud
  }
  return host.startsWith('[') // IPv6 littéral : refusé par précaution
}

/** Taux pondéré par sévérité : règles respectées ÷ applicables (poids). */
function weightedRate(applicable, failed, filter) {
  let denom = 0
  let num = 0
  for (const [id, meta] of applicable) {
    if (!filter(meta)) continue
    const w = SEVERITY_WEIGHT[meta.severity] ?? 1
    denom += w
    if (failed.has(id)) num += w
  }
  if (denom === 0) return null
  return Math.round((1 - num / denom) * 1000) / 10
}

async function analyzePage(url, html, { withAxe = true, axeTimeoutMs = AXE_TIMEOUT_MS } = {}) {
  const doc = parse(html)
  const ids = new Set(doc.querySelectorAll('[id]').map((el) => el.getAttribute('id')).filter(Boolean))
  const issues = []
  // id → { severity, rgaa, wcag } (règles maison + axe confondues)
  const applicable = new Map()
  const failed = new Set()
  for (const rule of RULES) {
    let violations
    try {
      violations = rule.check(doc, ids)
    } catch {
      continue
    }
    if (violations === null) continue
    applicable.set(rule.id, { severity: rule.severity, rgaa: rule.rgaa, wcag: rule.wcag })
    if (violations.length > 0) {
      failed.add(rule.id)
      for (const viol of violations.slice(0, MAX_PER_RULE_PER_PAGE)) {
        issues.push({ ...viol, rule })
      }
    }
  }
  if (withAxe) {
    const axeRes = await runAxe(url, html, { timeoutMs: axeTimeoutMs })
    for (const [id, meta] of axeRes.applicable) applicable.set(id, meta)
    for (const id of axeRes.failed) failed.add(id)
    issues.push(...axeRes.issues)
  }
  const score = weightedRate(applicable, failed, () => true)
  return { url, issues, applicable, failed, score }
}

function computeScores(pages) {
  const applicable = new Map()
  const failed = new Set()
  for (const p of pages) {
    for (const [id, meta] of p.applicable) {
      const prev = applicable.get(id)
      // garde la sévérité la plus lourde vue sur le site
      if (!prev || (SEVERITY_WEIGHT[meta.severity] ?? 1) > (SEVERITY_WEIGHT[prev.severity] ?? 1)) {
        applicable.set(id, meta)
      }
    }
    for (const id of p.failed) failed.add(id)
  }
  return {
    score: weightedRate(applicable, failed, () => true),
    rgaa_score: weightedRate(applicable, failed, (m) => m.rgaa),
    wcag_score: weightedRate(applicable, failed, (m) => m.wcag),
  }
}

/* ------------------------------------------------------------------ */
/* Alertes de régression                                               */
/* ------------------------------------------------------------------ */

// Baisse de score (en points) à partir de laquelle une alerte est créée
const REGRESSION_THRESHOLD = 5

/**
 * Envoie l'alerte par email aux membres de l'équipe via Resend, si la clé
 * RESEND_API_KEY est configurée sur la fonction. Sans clé : silencieux
 * (l'alerte in-app reste créée).
 */
async function sendRegressionEmail({ teams, teamId, siteName, scanId, message, log }) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    log('RESEND_API_KEY absent : alerte in-app uniquement (pas d’email).')
    return
  }
  try {
    const memberships = await teams.listMemberships({ teamId, queries: [Query.limit(10)] })
    const to = memberships.memberships.map((m) => m.userEmail).filter(Boolean).slice(0, 5)
    if (to.length === 0) return
    const appUrl = process.env.APP_URL || 'https://konforme-neon.vercel.app'
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        from: process.env.ALERT_EMAIL_FROM || 'Konforme <onboarding@resend.dev>',
        to,
        subject: `⚠ Régression d'accessibilité — ${siteName}`,
        html: `<p>${message}</p><p><a href="${appUrl}/dashboard/scans/${scanId}">Voir le rapport détaillé</a></p><p style="color:#666;font-size:12px">Alerte automatique Konforme — surveillance d'accessibilité RGAA.</p>`,
      }),
    })
    if (!r.ok) log(`Envoi email Resend ${r.status}`)
    else log(`Alerte envoyée par email à ${to.length} destinataire(s)`)
  } catch (e) {
    log(`Email de régression non envoyé : ${e.message || e}`)
  }
}

/* ------------------------------------------------------------------ */
/* Handler Appwrite                                                    */
/* ------------------------------------------------------------------ */

module.exports = async ({ req, res, log, error }) => {
  const endpoint = process.env.APPWRITE_FUNCTION_API_ENDPOINT || 'https://fra.cloud.appwrite.io/v1'
  const projectId = process.env.APPWRITE_FUNCTION_PROJECT_ID
  const apiKey = req.headers['x-appwrite-key'] || process.env.APPWRITE_API_KEY || ''
  const userId = req.headers['x-appwrite-user-id'] || ''

  const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey)
  const tables = new TablesDB(client)
  const teams = new Teams(client)

  let body = {}
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {})
  } catch {
    return res.json({ error: 'Corps JSON invalide' }, 400)
  }

  /* ---- Mode assistant IA : { explain: {...} } (utilisateurs connectés) ---- */
  if (!body.scan_id && !body.url && body.explain) {
    if (!userId) return res.json({ error: 'Authentification requise.' }, 401)
    const anthropicKey = process.env.ANTHROPIC_API_KEY
    if (!anthropicKey) {
      return res.json({ error: "L'assistant IA n'est pas activé sur cette instance." }, 503)
    }
    const ex = body.explain
    const title = String(ex.title || '').slice(0, 300)
    if (!title) return res.json({ error: 'title requis' }, 400)
    const prompt = `Tu es un expert en accessibilité web (RGAA 4.1.2 / WCAG 2.2) qui aide un développeur français.

Non-conformité détectée par l'audit automatique :
- Règle : ${String(ex.rule_id || '').slice(0, 100)} — ${title}
- Description : ${String(ex.description || '').slice(0, 1500) || '(non fournie)'}
- Sélecteur CSS : ${String(ex.selector || '').slice(0, 500) || '(non fourni)'}
- Piste générique : ${String(ex.suggested_fix || '').slice(0, 1000) || '(non fournie)'}
${ex.html_snippet ? `- Code HTML concerné :\n\`\`\`html\n${String(ex.html_snippet).slice(0, 4000)}\n\`\`\`` : ''}

Réponds en français, de façon concise et directement actionnable :
1. **Pourquoi c'est un problème** (1-2 phrases, impact utilisateur concret).
2. **Le correctif** : le code HTML corrigé, adapté au code fourni (bloc \`\`\`html).
3. **Comment vérifier** (1 phrase : test clavier, lecteur d'écran ou re-scan).

Pas de préambule, pas de conclusion générique.`
    try {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5',
          max_tokens: 900,
          messages: [{ role: 'user', content: prompt }],
        }),
      })
      const data = await r.json()
      if (!r.ok) {
        error(`API Anthropic ${r.status}: ${JSON.stringify(data).slice(0, 300)}`)
        return res.json({ error: "L'assistant IA est momentanément indisponible." }, 502)
      }
      const text = (data.content || [])
        .filter((b) => b.type === 'text')
        .map((b) => b.text)
        .join('\n')
        .trim()
      return res.json({ explanation: text })
    } catch (e) {
      error(String(e))
      return res.json({ error: "L'assistant IA est momentanément indisponible." }, 502)
    }
  }

  /* ---- Mode rapport partagé : { report: { token } } — lecture publique ---- */
  if (!body.scan_id && !body.url && body.report) {
    const token = String(body.report.token || '')
    if (!/^[A-Za-z0-9_-]{16,64}$/.test(token)) {
      return res.json({ error: 'Lien de partage invalide.' }, 422)
    }
    let found
    try {
      found = await tables.listRows({
        databaseId: DB_ID,
        tableId: T.scans,
        queries: [Query.equal('share_token', token), Query.limit(1)],
      })
    } catch (e) {
      error(String(e))
      return res.json({ error: 'Partage indisponible (base non migrée).' }, 503)
    }
    const s = found.rows[0]
    if (!s || s.status !== 'done') {
      return res.json({ error: 'Rapport introuvable ou lien révoqué.' }, 404)
    }
    const issues = []
    let cursor
    for (;;) {
      const q = [Query.equal('scan_id', s.$id), Query.limit(100)]
      if (cursor) q.push(Query.cursorAfter(cursor))
      const r = await tables.listRows({ databaseId: DB_ID, tableId: T.scan_issues, queries: q })
      issues.push(
        ...r.rows.map((i) => ({
          id: i.$id,
          rule_id: i.rule_id,
          severity: i.severity,
          category: i.category,
          title: i.title,
          description: i.description,
          page_url: i.page_url,
          selector: i.selector,
          html_snippet: i.html_snippet,
          suggested_fix: i.suggested_fix,
          status: i.status,
          created_at: i.$createdAt,
        })),
      )
      if (r.rows.length < 100) break
      cursor = r.rows[r.rows.length - 1].$id
    }
    let reviews = []
    try {
      const r = await tables.listRows({
        databaseId: DB_ID,
        tableId: T.criteria_reviews,
        queries: [Query.equal('site_id', s.site_id), Query.limit(200)],
      })
      reviews = r.rows.map((x) => ({
        criterion_id: x.criterion_id,
        status: x.status,
        note: x.note ?? null,
        reviewed_at: x.reviewed_at ?? x.$updatedAt,
      }))
    } catch {
      /* table absente : le rapport public reste servi sans évaluations */
    }
    let pageScores = null
    try {
      const parsed = JSON.parse(s.page_scores || 'null')
      if (Array.isArray(parsed)) pageScores = parsed
    } catch {
      /* JSON tronqué */
    }
    log(`Rapport partagé servi : scan ${s.$id}`)
    return res.json({
      site: { name: s.site_name ?? '—', url: s.site_url ?? '' },
      scan: {
        created_at: s.$createdAt,
        finished_at: s.finished_at ?? null,
        pages_count: s.pages_count ?? 0,
        issues_count: s.issues_count ?? 0,
        score: s.score ?? null,
        rgaa_score: s.rgaa_score ?? null,
        wcag_score: s.wcag_score ?? null,
        page_scores: pageScores,
      },
      issues,
      reviews,
    })
  }

  /* ---- Mode public : { url } sans compte — mini-rapport immédiat ---- */
  if (!body.scan_id && body.url) {
    let target
    try {
      target = new URL(String(body.url))
      if (!['http:', 'https:'].includes(target.protocol)) throw new Error('protocole')
    } catch {
      return res.json({ error: 'URL invalide. Incluez le protocole, ex. https://exemple.fr' }, 422)
    }
    if (isForbiddenTarget(target)) return res.json({ error: 'Cette cible n’est pas autorisée.' }, 422)
    const html = await fetchPage(target.toString())
    if (!html) {
      return res.json({ error: `La page ${target.hostname} est injoignable (délai dépassé, erreur HTTP ou contenu non HTML).` }, 502)
    }
    // Budget serré : l'exécution synchrone Appwrite est plafonnée à 30 s,
    // démarrage à froid du conteneur compris.
    const page = await analyzePage(target.toString(), html, { axeTimeoutMs: 8_000 })
    const scores = computeScores([page])
    const bySeverity = { critical: 0, serious: 0, moderate: 0, minor: 0 }
    const byRule = new Map()
    for (const i of page.issues) {
      bySeverity[i.rule.severity] = (bySeverity[i.rule.severity] || 0) + 1
      const cur = byRule.get(i.rule.id) || { rule_id: i.rule.id, severity: i.rule.severity, title: i.rule.title, count: 0 }
      cur.count++
      byRule.set(i.rule.id, cur)
    }
    const order = { critical: 0, serious: 1, moderate: 2, minor: 3 }
    const top_issues = [...byRule.values()].sort((a, b) => order[a.severity] - order[b.severity] || b.count - a.count).slice(0, 8)
    log(`Scan public : ${target.hostname} → ${scores.score}`)
    return res.json({
      url: target.toString(),
      score: scores.score,
      rgaa_score: scores.rgaa_score,
      wcag_score: scores.wcag_score,
      issues_count: page.issues.length,
      rules_checked: page.applicable.size,
      by_severity: bySeverity,
      top_issues,
    })
  }

  const scanId = body.scan_id
  if (!scanId) return res.json({ error: 'scan_id ou url requis' }, 400)

  let scan
  try {
    scan = await tables.getRow({ databaseId: DB_ID, tableId: T.scans, rowId: scanId })
  } catch {
    return res.json({ error: 'Scan introuvable' }, 404)
  }
  // Un scan complet est déclenché soit par un utilisateur authentifié (vérifié
  // plus bas), soit par le planificateur serveur (trigger 'scheduled').
  if (!userId && scan.trigger !== 'scheduled') {
    return res.json({ error: 'Authentification requise pour un audit complet.' }, 401)
  }
  if (scan.status !== 'pending') {
    return res.json({ error: `Scan déjà traité (statut ${scan.status})` }, 409)
  }

  const fail = async (message, code = 502) => {
    await tables.updateRow({
      databaseId: DB_ID,
      tableId: T.scans,
      rowId: scanId,
      data: { status: 'failed', finished_at: new Date().toISOString(), error: message.slice(0, 1900) },
    }).catch(() => {})
    return res.json({ error: message, scan_id: scanId }, code)
  }

  // Vérifie que l'appelant est bien membre de l'équipe du scan
  if (userId) {
    try {
      const memberships = await teams.listMemberships({
        teamId: scan.team_id,
        queries: [Query.equal('userId', userId)],
      })
      if (memberships.memberships.length === 0) return fail('Accès refusé à cette organisation.', 403)
    } catch {
      return fail("Impossible de vérifier l'appartenance à l'organisation.", 403)
    }
  }

  let baseUrl
  try {
    baseUrl = new URL(scan.site_url)
    if (!['http:', 'https:'].includes(baseUrl.protocol)) throw new Error('protocole')
  } catch {
    return fail('URL du site invalide.', 422)
  }
  if (isForbiddenTarget(baseUrl)) return fail('Cette cible n’est pas autorisée.', 422)

  const maxPages = Math.min(Math.max(Number(scan.max_pages) || DEFAULT_MAX_PAGES, 1), MAX_PAGES_HARD_CAP)

  const startedAt = Date.now()
  await tables.updateRow({
    databaseId: DB_ID,
    tableId: T.scans,
    rowId: scanId,
    data: { status: 'running', started_at: new Date().toISOString() },
  })

  try {
    const homeHtml = await fetchPage(baseUrl.toString())
    if (!homeHtml) {
      return fail(`La page ${baseUrl} est injoignable (délai dépassé, erreur HTTP ou contenu non HTML).`)
    }

    const homeDoc = parse(homeHtml)
    let extraUrls = discoverLinks(homeDoc, baseUrl, maxPages)
    if (extraUrls.length === 0 && maxPages > 1) {
      // SPA sans liens dans le HTML brut : on tente le sitemap
      extraUrls = await discoverFromSitemap(baseUrl, maxPages)
      if (extraUrls.length > 0) log(`Aucun lien dans le HTML brut : ${extraUrls.length} page(s) découvertes via sitemap.xml`)
    }
    // Budget global : axe est coupé quand on approche du timeout de la fonction
    const AXE_GLOBAL_BUDGET_MS = 200_000
    const pages = [await analyzePage(baseUrl.toString(), homeHtml, { axeTimeoutMs: 12_000 })]
    const extraHtml = await Promise.all(extraUrls.map((u) => fetchPage(u)))
    // Analyse séquentielle : jsdom+axe est gourmand en mémoire et en CPU.
    // Budget DUR : mieux vaut finaliser avec moins de pages que d'être tué
    // par le timeout de la fonction (ce qui laisserait un scan « running »).
    const HARD_BUDGET_MS = 240_000
    for (let i = 0; i < extraHtml.length; i++) {
      if (!extraHtml[i]) continue
      if (Date.now() - startedAt > HARD_BUDGET_MS) {
        log(`Budget temps global atteint : crawl arrêté à ${pages.length} page(s)`)
        break
      }
      const withAxe = Date.now() - startedAt < AXE_GLOBAL_BUDGET_MS
      pages.push(await analyzePage(extraUrls[i], extraHtml[i], { withAxe, axeTimeoutMs: 12_000 }))
    }
    log(`Pages analysées : ${pages.length}`)

    const allIssues = pages
      .flatMap((p) =>
        p.issues.map((i) => ({
          scan_id: scanId,
          team_id: scan.team_id,
          rule_id: i.rule.id,
          severity: i.rule.severity,
          category: i.rule.category,
          title: i.rule.title,
          description: i.detail ? `${i.rule.description}\n\nDétail : ${i.detail}` : i.rule.description,
          page_url: p.url,
          selector: i.selector,
          html_snippet: i.snippet,
          suggested_fix: i.rule.fix,
          status: 'open',
        })),
      )
      .slice(0, MAX_TOTAL_ISSUES)

    const permissions = [
      Permission.read(Role.team(scan.team_id)),
      Permission.update(Role.team(scan.team_id)),
      Permission.delete(Role.team(scan.team_id)),
    ]
    // Insertion avec une concurrence limitée
    const CONCURRENCY = 5
    for (let i = 0; i < allIssues.length; i += CONCURRENCY) {
      await Promise.all(
        allIssues.slice(i, i + CONCURRENCY).map((data) =>
          tables.createRow({
            databaseId: DB_ID,
            tableId: T.scan_issues,
            rowId: 'unique()',
            data,
            permissions,
          }),
        ),
      )
    }

    const scores = computeScores(pages)
    const finishedAt = new Date().toISOString()
    const pageScores = JSON.stringify(
      pages.slice(0, MAX_PAGES_HARD_CAP).map((p) => ({
        url: p.url.length > 300 ? p.url.slice(0, 300) : p.url,
        score: p.score,
        issues: p.issues.length,
      })),
    ).slice(0, 7900)
    const doneData = {
      status: 'done',
      finished_at: finishedAt,
      duration_ms: Date.now() - startedAt,
      pages_count: pages.length,
      issues_count: allIssues.length,
      page_scores: pageScores,
      ...scores,
    }
    try {
      await tables.updateRow({ databaseId: DB_ID, tableId: T.scans, rowId: scanId, data: doneData })
    } catch (err) {
      // Base pas encore migrée (colonne page_scores absente) : on n'échoue pas le scan
      delete doneData.page_scores
      await tables.updateRow({ databaseId: DB_ID, tableId: T.scans, rowId: scanId, data: doneData })
      log(`page_scores non enregistré : ${err.message || err}`)
    }
    await tables.updateRow({
      databaseId: DB_ID,
      tableId: T.sites,
      rowId: scan.site_id,
      data: { last_scan_at: finishedAt, last_score: scores.score },
    }).catch(() => {})

    // Alerte de régression : baisse de plus de 5 points par rapport au
    // dernier audit terminé du même site (typiquement après une mise en prod).
    try {
      const prevList = await tables.listRows({
        databaseId: DB_ID,
        tableId: T.scans,
        queries: [
          Query.equal('site_id', scan.site_id),
          Query.equal('status', 'done'),
          Query.orderDesc('$createdAt'),
          Query.limit(3),
        ],
      })
      const prev = prevList.rows.find((r) => r.$id !== scanId)
      if (
        prev &&
        typeof prev.score === 'number' &&
        typeof scores.score === 'number' &&
        scores.score < prev.score - REGRESSION_THRESHOLD
      ) {
        const siteName = scan.site_name || scan.site_url || 'votre site'
        const message = `Régression détectée sur ${siteName} : le score de conformité est passé de ${Math.round(prev.score)} % à ${Math.round(scores.score)} %.`
        await tables.createRow({
          databaseId: DB_ID,
          tableId: T.alerts,
          rowId: 'unique()',
          data: {
            team_id: scan.team_id,
            site_id: scan.site_id,
            scan_id: scanId,
            type: 'regression',
            message: message.slice(0, 500),
            previous_score: prev.score,
            new_score: scores.score,
            read: false,
          },
          permissions,
        })
        log(`Alerte de régression créée (${Math.round(prev.score)} → ${Math.round(scores.score)})`)
        await sendRegressionEmail({ teams, teamId: scan.team_id, siteName, scanId, message, log })
      }
    } catch (e) {
      // La détection ne doit jamais faire échouer un scan réussi
      log(`Détection de régression ignorée : ${e.message || e}`)
    }

    return res.json({
      scan_id: scanId,
      score: scores.score,
      issues_count: allIssues.length,
      pages_count: pages.length,
    })
  } catch (e) {
    error(String(e))
    return fail(e instanceof Error ? e.message : 'Erreur inconnue pendant le scan')
  }
}

/* Exposés pour les tests unitaires (le handler reste l'export par défaut). */
module.exports.RULES = RULES
module.exports.analyzePage = analyzePage
module.exports.computeScores = computeScores
module.exports.discoverLinks = discoverLinks
module.exports.accessibleName = accessibleName
module.exports.runAxe = runAxe
module.exports.isForbiddenTarget = isForbiddenTarget
module.exports.SEVERITY_WEIGHT = SEVERITY_WEIGHT
module.exports.registrableDomain = registrableDomain
module.exports.isSameSite = isSameSite
module.exports.parseSitemapLocs = parseSitemapLocs
module.exports.discoverFromSitemap = discoverFromSitemap
