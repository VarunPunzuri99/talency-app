export type Contact = {
  firstName: string;
  lastName: string;
  referredBy?: string;
  contactDetails?: ContactInformation[];
  contactAddress?: AddressInformation;
  designation?: string;
  industry?: string;
  accountOrg?: string;
  salesRepOrg?: string;
  linkedInUrl?: string;
  businessUnit?: string;
  reportingTo?: string;
  assignTo?: string;
  country?: string,
  state?: string,
  status?: AccountStatus;
  imageUrl?: string;
  favourite?: boolean;
  isDeleted?: boolean;
  createdBy: BasicUser;
  createdAt?: Date;
  updatedAt?: Date;
  __v?: number;
  _id?: string;
  id?: string;
};


export type BusinessUnit = {
  _id: string;
  label: string;
  key: string;
  parentBusinessUnit?: BusinessUnit | string;
  org: Org | string;
  isDeleted?: boolean;
  createdBy: BasicUser | string;
  level: number;
  type: BusinessUnitType;
  children?: (string | BusinessUnit)[];
};


export enum BusinessUnitType {
  UNSPECIFIED = 'unspecified',
  DEPARTMENT = 'department',
  INTERNAL_RECRUITER = 'internal-recruiter',
  EXECUTIVE = 'executive',
  RECRUITMENT = 'recruitment',
  HUMAN_RESOURCES = 'human-resources',
  FINANCE = 'finance',
  ACCOUNTING = 'accounting',
  OPERATIONS = 'operations',
  ENGINEERING = 'engineering',
  MARKETING = 'marketing',
  SALES = 'sales',
  PRODUCT_DEVELOPMENT = 'product-development',
  LEGAL = 'legal',
  ADMINISTRATION = 'administration',
  TECHNICAL = 'Technical'
}

export type BasicUser = {
  name: any;
  _id?: string;
  email: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  contactNumber?: string;
  designation?: string;
  location?: string;
  isVerified?: boolean;
  isApproved?: boolean;
  password: string;
  roles?: Role[];
  isDeleted?: boolean;
  isSuspended?: boolean;
  isRejected?: boolean;
  isBlocked?: boolean;
  country: Country;
  state?: State;
  status?: string;
  verification?: string;
  apikey?: string;
  otpCode?: string;
  verified?: boolean;
  verificationExpires?: Date;
  loginAttempts: number;
  blockExpires?: Date;
  org?: Org;
  contactDetails?: ContactInformation[];
  interestedCountries?: string[];
  interestedDomains?: string[];
  interestedSkills?: string[];
};

export type Status = {
  _id?: string;
  name: string;
  description?: string,
  isDeleted?: boolean;
  statusType?: string;
  createdAt?: Date;
  updatedAt?: Date;
  __v?: number;
}


export type Country = {
  _id?: string;
  countryName: string;
  countryPhoneCode: string;
  currencyCode: string;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  __v?: number;
};


export type State = {
  _id?: string,
  stateName: string;
  isDeleted?: boolean;
  country: Country | string;
  createdAt?: Date;
  updatedAt?: Date;
  __v?: number;
}

export type Region = {
  _id?: string,
  country: Country | string,
  state: State | string,
  status?: Status | string,
  createdAt?: Date;
  updatedAt?: Date;
  __v?: number;
}


export type Industry = {
  _id: string;
  name: string;
  description?: string;
  code?: string;
  createdBy: BasicUser;
  isDeleted?: boolean;
}


export type Org = {
  title: string;
  description?: string;
  logo?: string;
  legalName?: string;
  websiteUrl?: string;
  contactDetails?: ContactInformation[];
  contactAddress?: AddressInformation[];
  industryOrDomain?: string;
  businessUnit?: string;
  linkedInUrl?: string;
  isDeleted?: boolean;
  isSuspended?: boolean;
  isBlocked?: boolean;
  isApproved?: boolean;
  headCount?: HeadCount;
  country?: string,
  state?: string,
  parentOrg?: string;
  reportingTo?: BasicUser;
  assignTo?: string;
  isDuplicate?: boolean;
  status?: OrgStatus;
  accountType?: AccountType;
  orgType: OrgType;
  createdBy: BasicUser;
  socialMediaLinks?: SocialMediaLink[];
  createdAt?: Date;
  updatedAt?: Date;
  _id?: string;
};


