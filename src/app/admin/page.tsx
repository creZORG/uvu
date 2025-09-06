
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
import { Loader2, PlusCircle, Trash2, Send, LayoutDashboard, FileText, Mail, Users, Settings, FolderKanban, MoreHorizontal, Book, Lightbulb, GraduationCap, GripVertical, ArrowUp, ArrowDown } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { sendMail, SendMailInput } from "@/ai/flows/send-mail-flow";
import { cn } from "@/lib/utils";
import type { UserProfile } from "@/components/profile-edit-modal";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { courseContent as staticCourseContent } from "@/lib/course-content";

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

type Book = {
    id?: string;
    title: string;
    author: string;
    description: string;
    coverImageUrl: string;
    createdAt?: any;
}

type BookRequest = {
    id: string;
    title: string;
    author: string;
    reason: string;
    requestedBy: string;
    requestedAt: { toDate: () => Date };
}

export type CourseContentBlock = {
    type: 'text' | 'code' | 'image' | 'video' | 'tip';
    content: string;
    language?: 'python' | 'javascript' | 'bash' | 'html' | 'css';
}

export type Course = {
    id?: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    content: CourseContentBlock[];
    createdAt?: any;
    isStatic?: boolean;
}


type AdminView = "submissions" | "content" | "mail" | "projects" | "students" | "books" | "bookRequests" | "courses";

