import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { trpc } from '@/utils/trpc';
import type { SignupInput, SigninInput } from '../../../server/src/schema';

interface AuthFormsProps {
  mode: 'signin' | 'signup';
  onSuccess: (token?: string) => void;
  onModeChange: (mode: 'signin' | 'signup') => void;
  onBack: () => void;
}

export function AuthForms({ mode, onSuccess, onModeChange, onBack }: AuthFormsProps) {
  const [formData, setFormData] = useState<SignupInput>({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        await trpc.auth.signup.mutate(formData);
        // After successful signup, switch to signin mode
        onModeChange('signin');
        setError(null);
        // Show success message briefly
        setTimeout(() => {
          setError('Account created successfully! Please sign in.');
        }, 100);
      } else {
        const result = await trpc.auth.signin.mutate(formData as SigninInput);
        // Store token in localStorage
        localStorage.setItem('auth_token', result.token);
        onSuccess(result.token);
      }
    } catch (err: unknown) {
      console.error(`${mode} error:`, err);
      const errorMessage = err instanceof Error ? err.message : `${mode === 'signup' ? 'Signup' : 'Signin'} failed. Please try again.`;
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const isSignup = mode === 'signup';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            ← Back to Home
          </Button>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="text-2xl">💳</div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              DigitalCard
            </h1>
          </div>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {isSignup ? '✨ Create Account' : '👋 Welcome Back'}
            </CardTitle>
            <CardDescription>
              {isSignup 
                ? 'Join thousands of professionals using DigitalCard'
                : 'Sign in to manage your digital business cards'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev: SignupInput) => ({ ...prev, email: e.target.value }))
                  }
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={isSignup ? "Create a password (min 6 characters)" : "Enter your password"}
                  value={formData.password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev: SignupInput) => ({ ...prev, password: e.target.value }))
                  }
                  required
                  disabled={isLoading}
                  minLength={isSignup ? 6 : 1}
                />
              </div>

              {error && (
                <Alert className={error.includes('successfully') ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                  <AlertDescription className={error.includes('successfully') ? 'text-green-800' : 'text-red-800'}>
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={isLoading}
              >
                {isLoading 
                  ? (isSignup ? 'Creating Account...' : 'Signing In...') 
                  : (isSignup ? 'Create Account' : 'Sign In')
                }
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Button
                variant="link"
                onClick={() => {
                  onModeChange(isSignup ? 'signin' : 'signup');
                  setError(null);
                  setFormData({ email: '', password: '' });
                }}
                disabled={isLoading}
                className="text-sm"
              >
                {isSignup 
                  ? 'Already have an account? Sign in' 
                  : "Don't have an account? Sign up"
                }
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}