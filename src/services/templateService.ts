
import { supabase } from '@/integrations/supabase/client';
import { Template, Question } from '@/types/supabase';

export const getTemplates = async (): Promise<Template[]> => {
  // Fetch templates along with their questions count
  const { data, error } = await supabase
    .from('templates')
    .select(`
      *,
      questions:questions(*)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching templates:', error);
    throw error;
  }

  return data || [];
};

export const getTemplateWithQuestions = async (id: string): Promise<Template | null> => {
  // First get the template
  const { data: template, error: templateError } = await supabase
    .from('templates')
    .select('*')
    .eq('id', id)
    .single();

  if (templateError) {
    console.error('Error fetching template:', templateError);
    throw templateError;
  }

  if (!template) return null;

  // Then get the questions
  const { data: questions, error: questionsError } = await supabase
    .from('questions')
    .select('*')
    .eq('template_id', id)
    .order('order_index');

  if (questionsError) {
    console.error('Error fetching questions:', questionsError);
    throw questionsError;
  }

  // Convert JSONB options to string array
  const processedQuestions = questions.map(q => ({
    ...q,
    options: q.options ? (q.options as string[]) : null
  }));

  return {
    ...template,
    questions: processedQuestions
  };
};

export const createTemplate = async (
  template: Omit<Template, 'id' | 'created_at' | 'updated_at' | 'user_id'>,
  questions: Omit<Question, 'id' | 'template_id' | 'created_at'>[]
): Promise<Template> => {
  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    throw new Error('You must be logged in to create a template');
  }
  
  console.log('Creating template with user ID:', session.user.id);
  
  // Start a transaction
  const { data, error } = await supabase.rpc('create_template_with_questions', {
    template_title: template.title,
    template_description: template.description,
    questions_data: questions.map((q, index) => ({
      text: q.text,
      type: q.type,
      required: q.required,
      options: q.options,
      order_index: index
    }))
  });

  if (error) {
    console.error('Error creating template:', error);
    
    // If the stored procedure doesn't exist, fall back to manual transaction
    // First create the template
    const { data: templateData, error: templateError } = await supabase
      .from('templates')
      .insert({
        title: template.title,
        description: template.description,
        user_id: session.user.id // Explicitly set the user_id here
      })
      .select()
      .single();

    if (templateError) {
      console.error('Error creating template:', templateError);
      throw templateError;
    }

    // Then create the questions
    const questionsToInsert = questions.map((q, index) => ({
      template_id: templateData.id,
      text: q.text,
      type: q.type,
      required: q.required,
      options: q.options,
      order_index: index
    }));

    const { data: questionsData, error: questionsError } = await supabase
      .from('questions')
      .insert(questionsToInsert)
      .select();

    if (questionsError) {
      console.error('Error creating questions:', questionsError);
      throw questionsError;
    }

    return {
      ...templateData,
      questions: questionsData
    };
  }

  return data;
};

export const updateTemplate = async (
  id: string, 
  template: Partial<Omit<Template, 'id' | 'created_at' | 'updated_at' | 'user_id'>>,
  questions?: Omit<Question, 'template_id' | 'created_at'>[]
): Promise<Template> => {
  // First update the template
  const { data: templateData, error: templateError } = await supabase
    .from('templates')
    .update({ 
      ...template, 
      updated_at: new Date().toISOString() 
    })
    .eq('id', id)
    .select()
    .single();

  if (templateError) {
    console.error('Error updating template:', templateError);
    throw templateError;
  }

  // If questions are provided, update them
  if (questions && questions.length > 0) {
    // Delete existing questions
    const { error: deleteError } = await supabase
      .from('questions')
      .delete()
      .eq('template_id', id);

    if (deleteError) {
      console.error('Error deleting existing questions:', deleteError);
      throw deleteError;
    }

    // Insert new questions
    const questionsToInsert = questions.map((q, index) => ({
      id: q.id, // Keep existing ID if available
      template_id: id,
      text: q.text,
      type: q.type,
      required: q.required,
      options: q.options,
      order_index: index
    }));

    const { data: questionsData, error: questionsError } = await supabase
      .from('questions')
      .insert(questionsToInsert)
      .select();

    if (questionsError) {
      console.error('Error updating questions:', questionsError);
      throw questionsError;
    }

    return {
      ...templateData,
      questions: questionsData
    };
  }

  return templateData;
};

export const deleteTemplate = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('templates')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting template:', error);
    throw error;
  }
};
