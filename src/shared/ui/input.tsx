import * as React from "react"

import { cn } from "@/shared/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-white placeholder:text-zinc-500 selection:bg-[#2ecc71] selection:text-black bg-zinc-950/50 border-zinc-800 h-10 w-full min-w-0 rounded-md border px-3 py-1 text-base shadow-sm transition-all duration-300 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm text-zinc-200",
        "focus-visible:border-[#2ecc71] focus-visible:ring-[#2ecc71]/30 focus-visible:ring-[3px] focus-visible:shadow-[0_0_10px_rgba(46,204,113,0.2)]",
        "aria-invalid:ring-red-500/30 aria-invalid:border-red-500",
        className
      )}
      {...props}
    />
  )
}

export { Input }
