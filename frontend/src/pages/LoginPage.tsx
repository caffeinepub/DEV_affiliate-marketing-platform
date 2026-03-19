import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { BarChart3, TrendingUp, DollarSign, Users } from 'lucide-react';

export default function LoginPage() {
  const { login, isLoggingIn } = useInternetIdentity();

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <BarChart3 className="h-12 w-12 text-primary" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-chart-1 to-chart-2 bg-clip-text text-transparent">
              AffiliateHub
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            The modern affiliate marketing platform for tracking performance, managing partnerships, and maximizing revenue
          </p>
        </div>

        {/* Hero Image */}
        <div className="mb-16 max-w-4xl mx-auto">
          <img
            src="/assets/generated/dashboard-hero.dim_800x600.png"
            alt="Dashboard Preview"
            className="rounded-lg shadow-2xl border border-border/50"
          />
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16 max-w-5xl mx-auto">
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <div className="mb-4">
                <img
                  src="/assets/generated/partnership-icon-transparent.dim_64x64.png"
                  alt="Partnership"
                  className="h-16 w-16"
                />
              </div>
              <CardTitle>Partner Management</CardTitle>
              <CardDescription>
                Streamlined onboarding and approval process for affiliate partners
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <div className="mb-4">
                <img
                  src="/assets/generated/analytics-icon-transparent.dim_64x64.png"
                  alt="Analytics"
                  className="h-16 w-16"
                />
              </div>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>
                Real-time tracking of clicks, conversions, and revenue metrics
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <div className="mb-4">
                <img
                  src="/assets/generated/commission-icon-transparent.dim_64x64.png"
                  alt="Commission"
                  className="h-16 w-16"
                />
              </div>
              <CardTitle>Commission Tracking</CardTitle>
              <CardDescription>
                Automated commission calculations and payout management
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Login Card */}
        <Card className="max-w-md mx-auto border-border/50 bg-card/80 backdrop-blur">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Get Started</CardTitle>
            <CardDescription>
              Sign in with Internet Identity to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="w-full h-12 text-lg"
              size="lg"
            >
              {isLoggingIn ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Connecting...
                </>
              ) : (
                'Sign In with Internet Identity'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Stats Section */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-1">100%</div>
            <div className="text-sm text-muted-foreground">Secure</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-chart-1 mb-1">Real-time</div>
            <div className="text-sm text-muted-foreground">Tracking</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-chart-2 mb-1">Fast</div>
            <div className="text-sm text-muted-foreground">Payouts</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-chart-3 mb-1">24/7</div>
            <div className="text-sm text-muted-foreground">Access</div>
          </div>
        </div>
      </div>
    </div>
  );
}
