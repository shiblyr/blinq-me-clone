
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { trpc } from '@/utils/trpc';
import { useState } from 'react';
import type { BusinessCard } from '../../../server/src/schema';

interface BusinessCardDisplayProps {
  card: BusinessCard;
  onDelete?: (id: number) => void;
  showActions?: boolean;
}

export function BusinessCardDisplay({ card, onDelete, showActions = false }: BusinessCardDisplayProps) {
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);

  const handleGenerateQr = async () => {
    setIsGeneratingQr(true);
    try {
      await trpc.generateQrCode.mutate({ id: card.id });
      // Refresh the page or trigger a refetch to show the QR code
      window.location.reload();
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    } finally {
      setIsGeneratingQr(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-slate-50 to-blue-50 border-2 border-blue-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex flex-col items-center space-y-4">
          {/* Header with Avatar and Company Logo */}
          <div className="flex items-center justify-between w-full">
            <Avatar className="w-16 h-16 border-2 border-blue-200">
              <AvatarImage src={card.profile_picture_url || ''} alt={card.name} />
              <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                {getInitials(card.name)}
              </AvatarFallback>
            </Avatar>
            
            {card.company_logo_url && (
              <img 
                src={card.company_logo_url} 
                alt="Company Logo" 
                className="w-12 h-12 object-contain"
              />
            )}
          </div>

          {/* Name and Title */}
          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold text-gray-800">{card.name}</h2>
            {card.title && (
              <p className="text-sm text-gray-600 font-medium">{card.title}</p>
            )}
            {card.company && (
              <Badge variant="secondary" className="text-xs">
                {card.company}
              </Badge>
            )}
          </div>

          {/* Contact Information */}
          <div className="w-full space-y-2">
            {card.email && (
              <div className="flex items-center space-x-2 text-sm">
                <span>📧</span>
                <a 
                  href={`mailto:${card.email}`}
                  className="text-blue-600 hover:underline truncate"
                >
                  {card.email}
                </a>
              </div>
            )}
            
            {card.phone_number && (
              <div className="flex items-center space-x-2 text-sm">
                <span>📱</span>
                <a 
                  href={`tel:${card.phone_number}`}
                  className="text-blue-600 hover:underline"
                >
                  {card.phone_number}
                </a>
              </div>
            )}
          </div>

          {/* Social Media Links */}
          <div className="flex flex-wrap gap-2 justify-center">
            {card.linkedin_url && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.open(card.linkedin_url!, '_blank')}
                className="text-xs"
              >
                💼 LinkedIn
              </Button>
            )}
            
            {card.twitter_url && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.open(card.twitter_url!, '_blank')}
                className="text-xs"
              >
                🐦 Twitter
              </Button>
            )}
            
            {card.instagram_url && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.open(card.instagram_url!, '_blank')}
                className="text-xs"
              >
                📸 Instagram
              </Button>
            )}
          </div>

          {/* Sharing Options */}
          <div className="w-full pt-4 border-t border-gray-200 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Share your card:</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(`${window.location.origin}/card/${card.unique_url}`)}
                className="text-xs h-6 px-2"
              >
                📋 Copy Link
              </Button>
            </div>
            
            <div className="text-center">
              {card.qr_code_url ? (
                <div className="space-y-2">
                  <img 
                    src={card.qr_code_url} 
                    alt="QR Code" 
                    className="w-20 h-20 mx-auto border border-gray-200 rounded"
                  />
                  <p className="text-xs text-gray-500">Scan to view card</p>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateQr}
                  disabled={isGeneratingQr}
                  className="text-xs"
                >
                  {isGeneratingQr ? '⏳ Generating...' : '📱 Generate QR Code'}
                </Button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {showActions && onDelete && (
            <div className="w-full pt-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(card.id)}
                className="w-full text-xs"
              >
                🗑️ Delete Card
              </Button>
            </div>
          )}

          {/* Creation Date */}
          <p className="text-xs text-gray-400 text-center">
            Created {card.created_at.toLocaleDateString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
