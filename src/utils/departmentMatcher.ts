/**
 * Utility chuẩn hóa và kiểm tra đối sánh phòng ban giữa Mentor và Chương trình thực tập của TTS.
 */

export const normalizeDepartmentText = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/^(bo phan|trung tam|phong ban|phong)\s+/i, '')
    .trim();
};

export interface MentorDeptInfo {
  departmentName?: string | null;
  departmentCode?: string | null;
}

/**
 * Kiểm tra xem Mentor có thuộc cùng lĩnh vực/phòng ban với chương trình thực tập không.
 */
export const checkMentorDepartmentMatch = (
  mentor: MentorDeptInfo,
  programName?: string | null
): boolean => {
  if (!mentor.departmentName || !programName) return false;

  const progNorm = normalizeDepartmentText(programName);
  const deptNorm = normalizeDepartmentText(mentor.departmentName);
  const code = (mentor.departmentCode || '').toLowerCase();

  // 1. Kiểm tra khớp chuỗi trực tiếp
  if (deptNorm && progNorm.includes(deptNorm)) return true;
  if (code && progNorm.includes(code)) return true;

  // 2. Đối sánh theo nhóm chuyên môn cốt lõi
  // Nhóm QA / Kiểm thử
  if (
    (code === 'qa' || deptNorm.includes('kiem thu') || deptNorm.includes('chat luong')) &&
    (progNorm.includes('kiem thu') || progNorm.includes('qa') || progNorm.includes('qc') || progNorm.includes('chat luong'))
  ) {
    return true;
  }

  // Nhóm Kỹ thuật Phần mềm / Dev
  if (
    (code === 'it-dev' || deptNorm.includes('phan mem') || deptNorm.includes('ky thuat')) &&
    (progNorm.includes('phan mem') || progNorm.includes('phat trien') || progNorm.includes('backend') ||
     progNorm.includes('frontend') || progNorm.includes('fullstack') || progNorm.includes('cong nghe') ||
     progNorm.includes('cntt') || progNorm.includes('it'))
  ) {
    return true;
  }

  // Nhóm Bảo mật / ATTT
  if (
    (code === 'sec' || deptNorm.includes('an toan') || deptNorm.includes('bao mat')) &&
    (progNorm.includes('bao mat') || progNorm.includes('an toan') || progNorm.includes('security') || progNorm.includes('an ninh'))
  ) {
    return true;
  }

  // Nhóm Nhân sự / Tuyển dụng
  if (
    (code === 'hr-td' || deptNorm.includes('nhan su') || deptNorm.includes('tuyen dung')) &&
    (progNorm.includes('nhan su') || progNorm.includes('tuyen dung') || progNorm.includes('hr') || progNorm.includes('dao tao'))
  ) {
    return true;
  }

  return false;
};
