
"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { auth, db } from "@/lib/firebase";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Chrome, Loader2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

const signupSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  role: z.enum(["student", "tutor", "visitor"], {
    required_error: "You must select a role.",
  }),
});

export function AuthForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isSignupLoading, setIsSignupLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const signupForm = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "", role: "visitor" },
  });

  async function onLoginSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoginLoading(true);
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      toast({ title: "Login Successful!", description: "Welcome back!" });
      router.push("/");
    } catch (error: any) {
      toast({ variant: "destructive", title: "Login Failed", description: error.message });
    } finally {
      setIsLoginLoading(false);
    }
  }

  async function onSignupSubmit(values: z.infer<typeof signupSchema>) {
    setIsSignupLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;
      
      // Update Firebase Auth profile
      await updateProfile(user, { displayName: values.name });

      // Create user profile in Firestore
      const userProfileRef = doc(db, "userProfiles", user.uid);
      await setDoc(userProfileRef, {
        userId: user.uid,
        email: values.email,
        fullName: values.name,
        role: values.role,
      });

      toast({ title: "Account Created!", description: "Welcome to the Uvumbuzi community." });

      // Redirect based on role
      switch (values.role) {
        case "student":
          router.push("/student-hub");
          break;
        case "tutor":
          router.push("/tutor");
          break;
        default:
          router.push("/");
      }

    } catch (error: any) {
      toast({ variant: "destructive", title: "Sign Up Failed", description: error.message });
    } finally {
      setIsSignupLoading(false);
    }
  }
  
  async function handleGoogleSignIn() {
    setIsGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast({ title: "Signed in with Google!", description: "Welcome to the community!" });
      router.push("/");
    } catch (error: any) {
       toast({ variant: "destructive", title: "Google Sign-In Failed", description: error.message });
    } finally {
      setIsGoogleLoading(false);
    }
  }

  return (
    <Card className="p-2 sm:p-4 animate-in fade-in zoom-in-95 duration-300">
      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <CardHeader className="text-center px-0">
            <CardTitle className="font-headline text-3xl">Welcome Back!</CardTitle>
            <CardDescription>Sign in to continue your journey.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                <FormField control={loginForm.control} name="email" render={({ field }) => (
                    <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="your.email@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={loginForm.control} name="password" render={({ field }) => (
                    <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" placeholder="********" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <Button type="submit" className="w-full" disabled={isLoginLoading}>
                  {isLoginLoading && <Loader2 className="animate-spin mr-2"/>}
                  Log In
                </Button>
              </form>
            </Form>
             <div className="relative my-6"><div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Or continue with</span></div>
            </div>
            <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isGoogleLoading}>
              {isGoogleLoading ? <Loader2 className="animate-spin mr-2"/> : <Chrome className="mr-2 h-4 w-4" />}
              Google
            </Button>
          </CardContent>
        </TabsContent>
        <TabsContent value="signup">
          <CardHeader className="text-center px-0">
            <CardTitle className="font-headline text-3xl">Create an Account</CardTitle>
            <CardDescription>Join our community to start your journey.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...signupForm}>
              <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-6">
                <FormField control={signupForm.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="Your Name" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={signupForm.control} name="email" render={({ field }) => (
                  <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="your.email@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={signupForm.control} name="password" render={({ field }) => (
                  <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" placeholder="********" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={signupForm.control} name="role" render={({ field }) => (
                    <FormItem className="space-y-3"><FormLabel>Register as a...</FormLabel>
                        <FormControl>
                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl><RadioGroupItem value="student" /></FormControl>
                                    <div><FormLabel className="font-normal">Student</FormLabel><p className="text-xs text-muted-foreground">Access courses, borrow books, and engage with the community.</p></div>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl><RadioGroupItem value="tutor" /></FormControl>
                                    <div><FormLabel className="font-normal">Tutor</FormLabel><p className="text-xs text-muted-foreground">Offer your expertise and guide students on their learning path.</p></div>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl><RadioGroupItem value="visitor" /></FormControl>
                                    <div><FormLabel className="font-normal">Visitor</FormLabel><p className="text-xs text-muted-foreground">Explore our programs, projects, and public resources.</p></div>
                                </FormItem>
                            </RadioGroup>
                        </FormControl>
                    <FormMessage />
                    </FormItem>
                )}/>
                <Button type="submit" className="w-full" disabled={isSignupLoading}>
                  {isSignupLoading && <Loader2 className="animate-spin mr-2"/>}
                  Sign Up
                </Button>
              </form>
            </Form>
             <div className="relative my-6"><div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Or sign up with</span></div>
            </div>
            <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isGoogleLoading}>
              {isGoogleLoading ? <Loader2 className="animate-spin mr-2"/> : <Chrome className="mr-2 h-4 w-4" />}
              Google
            </Button>
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
