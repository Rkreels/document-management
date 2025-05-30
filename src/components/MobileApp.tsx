
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { QrCode, Smartphone, Download, Apple, Play, Globe, CheckCircle, Clock, FileText, Users } from 'lucide-react';
import { useDocument } from '@/contexts/DocumentContext';

export const MobileApp: React.FC = () => {
  const { documents, getDocumentStats } = useDocument();
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  
  const stats = getDocumentStats();
  const pendingDocuments = documents.filter(d => d.status === 'sent');

  const generateQRCode = (documentId: string) => {
    // In a real app, this would generate an actual QR code
    const signingUrl = `${window.location.origin}/signing/${documentId}/signer1`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(signingUrl)}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Mobile Experience</h2>
        <p className="text-gray-600">Optimized mobile signing and app downloads</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Mobile Preview */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Mobile Signing Experience
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <div className="w-72 h-[500px] bg-gray-900 rounded-[2rem] p-2 shadow-2xl">
                  <div className="w-full h-full bg-white rounded-[1.5rem] overflow-hidden flex flex-col">
                    {/* Status Bar */}
                    <div className="bg-gray-50 px-4 py-2 flex justify-between items-center text-xs">
                      <span>9:41 AM</span>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-2 bg-green-500 rounded-full"></div>
                        <span>100%</span>
                      </div>
                    </div>

                    {/* App Header */}
                    <div className="bg-blue-600 text-white p-4">
                      <h3 className="font-semibold">DocuSign Mobile</h3>
                      <p className="text-blue-100 text-sm">Review & Sign</p>
                    </div>

                    {/* Document Content */}
                    <div className="flex-1 p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Employment Contract</h4>
                        <Badge variant="outline">1 of 3</Badge>
                      </div>

                      <Progress value={33} className="h-2" />

                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="space-y-2">
                          <div className="h-2 bg-gray-200 rounded w-full"></div>
                          <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>

                      <div className="border-2 border-dashed border-blue-300 p-4 rounded-lg text-center">
                        <div className="text-blue-600 mb-2">✍️</div>
                        <p className="text-sm text-blue-600">Tap to sign here</p>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          Decline
                        </Button>
                        <Button size="sm" className="flex-1 bg-blue-600">
                          Continue
                        </Button>
                      </div>
                    </div>

                    {/* Bottom Navigation */}
                    <div className="bg-gray-50 p-2 border-t">
                      <div className="flex justify-around">
                        <div className="flex flex-col items-center p-2">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <span className="text-xs text-blue-600">Documents</span>
                        </div>
                        <div className="flex flex-col items-center p-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="text-xs text-gray-400">Contacts</span>
                        </div>
                        <div className="flex flex-col items-center p-2">
                          <CheckCircle className="h-4 w-4 text-gray-400" />
                          <span className="text-xs text-gray-400">Completed</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="space-y-6">
          {/* App Downloads */}
          <Card>
            <CardHeader>
              <CardTitle>Mobile Apps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full flex items-center justify-center gap-2 bg-black text-white">
                <Apple className="h-4 w-4" />
                Download for iOS
              </Button>
              <Button className="w-full flex items-center justify-center gap-2 bg-green-600 text-white">
                <Play className="h-4 w-4" />
                Download for Android
              </Button>
              <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                <Globe className="h-4 w-4" />
                Open Web App
              </Button>
            </CardContent>
          </Card>

          {/* QR Code Generator */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Access</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Select Document:</label>
                <select
                  value={selectedDocument || ''}
                  onChange={(e) => setSelectedDocument(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  <option value="">Choose a document...</option>
                  {pendingDocuments.map(doc => (
                    <option key={doc.id} value={doc.id}>{doc.title}</option>
                  ))}
                </select>
              </div>

              {selectedDocument && (
                <div className="text-center space-y-3">
                  <div className="flex justify-center">
                    <img 
                      src={generateQRCode(selectedDocument)} 
                      alt="QR Code"
                      className="w-32 h-32 border rounded-lg"
                    />
                  </div>
                  <div>
                    <QrCode className="h-4 w-4 inline mr-1" />
                    <span className="text-sm text-gray-600">
                      Scan to sign on mobile
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mobile Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Mobile Usage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Mobile Signatures</span>
                <Badge>68%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">App Downloads</span>
                <Badge variant="secondary">1.2k</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Completion Rate</span>
                <Badge variant="outline">94%</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Smartphone className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-medium mb-1">Touch Signing</h3>
            <p className="text-sm text-gray-600">Natural finger signing on mobile devices</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-medium mb-1">Offline Support</h3>
            <p className="text-sm text-gray-600">Sign documents without internet connection</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h3 className="font-medium mb-1">Auto-Sync</h3>
            <p className="text-sm text-gray-600">Documents sync across all devices</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
