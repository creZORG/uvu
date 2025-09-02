"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ChevronDown, Menu } from "lucide-react";
import { UcnLogo } from "@/components/icons";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/#about", label: "About" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

const programLinks = [
    { href: "/programs/digital-literacy", label: "Digital Access & Literacy" },
    { href: "/programs/environmental-stewardship", label: "Environmental Stewardship" },
    { href: "/programs/vumbuachiqs", label: "Vumbuachiqs" },
    { href: "/programs/youth-empowerment", label: "Youth Empowerment" },
    { href: "/programs/women-in-tech", label: "Women in Tech" },
];

const courseLinks = [
    { href: "/courses/coding", label: "Coding" },
    { href: "/courses/web-design", label: "Web Design" },
    { href: "/courses/cctv-installation", label: "CCTV Installation" },
    { href: "/courses/robotics", label: "Robotics" },
    { href: "/courses/ai", label: "AI" },
    { href: "/courses/graphics-design", label: "Graphics Design" },
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
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-1 text-foreground/80 hover:text-foreground transition-colors outline-none">
            Programs <ChevronDown className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {programLinks.map((link) => (
            <DropdownMenuItem key={link.href} asChild>
              <Link href={link.href}>{link.label}</Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-1 text-foreground/80 hover:text-foreground transition-colors outline-none">
            Courses <ChevronDown className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {courseLinks.map((link) => (
            <DropdownMenuItem key={link.href} asChild>
              <Link href={link.href}>{link.label}</Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full transition-all duration-300",
      scrolled ? "bg-background/80 backdrop-blur-sm shadow-md" : "bg-transparent"
    )}>
      <div className="container px-4 md:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold font-headline text-lg">
          <UcnLogo className="h-10 w-auto" />
          <span className="hidden sm:inline">Uvumbuzi Community Network</span>
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
