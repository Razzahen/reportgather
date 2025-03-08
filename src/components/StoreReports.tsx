
import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Store, Report, Template } from '@/types/supabase';
import { getStores } from '@/services/storeService';
import { getReports } from '@/services/reportService';
import { getTemplates } from '@/services/templateService';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { StoreCard } from './store-reports/StoreCard';
import { StoreRow } from './store-reports/StoreRow';
import { StoreFilter } from './store-reports/StoreFilter';

export function StoreReports() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  const { 
    data: stores = [], 
    isLoading: isLoadingStores,
    error: storesError,
    refetch: refetchStores
  } = useQuery({
    queryKey: ['stores'],
    queryFn: getStores
  });
  
  const { 
    data: reports = [], 
    isLoading: isLoadingReports,
    error: reportsError,
    refetch: refetchReports
  } = useQuery({
    queryKey: ['reports'],
    queryFn: getReports
  });
  
  const { 
    data: templates = [], 
    isLoading: isLoadingTemplates,
    error: templatesError,
    refetch: refetchTemplates
  } = useQuery({
    queryKey: ['templates'],
    queryFn: getTemplates
  });
  
  useEffect(() => {
    if (storesError) {
      console.error('Error fetching stores:', storesError);
      toast.error('Failed to load stores');
    }
    
    if (reportsError) {
      console.error('Error fetching reports:', reportsError);
      toast.error('Failed to load reports');
    }
    
    if (templatesError) {
      console.error('Error fetching templates:', templatesError);
      toast.error('Failed to load templates');
    }
  }, [storesError, reportsError, templatesError]);
  
  // Function to refresh data after template assignment
  const handleTemplateAssigned = () => {
    // Refresh the reports and templates data
    refetchReports();
    refetchTemplates();
  };
  
  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  };
  
  const filteredStores = stores
    .filter(store => {
      if (searchTerm) {
        return (
          store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          store.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          store.manager.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      return true;
    })
    .filter(store => {
      if (statusFilter === 'all') return true;
      
      const storeReport = reports.find(r => r.store_id === store.id);
      return statusFilter === 'completed' ? (storeReport?.completed || false) : !(storeReport?.completed || false);
    })
    .sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      
      if (sortOrder === 'asc') {
        return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
      } else {
        return nameA > nameB ? -1 : nameA < nameB ? 1 : 0;
      }
    });
  
  const today = formatDate(new Date().toISOString());
  const isLoading = isLoadingStores || isLoadingReports || isLoadingTemplates;
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Store Reports</h1>
        <p className="text-muted-foreground">
          Monitor and manage daily report submissions from all stores
        </p>
      </div>
      
      <StoreFilter 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
      />
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-xl">
            <Calendar className="h-5 w-5 mr-2" />
            Today's Reports <span className="ml-2 text-muted-foreground font-normal text-sm">{today}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Tabs defaultValue="grid" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="grid">Grid View</TabsTrigger>
                <TabsTrigger value="list">List View</TabsTrigger>
              </TabsList>

              <TabsContent value="grid" className="space-y-4">
                {filteredStores.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No stores match your filter criteria
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredStores.map((store) => {
                      const storeReport = reports.find(r => r.store_id === store.id);
                      const template = storeReport ? 
                        templates.find(t => t.id === storeReport.template_id) : 
                        undefined;
                      
                      return (
                        <StoreCard 
                          key={store.id} 
                          store={store} 
                          storeReport={storeReport}
                          template={template}
                          templates={templates}
                          isLoadingTemplates={isLoadingTemplates}
                          onTemplateAssigned={handleTemplateAssigned}
                        />
                      );
                    })}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="list">
                <div className="rounded-md border overflow-hidden">
                  <div className="grid grid-cols-12 border-b bg-muted/50 px-4 py-3 text-sm font-medium">
                    <div className="col-span-4 hidden md:block">Store</div>
                    <div className="hidden md:block md:col-span-2">Manager</div>
                    <div className="hidden md:block md:col-span-2">Template</div>
                    <div className="hidden md:block md:col-span-2">Status</div>
                    <div className="hidden md:block md:col-span-2 text-right">Actions</div>
                    <div className="col-span-12 md:hidden">Stores</div>
                  </div>
                  
                  <div className="max-h-[600px] overflow-y-auto">
                    {filteredStores.length === 0 ? (
                      <div className="px-4 py-8 text-center text-muted-foreground">
                        No stores match your filter criteria
                      </div>
                    ) : (
                      filteredStores.map((store) => {
                        const storeReport = reports.find(r => r.store_id === store.id);
                        const template = storeReport ? 
                          templates.find(t => t.id === storeReport.template_id) : 
                          undefined;
                        
                        return (
                          <StoreRow 
                            key={store.id} 
                            store={store} 
                            storeReport={storeReport}
                            template={template}
                            templates={templates}
                            isLoadingTemplates={isLoadingTemplates}
                            onTemplateAssigned={handleTemplateAssigned}
                          />
                        );
                      })
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default StoreReports;
