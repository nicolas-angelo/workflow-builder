import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

export function AppHeader({ children }: React.ComponentProps<'div'>) {
  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        {children}
      </div>
    </header>
  )
}

export function AppHeaderIcon({
  children,
  className,
}: React.ComponentProps<'span'>) {
  return (
    <span
      className={cn(
        'flex items-center justify-center [&_svg]:size-5',
        className
      )}
    >
      {children}
    </span>
  )
}

export function AppHeaderTitle({
  children,
  className,
}: React.ComponentProps<'span'>) {
  return (
    <span className={cn('font-medium text-base', className)}>
      {children}
    </span>
  )
}

export function AppHeaderSeparator({
  className,
}: React.ComponentProps<'div'>) {
  return (
    <Separator
      className={cn('mx-2 data-[orientation=vertical]:h-4', className)}
      orientation="vertical"
    />
  )
}
