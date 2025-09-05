
"use client";

import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { differenceInYears, parse, format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

export type UserProfile = {
  fullName: string;
  email: string;
  location: string;
  dateOfBirth: any; 
  phoneNumber: string;
  gender: string;
  occupation: string;
  parentName?: string;
  parentPhoneNumber?: string;
  codingCourseProgress?: { module: number; page: number };
};

const profileSchema = z.object({
  fullName: z.string().min(3, { message: "Full name must be at least 3 characters." }),
  location: z.string().min(2, { message: "Location is required." }),
  dateOfBirth: z.string().refine((val) => /^\d{2}\/\d{2}\/\d{4}$/.test(val), {
    message: "Please enter a valid date in DD/MM/YYYY format.",
  }),
  phoneNumber: z.string().min(10, { message: "Please enter a valid phone number." }),
  gender: z.string({ required_error: "Please select a gender." }),
  occupation: z.string().min(2, { message: "Occupation is required." }),
  parentName: z.string().optional(),
  parentPhoneNumber: z.string().optional(),
}).superRefine((data, ctx) => {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(data.dateOfBirth)) {
    return;
  }
  const dob = parse(data.dateOfBirth, 'dd/MM/yyyy', new Date());
  if (isNaN(dob.getTime())) {
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
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileEditModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    user: any;
    existingProfile: any;
}

export function ProfileEditModal({ isOpen, setIsOpen, user, existingProfile }: ProfileEditModalProps) {
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
        form.reset(profileData);
    } else {
        form.reset(); // Reset to default if no profile
    }
  }, [existingProfile, form]);

  const dobWatch = useWatch({ control: form.control, name: 'dateOfBirth' });
  
  const isUnder18 = () => {
    if (dobWatch && /^\d{2}\/\d{2}\/\d{4}$/.test(dobWatch)) {
      const dob = parse(dobWatch, 'dd/MM/yyyy', new Date());
      if (!isNaN(dob.getTime())) {
        return differenceInYears(new Date(), dob) < 18;
      }
    }
    return false;
  };

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) return;
    setIsSubmitting(true);
    
    try {
      const docRef = doc(db, "userProfiles", user.uid);
      const dobDate = parse(data.dateOfBirth, 'dd/MM/yyyy', new Date());

      const dataToSave = {
        ...data,
        dateOfBirth: dobDate,
      };

      if (isProfileCreated) {
        await updateDoc(docRef, dataToSave);
      } else {
        await setDoc(docRef, { ...dataToSave, userId: user.uid, email: user.email, role: 'student' });
      }
      
      toast({
        title: "Profile Saved!",
        description: "Your information has been successfully updated.",
      });
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">
            {isProfileCreated ? "Update Your Profile" : "Create Your Profile"}
          </DialogTitle>
          <DialogDescription>
            {isProfileCreated 
              ? "Keep your information up to date." 
              : "Please complete your profile to access courses and track your progress."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="fullName" render={({ field }) => (
                <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="e.g., Jane Doe" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="location" render={({ field }) => (
                <FormItem><FormLabel>Location</FormLabel><FormControl><Input placeholder="e.g., Nairobi, Kenya" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input placeholder="e.g., 0712345678" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
                <FormItem><FormLabel>Date of Birth</FormLabel><FormControl><Input placeholder="DD/MM/YYYY" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="gender" render={({ field }) => (
                <FormItem><FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select your gender" /></SelectTrigger></FormControl>
                        <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem><SelectItem value="other">Other</SelectItem><SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem></SelectContent>
                    </Select><FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="occupation" render={({ field }) => (
                <FormItem><FormLabel>Occupation</FormLabel><FormControl><Input placeholder="e.g., Student, Developer" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              
              {isUnder18() && (
                <div className="space-y-4 p-4 border-l-4 border-primary bg-accent/50 rounded-r-lg">
                    <h3 className="font-semibold text-foreground">Parent/Guardian Information Required</h3>
                    <FormField control={form.control} name="parentName" render={({ field }) => (
                    <FormItem><FormLabel>Parent/Guardian Full Name</FormLabel><FormControl><Input placeholder="e.g., John Doe" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="parentPhoneNumber" render={({ field }) => (
                    <FormItem><FormLabel>Parent/Guardian Phone Number</FormLabel><FormControl><Input placeholder="e.g., 0712345678" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
              )}
            <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
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
