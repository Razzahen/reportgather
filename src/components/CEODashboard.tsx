
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart2, 
  ClipboardList, 
  FileText, 
  Plus, 
  Store, 
  TrendingUp, 
  Calendar
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { mockTemplates, mockReports, mockStores, mockSummary } from '@/utils/mockData';

export function CEODashboard() {
  // Format date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  // Calculate stats
  const pendingReports = mockStores.length - mockReports.length;
  const completionRate = Math.round((mockReports.length / mockStores.length) * 100);
  
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-white to-secondary/50 transition-all hover:shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-2xl font-semibold">{mockTemplates.length}</div>
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
              <div className="text-2xl font-semibold">{mockStores.length}</div>
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
              <div className="text-2xl font-semibold">{mockReports.length}/{mockStores.length}</div>
              <FileText className="text-primary h-8 w-8 opacity-80" />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {completionRate}% completion rate
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-white to-secondary/50 transition-all hover:shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Daily Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-2xl font-semibold">{mockSummary.keyTrends.length}</div>
              <TrendingUp className="text-primary h-8 w-8 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Activity and Summaries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Templates */}
        <Card className="lg:col-span-1 transition-all hover:shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recent Templates</span>
              <Button variant="ghost" size="icon" asChild>
                <Link to="/templates">
                  <Plus size={16} />
                </Link>
              </Button>
            </CardTitle>
            <CardDescription>Recently created report templates</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {mockTemplates.map((template) => (
                <li key={template.id} className="flex items-start space-x-3 p-3 rounded-md bg-accent/50">
                  <ClipboardList className="h-5 w-5 mt-0.5 text-primary" />
                  <div>
                    <h4 className="font-medium">{template.title}</h4>
                    <p className="text-xs text-muted-foreground">{formatDate(template.created)}</p>
                    <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{template.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link to="/templates">View All Templates</Link>
            </Button>
          </CardFooter>
        </Card>
        
        {/* Latest Summary */}
        <Card className="lg:col-span-2 transition-all hover:shadow-md">
          <CardHeader>
            <CardTitle>Latest Summary</CardTitle>
            <CardDescription>
              AI-generated summary for {formatDate(mockSummary.date)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-accent/50 p-3 rounded-md">
                  <div className="text-xs text-muted-foreground">Reports</div>
                  <div className="text-xl font-medium">{mockSummary.reportsSubmitted}/{mockSummary.totalStores}</div>
                </div>
                <div className="bg-accent/50 p-3 rounded-md">
                  <div className="text-xs text-muted-foreground">Avg Sales</div>
                  <div className="text-xl font-medium">${mockSummary.averageSales.toLocaleString()}</div>
                </div>
                <div className="bg-accent/50 p-3 rounded-md col-span-2">
                  <div className="text-xs text-muted-foreground">Top Store</div>
                  <div className="text-xl font-medium truncate">{mockSummary.topPerformingStore}</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium flex items-center mb-2">
                  <TrendingUp size={16} className="mr-2" />
                  Key Trends
                </h4>
                <ul className="space-y-2">
                  {mockSummary.keyTrends.slice(0, 2).map((trend, index) => (
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
          </CardContent>
          <CardFooter>
            <Button size="sm" className="w-full" asChild>
              <Link to="/summaries">View Full Summary</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Pending Reports Section */}
      {pendingReports > 0 && (
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
      )}
    </div>
  );
}

export default CEODashboard;
