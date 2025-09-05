
"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy, doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Loader2, PlusCircle, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm, useFieldArray } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

type Submission = {
  id: string;
  userEmail: string;
  submittedAt: {
    toDate: () => Date;
  };
  status: "submitted" | "disqualified" | "passed" | "failed";
};

type CarouselImage = {
  src: string;
  alt: string;
  "data-ai-hint": string;
};

type Program = {
  href: string;
  title: string;
  description: string;
};

type HomepageContent = {
  carouselImages: CarouselImage[];
  programs: Program[];
};

export default function AdminPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [user, authLoading] = useAuthState(auth);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const { toast } = useToast();
  
  const contentForm = useForm<HomepageContent>();
  const { fields: carouselFields, append: appendCarousel, remove: removeCarousel } = useFieldArray({ control: contentForm.control, name: "carouselImages" });
  const { fields: programFields, append: appendProgram, remove: removeProgram } = useFieldArray({ control: contentForm.control, name: "programs" });

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
    };
    checkRole();
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!isAuthorized) return;

    const fetchContent = async () => {
        const contentDoc = await getDoc(doc(db, "siteContent", "homepage"));
        if (contentDoc.exists()) {
            contentForm.reset(contentDoc.data() as HomepageContent);
        }
    }
    fetchContent();

    const q = query(collection(db, "examSubmissions"), orderBy("submittedAt", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const subs: Submission[] = [];
      querySnapshot.forEach((doc) => {
        subs.push({ id: doc.id, ...doc.data() } as Submission);
      });
      setSubmissions(subs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isAuthorized, contentForm]);

  const onContentSubmit = async (data: HomepageContent) => {
    try {
      await setDoc(doc(db, "siteContent", "homepage"), data);
      toast({ title: "Success!", description: "Homepage content updated." });
    } catch (error) {
      console.error("Error updating content: ", error);
      toast({ variant: "destructive", title: "Error", description: "Could not update homepage content." });
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "submitted": return "secondary";
      case "disqualified": return "destructive";
      case "passed": return "default";
      case "failed": return "outline";
      default: return "secondary";
    }
  };

  if (authLoading || loading || !isAuthorized) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="mt-4 text-muted-foreground">
          {isAuthorized ? 'Loading dashboard...' : 'Verifying access...'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 py-12">
        <section className="container max-w-6xl mx-auto">
           <Card>
              <CardHeader>
                <CardTitle className="font-headline text-4xl">Admin Dashboard</CardTitle>
                <CardDescription>Review submissions and manage site content.</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="submissions">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="submissions">Submissions</TabsTrigger>
                    <TabsTrigger value="homepage">Homepage Content</TabsTrigger>
                  </TabsList>
                  <TabsContent value="submissions" className="mt-6">
                     <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Student Email</TableHead>
                            <TableHead>Submitted At</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {submissions.map((sub) => (
                            <TableRow key={sub.id} onClick={() => router.push(`/admin/submissions/${sub.id}`)} className="cursor-pointer">
                              <TableCell className="font-medium">{sub.userEmail}</TableCell>
                              <TableCell>{sub.submittedAt ? format(sub.submittedAt.toDate(), "PPP p") : "N/A"}</TableCell>
                              <TableCell>
                                <Badge variant={getStatusVariant(sub.status)}>{sub.status}</Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {submissions.length === 0 && (
                          <p className="text-center text-muted-foreground py-8">No submissions yet.</p>
                        )}
                  </TabsContent>
                  <TabsContent value="homepage" className="mt-6">
                    <form onSubmit={contentForm.handleSubmit(onContentSubmit)} className="space-y-8">
                      <div className="space-y-4 p-4 border rounded-lg">
                        <h3 className="font-headline text-xl">Carousel Images</h3>
                        {carouselFields.map((field, index) => (
                          <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end p-2 border rounded">
                             <div className="md:col-span-3 grid gap-2">
                                <Label htmlFor={`carousel-src-${index}`}>Image URL</Label>
                                <Input id={`carousel-src-${index}`} {...contentForm.register(`carouselImages.${index}.src`)} />
                                <Label htmlFor={`carousel-alt-${index}`}>Alt Text</Label>
                                <Input id={`carousel-alt-${index}`} {...contentForm.register(`carouselImages.${index}.alt`)} />
                                <Label htmlFor={`carousel-hint-${index}`}>AI Hint</Label>
                                <Input id={`carousel-hint-${index}`} {...contentForm.register(`carouselImages.${index}.data-ai-hint`)} />
                             </div>
                             <Button type="button" variant="destructive" size="icon" onClick={() => removeCarousel(index)}><Trash2/></Button>
                          </div>
                        ))}
                         <Button type="button" variant="outline" size="sm" onClick={() => appendCarousel({ src: '', alt: '', 'data-ai-hint': '' })}><PlusCircle className="mr-2"/>Add Image</Button>
                      </div>

                      <div className="space-y-4 p-4 border rounded-lg">
                        <h3 className="font-headline text-xl">Programs Section</h3>
                        {programFields.map((field, index) => (
                            <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end p-2 border rounded">
                                <div className="md:col-span-3 grid gap-2">
                                    <Label htmlFor={`program-title-${index}`}>Title</Label>
                                    <Input id={`program-title-${index}`} {...contentForm.register(`programs.${index}.title`)} />
                                    <Label htmlFor={`program-desc-${index}`}>Description</Label>
                                    <Textarea id={`program-desc-${index}`} {...contentForm.register(`programs.${index}.description`)} />
                                    <Label htmlFor={`program-href-${index}`}>Link (e.g., /programs/digital-literacy)</Label>
                                    <Input id={`program-href-${index}`} {...contentForm.register(`programs.${index}.href`)} />
                                </div>
                                <Button type="button" variant="destructive" size="icon" onClick={() => removeProgram(index)}><Trash2/></Button>
                            </div>
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={() => appendProgram({ href: '', title: '', description: '' })}><PlusCircle className="mr-2"/>Add Program</Button>
                      </div>
                      
                      <Button type="submit">Save Homepage Content</Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
           </Card>
        </section>
      </main>
      <Footer />
    </div>
  );
}
