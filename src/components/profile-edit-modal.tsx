
"use client";

import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { doc, setDoc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { differenceInYears, parse, format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { Checkbox } from "./ui/checkbox";
import { isProfileComplete } from "@/lib/utils";

const areasOfInterest = [
    { id: "ict", label: "ICT Literacy" },
    { id: "coding", label: "Coding" },
    { id: "graphics", label: "Graphics & Design" },
    { id: "marketing", label: "Digital Marketing" },
    { id: "entrepreneurship", label: "Entrepreneurship" },
    { id: "bpo", label: "BPO Training" },
    { id: "robotics", label: "Robotics" },
    { id: "webdev", label: "Web Development" },
    { id: "networking", label: "Networking (Fiber Optics & Radio Technology)" },
    { id: "cctv", label: "CCTV Installation" },
    { id: "access_control", label: "Access Control Systems" },
    { id: "power", label: "Power (Solar DC Option)" },
];

export type UserProfile = {
  userId: string;
  email: string;
  role: 'student' | 'admin';
  fullName: string;
  location: string;
  dateOfBirth: any; 
  phoneNumber: string;
  gender: string;
  occupation: string;
  levelOfEducation: string;
  areasOfInterest: string[];
  parentName?: string;
  parentPhoneNumber?: string;
  codingCourseProgress?: { module: number; page: number };
};

const profileSchema = z.object({
  fullName: z.string().min(3, { message: "Full name must be at least 3 characters." }),
  gender: z.string({ required_error: "Please select a gender." }),
  dateOfBirth: z.string().refine((val) => /^\d{2}\/\d{2}\/\d{4}$/.test(val), {
    message: "Please enter a valid date in DD/MM/YYYY format.",
  }),
  phoneNumber: z.string().min(10, { message: "Please enter a valid phone number." }),
  location: z.string().min(2, { message: "Area of residence is required." }),
  levelOfEducation: z.string({ required_error: "Please select your level of education." }),
  areasOfInterest: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one area of interest.",
  }),
  parentName: z.string().optional(),
  parentPhoneNumber: z.string().optional(),
  occupation: z.string().optional(),
}).superRefine((data, ctx) => {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(data.dateOfBirth)) {
      return;
    }
    try {
        const dob = parse(data.dateOfBirth, 'dd/MM/yyyy', new Date());
        if (isNaN(dob.getTime())) {
          // This case should be caught by the regex, but as a fallback.
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["dateOfBirth"], message: "Invalid date." });
          return;
        }
        const age = differenceInYears(new Date(), dob);
        if (age < 18) {
          if (!data.parentName || data.parentName.length < 3) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["parentName"],
              message: "Parent's name is required and must be at least 3 characters.",
            });
          }
          if (!data.parentPhoneNumber || data.parentPhoneNumber.length < 10) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["parentPhoneNumber"],
              message: "Parent's phone number is required.",
            });
          }
        }
    } catch (e) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["dateOfBirth"], message: "Invalid date format." });
    }
});


type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileEditModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    user: any;
    existingProfile: UserProfile | null;
    onProfileUpdate: () => void;
}

