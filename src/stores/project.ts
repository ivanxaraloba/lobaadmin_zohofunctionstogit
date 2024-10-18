import { getRepository } from '@/helpers/bitbucket';
import { supabase } from '@/lib/supabase/client';
import { Project } from '@/types/types';
import { create } from 'zustand';

import { time } from '@/utils/generic';

type ProjectState = {
  project: Project | null;
  getProject: (id: string | number) => Promise<Project | any>;
  resetProject: any;
};

export const useProjectStore = create<ProjectState>((set, e) => ({
  project: null,
  getProject: async (username: any) => {
    const { data, error } = await supabase
      .from('projects')
      .select('*, departments(*), crm(*), creator(*, creatorApps(*)), recruit(*)')
      .eq('username', username)
      .single();

    if (error) {
      console.log('Error fetching project info:', error);
      return;
    }

    const repositoryName = `lobaz2g-${data.domain}-${data.username}`;
    const { data: repository } = await getRepository(repositoryName);

    if (data) {
      set({
        project: {
          ...data,
          _repositoryName: repositoryName,
          _repository: repository,
        },
      });
    }
  },
  resetProject: () => {
    set({
      project: null,
    });
  },
}));
