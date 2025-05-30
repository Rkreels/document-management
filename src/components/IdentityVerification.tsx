
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Shield, Phone, Mail, CreditCard, User, Check, X, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface IdentityVerificationProps {
  signerId: string;
  onVerificationComplete: (verified: boolean) => void;
  verificationType: 'email' | 'sms' | 'knowledge' | 'id_document';
}

export const IdentityVerification: React.FC<IdentityVerificationProps> = ({
  signerId,
  onVerificationComplete,
  verificationType
}) => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [personalInfo, setPersonalInfo] = useState({
    ssn: '',
    dateOfBirth: '',
    address: ''
  });

  const handleSendVerification = async () => {
    setIsVerifying(true);
    
    // Simulate API call
    setTimeout(() => {
      setVerificationSent(true);
      setIsVerifying(false);
      toast({
        title: 'Verification Sent',
        description: `Verification code sent via ${verificationType === 'email' ? 'email' : 'SMS'}.`
      });
    }, 2000);
  };

  const handleVerifyCode = async () => {
    setIsVerifying(true);
    
    // Simulate verification
    setTimeout(() => {
      setIsVerifying(false);
      if (verificationCode === '123456') {
        onVerificationComplete(true);
        toast({
          title: 'Verification Successful',
          description: 'Identity verified successfully.'
        });
      } else {
        toast({
          title: 'Verification Failed',
          description: 'Invalid verification code. Please try again.',
          variant: 'destructive'
        });
      }
    }, 1500);
  };

  const handleKnowledgeVerification = async () => {
    setIsVerifying(true);
    
    // Simulate knowledge-based verification
    setTimeout(() => {
      setIsVerifying(false);
      // Simple validation for demo
      if (personalInfo.ssn && personalInfo.dateOfBirth && personalInfo.address) {
        onVerificationComplete(true);
        toast({
          title: 'Identity Verified',
          description: 'Knowledge-based verification completed successfully.'
        });
      } else {
        toast({
          title: 'Verification Failed',
          description: 'Please provide all required information.',
          variant: 'destructive'
        });
      }
    }, 2000);
  };

  const renderEmailSMSVerification = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          {verificationType === 'email' ? <Mail className="h-6 w-6 text-blue-600" /> : <Phone className="h-6 w-6 text-blue-600" />}
        </div>
        <h3 className="text-lg font-semibold mb-2">
          {verificationType === 'email' ? 'Email' : 'SMS'} Verification Required
        </h3>
        <p className="text-gray-600">
          To proceed with signing, please verify your identity using {verificationType === 'email' ? 'email' : 'SMS'} verification.
        </p>
      </div>

      {!verificationSent ? (
        <div className="space-y-4">
          <Button 
            onClick={handleSendVerification} 
            disabled={isVerifying}
            className="w-full"
          >
            {isVerifying ? 'Sending...' : `Send Verification Code via ${verificationType === 'email' ? 'Email' : 'SMS'}`}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <Label htmlFor="verification-code">Verification Code</Label>
            <Input
              id="verification-code"
              type="text"
              placeholder="Enter 6-digit code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              maxLength={6}
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleVerifyCode}
              disabled={verificationCode.length !== 6 || isVerifying}
              className="flex-1"
            >
              {isVerifying ? 'Verifying...' : 'Verify Code'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setVerificationSent(false)}
            >
              Resend
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  const renderKnowledgeVerification = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <User className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Knowledge-Based Verification</h3>
        <p className="text-gray-600">
          Please provide the following information to verify your identity.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="ssn">Last 4 digits of SSN</Label>
          <Input
            id="ssn"
            type="text"
            placeholder="****"
            value={personalInfo.ssn}
            onChange={(e) => setPersonalInfo(prev => ({ ...prev, ssn: e.target.value }))}
            maxLength={4}
          />
        </div>

        <div>
          <Label htmlFor="dob">Date of Birth</Label>
          <Input
            id="dob"
            type="date"
            value={personalInfo.dateOfBirth}
            onChange={(e) => setPersonalInfo(prev => ({ ...prev, dateOfBirth: e.target.value }))}
          />
        </div>

        <div>
          <Label htmlFor="address">Street Address</Label>
          <Input
            id="address"
            type="text"
            placeholder="123 Main St"
            value={personalInfo.address}
            onChange={(e) => setPersonalInfo(prev => ({ ...prev, address: e.target.value }))}
          />
        </div>

        <Button 
          onClick={handleKnowledgeVerification}
          disabled={isVerifying || !personalInfo.ssn || !personalInfo.dateOfBirth || !personalInfo.address}
          className="w-full"
        >
          {isVerifying ? 'Verifying...' : 'Verify Identity'}
        </Button>
      </div>
    </div>
  );

  const renderIDDocumentVerification = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
          <CreditCard className="h-6 w-6 text-purple-600" />
        </div>
        <h3 className="text-lg font-semibold mb-2">ID Document Verification</h3>
        <p className="text-gray-600">
          Upload a photo of your government-issued ID to verify your identity.
        </p>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-4">Drag and drop your ID document here, or click to browse</p>
        <Button variant="outline">Choose File</Button>
      </div>

      <div className="text-xs text-gray-500">
        <p className="flex items-center gap-1 mb-1">
          <Shield className="h-3 w-3" />
          Your document is encrypted and securely processed
        </p>
        <p>Accepted formats: JPG, PNG, PDF (max 10MB)</p>
      </div>
    </div>
  );

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Identity Verification
          <Badge variant="outline">Required</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {verificationType === 'email' || verificationType === 'sms' ? 
          renderEmailSMSVerification() :
          verificationType === 'knowledge' ?
          renderKnowledgeVerification() :
          renderIDDocumentVerification()
        }
      </CardContent>
    </Card>
  );
};
