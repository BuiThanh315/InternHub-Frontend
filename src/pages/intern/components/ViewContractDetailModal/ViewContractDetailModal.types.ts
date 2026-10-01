import type { ContractResponse } from '../../../../types';

export interface ViewContractDetailModalProps {
  contract: ContractResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onSignContract?: (contract: ContractResponse) => void;
}
