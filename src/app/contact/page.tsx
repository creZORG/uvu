import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContactForm } from "@/components/contact-form";

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <section className="py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-center max-w-4xl mx-auto">
              <div>
                <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight">
                  Get in Touch
                </h1>
                <p className="text-muted-foreground mt-4 text-lg">
                  We'd love to hear from you. Fill out the form or use the contact details provided.
                </p>
                <div className="mt-8 space-y-4 text-lg">
                  <p><strong>Email:</strong> info@uvumbuzicommunity.org</p>
                  <p><strong>Phone:</strong> +254 741 626 496</p>
                  <p><strong>Website:</strong> <a href="http://uvumbuzicommunity.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">uvumbuzicommunity.org</a></p>
                  <p><strong>Location:</strong> Kivumbini, Nakuru, Kenya</p>
                </div>
              </div>
              <Card className="p-6 sm:p-8">
                <CardHeader>
                  <CardTitle className="font-headline text-2xl">Send us a message</CardTitle>
                </CardHeader>
                <CardContent>
                  <ContactForm />
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
