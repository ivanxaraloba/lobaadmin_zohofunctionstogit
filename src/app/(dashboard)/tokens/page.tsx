'use client';

import React, { useEffect } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  clientId: z.string().min(1, 'Client ID is required'),
  secretId: z.string().min(1, 'Secret ID is required'),
  scopes: z.string().min(1, 'Scopes are required'),
});

export default function Page() {
  const form = useForm<z.infer<typeof formSchema>>({
    mode: 'onChange',
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientId: '',
      secretId: '',
      scopes: '',
    },
  });

  // Load saved data from localStorage on initialization
  useEffect(() => {
    const savedData = localStorage.getItem('formData');
    if (savedData) {
      form.reset(JSON.parse(savedData));
    }
  }, [form]);

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    // Save data to localStorage
    localStorage.setItem('formData', JSON.stringify(data));

    // Open Zoho authorization link
    window.open(
      `https://accounts.zoho.com/oauth/v2/auth?scope=${data.scopes}&client_id=${data.clientId}&response_type=code&access_type=offline&redirect_uri=https://www.google.pt`,
      '_blank',
    );

    toast.success('Data saved and authorization window opened!');
  };

  return (
    <div className="mx-auto max-w-md p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="clientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client ID *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter Client ID" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="secretId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Secret ID *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter Secret ID" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="scopes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Scopes *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter Scopes" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </div>
  );
}
