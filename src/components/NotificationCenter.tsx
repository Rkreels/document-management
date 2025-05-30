
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Mail, MessageSquare, Clock, CheckCircle, AlertCircle, Settings, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  type: 'document_signed' | 'document_declined' | 'reminder_sent' | 'document_expired' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  documentId?: string;
}

export const NotificationCenter: React.FC = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'document_signed',
      title: 'Document Signed',
      message: 'John Doe has signed the Employment Contract',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      read: false,
      documentId: 'doc-1'
    },
    {
      id: '2',
      type: 'reminder_sent',
      title: 'Reminder Sent',
      message: 'Reminder sent to jane@example.com for NDA Agreement',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      read: false,
      documentId: 'doc-2'
    },
    {
      id: '3',
      type: 'document_declined',
      title: 'Document Declined',
      message: 'Alice Smith declined the Service Agreement',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      read: true,
      documentId: 'doc-3'
    }
  ]);

  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    documentSigned: true,
    documentDeclined: true,
    reminderSent: false,
    documentExpired: true,
    frequency: 'immediate'
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast({
      title: 'All notifications marked as read',
      description: 'Your notification list has been updated.'
    });
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'document_signed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'document_declined':
        return <X className="h-4 w-4 text-red-600" />;
      case 'reminder_sent':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'document_expired':
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <h2 className="text-2xl font-bold">Notifications</h2>
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount}</Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllAsRead}>
            Mark all as read
          </Button>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Notifications List */}
        <div className="lg:col-span-2 space-y-3">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <Card key={notification.id} className={`cursor-pointer transition-all ${
                !notification.read ? 'border-blue-200 bg-blue-50' : ''
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{notification.title}</h4>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                        <p className="text-xs text-gray-500">{formatTimestamp(notification.timestamp)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                        >
                          Mark read
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteNotification(notification.id)}
                        className="h-8 w-8"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No notifications</h3>
                <p className="text-gray-600">You're all caught up! New notifications will appear here.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Notification Settings */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-3">Delivery Methods</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span className="text-sm">Email</span>
                    </div>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, emailNotifications: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      <span className="text-sm">Push Notifications</span>
                    </div>
                    <Switch
                      checked={settings.pushNotifications}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, pushNotifications: checked }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Event Types</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Document Signed</span>
                    <Switch
                      checked={settings.documentSigned}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, documentSigned: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Document Declined</span>
                    <Switch
                      checked={settings.documentDeclined}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, documentDeclined: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Reminder Sent</span>
                    <Switch
                      checked={settings.reminderSent}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, reminderSent: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Document Expired</span>
                    <Switch
                      checked={settings.documentExpired}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, documentExpired: checked }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Frequency</h4>
                <Select value={settings.frequency} onValueChange={(value) => 
                  setSettings(prev => ({ ...prev, frequency: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="hourly">Hourly digest</SelectItem>
                    <SelectItem value="daily">Daily digest</SelectItem>
                    <SelectItem value="weekly">Weekly digest</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="w-full" onClick={() => {
                toast({
                  title: 'Settings saved',
                  description: 'Your notification preferences have been updated.'
                });
              }}>
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
