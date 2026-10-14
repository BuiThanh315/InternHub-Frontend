import type { InternProfile } from '../../../types';

export interface AiScreeningDossierTabProps {
  intern: InternProfile;
  onApplyRejectionReason?: (reason: string) => void;
}
