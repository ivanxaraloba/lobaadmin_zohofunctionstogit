import { useEffect, useState } from 'react';

import { ArrowUpFromLine } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { usePushToGit } from '@/hooks/use-push-to-git';

import ButtonLoading from '../ui/button-loading';
import { Input } from '../ui/input';

interface Props {
  project: any;
  data: { folder: string; script: string }[];
  onSuccess?: () => Function | Promise<void>;
}

export const PushToGitButton: React.FC<Props> = ({
  project,
  data,
  onSuccess = async () => {},
}) => {
  const [message, setMessage] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const mutationPushToGit = usePushToGit({
    project,
    data,
    message,
    onSuccess: async () => {
      onSuccess && (await onSuccess());
      setIsDialogOpen(false);
    },
  });

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <ButtonLoading
          variant="secondary"
          icon={ArrowUpFromLine}
          onClick={() => setIsDialogOpen(true)}
        >
          <span>Push to Git</span>
        </ButtonLoading>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Commit message</DialogTitle>
        </DialogHeader>
        <Input
          type="text"
          placeholder="Your commit message"
          onChange={(e) => setMessage(e.target.value)}
        />
        <ButtonLoading
          icon={ArrowUpFromLine}
          loading={mutationPushToGit.isPending}
          disabled={!message}
          onClick={() => mutationPushToGit.mutate()}
        >
          <span>Push to Git</span>
        </ButtonLoading>
      </DialogContent>
    </Dialog>
  );
};
