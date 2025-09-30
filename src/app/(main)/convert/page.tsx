'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import { Banknote, Wallet, ArrowRight } from 'lucide-react';

const initialWallets = [
    { currency: 'USD', balance: 10000 },
    { currency: 'EUR', balance: 500 },
    { currency: 'GBP', balance: 250 },
];

const exchangeRates: { [key: string]: { [key: string]: number } } = {
  USD: { EUR: 0.92, GBP: 0.78, JPY: 150.2, CAD: 1.36, NGN: 1600 },
  EUR: { USD: 1.09, GBP: 0.85, JPY: 163.5, CAD: 1.48, NGN: 1740 },
  GBP: { USD: 1.28, EUR: 1.18, JPY: 192.8, CAD: 1.74, NGN: 2050 },
  JPY: { USD: 0.0067, EUR: 0.0061, GBP: 0.0052, CAD: 0.0091, NGN: 10.6 },
  CAD: { USD: 0.74, EUR: 0.68, GBP: 0.57, JPY: 110.2, NGN: 1180 },
  NGN: { USD: 0.00063, EUR: 0.00057, GBP: 0.00049, JPY: 0.094, CAD: 0.00085 },
};

const allCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'NGN'];

export default function ConvertPage() {
  const [wallets, setWallets] = useState(initialWallets);
  const [fromCurrency, setFromCurrency] = useState(wallets[0].currency);
  const [toCurrency, setToCurrency] = useState('EUR');
  const [amount, setAmount] = useState('');
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);

  const { toast } = useToast();

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value);
    calculateConversion(value, fromCurrency, toCurrency);
  };
  
  const handleFromCurrencyChange = (value: string) => {
      setFromCurrency(value);
      calculateConversion(amount, value, toCurrency);
  }

  const handleToCurrencyChange = (value: string) => {
    setToCurrency(value);
    calculateConversion(amount, fromCurrency, value);
  }

  const calculateConversion = (currentAmount: string, from: string, to: string) => {
    const numericAmount = parseFloat(currentAmount);
    if (!isNaN(numericAmount) && numericAmount > 0 && from !== to) {
      const rate = exchangeRates[from]?.[to];
      if (rate) {
        setConvertedAmount(numericAmount * rate);
      } else {
        setConvertedAmount(null);
      }
    } else {
      setConvertedAmount(null);
    }
  }

  const handleConvert = () => {
    const convertAmount = parseFloat(amount);
    const fromWallet = wallets.find((w) => w.currency === fromCurrency);

    if (isNaN(convertAmount) || convertAmount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a positive number to convert.',
        variant: 'destructive',
      });
      return;
    }

    if (!fromWallet || convertAmount > fromWallet.balance) {
      toast({
        title: 'Insufficient Funds',
        description: `You do not have enough ${fromCurrency} to complete this conversion.`,
        variant: 'destructive',
      });
      return;
    }

    if (fromCurrency === toCurrency) {
        toast({
            title: 'Invalid Conversion',
            description: 'Cannot convert to the same currency.',
            variant: 'destructive',
        });
        return;
    }

    const rate = exchangeRates[fromCurrency]?.[toCurrency];
    if (!rate) {
        toast({
            title: 'Conversion Error',
            description: 'Exchange rate not available.',
            variant: 'destructive',
        });
        return;
    }
    const finalConvertedAmount = convertAmount * rate;

    setWallets((prevWallets) => {
      const newWallets = [...prevWallets];
      
      // Deduct from 'from' wallet
      const fromWalletIndex = newWallets.findIndex(w => w.currency === fromCurrency);
      if (fromWalletIndex > -1) {
        newWallets[fromWalletIndex].balance -= convertAmount;
      }

      // Add to 'to' wallet
      const toWalletIndex = newWallets.findIndex(w => w.currency === toCurrency);
      if (toWalletIndex > -1) {
          newWallets[toWalletIndex].balance += finalConvertedAmount;
      } else {
          newWallets.push({ currency: toCurrency, balance: finalConvertedAmount });
      }

      return newWallets;
    });

    toast({
      title: 'Conversion Successful',
      description: `You have converted ${formatCurrency(convertAmount, fromCurrency)} to ${formatCurrency(finalConvertedAmount, toCurrency)}.`,
    });

    setAmount('');
    setConvertedAmount(null);
  };

  const fromWalletBalance = wallets.find(w => w.currency === fromCurrency)?.balance ?? 0;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Convert Currency</h1>
        <p className="text-muted-foreground">Exchange funds between your currency wallets.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>New Conversion</CardTitle>
             <CardDescription>
              Balance: <span className="font-semibold text-primary">{formatCurrency(fromWalletBalance, fromCurrency)}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-5 items-center gap-2">
                <div className="col-span-2 space-y-2">
                    <Label htmlFor="amount">You Send</Label>
                    <Input
                        id="amount"
                        type="number"
                        placeholder="0.00"
                        value={amount}
                        onChange={handleAmountChange}
                        className="text-base"
                    />
                </div>
                 <div className="col-span-1 pt-6 text-center">
                    <ArrowRight className="h-6 w-6 mx-auto text-muted-foreground"/>
                 </div>
                 <div className="col-span-2 space-y-2">
                    <Label>They Receive</Label>
                    <Input
                        type="text"
                        readOnly
                        value={convertedAmount !== null ? convertedAmount.toFixed(2) : '0.00'}
                        className="text-base bg-muted"
                    />
                </div>
            </div>
             <div className="grid grid-cols-5 items-center gap-2">
                 <div className="col-span-2">
                     <Select value={fromCurrency} onValueChange={handleFromCurrencyChange}>
                        <SelectTrigger className="text-base">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {wallets.map((wallet) => (
                                <SelectItem key={wallet.currency} value={wallet.currency} className="text-base">
                                {wallet.currency}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                 <div className="col-span-1"></div>
                 <div className="col-span-2">
                    <Select value={toCurrency} onValueChange={handleToCurrencyChange}>
                        <SelectTrigger className="text-base">
                            <SelectValue placeholder="Select currency"/>
                        </SelectTrigger>
                        <SelectContent>
                            {allCurrencies.map((currency) => (
                                <SelectItem key={currency} value={currency} className="text-base">
                                {currency}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                 </div>
            </div>

            <Button onClick={handleConvert} className="w-full" size="lg">
              Convert
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-6 w-6" />
              My Wallets
            </CardTitle>
            <CardDescription>Your balances across all available currencies.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {wallets.sort((a, b) => a.currency.localeCompare(b.currency)).map((wallet) => (
                <div key={wallet.currency} className="flex items-center justify-between rounded-lg border bg-background p-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-full bg-primary/10 p-2 text-primary">
                            <Banknote className="h-5 w-5"/>
                        </div>
                        <span className="font-medium">{wallet.currency} Account</span>
                    </div>
                    <span className="text-lg font-semibold tabular-nums">
                        {formatCurrency(wallet.balance, wallet.currency)}
                    </span>
                </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
