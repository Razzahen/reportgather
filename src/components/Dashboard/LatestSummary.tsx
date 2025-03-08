
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { getReports } from '@/services/reportService';
import { getStores } from '@/services/storeService';
import { Skeleton } from '@/components/ui/skeleton';
import { generateAISummary } from '@/services/aiSummaryService';
import { useState, useEffect } from 'react';

export function LatestSummary() {
  const [summary, setSummary] = useState<string>('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  
  const { data: reports = [], isLoading: reportsLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: getReports
  });
  
  const { data: stores = [], isLoading: storesLoading } = useQuery({
    queryKey: ['stores'],
    queryFn: getStores
  });
  
  const isLoading = reportsLoading || storesLoading;
  
  // Filter reports from today
  const todayReports = reports.filter(report => {
    const reportDate = new Date(report.submitted_at);
    const today = new Date();
    return reportDate.setHours(0,0,0,0) === today.setHours(0,0,0,0);
  });
  
  const reportsSubmitted = todayReports.length;
  const totalStores = stores.length;
  
  // Generate a summary when data is loaded
  useEffect(() => {
    if (!isLoading && reports.length > 0 && stores.length > 0 && !summary && !isGeneratingSummary) {
      generateDailySummary();
    }
  }, [isLoading, reports, stores, summary]);
  
  const generateDailySummary = async () => {
    // Don't generate if no reports or already generating
    if (reports.length === 0 || isGeneratingSummary) return;
    
    setIsGeneratingSummary(true);
    
    try {
      // Use the last 5 days of reports for context
      const recentReports = reports
        .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())
        .slice(0, 10);
      
      const prompt = `Please provide a very brief summary (2-3 bullet points) of the most important insights from the most recent store reports. Focus only on key highlights.`;
      
      const response = await generateAISummary(
        [{ role: 'user', content: prompt }],
        stores,
        recentReports,
        'summary'
      );
      
      setSummary(response.content);
    } catch (error) {
      console.error('Error generating summary:', error);
      setSummary('Unable to generate summary at this time. Please check the Summaries page for detailed insights.');
    } finally {
      setIsGeneratingSummary(false);
    }
  };
  
  // Format date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };
  
  // Extract bullet points from the summary
  const extractBulletPoints = (text: string): string[] => {
    if (!text) return [];
    
    // Try to extract markdown list items or numbered items
    const bulletRegex = /[-*]\s+([^\n]+)/g;
    const numberedRegex = /\d+\.\s+([^\n]+)/g;
    
    const bulletMatches = [...text.matchAll(bulletRegex)].map(match => match[1]);
    const numberedMatches = [...text.matchAll(numberedRegex)].map(match => match[1]);
    
    const combined = [...bulletMatches, ...numberedMatches];
    
    // If no bullet points found, split by newlines and take non-empty lines
    if (combined.length === 0) {
      return text
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .slice(0, 3);
    }
    
    return combined;
  };
  
  const bulletPoints = extractBulletPoints(summary);
  
  return (
    <Card className="lg:col-span-2 transition-all hover:shadow-md">
      <CardHeader>
        <CardTitle>Latest Summary</CardTitle>
        <CardDescription>
          AI-generated summary for {formatDate(new Date())}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading || isGeneratingSummary ? (
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
                <div className="text-xs text-muted-foreground">Stores</div>
                <div className="text-xl font-medium">{stores.length}</div>
              </div>
              <div className="bg-accent/50 p-3 rounded-md col-span-2">
                <div className="text-xs text-muted-foreground">Reports Analyzed</div>
                <div className="text-xl font-medium">{reports.length}</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium flex items-center mb-2">
                <TrendingUp size={16} className="mr-2" />
                Key Insights
              </h4>
              <ul className="space-y-2">
                {bulletPoints.length > 0 ? (
                  bulletPoints.slice(0, 3).map((point, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Badge variant="outline" className="mt-0.5 h-5 w-5 flex items-center justify-center rounded-full p-0 text-xs">
                        {index + 1}
                      </Badge>
                      <span className="text-sm">{point}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-muted-foreground">
                    No recent reports available for analysis. Submit store reports to see insights here.
                  </li>
                )}
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
