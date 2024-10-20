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
    const { data: user } = await supabase.from('users').select().eq('id', supabaseUser.id).single();

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
      const { data: projectsNoCode, error: errorNoRelations } = await supabase
        .from('projects')
        .select('*, departments(*), crm(id), creator(id, creatorApps(id)), recruit(id)')
        .order('created_at', { ascending: false });

      if (errorNoRelations) {
        console.log('Error fetching projects (no relations):', errorNoRelations);
      } else if (projectsNoCode) {
        set({ projects: projectsNoCode });
      }

      const { data: projectsDetailed, error: errorDetailed } = await supabase
        .from('projects')
        .select('*, departments(*), crm(*), creator(*, creatorApps(*)), recruit(*)')
        .order('created_at', { ascending: false });

      if (errorDetailed) {
        console.log('Error fetching detailed project info:', errorDetailed);
      } else if (projectsDetailed) {
        set({ projects: projectsDetailed });
      }
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
