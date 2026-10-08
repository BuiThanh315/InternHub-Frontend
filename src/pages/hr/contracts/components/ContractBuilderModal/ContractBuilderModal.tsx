import React, { useState, useEffect, useMemo } from 'react';
import { dynamicContractService } from '../../../../../services/contractService';
import { internService } from '../../../../../services/internService';
import { ContractDocumentViewer } from '../../../../../components/contract/ContractDocumentViewer';
import type {
  DynamicContractResponse,
  ContractTemplateResponse,
  InternProfile,
  MentorOption,
} from '../../../../../types';
import styles from './ContractBuilderModal.module.css';

interface ContractBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  intern: InternProfile;
  onSuccess: (contract: DynamicContractResponse) => void;
}

export const ContractBuilderModal: React.FC<ContractBuilderModalProps> = ({
  isOpen,
  onClose,
  intern,
  onSuccess,
}) => {
  // Templates state
  const [templates, setTemplates] = useState<ContractTemplateResponse[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number>(1);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // Available Mentors Master Data (Fallback nếu intern chưa được gán mentor)
  const [availableMentors, setAvailableMentors] = useState<MentorOption[]>([]);
  const [loadingMentors, setLoadingMentors] = useState(false);

  // Hàm chuẩn hóa tên bộ phận tiếp nhận chuẩn pháp lý (loại bỏ chữ "Thực Tập Sinh" và năm)
  const normalizeDepartmentName = (deptName?: string | null, progName?: string | null): string => {
    if (deptName && deptName.trim()) return deptName.trim();
    if (!progName || !progName.trim()) return 'Khối Công Nghệ & Kỹ Thuật';

    let cleaned = progName
      .replace(/^(chương trình\s+)?thực\s*tập\s*sinh\s+/i, '')
      .replace(/\b(năm\s+)?20\d\d\b/gi, '')
      .trim();

    if (!cleaned) return 'Khối Công Nghệ & Kỹ Thuật';

    // Thêm tiền tố Phòng/Bộ phận nếu chưa có
    if (!/^(phòng|bộ phận|ban|khối|trung tâm)/i.test(cleaned)) {
      cleaned = `Phòng ${cleaned}`;
    }
    return cleaned;
  };

  // Form Fields - Pre-fill 100% từ hồ sơ thực tế của Intern
  const [position, setPosition] = useState(intern.appliedPosition || 'Thực tập sinh');
  const [department, setDepartment] = useState(
    normalizeDepartmentName(intern.desiredDepartmentName, intern.programName)
  );
  const [selectedMentorName, setSelectedMentorName] = useState(
    intern.mentorName || ''
  );
  const [allowanceAmount, setAllowanceAmount] = useState<number>(3000000);
  const [startDate, setStartDate] = useState(
    intern.startDate ? intern.startDate.substring(0, 10) : '2026-11-01'
  );
  const [endDate, setEndDate] = useState(
    intern.endDate ? intern.endDate.substring(0, 10) : '2027-02-01'
  );
  const [customTerms, setCustomTerms] = useState('');

  // Submit states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset & nạp lại giá trị khi intern prop thay đổi
  useEffect(() => {
    if (!isOpen) return;
    setPosition(intern.appliedPosition || 'Thực tập sinh');
    setDepartment(normalizeDepartmentName(intern.desiredDepartmentName, intern.programName));
    setSelectedMentorName(intern.mentorName || '');
    if (intern.startDate) setStartDate(intern.startDate.substring(0, 10));
    if (intern.endDate) setEndDate(intern.endDate.substring(0, 10));
  }, [intern, isOpen]);

  // Load Templates & Available Mentors
  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      // 1. Fetch Templates
      try {
        setLoadingTemplates(true);
        const tplData = await dynamicContractService.getTemplates();
        if (tplData && tplData.length > 0) {
          setTemplates(tplData);
          setSelectedTemplateId(tplData[0].id);
        }
      } catch (err: any) {
        console.warn('Không thể tải danh sách template:', err);
      } finally {
        setLoadingTemplates(false);
      }

      // 2. Fetch Available Mentors (nếu intern chưa có mentor hoặc muốn đổi)
      try {
        setLoadingMentors(true);
        const mentorList = await internService.getAvailableMentors();
        setAvailableMentors(mentorList);
        // Nếu intern chưa có mentor và có danh sách, chọn mentor đầu tiên làm mặc định
        if (!intern.mentorName && mentorList.length > 0) {
          setSelectedMentorName(mentorList[0].fullName);
        }
      } catch (err: any) {
        console.warn('Không thể tải danh sách mentor:', err);
      } finally {
        setLoadingMentors(false);
      }
    };

    fetchData();
  }, [isOpen, intern.mentorName]);

  // Template được chọn
  const currentTemplate = useMemo(() => {
    return templates.find((t) => t.id === selectedTemplateId);
  }, [templates, selectedTemplateId]);

  // Live A4 Canonical HTML Render (Thay thế placeholder Mustache tức thì)
  const livePreviewHtml = useMemo(() => {
    const rawTemplate =
      currentTemplate?.latestVersion?.contentTemplate ||
      `
      <div style="font-family: 'Times New Roman', Times, serif; color: #111; line-height: 1.6;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h3 style="margin: 0; text-transform: uppercase; font-size: 15px; font-weight: bold;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h3>
          <p style="margin: 2px 0 0; font-size: 14px; text-decoration: underline; font-weight: bold;">Độc lập - Tự do - Hạnh phúc</p>
        </div>

        <h2 style="text-align: center; font-size: 18px; font-weight: bold; margin-bottom: 20px; text-transform: uppercase;">
          THỎA THUẬN HỢP ĐỒNG THỰC TẬP
        </h2>

        <p>Căn cứ nhu cầu tiếp nhận thực tập và năng lực của ứng viên, hôm nay tại văn phòng Công ty, chúng tôi gồm có:</p>

        <h4 style="margin: 12px 0 6px; font-weight: bold; font-size: 14px;">BÊN A: BÊN TIẾP NHẬN THỰC TẬP (CÔNG TY)</h4>
        <ul style="list-style: none; padding-left: 0; margin: 0 0 12px;">
          <li>- Đại diện: <strong>Phòng Quản Trị Nhân Sự</strong></li>
          <li>- Bộ phận tiếp nhận: <strong>{{contract.department}}</strong></li>
          <li>- Người hướng dẫn trực tiếp: <strong>{{contract.supervisor}}</strong></li>
        </ul>

        <h4 style="margin: 12px 0 6px; font-weight: bold; font-size: 14px;">BÊN B: THỰC TẬP SINH</h4>
        <ul style="list-style: none; padding-left: 0; margin: 0 0 12px;">
          <li>- Họ và tên: <strong>{{intern.fullName}}</strong></li>
          <li>- Mã số định danh / CCCD: <strong>{{intern.cccd}}</strong></li>
          <li>- Trường đào tạo: <strong>{{intern.university}}</strong></li>
          <li>- Email liên hệ: <strong>{{intern.email}}</strong></li>
          <li>- Số điện thoại: <strong>{{intern.phone}}</strong></li>
        </ul>

        <h4 style="margin: 12px 0 6px; font-weight: bold; font-size: 14px;">ĐIỀU 1: VỊ TRÍ VÀ THỜI GIAN THỰC TẬP</h4>
        <p>- Vị trí thực tập: <strong>{{contract.position}}</strong></p>
        <p>- Thời hạn: Từ ngày <strong>{{contract.startDate}}</strong> đến hết ngày <strong>{{contract.endDate}}</strong>.</p>

        <h4 style="margin: 12px 0 6px; font-weight: bold; font-size: 14px;">ĐIỀU 2: PHỤ CẤP VÀ CHẾ ĐỘ ĐÀO TẠO</h4>
        <p>- Mức phụ cấp hỗ trợ hàng tháng: <strong>{{contract.allowance}}</strong>.</p>
        <p>- Mức hỗ trợ trên căn cứ theo kết quả chấm công và đánh giá chuyên cần trong kỳ thực tập.</p>

        <h4 style="margin: 12px 0 6px; font-weight: bold; font-size: 14px;">ĐIỀU 3: QUYỀN HẠN VÀ TRÁCH NHIỆM BẢO MẬT</h4>
        <p>- Tuân thủ nghiêm ngặt nội quy lao động, quy chế an toàn thông tin và văn hóa doanh nghiệp của Công ty.</p>
        <p>- Bảo mật tuyệt đối mọi thông tin kỹ thuật, mã nguồn, tài liệu dự án và bí mật kinh doanh cả trong và sau thời gian thực tập.</p>

        <h4 style="margin: 12px 0 6px; font-weight: bold; font-size: 14px;">ĐIỀU 4: ĐIỀU KHOẢN BỔ SUNG & THI HÀNH</h4>
        <p>- Điều khoản riêng: <strong>{{contract.customTerms}}</strong>.</p>
        <p>- Hai bên cam kết thực hiện đúng các điều khoản đã thỏa thuận trong hợp đồng. Hợp đồng có hiệu lực kể từ ngày hai bên hoàn tất ký kết.</p>

        <div style="margin-top: 40px; display: flex; justify-content: space-between; text-align: center;">
          <div style="width: 45%;">
            <p style="font-weight: bold; margin-bottom: 60px;">ĐẠI DIỆN BÊN A</p>
            <p>(Ký, ghi rõ họ tên)</p>
          </div>
          <div style="width: 45%;">
            <p style="font-weight: bold; margin-bottom: 60px;">ĐẠI DIỆN BÊN B</p>
            <p><strong>{{intern.fullName}}</strong></p>
          </div>
        </div>
      </div>
    `;

    const formattedAllowance = Number(allowanceAmount || 0).toLocaleString('vi-VN');

    let rendered = rawTemplate
      .replace(/{{contract\.department}}/g, department)
      .replace(/{{contract\.supervisor}}/g, selectedMentorName || 'Chưa phân công Mentor')
      .replace(/{{contract\.position}}/g, position)
      .replace(/{{contract\.startDate}}/g, startDate)
      .replace(/{{contract\.endDate}}/g, endDate)
      .replace(/{{contract\.allowance}}/g, formattedAllowance + ' VND / tháng')
      .replace(/{{contract\.customTerms}}/g, customTerms && customTerms.trim() ? customTerms.trim() : 'Thực hiện theo quy chế công ty')
      .replace(/{{intern\.fullName}}/g, intern.fullName)
      .replace(/{{intern\.cccd}}/g, intern.internCode || 'Chưa cấp')
      .replace(/{{intern\.email}}/g, intern.email || 'ungvien@internhub.vn')
      .replace(/{{intern\.phone}}/g, intern.phone || 'Chưa cập nhật')
      .replace(/{{intern\.university}}/g, `${intern.university} (${intern.major})`)
      // Fallback cho biến không tiền tố
      .replace(/{{department}}/g, department)
      .replace(/{{supervisorName}}/g, selectedMentorName || 'Chưa phân công Mentor')
      .replace(/{{internFullName}}/g, intern.fullName)
      .replace(/{{internEmail}}/g, intern.email || 'ungvien@internhub.vn')
      .replace(/{{internPhone}}/g, intern.phone || 'Chưa cập nhật')
      .replace(/{{university}}/g, intern.university || 'Đại học Bách Khoa / ĐHQG')
      .replace(/{{major}}/g, intern.major || 'Công nghệ thông tin')
      .replace(/{{position}}/g, position)
      .replace(/{{startDate}}/g, startDate)
      .replace(/{{endDate}}/g, endDate)
      .replace(/{{formattedAllowance}}/g, formattedAllowance);

    return rendered;
  }, [
    currentTemplate,
    position,
    department,
    selectedMentorName,
    allowanceAmount,
    startDate,
    endDate,
    customTerms,
    intern,
  ]);

  if (!isOpen) return null;

  // Thực thi Lưu bản nháp (Save Draft)
  const handleSaveDraft = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await dynamicContractService.createDraft({
        internId: intern.id,
        programId: intern.programId || 1,
        templateId: selectedTemplateId || 1,
        position,
        department,
        supervisorName: selectedMentorName,
        allowanceAmount,
        startDate,
        endDate,
        customTerms,
        variables: {
          position,
          department,
          supervisorName: selectedMentorName,
          allowanceAmount,
          startDate,
          endDate,
          customTerms,
        },
      });

      onSuccess(response);
      onClose();
    } catch (err: any) {
      console.error('Lỗi khi lưu bản nháp hợp đồng:', err);
      setError(err.response?.data?.message || err.message || 'Không thể tạo bản nháp hợp đồng');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Thực thi Phát hành & Gửi cho Thực tập sinh (Issue to Intern)
  const handleIssueContract = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Tạo bản nháp với đầy đủ payload phẳng
      const draftRes = await dynamicContractService.createDraft({
        internId: intern.id,
        programId: intern.programId || 1,
        templateId: selectedTemplateId || 1,
        position,
        department,
        supervisorName: selectedMentorName,
        allowanceAmount,
        startDate,
        endDate,
        customTerms,
        variables: {
          position,
          department,
          supervisorName: selectedMentorName,
          allowanceAmount,
          startDate,
          endDate,
          customTerms,
        },
      });

      // 2. Phát hành gửi cho Intern
      const issuedRes = await dynamicContractService.sendContract(draftRes.id);

      onSuccess(issuedRes);
      onClose();
    } catch (err: any) {
      console.error('Lỗi khi phát hành hợp đồng:', err);
      setError(err.response?.data?.message || err.message || 'Không thể phát hành hợp đồng điện tử');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.studioModal}>
        {/* Studio Top Header */}
        <div className={styles.studioHeader}>
          <div className={styles.headerLeft}>
            <span className={styles.studioBadge}>Studio Hợp Đồng Điện Tử</span>
            <div>
              <h2 className={styles.title}>Thiết Kế & Phát Hành Hợp Đồng Thực Tập</h2>
              <p className={styles.subtitle}>
                Ứng viên: <strong>{intern.fullName}</strong> ({intern.internCode}) • Chương trình: <strong>{intern.programName || intern.appliedPosition}</strong>
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className={styles.closeBtn} title="Đóng">
            &times;
          </button>
        </div>

        {error && (
          <div className={styles.errorAlert}>
            <span>⚠️ {error}</span>
            <button
              type="button"
              onClick={() => setError(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b91c1c' }}
            >
              &times;
            </button>
          </div>
        )}

        {/* Studio Split-Screen Body */}
        <div className={styles.studioBody}>
          {/* CỘT TRÁI (46%): FORM THAM SỐ & CẤU HÌNH BIẾN */}
          <div className={styles.formPanel}>
            {/* Mục 1: Chọn Contract Template */}
            <div className={styles.sectionBox}>
              <div className={styles.sectionHeader}>
                <h4 className={styles.sectionTitle}>1. Mẫu Hợp Đồng Áp Dụng</h4>
              </div>
              <div className={styles.formGroup}>
                <label>Chọn biểu mẫu hợp đồng</label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(Number(e.target.value))}
                  disabled={loadingTemplates || isSubmitting}
                >
                  {templates.length > 0 ? (
                    templates.map((tpl) => (
                      <option key={tpl.id} value={tpl.id}>
                        {tpl.title} ({tpl.code}) — {tpl.latestVersion ? `Phiên bản v${tpl.latestVersion.versionNumber}` : `v${tpl.currentVersionNumber}`}
                      </option>
                    ))
                  ) : (
                    <option value={1}>Mẫu hợp đồng thực tập sinh tiêu chuẩn</option>
                  )}
                </select>
              </div>
            </div>

            {/* Mục 2: Thông tin thực tập sinh */}
            <div className={styles.sectionBox}>
              <div className={styles.sectionHeader}>
                <h4 className={styles.sectionTitle}>2. Thông Tin Thực Tập Sinh</h4>
              </div>
              <div className={styles.profileGrid}>
                <div className={styles.profileItem}>
                  <span className={styles.profileLabel}>Họ và tên</span>
                  <span className={styles.profileValue}>{intern.fullName}</span>
                </div>
                <div className={styles.profileItem}>
                  <span className={styles.profileLabel}>Mã thực tập sinh</span>
                  <span className={styles.profileValue}>{intern.internCode || 'Chưa cấp'}</span>
                </div>
                <div className={styles.profileItem}>
                  <span className={styles.profileLabel}>Email liên hệ</span>
                  <span className={styles.profileValue}>{intern.email || 'Chưa cập nhật'}</span>
                </div>
                <div className={styles.profileItem}>
                  <span className={styles.profileLabel}>Số điện thoại</span>
                  <span className={styles.profileValue}>{intern.phone || 'Chưa cập nhật'}</span>
                </div>
                <div className={`${styles.profileItem} ${styles.fullWidth || ''}`}>
                  <span className={styles.profileLabel}>Trường ĐH & Chuyên ngành</span>
                  <span className={styles.profileValue}>
                    {intern.university} ({intern.major})
                  </span>
                </div>
              </div>
            </div>

            {/* Mục 3: Điều khoản hợp đồng */}
            <div className={styles.sectionBox}>
              <div className={styles.sectionHeader}>
                <h4 className={styles.sectionTitle}>3. Điều Khoản & Chế Độ Thực Tập</h4>
              </div>
              <div className={styles.inputGrid}>
                <div className={styles.formGroup}>
                  <label>Vị trí thực tập</label>
                  <input
                    type="text"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Phòng ban tiếp nhận</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Người hướng dẫn trực tiếp (Mentor)</label>
                  {intern.mentorName ? (
                    <input
                      type="text"
                      value={selectedMentorName}
                      onChange={(e) => setSelectedMentorName(e.target.value)}
                    />
                  ) : (
                    <select
                      value={selectedMentorName}
                      onChange={(e) => setSelectedMentorName(e.target.value)}
                      disabled={loadingMentors || isSubmitting}
                      required
                    >
                      {availableMentors.length > 0 ? (
                        availableMentors.map((m) => (
                          <option key={m.id} value={m.fullName}>
                            {m.fullName} ({m.departmentName || 'Chuyên môn'}) - Đang hướng dẫn {m.activeInternCount} TTS
                          </option>
                        ))
                      ) : (
                        <option value="Mentor Phụ Trách">Đang tải danh sách Mentor...</option>
                      )}
                    </select>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label>Mức phụ cấp hàng tháng (VND)</label>
                  <input
                    type="number"
                    value={allowanceAmount}
                    onChange={(e) => setAllowanceAmount(Number(e.target.value))}
                    min={0}
                    step={500000}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Ngày bắt đầu</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Ngày kết thúc dự kiến</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label>Điều khoản bổ sung riêng (Tùy chọn)</label>
                  <textarea
                    rows={2}
                    value={customTerms}
                    onChange={(e) => setCustomTerms(e.target.value)}
                    placeholder="Nhập điều khoản bổ sung riêng cho hợp đồng này..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI (54%): TRÌNH XEM TRƯỚC VĂN BẢN A4 SONG SONG (LIVE INTERACTIVE PREVIEW) */}
          <div className={styles.previewPanel}>
            <ContractDocumentViewer
              canonicalHtml={livePreviewHtml}
              status="DRAFT"
              contractNumber={`DRAFT-${intern.programId || 1}-${intern.id}`}
              revisionNumber={1}
            />
          </div>
        </div>

        {/* Studio Bottom Footer */}
        <div className={styles.studioFooter}>
          <div className={styles.footerInfo}>
            <span>Văn bản được tạo tự động và bảo vệ toàn vẹn bằng chữ ký số.</span>
          </div>
          <div className={styles.footerActions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelBtn}
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSaveDraft}
              className={styles.saveDraftBtn}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu Bản Nháp (Draft)'}
            </button>
            <button
              type="button"
              onClick={handleIssueContract}
              className={styles.issueBtn}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang phát hành...' : 'Phát Hành & Gửi Cho TTS'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
