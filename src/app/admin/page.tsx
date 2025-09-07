
"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy, doc, getDoc, setDoc, deleteDoc, addDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Loader2, PlusCircle, Trash2, Send, LayoutDashboard, FileText, Mail, Users, Settings, FolderKanban, MoreHorizontal, Book, Lightbulb, GraduationCap, GripVertical, ArrowUp, ArrowDown, UserCog, Ban, RotateCcw } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { UserProfile, Course, Project, Book as BookType, BookRequest, CourseContentBlock, SocialLinks } from "@/lib/types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarHeader, SidebarFooter, SidebarInset } from "@/components/ui/sidebar";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ProfileEditModal } from "@/components/profile-edit-modal";


type GalleryImage = {
  src: string;
  alt: string;
  className: string;
  description?: string;
  location?: string;
}

type Event = {
  title: string;
  description: string;
  date: string;
  imageUrl: string;
};

type SiteContent = {
  carouselImages: { src: string; alt: string; "data-ai-hint": string; }[];
  teamMembers: TeamMember[];
  galleryImages: GalleryImage[];
  contact: { email: string; phone: string; website: string; location: string; socials: SocialLinks; };
  events: Event[];
};

type TeamMember = {
  id?: string;
  name: string;
  title: string;
  bio: string;
  imageUrl: string;
  order: number;
};


type Submission = {
  id: string;
  userEmail: string;
  submittedAt: {
    toDate: () => Date;
  };
  status: "submitted" | "disqualified" | "passed" | "failed";
};

type AdminView = "submissions" | "content" | "users" | "projects" | "students" | "books" | "bookRequests" | "courses";

