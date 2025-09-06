
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { differenceInYears, parse } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const isProfileComplete = (profile: any) => {
    if (!profile) return false;

    // Base required fields
    const requiredFields = ['fullName', 'location', 'dateOfBirth', 'gender', 'phoneNumber', 'levelOfEducation', 'areasOfInterest'];
    const missingBaseField = requiredFields.some(field => {
        const value = profile[field];
        if (Array.isArray(value)) {
            return value.length === 0;
        }
        return !value;
    });

    if (missingBaseField) {
        return false;
    }
    
    // Conditional check for minors
    let dob;
    if (profile.dateOfBirth?.toDate) {
      dob = profile.dateOfBirth.toDate();
    } else {
       try {
         dob = parse(profile.dateOfBirth, 'dd/MM/yyyy', new Date());
       } catch (e) {
        // If parsing fails from a string, it's incomplete
         return false;
       }
    }
   
    if (isNaN(dob.getTime())) return false; // Invalid date
    
    const age = differenceInYears(new Date(), dob);
    if (age < 18) {
        // If under 18, parent's info is required
        if (!profile.parentName || !profile.parentPhoneNumber) {
            return false;
        }
    }
    
    return true;
};
