
"use client";

import Link from "next/link";
import { UcnLogo } from "./icons";
import { Twitter, Facebook, Linkedin, Instagram } from "lucide-react";
import { useState, useEffect } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

type ContactDetails = {
  email: string;
  phone: string;
  location: string;
};

export function Footer() {
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  return (
    <footer className="bg-primary/5 border-t border-primary/10">
      <div className="container px-4 md:px-6 py-12">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2 font-bold font-headline text-lg">
              <UcnLogo className="h-10 w-10" />
              <span className="sr-only">Uvumbuzi Community Network</span>
            </Link>
            <p className="text-muted-foreground">
              Empowering communities through digital innovation.
            </p>
          </div>
          <div>
            <h3 className="font-headline font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-muted-foreground hover:text-primary">About Us</Link></li>
              <li><Link href="/programs" className="text-muted-foreground hover:text-primary">Programs</Link></li>
              <li><Link href="/gallery" className="text-muted-foreground hover:text-primary">Gallery</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-primary">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-headline font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link href="/terms-of-service" className="text-muted-foreground hover:text-primary">Terms of Service</Link></li>
              <li><Link href="/privacy-policy" className="text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-headline font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-primary"><Twitter /></Link>
              <Link href="#" className="text-muted-foreground hover:text-primary"><Facebook /></Link>
              <Link href="#" className="text-muted-foreground hover:text-primary"><Linkedin /></Link>
              <Link href="#" className="text-muted-foreground hover:text-primary"><Instagram /></Link>
            </div>
          </div>
        </div>
        <div className="border-t border-primary/10 mt-8 pt-8 text-center text-muted-foreground space-y-4">
          <p>&copy; {new Date().getFullYear()} Uvumbuzi Community Network. All Rights Reserved.</p>
           <div className="flex justify-center">
            <button 
              onClick={() => setIsModalOpen(true)} 
              className={cn(
                  "group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-gray-800 px-4 py-2 font-mono font-medium tracking-tighter text-white"
              )}
              style={{ boxShadow: "inset 0 0 1.5rem rgba(139, 92, 246, 0.5)"}}
            >
                <span className="absolute top-0 right-0 -mt-1 -mr-1 h-8 w-8 transform translate-x-1 translate-y-1 bg-primary opacity-10 transition-all duration-300 ease-out group-hover:translate-x-0 group-hover:translate-y-0"></span>
                <span className="relative z-10">Powered by RancidPool</span>
            </button>
          </div>
        </div>
      </div>

       <AlertDialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline text-2xl">Powered by RancidPool</AlertDialogTitle>
            <AlertDialogDescription className="text-base pt-2">
              This website was built by a member of RancidPool, a team of experienced developers leveraging AI and AI agents to build, deploy, and scale applications faster and more affordably.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction asChild>
                <a href="https://rancidpool.com/case-studies" target="_blank" rel="noopener noreferrer">View Project Case Study</a>
            </AlertDialogAction>
            <AlertDialogAction onClick={() => setIsModalOpen(false)} variant="ghost">Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </footer>
  );
}
