import { cva } from 'class-variance-authority'

/** Boutons KAYZEN : pilules Outfit gras. Partagé avec les liens stylés en bouton. */
export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-display font-bold tracking-[-0.01em] transition-[background-color,border-color,color,box-shadow,transform] duration-200 active:scale-[0.97] focus-visible:outline-3 focus-visible:outline-focus focus-visible:outline-offset-3 disabled:opacity-40 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-on-primary shadow-micro hover:bg-primary-2 hover:shadow-glow',
        ghost:
          'bg-transparent text-text border-2 border-text/15 hover:border-text/30 hover:bg-raise',
        outline:
          'bg-surface-2 text-text border border-border-strong hover:bg-raise',
        danger:
          'bg-[#b91c1c] text-white hover:bg-[#991b1b]',
        link:
          'bg-transparent text-link underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-10 px-4 text-sm',
        md: 'h-12 px-6 text-[0.95rem]',
        lg: 'h-14 px-8 text-base',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
)
