import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AiPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <section className="py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                AI Courses
              </h1>
              <p className="max-w-3xl mx-auto text-muted-foreground mt-4 text-lg">
                Dive into the world of Artificial Intelligence and Machine Learning.
              </p>
            </div>
            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle>What Is AI? (In 5 Minutes)</CardTitle>
                <CardDescription>This short video explains the basics of Artificial Intelligence, what it is, how it works, and its impact on our world.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-w-16 aspect-h-9">
                  <iframe 
                    src="https://www.youtube.com/embed/ad79nYk2keg" 
                    title="YouTube video player" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                    className="w-full h-full rounded-lg"
                    style={{ aspectRatio: "16 / 9" }}
                  ></iframe>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}