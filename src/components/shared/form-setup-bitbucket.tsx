'use client';

import React from 'react';

import { supabase } from '@/lib/supabase/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { TypographyH1 } from '@/components/typography/typography-h1';
import { Button } from '@/components/ui/button';
import Description from '@/components/ui/description';
import { Form, FormField } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useGlobalStore } from '@/stores/global';
import { NOTION_BITBUCKET_CREATE_PASSWORD_URL } from '@/utils/constants';
import { validationToast } from '@/utils/form-validation';
import LogoBitbucket from '@/assets/img/logo-bitbucket';

import ButtonLoading from '../ui/button-loading';

const formSchema = z.object({
  bbUsername: z.string().min(3, 'Bitbucket Username is required'),
  bbPassword: z.string().min(6, 'Bitbucket Password is required'),
});

export default function FormSetupBitbucket() {
  const { user, getUser } = useGlobalStore();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    mode: 'onChange',
    resolver: zodResolver(formSchema),
    defaultValues: {
      bbUsername: '',
      bbPassword: '',
    },
  });

  const mutationCreateUser = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from('users').upsert({ id: user?.id, ...data });
      if (error) throw error;
    },
    onSuccess: async () => {
      await getUser();
      router.refresh();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const onSubmit = (data: any) => {
    mutationCreateUser.mutate(data);
  };

  return (
    <div className="fixed left-0 top-0 z-10 flex h-full w-full items-center justify-center bg-background/50">
      <div className="flex w-full max-w-[650px] flex-col justify-center bg-background px-8 text-left shadow-sm">
        <TypographyH1 className="pb-4 text-center">Complete your account</TypographyH1>
        <div className="flex flex-col gap-[15px]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, validationToast.recent)}>
              <div className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="bbUsername"
                  render={({ field }) => <Input placeholder="Bitbucket username" {...field} />}
                />
                <FormField
                  control={form.control}
                  name="bbPassword"
                  render={({ field }) => <Input placeholder="Bitbucket app password" {...field} />}
                />
                <Description>
                  Need help or haven't obtained your credentials yet?{' '}
                  <Link
                    target="_blank"
                    href={NOTION_BITBUCKET_CREATE_PASSWORD_URL}
                    className="underline underline-offset-2"
                  >
                    click here
                  </Link>
                </Description>
              </div>
              <ButtonLoading
                icon={ChevronRight}
                loading={mutationCreateUser.isPending}
                type="submit"
                className="mt-10 w-full py-6"
              >
                Create account
              </ButtonLoading>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