export type ContactInformation = {
  contactEmail?: string;
  contactNumber?: string;
  isPrimary?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type AddressInformation = {
  apartment?: string;
  street?: string;
  city?: string;
  postalCode?: string;
  addressType?: AddressType;
  createdAt?: Date;
  updatedAt?: Date;
}


export type AccountType = {
  name: string;
  description?: string;
  isDeleted?: boolean;
  createdBy: BasicUser;
  _id?: string;
};


export type SocialMediaLink = {
  platform: string;
  url: string;
  _id?: string;
};


export type Note = {
  org?: Org;
  contact: Contact;
  title?: string;
  summary?: string;
  isPrivate?: boolean;
  createdBy: BasicUser;
  isDeleted?: boolean;
  attachments?: string[];
  _id?: string;
};

export type Activity = {
  title?: string;
  titleWithPlaceholders?: string;
  dueDate?: Date;
  parentActivity?: any;
  org?: Org;
  contact?: Contact;
  task?: Task;
  note?: Note;
  isDeleted?: boolean;
  actor: BasicUser;
  audience: BasicUser[];
  comment?: Comment;
  _id?: string;
  titleColor?: string;
}

export type Task = {
  title?: string;
  summary?: string;
  dueDate?: Date | null;
  location?: string;
  org?: string;
  spoc?: string;
  assignees?: string[];
  priority?: string;
  parentTask?: string;
};

export type Job = {
  title: string;
  jobType?: JobType;
  department?: string;
  noOfVacancies?: number;
  jdUrl?: string;
  employmentType?: EmploymentType;
  workMode?: WorkMode;
  description?: string;
  primarySkills?: string[];
  secondarySkills?: string[];
  workExperience?: {
    minimum?: number;
    maximum?: number;
  };
  jobLocation?: JobLocation
  industryOrDomain?: string;
  educationalQualification?: string[];
  videoProfileRequested?: boolean;
  hiringMode?: HiringMode;
  instructionsToRecruiter?: string;
  instructionsVideoUrl?: string;
  questionAnswers?: {
    question?: string;
    answer?: string;
  }[];
  shareOnSocialMedia?: boolean;
  shareWithVendors?: boolean;
  socialMediaLinks?: string[];
  vendors?: string[];
  isDeleted?: boolean;
  createdBy?: string;
  postingOrg: Org;
  hiringOrg?: Org;
  jobCode?: number;
  isOpen?: boolean;
  workflow: string;
  _id?: string;
  createdAt?: Date;
};



export type JobLocation = {
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  _id?: string;
};
export type WorkExperience = {
  jobTitle?: string;
  companyName?: string;
  jobStartDate?: Date;
  jobEndDate?: Date;
  currentlyWorking?: boolean;
  createdBy: BasicUser;
  _id?: string;
}


export type Workflow = {
  name: string;
  stages: Stage[];
  department?: string;
  isDefault?: boolean;
  isActive?: boolean;
  org: string;
  _id?: string;
  businessUnitId?: string;
};

export type Stage = {
  name: string;
  type: StageType;
  sequenceNumber?: number;
  jobApplicationsCount?: number;
  iconUrl?: string;
  _id?: string;
}

export type Assessment = {
  jobApplication: JobApplication;
  subject: string;
  message: string;
  assessmentFiles: FileMetadata[];
  _id?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type candidateOffer = {
  jobApplication: JobApplication;
  dateOfJoining: Date;
  salaryPerAnnum: number;
  _id?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type JobApplication = {
  stage: any;
  jobId?: string;
  workflow?: any;
  resumeMetadata?: string;
  coverLetterMetadata?: string;
  firstName?: string;
  lastName?: string;
  panNumber?: string;
  contactDetails?: {
    contactEmail?: string;
    contactNumber?: string;
  };
  contactAddress?: {
    street?: string;
    city?: string;
    postalCode?: string;
  };
  state?: string;
  country?: string;
  dob?: Date;
  gender?: string;
  disability?: boolean;
  nationality?: string;
  linkedInUrl?: string;
  websiteOrBlogUrl?: string;
  isExperienced?: boolean;
  yearsOfExperience?: number;
  workExperience?: string[];
  educationQualification?: string[];
  evaluationForm?: string[];
  noticePeriodDays?: number;
  servingNoticePeriod?: boolean;
  lastWorkingDate?: Date;
  currentLocation?: string;
  willingToRelocate?: boolean;
  reLocation?: string[];
  preferredLocation?: string;
  currentCTC?: number;
  expectedCTC?: number;
  ctcPercentage?: number;
  currency?: string;
  companyNorms?: boolean;
  org?: string;
  isDraft?: boolean;
  communicationSkillRating: number;
  bgvVerified: boolean;
  isScreenSelected: boolean;
  isRejected: boolean;
  _id: string
};

export type Interview = {
  jobApplication: JobApplication;
  interviewDate: Date;
  technicalPanel: BasicUser[];
  others?: string[];
  screeningType?: ScreeningType;
  platform?: Platform;
  meetingUrl?: string;
  meetingId?: number;
  meetingCode?: number;
  _id?: string;
}

export type EvaluationForm = {
  skill: string;
  years?: number;
  months?: number;
  rating: number;
  isPrimary: boolean;
  _id?: string;
};


export type FileMetadata = {
  _id?: string;
  originalName: string;
  uniqueName: string;
  fileSize: number;
  fileType: string;
  uploadedBy: BasicUser | string;
  locationUrl?: string;
  etag?: string;
  createdAt?: Date;
  updatedAt?: Date;
  __v?: number;
  fileMetaDataCode?: string;
  status?: string;
}

export type Message = {
  subject: string;
  sender: BasicUser | string;
  recipients: BasicUser[] | string[];
  contents?: string;
  starredBy: BasicUser[] | string[];
  isDeleted?: boolean;
  attachments?: FileMetadata[] | string[];
  members?: string;
  deletedBy?: BasicUser[] | string[];
  task?: string | Task;
  org?: string | Org;
  contact?: string | Contact;
  job?: string | Job;
  _id?: string;
  createdAt?: Date;
  updatedAt?: Date;
  __v?: number;
  readStatus?: Map<string, boolean>
}

export type Identifier = {
  name: string;
  isUpload?: boolean;
  isTaxIdentifier?: boolean;
  isEntityIdentifier?: boolean;
  isType?: string;
  region?: string;
  isActive?: boolean;
  isSuspended?: boolean;
  isOptional?: boolean;
  _id?: string;
  createdAt?: Date;
  updatedAt?: Date;
  __v?: number;
}

export type IdentifierDataRow = {
  identifier: string | Identifier;
  value?: string;
  attachmentUrls?: FileMetadata[];
  _id?: string;
}

export type Onboarding = {
  identifiers: IdentifierDataRow[];
  user?: string | BasicUser;
  org?: string | Org;
  _id?: string;
  createdAt?: Date;
  updatedAt?: Date;
  __v?: number;
  id?: string;
}

export type JobsCountResponse = {
  jobsCount: number;
  jobsOpen: number;
};

export type GetAllJobsParams = {
  name?: string;
  postingOrg?: string;
  locationId?: string;
  department?: string;
  isOpen?: boolean;
  isDraft?: string;
  page?: number;
  limit?: number;
};

export enum HeadCount {
  NOT_SPECIFIED = 'not-specified',
  ONE_TO_TEN = '1-to-10',
  ELEVEN_TO_HUNDRED = '11-to-100',
  HUNDRED_AND_ONE_TO_THOUSAND = '101-to-1000',
  THOUSAND_PLUS = '1000-plus',
}

export enum AccountStatus {
  QUALIFIED = 'qualified',
  PROSPECT = 'prospect',
  DORMANT = 'dormant',
  CLIENT = 'client',
  CUSTOMER = 'customer',
  DEAD = 'dead',
}

export enum ClientStatus {
  QUALIFIED = 'qualified',
  PROSPECT = 'prospect',
  DORMANT = 'dormant',
  CLIENT = 'client',
  DEAD = 'dead',
}

export enum OrgStatus {
  QUALIFIED = 'qualified',
  PROSPECT = 'prospect',
  DORMANT = 'dormant',
  CLIENT = 'client',
  CUSTOMER = 'customer',
  DEAD = 'dead',
}

export enum OrgType {
  NONE = 'none',
  ADMIN_ORG = 'admin-org',
  AGENCY_ORG = 'agency-org',
  CUSTOMER_ORG = 'customer-org',
  ACCOUNT_ORG = 'account-org',
  ROOT_ORG = 'root-org'
}

export enum AddressType {
  HOME = 'home',
  OFFICE = 'office',
  BILLING = 'billing',
  SHIPPING = 'shipping',
  WORK = 'work',
  OTHER = 'other'
}


export enum StageType {
  NONE = 'none',
  WORKFLOW_SOURCING = 'workflow.sourcing',
  WORKFLOW_PHONE_SCREENING= 'workflow.phone.screening',
  WORKFLOW_SCREENING = 'workflow.screening',
  WORKFLOW_ASSESSMENT = 'workflow.assessment',
  WORKFLOW_INTERVIEW_TELEPHONIC = 'workflow.interview.telephonic',
  WORKFLOW_INTERVIEW_VIDEO = 'workflow.interview.video',
  WORKFLOW_INTERVIEW_IN_PERSON = 'workflow.interview.inperson',
  WORKFLOW_OFFER = 'workflow.offer',
  WORKFLOW_REJECTION = 'workflow.rejection ',
}

//Task Priority
export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

//Task Status
export enum TaskStatus {
  TO_DO = 'TO-DO',
  IN_PROGRESS = 'IN-PROGRESS',
  COMPLETED = 'COMPLETED'
}

export enum EventTitle {
  NOTE_CREATED = 'New Note Created',
  NOTE_UPDATED = ' Note Updated.',
  NOTE_DELETED = 'Note Deleted.',
  TASK_CREATED = 'New Task Created.',
  TASK_UPDATED = 'Task Updated.',
  TASK_CHANGEASSIGNEE = 'Task Assignee Changed.',
  TASK_CHANGESTATUS = 'Task Status Changed.',
  TASK_DELETED = 'Task Deleted.',
  CONTACT_CREATED = '${newContact.createdBy} added a new contact ${newContact.name}.',
  CONTACT_UPDATED = 'Contact Updated.',
  CONTACT_CHANGESTATUS = 'Contact Status Changed.',
  CONTACT_MOVED = 'Contact Ownership Modified.',
  ACCOUNT_CREATED = `{accountCreatedBy} added a new account {accountName}.`,
  ACCOUNT_UPDATED = 'Account Updated.',
  ACCOUNT_CHANGESTATUS = 'Account Status Changed.',
  ACCOUNT_MOVED = 'Account Ownership Modified.'
}

export enum RecurrenceInterval {
  DAILY = 'DAILY',
  WEEKLY = 'MONTHLY',
  YEARLY = 'YEARLY'
}

export enum EmailSubject {
  Welcome = 'Welcome to CodingLimits!',
  ConfirmEmail = 'Your Email is Confirmed!',
  ForgotPassword = 'Verify to reset your password',
  ForgotPasswordDone = 'Your Email is Confirmed to reset password!',
  PasswordReset = 'Password is reset.',
  PasswordChange = 'Password is changed.',
  TaskAssigneeChanged = 'Task is assigned to you.',
  ContactAssignToChanged = 'Contact is assigned to you.',
  InterviewSchedule = 'Your interview is scheduled'
}

export enum EmailMessage {
  Welcome = 'Thank you for registering with us.',
  ConfirmEmail = 'We are excited to have you on board.',
  ForgotPassword = 'We received a request for forgot password.',
  ForgotPasswordDone = 'Your Email is Confirmed to reset password!',
  PasswordReset = 'Your password has been reset.',
  PasswordChange = 'Your password has been changed.',
  TaskAssigneeChanged = 'Task is assigned to you.',
  ContactAssignToChanged = 'Contact is assigned to you.',
  InterviewSchedule = 'We are pleased to inform you that you have been scheduled for an interview'
}

export enum EmailInfo {
  Welcome = 'Please confirm your email address by clicking the button below.',
  ConfirmEmail = 'Your email address has been successfully confirmed. You can now access all the features of our platform.',
  ForgotPassword = 'Please confirm your email address by clicking the button below.',
  ForgotPasswordDone = 'Please reset your password.',
  PasswordReset = 'Please login with your new password.',
  PasswordChange = 'Please login with your new password',
  TaskAssigneeChanged = 'Please view by clicking the button below.',
  ContactAssignToChanged = 'Contact is assigned to you.',
  InterviewSchedule = 'Please contact us if you have any questions or need to reschedule'
}

export enum EmailButtonText {
  Welcome = 'Confirm Email',
  Login = 'Login',
  ForgotPassword = 'Change Password',
  TaskAssigneeChanged = 'View Task',
  ContactAssignToChanged = 'View Contact',
  InterviewSchedule = 'view interview'
}

export enum EmploymentType {
  FullTime = 'full-time',
  PartTime = 'part-time',
  Contract = 'contract',
  Temporary = 'temporary'
}

export enum WorkMode {
  Remote = 'remote',
  Hybird = 'hybrid',
  OnSite = 'onsite'
}

export enum HiringMode {
  Scheduled_Interview = 'scheduled-interview',
  Walk_In = 'walk-in',
  Drive = 'drive',
  On_Campus = 'on-campus',
  Off_Campus = 'off-campus'
}


export enum Currency {
  INR = 'INR',
  USD = 'USD'
}

export enum JobType {
  Internal = 'Internal',
  External = 'External'
}

export enum IdentifierType {
  Company = 'Company',
  Individual = 'Individual'
}

export enum CountryStatus {
  Approved = 'Approved',
  Rejected = 'Rejected',
  Pending = 'Pending',
  Suspended = 'Suspended',
}

export enum ScreeningType {
  PhoneScreening = 'phone-screening',
  VideoScreening = 'video-screening'
}

export enum Platform {
  GoogleMeet = 'Google-meet',
  ZoomMeet = 'Zoom-meet',
  MicrosoftTeams = 'Microsoft-teams'
}

export enum Role {
  User = 'user',
  Admin = 'admin',
  BUHead = 'bu_head',
  ResourceManager = 'resource_manager',
  DeliveryManager = 'delivery_manager',
  TeamLead = 'team_lead',
  Recruiter = 'recruiter',
  AccountManager = 'account_manager',
}

export enum SourceType {
  LANDING_PAGE = 'landingPage',
  ADMIN_PORTAL = 'adminPortal',
  MOBILE_APP = 'mobileApp',
  OTHER = 'other'
}

// shared/types/screening-type.ts
export enum InterviewType {
  PHONE_SCREENING = 'phone-screening',
  VIDEO_SCREENING = 'video-screening',
  IN_PERSON_SCREENING = 'in-person-screening',
}



