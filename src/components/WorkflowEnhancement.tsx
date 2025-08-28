import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, AlertCircle, Play, Pause, RotateCcw, Send } from 'lucide-react';
import { useDocument, Document } from '@/contexts/DocumentContext';
import { useVoice } from '@/contexts/VoiceContext';

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  estimatedTime?: number;
  dependencies?: string[];
  required: boolean;
}

interface WorkflowEnhancementProps {
  document: Document;
  onWorkflowComplete?: () => void;
}

export const WorkflowEnhancement: React.FC<WorkflowEnhancementProps> = ({
  document,
  onWorkflowComplete
}) => {
  const { updateDocument, sendDocument } = useDocument();
  const { speak, announceWorkflowStep } = useVoice();
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<string | null>(null);

  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([
    {
      id: 'validate',
      title: 'Document Validation',
      description: 'Validate document structure and content',
      status: 'pending',
      estimatedTime: 2,
      required: true
    },
    {
      id: 'fields',
      title: 'Field Configuration',
      description: 'Ensure all fields are properly configured',
      status: 'pending',
      estimatedTime: 3,
      dependencies: ['validate'],
      required: true
    },
    {
      id: 'signers',
      title: 'Signer Setup',
      description: 'Verify signer information and assignments',
      status: 'pending',
      estimatedTime: 2,
      dependencies: ['fields'],
      required: true
    },
    {
      id: 'security',
      title: 'Security Check',
      description: 'Apply security settings and access controls',
      status: 'pending',
      estimatedTime: 1,
      dependencies: ['signers'],
      required: false
    },
    {
      id: 'review',
      title: 'Final Review',
      description: 'Review all settings before sending',
      status: 'pending',
      estimatedTime: 2,
      dependencies: ['security'],
      required: true
    },
    {
      id: 'send',
      title: 'Send Document',
      description: 'Send document to signers',
      status: 'pending',
      estimatedTime: 1,
      dependencies: ['review'],
      required: true
    }
  ]);

  const executeStep = async (stepId: string): Promise<boolean> => {
    const step = workflowSteps.find(s => s.id === stepId);
    if (!step) return false;

    setCurrentStep(stepId);
    announceWorkflowStep(step.title, step.description);

    // Update step status to in-progress
    setWorkflowSteps(prev => prev.map(s => 
      s.id === stepId ? { ...s, status: 'in-progress' } : s
    ));

    try {
      // Simulate step execution
      await new Promise(resolve => setTimeout(resolve, (step.estimatedTime || 1) * 1000));

      switch (stepId) {
        case 'validate':
          // Validate document
          if (!document.title || document.fields.length === 0) {
            throw new Error('Document validation failed');
          }
          break;

        case 'fields':
          // Check field configuration
          const invalidFields = document.fields.filter(field => 
            !field.id || !field.type || field.x < 0 || field.y < 0
          );
          if (invalidFields.length > 0) {
            throw new Error('Some fields are not properly configured');
          }
          break;

        case 'signers':
          // Verify signers
          if (document.signers.length === 0) {
            throw new Error('At least one signer is required');
          }
          const invalidSigners = document.signers.filter(signer => 
            !signer.email || !signer.name
          );
          if (invalidSigners.length > 0) {
            throw new Error('Signer information is incomplete');
          }
          break;

        case 'security':
          // Apply security settings (optional step)
          break;

        case 'review':
          // Final review
          if (document.status !== 'draft') {
            throw new Error('Document must be in draft status for review');
          }
          break;

        case 'send':
          // Send document
          await sendDocument(document.id);
          break;
      }

      // Mark step as completed
      setWorkflowSteps(prev => prev.map(s => 
        s.id === stepId ? { ...s, status: 'completed' } : s
      ));

      speak(`${step.title} completed successfully`, 'normal');
      return true;

    } catch (error) {
      // Mark step as failed
      setWorkflowSteps(prev => prev.map(s => 
        s.id === stepId ? { ...s, status: 'failed' } : s
      ));

      speak(`${step.title} failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'high');
      return false;
    } finally {
      setCurrentStep(null);
    }
  };

  const executeWorkflow = async () => {
    setIsProcessing(true);

    for (const step of workflowSteps) {
      // Check if dependencies are met
      if (step.dependencies) {
        const unmetDependencies = step.dependencies.filter(depId => {
          const dep = workflowSteps.find(s => s.id === depId);
          return dep?.status !== 'completed';
        });

        if (unmetDependencies.length > 0) {
          continue; // Skip this step for now
        }
      }

      // Skip completed steps
      if (step.status === 'completed') continue;

      const success = await executeStep(step.id);
      if (!success && step.required) {
        setIsProcessing(false);
        return; // Stop workflow on required step failure
      }
    }

    setIsProcessing(false);
    onWorkflowComplete?.();
    speak('Workflow completed successfully', 'high');
  };

  const resetStep = (stepId: string) => {
    setWorkflowSteps(prev => prev.map(s => 
      s.id === stepId ? { ...s, status: 'pending' } : s
    ));
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in-progress': return <Clock className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const completedSteps = workflowSteps.filter(s => s.status === 'completed').length;
  const totalSteps = workflowSteps.length;
  const progress = (completedSteps / totalSteps) * 100;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Document Workflow</span>
          <Badge variant="outline">
            {completedSteps}/{totalSteps} Steps
          </Badge>
        </CardTitle>
        <Progress value={progress} className="w-full" />
      </CardHeader>
      <CardContent className="space-y-4">
        {workflowSteps.map((step, index) => (
          <div key={step.id} className="flex items-center gap-3 p-3 border rounded-lg">
            <div className="flex-shrink-0">
              {getStepIcon(step.status)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-medium">{step.title}</h4>
                <Badge className={getStepColor(step.status)}>
                  {step.status}
                </Badge>
                {step.required && (
                  <Badge variant="outline" className="text-xs">
                    Required
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{step.description}</p>
              {step.estimatedTime && (
                <p className="text-xs text-muted-foreground">
                  Est. {step.estimatedTime}s
                </p>
              )}
            </div>

            {step.status === 'failed' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => resetStep(step.id)}
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
            )}
          </div>
        ))}

        <div className="flex gap-2 pt-4">
          <Button
            onClick={executeWorkflow}
            disabled={isProcessing || completedSteps === totalSteps}
            className="flex-1"
          >
            {isProcessing ? (
              <Pause className="h-4 w-4 mr-2" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            {isProcessing ? 'Processing...' : 'Start Workflow'}
          </Button>

          {completedSteps === totalSteps && (
            <Button
              variant="outline"
              onClick={() => {
                setWorkflowSteps(prev => prev.map(s => ({ ...s, status: 'pending' })));
              }}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};