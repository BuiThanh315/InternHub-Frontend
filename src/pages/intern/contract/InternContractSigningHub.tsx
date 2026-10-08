import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Award, CheckCircle2, Download, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { dynamicContractService } from '../../../services/contractService';
import { ContractDocumentViewer } from '../../../components/contract/ContractDocumentViewer';
import { SignatureCanvasPad } from '../../../components/contract/SignatureCanvasPad';
import type { DynamicContractResponse } from '../../../types';
import styles from './InternContractSigningHub.module.css';

export const InternContractSigningHub: React.FC = () => {
  const navigate = useNavigate();
  const [contract, setContract] = useState<DynamicContractResponse | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [snapshotHash, setSnapshotHash] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Flow State
  const [hasConfirmedInfo, setHasConfirmedInfo] = useState<boolean>(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

  // Change Request Modal
  const [showChangeRequestModal, setShowChangeRequestModal] = useState<boolean>(false);
  const [changeReason, setChangeReason] = useState<string>('');

  useEffect(() => {
    loadContract();
  }, []);

  const loadContract = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await dynamicContractService.getMyContract();
      setContract(data);
      if (data && data.currentRevisionId) {
        const preview = await dynamicContractService.previewMyRevision(data.id, data.currentRevisionId);
        setPreviewHtml(preview.canonicalHtml);
        setSnapshotHash(preview.hash || data.currentRevision?.snapshotHash || '');
      }
    } catch (err: any) {
      console.error('Lỗi khi tải hợp đồng:', err);
      setError(err.response?.data?.message || err.message || 'Không thể tải hợp đồng thực tập.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmInfo = async () => {
    if (!contract || !contract.currentRevisionId) return;
    setIsSubmitting(true);
    try {
      await dynamicContractService.confirmRevision(contract.id, contract.currentRevisionId, {
        consentTextVersion: 'v1.0-2026',
        consentTextSnapshot: 'Tôi đã đọc kỹ toàn bộ điều khoản và xác nhận thông tin trên hợp đồng là chính xác.',
      });
      setHasConfirmedInfo(true);
      toast.success('Xác nhận thông tin hợp đồng thành công! Vui lòng tiến hành ký tên ở Bước 2.');
      await loadContract();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể xác nhận thông tin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignContract = async () => {
    if (!contract || !contract.currentRevisionId || !signatureData) {
      toast.warning('Vui lòng vẽ nét chữ ký trên bảng vẽ trước khi bấm Hoàn tất Ký hợp đồng.');
      return;
    }
    setIsSubmitting(true);
    try {
      await dynamicContractService.signRevision(contract.id, contract.currentRevisionId, {
        signatureData,
        authMethod: 'JWT_SESSION',
      });
      toast.success('Chúc mừng! Hợp đồng thực tập điện tử đã được ký kết thành công.');
      setShowSuccessModal(true);
      await loadContract();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi khi ký hợp đồng.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitChangeRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract || !contract.currentRevisionId || !changeReason.trim()) return;
    setIsSubmitting(true);
    try {
      await dynamicContractService.requestChanges(contract.id, contract.currentRevisionId, {
        reason: changeReason,
      });
      toast.success('Yêu cầu điều chỉnh thông tin đã được gửi đến HR thành công.');
      setShowChangeRequestModal(false);
      setChangeReason('');
      await loadContract();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi khi gửi yêu cầu điều chỉnh.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Đang chuẩn bị bản hợp đồng điện tử của bạn...</p>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className={styles.emptyContainer}>
        <h3>Chưa có hợp đồng nào</h3>
        <p>{error || 'Hiện tại bạn chưa có hợp đồng thực tập nào cần xác nhận.'}</p>
      </div>
    );
  }

  const isSent = contract.status === 'SENT';
  const isConfirmed = contract.status === 'INTERN_CONFIRMED' || hasConfirmedInfo;
  const isSigned = contract.status === 'SIGNED' || contract.status === 'ACTIVE';

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            type="button"
            onClick={() => navigate('/intern/documents')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'none',
              border: 'none',
              color: '#2563eb',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.875rem',
              padding: 0,
              width: 'fit-content',
            }}
          >
            <ArrowLeft size={16} />
            <span>Quay lại Hồ Sơ & Tài Liệu</span>
          </button>
          <div>
            <h1 className={styles.title}>Cổng Ký Kết Hợp Đồng Điện Tử</h1>
            <p className={styles.desc}>
              Vui lòng kiểm tra kỹ lưỡng các điều khoản, xác nhận tính chính xác của thông tin và tiến hành ký điện tử.
            </p>
          </div>
        </div>
        {isSigned && (
          <button
            type="button"
            onClick={() => dynamicContractService.downloadSignedPdf(contract.id, contract.currentRevisionId!, `${contract.contractNumber}.pdf`)}
            className={styles.downloadPdfBtn}
          >
            Tải Bản PDF Chính Thức
          </button>
        )}
      </div>

      <div className={styles.mainLayout}>
        {/* Cột Trái: Trình duyệt A4 */}
        <div className={styles.viewerColumn}>
          <ContractDocumentViewer
            canonicalHtml={previewHtml}
            status={contract.status}
            revisionNumber={contract.currentRevision?.revisionNumber || 1}
            contractNumber={contract.contractNumber}
            snapshotHash={snapshotHash}
          />
        </div>

        {/* Cột Phải: Bảng điều khiển hành động & Ký tên */}
        <div className={styles.actionColumn}>
          <div className={styles.actionCard}>
            <h3 className={styles.cardTitle}>Tiến Trình Ký Kết</h3>

            {/* Bước 1: Xác nhận thông tin */}
            <div className={`${styles.stepBlock} ${isConfirmed || isSigned ? styles.stepDone : ''}`}>
              <div className={styles.stepNum}>1</div>
              <div className={styles.stepContent}>
                <h4>Xác nhận thông tin</h4>
                <p>Kiểm tra họ tên, CCCD, trường đại học, trợ cấp và ngày thực tập.</p>

                {isSent && !isConfirmed && (
                  <div className={styles.stepActionRow}>
                    <button
                      type="button"
                      onClick={() => setShowChangeRequestModal(true)}
                      className={styles.rejectBtn}
                    >
                      Báo Sai & Sửa Đổi
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmInfo}
                      disabled={isSubmitting}
                      className={styles.confirmBtn}
                    >
                      Xác Nhận Đúng
                    </button>
                  </div>
                )}
                {isConfirmed && !isSigned && <span className={styles.doneBadge}>✓ Đã xác nhận thông tin</span>}
              </div>
            </div>

            {/* Bước 2: Ký tên điện tử Canvas */}
            <div className={`${styles.stepBlock} ${isSigned ? styles.stepDone : ''}`}>
              <div className={styles.stepNum}>2</div>
              <div className={styles.stepContent}>
                <h4>Ký tên điện tử Canvas</h4>
                <p>Vẽ chữ ký trực tiếp bằng chuột hoặc màn hình cảm ứng.</p>
                {isSigned && <span className={styles.doneBadge}>✓ Hợp đồng đã ký thành công</span>}
              </div>
            </div>

            {/* Vùng Bảng Ký Tên & Hoàn Tất: Đặt độc lập trong Action Card để mở rộng không gian thoải mái */}
            {(isConfirmed || isSent) && !isSigned && (
              <div className={styles.canvasContainer}>
                <SignatureCanvasPad onSignatureChange={setSignatureData} />
                <button
                  type="button"
                  onClick={handleSignContract}
                  disabled={!signatureData || isSubmitting}
                  className={styles.signBtn}
                >
                  {isSubmitting ? 'Đang xác thực...' : 'Hoàn Tất Ký Hợp Đồng'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Yêu cầu điều chỉnh thông tin */}
      {showChangeRequestModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <h3>Yêu Cầu Điều Chỉnh Hợp Đồng</h3>
            <p>Vui lòng ghi rõ thông tin nào bị sai (Ví dụ: sai số CCCD, ngày bắt đầu,...):</p>
            <form onSubmit={handleSubmitChangeRequest}>
              <textarea
                rows={4}
                value={changeReason}
                onChange={(e) => setChangeReason(e.target.value)}
                placeholder="Nhập lý do cụ thể..."
                required
              />
              <div className={styles.modalFooter}>
                <button
                  type="button"
                  onClick={() => setShowChangeRequestModal(false)}
                  className={styles.cancelBtn}
                >
                  Đóng
                </button>
                <button type="submit" disabled={isSubmitting} className={styles.submitReasonBtn}>
                  {isSubmitting ? 'Đang gửi...' : 'Gửi Đến HR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Chúc Mừng Ký Hợp Đồng Thành Công (Thay thế window.alert) */}
      {showSuccessModal && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modalBox} ${styles.successModalBox}`}>
            <div className={styles.successIconWrapper}>
              <Award size={40} className={styles.successIcon} />
            </div>
            <h3 className={styles.successTitle}>Ký Kết Hợp Đồng Thành Công!</h3>
            <p className={styles.successDesc}>
              Chúc mừng bạn đã hoàn tất thủ tục ký kết hợp đồng tiếp nhận thực tập điện tử{' '}
              <strong>{contract?.contractNumber}</strong>. Văn bản hiện đã có giá trị pháp lý chính thức.
            </p>

            <div className={styles.successHighlights}>
              <div className={styles.highlightItem}>
                <CheckCircle2 size={16} className={styles.checkIcon} />
                <span>Chữ ký số Canvas đã được mã hóa bảo mật</span>
              </div>
              <div className={styles.highlightItem}>
                <CheckCircle2 size={16} className={styles.checkIcon} />
                <span>Trạng thái hồ sơ đã cập nhật sang <strong>Có hiệu lực</strong></span>
              </div>
            </div>

            <div className={styles.successModalFooter}>
              {contract?.currentRevisionId && (
                <button
                  type="button"
                  onClick={() =>
                    dynamicContractService.downloadSignedPdf(
                      contract.id,
                      contract.currentRevisionId!,
                      `${contract.contractNumber}.pdf`
                    )
                  }
                  className={styles.downloadModalBtn}
                >
                  <Download size={15} />
                  <span>Tải Bản PDF</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate('/intern/documents');
                }}
                className={styles.finishModalBtn}
              >
                <span>Về Trang Hồ Sơ</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
