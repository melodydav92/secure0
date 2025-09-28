'use client';

import { useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ProfileSchema } from "@/lib/definitions";
import { updateProfile } from "@/actions/user";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

type ProfileFormProps = {
    user: {
        name: string | null | undefined;
        email: string | null | undefined;
    } | null;
}

export function ProfileForm({ user }: ProfileFormProps) {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const form = useForm<z.infer<typeof ProfileSchema>>({
        resolver: zodResolver(ProfileSchema),
        defaultValues: {
            name: user?.name ?? '',
            email: user?.email ?? '',
        }
    });

    useEffect(() => {
        form.reset({
            name: user?.name ?? '',
            email: user?.email ?? '',
        });
    }, [user, form]);
    

    const onSubmit = (values: z.infer<typeof ProfileSchema>) => {
        startTransition(() => {
            updateProfile(values)
                .then((data) => {
                     toast({
                        title: data.error ? 'Error' : 'Success',
                        description: data.error || data.success,
                        variant: data.error ? 'destructive' : 'default',
                    });
                })
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                                <Input {...field} disabled={isPending} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                                <Input type="email" {...field} disabled={isPending} />
                            </FormControl>
                             <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={isPending}>
                    {isPending ? 'Saving...' : 'Save Changes'}
                </Button>
            </form>
        </Form>
    );
}
