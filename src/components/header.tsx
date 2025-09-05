
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { UcnLogo } from "@/components/icons";
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ThemeToggle } from "./theme-toggle";


const navLinks = [
  { href: "/about", label: "About", animated: false },
  { href: "/programs", label: "Programs", animated: true },
  { href: "/courses", label: "Courses", animated: true },
  { href: "/gallery", label: "Gallery", animated: false },
];


export function Header() {
  const [isSheetOpen, setSheetOpen] = useState(false);
  const [user, loading] = useAuthState(auth);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
        if (user) {
            const userDoc = await getDoc(doc(db, "userProfiles", user.uid));
            if (userDoc.exists()) {
                setUserRole(userDoc.data().role);
            }
        }
    };

    if (!loading && user) {
        fetchUserRole();
    }
  }, [user, loading]);

  const AuthNav = () => {
    if (loading) {
      return <Avatar><AvatarFallback>U</AvatarFallback></Avatar>;
    }
    if (user) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar>
              <AvatarImage src={user.photoURL || undefined} />
              <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
             <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild><Link href="/profile">Profile</Link></DropdownMenuItem>
            {userRole === 'admin' && (
                <DropdownMenuItem asChild><Link href="/admin">Admin Dashboard</Link></DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => auth.signOut()}>
              Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
    return (
        <Button asChild>
            <Link href="/auth">Login / Sign Up</Link>
        </Button>
    );
  };


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
          className={cn(
            "text-foreground/80 hover:text-foreground transition-colors px-3 py-1 rounded-md",
            link.animated && "animate-shine"
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <header className={cn("sticky top-0 z-50 w-full p-2")}>
        <div className="rounded-full border border-border/20 bg-background/80 shadow-lg backdrop-blur-lg">
            <div className="container px-4 md:px-6 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 font-bold font-headline text-lg">
                <UcnLogo className="h-10 w-10" />
                <span className="hidden sm:inline">Uvumbuzi Community Network</span>
                </Link>

                <div className="hidden md:flex items-center gap-6">
                    <NavLinks />
                    <div className="flex items-center gap-4">
                    <Button asChild style={{ backgroundColor: '#FFD700', color: 'black' }} className="hover:opacity-90 rounded-full">
                        <Link href="/donate">Donate</Link>
                    </Button>
                    <AuthNav />
                    <ThemeToggle />
                    </div>
                </div>

                <div className="md:hidden flex items-center gap-2">
                <ThemeToggle />
                <AuthNav />
                <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
                    <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Menu />
                    </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[80vw] sm:w-[50vw] bg-background">
                    <div className="flex flex-col items-center justify-center h-full gap-8">
                        <NavLinks inSheet />
                        <Button asChild size="lg" style={{ backgroundColor: '#FFD700', color: 'black' }} className="hover:opacity-90 mt-4 rounded-full">
                            <Link href="/donate" onClick={() => setSheetOpen(false)}>Donate</Link>
                        </Button>
                    </div>
                    </SheetContent>
                </Sheet>
                </div>
            </div>
        </div>
    </header>
  );
}
