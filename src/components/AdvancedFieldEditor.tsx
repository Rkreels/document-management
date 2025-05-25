
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { X, Trash2, Plus, Minus } from 'lucide-react';
import { DocumentField, Signer } from '@/contexts/DocumentContext';

interface AdvancedFieldEditorProps {
  field: DocumentField;
  signers: Signer[];
  allFields: DocumentField[];
  onUpdate: (updates: Partial<DocumentField>) => void;
  onDelete: () => void;
  onClose: () => void;
}

export const AdvancedFieldEditor: React.FC<AdvancedFieldEditorProps> = ({
  field,
  signers,
  allFields,
  onUpdate,
  onDelete,
  onClose
}) => {
  const [localField, setLocalField] = useState(field);

  const handleSave = () => {
    onUpdate(localField);
    onClose();
  };

  const updateField = (updates: Partial<DocumentField>) => {
    setLocalField(prev => ({ ...prev, ...updates }));
  };

  const addOption = () => {
    const currentOptions = localField.options || [];
    updateField({ options: [...currentOptions, ''] });
  };

  const updateOption = (index: number, value: string) => {
    const currentOptions = localField.options || [];
    const newOptions = [...currentOptions];
    newOptions[index] = value;
    updateField({ options: newOptions });
  };

  const removeOption = (index: number) => {
    const currentOptions = localField.options || [];
    const newOptions = currentOptions.filter((_, i) => i !== index);
    updateField({ options: newOptions });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Edit {field.type} Field
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Properties */}
          <div className="space-y-4">
            <div>
              <Label>Field Label</Label>
              <Input
                value={localField.label || ''}
                onChange={(e) => updateField({ label: e.target.value })}
                placeholder="Enter field label"
              />
            </div>

            {/* Position and Size */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>X Position (%)</Label>
                <Input
                  type="number"
                  value={localField.x.toFixed(1)}
                  onChange={(e) => updateField({ x: parseFloat(e.target.value) || 0 })}
                  step="0.1"
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <Label>Y Position (%)</Label>
                <Input
                  type="number"
                  value={localField.y.toFixed(1)}
                  onChange={(e) => updateField({ y: parseFloat(e.target.value) || 0 })}
                  step="0.1"
                  min="0"
                  max="100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Width (%)</Label>
                <Input
                  type="number"
                  value={localField.width.toFixed(1)}
                  onChange={(e) => updateField({ width: parseFloat(e.target.value) || 1 })}
                  step="0.1"
                  min="1"
                  max="50"
                />
              </div>
              <div>
                <Label>Height (%)</Label>
                <Input
                  type="number"
                  value={localField.height.toFixed(1)}
                  onChange={(e) => updateField({ height: parseFloat(e.target.value) || 1 })}
                  step="0.1"
                  min="1"
                  max="20"
                />
              </div>
            </div>
          </div>

          {/* Signer Assignment */}
          {signers.length > 0 && (
            <div>
              <Label>Assign to Signer</Label>
              <Select 
                value={localField.signerId || ''} 
                onValueChange={(value) => updateField({ signerId: value || undefined })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select signer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No assignment</SelectItem>
                  {signers.map((signer) => (
                    <SelectItem key={signer.id} value={signer.id}>
                      {signer.name} ({signer.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Options for Radio and Dropdown */}
          {(localField.type === 'radio' || localField.type === 'dropdown') && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Options</Label>
                <Button variant="outline" size="sm" onClick={addOption}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Option
                </Button>
              </div>
              {(localField.options || []).map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeOption(index)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Formula Field */}
          {localField.type === 'formula' && (
            <div>
              <Label>Formula</Label>
              <Textarea
                value={localField.formula || ''}
                onChange={(e) => updateField({ formula: e.target.value })}
                placeholder="Enter formula (e.g., field1 + field2)"
                rows={3}
              />
            </div>
          )}

          {/* Default Value */}
          {(localField.type === 'text' || localField.type === 'date') && (
            <div>
              <Label>Default Value</Label>
              <Input
                value={typeof localField.value === 'string' ? localField.value : ''}
                onChange={(e) => updateField({ value: e.target.value })}
                placeholder="Enter default value"
                type={localField.type === 'date' ? 'date' : 'text'}
              />
            </div>
          )}

          {/* Validation Rules */}
          <div className="space-y-3">
            <Label>Validation</Label>
            <Select 
              value={localField.validation?.type || 'none'} 
              onValueChange={(value) => {
                if (value === 'none') {
                  updateField({ validation: undefined });
                } else {
                  updateField({ 
                    validation: { 
                      type: value as 'email' | 'phone' | 'number' | 'custom',
                      pattern: '',
                      message: ''
                    } 
                  });
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select validation type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No validation</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="phone">Phone number</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="custom">Custom pattern</SelectItem>
              </SelectContent>
            </Select>

            {localField.validation?.type === 'custom' && (
              <>
                <Input
                  placeholder="Regular expression pattern"
                  value={localField.validation.pattern || ''}
                  onChange={(e) => updateField({ 
                    validation: { ...localField.validation!, pattern: e.target.value }
                  })}
                />
                <Input
                  placeholder="Validation error message"
                  value={localField.validation.message || ''}
                  onChange={(e) => updateField({ 
                    validation: { ...localField.validation!, message: e.target.value }
                  })}
                />
              </>
            )}
          </div>

          {/* Conditional Logic */}
          <div className="space-y-3">
            <Label>Conditional Logic</Label>
            <Select 
              value={localField.conditionalLogic?.dependsOn || ''} 
              onValueChange={(value) => {
                if (!value) {
                  updateField({ conditionalLogic: undefined });
                } else {
                  updateField({ 
                    conditionalLogic: { 
                      dependsOn: value,
                      condition: 'equals',
                      value: '',
                      action: 'show'
                    } 
                  });
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Depends on field" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No dependency</SelectItem>
                {allFields
                  .filter(f => f.id !== localField.id)
                  .map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.label || f.type} ({f.id})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            {localField.conditionalLogic && (
              <div className="grid grid-cols-3 gap-2">
                <Select 
                  value={localField.conditionalLogic.condition} 
                  onValueChange={(value: 'equals' | 'not_equals' | 'contains') => 
                    updateField({ 
                      conditionalLogic: { ...localField.conditionalLogic!, condition: value }
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equals">Equals</SelectItem>
                    <SelectItem value="not_equals">Not equals</SelectItem>
                    <SelectItem value="contains">Contains</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Value"
                  value={localField.conditionalLogic.value}
                  onChange={(e) => updateField({ 
                    conditionalLogic: { ...localField.conditionalLogic!, value: e.target.value }
                  })}
                />

                <Select 
                  value={localField.conditionalLogic.action} 
                  onValueChange={(value: 'show' | 'hide' | 'require') => 
                    updateField({ 
                      conditionalLogic: { ...localField.conditionalLogic!, action: value }
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="show">Show</SelectItem>
                    <SelectItem value="hide">Hide</SelectItem>
                    <SelectItem value="require">Require</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Required Field */}
          <div className="flex items-center justify-between">
            <Label>Required Field</Label>
            <Switch
              checked={localField.required}
              onCheckedChange={(checked) => updateField({ required: checked })}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} className="flex-1">
              Save Changes
            </Button>
            <Button onClick={onDelete} variant="destructive" size="icon">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
