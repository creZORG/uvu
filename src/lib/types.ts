
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

export type TutorProfile = {
  photoUrl: string;
  phoneNumber: string;
  location: string;
  bio: string;
  subjects: string[];
  qualifications: string;
  applicationStatus: 'pending' | 'approved' | 'rejected';
  availability: string;
  sessionInfo: string;
  terms: string;
}

export type UserProfile = {
  userId: string;
  email: string;
  role: 'student' | 'admin' | 'tutor' | 'visitor';
  fullName: string;
  location: string;
  dateOfBirth: any; 
  nationalId?: string;
  phoneNumber: string;
  gender: string;
  occupation: string;
  levelOfEducation: string;
  areasOfInterest: string[];
  parentName?: string;
  parentPhoneNumber?: string;
  codingCourseProgress?: { module: number; page: number };
  tutorProfile?: TutorProfile;
  status?: 'active' | 'suspended';
};

export type Project = {
  id?: string;
  title: string;
  content: string;
  imageUrls: { url: string }[];
  createdAt?: any;
};

export type Book = {
    id?: string;
    title: string;
    author: string;
    description: string;
    coverImageUrl: string;
    createdAt?: any;
}

export type BookRequest = {
    id: string;
    title: string;
    author: string;
    reason: string;
    requestedBy: string;
    requestedAt: { toDate: () => Date };
}

export type Event = {
  title: string;
  description: string;
  date: string;
  imageUrl: string;
};
    
