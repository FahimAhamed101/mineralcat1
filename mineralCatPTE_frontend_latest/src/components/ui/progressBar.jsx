import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const progressVariants = cva("relative h-2 w-full overflow-hidden rounded-full bg-[#A9A9A9]")

const progressIndicatorVariants = cva("h-full w-full flex-1 transition-all", {
  variants: {
    color: {
      primary: "bg-primary",
      amber: "bg-amber-400",
      red: "bg-red-900",
      blue: "bg-blue-500",
      green: "bg-green-500",
      sky : "bg-sky-400",
    },
  },
  defaultVariants: {
    color: "primary",
  },
})

// Remove TypeScript type annotation and use JS props
const Progress = React.forwardRef(
  ({ className, value = 0, color = "primary", ...props }, ref) => (
    <div ref={ref} className={cn(progressVariants(), className)} {...props}>
      <div
        className={cn(progressIndicatorVariants({ color }))}
        style={{ transform: `translateX(-${100 - value}%)` }}
      />
    </div>
  )
)

Progress.displayName = "Progress"

export { Progress }