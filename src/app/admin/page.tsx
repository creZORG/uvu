
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
import { Loader2, PlusCircle, Trash2, Send, LayoutDashboard, FileText, Mail, Users, Settings, FolderKanban, MoreHorizontal } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm, useFieldArray } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { sendMail, SendMailInput } from "@/ai/flows/send-mail-flow";
import { cn } from "@/lib/utils";
import type { UserProfile } from "@/components/profile-edit-modal";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type Submission = {
  id: string;
  userEmail: string;
  submittedAt: {
    toDate: () => Date;
  };
  status: "submitted" | "disqualified" | "passed" | "failed";
};

type GalleryImage = {
  src: string;
  alt: string;
  className: string;
  description?: string;
  location?: string;
}

type SiteContent = {
  carouselImages: { src: string; alt: string; "data-ai-hint": string; }[];
  programs: { href: string; title: string; description: string; }[];
  teamMembers: TeamMember[];
  galleryImages: GalleryImage[];
  contact: { email: string; phone: string; website: string; location: string; };
};

type TeamMember = {
  id?: string;
  name: string;
  title: string;
  bio: string;
  imageUrl: string;
  order: number;
};

type Project = {
  id?: string;
  title: string;
  content: string;
  imageUrls: { url: string }[];
  createdAt?: any;
};


type AdminView = "submissions" | "content" | "mail" | "projects" | "students";

