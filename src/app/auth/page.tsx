import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AuthForm } from "@/components/auth-form";

export default function AuthPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <section className="w-full max-w-md py-12">
          <AuthForm />
        </section>
      </main>
      <Footer />
    </div>
  );
}
