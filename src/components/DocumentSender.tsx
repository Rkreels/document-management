
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Send, 
  Calendar as CalendarIcon, 
  Clock, 
  Mail, 
  Shield,
  Users,
  Settings
} from 'lucide-react';
import { useDocument, Document } from '@/contexts/DocumentContext';

interface DocumentSenderProps {
  document: Document;
  onSent: () => void;
}

export const DocumentSender: React.FC<DocumentSenderProps> = ({
  document,
  onSent
}) => {
  const { updateDocument, sendDocument } = useDocument();
  const [message, setMessage] = useState('');
  const [expirationDate, setExpirationDate] = useState<Date>();
  const [enableReminders, setEnableReminders] = useState(true);
  const [reminderFrequency, setReminderFrequency] = useState<'daily' | 'weekly'>('weekly');
  const [requireAuth, setRequireAuth] = useState(false);
  const [ccEmails, setCcEmails] = useState('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handleSendDocument = () => {
    // Update document with sending settings
    updateDocument(document.id, {
      expiresAt: expirationDate,
      reminderSchedule: {
        enabled: enableReminders,
        frequency: reminderFrequency,
        customMessage: message || undefined,
      },
      notifications: {
        sendCopyToSender: true,
        ccEmails: ccEmails ? ccEmails.split(',').map(email => email.trim()) : undefined,
      },
      security: {
        requireAuth,
        allowPrinting: true,
        allowDownload: true,
        watermark: false,
        ipRestriction: false,
      }
    });

    // Send the document
    sendDocument(document.id, message || 'Please review and sign this document.');
    onSent();
  };

  const canSend = document.signers.length > 0 && document.fields.length > 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send Document for Signing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Document Summary */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">{document.title}</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span>{document.signers.length} signers</span>
              </div>
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-green-600" />
                <span>{document.fields.length} fields</span>
              </div>
            </div>
          </div>

          {/* Email Message */}
          <div>
            <Label htmlFor="message">Email Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Please review and sign this document. Let me know if you have any questions."
              rows={4}
            />
            <p className="text-xs text-gray-500 mt-1">
              This message will be sent to all signers via email.
            </p>
          </div>

          {/* CC Recipients */}
          <div>
            <Label htmlFor="ccEmails">CC Recipients (Optional)</Label>
            <Input
              id="ccEmails"
              value={ccEmails}
              onChange={(e) => setCcEmails(e.target.value)}
              placeholder="email1@example.com, email2@example.com"
            />
            <p className="text-xs text-gray-500 mt-1">
              These recipients will receive a copy of the signed document.
            </p>
          </div>

          {/* Expiration Date */}
          <div>
            <Label>Document Expiration (Optional)</Label>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {expirationDate ? expirationDate.toLocaleDateString() : "Set expiration date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={expirationDate}
                  onSelect={(date) => {
                    setExpirationDate(date);
                    setIsCalendarOpen(false);
                  }}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Reminder Settings */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Enable Automatic Reminders</Label>
              <Switch
                checked={enableReminders}
                onCheckedChange={setEnableReminders}
              />
            </div>
            
            {enableReminders && (
              <div>
                <Label>Reminder Frequency</Label>
                <Select value={reminderFrequency} onValueChange={(value: string) => setReminderFrequency(value as 'daily' | 'weekly')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Security Settings */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Require Authentication</Label>
                <p className="text-xs text-gray-500">Signers must verify their email before signing</p>
              </div>
              <Switch
                checked={requireAuth}
                onCheckedChange={setRequireAuth}
              />
            </div>
          </div>

          {/* Signers List */}
          <div>
            <Label>Recipients</Label>
            <div className="space-y-2 mt-2">
              {document.signers.map((signer) => (
                <div key={signer.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="font-medium text-sm">{signer.name}</p>
                    <p className="text-xs text-gray-600">{signer.email}</p>
                  </div>
                  <Badge variant="outline">{signer.role}</Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Send Button */}
          <div className="pt-4">
            {!canSend && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-800">
                  To send this document, you need at least one signer and one field.
                </p>
              </div>
            )}
            <Button 
              onClick={handleSendDocument}
              disabled={!canSend}
              className="w-full"
              size="lg"
            >
              <Send className="h-4 w-4 mr-2" />
              Send for Signing
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