export default function AdminPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [user, authLoading] = useAuthState(auth);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isSendingMail, setIsSendingMail] = useState(false);
  const { toast } = useToast();
  
  const [activeView, setActiveView] = useState<AdminView>("submissions");
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const contentForm = useForm<SiteContent>();
  const mailForm = useForm<SendMailInput>();
  const projectForm = useForm<Project>({
      defaultValues: {
          title: "",
          content: "",
          imageUrls: []
      }
  });
  
  const { fields: carouselFields, append: appendCarousel, remove: removeCarousel } = useFieldArray({ control: contentForm.control, name: "carouselImages" });
  const { fields: programFields, append: appendProgram, remove: removeProgram } = useFieldArray({ control: contentForm.control, name: "programs" });
  const { fields: teamFields, append: appendTeam, remove: removeTeam } = useFieldArray({ control: contentForm.control, name: "teamMembers" });
  const { fields: galleryFields, append: appendGallery, remove: removeGallery } = useFieldArray({ control: contentForm.control, name: "galleryImages" });
  const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({ control: projectForm.control, name: "imageUrls" });

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
        const contentDoc = await getDoc(doc(db, "siteContent", "content"));
        if (contentDoc.exists()) {
            contentForm.reset(contentDoc.data() as SiteContent);
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

    const projectsQuery = query(collection(db, "projects"), orderBy("createdAt", "desc"));
    const projectsUnsubscribe = onSnapshot(projectsQuery, (querySnapshot) => {
        const projs: Project[] = [];
        querySnapshot.forEach((doc) => {
            projs.push({ id: doc.id, ...doc.data() } as Project);
        });
        setProjects(projs);
    });
    
    const studentsQuery = query(collection(db, "userProfiles"), orderBy("fullName", "asc"));
    const studentsUnsubscribe = onSnapshot(studentsQuery, (querySnapshot) => {
        const studentList: UserProfile[] = [];
        querySnapshot.forEach((doc) => {
            studentList.push({ userId: doc.id, ...doc.data() } as UserProfile);
        });
        setStudents(studentList);
    });


    setLoading(false);

    return () => {
        subsUnsubscribe();
        projectsUnsubscribe();
        studentsUnsubscribe();
    };
  }, [isAuthorized, contentForm]);

  useEffect(() => {
    if (editingProject) {
        projectForm.reset(editingProject);
    } else {
        projectForm.reset({ title: "", content: "", imageUrls: [] });
    }
  }, [editingProject, projectForm]);

  const onContentSubmit = async (data: SiteContent) => {
    try {
      await setDoc(doc(db, "siteContent", "content"), data, { merge: true });
      toast({ title: "Success!", description: "Site content updated." });
    } catch (error) {
      console.error("Error updating content: ", error);
      toast({ variant: "destructive", title: "Error", description: "Could not update site content." });
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
  
    const onProjectSubmit = async (data: Project) => {
        try {
            if (editingProject?.id) {
                await setDoc(doc(db, "projects", editingProject.id), data, { merge: true });
                toast({ title: "Project Updated!" });
            } else {
                await addDoc(collection(db, "projects"), { ...data, createdAt: new Date() });
                toast({ title: "Project Created!" });
            }
            setEditingProject(null);
            projectForm.reset();
        } catch (error) {
            console.error("Error saving project:", error);
            toast({ variant: "destructive", title: "Error", description: "Could not save project." });
        }
    };

    const deleteProject = async (id: string) => {
        try {
            await deleteDoc(doc(db, "projects", id));
            toast({ title: "Project Deleted" });
        } catch (error) {
            console.error("Error deleting project:", error);
            toast({ variant: "destructive", title: "Error", description: "Could not delete project." });
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
        case "students":
             return (
                <div className="mt-6 md:mt-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {students.map((student) => (
                            <TableRow key={student.userId}>
                                <TableCell className="font-medium">{student.fullName}</TableCell>
                                <TableCell>{student.email}</TableCell>
                                <TableCell>{student.phoneNumber}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>View Profile</DropdownMenuItem>
                                            <DropdownMenuItem>Suspend Student</DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive">Delete Account</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {students.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">No students found.</p>
                    )}
                </div>
             )
        case "content":
            return (
                <div className="mt-6 md:mt-0">
                    <form onSubmit={contentForm.handleSubmit(onContentSubmit)} className="space-y-8">
                      {/* Contact Info */}
                      <div className="space-y-4 p-4 border rounded-lg">
                         <h3 className="font-headline text-xl">Contact Information</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><Label>Email</Label><Input {...contentForm.register("contact.email")} /></div>
                            <div><Label>Phone</Label><Input {...contentForm.register("contact.phone")} /></div>
                            <div><Label>Website URL</Label><Input {...contentForm.register("contact.website")} /></div>
                            <div><Label>Location</Label><Input {...contentForm.register("contact.location")} /></div>
                          </div>
                      </div>
                      
                      {/* Carousel */}
                      <div className="space-y-4 p-4 border rounded-lg">
                        <h3 className="font-headline text-xl">Homepage Carousel Images</h3>
                        {carouselFields.map((field, index) => (
                          <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end p-2 border rounded">
                             <div className="md:col-span-3 grid gap-2">
                                <Label>Image URL</Label><Input {...contentForm.register(`carouselImages.${index}.src`)} />
                                <Label>Alt Text</Label><Input {...contentForm.register(`carouselImages.${index}.alt`)} />
                                <Label>AI Hint</Label><Input {...contentForm.register(`carouselImages.${index}.data-ai-hint`)} />
                             </div>
                             <Button type="button" variant="destructive" size="icon" onClick={() => removeCarousel(index)}><Trash2/></Button>
                          </div>
                        ))}
                         <Button type="button" variant="outline" size="sm" onClick={() => appendCarousel({ src: '', alt: '', 'data-ai-hint': '' })}><PlusCircle className="mr-2"/>Add Carousel Image</Button>
                      </div>

                      {/* Programs */}
                      <div className="space-y-4 p-4 border rounded-lg">
                        <h3 className="font-headline text-xl">Homepage Programs</h3>
                        {programFields.map((field, index) => (
                            <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end p-2 border rounded">
                                <div className="md:col-span-3 grid gap-2">
                                    <Label>Title</Label><Input {...contentForm.register(`programs.${index}.title`)} />
                                    <Label>Description</Label><Textarea {...contentForm.register(`programs.${index}.description`)} />
                                    <Label>Link</Label><Input {...contentForm.register(`programs.${index}.href`)} />
                                </div>
                                <Button type="button" variant="destructive" size="icon" onClick={() => removeProgram(index)}><Trash2/></Button>
                            </div>
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={() => appendProgram({ href: '', title: '', description: '' })}><PlusCircle className="mr-2"/>Add Program</Button>
                      </div>

                      {/* Team Members */}
                       <div className="space-y-4 p-4 border rounded-lg">
                        <h3 className="font-headline text-xl">Team Members</h3>
                        {teamFields.map((field, index) => (
                            <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start p-2 border rounded">
                                <div className="md:col-span-3 grid gap-2">
                                    <Label>Name</Label><Input {...contentForm.register(`teamMembers.${index}.name`)} />
                                    <Label>Title</Label><Input {...contentForm.register(`teamMembers.${index}.title`)} />
                                    <Label>Bio</Label><Textarea {...contentForm.register(`teamMembers.${index}.bio`)} />
                                    <Label>Image URL</Label><Input {...contentForm.register(`teamMembers.${index}.imageUrl`)} />
                                    <Label>Order</Label><Input type="number" {...contentForm.register(`teamMembers.${index}.order`, {valueAsNumber: true})} />
                                </div>
                                <Button type="button" variant="destructive" size="icon" onClick={() => removeTeam(index)}><Trash2/></Button>
                            </div>
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={() => appendTeam({ name: '', title: '', bio: '', imageUrl: '', order: teamFields.length + 1 })}><PlusCircle className="mr-2"/>Add Team Member</Button>
                      </div>

                       {/* Gallery Images */}
                       <div className="space-y-4 p-4 border rounded-lg">
                        <h3 className="font-headline text-xl">Gallery Images</h3>
                        {galleryFields.map((field, index) => (
                          <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end p-2 border rounded">
                             <div className="md:col-span-3 grid gap-2">
                                <Label>Image URL</Label><Input {...contentForm.register(`galleryImages.${index}.src`)} />
                                <Label>Alt Text</Label><Input {...contentForm.register(`galleryImages.${index}.alt`)} />
                                <Label>CSS Class (e.g., col-span-2, row-span-2)</Label><Input {...contentForm.register(`galleryImages.${index}.className`)} />
                                <Label>Description (Optional)</Label><Input {...contentForm.register(`galleryImages.${index}.description`)} />
                                <Label>Location (Optional)</Label><Input {...contentForm.register(`galleryImages.${index}.location`)} />
                             </div>
                             <Button type="button" variant="destructive" size="icon" onClick={() => removeGallery(index)}><Trash2/></Button>
                          </div>
                        ))}
                         <Button type="button" variant="outline" size="sm" onClick={() => appendGallery({ src: '', alt: '', className: '', description: '', location: '' })}><PlusCircle className="mr-2"/>Add Gallery Image</Button>
                      </div>
                      
                      <Button type="submit">Save All Site Content</Button>
                    </form>
                </div>
            )
        case "projects":
             return (
                <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="font-headline text-2xl mb-4">{editingProject ? "Edit Project" : "Create New Project"}</h3>
                        <form onSubmit={projectForm.handleSubmit(onProjectSubmit)} className="space-y-4 p-4 border rounded-lg">
                            <div><Label>Project Title</Label><Input {...projectForm.register("title")} /></div>
                            <div><Label>Content / Description</Label><Textarea {...projectForm.register("content")} className="min-h-[200px]" /></div>
                            
                            <div className="space-y-2">
                                <Label>Images</Label>
                                {imageFields.map((field, index) => (
                                    <div key={field.id} className="flex gap-2 items-center">
                                        <Input {...projectForm.register(`imageUrls.${index}.url`)} placeholder="Image URL"/>
                                        <Button type="button" variant="destructive" size="icon" onClick={() => removeImage(index)}><Trash2 size={16}/></Button>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" size="sm" onClick={() => appendImage({ url: '' })}><PlusCircle className="mr-2"/>Add Image URL</Button>
                            </div>

                            <div className="flex gap-4">
                                <Button type="submit">
                                    {editingProject ? "Update Project" : "Create Project"}
                                </Button>
                                {editingProject && <Button type="button" variant="ghost" onClick={() => setEditingProject(null)}>Cancel Edit</Button>}
                            </div>
                        </form>
                    </div>
                    <div>
                        <h3 className="font-headline text-2xl mb-4">Existing Projects</h3>
                        <div className="space-y-4">
                            {projects.map(proj => (
                                <div key={proj.id} className="p-4 border rounded-lg flex justify-between items-center">
                                    <div>
                                        <p className="font-bold">{proj.title}</p>
                                        <p className="text-sm text-muted-foreground">{proj.content.substring(0, 50)}...</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => setEditingProject(proj)}>Edit</Button>
                                        <Button variant="destructive" size="sm" onClick={() => deleteProject(proj.id!)}>Delete</Button>
                                    </div>
                                </div>
                            ))}
                            {projects.length === 0 && <p className="text-muted-foreground">No projects created yet.</p>}
                        </div>
                    </div>
                </div>
            );
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
                            variant={activeView === 'projects' ? 'secondary' : 'ghost'}
                            className={cn("justify-start", activeView === 'projects' && "font-bold")}
                            onClick={() => setActiveView("projects")}
                        >
                            <FolderKanban className="mr-2" /> Projects
                        </Button>
                        <Button
                            variant={activeView === 'students' ? 'secondary' : 'ghost'}
                            className={cn("justify-start", activeView === 'students' && "font-bold")}
                            onClick={() => setActiveView("students")}
                        >
                            <Users className="mr-2" /> Students
                        </Button>
                        <Button
                            variant={activeView === 'content' ? 'secondary' : 'ghost'}
                            className={cn("justify-start", activeView === 'content' && "font-bold")}
                            onClick={() => setActiveView("content")}
                        >
                            <Settings className="mr-2" /> Site Content
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

    

    