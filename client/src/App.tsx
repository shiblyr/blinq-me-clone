import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BusinessCardForm } from '@/components/BusinessCardForm';
import { BusinessCardList } from '@/components/BusinessCardList';
import { PublicCardView } from '@/components/PublicCardView';
import { LandingPage } from '@/components/LandingPage';
import { AuthForms } from '@/components/AuthForms';
import { createTRPCClient, httpBatchLink, loggerLink } from '@trpc/client';
import type { AppRouter } from '../../server/src';
import superjson from 'superjson';
import { useState, useEffect, useCallback } from 'react';
import type { BusinessCard, CreateBusinessCardInput } from '../../server/src/schema';

// Create authenticated trpc client
function createAuthenticatedTRPCClient() {
  return createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({ 
        url: '/api', 
        transformer: superjson,
        headers() {
          const token = localStorage.getItem('auth_token');
          return token ? { authorization: `Bearer ${token}` } : {};
        }
      }),
      loggerLink({
        enabled: (opts) =>
          (typeof window !== 'undefined') ||
          (opts.direction === 'down' && opts.result instanceof Error),
      }),
    ],
  });
}

function App() {
  const [trpc] = useState(() => createAuthenticatedTRPCClient());
  const [cards, setCards] = useState<BusinessCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('create');
  
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [user, setUser] = useState<{ id: number; email: string } | null>(null);
  
  // Navigation state
  const [currentView, setCurrentView] = useState<'landing' | 'auth' | 'app'>('landing');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Check if we're viewing a public card - do this first but don't return yet
  const path = window.location.pathname;
  const isPublicView = path.startsWith('/card/');
  const uniqueUrl = isPublicView ? path.replace('/card/', '') : null;

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setIsAuthLoading(false);
        return;
      }

      try {
        const userData = await trpc.auth.me.query();
        setUser(userData);
        setIsAuthenticated(true);
        setCurrentView('app');
      } catch (error) {
        console.error('Authentication check failed:', error);
        localStorage.removeItem('auth_token');
        setIsAuthenticated(false);
      } finally {
        setIsAuthLoading(false);
      }
    };

    if (!isPublicView) {
      checkAuth();
    } else {
      setIsAuthLoading(false);
    }
  }, [trpc, isPublicView]);

  // Load cards when authenticated
  const loadCards = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const result = await trpc.getBusinessCards.query();
      setCards(result);
    } catch (error) {
      console.error('Failed to load business cards:', error);
    }
  }, [trpc, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && currentView === 'app') {
      loadCards();
    }
  }, [loadCards, isAuthenticated, currentView]);

  // Handle authentication success
  const handleAuthSuccess = (token?: string) => {
    if (token) {
      setIsAuthenticated(true);
      setCurrentView('app');
      // The token is already stored in localStorage by AuthForms
      // Reload user data
      trpc.auth.me.query().then(userData => {
        setUser(userData);
      }).catch(console.error);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await trpc.auth.logout.mutate();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('auth_token');
      setIsAuthenticated(false);
      setUser(null);
      setCards([]);
      setCurrentView('landing');
    }
  };

  // Show loading spinner while checking authentication
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-2">💳</div>
          <div className="text-lg font-semibold text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  // Handle public card view
  if (isPublicView && uniqueUrl) {
    return <PublicCardView uniqueUrl={uniqueUrl} />;
  }

  // Show landing page for unauthenticated users
  if (!isAuthenticated && currentView === 'landing') {
    return (
      <LandingPage
        onSignUp={() => {
          setAuthMode('signup');
          setCurrentView('auth');
        }}
        onSignIn={() => {
          setAuthMode('signin');
          setCurrentView('auth');
        }}
      />
    );
  }

  // Show auth forms
  if (currentView === 'auth') {
    return (
      <AuthForms
        mode={authMode}
        onSuccess={handleAuthSuccess}
        onModeChange={setAuthMode}
        onBack={() => setCurrentView('landing')}
      />
    );
  }

  // Main authenticated app
  const handleCreateCard = async (formData: CreateBusinessCardInput) => {
    setIsLoading(true);
    try {
      const newCard = await trpc.createBusinessCard.mutate(formData);
      setCards((prev: BusinessCard[]) => [...prev, newCard]);
      setActiveTab('cards');
    } catch (error) {
      console.error('Failed to create business card:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCard = async (id: number) => {
    try {
      await trpc.deleteBusinessCard.mutate({ id });
      setCards((prev: BusinessCard[]) => prev.filter(card => card.id !== id));
    } catch (error) {
      console.error('Failed to delete business card:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="text-2xl">💳</div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                DigitalCard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {user && (
                <span className="text-sm text-gray-600">
                  👋 Welcome, {user.email.split('@')[0]}
                </span>
              )}
              <Button variant="outline" onClick={handleLogout}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
            <TabsTrigger value="create" className="text-sm">
              ✨ Create Card
            </TabsTrigger>
            <TabsTrigger value="cards" className="text-sm">
              📋 My Cards ({cards.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-3xl font-bold text-gray-800">
                Create Your Digital Business Card
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Build a professional digital business card that you can share instantly via link or QR code. 
                Perfect for networking events, meetings, and online connections! 🚀
              </p>
            </div>
            
            <BusinessCardForm onSubmit={handleCreateCard} isLoading={isLoading} />
            
            {cards.length > 0 && (
              <div className="text-center pt-6">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab('cards')}
                  className="bg-white/80 backdrop-blur-sm"
                >
                  👀 View My Cards ({cards.length})
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="cards" className="space-y-6">
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-3xl font-bold text-gray-800">
                Your Digital Business Cards
              </h2>
              <p className="text-gray-600">
                Manage and share your digital business cards. Each card has a unique URL and QR code! 📱
              </p>
            </div>

            <BusinessCardList 
              cards={cards} 
              onDelete={handleDeleteCard}
              showActions={true}
            />

            {cards.length > 0 && (
              <div className="text-center pt-6">
                <Button
                  onClick={() => setActiveTab('create')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  ➕ Create Another Card
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-white/50 backdrop-blur-sm border-t border-blue-100 mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-gray-500 space-y-2">
            <p>✨ DigitalCard - Modern Business Networking Made Simple</p>
            <p>Share your professional information instantly with QR codes and unique links</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;