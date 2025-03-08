
import { Link } from 'react-router-dom';
import { BarChart2, ClipboardList, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DashboardStats from './DashboardStats';
import RecentTemplates from './RecentTemplates';
import LatestSummary from './LatestSummary';
import PendingReportsCard from './PendingReportsCard';

export function CEODashboard() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6 md:p-8">
        <div className="max-w-3xl">
          <div className="chip bg-primary/20 text-primary mb-4">Dashboard</div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">Welcome to RetailReports</h1>
          <p className="text-muted-foreground md:text-lg mb-6">
            Create and manage report templates, monitor store submissions, and generate AI-powered insights.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/templates/create">
                <Plus size={16} className="mr-2" />
                Create Template
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/summaries">
                <BarChart2 size={16} className="mr-2" />
                View Summaries
              </Link>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Stats Overview */}
      <DashboardStats />
      
      {/* Recent Activity and Summaries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentTemplates />
        <LatestSummary />
      </div>
      
      {/* Pending Reports Section */}
      <PendingReportsCard />
    </div>
  );
}

export default CEODashboard;
