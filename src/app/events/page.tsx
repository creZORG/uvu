
"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2, CalendarIcon } from "lucide-react";
import Image from "next/image";

type Event = {
  title: string;
  description: string;
  date: string;
  imageUrl: string;
};

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const contentRef = doc(db, "siteContent", "content");
    const unsubscribe = onSnapshot(contentRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.events) {
          setEvents(data.events);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <section className="py-16 md:py-24 bg-primary/5">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Upcoming Events
              </h1>
              <p className="max-w-3xl mx-auto text-muted-foreground mt-4 text-lg">
                Stay updated with our latest workshops, webinars, and community gatherings.
              </p>
            </div>
          </div>
        </section>
        <section className="py-16 md:py-24 -mt-24">
             <div className="container px-4 md:px-6">
                {loading ? (
                    <div className="flex justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {events.map((event, index) => (
                           <Card key={index} className="flex flex-col overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
                                <div className="relative w-full h-56">
                                    <Image
                                        src={event.imageUrl || 'https://picsum.photos/400/200'}
                                        alt={`Image for ${event.title}`}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <CardHeader>
                                    <CardTitle className="font-headline text-xl group-hover:text-primary">{event.title}</CardTitle>
                                    <CardDescription className="flex items-center gap-2 text-sm text-muted-foreground pt-1">
                                        <CalendarIcon className="h-4 w-4"/>
                                        {event.date}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <p className="text-muted-foreground line-clamp-4">{event.description}</p>
                                </CardContent>
                           </Card>
                        ))}
                         {events.length === 0 && <p className="text-muted-foreground col-span-full text-center">No upcoming events have been scheduled. Please check back soon!</p>}
                    </div>
                )}
            </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
