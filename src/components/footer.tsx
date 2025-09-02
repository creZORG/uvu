import Link from "next/link";
import { UcnLogo } from "./icons";
import { Twitter, Facebook, Linkedin, Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-primary/5 border-t border-primary/10">
      <div className="container px-4 md:px-6 py-12">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2 font-bold font-headline text-lg">
              <UcnLogo className="h-10 w-auto" />
              <span className="sr-only">Uvumbuzi Community Network</span>
            </Link>
            <p className="text-muted-foreground">
              Empowering communities through digital innovation.
            </p>
          </div>
          <div>
            <h3 className="font-headline font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/#about" className="text-muted-foreground hover:text-primary">About Us</Link></li>
              <li><Link href="/#programs" className="text-muted-foreground hover:text-primary">Programs</Link></li>
              <li><Link href="/gallery" className="text-muted-foreground hover:text-primary">Gallery</Link></li>
              <li><Link href="/#impact" className="text-muted-foreground hover:text-primary">Our Impact</Link></li>
              <li><Link href="/#partners" className="text-muted-foreground hover:text-primary">Partners</Link></li>
              <li><Link href="/#contact" className="text-muted-foreground hover:text-primary">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-headline font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>info@uvumbuzi.org</li>
              <li>+254 700 000 000</li>
              <li>Kivumbini, Nakuru, Kenya</li>
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
        <div className="border-t border-primary/10 mt-8 pt-8 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Uvumbuzi Community Network. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}