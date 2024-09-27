import { format } from "date-fns";
import { useMutation } from "@tanstack/react-query";
import {
  bitbucketCommit,
  bitbucketCreateRepository,
  bitbucketGetRepository,
} from "@/helpers/bitbucket";
import { toast } from "sonner";
import { useGlobalStore } from "@/stores/global";

interface UsePushToGitParams {
  project: any;
  data: { folder: string; script: string }[];
  message: string;
  onSuccess?: () => Function | Promise<void>;
}

export const usePushToGit = ({
  project,
  data,
  message,
  onSuccess,
}: UsePushToGitParams) => {
  const { user } = useGlobalStore();

  const name = project._repository;
  const auth = {
    username: user?.profile?.bbUsername,
    password: user?.profile?.bbPassword,
  };

  return useMutation({
    mutationFn: async () => {
      let repository = await bitbucketGetRepository(auth, name);
      console.log({ repository });
      if (!repository) repository = await bitbucketCreateRepository(auth, name);

      const formData = new FormData();
      data.forEach(({ folder, script }) => {
        formData.append(folder, script);
      });

      const response = await bitbucketCommit(auth, name, formData, message);
    },
    onSuccess: async () => {
      onSuccess && (await onSuccess());
      toast.success("Functions pushed successfully");
    },
    onError: (err: any) => {
      toast.error(err.message || "Error pushing to git");
    },
  });
};
