import { supabase } from '@/integrations/supabase/client';
import { Store } from '@/types/supabase';

export const getStores = async (): Promise<Store[]> => {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching stores:', error);
    throw error;
  }

  return data || [];
};

export const getStore = async (id: string): Promise<Store | null> => {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching store:', error);
    throw error;
  }

  return data;
};

export const createStore = async (store: Omit<Store, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<Store> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be logged in to create a store');
  }
  
  const { data, error } = await supabase
    .from('stores')
    .insert({
      ...store,
      user_id: user.id
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating store:', error);
    throw error;
  }

  return data;
};

export const updateStore = async (id: string, store: Partial<Omit<Store, 'id' | 'created_at' | 'updated_at' | 'user_id'>>): Promise<Store> => {
  const { data, error } = await supabase
    .from('stores')
    .update(store)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating store:', error);
    throw error;
  }

  return data;
};

export const deleteStore = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('stores')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting store:', error);
    throw error;
  }
};

export const assignTemplateToStore = async (storeId: string, templateId: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be logged in to assign a template');
  }
  
  const { data: existingReports } = await supabase
    .from('reports')
    .select('id')
    .eq('store_id', storeId)
    .limit(1);
  
  if (existingReports && existingReports.length > 0) {
    const { error: updateError } = await supabase
      .from('reports')
      .update({
        template_id: templateId,
        updated_at: new Date().toISOString(),
      })
      .eq('store_id', storeId);
    
    if (updateError) {
      console.error('Error updating report template:', updateError);
      throw updateError;
    }
  } else {
    const { error: insertError } = await supabase
      .from('reports')
      .insert({
        store_id: storeId,
        template_id: templateId,
        user_id: user.id,
        completed: false,
        submitted_at: null,
      });
    
    if (insertError) {
      console.error('Error creating report with template:', insertError);
      throw insertError;
    }
  }
}
