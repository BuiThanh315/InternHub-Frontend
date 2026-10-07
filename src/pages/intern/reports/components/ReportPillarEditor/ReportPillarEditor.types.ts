import type { SaveWeeklyReportPayload, WeeklyReportTaskItem } from '../../../../../types';

export interface ReportPillarEditorProps {
  formValues: SaveWeeklyReportPayload;
  onChangeField: (field: keyof SaveWeeklyReportPayload, value: string) => void;
  isEditable: boolean;
  onOpenKanbanModal: () => void;
  tasks?: WeeklyReportTaskItem[];
}
