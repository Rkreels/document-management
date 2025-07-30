import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useVoice } from '@/contexts/VoiceContext';

interface BackButtonProps {
  to?: string;
  label?: string;
  onClick?: () => void;
  className?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({ 
  to = '/dashboard', 
  label = 'Back', 
  onClick,
  className 
}) => {
  const navigate = useNavigate();
  const { speak } = useVoice();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      speak(`Navigating back to ${to === '/dashboard' ? 'dashboard' : 'previous page'}.`, 'normal');
      navigate(to);
    }
  };

  return (
    <Button 
      variant="outline" 
      onClick={handleClick}
      className={className}
      onFocus={() => speak(`${label} button focused. Press Enter to go back.`, 'low')}
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      {label}
    </Button>
  );
};