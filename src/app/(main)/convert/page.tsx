'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import { Banknote, Wallet } from 'lucide-react';

const exchangeRates: { [key: string]: number } = {
  EUR: 0.92,
  GBP: 0.78,
  JPY: 150.2,
  CAD: 1.36,
  NGN: 1600,
};

const supportedCurrencies = Object.keys(exchangeRates);

export default function ConvertPage() {
  const [wallets, setWallets] = useState<{ [key: string]: number }>({
    USD: 10000,
  });
  const [amount, setAmount] = useState('');
  const [toCurrency, setToCurrency] = useState(supportedCurrencies[0]);
  const { toast } = useToast();

  const handleConvert = () => {
    const convertAmount = parseFloat(amount);

    if (isNaN(convertAmount) || convertAmount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a positive number to convert.',
        variant: 'destructive',
      });
      return;
    }

    if (convertAmount > wallets.USD) {
      toast({
        title: 'Insufficient Funds',
        description: 'You do not have enough USD to complete this conversion.',
        variant: 'destructive',
      });
      return;
    }

    const convertedAmount = convertAmount * exchangeRates[toCurrency];

    setWallets((prevWallets) => {
      const newWallets = { ...prevWallets };
      newWallets.USD -= convertAmount;
      newWallets[toCurrency] = (newWallets[toCurrency] || 0) + convertedAmount;
      return newWallets;
    });

    toast({
      title: 'Conversion Successful',
      description: `You have converted ${formatCurrency(convertAmount, 'USD')} to ${formatCurrency(convertedAmount, toCurrency)}.`,
    });

    setAmount('');
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Convert Currency</h1>
        <p className="text-muted-foreground">Convert funds from your main balance to other currencies.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Conversion Form Card */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>New Conversion</CardTitle>
            <CardDescription>
              Your main balance is{' '}
              <span className="font-semibold text-primary">{formatCurrency(wallets.USD, 'USD')}</span>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount to Convert (USD)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="to-currency">To Currency</Label>
              <Select value={toCurrency} onValueChange={setToCurrency}>
                <SelectTrigger id="to-currency" className="text-base">
                  <SelectValue placeholder="Select a currency" />
                </SelectTrigger>
                <SelectContent>
                  {supportedCurrencies.map((currency) => (
                    <SelectItem key={currency} value={currency} className="text-base">
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleConvert} className="w-full" size="lg">
              Convert
            </Button>
          </CardContent>
        </Card>

        {/* Wallets Display Card */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-6 w-6" />
              My Wallets
            </CardTitle>
            <CardDescription>Your balances across all available currencies.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.keys(wallets).sort().map((currency) => (
                <div key={currency} className="flex items-center justify-between rounded-lg border bg-background p-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-full bg-primary/10 p-2 text-primary">
                            <Banknote className="h-5 w-5"/>
                        </div>
                        <span className="font-medium">{currency} Account</span>
                    </div>
                    <span className="text-lg font-semibold tabular-nums">
                        {formatCurrency(wallets[currency], currency)}
                    </span>
                </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
