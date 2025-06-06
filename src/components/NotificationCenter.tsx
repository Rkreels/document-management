import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Bell, Mail, MessageSquare, Settings, Send, Clock } from 'lucide-react';
import { useDocument, Document } from '@/contexts/DocumentContext';
import { useToast } from '@/hooks/use-toast';

interface NotificationCenterProps {
  document: Document;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ document }) => {
  const { updateDocument, sendReminder, createNotification } = useDocument();
  const { toast } = useToast();
  
  const [emailTemplate, setEmailTemplate] = useState('');
  const [reminderMessage, setReminderMessage] = useState('');
  const [autoReminders, setAutoReminders] = useState(true);
  const [notifyOnComplete, setNotifyOnComplete] = useState(true);

  const handleSendBulkReminder = () => {
    document.signers
      .filter(signer => signer.status === 'pending')
      .forEach(signer => {
        sendReminder(signer.id);
        createNotification({
          documentId: document.id,
          type: 'reminder',
          title: 'Reminder Sent',
          message: `Reminder sent to ${signer.name}`,
          status: 'sent',
          recipientEmail: signer.email,
          sentAt: new Date(),
          read: false
        });
      });
    
    toast({
      title: 'Reminders Sent',
      description: 'Bulk reminders have been sent to all pending signers.',
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Center
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Automatic Reminders */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Enable Automatic Reminders</Label>
              <Switch
                checked={autoReminders}
                onCheckedChange={setAutoReminders}
              />
            </div>
            {autoReminders && (
              <div className="space-y-2">
                <Label>Reminder Message Template</Label>
                <Textarea
                  placeholder="Your document requires your signature. Please review and sign."
                  value={reminderMessage}
                  onChange={(e) => setReminderMessage(e.target.value)}
                />
                <div className="flex justify-end">
                  <Button variant="secondary" size="sm" onClick={handleSendBulkReminder}>
                    <Send className="h-4 w-4 mr-2" />
                    Send Bulk Reminder
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Completion Notifications */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Notify Sender on Completion</Label>
              <Switch
                checked={notifyOnComplete}
                onCheckedChange={setNotifyOnComplete}
              />
            </div>
            {notifyOnComplete && (
              <div className="space-y-2">
                <Label>Completion Email Template</Label>
                <Textarea
                  placeholder="Your document has been fully signed and is now complete."
                  value={emailTemplate}
                  onChange={(e) => setEmailTemplate(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Recent Notifications */}
          <div>
            <Label>Recent Notifications</Label>
            <div className="space-y-2 mt-2">
              {/* Example Notifications - Replace with actual data */}
              <div className="p-3 border rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-medium">Reminder Sent to John Doe</p>
                  <p className="text-sm text-gray-500">
                    <Clock className="inline-block h-4 w-4 mr-1" />
                    1 hour ago
                  </p>
                </div>
                <Badge variant="secondary">Sent</Badge>
              </div>
              <div className="p-3 border rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-medium">Document Signed by Alice Smith</p>
                  <p className="text-sm text-gray-500">
                    <Clock className="inline-block h-4 w-4 mr-1" />
                    2 hours ago
                  </p>
                </div>
                <Badge variant="default">Signed</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
