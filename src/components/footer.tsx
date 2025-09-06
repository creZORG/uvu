
"use client";

import Link from "next/link";
import { UcnLogo } from "./icons";
import { Twitter, Facebook, Linkedin, Instagram, Rocket } from "lucide-react";
import { useState, useEffect } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { SocialLinks } from "@/lib/types";

type ContactDetails = {
  email: string;
  phone: string;
  location: string;
  socials?: SocialLinks;
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
  
  const socialLinks = contact?.socials;

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
              {socialLinks?.twitter && <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary"><Twitter /></a>}
              {socialLinks?.facebook && <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary"><Facebook /></a>}
              {socialLinks?.linkedin && <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary"><Linkedin /></a>}
              {socialLinks?.instagram && <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary"><Instagram /></a>}
            </div>
          </div>
        </div>
        <div className="border-t border-primary/10 mt-8 pt-8 text-center text-muted-foreground space-y-4">
          <p>&copy; {new Date().getFullYear()} Uvumbuzi Community Network. All Rights Reserved.</p>
           <div className="flex justify-center">
            <button 
              onClick={() => setIsModalOpen(true)} 
              className={cn(
                  "group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-background/80 px-4 py-2 font-mono font-medium tracking-tighter text-foreground"
              )}
            >
                <span className="relative z-10">Powered by RancidPool</span>
            </button>
          </div>
        </div>
      </div>

       <AlertDialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline text-xl">This website was developed by a member of RancidPool, a specialized team of experienced developers utilizing AI and autonomous agents to accelerate the design, deployment, and scaling of modern, secure applications with precision and cost-efficiency.</AlertDialogTitle>
            <AlertDialogDescription className="text-base pt-2">
              To review the full development process, including detailed documentation of the team, tools, and methodology, or to evaluate the quality of this work
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction asChild className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:opacity-90">
                <a href="https://rancidpool.com/client/projects/uvumbuzi" target="_blank" rel="noopener noreferrer">Review Technical Build Report</a>
            </AlertDialogAction>
            <AlertDialogCancel>Dismiss</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </footer>
  );
}
