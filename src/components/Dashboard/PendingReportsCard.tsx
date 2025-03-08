
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getReports } from '@/services/reportService';
import { getStores } from '@/services/storeService';

export function PendingReportsCard() {
  const { data: reports = [] } = useQuery({
    queryKey: ['reports'],
    queryFn: getReports
  });
  
  const { data: stores = [] } = useQuery({
    queryKey: ['stores'],
    queryFn: getStores
  });
  
  // Calculate pending reports
  const todayReports = reports.filter(report => {
    const reportDate = new Date(report.submitted_at);
    const today = new Date();
    return reportDate.setHours(0,0,0,0) === today.setHours(0,0,0,0);
  });
  
  const pendingReports = stores.length - todayReports.length;
  
  if (pendingReports <= 0) {
    return null;
  }
  
  return (
    <Card className="border-amber-200 bg-amber-50/50">
      <CardHeader>
        <CardTitle className="text-amber-800 flex items-center">
          <Calendar className="mr-2 h-5 w-5" />
          Pending Reports
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-amber-700">
          {pendingReports} stores haven't submitted their reports for today.
        </p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" className="border-amber-200 text-amber-800" asChild>
          <Link to="/reports">View Reports</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default PendingReportsCard;
