'use client';

import { useState, useTransition, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CurrencyConversionSchema } from '@/lib/definitions';
import { fetchExchangeRate, convertCurrency } from '@/actions/user';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Scale } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useDebouncedCallback } from 'use-debounce';

const currencies = ['USD', 'GBP', 'JPY', 'EUR', 'CNY'];

type CurrencyConverterProps = {
    currentBalance: number;
    currentCurrency: string;
};

export function CurrencyConverter({ currentBalance, currentCurrency }: CurrencyConverterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [exchangeRate, setExchangeRate] = useState<number | null>(null);
    const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
    const [isFetchingRate, setIsFetchingRate] = useState(false);
    const { toast } = useToast();

    const form = useForm<z.infer<typeof CurrencyConversionSchema>>({
        resolver: zodResolver(CurrencyConversionSchema),
        defaultValues: {
            toCurrency: 'USD',
        },
    });

    const toCurrency = form.watch('toCurrency');

    const debouncedFetchRate = useDebouncedCallback(async (from: string, to: string) => {
        if (from === to) {
            setExchangeRate(1);
            setConvertedAmount(currentBalance);
            return;
        }
        setIsFetchingRate(true);
        const result = await fetchExchangeRate(from, to);
        if (result.rate) {
            setExchangeRate(result.rate);
            setConvertedAmount(currentBalance * result.rate);
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
        if (isOpen) {
            debouncedFetchRate(currentCurrency, toCurrency);
        }
    }, [toCurrency, currentCurrency, debouncedFetchRate, isOpen]);

    const onSubmit = (values: z.infer<typeof CurrencyConversionSchema>) => {
        startTransition(() => {
            convertCurrency(values).then((data) => {
                toast({
                    title: data.error ? 'Error' : 'Success',
                    description: data.error || data.success,
                    variant: data.error ? 'destructive' : 'default',
                });
                if (data.success) {
                    setIsOpen(false);
                    form.reset();
                }
            });
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Scale className="mr-2 h-4 w-4" /> Convert Balance
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Convert Currency</DialogTitle>
                    <DialogDescription>
                        Convert your entire balance to a different currency.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="rounded-md border p-4">
                        <p className="text-sm text-muted-foreground">Current Balance</p>
                        <p className="text-2xl font-bold">{formatCurrency(currentBalance, currentCurrency)}</p>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="toCurrency"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Convert To</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a currency" />
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
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {isFetchingRate && <p className="text-sm text-muted-foreground">Fetching rate...</p>}
                            
                            {exchangeRate && convertedAmount && (
                                <div className="space-y-2 rounded-md border p-4">
                                     <p className="text-sm text-muted-foreground">
                                        Exchange Rate: 1 {currentCurrency} = {exchangeRate.toFixed(4)} {toCurrency}
                                     </p>
                                     <p className="text-sm font-semibold">
                                        New Balance: {formatCurrency(convertedAmount, toCurrency)}
                                    </p>
                                </div>
                            )}

                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="ghost" disabled={isPending}>Cancel</Button>
                                </DialogClose>
                                <Button type="submit" disabled={isPending || isFetchingRate || !exchangeRate}>
                                    {isPending ? 'Converting...' : 'Confirm Conversion'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
