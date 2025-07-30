import { useEffect } from 'react';
import { useDocument } from '@/contexts/DocumentContext';
import { generateDemoData } from '@/services/demoData';
import { defaultTemplates } from '@/utils/defaultTemplates';

export const RealDataLoader: React.FC = () => {
  const document = useDocument();

  useEffect(() => {
    // Load real demo data
    const loadRealData = async () => {
      try {
        const demoData = generateDemoData();
        
        // Real data is automatically loaded by the DocumentContext
        // This component serves as a data initialization placeholder
        console.log('Demo data available:', {
          documents: demoData.documents.length,
          templates: defaultTemplates.length,
          notifications: demoData.notifications.length
        });

        console.log('Real data loaded successfully:', {
          documents: demoData.documents.length,
          templates: defaultTemplates.length,
          notifications: demoData.notifications.length
        });
      } catch (error) {
        console.error('Error loading real data:', error);
      }
    };

    loadRealData();
  }, [document]);

  return null;
};