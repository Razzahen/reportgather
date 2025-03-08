import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckSquare, 
  Clock, 
  FileText, 
  Filter, 
  Search, 
  Store as StoreIcon, 
  Calendar, 
  ArrowUpDown 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Store, Report } from '@/types/supabase';
import { getStores } from '@/services/storeService';
import { getReports } from '@/services/reportService';
import { getTemplates } from '@/services/templateService';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

export function StoreReports() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Fetch data from Supabase
  const { data: stores = [], isLoading: isLoadingStores } = useQuery({
    queryKey: ['stores'],
    queryFn: getStores,
    onSettled: (data, error) => {
      if (error) {
        console.error('Error fetching stores:', error);
        toast.error('Failed to load stores');
      }
    }
  });
  
  const { data: reports = [], isLoading: isLoadingReports } = useQuery({
    queryKey: ['reports'],
    queryFn: getReports,
    onSettled: (data, error) => {
      if (error) {
        console.error('Error fetching reports:', error);
        toast.error('Failed to load reports');
      }
    }
  });
  
  const { data: templates = [], isLoading: isLoadingTemplates } = useQuery({
    queryKey: ['templates'],
    queryFn: getTemplates,
    onSettled: (data, error) => {
      if (error) {
        console.error('Error fetching templates:', error);
        toast.error('Failed to load templates');
      }
    }
  });
  
  // Format date for display
  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  };
  
  // Filter and sort the stores
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
      return statusFilter === 'completed' ? !!storeReport : !storeReport;
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
      
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="relative w-full md:w-auto md:flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search stores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
            <SelectTrigger className="w-full md:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stores</SelectItem>
              <SelectItem value="completed">Completed Reports</SelectItem>
              <SelectItem value="pending">Pending Reports</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" className="w-full sm:w-auto" onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
            <ArrowUpDown className="h-4 w-4 mr-2" />
            {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
          </Button>
        </div>
      </div>
      
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
                      const isSubmitted = !!storeReport;
                      
                      return (
                        <Card 
                          key={store.id} 
                          className={`relative overflow-hidden transition-all hover:shadow-md cursor-pointer border-l-4 ${isSubmitted ? 'border-l-green-500' : 'border-l-amber-500'}`}
                          onClick={() => navigate(`/reports/${store.id}`)}
                        >
                          <CardContent className="p-5">
                            <div className="flex justify-between items-start">
                              <div className="space-y-2">
                                <div className="flex items-center">
                                  <StoreIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                                  <h3 className="font-medium">{store.name}</h3>
                                </div>
                                <p className="text-sm text-muted-foreground">{store.location}</p>
                                <p className="text-xs flex items-center">
                                  Manager: {store.manager}
                                </p>
                              </div>
                              
                              <div className={`p-2 rounded-full ${isSubmitted ? 'bg-green-100' : 'bg-amber-100'}`}>
                                {isSubmitted ? (
                                  <CheckSquare className="h-5 w-5 text-green-600" />
                                ) : (
                                  <Clock className="h-5 w-5 text-amber-600" />
                                )}
                              </div>
                            </div>
                            
                            <div className="mt-4">
                              <div className={`text-sm ${isSubmitted ? 'text-green-600' : 'text-amber-600'} font-medium`}>
                                {isSubmitted ? 'Report Submitted' : 'Report Pending'}
                              </div>
                              
                              {isSubmitted && storeReport && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  Submitted at {new Date(storeReport.submitted_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="list">
                <div className="rounded-md border">
                  <div className="grid grid-cols-12 border-b bg-muted/50 px-4 py-3 text-sm font-medium">
                    <div className="col-span-5">Store</div>
                    <div className="col-span-3">Manager</div>
                    <div className="col-span-2">Template</div>
                    <div className="col-span-2 text-right">Status</div>
                  </div>
                  
                  {filteredStores.length === 0 ? (
                    <div className="px-4 py-8 text-center text-muted-foreground">
                      No stores match your filter criteria
                    </div>
                  ) : (
                    filteredStores.map((store) => {
                      const storeReport = reports.find(r => r.store_id === store.id);
                      const isSubmitted = !!storeReport;
                      const template = storeReport && storeReport.template 
                        ? storeReport.template
                        : templates[0]; // Default template
                      
                      return (
                        <div 
                          key={store.id}
                          className="grid grid-cols-12 items-center border-b px-4 py-3 hover:bg-muted/20 cursor-pointer"
                          onClick={() => navigate(`/reports/${store.id}`)}
                        >
                          <div className="col-span-5 flex items-center">
                            <StoreIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{store.name}</div>
                              <div className="text-xs text-muted-foreground">{store.location}</div>
                            </div>
                          </div>
                          <div className="col-span-3 text-sm">{store.manager}</div>
                          <div className="col-span-2 text-sm flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-primary/60" />
                            {template?.title || 'N/A'}
                          </div>
                          <div className="col-span-2 text-right">
                            {isSubmitted ? (
                              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                                <CheckSquare className="h-3 w-3 mr-1" />
                                Complete
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-amber-100 text-amber-800">
                                <Clock className="h-3 w-3 mr-1" />
                                Pending
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
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
