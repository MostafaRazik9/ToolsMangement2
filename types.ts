
export interface ReportHeader {
  dfrDate: string;
  ownerId: string;
  ownerName: string;
  department: string;
  shift: string;
}

export interface DefectItem {
  id: string; // Unique ID for React key
  toolId: string;
  serial: string;
  description: string;
  status: 'New' | 'Repairable' | 'Scrap' | 'Needs Inspection' | 'In Service' | '';
  quantity: number;
  recommendedAction: string;
  comment: string;
  defectType?: 'Misuse' | 'Wear and Tear' | '';

  // Extended properties for database from user request
  category?: string;
  standardToolName?: string;
  cost?: number;
  toolBrand?: string;
  ownerId?: string;
  ownerName?: string; // Replaces 'owner'
  ownerTrade?: string;
  ownerGrade?: string;
  ownerDepartment?: string;
  ownerShift?: string;
  handoverDate?: string;
  lastAudit?: string;
  auditor?: string;
  nextAuditDue?: string;
  defectFlag?: boolean;
  scrapDate?: string;
  defectReportNumber?: string;
}

export interface ToolOwner {
  id: string; // React key
  ownerId: string; // The unique ID for the user
  ownerName: string;
  ownerTrade: string;
  ownerGrade: string;
  ownerDepartment: string;
  ownerShift: string;
}

export interface AppUser {
  id: string;
  username: string;
  password: string; // Plain text for this example, use hashing in a real app
  role: 'Admin' | 'Supervisor' | 'Technician';
  // Link to a ToolOwner if the AppUser is also a tool owner
  toolOwnerId?: string; 
}


export interface AISuggestion {
  status: 'Repairable' | 'Scrap' | 'Needs Inspection';
  recommendedAction: string;
}

export interface DefectReport {
  id: string; // e.g., DFR-001
  dfrDate: string;
  ownerId: string;
  ownerName: string;
  department: string;
  shift: string;
  submittedBy: string; // username of the submitter
  status: 'Pending Approval' | 'Approved' | 'Rejected';
  items: DefectItem[];
  photo?: string; // base64 data URL for technician-submitted reports
}