import { supabase } from '@/lib/supabase/client';
import { Deparment, Project, User } from '@/types/types';
import { create } from 'zustand';

type GlobalState = {
  user: User | null;
  getUser: () => Promise<any>;
  projects: Project[];
  getProjects: () => Promise<any>;
  departments: Deparment[];
  getDepartments: () => Promise<void>;
};

export const useGlobalStore = create<GlobalState>((set) => ({
  user: null,
  getUser: async () => {
    const {
      data: { user: supabaseUser },
    } = await supabase.auth.getUser();

    if (!supabaseUser) {
      return null;
    }
    const { data: user } = await supabase
      .from('users')
      .select()
      .eq('id', supabaseUser.id)
      .single();

    if (!user) {
      set({ user: { ...supabaseUser, profile: null } });
      return { ...supabaseUser, profile: null };
    }

    set({ user: { ...supabaseUser, profile: user } });
    return { ...supabaseUser, profile: user };
  },
  projects: [],
  getProjects: async () => {
    try {
      const { data: projects, error } = await supabase
        .from('projects')
        .select('*, departments(*), crm(id), creator(id, creatorApps(id)), recruit(id)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ projects: projects });
    } catch (error) {
      console.error('Unexpected error while fetching projects:', error);
    }
  },

  departments: [],
  getDepartments: async () => {
    const { data, error } = await supabase.from('departments').select('*');

    if (error) {
      console.error('Error fetching departments info:', error);
      return;
    }

    if (data) {
      set({ departments: data });
    }
  },
}));
