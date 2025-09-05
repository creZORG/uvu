
"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, GraduationCap, Users, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { AnimatedCounter } from "@/components/animated-counter";

export default function DonatePage() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  
  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setCustomAmount(value);
    setSelectedAmount(Number(value) || null);
  };

  const donationOptions = [100, 500, 1000, 5000, 10000];
  const isCustomSelected = selectedAmount !== null && !donationOptions.includes(selectedAmount);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <section className="py-16 md:py-24 text-center bg-primary/5">
          <div className="container px-4 md:px-6">
            <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Ignite Opportunity. Empower a Community.
            </h1>
            <p className="max-w-3xl mx-auto text-muted-foreground mt-4 text-lg">
              Your gift is more than a donation—it's an investment in the future of our students and community. You're providing access to digital skills, fostering innovation, and creating pathways to sustainable livelihoods. Join us in bridging the digital divide, one learner at a time.
            </p>
          </div>
        </section>

        <section className="py-16 md:py-24">
            <div className="container grid md:grid-cols-2 gap-12 items-center">
                <Card className="p-2">
                    <CardHeader>
                        <CardTitle className="font-headline text-3xl flex items-center gap-3">
                            <Heart className="text-primary"/> Make Your Donation
                        </CardTitle>
                        <CardDescription>
                            Your support, no matter the size, makes a real difference. Please choose an amount or enter your own.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                       {!selectedAmount ? (
                         <div className="space-y-6">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {donationOptions.map(amount => (
                                    <Button key={amount} variant="outline" size="lg" onClick={() => handleAmountSelect(amount)} className="h-16 text-xl">
                                        KES {amount.toLocaleString()}
                                    </Button>
                                ))}
                            </div>
                            <div className="flex items-center gap-4">
                               <Input 
                                 type="text" 
                                 placeholder="Or enter custom amount (KES)" 
                                 className="h-16 text-xl text-center" 
                                 value={customAmount}
                                 onChange={handleCustomAmountChange}
                               />
                            </div>
                             <Button size="lg" className="w-full" disabled>Choose an amount to see instructions</Button>
                        </div>
                       ) : (
                        <div className="space-y-4 text-center bg-accent/50 p-6 rounded-lg">
                            <h3 className="font-headline text-2xl">Thank You for Your Generosity!</h3>
                            <p>You have selected to donate <strong className="text-primary text-xl">KES {selectedAmount.toLocaleString()}</strong>.</p>
                            <p>Please follow these steps to complete your donation via M-Pesa:</p>
                            <div className="text-left space-y-2 w-fit mx-auto my-4">
                                <p>1. Go to your M-Pesa Menu</p>
                                <p>2. Select <strong>Lipa na M-Pesa</strong></p>
                                <p>3. Select <strong>Pay Bill</strong></p>
                                <p>4. Enter Business Number: <strong className="text-lg font-mono tracking-widest bg-white p-1 rounded">247247</strong></p>
                                <p>5. Enter Account Number: <strong className="text-lg font-mono tracking-widest bg-white p-1 rounded">267897</strong></p>
                                <p>6. Enter Amount: <strong className="text-lg font-mono tracking-widest bg-white p-1 rounded">{selectedAmount}</strong></p>
                                <p>7. Enter your M-Pesa PIN and press <strong>Send</strong></p>
                            </div>
                            <p className="text-xs text-muted-foreground">You will receive a confirmation SMS from M-Pesa upon successful payment.</p>

                            <Button variant="outline" onClick={() => setSelectedAmount(null)} className="mt-4">
                                Choose a different amount
                            </Button>
                        </div>
                       )}
                    </CardContent>
                </Card>

                <div className="space-y-8">
                     <h2 className="font-headline text-3xl font-bold tracking-tight">Your Impact in Action</h2>
                     <p className="text-lg text-muted-foreground">Every shilling contributes to our mission. Here's a look at what we can achieve together:</p>
                     <div className="grid grid-cols-2 gap-6">
                        <div className="p-6 rounded-lg bg-accent/50 text-center">
                            <GraduationCap className="size-10 text-primary mx-auto mb-2" />
                            <p className="text-4xl font-bold font-headline"><AnimatedCounter value={500} />+</p>
                            <p className="text-muted-foreground">Students Trained</p>
                        </div>
                         <div className="p-6 rounded-lg bg-accent/50 text-center">
                            <Users className="size-10 text-primary mx-auto mb-2" />
                            <p className="text-4xl font-bold font-headline"><AnimatedCounter value={50} />+</p>
                            <p className="text-muted-foreground">Youth Employed</p>
                        </div>
                         <div className="p-6 rounded-lg bg-accent/50 text-center">
                            <Wifi className="size-10 text-primary mx-auto mb-2" />
                            <p className="text-4xl font-bold font-headline"><AnimatedCounter value={10} /></p>
                            <p className="text-muted-foreground">Communities Connected</p>
                        </div>
                         <div className="p-6 rounded-lg bg-accent/50 text-center">
                            <p className="font-headline text-lg">Your donation of <span className="text-primary font-bold">KES 5,000</span> can provide a full digital literacy scholarship for one student.</p>
                        </div>
                     </div>
                </div>
            </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}

    