export default function AdminPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [books, setBooks] = useState<BookType[]>([]);
  const [bookRequests, setBookRequests] = useState<BookRequest[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [user, authLoading] = useAuthState(auth);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const { toast } = useToast();
  
  const [activeView, setActiveView] = useState<AdminView>("submissions");
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingBook, setEditingBook] = useState<BookType | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingStudent, setEditingStudent] = useState<UserProfile | null>(null);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<UserProfile | null>(null);


  const contentForm = useForm<SiteContent>();
  const projectForm = useForm<Project>({ defaultValues: { title: "", content: "", imageUrls: [] } });
  const bookForm = useForm<BookType>({ defaultValues: { title: "", author: "", description: "", coverImageUrl: "" } });
  const courseForm = useForm<Course>({ defaultValues: { title: "", description: "", thumbnailUrl: "", content: [] } });
  
  const { fields: carouselFields, append: appendCarousel, remove: removeCarousel } = useFieldArray({ control: contentForm.control, name: "carouselImages" });
  const { fields: teamFields, append: appendTeam, remove: removeTeam } = useFieldArray({ control: contentForm.control, name: "teamMembers" });
  const { fields: galleryFields, append: appendGallery, remove: removeGallery } = useFieldArray({ control: contentForm.control, name: "galleryImages" });
  const { fields: eventFields, append: appendEvent, remove: removeEvent } = useFieldArray({ control: contentForm.control, name: "events" });
  const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({ control: projectForm.control, name: "imageUrls" });
  const { fields: courseContentFields, append: appendCourseContent, remove: removeCourseContent, move: moveCourseContent } = useFieldArray({ control: courseForm.control, name: "content" });


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
    const subsUnsubscribe = onSnapshot(subsQuery, (querySnapshot) => setSubmissions(querySnapshot.docs.map(d => ({id:d.id, ...d.data()} as Submission))));

    const projectsQuery = query(collection(db, "projects"), orderBy("createdAt", "desc"));
    const projectsUnsubscribe = onSnapshot(projectsQuery, (querySnapshot) => setProjects(querySnapshot.docs.map(d => ({id: d.id, ...d.data()} as Project))));

    const booksQuery = query(collection(db, "books"), orderBy("createdAt", "desc"));
    const booksUnsubscribe = onSnapshot(booksQuery, (querySnapshot) => setBooks(querySnapshot.docs.map(d => ({id:d.id, ...d.data()} as BookType))));
    
    const usersQuery = query(collection(db, "userProfiles"), orderBy("fullName", "asc"));
    const usersUnsubscribe = onSnapshot(usersQuery, (querySnapshot) => {
        const userList = querySnapshot.docs.map(d => ({userId: d.id, ...d.data()} as UserProfile));
        setAllUsers(userList);
        setStudents(userList.filter(u => u.role === 'student'));
    });

    const bookRequestsQuery = query(collection(db, "newBookRequests"), orderBy("requestedAt", "desc"));
    const bookRequestsUnsubscribe = onSnapshot(bookRequestsQuery, (querySnapshot) => setBookRequests(querySnapshot.docs.map(d => ({id: d.id, ...d.data()} as BookRequest))));
    
    const coursesQuery = query(collection(db, "courses"), orderBy("createdAt", "desc"));
    const coursesUnsubscribe = onSnapshot(coursesQuery, (querySnapshot) => {
        const courseList: Course[] = querySnapshot.docs.map(d => ({id: d.id, ...d.data()} as Course));
         const staticCourse = {
            id: 'coding',
            title: 'General Coding Course',
            description: "Work through each module to build your knowledge. Research the suggested topics to prepare for the final quiz.",
            thumbnailUrl: 'https://i.postimg.cc/8P5Y7bVb/coding-course.jpg',
            isStatic: true,
            content: [],
        };
        setCourses([staticCourse, ...courseList]);
    });


    setLoading(false);

    return () => {
        subsUnsubscribe();
        projectsUnsubscribe();
        usersUnsubscribe();
        booksUnsubscribe();
        bookRequestsUnsubscribe();
        coursesUnsubscribe();
    };
  }, [isAuthorized, contentForm]);

  useEffect(() => {
    projectForm.reset(editingProject || { title: "", content: "", imageUrls: [] });
  }, [editingProject, projectForm]);

  useEffect(() => {
    bookForm.reset(editingBook || { title: "", author: "", description: "", coverImageUrl: "" });
  }, [editingBook, bookForm]);

  useEffect(() => {
    courseForm.reset(editingCourse || { title: "", description: "", thumbnailUrl: "", content: [] });
  }, [editingCourse, courseForm]);

  useEffect(() => {
    if (editingStudent) {
        setIsStudentModalOpen(true);
    }
  }, [editingStudent])

  const onContentSubmit = async (data: SiteContent) => {
    try {
      const cleanedData = { ...data };
      await setDoc(doc(db, "siteContent", "content"), cleanedData, { merge: true });
      toast({ title: "Success!", description: "Site content updated." });
    } catch (error) {
      console.error("Error updating content: ", error);
      toast({ variant: "destructive", title: "Error", description: "Could not update site content." });
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
        } catch (error) { toast({ variant: "destructive", title: "Error", description: "Could not save project." }); }
    };

    const onBookSubmit = async (data: BookType) => {
        try {
            if (editingBook?.id) {
                await setDoc(doc(db, "books", editingBook.id), data, { merge: true });
                toast({ title: "Book Updated!" });
            } else {
                await addDoc(collection(db, "books"), { ...data, createdAt: new Date() });
                toast({ title: "Book Added!" });
            }
            setEditingBook(null);
        } catch (error) { toast({ variant: "destructive", title: "Error", description: "Could not save book." }); }
    };

    const onCourseSubmit = async (data: Course) => {
        try {
            if (editingCourse?.id) {
                await setDoc(doc(db, "courses", editingCourse.id), data, { merge: true });
                toast({ title: "Course Updated!" });
            } else {
                await addDoc(collection(db, "courses"), { ...data, createdAt: new Date() });
                toast({ title: "Course Created!" });
            }
            setEditingCourse(null);
        } catch (error) { toast({ variant: "destructive", title: "Error", description: "Could not save course." }); }
    };

    const deleteItem = async (collectionName: string, id: string) => {
      if (!id) {
          toast({ variant: "destructive", title: "Error", description: "No ID provided for deletion."});
          return;
      }
      try {
          await deleteDoc(doc(db, collectionName, id));
          toast({ title: `${collectionName.slice(0, -1)} Deleted`});
      } catch (error) {
          toast({ variant: "destructive", title: "Error", description: `Could not delete ${collectionName.slice(0, -1)}.`});
      }
    };

    const handleConfirmDeleteStudent = async () => {
        if (studentToDelete) {
            await deleteItem('userProfiles', studentToDelete.userId);
            setStudentToDelete(null);
        }
    };
    
    const handleStudentStatus = async (student: UserProfile, newStatus: 'active' | 'suspended') => {
        const studentRef = doc(db, "userProfiles", student.userId);
        try {
            await updateDoc(studentRef, { status: newStatus });
            toast({
                title: `Student ${newStatus}`,
                description: `${student.fullName}'s account has been ${newStatus}.`
            });
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Could not update student status."});
        }
    };
    
    const handleRoleChange = async (userId: string, newRole: 'student' | 'admin') => {
        const userRef = doc(db, "userProfiles", userId);
        try {
            await updateDoc(userRef, { role: newRole });
            toast({
                title: `Role Updated`,
                description: `User role has been changed to ${newRole}.`
            });
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Could not update user role."});
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
                <div>
                    <Table>
                        <TableHeader><TableRow><TableHead>Student Email</TableHead><TableHead>Submitted At</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {submissions.map((sub) => (
                            <TableRow key={sub.id} onClick={() => router.push(`/admin/submissions/${sub.id}`)} className="cursor-pointer">
                                <TableCell className="font-medium">{sub.userEmail}</TableCell>
                                <TableCell>{sub.submittedAt ? format(sub.submittedAt.toDate(), "PPP p") : "N/A"}</TableCell>
                                <TableCell><Badge variant={getStatusVariant(sub.status)}>{sub.status}</Badge></TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {submissions.length === 0 && <p className="text-center text-muted-foreground py-8">No submissions yet.</p>}
                </div>
            )
        case "students":
             return (
                <div>
                    <Table>
                        <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Phone</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {students.map((student) => (
                            <TableRow key={student.userId}>
                                <TableCell className="font-medium flex items-center gap-2">
                                     {student.status === 'suspended' && <Ban className="h-4 w-4 text-destructive" title="Suspended"/>}
                                    {student.fullName}
                                </TableCell>
                                <TableCell>{student.email}</TableCell>
                                <TableCell>{student.phoneNumber}</TableCell>
                                <TableCell><Badge variant={student.status === 'suspended' ? 'destructive' : 'secondary'} className="capitalize">{student.status || 'active'}</Badge></TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => setEditingStudent(student)}><UserCog className="mr-2"/>View/Edit Profile</DropdownMenuItem>
                                            {student.status === 'suspended' ? (
                                                 <DropdownMenuItem onClick={() => handleStudentStatus(student, 'active')}><RotateCcw className="mr-2"/>Reinstate Student</DropdownMenuItem>
                                            ) : (
                                                <DropdownMenuItem onClick={() => handleStudentStatus(student, 'suspended')}><Ban className="mr-2"/>Suspend Student</DropdownMenuItem>
                                            )}
                                            <DropdownMenuSeparator/>
                                            <DropdownMenuItem className="text-destructive" onClick={() => setStudentToDelete(student)}><Trash2 className="mr-2"/>Delete Account</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {students.length === 0 && <p className="text-center text-muted-foreground py-8">No students found.</p>}
                </div>
             )
        case "users":
            return (
                <div>
                     <h3 className="font-headline text-2xl mb-4">User Management ({allUsers.length} total users)</h3>
                    <Table>
                        <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {allUsers.map((u) => (
                            <TableRow key={u.userId}>
                                <TableCell className="font-medium">{u.fullName}</TableCell>
                                <TableCell>{u.email}</TableCell>
                                <TableCell><Badge variant={u.role === 'admin' ? 'destructive' : 'secondary'} className="capitalize">{u.role}</Badge></TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                             <DropdownMenuSeparator/>
                                             <DropdownMenuItem onClick={() => handleRoleChange(u.userId, 'student')}>Make Student</DropdownMenuItem>
                                             <DropdownMenuItem onClick={() => handleRoleChange(u.userId, 'admin')}>Make Admin</DropdownMenuItem>
                                             <DropdownMenuSeparator/>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )
        case "content":
            return (
                <form onSubmit={contentForm.handleSubmit(onContentSubmit)} className="space-y-6">
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger className="font-headline text-xl">Contact Information</AccordionTrigger>
                            <AccordionContent className="p-1">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                    <div><Label>Email</Label><Input {...contentForm.register("contact.email")} /></div>
                                    <div><Label>Phone</Label><Input {...contentForm.register("contact.phone")} /></div>
                                    <div><Label>Website URL</Label><Input {...contentForm.register("contact.website")} /></div>
                                    <div><Label>Location</Label><Input {...contentForm.register("contact.location")} /></div>
                                    <div className="md:col-span-2 space-y-4 pt-4 border-t">
                                        <h4 className="font-semibold text-muted-foreground">Social Media Links</h4>
                                        <div><Label>Instagram URL</Label><Input placeholder="https://instagram.com/..." {...contentForm.register("contact.socials.instagram")} /></div>
                                        <div><Label>Twitter (X) URL</Label><Input placeholder="https://x.com/..." {...contentForm.register("contact.socials.twitter")} /></div>
                                        <div><Label>Facebook URL</Label><Input placeholder="https://facebook.com/..." {...contentForm.register("contact.socials.facebook")} /></div>
                                        <div><Label>LinkedIn URL</Label><Input placeholder="https://linkedin.com/in/..." {...contentForm.register("contact.socials.linkedin")} /></div>
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger className="font-headline text-xl">Homepage Carousel Images</AccordionTrigger>
                            <AccordionContent className="p-1 space-y-4 pt-2">
                                {carouselFields.map((field, index) => (
                                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-end p-4 border rounded">
                                        <div className="grid md:grid-cols-3 gap-4">
                                            <div><Label>Image URL</Label><Input {...contentForm.register(`carouselImages.${index}.src`)} /></div>
                                            <div><Label>Alt Text</Label><Input {...contentForm.register(`carouselImages.${index}.alt`)} /></div>
                                            <div><Label>AI Hint</Label><Input {...contentForm.register(`carouselImages.${index}.data-ai-hint`)} /></div>
                                        </div>
                                        <Button type="button" variant="destructive" size="icon" onClick={() => removeCarousel(index)}><Trash2/></Button>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" size="sm" onClick={() => appendCarousel({ src: '', alt: '', 'data-ai-hint': '' })}><PlusCircle className="mr-2"/>Add Carousel Image</Button>
                            </AccordionContent>
                        </AccordionItem>
                         <AccordionItem value="item-3">
                            <AccordionTrigger className="font-headline text-xl">Team Members</AccordionTrigger>
                            <AccordionContent className="p-1 space-y-4 pt-2">
                                {teamFields.map((field, index) => (
                                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-start p-4 border rounded">
                                        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                                            <div className="lg:col-span-2"><Label>Name</Label><Input {...contentForm.register(`teamMembers.${index}.name`)} /></div>
                                            <div className="lg:col-span-2"><Label>Title</Label><Input {...contentForm.register(`teamMembers.${index}.title`)} /></div>
                                            <div><Label>Order</Label><Input type="number" {...contentForm.register(`teamMembers.${index}.order`, {valueAsNumber: true})} /></div>
                                            <div className="md:col-span-2 lg:col-span-5"><Label>Bio</Label><Textarea {...contentForm.register(`teamMembers.${index}.bio`)} /></div>
                                            <div className="md:col-span-2 lg:col-span-5"><Label>Image URL</Label><Input {...contentForm.register(`teamMembers.${index}.imageUrl`)} /></div>
                                        </div>
                                        <Button type="button" variant="destructive" size="icon" onClick={() => removeTeam(index)}><Trash2/></Button>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" size="sm" onClick={() => appendTeam({ name: '', title: '', bio: '', imageUrl: '', order: teamFields.length + 1 })}><PlusCircle className="mr-2"/>Add Team Member</Button>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4">
                            <AccordionTrigger className="font-headline text-xl">Gallery Images</AccordionTrigger>
                            <AccordionContent className="p-1 space-y-4 pt-2">
                                {galleryFields.map((field, index) => (
                                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-end p-4 border rounded">
                                        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                                            <div className="lg:col-span-3"><Label>Image URL</Label><Input {...contentForm.register(`galleryImages.${index}.src`)} /></div>
                                            <div className="lg:col-span-2"><Label>Alt Text</Label><Input {...contentForm.register(`galleryImages.${index}.alt`)} /></div>
                                            <div className="lg:col-span-2"><Label>Description</Label><Input {...contentForm.register(`galleryImages.${index}.description`)} /></div>
                                            <div><Label>Location</Label><Input {...contentForm.register(`galleryImages.${index}.location`)} /></div>
                                            <div className="lg:col-span-2"><Label>CSS Class</Label><Input placeholder="e.g., col-span-2" {...contentForm.register(`galleryImages.${index}.className`)} /></div>
                                        </div>
                                        <Button type="button" variant="destructive" size="icon" onClick={() => removeGallery(index)}><Trash2/></Button>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" size="sm" onClick={() => appendGallery({ src: '', alt: '', className: '', description: '', location: '' })}><PlusCircle className="mr-2"/>Add Gallery Image</Button>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-5">
                            <AccordionTrigger className="font-headline text-xl">Upcoming Events</AccordionTrigger>
                            <AccordionContent className="p-1 space-y-4 pt-2">
                                {eventFields.map((field, index) => (
                                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-end p-4 border rounded">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div><Label>Event Title</Label><Input {...contentForm.register(`events.${index}.title`)} /></div>
                                            <div><Label>Date</Label><Input placeholder="e.g. October 26, 2024" {...contentForm.register(`events.${index}.date`)} /></div>
                                            <div className="md:col-span-2"><Label>Description</Label><Textarea {...contentForm.register(`events.${index}.description`)} /></div>
                                            <div className="md:col-span-2"><Label>Image URL</Label><Input {...contentForm.register(`events.${index}.imageUrl`)} /></div>
                                        </div>
                                        <Button type="button" variant="destructive" size="icon" onClick={() => removeEvent(index)}><Trash2/></Button>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" size="sm" onClick={() => appendEvent({ title: '', date: '', description: '', imageUrl: '' })}><PlusCircle className="mr-2"/>Add Event</Button>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                    <div className="pt-4">
                        <Button type="submit" size="lg">Save All Site Content</Button>
                    </div>
                </form>
            )
        case "projects":
             return (
                <div className="grid md:grid-cols-2 gap-8"><div><h3 className="font-headline text-2xl mb-4">{editingProject ? "Edit Project" : "Create New Project"}</h3>
                        <form onSubmit={projectForm.handleSubmit(onProjectSubmit)} className="space-y-4 p-4 border rounded-lg">
                            <div><Label>Project Title</Label><Input {...projectForm.register("title")} /></div><div><Label>Content</Label><Textarea {...projectForm.register("content")} className="min-h-[200px]" /></div>
                            <div className="space-y-2"><Label>Images</Label>
                                {imageFields.map((field, index) => (<div key={field.id} className="flex gap-2 items-center"><Input {...projectForm.register(`imageUrls.${index}.url`)} placeholder="Image URL"/><Button type="button" variant="destructive" size="icon" onClick={() => removeImage(index)}><Trash2 size={16}/></Button></div>))}
                                <Button type="button" variant="outline" size="sm" onClick={() => appendImage({ url: '' })}><PlusCircle className="mr-2"/>Add Image URL</Button></div>
                            <div className="flex gap-4"><Button type="submit">{editingProject ? "Update Project" : "Create Project"}</Button>
                                {editingProject && <Button type="button" variant="ghost" onClick={() => setEditingProject(null)}>Cancel Edit</Button>}</div>
                        </form></div><div><h3 className="font-headline text-2xl mb-4">Existing Projects</h3>
                        <div className="space-y-4">{projects.map(proj => (<div key={proj.id} className="p-4 border rounded-lg flex justify-between items-center"><div><p className="font-bold">{proj.title}</p><p className="text-sm text-muted-foreground">{proj.content.substring(0, 50)}...</p></div><div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => setEditingProject(proj)}>Edit</Button><Button variant="destructive" size="sm" onClick={() => deleteItem('projects', proj.id!)}>Delete</Button></div></div>))}
                            {projects.length === 0 && <p className="text-muted-foreground">No projects created yet.</p>}</div></div></div>
            );
        case "books":
            return (
                <div className="grid md:grid-cols-2 gap-8"><div><h3 className="font-headline text-2xl mb-4">{editingBook ? "Edit Book" : "Add New Book"}</h3>
                        <form onSubmit={bookForm.handleSubmit(onBookSubmit)} className="space-y-4 p-4 border rounded-lg">
                            <div><Label>Book Title</Label><Input {...bookForm.register("title")} /></div><div><Label>Author</Label><Input {...bookForm.register("author")} /></div><div><Label>Description</Label><Textarea {...bookForm.register("description")} /></div><div><Label>Cover Image URL</Label><Input {...bookForm.register("coverImageUrl")} /></div>
                            <div className="flex gap-4"><Button type="submit">{editingBook ? "Update Book" : "Add Book"}</Button>
                                {editingBook && <Button type="button" variant="ghost" onClick={() => setEditingBook(null)}>Cancel Edit</Button>}</div></form></div>
                    <div><h3 className="font-headline text-2xl mb-4">Existing Books</h3>
                        <div className="space-y-4">{books.map(book => (<div key={book.id} className="p-4 border rounded-lg flex justify-between items-center"><div><p className="font-bold">{book.title}</p><p className="text-sm text-muted-foreground">by {book.author}</p></div><div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => setEditingBook(book)}>Edit</Button><Button variant="destructive" size="sm" onClick={() => deleteItem('books', book.id!)}>Delete</Button></div></div>))}
                            {books.length === 0 && <p className="text-muted-foreground">No books added yet.</p>}</div></div></div>);
        case "courses":
            return (
                <div className="grid md:grid-cols-2 gap-8 items-start">
                    <div>
                        <h3 className="font-headline text-2xl mb-4">{editingCourse ? "Edit Course" : "Create New Course"}</h3>
                        <form onSubmit={courseForm.handleSubmit(onCourseSubmit)} className="space-y-4 p-4 border rounded-lg">
                            <div><Label>Course Title</Label><Input {...courseForm.register("title")} /></div>
                            <div><Label>Short Description</Label><Textarea {...courseForm.register("description")} /></div>
                            <div><Label>Thumbnail Image URL</Label><Input {...courseForm.register("thumbnailUrl")} /></div>
                            <div className="space-y-4 rounded-lg border p-4">
                                <h4 className="font-semibold">Course Content</h4>
                                {courseContentFields.map((field, index) => (
                                    <div key={field.id} className="p-4 border rounded-lg bg-background/50 relative group">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="flex flex-col gap-1">
                                                <button type="button" onClick={() => moveCourseContent(index, index - 1)} disabled={index === 0} className="disabled:opacity-50"><ArrowUp size={16} /></button>
                                                <button type="button" onClick={() => moveCourseContent(index, index + 1)} disabled={index === courseContentFields.length - 1} className="disabled:opacity-50"><ArrowDown size={16} /></button>
                                            </div>
                                            <Controller control={courseForm.control} name={`content.${index}.type`} render={({ field: selectField }) => (
                                                <Select onValueChange={selectField.onChange} defaultValue={selectField.value}>
                                                    <SelectTrigger><SelectValue placeholder="Select content type..." /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="text">Text</SelectItem><SelectItem value="code">Code</SelectItem>
                                                        <SelectItem value="image">Image URL</SelectItem><SelectItem value="video">YouTube URL</SelectItem>
                                                        <SelectItem value="tip">Tip Box</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            )} />
                                            <Button type="button" variant="destructive" size="icon" onClick={() => removeCourseContent(index)}><Trash2 size={16}/></Button>
                                        </div>
                                        <Controller control={courseForm.control} name={`content.${index}`} render={({ field: { value, onChange } }) => (
                                            <>
                                                {value.type === 'code' && (
                                                    <Controller control={courseForm.control} name={`content.${index}.language`} render={({ field: langField }) => (
                                                        <Select onValueChange={langField.onChange} defaultValue={langField.value}><SelectTrigger><SelectValue placeholder="Select language..." /></SelectTrigger>
                                                        <SelectContent><SelectItem value="python">Python</SelectItem><SelectItem value="javascript">JavaScript</SelectItem><SelectItem value="bash">Bash</SelectItem><SelectItem value="html">HTML</SelectItem><SelectItem value="css">CSS</SelectItem></SelectContent></Select>
                                                    )} />
                                                )}
                                                <Textarea placeholder="Enter content here..." {...courseForm.register(`content.${index}.content`)} className="mt-2" />
                                            </>
                                        )} />
                                    </div>
                                ))}
                                <Button type="button" variant="outline" size="sm" onClick={() => appendCourseContent({type: 'text', content: ''})}><PlusCircle className="mr-2"/>Add Content Block</Button>
                            </div>
                            <div className="flex gap-4">
                                <Button type="submit">{editingCourse ? "Update Course" : "Create Course"}</Button>
                                {editingCourse && <Button type="button" variant="ghost" onClick={() => setEditingCourse(null)}>Cancel Edit</Button>}
                            </div>
                        </form>
                    </div>
                    <div>
                        <h3 className="font-headline text-2xl mb-4">Existing Courses</h3>
                        <div className="space-y-4">{courses.map(course => (
                            <div key={course.id} className="p-4 border rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="font-bold">{course.title}</p>
                                    <p className="text-sm text-muted-foreground">{course.isStatic ? "Static Course" : "Dynamic Course"}</p>
                                </div>
                                <div className="flex gap-2">
                                    { !course.isStatic && <Button variant="outline" size="sm" onClick={() => setEditingCourse(course)}>Edit</Button> }
                                    { !course.isStatic && <Button variant="destructive" size="sm" onClick={() => deleteItem('courses', course.id!)}>Delete</Button> }
                                </div>
                            </div>))}
                            {courses.length === 0 && <p className="text-muted-foreground">No courses created yet.</p>}
                        </div>
                    </div>
                </div>
            );
        case "bookRequests":
             return (
                <div><Table><TableHeader><TableRow><TableHead>Book Title</TableHead><TableHead>Author</TableHead><TableHead>Reason</TableHead><TableHead>Requested By</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
                        <TableBody>{bookRequests.map((req) => (<TableRow key={req.id}><TableCell className="font-medium">{req.title}</TableCell><TableCell>{req.author}</TableCell><TableCell className="text-sm text-muted-foreground">{req.reason}</TableCell><TableCell>{req.requestedBy}</TableCell><TableCell>{req.requestedAt ? format(req.requestedAt.toDate(), "PPP") : "N/A"}</TableCell></TableRow>))}</TableBody>
                    </Table>{bookRequests.length === 0 && (<p className="text-center text-muted-foreground py-8">No book requests yet.</p>)}</div>)
        default: return null;
    }
  }

  if (authLoading || loading || !isAuthorized) {
    return (<div className="flex flex-col min-h-screen items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin" /><p className="mt-4 text-muted-foreground">{isAuthorized ? 'Loading...' : 'Verifying...'}</p></div>);
  }

  const navItems = [
    { view: "submissions", label: "Submissions", icon: FileText },
    { view: "courses", label: "Courses", icon: GraduationCap },
    { view: "projects", label: "Projects", icon: FolderKanban },
    { view: "books", label: "Books", icon: Book },
    { view: "bookRequests", label: "Book Requests", icon: Lightbulb },
    { view: "students", label: "Students", icon: Users },
    { view: "users", label: "All Users", icon: UserCog },
    { view: "content", label: "Site Content", icon: Settings },
  ] as const;

  return (
    <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-1">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex">
                    <SidebarProvider>
                        <Sidebar variant="floating" collapsible="icon">
                            <SidebarContent>
                                <SidebarMenu>
                                    {navItems.map(item => (
                                        <SidebarMenuItem key={item.view}>
                                            <SidebarMenuButton 
                                                onClick={() => setActiveView(item.view)}
                                                isActive={activeView === item.view}
                                                tooltip={item.label}
                                            >
                                                <item.icon/>
                                                <span>{item.label}</span>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </SidebarContent>
                        </Sidebar>
                        <SidebarInset>
                             <Card className="flex-1">
                                <CardHeader className="flex flex-row items-center gap-4">
                                    <SidebarTrigger/>
                                    <div>
                                        <CardTitle className="font-headline text-2xl">Admin Dashboard</CardTitle>
                                        <CardDescription>Manage the Uvumbuzi Digital Hub.</CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {renderContent()}
                                </CardContent>
                            </Card>
                        </SidebarInset>
                    </SidebarProvider>
                </div>
            </div>
        </main>
        {editingStudent && (
             <ProfileEditModal
                isOpen={isStudentModalOpen}
                setIsOpen={(isOpen) => {
                    if (!isOpen) setEditingStudent(null);
                    setIsStudentModalOpen(isOpen);
                }}
                user={{ uid: editingStudent.userId, email: editingStudent.email, displayName: editingStudent.fullName }}
                existingProfile={editingStudent}
                onProfileUpdate={() => setEditingStudent(null)}
             />
        )}
        {studentToDelete && (
             <AlertDialog open={!!studentToDelete} onOpenChange={(isOpen) => !isOpen && setStudentToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the student account for <strong>{studentToDelete.fullName}</strong> and all of their associated data. This does not delete their Firebase Auth account.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setStudentToDelete(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDeleteStudent} variant="destructive">Yes, delete account</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        )}
        <Footer />
    </div>
  );
}

    