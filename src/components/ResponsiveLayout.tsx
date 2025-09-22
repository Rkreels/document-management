import React, { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ResponsiveLayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
  header?: ReactNode;
  toolbar?: ReactNode;
  className?: string;
  variant?: 'default' | 'split' | 'overlay' | 'mobile-first';
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  sidebar,
  header,
  toolbar,
  className,
  variant = 'default'
}) => {
  const baseClasses = "min-h-screen w-full";
  
  const layoutClasses = {
    default: "flex flex-col",
    split: "grid grid-cols-1 lg:grid-cols-[300px_1fr]",
    overlay: "relative",
    'mobile-first': "flex flex-col lg:grid lg:grid-cols-[250px_1fr]"
  };

  return (
    <div className={cn(baseClasses, layoutClasses[variant], className)}>
      {/* Header - Always on top */}
      {header && (
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center px-4 sm:px-6">
            {header}
          </div>
        </header>
      )}

      {/* Main layout container */}
      <div className={cn(
        "flex-1 flex",
        variant === 'split' && "lg:grid lg:grid-cols-[300px_1fr]",
        variant === 'mobile-first' && "flex-col lg:grid lg:grid-cols-[250px_1fr]"
      )}>
        {/* Sidebar - Responsive behavior */}
        {sidebar && (
          <aside className={cn(
            "border-r bg-muted/20",
            // Mobile: hidden by default, show as overlay when needed
            "hidden lg:block lg:w-full",
            variant === 'overlay' && "lg:absolute lg:left-0 lg:top-16 lg:h-[calc(100vh-4rem)] lg:z-30",
            variant === 'mobile-first' && "lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)]"
          )}>
            <div className="h-full overflow-auto p-4">
              {sidebar}
            </div>
          </aside>
        )}

        {/* Main content area */}
        <main className={cn(
          "flex-1 flex flex-col min-w-0", // min-w-0 prevents flex item overflow
          "overflow-hidden", // Prevent content from breaking layout
        )}>
          {/* Toolbar - Just above main content */}
          {toolbar && (
            <div className="border-b bg-muted/30 px-4 py-2 lg:px-6">
              <div className="flex items-center justify-between">
                {toolbar}
              </div>
            </div>
          )}

          {/* Main content with proper overflow handling */}
          <div className="flex-1 overflow-auto p-4 lg:p-6">
            <div className="mx-auto max-w-full">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

// Responsive wrapper for floating action buttons
export const FloatingActionBar: React.FC<{
  children: ReactNode;
  className?: string;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center' | 'top-right';
}> = ({ 
  children, 
  className,
  position = 'bottom-right' 
}) => {
  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4', 
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
    'top-right': 'top-4 right-4'
  };

  return (
    <div className={cn(
      "fixed z-50",
      positionClasses[position],
      // Responsive positioning
      "sm:bottom-6 sm:right-6",
      className
    )}>
      <Card className="shadow-lg">
        <CardContent className="p-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
            {children}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Responsive button group that stacks on mobile
export const ResponsiveButtonGroup: React.FC<{
  buttons: Array<{
    id: string;
    label: string;
    icon?: ReactNode;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'ghost';
    disabled?: boolean;
    badge?: string | number;
  }>;
  className?: string;
  orientation?: 'horizontal' | 'vertical' | 'responsive';
}> = ({ 
  buttons, 
  className,
  orientation = 'responsive' 
}) => {
  const orientationClasses = {
    horizontal: 'flex flex-row flex-wrap gap-2',
    vertical: 'flex flex-col gap-2',
    responsive: 'flex flex-col gap-2 sm:flex-row sm:gap-3'
  };

  return (
    <div className={cn(orientationClasses[orientation], className)}>
      {buttons.map((button) => (
        <Button
          key={button.id}
          variant={button.variant || 'default'}
          onClick={button.onClick}
          disabled={button.disabled}
          className={cn(
            "relative",
            orientation === 'responsive' && "w-full sm:w-auto",
            orientation === 'vertical' && "w-full"
          )}
        >
          {button.icon && (
            <span className="mr-2 h-4 w-4">
              {button.icon}
            </span>
          )}
          <span className="hidden sm:inline lg:inline">
            {button.label}
          </span>
          <span className="sm:hidden">
            {button.icon || button.label.charAt(0)}
          </span>
          {button.badge && (
            <Badge 
              variant="secondary" 
              className="ml-2 h-5 w-5 rounded-full p-0 text-xs"
            >
              {button.badge}
            </Badge>
          )}
        </Button>
      ))}
    </div>
  );
};

// Container for responsive content sections
export const ResponsiveSection: React.FC<{
  children: ReactNode;
  title?: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  spacing?: 'tight' | 'normal' | 'loose';
}> = ({
  children,
  title,
  description, 
  actions,
  className,
  spacing = 'normal'
}) => {
  const spacingClasses = {
    tight: 'space-y-2',
    normal: 'space-y-4',
    loose: 'space-y-6'
  };

  return (
    <section className={cn('w-full', spacingClasses[spacing], className)}>
      {(title || description || actions) && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            {title && (
              <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-sm text-muted-foreground sm:text-base">
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex-shrink-0">
              {actions}
            </div>
          )}
        </div>
      )}
      <div className="w-full">
        {children}
      </div>
    </section>
  );
};

// Responsive grid for cards/items
export const ResponsiveGrid: React.FC<{
  children: ReactNode;
  columns?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'tight' | 'normal' | 'loose';
  className?: string;
}> = ({
  children,
  columns = { default: 1, sm: 2, lg: 3 },
  gap = 'normal',
  className
}) => {
  const gapClasses = {
    tight: 'gap-3',
    normal: 'gap-4',
    loose: 'gap-6'
  };

  const getGridClasses = () => {
    const classes = ['grid'];
    
    if (columns.default) classes.push(`grid-cols-${columns.default}`);
    if (columns.sm) classes.push(`sm:grid-cols-${columns.sm}`);
    if (columns.md) classes.push(`md:grid-cols-${columns.md}`);
    if (columns.lg) classes.push(`lg:grid-cols-${columns.lg}`);
    if (columns.xl) classes.push(`xl:grid-cols-${columns.xl}`);
    
    return classes.join(' ');
  };

  return (
    <div className={cn(
      getGridClasses(),
      gapClasses[gap],
      'w-full',
      className
    )}>
      {children}
    </div>
  );
};