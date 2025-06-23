
import { BusinessCardDisplay } from './BusinessCardDisplay';
import { Button } from '@/components/ui/button';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import type { BusinessCard } from '../../../server/src/schema';

interface PublicCardViewProps {
  uniqueUrl: string;
}

export function PublicCardView({ uniqueUrl }: PublicCardViewProps) {
  const [card, setCard] = useState<BusinessCard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCard = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await trpc.getBusinessCardByUrl.query({ unique_url: uniqueUrl });
      setCard(result);
      setError(null);
    } catch (error) {
      console.error('Failed to load business card:', error);
      setError('Business card not found');
      setCard(null);
    } finally {
      setIsLoading(false);
    }
  }, [uniqueUrl]);

  useEffect(() => {
    loadCard();
  }, [loadCard]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="text-4xl">⏳</div>
          <p className="text-lg text-gray-600">Loading business card...</p>
        </div>
      </div>
    );
  }

  if (error || !card) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="text-6xl">❌</div>
          <h2 className="text-2xl font-bold text-gray-800">Card Not Found</h2>
          <p className="text-gray-600">The business card you're looking for doesn't exist.</p>
          <Button onClick={() => window.location.href = '/'}>
            🏠 Go Home
          </Button>
        </div>
      </div>
    );
  }

  const saveContact = () => {
    // Create vCard format
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${card.name}
${card.title ? `TITLE:${card.title}` : ''}
${card.company ? `ORG:${card.company}` : ''}
${card.email ? `EMAIL:${card.email}` : ''}
${card.phone_number ? `TEL:${card.phone_number}` : ''}
${card.linkedin_url ? `URL:${card.linkedin_url}` : ''}
END:VCARD`;

    const blob = new Blob([vcard], { type: 'text/vcard' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${card.name.replace(/\s+/g, '_')}_contact.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            ✨ Digital Business Card
          </h1>
          <p className="text-gray-600">Connect with {card.name}</p>
        </div>

        <BusinessCardDisplay card={card} />

        <div className="flex flex-col space-y-3">
          <Button 
            onClick={saveContact}
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
          >
            💾 Save to Contacts
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/'}
            className="w-full"
          >
            🚀 Create Your Own Card
          </Button>
        </div>
      </div>
    </div>
  );
}
