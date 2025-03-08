import { supabase } from '@/integrations/supabase/client';
import { Report, ReportAnswer } from '@/types/supabase';

export const getReports = async (): Promise<Report[]> => {
  // First fetch all reports with their related store and template data
  const { data: reports, error: reportsError } = await supabase
    .from('reports')
    .select('*, store:stores(*), template:templates(*)')
    .order('created_at', { ascending: false });

  if (reportsError) {
    console.error('Error fetching reports:', reportsError);
    throw reportsError;
  }

  if (!reports || reports.length === 0) {
    return [];
  }

  // Now fetch all answers for these reports in a single query
  const reportIds = reports.map(report => report.id);
  
  const { data: allAnswers, error: answersError } = await supabase
    .from('report_answers')
    .select('*, question:questions(*)')
    .in('report_id', reportIds);

  if (answersError) {
    console.error('Error fetching report answers:', answersError);
    throw answersError;
  }

  // Map answers to their respective reports
  const reportsWithAnswers = reports.map(report => {
    const reportAnswers = allAnswers ? allAnswers.filter(answer => answer.report_id === report.id) : [];
    
    console.log(`Report ${report.id} has ${reportAnswers.length} answers`);
    
    return {
      ...report,
      answers: reportAnswers
    };
  });

  return reportsWithAnswers;
};

export const getReportById = async (id: string): Promise<Report | null> => {
  const { data: report, error: reportError } = await supabase
    .from('reports')
    .select('*, store:stores(*), template:templates(*)')
    .eq('id', id)
    .single();

  if (reportError) {
    console.error('Error fetching report:', reportError);
    throw reportError;
  }

  if (!report) return null;

  // Fetch answers for this report
  const { data: answers, error: answersError } = await supabase
    .from('report_answers')
    .select('*, question:questions(*)')
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

export const getReportsByStoreId = async (storeId: string): Promise<Report[]> => {
  const { data, error } = await supabase
    .from('reports')
    .select('*, template:templates(*)')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching reports by store id:', error);
    throw error;
  }

  return data || [];
};

export const createReport = async (
  report: Omit<Report, 'id' | 'created_at' | 'updated_at' | 'user_id'>,
  answers: Omit<ReportAnswer, 'id' | 'report_id' | 'created_at' | 'updated_at'>[]
): Promise<Report> => {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be logged in to create a report');
  }
  
  // Start a transaction
  const { data: reportData, error: reportError } = await supabase
    .from('reports')
    .insert({
      template_id: report.template_id,
      store_id: report.store_id,
      submitted_at: report.submitted_at,
      completed: report.completed,
      user_id: user.id // Set the user_id to the current user's ID
    })
    .select()
    .single();

  if (reportError) {
    console.error('Error creating report:', reportError);
    throw reportError;
  }

  if (answers.length > 0) {
    // Create answers for the report
    const answersToInsert = answers.map(answer => ({
      report_id: reportData.id,
      question_id: answer.question_id,
      value: answer.value
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
  // Update report
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
    const answersToInsert = answers.map(answer => ({
      report_id: id,
      question_id: answer.question_id,
      value: answer.value
      // Remove the id property if it exists since it might be undefined
      // We'll let Supabase generate a new UUID for each answer
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
  // Delete report (answers will cascade)
  const { error } = await supabase
    .from('reports')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting report:', error);
    throw error;
  }
};
