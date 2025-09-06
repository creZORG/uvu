
"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2 } from "lucide-react";
import Image from "next/image";

type Book = {
  id: string;
  title: string;
  author: string;
  description: string;
  coverImageUrl: string;
};

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const booksQuery = query(collection(db, "books"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(booksQuery, (querySnapshot) => {
      const bookList: Book[] = [];
      querySnapshot.forEach((doc) => {
        bookList.push({ id: doc.id, ...doc.data() } as Book);
      });
      setBooks(bookList);
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
                Digital Library Catalog
              </h1>
              <p className="max-w-3xl mx-auto text-muted-foreground mt-4 text-lg">
                Browse our collection of books. Find your next read and request to borrow it.
              </p>
            </div>
          </div>
        </section>
        <section className="py-16 md:py-24 -mt-24">
             <div className="container px-4 md:px-6">
                {loading ? (
                    <div className="flex justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
                        {books.map((book) => (
                           <Card key={book.id} className="flex flex-col overflow-hidden hover:shadow-xl transition-shadow duration-300">
                                <div className="relative w-full h-64">
                                    <Image
                                        src={book.coverImageUrl || 'https://picsum.photos/400/600'}
                                        alt={`Cover of ${book.title}`}
                                        fill
                                        className="object-cover"
                                        data-ai-hint="book cover"
                                    />
                                </div>
                                <CardContent className="p-4 flex flex-col flex-1">
                                    <h3 className="font-headline text-lg font-bold">{book.title}</h3>
                                    <p className="text-sm text-muted-foreground mb-2">by {book.author}</p>
                                    <p className="text-sm text-muted-foreground line-clamp-3 flex-1">{book.description}</p>
                                    <Button asChild className="mt-4 w-full">
                                        <Link href={`/books/borrow/${book.id}`}>Borrow Book</Link>
                                    </Button>
                                </CardContent>
                           </Card>
                        ))}
                         {books.length === 0 && <p className="text-muted-foreground col-span-full text-center">No books are currently available in the catalog.</p>}
                    </div>
                )}
            </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

    