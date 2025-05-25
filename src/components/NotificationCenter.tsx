
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Send, 
  Clock, 
  CheckCircle,
  Settings,
  Plus
} from 'lucide-react';
import { useDocument, Document } from '@/contexts/DocumentContext';

interface NotificationCenterProps {
  document?: Document;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ document }) => {
  const { sendReminder, createNotification, notifications } = useDocument();
  const [reminderMessage, setReminderMessage] = useState('');
  const [reminderFrequency, setReminderFrequency] = useState<'daily' | 'weekly'>('weekly');
  const [enableAutoReminders, setEnableAutoReminders] = useState(false);
  const [ccEmails, setCcEmails] = useState('');

  const handleSendReminder = () => {
    if (document) {
      sendReminder(document.id);
      setReminderMessage('');
    }
  };

  const setupReminderSchedule = () => {
    if (document) {
      const { updateDocument } = useDocument();
      updateDocument(document.id, {
        reminderSchedule: {
          enabled: enableAutoReminders,
          frequency: reminderFrequency,
          customMessage: reminderMessage || undefined,
        }
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'reminder':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'completion':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'decline':
        return <MessageSquare className="h-4 w-4 text-red-600" />;
      default:
        return <Bell className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-50 text-green-700';
      case 'opened':
        return 'bg-blue-50 text-blue-700';
      case 'sent':
        return 'bg-gray-50 text-gray-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  const documentNotifications = document 
    ? notifications.filter(n => n.documentId === document.id)
    : notifications;

  return (
    <div className="space-y-6">
      {/* Notification Settings */}
      {document && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Notification Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Auto Reminders */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Enable Auto Reminders</Label>
                <Switch
                  checked={enableAutoReminders}
                  onCheckedChange={setEnableAutoReminders}
                />
              </div>
              
              {enableAutoReminders && (
                <>
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
                  
                  <div>
                    <Label>Custom Reminder Message</Label>
                    <Textarea
                      value={reminderMessage}
                      onChange={(e) => setReminderMessage(e.target.value)}
                      placeholder="Enter a custom message for reminders (optional)"
                      rows={3}
                    />
                  </div>
                </>
              )}
              
              <Button onClick={setupReminderSchedule} variant="outline">
                Save Reminder Settings
              </Button>
            </div>

            {/* CC Recipients */}
            <div className="space-y-2">
              <Label>CC Recipients</Label>
              <Input
                value={ccEmails}
                onChange={(e) => setCcEmails(e.target.value)}
                placeholder="Enter email addresses separated by commas"
              />
              <p className="text-sm text-gray-600">
                These recipients will receive copies of all notifications
              </p>
            </div>

            {/* Manual Reminder */}
            <div className="space-y-2">
              <Label>Send Manual Reminder</Label>
              <div className="flex gap-2">
                <Textarea
                  value={reminderMessage}
                  onChange={(e) => setReminderMessage(e.target.value)}
                  placeholder="Optional custom message"
                  rows={2}
                  className="flex-1"
                />
                <Button onClick={handleSendReminder} disabled={document.status !== 'sent'}>
                  <Send className="h-4 w-4 mr-1" />
                  Send
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notification History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification History
            <Badge variant="outline" className="ml-auto">
              {documentNotifications.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {documentNotifications.length === 0 ? (
              <div className="text-center py-8">
                <Mail className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No notifications sent yet</p>
                <p className="text-sm text-gray-400">
                  Notifications will appear here when you send the document
                </p>
              </div>
            ) : (
              documentNotifications
                .sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime())
                .map((notification) => (
                  <div key={notification.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getNotificationIcon(notification.type)}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm capitalize">
                            {notification.type}
                          </span>
                          <Badge 
                            variant="outline" 
                            className={getStatusColor(notification.status)}
                          >
                            {notification.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{notification.recipientEmail}</p>
                        <p className="text-xs text-gray-500">
                          {notification.sentAt.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {document && document.status === 'sent' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => sendReminder(document.id)}
            >
              <Clock className="h-4 w-4 mr-2" />
              Send Reminder to All Pending Signers
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => {
                createNotification({
                  documentId: document.id,
                  type: 'info',
                  title: 'Custom Notification',
                  message: 'Custom notification created',
                  recipientEmail: 'sender@example.com',
                  sentAt: new Date(),
                  status: 'sent',
                });
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Custom Notification
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
