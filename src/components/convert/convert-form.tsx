'use client';

import { useState, useTransition, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { fetchExchangeRate, convertCurrency } from '@/actions/user';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useDebouncedCallback } from 'use-debounce';
import { ArrowRight } from 'lucide-react';

const currencies = ['USD', 'GBP', 'JPY', 'EUR', 'CNY'];

const ConvertFormSchema = z.object({
    fromAmount: z.coerce.number().positive({ message: "Amount must be greater than 0." }),
    toCurrency: z.enum(currencies),
});

type ConvertFormValues = z.infer<typeof ConvertFormSchema>;

type ConvertFormProps = {
    currentBalance: number;
    currentCurrency: string;
};

export function ConvertForm({ currentBalance, currentCurrency }: ConvertFormProps) {
    const [isPending, startTransition] = useTransition();
    const [exchangeRate, setExchangeRate] = useState<number | null>(null);
    const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
    const [isFetchingRate, setIsFetchingRate] = useState(false);
    const { toast } = useToast();

    const form = useForm<ConvertFormValues>({
        resolver: zodResolver(ConvertFormSchema),
        defaultValues: {
            fromAmount: 0,
            toCurrency: currencies.find(c => c !== currentCurrency) || 'USD',
        },
    });

    const toCurrency = form.watch('toCurrency');
    const fromAmount = form.watch('fromAmount');

    const debouncedFetchRate = useDebouncedCallback(async (from: string, to: string, amount: number) => {
        if (from === to || amount <= 0) {
            setExchangeRate(1);
            setConvertedAmount(amount);
            return;
        }
        setIsFetchingRate(true);
        const result = await fetchExchangeRate(from, to);
        if (result.rate) {
            setExchangeRate(result.rate);
            setConvertedAmount(amount * result.rate);
        } else {
            setExchangeRate(null);
            setConvertedAmount(null);
            toast({
                title: 'Error',
                description: result.error || 'Could not fetch exchange rate.',
                variant: 'destructive',
            });
        }
        setIsFetchingRate(false);
    }, 500);

    useEffect(() => {
        debouncedFetchRate(currentCurrency, toCurrency, fromAmount);
    }, [fromAmount, toCurrency, currentCurrency, debouncedFetchRate]);

    const onSubmit = (values: ConvertFormValues) => {
        startTransition(() => {
             if(values.fromAmount > currentBalance) {
                toast({
                    title: 'Error',
                    description: 'Insufficient balance.',
                    variant: 'destructive',
                });
                return;
            }
            // We are mocking this for now. In a real app, you would pass the fromAmount as well.
            convertCurrency({ toCurrency: values.toCurrency }).then((data) => {
                toast({
                    title: data.error ? 'Error' : 'Success',
                    description: data.error || data.success,
                    variant: data.error ? 'destructive' : 'default',
                });
                if (data.success) {
                    form.reset();
                }
            });
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                     <FormField
                        control={form.control}
                        name="fromAmount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Amount to Convert</FormLabel>
                                <FormControl>
                                     <div className="relative">
                                        <Input type="number" {...field} className="pr-16" />
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 font-medium text-muted-foreground">
                                            {currentCurrency}
                                        </div>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="toCurrency"
                        render={({ field }) => (
                             <FormItem>
                                <FormLabel>Converted Amount</FormLabel>
                                 <div className="relative">
                                    <Input type="number" value={convertedAmount?.toFixed(2) || '0.00'} readOnly className="pr-16" />
                                     <div className="absolute inset-y-0 right-0 flex items-center">
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="w-[100px] border-l-0 rounded-l-none">
                                                    <SelectValue placeholder="Currency" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {currencies.map((c) => (
                                                    <SelectItem key={c} value={c} disabled={c === currentCurrency}>
                                                        {c}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {isFetchingRate && <p className="text-sm text-muted-foreground">Fetching rate...</p>}
                
                {exchangeRate && !isFetchingRate && (
                    <div className="text-sm text-muted-foreground">
                        Exchange Rate: 1 {currentCurrency} = {exchangeRate.toFixed(4)} {toCurrency}
                    </div>
                )}
                
                <Button type="submit" className="w-full" disabled={isPending || isFetchingRate || !exchangeRate || fromAmount <= 0}>
                    {isPending ? 'Converting...' : 'Confirm Conversion'}
                </Button>
            </form>
        </Form>
    );
}
