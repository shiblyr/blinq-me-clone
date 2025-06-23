
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import type { CreateBusinessCardInput } from '../../../server/src/schema';

interface BusinessCardFormProps {
  onSubmit: (data: CreateBusinessCardInput) => Promise<void>;
  isLoading?: boolean;
}

export function BusinessCardForm({ onSubmit, isLoading = false }: BusinessCardFormProps) {
  const [formData, setFormData] = useState<CreateBusinessCardInput>({
    name: '',
    title: null,
    company: null,
    email: null,
    phone_number: null,
    linkedin_url: null,
    twitter_url: null,
    instagram_url: null,
    profile_picture_url: null,
    company_logo_url: null
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    setFormData({
      name: '',
      title: null,
      company: null,
      email: null,
      phone_number: null,
      linkedin_url: null,
      twitter_url: null,
      instagram_url: null,
      profile_picture_url: null,
      company_logo_url: null
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          🚀 Create Your Digital Business Card
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-sm font-semibold">
                Full Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev: CreateBusinessCardInput) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter your full name"
                className="h-11"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="title" className="text-sm font-semibold">
                  Job Title
                </Label>
                <Input
                  id="title"
                  value={formData.title || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev: CreateBusinessCardInput) => ({
                      ...prev,
                      title: e.target.value || null
                    }))
                  }
                  placeholder="e.g., Software Engineer"
                  className="h-11"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="company" className="text-sm font-semibold">
                  Company
                </Label>
                <Input
                  id="company"
                  value={formData.company || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev: CreateBusinessCardInput) => ({
                      ...prev,
                      company: e.target.value || null
                    }))
                  }
                  placeholder="e.g., TechCorp Inc."
                  className="h-11"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-sm font-semibold">
                  📧 Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev: CreateBusinessCardInput) => ({
                      ...prev,
                      email: e.target.value || null
                    }))
                  }
                  placeholder="your@email.com"
                  className="h-11"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone" className="text-sm font-semibold">
                  📱 Phone Number
                </Label>
                <Input
                  id="phone"
                  value={formData.phone_number || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev: CreateBusinessCardInput) => ({
                      ...prev,
                      phone_number: e.target.value || null
                    }))
                  }
                  placeholder="+1 (555) 123-4567"
                  className="h-11"
                />
              </div>
            </div>

            <div className="grid gap-4">
              <Label className="text-sm font-semibold">🔗 Social Media Links</Label>
              
              <div className="grid gap-2">
                <Label htmlFor="linkedin" className="text-xs text-gray-600">
                  LinkedIn Profile
                </Label>
                <Input
                  id="linkedin"
                  type="url"
                  value={formData.linkedin_url || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev: CreateBusinessCardInput) => ({
                      ...prev,
                      linkedin_url: e.target.value || null
                    }))
                  }
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="h-11"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="twitter" className="text-xs text-gray-600">
                  Twitter/X Profile
                </Label>
                <Input
                  id="twitter"
                  type="url"
                  value={formData.twitter_url || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev: CreateBusinessCardInput) => ({
                      ...prev,
                      twitter_url: e.target.value || null
                    }))
                  }
                  placeholder="https://twitter.com/yourhandle"
                  className="h-11"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="instagram" className="text-xs text-gray-600">
                  Instagram Profile
                </Label>
                <Input
                  id="instagram"
                  type="url"
                  value={formData.instagram_url || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev: CreateBusinessCardInput) => ({
                      ...prev,
                      instagram_url: e.target.value || null
                    }))
                  }
                  placeholder="https://instagram.com/yourhandle"
                  className="h-11"
                />
              </div>
            </div>

            <div className="grid gap-4">
              <Label className="text-sm font-semibold">🖼️ Images</Label>
              
              <div className="grid gap-2">
                <Label htmlFor="profile-pic" className="text-xs text-gray-600">
                  Profile Picture URL
                </Label>
                <Input
                  id="profile-pic"
                  type="url"
                  value={formData.profile_picture_url || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev: CreateBusinessCardInput) => ({
                      ...prev,
                      profile_picture_url: e.target.value || null
                    }))
                  }
                  placeholder="https://example.com/your-photo.jpg"
                  className="h-11"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="company-logo" className="text-xs text-gray-600">
                  Company Logo URL
                </Label>
                <Input
                  id="company-logo"
                  type="url"
                  value={formData.company_logo_url || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev: CreateBusinessCardInput) => ({
                      ...prev,
                      company_logo_url: e.target.value || null
                    }))
                  }
                  placeholder="https://example.com/company-logo.png"
                  className="h-11"
                />
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isLoading} 
            className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isLoading ? '✨ Creating Your Card...' : '🎯 Create Business Card'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
