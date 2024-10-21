'use client';

import React from 'react';

import { supabase } from '@/lib/supabase/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
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
import { signInWithProvider } from '@/utils/authentication';
import { NOTION_BITBUCKET_CREATE_PASSWORD_URL } from '@/utils/constants';
import { validationToast } from '@/utils/form-validation';
import LogoBitbucket from '@/assets/img/logo-bitbucket';

const formSchema = z.object({
  bbUsername: z.string().min(3, 'Bitbucket Username is required'),
  bbPassword: z.string().min(6, 'Bitbucket Password is required'),
});

export default function PageLogin() {
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    mode: 'onChange',
    resolver: zodResolver(formSchema),
    defaultValues: {
      bbUsername: '',
      bbPassword: '',
    },
  });

  const mutationSignIn = useMutation({
    mutationFn: async () => {
      const { data } = await signInWithProvider('bitbucket');
      if (data.url) window.location.href = data.url;
    },
    onSuccess: async () => {
      router.push('/');
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  return (
    <div className="fixed flex h-full w-full items-center justify-center">
      <Button
        onClick={() => mutationSignIn.mutate()}
        className="gap-2 bg-blue-600 px-8 py-6 text-white hover:bg-blue-500"
      >
        <LogoBitbucket />
        Continue with Bitbucket
      </Button>
    </div>
  );
}
