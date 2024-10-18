import { toast } from 'sonner';

export const validationToast = {
  recent: (errors: object) => {
    const recentErrorField = Object.keys(errors)[0];

    // @ts-ignore
    const recentError = errors[recentErrorField];
    toast.warning(recentError.message);
  },
};