export default function AdminPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [bookRequests, setBookRequests] = useState<BookRequest[]>([]);
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [user, authLoading] = useAuthState(auth);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isSendingMail, setIsSendingMail] = useState(false);
  const { toast } = useToast();
  
  const [activeView, setActiveView] = useState<AdminView>("submissions");
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);


  const contentForm = useForm<SiteContent>();
  const mailForm = useForm<SendMailInput>();
  const projectForm = useForm<Project>({ defaultValues: { title: "", content: "", imageUrls: [] } });
  const bookForm = useForm<Book>({ defaultValues: { title: "", author: "", description: "", coverImageUrl: "" } });
  const courseForm = useForm<Course>({ defaultValues: { title: "", description: "", thumbnailUrl: "", content: [] } });
  
  const { fields: carouselFields, append: appendCarousel, remove: removeCarousel } = useFieldArray({ control: contentForm.control, name: "carouselImages" });
  const { fields: programFields, append: appendProgram, remove: removeProgram } = useFieldArray({ control: contentForm.control, name: "programs" });
  const { fields: teamFields, append: appendTeam, remove: removeTeam } = useFieldArray({ control: contentForm.control, name: "teamMembers" });
  const { fields: galleryFields, append: appendGallery, remove: removeGallery } = useFieldArray({ control: contentForm.control, name: "galleryImages" });
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
    const booksUnsubscribe = onSnapshot(booksQuery, (querySnapshot) => setBooks(querySnapshot.docs.map(d => ({id:d.id, ...d.data()} as Book))));
    
    const studentsQuery = query(collection(db, "userProfiles"), orderBy("fullName", "asc"));
    const studentsUnsubscribe = onSnapshot(studentsQuery, (querySnapshot) => setStudents(querySnapshot.docs.map(d => ({userId: d.id, ...d.data()} as UserProfile))));

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
        studentsUnsubscribe();
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
        } else { throw new Error(result.message); }
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: String(error) });
    } finally { setIsSendingMail(false); }
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

    const onBookSubmit = async (data: Book) => {
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
      try {
          await deleteDoc(doc(db, collectionName, id));
          toast({ title: `${collectionName.slice(0, -1)} Deleted`});
      } catch (error) {
          toast({ variant: "destructive", title: "Error", description: `Could not delete ${collectionName.slice(0, -1)}.`});
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
                <div className="mt-6 md:mt-0">
                    <Table>
                        <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Phone</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {students.map((student) => (
                            <TableRow key={student.userId}>
                                <TableCell className="font-medium">{student.fullName}</TableCell>
                                <TableCell>{student.email}</TableCell>
                                <TableCell>{student.phoneNumber}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
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
                    {students.length === 0 && <p className="text-center text-muted-foreground py-8">No students found.</p>}
                </div>
             )
        case "content":
            return (
                <div className="mt-6 md:mt-0">
                    <form onSubmit={contentForm.handleSubmit(onContentSubmit)} className="space-y-8">
                      <div className="space-y-4 p-4 border rounded-lg"><h3 className="font-headline text-xl">Contact Information</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><Label>Email</Label><Input {...contentForm.register("contact.email")} /></div>
                            <div><Label>Phone</Label><Input {...contentForm.register("contact.phone")} /></div>
                            <div><Label>Website URL</Label><Input {...contentForm.register("contact.website")} /></div>
                            <div><Label>Location</Label><Input {...contentForm.register("contact.location")} /></div>
                          </div></div>
                      <div className="space-y-4 p-4 border rounded-lg"><h3 className="font-headline text-xl">Homepage Carousel Images</h3>
                        {carouselFields.map((field, index) => (<div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end p-2 border rounded"><div className="md:col-span-3 grid gap-2"><Label>Image URL</Label><Input {...contentForm.register(`carouselImages.${index}.src`)} /><Label>Alt Text</Label><Input {...contentForm.register(`carouselImages.${index}.alt`)} /><Label>AI Hint</Label><Input {...contentForm.register(`carouselImages.${index}.data-ai-hint`)} /></div><Button type="button" variant="destructive" size="icon" onClick={() => removeCarousel(index)}><Trash2/></Button></div>))}
                         <Button type="button" variant="outline" size="sm" onClick={() => appendCarousel({ src: '', alt: '', 'data-ai-hint': '' })}><PlusCircle className="mr-2"/>Add Carousel Image</Button></div>
                      <div className="space-y-4 p-4 border rounded-lg"><h3 className="font-headline text-xl">Homepage Programs</h3>
                        {programFields.map((field, index) => (<div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end p-2 border rounded"><div className="md:col-span-3 grid gap-2"><Label>Title</Label><Input {...contentForm.register(`programs.${index}.title`)} /><Label>Description</Label><Textarea {...contentForm.register(`programs.${index}.description`)} /><Label>Link</Label><Input {...contentForm.register(`programs.${index}.href`)} /></div><Button type="button" variant="destructive" size="icon" onClick={() => removeProgram(index)}><Trash2/></Button></div>))}
                        <Button type="button" variant="outline" size="sm" onClick={() => appendProgram({ href: '', title: '', description: '' })}><PlusCircle className="mr-2"/>Add Program</Button></div>
                       <div className="space-y-4 p-4 border rounded-lg"><h3 className="font-headline text-xl">Team Members</h3>
                        {teamFields.map((field, index) => (<div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start p-2 border rounded"><div className="md:col-span-3 grid gap-2"><Label>Name</Label><Input {...contentForm.register(`teamMembers.${index}.name`)} /><Label>Title</Label><Input {...contentForm.register(`teamMembers.${index}.title`)} /><Label>Bio</Label><Textarea {...contentForm.register(`teamMembers.${index}.bio`)} /><Label>Image URL</Label><Input {...contentForm.register(`teamMembers.${index}.imageUrl`)} /><Label>Order</Label><Input type="number" {...contentForm.register(`teamMembers.${index}.order`, {valueAsNumber: true})} /></div><Button type="button" variant="destructive" size="icon" onClick={() => removeTeam(index)}><Trash2/></Button></div>))}
                        <Button type="button" variant="outline" size="sm" onClick={() => appendTeam({ name: '', title: '', bio: '', imageUrl: '', order: teamFields.length + 1 })}><PlusCircle className="mr-2"/>Add Team Member</Button></div>
                       <div className="space-y-4 p-4 border rounded-lg"><h3 className="font-headline text-xl">Gallery Images</h3>
                        {galleryFields.map((field, index) => (<div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end p-2 border rounded"><div className="md:col-span-3 grid gap-2"><Label>Image URL</Label><Input {...contentForm.register(`galleryImages.${index}.src`)} /><Label>Alt Text</Label><Input {...contentForm.register(`galleryImages.${index}.alt`)} /><Label>CSS Class</Label><Input {...contentForm.register(`galleryImages.${index}.className`)} /><Label>Description</Label><Input {...contentForm.register(`galleryImages.${index}.description`)} /><Label>Location</Label><Input {...contentForm.register(`galleryImages.${index}.location`)} /></div><Button type="button" variant="destructive" size="icon" onClick={() => removeGallery(index)}><Trash2/></Button></div>))}
                         <Button type="button" variant="outline" size="sm" onClick={() => appendGallery({ src: '', alt: '', className: '', description: '', location: '' })}><PlusCircle className="mr-2"/>Add Gallery Image</Button></div>
                      <Button type="submit">Save All Site Content</Button>
                    </form>
                </div>
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
                <div className="mt-6 md:mt-0"><Table><TableHeader><TableRow><TableHead>Book Title</TableHead><TableHead>Author</TableHead><TableHead>Reason</TableHead><TableHead>Requested By</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
                        <TableBody>{bookRequests.map((req) => (<TableRow key={req.id}><TableCell className="font-medium">{req.title}</TableCell><TableCell>{req.author}</TableCell><TableCell className="text-sm text-muted-foreground">{req.reason}</TableCell><TableCell>{req.requestedBy}</TableCell><TableCell>{req.requestedAt ? format(req.requestedAt.toDate(), "PPP") : "N/A"}</TableCell></TableRow>))}</TableBody>
                    </Table>{bookRequests.length === 0 && (<p className="text-center text-muted-foreground py-8">No book requests yet.</p>)}</div>)
        case "mail":
            return (<div className="mt-6 md:mt-0"><form onSubmit={mailForm.handleSubmit(onMailSubmit)} className="space-y-6"><div><Label htmlFor="mail-to">Recipient Email</Label><Input id="mail-to" type="email" placeholder="recipient@example.com" {...mailForm.register("to")} /></div><div><Label htmlFor="mail-subject">Subject</Label><Input id="mail-subject" placeholder="Email Subject" {...mailForm.register("subject")} /></div><div><Label htmlFor="mail-body">Message</Label><Textarea id="mail-body" placeholder="<h1>Hello!</h1><p>This is your message.</p>" {...mailForm.register("htmlBody")} className="min-h-[250px] font-mono" /></div><Button type="submit" disabled={isSendingMail}>{isSendingMail ? <Loader2 className="animate-spin mr-2"/> : <Send className="mr-2"/>}Send Email</Button></form></div>)
        default: return null;
    }
  }

  if (authLoading || loading || !isAuthorized) {
    return (<div className="flex flex-col min-h-screen items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin" /><p className="mt-4 text-muted-foreground">{isAuthorized ? 'Loading...' : 'Verifying...'}</p></div>);
  }

  return (
    <div className="flex flex-col min-h-screen bg-background"><Header />
      <main className="flex-1 py-12"><section className="container max-w-6xl mx-auto"><Card>
              <CardHeader><CardTitle className="font-headline text-4xl">Admin Dashboard</CardTitle><CardDescription>Manage the Uvumbuzi Digital Hub.</CardDescription></CardHeader>
              <CardContent><div className="grid md:grid-cols-[240px_1fr] gap-8"><nav className="flex flex-col gap-2">
                        <Button variant={activeView === 'submissions' ? 'secondary' : 'ghost'} className={cn("justify-start", activeView === 'submissions' && "font-bold")} onClick={() => setActiveView("submissions")}><FileText className="mr-2" /> Submissions</Button>
                        <Button variant={activeView === 'courses' ? 'secondary' : 'ghost'} className={cn("justify-start", activeView === 'courses' && "font-bold")} onClick={() => setActiveView("courses")}><GraduationCap className="mr-2" /> Courses</Button>
                        <Button variant={activeView === 'projects' ? 'secondary' : 'ghost'} className={cn("justify-start", activeView === 'projects' && "font-bold")} onClick={() => setActiveView("projects")}><FolderKanban className="mr-2" /> Projects</Button>
                        <Button variant={activeView === 'books' ? 'secondary' : 'ghost'} className={cn("justify-start", activeView === 'books' && "font-bold")} onClick={() => setActiveView("books")}><Book className="mr-2" /> Books</Button>
                        <Button variant={activeView === 'bookRequests' ? 'secondary' : 'ghost'} className={cn("justify-start", activeView === 'bookRequests' && "font-bold")} onClick={() => setActiveView("bookRequests")}><Lightbulb className="mr-2" /> Book Requests</Button>
                        <Button variant={activeView === 'students' ? 'secondary' : 'ghost'} className={cn("justify-start", activeView === 'students' && "font-bold")} onClick={() => setActiveView("students")}><Users className="mr-2" /> Students</Button>
                        <Button variant={activeView === 'content' ? 'secondary' : 'ghost'} className={cn("justify-start", activeView === 'content' && "font-bold")} onClick={() => setActiveView("content")}><Settings className="mr-2" /> Site Content</Button>
                        <Button variant={activeView === 'mail' ? 'secondary' : 'ghost'} className={cn("justify-start", activeView === 'mail' && "font-bold")} onClick={() => setActiveView("mail")}><Mail className="mr-2" /> Send Mail</Button>
                    </nav><div>{renderContent()}</div></div></CardContent></Card></section></main><Footer /></div>
  );
}

    