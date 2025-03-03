
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SideMenu } from '../components/SideMenu';
import CEODashboard from '../components/CEODashboard';
import Navbar from '../components/Navbar';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

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
        <main className="container mx-auto px-4 py-8 pt-32">
          <CEODashboard />
        </main>
      </div>
    </div>
  );
}

export default Index;
