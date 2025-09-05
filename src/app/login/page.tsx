import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LoginForm } from "@/components/login-form";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <section className="w-full max-w-md py-12">
          <Card className="p-6 sm:p-8">
            <CardHeader className="text-center">
              <CardTitle className="font-headline text-3xl">Welcome Back!</CardTitle>
              <CardDescription>
                Sign in to continue your journey with us.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LoginForm />
              <p className="mt-6 text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/signup" className="text-primary hover:underline">
                  Sign Up
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
