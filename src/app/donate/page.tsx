import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DonatePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <section className="py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="max-w-2xl mx-auto text-center">
              <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Support Our Mission
              </h1>
              <p className="text-muted-foreground mt-4 text-lg">
                Your contribution helps us bridge the digital divide and empower our community.
              </p>
            </div>

            <Card className="max-w-lg mx-auto mt-12">
                <CardHeader>
                    <CardTitle>Make a Donation</CardTitle>
                    <CardDescription>
                        Choose a donation amount or enter a custom one.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <Button variant="outline" size="lg">$10</Button>
                        <Button variant="outline" size="lg">$25</Button>
                        <Button variant="outline" size="lg">$50</Button>
                        <Button variant="outline" size="lg">$100</Button>
                        <Button variant="outline" size="lg">$250</Button>
                        <Button variant="outline" size="lg">Custom</Button>
                    </div>
                    <Button size="lg" className="w-full" style={{ backgroundColor: '#FFD700', color: 'black' }}>
                        Donate Now
                    </Button>
                     <p className="text-xs text-muted-foreground mt-4 text-center">
                        Donations are processed securely. Thank you for your support!
                    </p>
                </CardContent>
            </Card>

          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
