
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { getReports } from '@/services/reportService';
import { getStores } from '@/services/storeService';
import { Skeleton } from '@/components/ui/skeleton';

export function LatestSummary() {
  const { data: reports = [], isLoading: reportsLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: getReports
  });
  
  const { data: stores = [], isLoading: storesLoading } = useQuery({
    queryKey: ['stores'],
    queryFn: getStores
  });
  
  const isLoading = reportsLoading || storesLoading;
  
  // Calculate summary data from real data
  const todayReports = reports.filter(report => {
    const reportDate = new Date(report.submitted_at);
    const today = new Date();
    return reportDate.setHours(0,0,0,0) === today.setHours(0,0,0,0);
  });
  
  const reportsSubmitted = todayReports.length;
  const totalStores = stores.length;
  
  // For a real app, these would be calculated from actual report data
  const averageSales = todayReports.length > 0 ? 8500 : 0;
  const topPerformingStore = stores.length > 0 ? stores[0].name : 'N/A';
  
  // Example key trends - in production, these would come from your backend analytics
  const keyTrends = [
    'Casual wear and summer items showing strong sales across stores',
    'Customer service satisfaction remains high'
  ];
  
  // Format date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };
  
  return (
    <Card className="lg:col-span-2 transition-all hover:shadow-md">
      <CardHeader>
        <CardTitle>Latest Summary</CardTitle>
        <CardDescription>
          AI-generated summary for {formatDate(new Date())}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16 rounded-md" />
              ))}
            </div>
            <Skeleton className="h-4 w-3/4 mt-4" />
            <div className="space-y-2">
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-accent/50 p-3 rounded-md">
                <div className="text-xs text-muted-foreground">Reports</div>
                <div className="text-xl font-medium">{reportsSubmitted}/{totalStores}</div>
              </div>
              <div className="bg-accent/50 p-3 rounded-md">
                <div className="text-xs text-muted-foreground">Avg Sales</div>
                <div className="text-xl font-medium">${averageSales.toLocaleString()}</div>
              </div>
              <div className="bg-accent/50 p-3 rounded-md col-span-2">
                <div className="text-xs text-muted-foreground">Top Store</div>
                <div className="text-xl font-medium truncate">{topPerformingStore}</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium flex items-center mb-2">
                <TrendingUp size={16} className="mr-2" />
                Key Trends
              </h4>
              <ul className="space-y-2">
                {keyTrends.map((trend, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <Badge variant="outline" className="mt-0.5 h-5 w-5 flex items-center justify-center rounded-full p-0 text-xs">
                      {index + 1}
                    </Badge>
                    <span className="text-sm">{trend}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button size="sm" className="w-full" asChild>
          <Link to="/summaries">View Full Summary</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default LatestSummary;
