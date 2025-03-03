
import { BarChart3, Calendar, Download, Lightbulb, Store, TrendingUp, ShoppingBag, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { mockSummary, mockStores, mockReports } from '@/utils/mockData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function ReportSummary() {
  // Format date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };
  
  // Mock sales data for chart
  const salesData = [
    { store: 'Downtown', sales: 8750 },
    { store: 'Westfield', sales: 12350 },
    { store: 'River Park', sales: 9200 },
    { store: 'Eastside', sales: 7300 },
    { store: 'Northern', sales: 11100 },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <div className="chip bg-primary/10 text-primary mb-2">AI Analysis</div>
          <h1 className="text-3xl font-semibold tracking-tight">Report Summary</h1>
          <p className="text-muted-foreground">
            AI-generated summary and insights for {formatDate(mockSummary.date)}
          </p>
        </div>
        <Button variant="outline">
          <Download size={16} className="mr-2" />
          Export
        </Button>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-white to-secondary/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Reports Submitted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-2xl font-semibold">
                {mockSummary.reportsSubmitted}/{mockSummary.totalStores}
              </div>
              <Store className="text-primary h-8 w-8 opacity-70" />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {(mockSummary.reportsSubmitted / mockSummary.totalStores * 100).toFixed(0)}% completion rate
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-white to-secondary/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-2xl font-semibold">${mockSummary.averageSales.toLocaleString()}</div>
              <ShoppingBag className="text-primary h-8 w-8 opacity-70" />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              +12% from previous day
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-white to-secondary/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Top Performing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-2xl font-semibold truncate pr-2">
                {mockSummary.topPerformingStore}
              </div>
              <TrendingUp className="text-primary h-8 w-8 opacity-70" />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              $12,350 in sales
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-white to-secondary/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Key Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-2xl font-semibold">{mockSummary.keyTrends.length}</div>
              <Lightbulb className="text-primary h-8 w-8 opacity-70" />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              3 actionable recommendations
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="trends" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="trends">Key Trends</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="data">Data Visualization</TabsTrigger>
        </TabsList>
        
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Key Trends and Insights
              </CardTitle>
              <CardDescription>
                AI-generated analysis based on all store reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {mockSummary.keyTrends.map((trend, index) => (
                  <li key={index} className="flex space-x-3">
                    <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-base font-medium">{trend}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Identified in {Math.floor(Math.random() * 3) + 2} store reports
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Performance Outliers
              </CardTitle>
              <CardDescription>
                Stores with significantly higher or lower performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-md bg-green-50 border border-green-100">
                  <h3 className="font-medium text-green-800 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Top Performer: {mockSummary.topPerformingStore}
                  </h3>
                  <p className="text-sm text-green-700 mt-1">
                    Outperformed average by 17% with strong sales in premium categories.
                    Customer satisfaction was particularly high, with zero complaints reported.
                  </p>
                </div>
                
                <div className="p-4 rounded-md bg-amber-50 border border-amber-100">
                  <h3 className="font-medium text-amber-800 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Needs Attention: Eastside Plaza
                  </h3>
                  <p className="text-sm text-amber-700 mt-1">
                    Underperformed by 12% compared to average. Staff shortages and inventory issues
                    were reported as contributing factors.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lightbulb className="h-5 w-5 mr-2" />
                AI Recommendations
              </CardTitle>
              <CardDescription>
                Strategic suggestions based on today's report data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-6">
                {mockSummary.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-base font-medium">{recommendation}</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        This recommendation is based on {Math.floor(Math.random() * 3) + 1} trends 
                        identified across multiple store reports, with a {70 + Math.floor(Math.random() * 25)}% 
                        confidence level.
                      </p>
                      <div className="flex gap-2 mt-3">
                        <Button variant="outline" size="sm">Implement</Button>
                        <Button variant="ghost" size="sm">Dismiss</Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Sales Performance by Store
              </CardTitle>
              <CardDescription>
                Comparative view of today's sales data
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="store" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Historical Context
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Today's average sales of ${mockSummary.averageSales.toLocaleString()} represent 
                  a 12% increase compared to the same day last week, and a 5% increase compared 
                  to the monthly average. This suggests a positive sales trend heading into the 
                  weekend.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Predictive Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Based on current trends, sales are expected to increase by 15-20% over the 
                  weekend, with the strongest performance anticipated at Westfield Mall and 
                  Northern Heights locations. Consider increasing staff at these locations.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ReportSummary;
