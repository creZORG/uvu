
"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContactForm } from "@/components/contact-form";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

type ContactDetails = {
  email: string;
  phone: string;
  website: string;
  location: string;
};

export default function ContactPage() {
  const [contact, setContact] = useState<ContactDetails | null>(null);

  useEffect(() => {
    const contentRef = doc(db, "siteContent", "content");
    const unsubscribe = onSnapshot(contentRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.contact) {
          setContact(data.contact);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const getHostname = (url: string) => {
    if (!url) return "";
    try {
      return new URL(url).hostname;
    } catch (e) {
      return url;
    }
  };

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
                {contact ? (
                  <div className="mt-8 space-y-4 text-lg">
                    <p><strong>Email:</strong> {contact.email}</p>
                    <p><strong>Phone:</strong> {contact.phone}</p>
                    <p><strong>Website:</strong> <a href={contact.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{getHostname(contact.website)}</a></p>
                    <p><strong>Location:</strong> {contact.location}</p>
                  </div>
                ) : (
                  <div className="mt-8 space-y-4 text-lg">
                    <p>Loading contact details...</p>
                  </div>
                )}
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
