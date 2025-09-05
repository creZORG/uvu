import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SignupForm } from "@/components/signup-form";
import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <section className="w-full max-w-md py-12">
          <Card className="p-6 sm:p-8">
            <CardHeader className="text-center">
              <CardTitle className="font-headline text-3xl">Create an Account</CardTitle>
              <CardDescription>
                Join our community to start learning and growing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SignupForm />
               <p className="mt-6 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  Log In
                </Link>
              </p>
            </CardContent>
          </Card>
        </section>
      </main>
      <Footer />
    </div>
  );
}
