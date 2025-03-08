
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
    
    // Enhanced extraction of report data with special attention to answers
    const reportData = reports.map(report => {
      // Extract relevant information from each report, carefully handling answers
      let answers = [];
      
      // Only process answers if they exist and are not empty
      if (report.answers && Array.isArray(report.answers) && report.answers.length > 0) {
        answers = report.answers.map(answer => {
          // Ensure we have valid question data
          const questionText = answer.question?.text || 'Unknown question';
          const questionType = answer.question?.type || 'text';
          
          // Format the answer value based on its type for better readability
          let formattedValue = answer.value;
          
          // If the value is undefined or null, provide a placeholder
          if (formattedValue === undefined || formattedValue === null) {
            formattedValue = 'No answer provided';
          }
          
          // If it's an object or array, stringify it for clarity
          if (typeof formattedValue === 'object') {
            formattedValue = JSON.stringify(formattedValue);
          }
          
          return {
            question: questionText,
            question_type: questionType,
            answer: formattedValue,
          };
        });
      } else {
        // Log warning if no answers found for debugging
        console.warn(`No answers found for report ID: ${report.id}`);
      }
      
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
    
    // Log the data being sent for debugging
    console.log('Reports being sent to AI summary:', reportData);
    
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
