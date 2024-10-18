'use server';

import { supabase } from '@/lib/supabase/server';
import axios from 'axios';

const workspace = 'lobadev';
const projectKey = 'ZFUNCS';

const helperGetAuth = async (): Promise<{
  username: string | '';
  password: string | '';
}> => {
  const response = await supabase.auth.getUser();
  const userId = response.data.user?.id;

  if (!userId) {
    throw new Error('User not found');
  }

  const { data } = await supabase.from('users').select('*').eq('id', userId).single();

  return {
    username: data?.bbUsername || null,
    password: data?.bbPassword || null,
  };
};

interface ApiResponse<T> {
  data: T | null;
  error: any;
}
export const createRepository = async (name: string): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.post(
      `https://api.bitbucket.org/2.0/repositories/${workspace}/${name}`,
      {
        scm: 'git',
        description: '',
        is_private: true,
        project: { key: projectKey },
      },
      {
        auth: await helperGetAuth(),
      },
    );
    return { data: response.data, error: null };
  } catch (err: any) {
    return { data: null, error: err.response?.data || err.message };
  }
};

export const getRepository = async (name: string): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.get(
      `https://api.bitbucket.org/2.0/repositories/${workspace}/${name}`,
      {
        auth: await helperGetAuth(),
      },
    );
    return { data: response.data, error: null };
  } catch (err: any) {
    return { data: null, error: err.response?.data || err.message };
  }
};

export const pushCommit = async (
  name: string,
  formData: FormData,
  message: string,
): Promise<ApiResponse<any>> => {
  try {
    formData.append('message', message);
    const response = await axios.post(
      `https://api.bitbucket.org/2.0/repositories/${workspace}/${name}/src`,
      formData,
      {
        auth: await helperGetAuth(),
      },
    );
    return { data: response.data, error: null };
  } catch (err: any) {
    return { data: null, error: err.response?.data || err.message };
  }
};

export const updateRepository = async (
  oldName: string,
  newName: string,
): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.put(
      `https://api.bitbucket.org/2.0/repositories/${workspace}/${oldName}`,
      {
        name: newName,
      },
      {
        auth: await helperGetAuth(),
      },
    );

    return { data: response.data, error: null };
  } catch (err: any) {
    return { data: null, error: err.response?.data?.error };
  }
};
