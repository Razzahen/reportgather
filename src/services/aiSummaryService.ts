
import { supabase } from '@/integrations/supabase/client';
import { Report, Store } from '@/types/supabase';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface SummaryResponse {
  message: ChatMessage;
}

export const generateAISummary = async (
  messages: ChatMessage[],
  stores: Store[],
  reports: Report[],
  mode: 'summary' | 'chat' = 'summary'
): Promise<ChatMessage> => {
  try {
    // Prepare store and report data in a format suitable for the AI
    const storeData = stores.map(store => ({
      id: store.id,
      name: store.name,
      location: store.location,
      manager: store.manager
    }));
    
    const reportData = reports.map(report => {
      // Extract relevant information from each report
      const answers = report.answers?.map(answer => ({
        question: answer.question?.text || 'Unknown question',
        question_type: answer.question?.type || 'text',
        answer: answer.value,
      })) || [];
      
      return {
        id: report.id,
        store_id: report.store_id,
        store_name: report.store?.name || 'Unknown store',
        submitted_at: report.submitted_at,
        template_name: report.template?.title || 'Unknown template',
        answers: answers,
        completed: report.completed
      };
    });
    
    // Add some basic analytics to help the AI
    const reportAnalytics = {
      totalReports: reports.length,
      completedReports: reports.filter(r => r.completed).length,
      storesWithReports: [...new Set(reports.map(r => r.store_id))].length,
      reportsByStore: Object.fromEntries(
        stores.map(store => [
          store.name,
          reports.filter(r => r.store_id === store.id).length
        ])
      )
    };
    
    // Call our Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('ai-summary', {
      body: {
        messages,
        storeData,
        reportData,
        reportAnalytics,
        mode
      }
    });
    
    if (error) {
      console.error('Error generating AI summary:', error);
      throw error;
    }
    
    return (data as SummaryResponse).message;
  } catch (error) {
    console.error('Error in generateAISummary:', error);
    throw error;
  }
};
