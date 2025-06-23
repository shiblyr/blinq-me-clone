import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface LandingPageProps {
  onSignUp: () => void;
  onSignIn: () => void;
}

export function LandingPage({ onSignUp, onSignIn }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="text-2xl">💳</div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                DigitalCard
              </h1>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={onSignIn}>
                Sign In
              </Button>
              <Button onClick={onSignUp} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold text-gray-800 leading-tight">
              Create & Share Your
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Digital Business Card
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Build professional digital business cards that you can share instantly via link or QR code. 
              Perfect for networking events, meetings, and online connections! 🚀
            </p>
          </div>

          <div className="flex justify-center space-x-4">
            <Button 
              size="lg" 
              onClick={onSignUp}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-3"
            >
              ✨ Get Started Free
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={onSignIn}
              className="text-lg px-8 py-3"
            >
              👋 Sign In
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
              <CardHeader>
                <div className="text-3xl mb-2">⚡</div>
                <CardTitle>Instant Sharing</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  Share your business card via unique URL or QR code. No apps required for recipients!
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
              <CardHeader>
                <div className="text-3xl mb-2">🎨</div>
                <CardTitle>Professional Design</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  Beautiful, responsive design that looks great on all devices. Make a lasting impression!
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
              <CardHeader>
                <div className="text-3xl mb-2">🔄</div>
                <CardTitle>Always Updated</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  Update your information anytime and all shared links automatically reflect the changes.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Example Card Preview */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-800 mb-8">See It In Action</h2>
            <Card className="max-w-md mx-auto bg-white shadow-lg">
              <CardHeader className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                  JD
                </div>
                <CardTitle className="text-xl">John Doe</CardTitle>
                <CardDescription>Senior Software Engineer</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-gray-600">
                  <div>📧 john@company.com</div>
                  <div>📱 (555) 123-4567</div>
                  <div>🏢 Tech Solutions Inc.</div>
                  <div>💼 linkedin.com/in/johndoe</div>
                </div>
                <div className="pt-2 flex justify-center">
                  <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                    QR Code
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/50 backdrop-blur-sm border-t border-blue-100 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-gray-500 space-y-2">
            <p>✨ DigitalCard - Modern Business Networking Made Simple</p>
            <p>Join thousands of professionals who trust DigitalCard for their networking needs</p>
          </div>
        </div>
      </footer>
    </div>
  );
}