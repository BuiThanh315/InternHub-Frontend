import type { ContractResponse } from '../../../../types';

export interface RejectContractModalProps {
  contract: ContractResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedContract: ContractResponse) => void;
}
