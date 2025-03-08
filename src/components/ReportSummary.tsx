
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getReports } from '@/services/reportService';
import { getStores } from '@/services/storeService';
import { ChatInterface } from './AI/ChatInterface';
import { SummaryFilters } from './AI/SummaryFilters';
import { StoreFilter } from '@/types/chat';
import { subDays } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const ReportSummary = () => {
  // Get current date and 7 days ago for default filter
  const today = new Date();
  const sevenDaysAgo = subDays(today, 7);
  
  // State for filters
  const [filter, setFilter] = useState<StoreFilter>({
    storeIds: 'all',
    dateRange: {
      from: sevenDaysAgo,
      to: today,
    },
  });
  
  // State to track when to generate a new summary
  const [shouldGenerateSummary, setShouldGenerateSummary] = useState(false);
  const [summaryPrompt, setSummaryPrompt] = useState<string>('');
  
  // Fetch stores and reports
  const { data: stores = [], isLoading: storesLoading, error: storesError } = useQuery({
    queryKey: ['stores'],
    queryFn: getStores,
  });
  
  const { data: allReports = [], isLoading: reportsLoading, error: reportsError } = useQuery({
    queryKey: ['reports'],
    queryFn: getReports,
  });
  
  // Filter reports based on selected stores and date range
  const filteredReports = allReports.filter(report => {
    const reportDate = new Date(report.submitted_at);
    const isInDateRange = reportDate >= filter.dateRange.from && reportDate <= filter.dateRange.to;
    
    const isSelectedStore = 
      filter.storeIds === 'all' || 
      (Array.isArray(filter.storeIds) && filter.storeIds.includes(report.store_id));
    
    return isInDateRange && isSelectedStore;
  });
  
  // Generate summary when filters are applied
  useEffect(() => {
    if (shouldGenerateSummary) {
      // Create prompt based on filter selection
      const storeNames = filter.storeIds === 'all'
        ? 'all stores'
        : stores
            .filter(store => (filter.storeIds as string[]).includes(store.id))
            .map(store => store.name)
            .join(', ');
      
      const fromDate = filter.dateRange.from.toLocaleDateString();
      const toDate = filter.dateRange.to.toLocaleDateString();
      
      const prompt = `Please analyze the reports from ${storeNames} between ${fromDate} and ${toDate}. 
        Provide a summary of key insights, trends, and notable issues. 
        Focus on patterns across multiple stores if applicable, and highlight any critical information.`;
      
      setSummaryPrompt(prompt);
      setShouldGenerateSummary(false);
    }
  }, [shouldGenerateSummary, filter, stores]);
  
  // Handle filter application
  const handleApplyFilters = () => {
    setShouldGenerateSummary(true);
  };
  
  const isLoading = storesLoading || reportsLoading;
  const hasError = storesError || reportsError;
  
  if (hasError) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load data. Please try refreshing the page or contact support.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight mb-2">Report Summaries</h1>
        <p className="text-muted-foreground">
          Get AI-powered insights from your store reports
        </p>
      </div>
      
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-[100px] w-full rounded-md" />
          <Skeleton className="h-[500px] w-full rounded-md" />
        </div>
      ) : (
        <>
          <SummaryFilters 
            stores={stores} 
            filter={filter} 
            onFilterChange={setFilter} 
            onApplyFilters={handleApplyFilters}
          />
          
          {filteredReports.length === 0 ? (
            <Alert className="my-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>No reports found</AlertTitle>
              <AlertDescription>
                No reports were found for the selected filters. Try selecting a different date range or stores.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {summaryPrompt ? (
                <ChatInterface 
                  stores={stores}
                  reports={filteredReports}
                  storeFilter={filter}
                  initialMessage={summaryPrompt}
                />
              ) : (
                <div className="text-center p-12 bg-muted rounded-lg">
                  <h3 className="text-lg font-medium mb-2">Select Filters to Generate Summary</h3>
                  <p className="text-muted-foreground">
                    Use the filters above to select stores and date range, then click "Apply Filters" to generate an AI summary.
                  </p>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ReportSummary;
