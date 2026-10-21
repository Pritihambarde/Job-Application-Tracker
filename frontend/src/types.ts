export type JobStatus = 'Applied' | 'Interviewing' | 'Offer' | 'Rejected';

export const JOB_STATUSES: readonly JobStatus[] = [
  'Applied',
  'Interviewing',
  'Offer',
  'Rejected',
];

// Mirrors backend/models/Job.js
export interface Job {
  _id: string;
  company: string;
  role: string;
  status: JobStatus;
  link?: string;
  notes?: string;
  appliedDate?: string;
  createdAt: string;
  updatedAt?: string;
}
