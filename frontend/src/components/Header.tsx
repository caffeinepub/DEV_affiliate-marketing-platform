import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from './ui/button';
import { useGetCallerUserRole } from '../hooks/useQueries';
import { UserRole } from '../backend';
import { LogOut, BarChart3 } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

export default function Header() {
  const { identity, clear, isLoggingIn } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: userRole } = useGetCallerUserRole();
  const { theme, setTheme } = useTheme();

  const isAuthenticated = !!identity;
  const isAdmin = userRole === UserRole.admin;

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-chart-1 bg-clip-text text-transparent">
            AffiliateHub
          </span>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated && (
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {isAdmin ? 'Admin Dashboard' : 'Partner Dashboard'}
            </span>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {isAuthenticated && (
            <Button
              onClick={handleLogout}
              disabled={isLoggingIn}
              variant="outline"
              size="sm"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
