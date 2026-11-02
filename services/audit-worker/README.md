# Moteur d'audit Cloud Run

Ce service remplace l'exécution Appwrite par deux services Cloud Run : une API de
démarrage authentifiée par un JWT Appwrite, puis un worker appelé par Cloud Tasks
pour chaque page. Appwrite reste la base des comptes, sites et résultats. Le nombre
de pages n'est pas plafonné dans le code ; le débit dépend des quotas Cloud Tasks et
Appwrite du projet.

## Configuration requise

- Un projet Google Cloud avec facturation active et les API Cloud Run, Cloud Tasks,
  Cloud Build et Artifact Registry activées.
- Une file Cloud Tasks en `europe-west1` (`konforme-audits` par défaut), configurée
  avec un maximum de 5 tentatives et une concurrence adaptée aux quotas Appwrite.
- Un compte de service d'exécution Cloud Run autorisé à créer des tâches
  (`roles/cloudtasks.enqueuer`).
- Un compte de service pour les tâches, autorisé à appeler uniquement le service
  Cloud Run worker (`roles/run.invoker`). Le compte d'exécution doit pouvoir
  l'utiliser pour créer les jetons OIDC.
- Une clé API Appwrite conservée dans Secret Manager, avec accès en lecture/écriture
  aux tables et accès en lecture aux équipes.

## Déploiement

Construire depuis la racine du dépôt : le `Dockerfile` racine installe les
dépendances du scanner et du worker. Déployer deux services à partir de cette image :

| Service | `SERVICE_ROLE` | Accès |
|---|---|---|
| `konforme-audit-worker` | `worker` | Authentification Cloud Run obligatoire ; Cloud Tasks est son seul appelant |
| `konforme-audit-api` | `api` | Accès réseau public, mais chaque lancement exige un JWT Appwrite valide |

Configurer les deux services avec `APPWRITE_ENDPOINT`, `APPWRITE_PROJECT_ID`,
`APPWRITE_API_KEY` (Secret Manager), `GOOGLE_CLOUD_PROJECT`,
`CLOUD_TASKS_LOCATION=europe-west1`, `CLOUD_TASKS_QUEUE=konforme-audits`,
`TASKS_SERVICE_ACCOUNT` et `AUDIT_WORKER_URL` (URL racine du service worker, sans
`/task`). Configurer aussi `ALLOWED_ORIGINS` sur l'URL exacte du site web, par exemple
`https://konforme-neon.vercel.app`, sur le service API.

Déployer d'abord le worker, récupérer son URL Cloud Run, puis configurer cette URL
dans `AUDIT_WORKER_URL` et redéployer les deux services. Vérifier `/healthz` sur les
deux URLs avant d'activer le moteur.

Enfin, ajouter `VITE_SCAN_WORKER_URL` avec l'URL racine du service API dans les
variables Vercel et redéployer le frontend. Sans cette variable, l'application
continue d'utiliser le moteur Appwrite historique ; ce chemin n'est pas recommandé
pour les très grands sites car les quotas et délais d'exécution des fonctions
Appwrite restent applicables.

La table Appwrite `scan_pages` et ses index doivent avoir été créés par
`scripts/provision-appwrite.cjs`. Ne jamais placer la clé API Appwrite dans une
variable `VITE_*` ni dans le frontend.
