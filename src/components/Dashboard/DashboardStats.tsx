
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardList, FileText, Store, TrendingUp } from 'lucide-react';
import { getTemplates } from '@/services/templateService';
import { getStores } from '@/services/storeService';
import { getReports } from '@/services/reportService';

export function DashboardStats() {
  const { data: templates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: getTemplates
  });
  
  const { data: stores = [], isLoading: storesLoading } = useQuery({
    queryKey: ['stores'],
    queryFn: getStores
  });
  
  const { data: reports = [], isLoading: reportsLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: getReports
  });
  
  // Calculate completionRate and other stats
  const todayReports = reports.filter(report => {
    const reportDate = new Date(report.submitted_at);
    const today = new Date();
    return reportDate.setHours(0,0,0,0) === today.setHours(0,0,0,0);
  });
  
  const reportsCount = todayReports.length;
  const storesCount = stores.length;
  const completionRate = storesCount > 0 ? Math.round((reportsCount / storesCount) * 100) : 0;
  const trendsCount = 4; // This would ideally come from a real AI analysis

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-gradient-to-br from-white to-secondary/50 transition-all hover:shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div className="text-2xl font-semibold">
              {templatesLoading ? <span className="animate-pulse">...</span> : templates.length}
            </div>
            <ClipboardList className="text-primary h-8 w-8 opacity-80" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-white to-secondary/50 transition-all hover:shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Stores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div className="text-2xl font-semibold">
              {storesLoading ? <span className="animate-pulse">...</span> : storesCount}
            </div>
            <Store className="text-primary h-8 w-8 opacity-80" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-white to-secondary/50 transition-all hover:shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Reports Today</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div className="text-2xl font-semibold">
              {reportsLoading ? (
                <span className="animate-pulse">...</span>
              ) : (
                `${reportsCount}/${storesCount}`
              )}
            </div>
            <FileText className="text-primary h-8 w-8 opacity-80" />
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            {reportsLoading ? <span className="animate-pulse">...</span> : `${completionRate}% completion rate`}
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-white to-secondary/50 transition-all hover:shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Daily Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div className="text-2xl font-semibold">{trendsCount}</div>
            <TrendingUp className="text-primary h-8 w-8 opacity-80" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default DashboardStats;
