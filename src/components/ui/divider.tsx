
import * as React from "react"

interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical"
  className?: string
}

const Divider = React.forwardRef<HTMLDivElement, DividerProps>(
  ({ orientation = "horizontal", className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="separator"
        className={`shrink-0 bg-border ${
          orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]"
        } ${className}`}
        {...props}
      />
    )
  }
)

Divider.displayName = "Divider"

export { Divider }
