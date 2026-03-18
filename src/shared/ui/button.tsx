/* eslint-disable react-refresh/only-export-components */
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/shared/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-[#2ecc71] text-black font-bold hover:bg-[#27ae60] shadow-[0_0_10px_rgba(46,204,113,0.4)] hover:shadow-[0_0_20px_rgba(46,204,113,0.6)]",
        destructive:
          "bg-[#e74c3c] text-white font-bold hover:bg-[#c0392b] shadow-[0_0_10px_rgba(231,76,60,0.4)] hover:shadow-[0_0_20px_rgba(231,76,60,0.6)]",
        outline:
          "border border-zinc-700 bg-transparent hover:bg-zinc-800 hover:text-white text-zinc-300 font-medium",
        secondary:
          "bg-zinc-800 text-zinc-100 hover:bg-zinc-700 font-medium shadow-[0_0_10px_rgba(0,0,0,0.5)]",
        ghost:
          "hover:bg-zinc-800/50 hover:text-zinc-100 text-zinc-400",
        link: "text-[#2ecc71] underline-offset-4 hover:underline drop-shadow-[0_0_5px_rgba(46,204,113,0.5)]",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
