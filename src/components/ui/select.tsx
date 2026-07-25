import * as React from "react"
import { cn } from "@/lib/utils"

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => {
    return (
      <select
        className={cn("input", className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Select.displayName = "Select"
