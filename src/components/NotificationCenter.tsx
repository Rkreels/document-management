import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Mail, MessageSquare, Clock, Check, X, Settings, Send, Users, Calendar } from 'lucide-react';
import { useDocument, Document, Notification } from '@/contexts/DocumentContext';

interface NotificationCenterProps {
  document?: Document;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ document }) => {
  const { notifications, markNotificationAsRead, createNotification, sendReminder } = useDocument();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [reminderFrequency, setReminderFrequency] = useState('weekly');
  const [customMessage, setCustomMessage] = useState('');
  const [ccEmails, setCcEmails] = useState('');

  const documentNotifications = document 
    ? notifications.filter(n => n.documentId === document.id)
    : notifications;

  const unreadCount = documentNotifications.filter(n => !n.read).length;

  const handleSendReminder = () => {
    if (document) {
      sendReminder(document.id);
      createNotification({
        documentId: document.id,
        type: 'reminder',
        title: 'Reminder Sent',
        message: customMessage || `Reminder sent for document "${document.title}"`,
        status: 'sent',
        recipientEmail: 'recipient@example.com',
        sentAt: new Date()
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'reminder': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'completion': return <Check className="h-4 w-4 text-green-600" />;
      case 'decline': return <X className="h-4 w-4 text-red-600" />;
      case 'info': return <Bell className="h-4 w-4 text-gray-600" />;
      default: return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Notification Center</h2>
          <p className="text-gray-600">Manage notifications and reminders</p>
        </div>
        {unreadCount > 0 && (
          <Badge variant="destructive">{unreadCount} unread</Badge>
        )}
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="reminders">Reminders</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Recent Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {documentNotifications.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No notifications</h3>
                    <p className="text-gray-600">You're all caught up!</p>
                  </div>
                ) : (
                  documentNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border rounded-lg ${
                        notification.read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium">{notification.title}</h4>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={notification.status === 'sent' ? 'default' : 'secondary'}
                              >
                                {notification.status}
                              </Badge>
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => markNotificationAsRead(notification.id)}
                                >
                                  Mark read
                                </Button>
                              )}
                            </div>
                          </div>
                          <p className="text-gray-600 mb-2">{notification.message}</p>
                          <div className="text-xs text-gray-500">
                            {notification.timestamp.toLocaleString()} • {notification.recipientEmail}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-gray-600">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-gray-600">Receive notifications via SMS</p>
                  </div>
                  <Switch
                    checked={smsNotifications}
                    onCheckedChange={setSmsNotifications}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>CC Email Addresses</Label>
                <Input
                  placeholder="email1@example.com, email2@example.com"
                  value={ccEmails}
                  onChange={(e) => setCcEmails(e.target.value)}
                />
                <p className="text-sm text-gray-600">
                  Additional recipients for all notifications
                </p>
              </div>

              <div className="space-y-2">
                <Label>Default Reminder Frequency</Label>
                <Select value={reminderFrequency} onValueChange={setReminderFrequency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Bi-weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reminders">
          {document && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Send Reminder
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Document: {document.title}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <Calendar className="h-3 w-3" />
                    <span>Status: {document.status}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Custom Message (Optional)</Label>
                  <Textarea
                    placeholder="Add a personal message to the reminder..."
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button onClick={handleSendReminder} className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  Send Reminder
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
