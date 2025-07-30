import React from 'react';
import { BackButton } from '@/components/BackButton';

interface PageHeaderProps {
  title: string;
  description?: string;
  backTo?: string;
  children?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  backTo = '/dashboard',
  children,
  className = ''
}) => {
  return (
    <div className={`flex items-center gap-4 mb-8 ${className}`}>
      <BackButton to={backTo} />
      <div className="flex-1">
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {children && (
        <div className="flex gap-2">
          {children}
        </div>
      )}
    </div>
  );
};