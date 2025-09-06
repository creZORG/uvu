
"use client";

import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Loader2, FileCode, Database, Palette, Users, BrainCircuit, Server } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CodeSnippet } from "@/components/code-snippet";

export default function DocumentationPage() {
  const [user, authLoading] = useAuthState(auth);
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/auth");
      return;
    }

    const checkRole = async () => {
      const userDoc = await getDoc(doc(db, "userProfiles", user.uid));
      if (userDoc.exists() && userDoc.data().role === "admin") {
        setIsAuthorized(true);
      } else {
        router.push("/");
      }
      setLoading(false);
    };
    checkRole();
  }, [user, authLoading, router]);

  if (loading || authLoading || !isAuthorized) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="mt-4 text-muted-foreground">Verifying access...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 py-12 md:py-16">
        <div className="container max-w-4xl mx-auto">
          <header className="mb-12 text-center">
            <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight">Developer Documentation</h1>
            <p className="text-muted-foreground mt-4 text-lg">
              A guide to the Uvumbuzi Digital Hub website for administrators and future developers.
            </p>
          </header>

          <div className="space-y-12">
            
            {/* Tech Stack */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 font-headline text-2xl"><Server /> Tech Stack Overview</CardTitle>
                <CardDescription>The core technologies used to build and run this website.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p><strong>Frontend:</strong> Next.js (React Framework) with TypeScript.</p>
                <p><strong>Styling:</strong> Tailwind CSS with ShadCN for UI components.</p>
                <p><strong>Backend & Database:</strong> Firebase (Firestore for database, Authentication for users).</p>
                <p><strong>AI Features:</strong> Google Genkit for backend AI flows (e.g., sending emails).</p>
                <p><strong>Deployment:</strong> Firebase App Hosting.</p>
              </CardContent>
            </Card>

            {/* Project Structure */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 font-headline text-2xl"><FileCode /> Project Structure</CardTitle>
                <CardDescription>A summary of the most important files and directories.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm font-mono">
                <p><span className="font-bold">/src/app/</span> - Main application routes (pages).</p>
                <p><span className="font-bold pl-4">/src/app/admin/</span> - The admin dashboard.</p>
                <p><span className="font-bold pl-4">/src/app/api/</span> - API routes (if any).</p>
                <p><span className="font-bold">/src/components/</span> - Reusable React components.</p>
                <p><span className="font-bold pl-4">/src/components/ui/</span> - ShadCN UI components.</p>
                <p><span className="font-bold">/src/lib/</span> - Utility functions, Firebase configuration, and course content.</p>
                <p><span className="font-bold">/src/ai/</span> - Genkit AI flows.</p>
                <p><span className="font-bold">/public/</span> - Static assets like images (not used for dynamic content).</p>
              </CardContent>
            </Card>

            {/* Dynamic Content */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 font-headline text-2xl"><Database /> Dynamic Content Management</CardTitle>
                <CardDescription>All dynamic content is managed via the Admin Dashboard and stored in Firestore.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold">How it Works</h4>
                  <p className="text-muted-foreground">The website pulls content from a Firebase Firestore database in real-time. As an admin, you can update this content without needing to change any code.</p>
                </div>
                <div className="space-y-2">
                    <h4 className="font-semibold">Manageable Content Areas:</h4>
                    <ul className="list-disc list-inside text-muted-foreground">
                        <li><strong>Projects/Programs:</strong> Create, update, and delete projects. These are displayed on the homepage and the `/programs` page. Each project can have a title, content, and multiple images. Managed in the `projects` collection in Firestore.</li>
                        <li><strong>Team Members:</strong> Add or remove team members displayed on the `/about` page. Managed in the `siteContent/content` document.</li>
                        <li><strong>Gallery Images:</strong> Update the `/gallery` page with new images, including optional descriptions and locations. Managed in `siteContent/content`.</li>
                        <li><strong>Homepage Carousel & Contact Info:</strong> Also managed in the `siteContent/content` document.</li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold">To update content:</h4>
                    <p className="text-muted-foreground">Navigate to <a href="/admin" className="text-primary underline">/admin</a>, select the appropriate tab (e.g., 'Projects' or 'Site Content'), make your changes, and save.</p>
                </div>
              </CardContent>
            </Card>

            {/* Styling */}
             <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 font-headline text-2xl"><Palette /> Styling and UI</CardTitle>
                <CardDescription>How the website's look and feel is controlled.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>The site uses <strong>Tailwind CSS</strong> for utility-first styling. Most styles are applied directly in the JSX as class names.</p>
                <p><strong>ShadCN UI</strong> provides the core set of accessible and reusable components (Buttons, Cards, etc.). You can find these in `/src/components/ui`. They are styled using CSS variables.</p>
                <div>
                  <h4 className="font-semibold">Changing the Theme</h4>
                  <p className="text-muted-foreground">The primary color theme (colors, border radius) is defined in `/src/app/globals.css`. You can adjust the HSL values for variables like `--primary`, `--background`, etc., to change the site's overall appearance.</p>
                  <CodeSnippet language="css" code={`
:root {
  --background: 120 60% 97%;
  --foreground: 224 71.4% 4.1%;
  --primary: 120 73% 62%;
  /* ... more variables ... */
}
                  `} />
                </div>
              </CardContent>
            </Card>

             {/* Authentication */}
             <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 font-headline text-2xl"><Users /> Authentication & User Roles</CardTitle>
                <CardDescription>How users log in and how permissions are handled.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>User authentication is handled by <strong>Firebase Authentication</strong>, supporting both email/password and Google sign-in.</p>
                <p>When a user signs up, a corresponding user profile document is created in the `userProfiles` collection in Firestore. This document stores additional information like their name, phone number, and role.</p>
                <p>The `role` field in the user's profile document determines their access level. Currently, the roles are `student` and `admin`. Admin-only pages like `/admin` and this documentation page check this field to grant access.</p>
              </CardContent>
            </Card>

             {/* Genkit */}
             <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 font-headline text-2xl"><BrainCircuit /> AI & Server Flows (Genkit)</CardTitle>
                <CardDescription>Backend logic for automated tasks.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>The project uses <strong>Google's Genkit</strong> to run server-side AI flows. These are defined in `/src/ai/flows/`.</p>
                <p>Currently, the primary use of Genkit is to send emails (e.g., sending course certificates) via the Zeptomail API. This is abstracted into a reusable `sendMailFlow`.</p>
                <p>This architecture is scalable and allows for adding more complex AI features in the future, such as content generation or chatbots.</p>
              </CardContent>
            </Card>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
