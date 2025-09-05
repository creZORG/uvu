
"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy, doc, getDoc, setDoc, deleteDoc, addDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Loader2, PlusCircle, Trash2, Send, LayoutDashboard, FileText, Mail, Users } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm, useFieldArray } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { sendMail, SendMailInput } from "@/ai/flows/send-mail-flow";
import { cn } from "@/lib/utils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

type TeamMember = {
  id?: string;
  name: string;
  title: string;
  bio: string;
  imageUrl: string;
  order: number;
};

type AdminView = "submissions" | "homepage" | "mail" | "team";

export default function AdminPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [user, authLoading] = useAuthState(auth);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isSendingMail, setIsSendingMail] = useState(false);
  const { toast } = useToast();
  
  const [activeView, setActiveView] = useState<AdminView>("submissions");
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);


  const contentForm = useForm<HomepageContent>();
  const mailForm = useForm<SendMailInput>();
  const teamMemberForm = useForm<TeamMember>();

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

    const subsQuery = query(collection(db, "examSubmissions"), orderBy("submittedAt", "desc"));
    const subsUnsubscribe = onSnapshot(subsQuery, (querySnapshot) => {
      const subs: Submission[] = [];
      querySnapshot.forEach((doc) => {
        subs.push({ id: doc.id, ...doc.data() } as Submission);
      });
      setSubmissions(subs);
    });

    const teamQuery = query(collection(db, "teamMembers"), orderBy("order", "asc"));
    const teamUnsubscribe = onSnapshot(teamQuery, (querySnapshot) => {
        const members: TeamMember[] = [];
        querySnapshot.forEach((doc) => {
            members.push({ id: doc.id, ...doc.data()} as TeamMember);
        });
        setTeamMembers(members);
    });

    setLoading(false);

    return () => {
        subsUnsubscribe();
        teamUnsubscribe();
    };
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

  const onMailSubmit = async (data: SendMailInput) => {
    setIsSendingMail(true);
    try {
        const result = await sendMail(data);
        if (result.success) {
            toast({ title: "Email Sent!", description: result.message });
            mailForm.reset();
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error("Error sending mail: ", error);
        toast({ variant: "destructive", title: "Error", description: String(error) });
    } finally {
        setIsSendingMail(false);
    }
  };
  
  const handleEditMember = (member: TeamMember) => {
    setEditingMember(member);
    teamMemberForm.reset(member);
  };

  const handleNewMember = () => {
    const newMember: TeamMember = { name: "", title: "", bio: "", imageUrl: "", order: teamMembers.length + 1 };
    setEditingMember(newMember);
    teamMemberForm.reset(newMember);
  };
  
  const onTeamMemberSubmit = async (data: TeamMember) => {
    try {
      if (editingMember?.id) {
        await setDoc(doc(db, "teamMembers", editingMember.id), data, { merge: true });
        toast({ title: "Success!", description: "Team member updated." });
      } else {
        await addDoc(collection(db, "teamMembers"), data);
        toast({ title: "Success!", description: "New team member added." });
      }
      setEditingMember(null);
    } catch (error) {
      console.error("Error saving team member: ", error);
      toast({ variant: "destructive", title: "Error", description: "Could not save team member." });
    }
  };

  const handleDeleteMember = async (id: string) => {
    try {
      await deleteDoc(doc(db, "teamMembers", id));
      toast({ title: "Deleted", description: "Team member has been removed." });
    } catch (error) {
      console.error("Error deleting team member: ", error);
      toast({ variant: "destructive", title: "Error", description: "Could not delete team member." });
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "submitted": return "secondary";
      case "disqualified": return "destructive";
      case "passed": return "default";
      case "failed": return "outline";
      default: return "secondary";
    }
  };

  const renderContent = () => {
    switch (activeView) {
        case "submissions":
            return (
                <div className="mt-6 md:mt-0">
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
                </div>
            )
        case "homepage":
            return (
                <div className="mt-6 md:mt-0">
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
                </div>
            )
        case "mail":
            return (
                 <div className="mt-6 md:mt-0">
                    <form onSubmit={mailForm.handleSubmit(onMailSubmit)} className="space-y-6">
                        <div>
                            <Label htmlFor="mail-to">Recipient Email</Label>
                            <Input id="mail-to" type="email" placeholder="recipient@example.com" {...mailForm.register("to")} />
                        </div>
                        <div>
                            <Label htmlFor="mail-subject">Subject</Label>
                            <Input id="mail-subject" placeholder="Email Subject" {...mailForm.register("subject")} />
                        </div>
                        <div>
                            <Label htmlFor="mail-body">Message (HTML is supported)</Label>
                            <Textarea id="mail-body" placeholder="<h1>Hello!</h1><p>This is your message.</p>" {...mailForm.register("htmlBody")} className="min-h-[250px] font-mono" />
                        </div>
                        <Button type="submit" disabled={isSendingMail}>
                            {isSendingMail ? <Loader2 className="animate-spin mr-2"/> : <Send className="mr-2"/>}
                            Send Email
                        </Button>
                    </form>
                </div>
            )
        case "team":
            return (
                 <div className="mt-6 md:mt-0">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-headline text-2xl">Manage Team</h2>
                        <Button onClick={handleNewMember}><PlusCircle className="mr-2"/> Add New Member</Button>
                    </div>

                    {editingMember && (
                         <Card className="mb-8 p-4">
                            <form onSubmit={teamMemberForm.handleSubmit(onTeamMemberSubmit)} className="space-y-4">
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <div>
                                    <Label htmlFor="memberName">Name</Label>
                                    <Input id="memberName" {...teamMemberForm.register("name")} />
                                 </div>
                                  <div>
                                    <Label htmlFor="memberTitle">Title</Label>
                                    <Input id="memberTitle" {...teamMemberForm.register("title")} />
                                  </div>
                               </div>
                               <div>
                                 <Label htmlFor="memberImageUrl">Image URL</Label>
                                 <Input id="memberImageUrl" {...teamMemberForm.register("imageUrl")} />
                               </div>
                               <div>
                                 <Label htmlFor="memberBio">Bio</Label>
                                 <Textarea id="memberBio" {...teamMemberForm.register("bio")} />
                               </div>
                               <div>
                                  <Label htmlFor="memberOrder">Order</Label>
                                  <Input id="memberOrder" type="number" {...teamMemberForm.register("order", { valueAsNumber: true })} />
                               </div>
                               <div className="flex gap-2 justify-end">
                                 <Button type="button" variant="ghost" onClick={() => setEditingMember(null)}>Cancel</Button>
                                 <Button type="submit">Save Member</Button>
                               </div>
                            </form>
                         </Card>
                    )}

                    <div className="space-y-4">
                        {teamMembers.map(member => (
                            <Card key={member.id} className="p-4 flex items-center justify-between">
                               <div className="flex items-center gap-4">
                                  <Avatar>
                                    <AvatarImage src={member.imageUrl} alt={member.name} />
                                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-bold">{member.name} (#{member.order})</p>
                                    <p className="text-sm text-muted-foreground">{member.title}</p>
                                  </div>
                               </div>
                               <div className="flex gap-2">
                                  <Button variant="outline" size="sm" onClick={() => handleEditMember(member)}>Edit</Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild><Button variant="destructive" size="sm">Delete</Button></AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the team member. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeleteMember(member.id!)}>Yes, Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                               </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )
        default:
            return null;
    }
  }

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
                <CardDescription>Review submissions, manage site content, and send emails.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-[240px_1fr] gap-8">
                    <nav className="flex flex-col gap-2">
                        <Button
                            variant={activeView === 'submissions' ? 'secondary' : 'ghost'}
                            className={cn("justify-start", activeView === 'submissions' && "font-bold")}
                            onClick={() => setActiveView("submissions")}
                        >
                            <FileText className="mr-2" /> Submissions
                        </Button>
                        <Button
                            variant={activeView === 'homepage' ? 'secondary' : 'ghost'}
                            className={cn("justify-start", activeView === 'homepage' && "font-bold")}
                            onClick={() => setActiveView("homepage")}
                        >
                            <LayoutDashboard className="mr-2" /> Homepage Content
                        </Button>
                        <Button
                            variant={activeView === 'team' ? 'secondary' : 'ghost'}
                            className={cn("justify-start", activeView === 'team' && "font-bold")}
                            onClick={() => setActiveView("team")}
                        >
                            <Users className="mr-2" /> Team Members
                        </Button>
                        <Button
                            variant={activeView === 'mail' ? 'secondary' : 'ghost'}
                           className={cn("justify-start", activeView === 'mail' && "font-bold")}
                            onClick={() => setActiveView("mail")}
                        >
                            <Mail className="mr-2" /> Send Mail
                        </Button>
                    </nav>
                    <div>
                        {renderContent()}
                    </div>
                </div>
              </CardContent>
           </Card>
        </section>
      </main>
      <Footer />
    </div>
  );
}
