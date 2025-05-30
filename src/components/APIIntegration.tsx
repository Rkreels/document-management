
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Code, Link, Zap, Webhook, Key, CheckCircle, AlertCircle, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  connected: boolean;
  webhookUrl?: string;
  apiKey?: string;
}

export const APIIntegration: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('integrations');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [apiKey, setApiKey] = useState('');

  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'zapier',
      name: 'Zapier',
      description: 'Automate workflows with 5000+ apps',
      icon: <Zap className="h-6 w-6" />,
      connected: false
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Get notifications in your Slack channels',
      icon: <div className="h-6 w-6 bg-purple-600 rounded"></div>,
      connected: false
    },
    {
      id: 'salesforce',
      name: 'Salesforce',
      description: 'Sync documents with Salesforce records',
      icon: <div className="h-6 w-6 bg-blue-600 rounded"></div>,
      connected: false
    },
    {
      id: 'hubspot',
      name: 'HubSpot',
      description: 'Connect documents to HubSpot deals',
      icon: <div className="h-6 w-6 bg-orange-600 rounded"></div>,
      connected: false
    }
  ]);

  const toggleIntegration = (id: string) => {
    setIntegrations(prev => 
      prev.map(integration => 
        integration.id === id 
          ? { ...integration, connected: !integration.connected }
          : integration
      )
    );
    
    const integration = integrations.find(i => i.id === id);
    toast({
      title: `${integration?.name} ${integration?.connected ? 'Disconnected' : 'Connected'}`,
      description: `Successfully ${integration?.connected ? 'disconnected from' : 'connected to'} ${integration?.name}.`
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard',
      description: 'The text has been copied to your clipboard.'
    });
  };

  const apiEndpoints = [
    {
      method: 'POST',
      endpoint: '/api/documents',
      description: 'Create a new document',
      example: `{
  "title": "Employment Contract",
  "content": "base64_pdf_content",
  "signers": [
    {
      "name": "John Doe",
      "email": "john@example.com",
      "role": "signer"
    }
  ]
}`
    },
    {
      method: 'GET',
      endpoint: '/api/documents/{id}',
      description: 'Get document details',
      example: 'No request body required'
    },
    {
      method: 'POST',
      endpoint: '/api/documents/{id}/send',
      description: 'Send document for signing',
      example: `{
  "message": "Please review and sign this document"
}`
    },
    {
      method: 'GET',
      endpoint: '/api/documents/{id}/status',
      description: 'Get document status',
      example: 'No request body required'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">API & Integrations</h2>
        <p className="text-gray-600">Connect with third-party services and use our API</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="api">API Access</TabsTrigger>
          <TabsTrigger value="docs">Documentation</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {integrations.map((integration) => (
              <Card key={integration.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {integration.icon}
                      <div>
                        <h3 className="font-semibold">{integration.name}</h3>
                        <p className="text-sm text-gray-600">{integration.description}</p>
                      </div>
                    </div>
                    <Badge variant={integration.connected ? 'default' : 'secondary'}>
                      {integration.connected ? 'Connected' : 'Disconnected'}
                    </Badge>
                  </div>
                  <Button 
                    onClick={() => toggleIntegration(integration.id)}
                    variant={integration.connected ? 'destructive' : 'default'}
                    className="w-full"
                  >
                    {integration.connected ? 'Disconnect' : 'Connect'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="h-5 w-5" />
                Webhook Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="webhook-url"
                    placeholder="https://your-app.com/webhook"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                  />
                  <Button onClick={() => {
                    toast({
                      title: 'Webhook saved',
                      description: 'Your webhook URL has been configured.'
                    });
                  }}>
                    Save
                  </Button>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  We'll send POST requests to this URL when events occur
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-3">Events</h4>
                <div className="space-y-2">
                  {[
                    'document.sent',
                    'document.signed',
                    'document.declined',
                    'document.completed',
                    'signer.reminded'
                  ].map((event) => (
                    <div key={event} className="flex items-center justify-between">
                      <span className="text-sm font-mono">{event}</span>
                      <Switch defaultChecked />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Example Webhook Payload</h4>
                <pre className="text-xs bg-white p-3 rounded border overflow-auto">
{`{
  "event": "document.signed",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "document_id": "doc_123",
    "signer_id": "signer_456",
    "signer_email": "john@example.com"
  }
}`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                API Access
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="api-key">API Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="api-key"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk_live_..."
                  />
                  <Button 
                    variant="outline"
                    onClick={() => copyToClipboard(apiKey)}
                    disabled={!apiKey}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button onClick={() => {
                    const newKey = `sk_live_${Math.random().toString(36).substring(2, 15)}`;
                    setApiKey(newKey);
                    toast({
                      title: 'API key generated',
                      description: 'Your new API key has been created.'
                    });
                  }}>
                    Generate
                  </Button>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Use this API key to authenticate your requests
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium text-yellow-800">Security Notice</span>
                </div>
                <p className="text-sm text-yellow-700">
                  Keep your API key secure. Don't share it in publicly accessible areas such as GitHub, client code, etc.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="docs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                API Documentation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2">Base URL</h4>
                  <div className="bg-gray-50 p-3 rounded font-mono text-sm">
                    https://api.docusign.example.com/v1
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Authentication</h4>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm mb-2">Include your API key in the Authorization header:</p>
                    <code className="text-sm">Authorization: Bearer your_api_key_here</code>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-4">Endpoints</h4>
                  <div className="space-y-4">
                    {apiEndpoints.map((endpoint, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={endpoint.method === 'GET' ? 'secondary' : 'default'}>
                            {endpoint.method}
                          </Badge>
                          <code className="text-sm font-mono">{endpoint.endpoint}</code>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{endpoint.description}</p>
                        <details className="text-sm">
                          <summary className="cursor-pointer font-medium">Example Request</summary>
                          <pre className="mt-2 bg-gray-50 p-3 rounded overflow-auto">
                            {endpoint.example}
                          </pre>
                        </details>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
