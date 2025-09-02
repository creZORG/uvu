import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function RoboticsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <section className="py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Robotics Courses
              </h1>
              <p className="max-w-3xl mx-auto text-muted-foreground mt-4 text-lg">
                More information coming soon.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
