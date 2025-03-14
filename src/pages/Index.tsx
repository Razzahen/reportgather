
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SideMenu } from '../components/SideMenu';
import { CEODashboard } from '../components/Dashboard/CEODashboard';
import Navbar from '../components/Navbar';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import ErrorBoundary from '@/components/ErrorBoundary';

const Index = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  useEffect(() => {
    if (isMobile) {
      setSidebarCollapsed(true);
    }
  }, [isMobile]);

  return (
    <div className="min-h-screen flex w-full bg-background">
      <SideMenu className="z-50" />
      
      <div 
        className={cn(
          "flex-1 transition-all duration-300 overflow-x-hidden",
          sidebarCollapsed ? "ml-16" : "ml-64"
        )}
      >
        <Navbar />
        <main className="container mx-auto px-4 py-4 pt-20">
          <ErrorBoundary>
            <CEODashboard />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}

export default Index;