export function ProfileEditModal({ isOpen, setIsOpen, user, existingProfile, onProfileUpdate }: ProfileEditModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isProfileCreated = !!existingProfile;

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      location: "",
      dateOfBirth: "",
      phoneNumber: "",
      gender: "",
      occupation: "",
      levelOfEducation: "",
      areasOfInterest: [],
      parentName: "",
      parentPhoneNumber: "",
    },
  });

  useEffect(() => {
    if (existingProfile) {
        const profileData = {...existingProfile};
        if (profileData.dateOfBirth && profileData.dateOfBirth.toDate) {
            const date = profileData.dateOfBirth.toDate();
            profileData.dateOfBirth = format(date, 'dd/MM/yyyy');
        }
        form.reset(profileData as any);
    } else {
        form.reset({
             fullName: user?.displayName || "",
             areasOfInterest: []
        });
    }
  }, [existingProfile, form, user]);

  const dobWatch = useWatch({ control: form.control, name: 'dateOfBirth' });
  
  const isUnder18 = () => {
    if (dobWatch && /^\d{2}\/\d{2}\/\d{4}$/.test(dobWatch)) {
      try {
        const dob = parse(dobWatch, 'dd/MM/yyyy', new Date());
        if (!isNaN(dob.getTime())) {
          return differenceInYears(new Date(), dob) < 18;
        }
      } catch (e) { return false; }
    }
    return false;
  };

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) return;
    setIsSubmitting(true);
    
    try {
      const docRef = doc(db, "userProfiles", user.uid);
      const dobDate = parse(data.dateOfBirth, 'dd/MM/yyyy', new Date());

      const dataToSave: Partial<UserProfile> = {
        ...data,
        dateOfBirth: dobDate,
      };
      
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        await updateDoc(docRef, dataToSave);
      } else {
        await setDoc(docRef, { 
            ...dataToSave, 
            userId: user.uid, 
            email: user.email, 
            role: 'student' 
        });
      }
      
      toast({
        title: "Profile Saved!",
        description: "Your information has been successfully updated.",
      });
      onProfileUpdate(); // Callback to notify parent component
      setIsOpen(false);

    } catch (error) {
      console.error("Error saving profile: ", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem saving your profile.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={isProfileCreated ? setIsOpen : undefined}>
      <DialogContent className="max-h-[90vh] overflow-y-auto" hideCloseButton={!isProfileCreated}>
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">
            {isProfileCreated ? "Update Your Profile" : "Complete Your UCN Student Profile"}
          </DialogTitle>
          <DialogDescription>
            {isProfileCreated 
              ? "Keep your information up to date." 
              : "Please complete your profile to access the student portal."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pr-2">
              <FormField control={form.control} name="fullName" render={({ field }) => (
                <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="e.g., Jane Doe" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
               <FormField control={form.control} name="gender" render={({ field }) => (
                <FormItem><FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select your gender" /></SelectTrigger></FormControl>
                        <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem><SelectItem value="other">Other</SelectItem><SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem></SelectContent>
                    </Select><FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
                <FormItem><FormLabel>Date of Birth</FormLabel><FormControl><Input placeholder="DD/MM/YYYY" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
               <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input placeholder="e.g., 0712345678" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
               <FormField control={form.control} name="location" render={({ field }) => (
                <FormItem><FormLabel>Area of Residence</FormLabel><FormControl><Input placeholder="e.g., Kivumbini Estate" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
               <FormField control={form.control} name="levelOfEducation" render={({ field }) => (
                <FormItem><FormLabel>Highest Level of Education</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select level of education" /></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value="primary">Primary School</SelectItem>
                            <SelectItem value="secondary">Secondary School</SelectItem>
                            <SelectItem value="certificate">Certificate</SelectItem>
                            <SelectItem value="diploma">Diploma</SelectItem>
                            <SelectItem value="degree">Bachelors Degree</SelectItem>
                            <SelectItem value="masters">Masters Degree</SelectItem>
                            <SelectItem value="phd">PhD</SelectItem>
                            <SelectItem value="none">None</SelectItem>
                        </SelectContent>
                    </Select><FormMessage />
                </FormItem>
              )} />

              <FormField
                control={form.control}
                name="areasOfInterest"
                render={() => (
                    <FormItem>
                    <div className="mb-4">
                        <FormLabel className="text-base">Areas of Interest</FormLabel>
                        <p className="text-sm text-muted-foreground">Select all the skills you're interested in learning.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {areasOfInterest.map((item) => (
                        <FormField
                            key={item.id}
                            control={form.control}
                            name="areasOfInterest"
                            render={({ field }) => {
                            return (
                                <FormItem
                                key={item.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                <FormControl>
                                    <Checkbox
                                    checked={field.value?.includes(item.label)}
                                    onCheckedChange={(checked) => {
                                        return checked
                                        ? field.onChange([...(field.value || []), item.label])
                                        : field.onChange(
                                            field.value?.filter(
                                                (value) => value !== item.label
                                            )
                                            )
                                    }}
                                    />
                                </FormControl>
                                <FormLabel className="font-normal">
                                    {item.label}
                                </FormLabel>
                                </FormItem>
                            )
                            }}
                        />
                        ))}
                    </div>
                    <FormMessage />
                    </FormItem>
                )}
                />
              
              {isUnder18() && (
                <div className="space-y-4 p-4 border-l-4 border-primary bg-accent/50 rounded-r-lg mt-6">
                    <h3 className="font-semibold text-foreground">Parent/Guardian Information Required (Under 18)</h3>
                    <FormField control={form.control} name="parentName" render={({ field }) => (
                    <FormItem><FormLabel>Parent/Guardian Full Name</FormLabel><FormControl><Input placeholder="e.g., John Doe" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="parentPhoneNumber" render={({ field }) => (
                    <FormItem><FormLabel>Parent/Guardian Phone Number</FormLabel><FormControl><Input placeholder="e.g., 0712345678" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
              )}
            <DialogFooter className="pt-4">
                 {isProfileCreated && <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>}
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="animate-spin mr-2" />}
                    {isProfileCreated ? "Update Profile" : "Save and Continue"}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
