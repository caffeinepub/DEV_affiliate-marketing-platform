import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserRole, useIsCallerApproved, useGetCallerProfile, useGetCallerApprovalStatus } from './hooks/useQueries';
import Header from './components/Header';
import Footer from './components/Footer';
import LoginPage from './pages/LoginPage';
import PartnerRegistration from './pages/PartnerRegistration';
import ApprovalPending from './pages/ApprovalPending';
import AdminDashboard from './pages/AdminDashboard';
import PartnerDashboard from './pages/PartnerDashboard';
import { Toaster } from './components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import { UserRole } from './backend';

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userRole, isLoading: roleLoading } = useGetCallerUserRole();
  const { data: isApproved, isLoading: approvalLoading } = useIsCallerApproved();

  const isAuthenticated = !!identity;
  const isAdmin = userRole === UserRole.admin;

  // Show loading state during initialization
  if (isInitializing || (isAuthenticated && (roleLoading || approvalLoading))) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="text-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
        <Toaster />
      </ThemeProvider>
    );
  }

  // Not authenticated - show login page
  if (!isAuthenticated) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <LoginPage />
        <Toaster />
      </ThemeProvider>
    );
  }

  // Admin users - show admin dashboard
  if (isAdmin) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">
            <AdminDashboard />
          </main>
          <Footer />
        </div>
        <Toaster />
      </ThemeProvider>
    );
  }

  // Partner users - check approval status
  if (isApproved) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">
            <PartnerDashboard />
          </main>
          <Footer />
        </div>
        <Toaster />
      </ThemeProvider>
    );
  }

  // Check if partner has registered
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <PartnerRegistrationOrPending />
        </main>
        <Footer />
      </div>
      <Toaster />
    </ThemeProvider>
  );
}

function PartnerRegistrationOrPending() {
  const { data: profile, isLoading } = useGetCallerProfile();
  const { data: approvalStatus } = useGetCallerApprovalStatus();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If no profile exists, show registration form
  if (!profile) {
    return <PartnerRegistration />;
  }

  // Profile exists, show approval status
  return <ApprovalPending status={approvalStatus} />;
}
