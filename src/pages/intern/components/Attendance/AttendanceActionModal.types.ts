export type AttendanceActionType = 'CHECK_IN' | 'CHECK_OUT';

export interface AttendanceActionModalProps {
  actionType: AttendanceActionType;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  officeName?: string;
  allowedRadiusMeters?: number;
  officeLatitude?: number;
  officeLongitude?: number;
}
