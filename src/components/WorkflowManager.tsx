import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Users, ArrowUp, ArrowDown, Clock, CheckCircle, Send, UserPlus } from 'lucide-react';
import { useDocument, Document, Signer } from '@/contexts/DocumentContext';

interface WorkflowManagerProps {
  document: Document;
}

export const WorkflowManager: React.FC<WorkflowManagerProps> = ({ document }) => {
  const { updateDocument, updateSigner, addSigner, sendDocument, sendReminder } = useDocument();
  const [newSignerName, setNewSignerName] = useState('');
  const [newSignerEmail, setNewSignerEmail] = useState('');
  const [newSignerRole, setNewSignerRole] = useState<'signer' | 'viewer' | 'approver' | 'cc'>('signer');

  const handleSigningOrderChange = (order: 'parallel' | 'sequential') => {
    updateDocument(document.id, { signingOrder: order });
    
    if (order === 'sequential') {
      // Set order numbers for sequential signing
      const updatedSigners = document.signers.map((signer, index) => ({
        ...signer,
        order: index + 1
      }));
      updateDocument(document.id, { signers: updatedSigners });
    }
  };

  const moveSignerUp = (signerId: string) => {
    const signerIndex = document.signers.findIndex(s => s.id === signerId);
    if (signerIndex > 0) {
      const updatedSigners = [...document.signers];
      [updatedSigners[signerIndex], updatedSigners[signerIndex - 1]] = 
      [updatedSigners[signerIndex - 1], updatedSigners[signerIndex]];
      
      // Update order numbers
      updatedSigners.forEach((signer, index) => {
        signer.order = index + 1;
      });
      
      updateDocument(document.id, { signers: updatedSigners });
    }
  };

  const moveSignerDown = (signerId: string) => {
    const signerIndex = document.signers.findIndex(s => s.id === signerId);
    if (signerIndex < document.signers.length - 1) {
      const updatedSigners = [...document.signers];
      [updatedSigners[signerIndex], updatedSigners[signerIndex + 1]] = 
      [updatedSigners[signerIndex + 1], updatedSigners[signerIndex]];
      
      // Update order numbers
      updatedSigners.forEach((signer, index) => {
        signer.order = index + 1;
      });
      
      updateDocument(document.id, { signers: updatedSigners });
    }
  };

  const handleAddSigner = () => {
    if (newSignerName && newSignerEmail) {
      addSigner(document.id, {
        name: newSignerName,
        email: newSignerEmail,
        role: newSignerRole,
        status: 'pending',
        order: document.signers.length + 1,
        canDelegate: true,
      });
      setNewSignerName('');
      setNewSignerEmail('');
    }
  };

  const toggleSignerDelegation = (signerId: string, canDelegate: boolean) => {
    updateSigner(document.id, signerId, { canDelegate });
  };

  const setSignerAuth = (signerId: string, requireAuth: 'none' | 'email' | 'sms' | 'knowledge') => {
    updateSigner(document.id, signerId, { requireAuth });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'signed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Users className="h-4 w-4 text-gray-400" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'signer':
        return 'default';
      case 'approver':
        return 'secondary';
      case 'viewer':
        return 'outline';
      case 'cc':
        return 'outline';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Signing Order Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Signing Workflow
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Signing Order</Label>
            <Select value={document.signingOrder} onValueChange={handleSigningOrderChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="parallel">Parallel (All at once)</SelectItem>
                <SelectItem value="sequential">Sequential (One at a time)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-600 mt-1">
              {document.signingOrder === 'parallel' 
                ? 'All signers can sign simultaneously'
                : 'Signers must sign in the specified order'
              }
            </p>
          </div>

          {document.status === 'draft' && (
            <Button 
              onClick={() => sendDocument(document.id)}
              className="w-full"
            >
              <Send className="h-4 w-4 mr-2" />
              Send for Signing
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Signers List */}
      <Card>
        <CardHeader>
          <CardTitle>Signers & Recipients</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add New Signer */}
          <div className="p-4 border rounded-lg bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
              <Input
                placeholder="Name"
                value={newSignerName}
                onChange={(e) => setNewSignerName(e.target.value)}
              />
              <Input
                type="email"
                placeholder="Email"
                value={newSignerEmail}
                onChange={(e) => setNewSignerEmail(e.target.value)}
              />
              <Select value={newSignerRole} onValueChange={(value: string) => setNewSignerRole(value as 'signer' | 'viewer' | 'approver' | 'cc')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="signer">Signer</SelectItem>
                  <SelectItem value="approver">Approver</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="cc">CC</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleAddSigner} disabled={!newSignerName || !newSignerEmail}>
                <UserPlus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </div>

          {/* Existing Signers */}
          <div className="space-y-3">
            {document.signers
              .sort((a, b) => a.order - b.order)
              .map((signer, index) => (
                <div key={signer.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(signer.status)}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{signer.name}</span>
                          <Badge variant={getRoleBadgeVariant(signer.role)}>
                            {signer.role}
                          </Badge>
                          {document.signingOrder === 'sequential' && (
                            <Badge variant="outline">#{signer.order}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{signer.email}</p>
                        {signer.delegatedTo && (
                          <p className="text-xs text-blue-600">
                            Delegated to {signer.delegatedTo.name} ({signer.delegatedTo.email})
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {document.signingOrder === 'sequential' && document.status === 'draft' && (
                        <>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => moveSignerUp(signer.id)}
                            disabled={index === 0}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => moveSignerDown(signer.id)}
                            disabled={index === document.signers.length - 1}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      
                      {signer.status === 'pending' && document.status === 'sent' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => sendReminder(document.id)}
                        >
                          Send Reminder
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Signer Settings */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center justify-between">
                      <Label>Can Delegate</Label>
                      <Switch
                        checked={signer.canDelegate}
                        onCheckedChange={(checked) => toggleSignerDelegation(signer.id, checked)}
                        disabled={document.status !== 'draft'}
                      />
                    </div>

                    <div>
                      <Label>Authentication</Label>
                      <Select 
                        value={signer.requireAuth || 'none'} 
                        onValueChange={(value: string) => 
                          setSignerAuth(signer.id, value as 'none' | 'email' | 'sms' | 'knowledge')
                        }
                        disabled={document.status !== 'draft'}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="email">Email verification</SelectItem>
                          <SelectItem value="sms">SMS verification</SelectItem>
                          <SelectItem value="knowledge">Knowledge-based</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
