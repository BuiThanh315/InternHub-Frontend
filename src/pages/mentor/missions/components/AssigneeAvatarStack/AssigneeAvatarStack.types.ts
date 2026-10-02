import type { AssigneeResponse } from '../../../../../types';

export interface AssigneeAvatarStackProps {
  assignees: AssigneeResponse[];
  maxVisible?: number;
  size?: 'sm' | 'md';
  className?: string;
}
