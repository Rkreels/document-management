
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { X, Check } from 'lucide-react';

interface TextFieldInputProps {
  fieldType: 'text' | 'date';
  currentValue?: string;
  onSave: (value: string) => void;
  onCancel: () => void;
}

export const TextFieldInput: React.FC<TextFieldInputProps> = ({
  fieldType,
  currentValue = '',
  onSave,
  onCancel
}) => {
  const [value, setValue] = useState(currentValue);

  const handleSave = () => {
    if (fieldType === 'date' && value) {
      // Validate date format
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        alert('Please enter a valid date');
        return;
      }
    }
    onSave(value);
  };

  const getCurrentDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Enter {fieldType === 'date' ? 'Date' : 'Text'}
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {fieldType === 'text' ? (
            <Textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter your text here"
              className="min-h-20"
              autoFocus
            />
          ) : (
            <div className="space-y-2">
              <Input
                type="date"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                autoFocus
              />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setValue(getCurrentDate())}
                className="w-full"
              >
                Use Today's Date
              </Button>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button onClick={onCancel} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1">
              <Check className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
