
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart2, 
  ClipboardList, 
  FilePlus,
  Home,
  Menu, 
  Store, 
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';

interface SideMenuProps {
  className?: string;
}

export function SideMenu({ className }: SideMenuProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();
  
  // Auto-collapse on mobile
  useEffect(() => {
    if (isMobile) {
      setCollapsed(true);
    }
  }, [isMobile]);
  
  const menuItems = [
    { 
      name: 'Dashboard', 
      path: '/', 
      icon: Home 
    },
    { 
      name: 'Templates', 
      path: '/templates', 
      icon: ClipboardList
    },
    { 
      name: 'Store Reports', 
      path: '/reports', 
      icon: Store 
    },
    { 
      name: 'Summaries', 
      path: '/summaries', 
      icon: BarChart2 
    },
    { 
      name: 'Manage Stores', 
      path: '/stores', 
      icon: Users 
    },
  ];

  return (
    <aside 
      className={cn(
        'h-screen fixed left-0 top-0 z-40 flex flex-col transition-all duration-300 border-r border-border bg-sidebar',
        collapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        {!collapsed && (
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <span className="text-white font-semibold text-lg">R</span>
            </div>
            <span className="font-medium">RetailReports</span>
          </Link>
        )}
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'rounded-full p-1.5 transition-all',
            collapsed && 'ml-auto mr-auto'
          )}
        >
          <Menu size={collapsed ? 20 : 18} />
        </Button>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || 
                             (location.pathname.startsWith(item.path) && item.path !== '/');
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    'flex items-center rounded-md px-3 py-2 transition-colors',
                    isActive 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <item.icon size={18} className={cn('flex-shrink-0', collapsed ? 'mx-auto' : 'mr-2')} />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-border">
        {!collapsed ? (
          <Button variant="outline" className="w-full justify-start" asChild>
            <Link to="/templates/create">
              <FilePlus size={16} className="mr-2" />
              New Template
            </Link>
          </Button>
        ) : (
          <Button variant="outline" size="icon" className="w-full justify-center" asChild>
            <Link to="/templates/create">
              <FilePlus size={16} />
            </Link>
          </Button>
        )}
      </div>
    </aside>
  );
}

export default SideMenu;
