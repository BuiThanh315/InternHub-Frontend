import type { InternProfile } from '../../../../types';

export interface InternAcademicTabProps {
  profile: InternProfile | null;
  onOpenEditAcademic: () => void;
}
