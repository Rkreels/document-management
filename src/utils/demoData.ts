
// Demo PDF data - a simple base64 encoded PDF for demonstration
export const demoPdfData = "JVBERi0xLjQKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPJ4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovUmVzb3VyY2VzIDw8Ci9Gb250IDw8Ci9GMSA0IDAgUgo+Pgo+PgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovQ29udGVudHMgNSAwIFIKPj4KZW5kb2JqCjQgMCBvYmoKPDwKL1R5cGUgL0ZvbnQKL1N1YnR5cGUgL1R5cGUxCi9CYXNlRm9udCAvSGVsdmV0aWNhCj4+CmVuZG9iago1IDAgb2JqCjw8Ci9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCi9GMSA4IFRmCjEwMCA3MDAgVGQKKFNhbXBsZSBEb2N1bWVudCkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagp4cmVmCjAgNgowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMDkgMDAwMDAgbiAKMDAwMDAwMDA1OCAwMDAwMCBuIAowMDAwMDAwMTE1IDAwMDAwIG4gCjAwMDAwMDAyNDUgMDAwMDAgbiAKMDAwMDAwMDMxMiAwMDAwMCBuIAp0cmFpbGVyCjw8Ci9TaXplIDYKL1Jvb3QgMSAwIFIKPj4Kc3RhcnR4cmVmCjQwNQolJUVPRg==";

export const createSampleDocument = () => ({
  id: 'sample-doc',
  title: 'Sample Contract Document',
  content: demoPdfData,
  fields: [
    {
      id: 'field-1',
      type: 'signature' as const,
      x: 10,
      y: 20,
      width: 20,
      height: 8,
      signerId: 'signer-1',
      required: true,
      label: 'Client Signature'
    },
    {
      id: 'field-2',
      type: 'text' as const,
      x: 10,
      y: 35,
      width: 25,
      height: 6,
      signerId: 'signer-1',
      required: true,
      label: 'Full Name'
    },
    {
      id: 'field-3',
      type: 'date' as const,
      x: 40,
      y: 35,
      width: 20,
      height: 6,
      signerId: 'signer-1',
      required: true,
      label: 'Date'
    }
  ],
  signers: [
    {
      id: 'signer-1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'client',
      status: 'pending' as const,
      order: 1
    }
  ],
  status: 'draft' as const,
  signingOrder: 'sequential' as const,
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-20')
});
