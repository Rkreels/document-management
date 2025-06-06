
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Clock, 
  Send, 
  AlertCircle, 
  XCircle, 
  FileText,
  Calendar
} from 'lucide-react';

interface DocumentStatusProps {
  status: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  expiresAt?: Date;
}

export const DocumentStatus: React.FC<DocumentStatusProps> = ({
  status,
  showIcon = true,
  size = 'md',
  expiresAt
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'draft':
        return {
          label: 'Draft',
          variant: 'secondary' as const,
          icon: FileText,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100'
        };
      case 'sent':
        return {
          label: 'Sent for Signing',
          variant: 'default' as const,
          icon: Send,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100'
        };
      case 'completed':
        return {
          label: 'Completed',
          variant: 'default' as const,
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-100'
        };
      case 'declined':
        return {
          label: 'Declined',
          variant: 'destructive' as const,
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-100'
        };
      case 'voided':
        return {
          label: 'Voided',
          variant: 'destructive' as const,
          icon: AlertCircle,
          color: 'text-orange-600',
          bgColor: 'bg-orange-100'
        };
      case 'expired':
        return {
          label: 'Expired',
          variant: 'destructive' as const,
          icon: Calendar,
          color: 'text-red-600',
          bgColor: 'bg-red-100'
        };
      default:
        return {
          label: 'Unknown',
          variant: 'secondary' as const,
          icon: Clock,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const isExpired = expiresAt && new Date() > expiresAt;
  const finalStatus = isExpired ? 'expired' : status;
  const finalConfig = isExpired ? getStatusConfig() : config;

  return (
    <div className="flex items-center gap-2">
      <Badge variant={finalConfig.variant} className="flex items-center gap-1">
        {showIcon && <Icon className={`h-3 w-3 ${size === 'sm' ? 'h-2 w-2' : size === 'lg' ? 'h-4 w-4' : 'h-3 w-3'}`} />}
        {finalConfig.label}
      </Badge>
      {expiresAt && !isExpired && (
        <span className="text-xs text-gray-500">
          Expires {expiresAt.toLocaleDateString()}
        </span>
      )}
    </div>
  );
};
