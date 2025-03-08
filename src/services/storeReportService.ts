
import { useQuery } from '@tanstack/react-query';
import { getStores } from './storeService';
import { getReports, getReportsByStoreId } from './reportService';
import { Store, Report } from '@/types/supabase';

export const useStoreReportsData = () => {
  // Get all stores
  const { 
    data: stores = [], 
    isLoading: storesLoading,
    error: storesError 
  } = useQuery({
    queryKey: ['stores'],
    queryFn: getStores
  });

  // Get all reports
  const { 
    data: reports = [], 
    isLoading: reportsLoading,
    error: reportsError 
  } = useQuery({
    queryKey: ['reports'],
    queryFn: getReports
  });

  const isLoading = storesLoading || reportsLoading;
  const error = storesError || reportsError;

  // Process data to get store report status
  const storeReports = stores.map(store => {
    const storeReport = reports.find(r => r.store_id === store.id);
    return {
      store,
      report: storeReport,
      isSubmitted: !!storeReport
    };
  });

  return {
    storeReports,
    isLoading,
    error
  };
};

export const useStoreReport = (storeId: string) => {
  return useQuery({
    queryKey: ['store-reports', storeId],
    queryFn: () => getReportsByStoreId(storeId),
    enabled: !!storeId
  });
};
