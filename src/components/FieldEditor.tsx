
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Trash2 } from 'lucide-react';
import { DocumentField, Signer } from '@/contexts/DocumentContext';

interface FieldEditorProps {
  field: DocumentField;
  signers: Signer[];
  onUpdate: (updates: Partial<DocumentField>) => void;
  onDelete: () => void;
  onClose: () => void;
}

export const FieldEditor: React.FC<FieldEditorProps> = ({
  field,
  signers,
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Edit {field.type} Field
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Position */}
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

          {/* Size */}
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

          {/* Assign to Signer */}
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

          {/* Default Value */}
          {field.type === 'text' && (
            <div>
              <Label>Default Value</Label>
              <Input
                value={localField.value || ''}
                onChange={(e) => updateField({ value: e.target.value })}
                placeholder="Enter default text"
              />
            </div>
          )}

          {/* Required */}
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
