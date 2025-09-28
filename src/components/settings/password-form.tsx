'use client';

import { useTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PasswordSchema } from "@/lib/definitions";
import { updatePassword } from "@/actions/user";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

export function PasswordForm() {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const form = useForm<z.infer<typeof PasswordSchema>>({
        resolver: zodResolver(PasswordSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        }
    });

    const onSubmit = (values: z.infer<typeof PasswordSchema>) => {
        startTransition(() => {
            updatePassword(values)
                .then((data) => {
                     toast({
                        title: data.error ? 'Error' : 'Success',
                        description: data.error || data.success,
                        variant: data.error ? 'destructive' : 'default',
                    });
                    if (data.success) {
                        form.reset();
                    }
                })
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="currentPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <FormControl>
                                <Input type="password" {...field} disabled={isPending} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                                <Input type="password" {...field} disabled={isPending} />
                            </FormControl>
                             <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Confirm New Password</FormLabel>
                            <FormControl>
                                <Input type="password" {...field} disabled={isPending} />
                            </FormControl>
                             <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={isPending}>
                    {isPending ? 'Updating...' : 'Update Password'}
                </Button>
            </form>
        </Form>
    );
}
