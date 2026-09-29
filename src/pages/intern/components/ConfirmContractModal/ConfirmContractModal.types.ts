import type { ContractResponse } from '../../../../types';

export interface ConfirmContractModalProps {
  contract: ContractResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedContract: ContractResponse) => void;
  onOpenReject: (contract: ContractResponse) => void;
  defaultSignerName?: string;
}
