
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
  const { data, error } = await supabase
    .from('stores')
    .insert(store)
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
