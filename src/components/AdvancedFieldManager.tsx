
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Copy, Move, Settings } from 'lucide-react';
import { DocumentField, Signer } from '@/contexts/DocumentContext';
import { useVoice } from '@/contexts/VoiceContext';

interface AdvancedFieldManagerProps {
  fields: DocumentField[];
  signers: Signer[];
  onAddField: (field: Omit<DocumentField, 'id'>) => void;
  onUpdateField: (fieldId: string, updates: Partial<DocumentField>) => void;
  onDeleteField: (fieldId: string) => void;
  onDuplicateField: (fieldId: string) => void;
}

export const AdvancedFieldManager: React.FC<AdvancedFieldManagerProps> = ({
  fields,
  signers,
  onAddField,
  onUpdateField,
  onDeleteField,
  onDuplicateField
}) => {
  const { speak } = useVoice();
  const [activeTab, setActiveTab] = useState<'add' | 'manage'>('add');
  const [selectedFieldType, setSelectedFieldType] = useState<string>('');
  const [selectedSigner, setSelectedSigner] = useState<string>('');
  const [editingField, setEditingField] = useState<DocumentField | null>(null);

  const fieldTypes = [
    { value: 'signature', label: 'Signature', description: 'Electronic signature field' },
    { value: 'text', label: 'Text', description: 'Single line text input' },
    { value: 'textarea', label: 'Text Area', description: 'Multi-line text input' },
    { value: 'date', label: 'Date', description: 'Date picker field' },
    { value: 'checkbox', label: 'Checkbox', description: 'Boolean checkbox' },
    { value: 'radio', label: 'Radio Group', description: 'Single choice from options' },
    { value: 'dropdown', label: 'Dropdown', description: 'Select from dropdown list' },
    { value: 'number', label: 'Number', description: 'Numeric input field' },
    { value: 'email', label: 'Email', description: 'Email address field' },
    { value: 'formula', label: 'Formula', description: 'Calculated field' },
    { value: 'attachment', label: 'Attachment', description: 'File upload field' },
    { value: 'initial', label: 'Initial', description: 'Initial field for quick signing' },
    { value: 'stamp', label: 'Stamp', description: 'Pre-made stamp field' }
  ];

  const handleAddField = () => {
    if (!selectedFieldType) {
      speak('Please select a field type first', 'high');
      return;
    }

    const fieldType = fieldTypes.find(type => type.value === selectedFieldType);
    const x = Math.random() * 70 + 10;
    const y = Math.random() * 70 + 10;
    const width = selectedFieldType === 'signature' ? 25 : 15;
    const height = selectedFieldType === 'textarea' ? 12 : 6;

    const newField: Omit<DocumentField, 'id'> = {
      type: selectedFieldType as DocumentField['type'],
      x,
      y,
      width,
      height,
      position: { x, y },
      size: { width, height },
      page: 1,
      signerId: selectedSigner || undefined,
      required: true,
      label: fieldType?.label || selectedFieldType,
    };

    onAddField(newField);
    speak(`${fieldType?.label} field added successfully`, 'normal');
    setSelectedFieldType('');
    setSelectedSigner('');
  };

  const handleFieldEdit = (field: DocumentField) => {
    setEditingField(field);
    speak(`Editing ${field.type} field`, 'normal');
  };

  const handleFieldUpdate = (updates: Partial<DocumentField>) => {
    if (editingField) {
      onUpdateField(editingField.id, updates);
      setEditingField(null);
      speak('Field updated successfully', 'normal');
    }
  };

  const handleFieldDelete = (fieldId: string) => {
    const field = fields.find(f => f.id === fieldId);
    if (field && confirm(`Delete ${field.type} field?`)) {
      onDeleteField(fieldId);
      speak('Field deleted successfully', 'normal');
    }
  };

  const handleFieldDuplicate = (fieldId: string) => {
    onDuplicateField(fieldId);
    speak('Field duplicated successfully', 'normal');
  };

  const getFieldStats = () => {
    const typeCount = fields.reduce((acc, field) => {
      acc[field.type] = (acc[field.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const requiredCount = fields.filter(f => f.required).length;
    const completedCount = fields.filter(f => f.value).length;

    return { typeCount, requiredCount, completedCount };
  };

  const stats = getFieldStats();

  return (
    <div className="space-y-6">
      {/* Field Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Field Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{fields.length}</p>
              <p className="text-sm text-gray-600">Total Fields</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.requiredCount}</p>
              <p className="text-sm text-gray-600">Required</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{stats.completedCount}</p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{signers.length}</p>
              <p className="text-sm text-gray-600">Signers</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === 'add' ? 'default' : 'outline'}
          onClick={() => setActiveTab('add')}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Fields
        </Button>
        <Button
          variant={activeTab === 'manage' ? 'default' : 'outline'}
          onClick={() => setActiveTab('manage')}
        >
          <Settings className="h-4 w-4 mr-2" />
          Manage Fields
        </Button>
      </div>

      {/* Add Field Tab */}
      {activeTab === 'add' && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Field</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Field Type</Label>
                <Select value={selectedFieldType} onValueChange={setSelectedFieldType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select field type" />
                  </SelectTrigger>
                  <SelectContent>
                    {fieldTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-gray-500">{type.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Assign to Signer (Optional)</Label>
                <Select value={selectedSigner} onValueChange={setSelectedSigner}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select signer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All signers</SelectItem>
                    {signers.map((signer) => (
                      <SelectItem key={signer.id} value={signer.id}>
                        {signer.name} ({signer.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleAddField} disabled={!selectedFieldType} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Field to Document
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Manage Fields Tab */}
      {activeTab === 'manage' && (
        <Card>
          <CardHeader>
            <CardTitle>Field Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {fields.map((field) => {
                const signer = signers.find(s => s.id === field.signerId);
                return (
                  <div key={field.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{field.type}</Badge>
                        {field.required && <Badge variant="secondary">Required</Badge>}
                        {field.value && <Badge variant="default">Completed</Badge>}
                      </div>
                      <p className="font-medium">{field.label || `${field.type} field`}</p>
                      <p className="text-sm text-gray-600">
                        Position: {field.x.toFixed(1)}%, {field.y.toFixed(1)}%
                        {signer && ` • Assigned to: ${signer.name}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFieldEdit(field)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFieldDuplicate(field.id)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFieldDelete(field.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
              {fields.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No fields added yet. Use the "Add Fields" tab to get started.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Field Editor Modal */}
      {editingField && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Edit {editingField.type} Field</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Field Label</Label>
                <Input
                  value={editingField.label || ''}
                  onChange={(e) => setEditingField(prev => prev ? { ...prev, label: e.target.value } : null)}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>X Position (%)</Label>
                  <Input
                    type="number"
                    value={editingField.x.toFixed(1)}
                    onChange={(e) => setEditingField(prev => prev ? { ...prev, x: parseFloat(e.target.value) || 0 } : null)}
                  />
                </div>
                <div>
                  <Label>Y Position (%)</Label>
                  <Input
                    type="number"
                    value={editingField.y.toFixed(1)}
                    onChange={(e) => setEditingField(prev => prev ? { ...prev, y: parseFloat(e.target.value) || 0 } : null)}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label>Required Field</Label>
                <Switch
                  checked={editingField.required}
                  onCheckedChange={(checked) => setEditingField(prev => prev ? { ...prev, required: checked } : null)}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => handleFieldUpdate(editingField)} className="flex-1">
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setEditingField(null)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
