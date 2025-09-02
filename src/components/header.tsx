"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";
import { UcnLogo } from "@/components/icons";
import React, { useState } from "react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#mission", label: "Mission" },
  { href: "#values", label: "Values" },
  { href: "#programs", label: "Programs" },
  { href: "#impact", label: "Impact" },
  { href: "#contact", label: "Contact" },
];

export function Header() {
  const [isSheetOpen, setSheetOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const NavLinks = ({ inSheet }: { inSheet?: boolean }) => (
    <nav className={cn(
      "flex gap-6 items-center",
      inSheet ? "flex-col text-lg" : "hidden md:flex"
    )}>
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={() => setSheetOpen(false)}
          className="text-foreground/80 hover:text-foreground transition-colors"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full transition-all duration-300",
      scrolled ? "bg-background/80 backdrop-blur-sm shadow-md" : "bg-transparent"
    )}>
      <div className="container px-4 md:px-6 h-16 flex items-center justify-between">
        <Link href="#home" className="flex items-center gap-2 font-bold font-headline text-lg">
          <UcnLogo className="h-8 w-8 text-primary" />
          UCN
        </Link>

        <div className="hidden md:flex items-center gap-6">
            <NavLinks />
            <Button asChild style={{ backgroundColor: '#FFD700', color: 'black' }} className="hover:opacity-90">
                <Link href="#">Donate</Link>
            </Button>
        </div>

        <div className="md:hidden">
          <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[80vw] sm:w-[50vw] bg-background">
              <div className="flex flex-col items-center justify-center h-full gap-8">
                <NavLinks inSheet />
                <Button asChild size="lg" style={{ backgroundColor: '#FFD700', color: 'black' }} className="hover:opacity-90 mt-4">
                  <Link href="#" onClick={() => setSheetOpen(false)}>Donate</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
