import { createRepository, getRepository, pushCommit } from '@/helpers/bitbucket';
import { useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface UsePushToGitParams {
  project: any;
  data: { folder: string; script: string }[];
  message: string;
  onSuccess?: () => Function | Promise<void>;
}

export const usePushToGitCommits = ({ project, data, message, onSuccess }: UsePushToGitParams) => {
  const name = project._repositoryName;

  return useMutation({
    mutationFn: async () => {
      let { data: repository } = await getRepository(name);

      if (!repository) {
        const { data: created } = await createRepository(name);
        repository = created;
      }

      const formData = new FormData();
      data.forEach(({ folder, script }) => {
        formData.append(folder, script);
      });

      const { error } = await pushCommit(name, formData, message);
      if (error) throw new Error(error?.error?.message);
    },
    onSuccess: async () => {
      onSuccess && (await onSuccess());
      toast.success('Functions pushed successfully');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Error pushing to git');
    },
  });
};
