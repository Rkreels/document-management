import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVoice } from '@/contexts/VoiceContext';

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

export const useKeyboardShortcuts = () => {
  const navigate = useNavigate();
  const { speak, provideContextualHelp, repeatLastInstruction } = useVoice();

  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'k',
      ctrl: true,
      action: () => {
        // Open global search
        const searchPortal = document.getElementById('global-search-portal');
        if (searchPortal) {
          // Trigger global search modal
          speak('Opening global search', 'high');
        }
      },
      description: 'Open global search'
    },
    {
      key: 'n',
      ctrl: true,
      action: () => {
        speak('Creating new document', 'high');
        navigate('/editor');
      },
      description: 'Create new document'
    },
    {
      key: 'd',
      ctrl: true,
      action: () => {
        speak('Navigating to dashboard', 'normal');
        navigate('/dashboard');
      },
      description: 'Go to dashboard'
    },
    {
      key: 't',
      ctrl: true,
      action: () => {
        speak('Navigating to templates', 'normal');
        navigate('/templates');
      },
      description: 'Go to templates'
    },
    {
      key: 'h',
      ctrl: true,
      action: () => {
        const currentPath = window.location.pathname;
        let context = 'general';
        
        if (currentPath.includes('dashboard')) context = 'dashboard';
        else if (currentPath.includes('editor')) context = 'editor';
        else if (currentPath.includes('signing')) context = 'signing';
        else if (currentPath.includes('upload')) context = 'upload';
        
        provideContextualHelp(context, true);
      },
      description: 'Get contextual help'
    },
    {
      key: 'r',
      ctrl: true,
      action: () => {
        repeatLastInstruction();
      },
      description: 'Repeat last voice instruction'
    },
    {
      key: 'v',
      ctrl: true,
      action: () => {
        speak('Navigating to voice training center', 'normal');
        navigate('/voice-training');
      },
      description: 'Go to voice training'
    },
    {
      key: 's',
      ctrl: true,
      action: () => {
        speak('Navigating to settings', 'normal');
        navigate('/settings');
      },
      description: 'Go to settings'
    },
    {
      key: '/',
      action: () => {
        // Show help dialog with all shortcuts
        speak('Keyboard shortcuts: Control K for search, Control N for new document, Control D for dashboard, Control T for templates, Control H for help, Control R to repeat last instruction, Control V for voice training, Control S for settings', 'high');
      },
      description: 'Show keyboard shortcuts help'
    }
  ];

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const shortcut = shortcuts.find(s => 
      s.key === event.key.toLowerCase() &&
      !!s.ctrl === event.ctrlKey &&
      !!s.shift === event.shiftKey &&
      !!s.alt === event.altKey
    );

    if (shortcut) {
      event.preventDefault();
      shortcut.action();
    }
  }, [shortcuts]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return shortcuts;
};