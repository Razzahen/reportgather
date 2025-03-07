
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, Menu, X, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, signOut, isAuthenticated } = useAuth();
  
  // Change navbar appearance on scroll
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Close mobile menu when changing routes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);
  
  const navItems = [
    { name: 'Dashboard', path: '/' },
    { name: 'Templates', path: '/templates' },
    { name: 'Reports', path: '/reports' },
    { name: 'Summaries', path: '/summaries' },
  ];

  // Hide the title on all routes when not scrolled
  const shouldHideTitle = !scrolled;

  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      scrolled ? 'glass shadow-sm py-2' : 'bg-transparent py-4'
    )}>
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link to="/" className={cn(
          "flex items-center space-x-2",
          shouldHideTitle ? 'opacity-0' : 'opacity-100',
          "transition-opacity duration-200"
        )}>
          <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
            <span className="text-white font-semibold text-lg">R</span>
          </div>
          <span className="font-medium text-xl hidden sm:inline">RetailReports</span>
        </Link>
        
        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                location.pathname === item.path ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>
        
        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <User size={16} />
                  <span className="hidden sm:inline">{user?.email?.split('@')[0]}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link to="/profile" className="flex w-full">Profile Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <button onClick={signOut} className="flex items-center w-full">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline" size="sm">
                  Log In
                </Button>
              </Link>
              <Link to="/login">
                <Button size="sm" onClick={() => document.querySelector<HTMLButtonElement>('[data-toggle-signup]')?.click()}>
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
        
        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded-md text-muted-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      
      {/* Mobile menu */}
      <div className={cn(
        'md:hidden absolute w-full bg-background border-b border-border transition-all duration-300 overflow-hidden',
        mobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
      )}>
        <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'py-2 px-4 rounded-md transition-colors',
                location.pathname === item.path 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-foreground hover:bg-muted'
              )}
            >
              {item.name}
            </Link>
          ))}
          <div className="pt-4 border-t border-border flex flex-col space-y-2">
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="w-full">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <User size={16} />
                    Profile Settings
                  </Button>
                </Link>
                <Button className="w-full justify-start gap-2" onClick={signOut}>
                  <LogOut size={16} />
                  Log Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" className="w-full justify-start">
                    Log In
                  </Button>
                </Link>
                <Link to="/login">
                  <Button className="w-full justify-start" 
                    onClick={() => document.querySelector<HTMLButtonElement>('[data-toggle-signup]')?.click()}>
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
