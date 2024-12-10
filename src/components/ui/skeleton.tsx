import { cn } from "@/utils/Ui"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-[#80808047]", className)}
      {...props}
    />
  )
}

export { Skeleton }
