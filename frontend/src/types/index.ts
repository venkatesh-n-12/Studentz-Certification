export type Category = 'Hackathons' | 'Internships' | 'Certifications' | 'Workstations' | 'Other Programs';
export type PaymentType = 'Unpaid' | 'Paid' | 'Stipend' | 'Free';
export type Mode = 'Online' | 'Offline' | 'Hybrid';

export interface Opportunity {
  id: string;
  title: string;
  organization: string;
  category: Category;
  subCategory?: string;
  description: string;
  requirements: string[];
  benefits: string[];
  startDate: string;
  endDate: string;
  applicationDeadline: string;
  duration: string;
  mode: Mode;
  location?: string;
  price?: number;
  paymentType: PaymentType;
  certificateAvailable: boolean;
  spots?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Student' | 'Admin';
}

export interface Application {
  id: string;
  opportunityId: string;
  userId: string;
  status: 'Pending' | 'Accepted' | 'Rejected';
  appliedAt: string;
}

export interface SavedOpportunity {
  id: string;
  opportunityId: string;
  userId: string;
  savedAt: string;
}
