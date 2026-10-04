export const MISSION_ENDPOINTS = {
  MENTOR_PROGRAMS: '/api/mentor/programs',
  PROGRAM_INTERNS: (programId: number | string) => `/api/mentor/programs/${programId}/interns`,
  PROGRAM_BOARDS: (programId: number | string) => `/api/programs/${programId}/mission-boards`,
  BOARDS: '/api/mission-boards',
  BOARD_DETAIL: (boardId: number | string) => `/api/mission-boards/${boardId}`,
  BOARD_STATUS: (boardId: number | string) => `/api/mission-boards/${boardId}/status`,
  BOARD_ITEMS: (boardId: number | string) => `/api/mission-boards/${boardId}/items`,
  ITEMS: (itemId: number | string) => `/api/mission-items/${itemId}`,
  ITEM_STATUS: (itemId: number | string) => `/api/mission-items/${itemId}/status`,
  MY_MISSIONS: '/api/mission-items/my-missions',
  MY_KANBAN: '/api/mission-items/my-missions/kanban',
} as const;
