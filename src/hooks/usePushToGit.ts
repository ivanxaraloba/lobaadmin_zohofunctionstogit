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
}

export const usePushToGit = ({
  project,
  data,
  message,
}: UsePushToGitParams) => {
  const { user } = useGlobalStore();

  const name = `loba-projects_${project?.username}`;
  const auth = {
    username: user?.profile?.bbUsername,
    password: user?.profile?.bbPassword,
  };

  return useMutation({
    mutationFn: async () => {
      let repository = await bitbucketGetRepository(auth, name);
      if (!repository) repository = await bitbucketCreateRepository(auth, name);

      const formData = new FormData();
      data.forEach(({ folder, script }) => {
        formData.append(folder, script);
      });

      await bitbucketCommit(auth, name, formData, message);
    },
    onSuccess: () => {
      toast.success("Functions pushed successfully");
    },
    onError: (err: any) => {
      toast.error(err.message || "Error pushing to git");
    },
  });
};
