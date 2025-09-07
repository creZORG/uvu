
"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function TutorPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect users away from this page as the feature is removed.
    router.replace('/');
  }, [router]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center border-destructive">
          <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center justify-center gap-2 text-destructive">
              <Ban /> Feature Not Available
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>The tutor portal is no longer available.</p>
            <Button asChild className="mt-4">
              <Link href="/">Return to Homepage</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}

    