'use client';

import { useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ProfileSchema } from "@/lib/definitions";
import { updateProfile } from "@/actions/user";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

type ProfileFormProps = {
    user: {
        name: string | null | undefined;
        email: string | null | undefined;
        currency: string | null | undefined;
    } | null;
}

const currencies = ['USD', 'GBP', 'JPY', 'EUR'];

export function ProfileForm({ user }: ProfileFormProps) {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const form = useForm<z.infer<typeof ProfileSchema>>({
        resolver: zodResolver(ProfileSchema),
        defaultValues: {
            name: user?.name ?? '',
            email: user?.email ?? '',
            currency: user?.currency as 'USD' | 'GBP' | 'JPY' | 'EUR' | undefined ?? 'USD',
        }
    });

    useEffect(() => {
        form.reset({
            name: user?.name ?? '',
            email: user?.email ?? '',
            currency: user?.currency as 'USD' | 'GBP' | 'JPY' | 'EUR' | undefined ?? 'USD',
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
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {currencies.map(currency => (
                            <SelectItem key={currency} value={currency}>
                              {currency}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        This is the currency that will be used to display your balance and transactions.
                      </FormDescription>
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
