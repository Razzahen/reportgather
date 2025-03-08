
import { supabase } from '@/integrations/supabase/client';
import { Report, ReportAnswer } from '@/types/supabase';

export const getReports = async (): Promise<Report[]> => {
  const { data, error } = await supabase
    .from('reports')
    .select(`
      *,
      store:stores(*),
      template:templates(*)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching reports:', error);
    throw error;
  }

  return data || [];
};

export const getReportsByStore = async (storeId: string): Promise<Report[]> => {
  const { data, error } = await supabase
    .from('reports')
    .select(`
      *,
      store:stores(*),
      template:templates(*)
    `)
    .eq('store_id', storeId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching reports for store:', error);
    throw error;
  }

  return data || [];
};

export const getReportWithAnswers = async (id: string): Promise<Report | null> => {
  // First get the report
  const { data: report, error: reportError } = await supabase
    .from('reports')
    .select(`
      *,
      store:stores(*),
      template:templates(*)
    `)
    .eq('id', id)
    .single();

  if (reportError) {
    console.error('Error fetching report:', reportError);
    throw reportError;
  }

  if (!report) return null;

  // Then get the answers with their questions
  const { data: answers, error: answersError } = await supabase
    .from('report_answers')
    .select(`
      *,
      question:questions(*)
    `)
    .eq('report_id', id);

  if (answersError) {
    console.error('Error fetching report answers:', answersError);
    throw answersError;
  }

  return {
    ...report,
    answers: answers || []
  };
};

export const createReport = async (
  report: Omit<Report, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'submitted_at'>,
  answers: Omit<ReportAnswer, 'id' | 'report_id' | 'created_at' | 'updated_at'>[]
): Promise<Report> => {
  // First create the report
  const { data: reportData, error: reportError } = await supabase
    .from('reports')
    .insert({
      template_id: report.template_id,
      store_id: report.store_id,
      completed: report.completed
    })
    .select()
    .single();

  if (reportError) {
    console.error('Error creating report:', reportError);
    throw reportError;
  }

  // Then create the answers
  if (answers.length > 0) {
    const answersToInsert = answers.map(a => ({
      report_id: reportData.id,
      question_id: a.question_id,
      value: a.value
    }));

    const { error: answersError } = await supabase
      .from('report_answers')
      .insert(answersToInsert);

    if (answersError) {
      console.error('Error creating report answers:', answersError);
      throw answersError;
    }
  }

  return reportData;
};

export const updateReport = async (
  id: string,
  report: Partial<Omit<Report, 'id' | 'created_at' | 'updated_at' | 'user_id'>>,
  answers?: Omit<ReportAnswer, 'report_id' | 'created_at' | 'updated_at'>[]
): Promise<Report> => {
  // First update the report
  const { data: reportData, error: reportError } = await supabase
    .from('reports')
    .update({
      ...report,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (reportError) {
    console.error('Error updating report:', reportError);
    throw reportError;
  }

  // If answers are provided, update them
  if (answers && answers.length > 0) {
    // Delete existing answers
    const { error: deleteError } = await supabase
      .from('report_answers')
      .delete()
      .eq('report_id', id);

    if (deleteError) {
      console.error('Error deleting existing answers:', deleteError);
      throw deleteError;
    }

    // Insert new answers
    const answersToInsert = answers.map(a => ({
      report_id: id,
      question_id: a.question_id,
      value: a.value
    }));

    const { error: answersError } = await supabase
      .from('report_answers')
      .insert(answersToInsert);

    if (answersError) {
      console.error('Error updating report answers:', answersError);
      throw answersError;
    }
  }

  return reportData;
};

export const deleteReport = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('reports')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting report:', error);
    throw error;
  }
};

export const generateSummary = async (date: string): Promise<any> => {
  // This would typically call a custom Supabase function
  // For now, we'll return mock data similar to what's in mockData.ts
  return {
    date: new Date(date),
    totalStores: 5,
    reportsSubmitted: 2,
    averageSales: 10550,
    topPerformingStore: 'Westfield Mall',
    keyTrends: [
      'Casual wear and summer items showing strong sales across stores',
      'Customer service satisfaction remains high',
      'Morning hours significantly outperforming afternoon hours',
      'Accessories and add-on items driving up average transaction value'
    ],
    recommendations: [
      'Consider extending morning staff hours to capitalize on peak traffic',
      'Implement cross-store inventory sharing to address stock issues',
      'Provide additional training on new product lines launching next week'
    ]
  };
};
