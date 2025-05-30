import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { GitBranch, Plus, Trash2, ArrowRight, Settings } from 'lucide-react';
import { useDocument, Signer } from '@/contexts/DocumentContext';

interface ConditionalRule {
  id: string;
  condition: 'field_value' | 'signer_role' | 'approval_status';
  fieldId?: string;
  value: string;
  action: 'route_to' | 'skip' | 'require_approval';
  targetSignerId?: string;
  enabled: boolean;
}

interface ConditionalWorkflowProps {
  documentId: string;
  signers: Signer[];
}

export const ConditionalWorkflow: React.FC<ConditionalWorkflowProps> = ({
  documentId,
  signers
}) => {
  const { updateDocument } = useDocument();
  const [rules, setRules] = useState<ConditionalRule[]>([]);
  const [isAddingRule, setIsAddingRule] = useState(false);
  const [newRule, setNewRule] = useState<Partial<ConditionalRule>>({
    condition: 'field_value',
    action: 'route_to',
    enabled: true
  });

  const addRule = () => {
    if (newRule.condition && newRule.action) {
      const rule: ConditionalRule = {
        id: `rule-${Date.now()}`,
        condition: newRule.condition as ConditionalRule['condition'],
        value: newRule.value || '',
        action: newRule.action as ConditionalRule['action'],
        fieldId: newRule.fieldId,
        targetSignerId: newRule.targetSignerId,
        enabled: true
      };
      
      setRules(prev => [...prev, rule]);
      setNewRule({
        condition: 'field_value',
        action: 'route_to',
        enabled: true
      });
      setIsAddingRule(false);
    }
  };

  const removeRule = (ruleId: string) => {
    setRules(prev => prev.filter(rule => rule.id !== ruleId));
  };

  const toggleRule = (ruleId: string) => {
    setRules(prev => prev.map(rule =>
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    ));
  };

  const getConditionDisplay = (rule: ConditionalRule) => {
    switch (rule.condition) {
      case 'field_value':
        return `When field equals "${rule.value}"`;
      case 'signer_role':
        return `When signer role is "${rule.value}"`;
      case 'approval_status':
        return `When approval status is "${rule.value}"`;
      default:
        return 'Unknown condition';
    }
  };

  const getActionDisplay = (rule: ConditionalRule) => {
    switch (rule.action) {
      case 'route_to':
        const targetSigner = signers.find(s => s.id === rule.targetSignerId);
        return `Route to ${targetSigner?.name || 'Unknown signer'}`;
      case 'skip':
        return 'Skip remaining signers';
      case 'require_approval':
        return 'Require additional approval';
      default:
        return 'Unknown action';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          Conditional Workflow Rules
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing Rules */}
        {rules.map((rule) => (
          <div
            key={rule.id}
            className={`p-4 border rounded-lg ${rule.enabled ? 'bg-white' : 'bg-gray-50'}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Switch
                  checked={rule.enabled}
                  onCheckedChange={() => toggleRule(rule.id)}
                />
                <Badge variant={rule.enabled ? 'default' : 'secondary'}>
                  {rule.enabled ? 'Active' : 'Disabled'}
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeRule(rule.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium">IF:</span>
                <span>{getConditionDisplay(rule)}</span>
              </div>
              <div className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-gray-400" />
                <span className="font-medium">THEN:</span>
                <span>{getActionDisplay(rule)}</span>
              </div>
            </div>
          </div>
        ))}

        {/* Add New Rule */}
        {isAddingRule ? (
          <div className="p-4 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50">
            <div className="space-y-4">
              <div>
                <Label>Condition Type</Label>
                <Select
                  value={newRule.condition}
                  onValueChange={(value) => setNewRule(prev => ({ ...prev, condition: value as ConditionalRule['condition'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="field_value">Field Value</SelectItem>
                    <SelectItem value="signer_role">Signer Role</SelectItem>
                    <SelectItem value="approval_status">Approval Status</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Value</Label>
                <Input
                  value={newRule.value || ''}
                  onChange={(e) => setNewRule(prev => ({ ...prev, value: e.target.value }))}
                  placeholder="Enter condition value"
                />
              </div>

              <div>
                <Label>Action</Label>
                <Select
                  value={newRule.action}
                  onValueChange={(value) => setNewRule(prev => ({ ...prev, action: value as ConditionalRule['action'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="route_to">Route to Signer</SelectItem>
                    <SelectItem value="skip">Skip Remaining</SelectItem>
                    <SelectItem value="require_approval">Require Approval</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newRule.action === 'route_to' && (
                <div>
                  <Label>Target Signer</Label>
                  <Select
                    value={newRule.targetSignerId}
                    onValueChange={(value) => setNewRule(prev => ({ ...prev, targetSignerId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select signer" />
                    </SelectTrigger>
                    <SelectContent>
                      {signers.map((signer) => (
                        <SelectItem key={signer.id} value={signer.id}>
                          {signer.name} ({signer.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={addRule} size="sm">
                  Add Rule
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddingRule(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            onClick={() => setIsAddingRule(true)}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Conditional Rule
          </Button>
        )}

        {rules.length === 0 && !isAddingRule && (
          <div className="text-center py-8 text-gray-500">
            <GitBranch className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No conditional rules configured</p>
            <p className="text-sm">Add rules to create dynamic signing workflows</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
