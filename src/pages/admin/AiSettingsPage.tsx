import React, { useState, useEffect } from 'react';
import {
  aiService,
  type AiMultiConfigResponse,
  type FeatureProfileData,
  type TestProfileResult,
  type AiKeyVaultItem,
  type PromptTemplateData,
  type PreviewPromptTemplateResponse,
} from '../../services/aiService';
import styles from './AiSettingsPage.module.css';

export const AiSettingsPage: React.FC = () => {
  const [multiConfig, setMultiConfig] = useState<AiMultiConfigResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [testingProfile, setTestingProfile] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Master Tab State ('PROFILES' | 'VAULT' | 'PROMPTS')
  const [masterTab, setMasterTab] = useState<'PROFILES' | 'VAULT' | 'PROMPTS'>('PROFILES');

  // AI-19: Prompt Management Engine & Versioning State
  const [promptTemplates, setPromptTemplates] = useState<PromptTemplateData[]>([]);
  const [loadingPrompts, setLoadingPrompts] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplateData | null>(null);
  const [promptCategoryFilter, setPromptCategoryFilter] = useState<string>('ALL');
  const [editingContent, setEditingContent] = useState<string>('');
  const [editingTemplateName, setEditingTemplateName] = useState<string>('');
  const [editingDescription, setEditingDescription] = useState<string>('');
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [templateVersions, setTemplateVersions] = useState<PromptTemplateData[]>([]);
  const [selectedVersionNum, setSelectedVersionNum] = useState<number>(1);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewResult, setPreviewResult] = useState<PreviewPromptTemplateResponse | null>(null);
  const [previewSampleVars, setPreviewSampleVars] = useState<Record<string, string>>({});

  // Tab Profile state
  const [selectedFeatureKey, setSelectedFeatureKey] = useState<string>('CHATBOT');
  const [currentProfile, setCurrentProfile] = useState<FeatureProfileData | null>(null);

  // Sandbox Test state per tab
  const [testPromptInput, setTestPromptInput] = useState('');
  const [testResult, setTestResult] = useState<TestProfileResult | null>(null);

  // Quick Prompts tag input state
  const [newQuickPromptInput, setNewQuickPromptInput] = useState('');

  // Key Vault (AI-10) state
  const [vaultKeys, setVaultKeys] = useState<AiKeyVaultItem[]>([]);
  const [loadingVault, setLoadingVault] = useState(false);
  const [showAddVaultModal, setShowAddVaultModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newRawApiKey, setNewRawApiKey] = useState('');
  const [newKeyPriority, setNewKeyPriority] = useState<number>(1);
  const [showNewRawKey, setShowNewRawKey] = useState(false);
  const [addingVaultKey, setAddingVaultKey] = useState(false);
  const [testingVaultKeyId, setTestingVaultKeyId] = useState<number | null>(null);

  // Search & Filter state (AI-10 UX Hardened)
  const [vaultSearchTerm, setVaultSearchTerm] = useState('');
  const [vaultStatusFilter, setVaultStatusFilter] = useState<'ALL' | 'ACTIVE' | 'COOLDOWN' | 'DISABLED'>('ALL');

  // Edit Key Modal state (AI-10 UX Hardened)
  const [editingKey, setEditingKey] = useState<AiKeyVaultItem | null>(null);
  const [editKeyName, setEditKeyName] = useState('');
  const [editKeyPriority, setEditKeyPriority] = useState<number>(1);
  const [editKeyStatus, setEditKeyStatus] = useState<string>('ACTIVE');
  const [savingEditKey, setSavingEditKey] = useState(false);

  // Realtime countdown ticker: Giảm cooldownSecondsRemaining mỗi giây
  useEffect(() => {
    const timer = setInterval(() => {
      setVaultKeys((prevKeys) =>
        prevKeys.map((k) => {
          if (k.status === 'COOLDOWN' && k.cooldownSecondsRemaining && k.cooldownSecondsRemaining > 0) {
            const nextRemaining = k.cooldownSecondsRemaining - 1;
            return {
              ...k,
              cooldownSecondsRemaining: nextRemaining,
              status: nextRemaining === 0 ? 'ACTIVE' : 'COOLDOWN',
            };
          }
          return k;
        })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchVaultKeys = async () => {
    try {
      setLoadingVault(true);
      const keys = await aiService.getVaultKeys();
      setVaultKeys(keys);
    } catch (err: any) {
      console.error('[AiSettingsPage] Lỗi lấy danh sách Vault:', err);
    } finally {
      setLoadingVault(false);
    }
  };

  const handleAddQuickPrompt = () => {
    if (!currentProfile || !newQuickPromptInput.trim()) return;
    const currentList = currentProfile.quickPrompts || [];
    if (currentList.includes(newQuickPromptInput.trim())) return;
    setCurrentProfile({
      ...currentProfile,
      quickPrompts: [...currentList, newQuickPromptInput.trim()],
    });
    setNewQuickPromptInput('');
  };

  const handleRemoveQuickPrompt = (indexToRemove: number) => {
    if (!currentProfile || !currentProfile.quickPrompts) return;
    const updatedList = currentProfile.quickPrompts.filter((_, idx) => idx !== indexToRemove);
    setCurrentProfile({
      ...currentProfile,
      quickPrompts: updatedList,
    });
  };

  const FEATURE_INFO_FALLBACK: Record<string, { name: string; desc: string }> = {
    CHATBOT: {
      name: 'Trợ Lý FAQ Thực Tập',
      desc: 'Hỗ trợ giải đáp nội quy, tài liệu onboarding cho thực tập sinh.',
    },
    CV_SCREENING: {
      name: 'Sàng Lọc Hồ Sơ & CV',
      desc: 'Trích xuất kỹ năng, so khớp thang đo rubric tuyển dụng, xuất JSON 100% chuẩn xác.',
    },
    INTERVIEW_GENERATOR: {
      name: 'Sinh Bộ Câu Hỏi Phỏng Vấn',
      desc: 'Tạo bộ câu hỏi phỏng vấn kỹ thuật và tình huống đa dạng, sáng tạo, chống lặp lại.',
    },
    REPORT_ASSISTANT: {
      name: 'Trợ Lý Đánh Giá Báo Cáo Tuần',
      desc: 'Đối soát báo cáo với tiến độ Kanban, phân tích 3 dòng và gợi ý điểm 5 sao khách quan.',
    },
  };

  const getCleanFeatureName = (key: string, rawName: string) => {
    if (FEATURE_INFO_FALLBACK[key]) return FEATURE_INFO_FALLBACK[key].name;
    return rawName;
  };

  const getCleanFeatureDesc = (key: string, rawDesc?: string) => {
    if (FEATURE_INFO_FALLBACK[key]) return FEATURE_INFO_FALLBACK[key].desc;
    return rawDesc || '';
  };

  const fetchConfig = async () => {
    try {
      setLoading(true);
      setErrorBanner(null);
      const res = await aiService.getMultiConfig();
      setMultiConfig(res);
      if (res.profiles && res.profiles.length > 0) {
        const found = res.profiles.find((p) => p.featureKey === selectedFeatureKey) || res.profiles[0];
        setSelectedFeatureKey(found.featureKey);
        setCurrentProfile({ ...found });
      }
    } catch (err: any) {
      console.error('[AiSettingsPage] Lỗi tải cấu hình đa module:', err);
      setErrorBanner(err.message || 'Không thể tải cấu hình AI đa module.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPromptTemplates = async (group?: string) => {
    try {
      setLoadingPrompts(true);
      const data = await aiService.getPromptTemplates(group && group !== 'ALL' ? group : undefined);
      setPromptTemplates(data);
      if (data.length > 0) {
        if (!selectedTemplate || !data.some((t) => t.templateCode === selectedTemplate.templateCode)) {
          handleSelectPromptTemplate(data[0]);
        }
      }
    } catch (err: any) {
      console.error('[AiSettingsPage] Lỗi lấy danh sách Prompt Templates:', err);
    } finally {
      setLoadingPrompts(false);
    }
  };

  const handleSelectPromptTemplate = async (template: PromptTemplateData) => {
    setSelectedTemplate(template);
    setEditingContent(template.templateContent || '');
    setEditingTemplateName(template.templateName || '');
    setEditingDescription(template.description || '');
    setSelectedVersionNum(template.version || 1);
    // Initialize sample variables
    const initialVars: Record<string, string> = {};
    if (template.availableVariables) {
      template.availableVariables.forEach((v) => {
        initialVars[v] = `[${v}_test_value]`;
      });
    }
    setPreviewSampleVars(initialVars);

    // Fetch version history
    try {
      const versions = await aiService.getPromptTemplateVersions(template.templateCode);
      setTemplateVersions(versions);
    } catch (err: any) {
      console.warn('[AiSettingsPage] Không thể tải lịch sử phiên bản:', err);
      setTemplateVersions([template]);
    }
  };

  const handleSavePromptTemplate = async () => {
    if (!selectedTemplate) return;
    setSavingTemplate(true);
    setErrorBanner(null);
    setSuccessBanner(null);
    try {
      const updated = await aiService.updatePromptTemplate(selectedTemplate.templateCode, {
        templateName: editingTemplateName.trim() || selectedTemplate.templateName,
        templateContent: editingContent,
        description: editingDescription.trim(),
        availableVariables: selectedTemplate.availableVariables,
        createNewVersion: true,
      });
      setSuccessBanner(`Đã lưu phiên bản v${updated.version} cho mẫu prompt "${updated.templateName}" thành công.`);
      await fetchPromptTemplates(promptCategoryFilter);
      handleSelectPromptTemplate(updated);
    } catch (err: any) {
      console.error('[AiSettingsPage] Lỗi cập nhật Prompt Template:', err);
      setErrorBanner(err.response?.data?.message || err.message || 'Lỗi khi cập nhật template.');
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleRollbackVersion = async (targetVersion: number) => {
    if (!selectedTemplate) return;
    if (targetVersion === selectedTemplate.version) return;
    setSavingTemplate(true);
    setErrorBanner(null);
    setSuccessBanner(null);
    try {
      const activated = await aiService.activatePromptTemplateVersion(selectedTemplate.templateCode, targetVersion);
      setSuccessBanner(`Đã kích hoạt trở lại phiên bản v${activated.version} cho "${activated.templateName}".`);
      await fetchPromptTemplates(promptCategoryFilter);
      handleSelectPromptTemplate(activated);
    } catch (err: any) {
      console.error('[AiSettingsPage] Lỗi rollback phiên bản:', err);
      setErrorBanner(err.response?.data?.message || err.message || 'Lỗi khi khôi phục phiên bản.');
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleOpenPreviewModal = async () => {
    if (!selectedTemplate) return;
    setPreviewModalOpen(true);
    setPreviewLoading(true);
    try {
      const res = await aiService.previewPromptTemplate({
        templateContent: editingContent,
        sampleVariables: previewSampleVars,
      });
      setPreviewResult(res);
    } catch (err: any) {
      console.error('[AiSettingsPage] Lỗi preview prompt:', err);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleInsertVariable = (varName: string) => {
    const placeholder = `{{${varName}}}`;
    setEditingContent((prev) => prev + placeholder);
  };

  useEffect(() => {
    fetchConfig();
    fetchVaultKeys();
    fetchPromptTemplates();
  }, []);

  const handleSelectTab = (fKey: string) => {
    setSelectedFeatureKey(fKey);
    setTestResult(null);
    setTestPromptInput('');
    if (multiConfig) {
      const target = multiConfig.profiles.find((p) => p.featureKey === fKey);
      if (target) {
        setCurrentProfile({ ...target });
      }
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProfile) return;
    setSavingProfile(true);
    setErrorBanner(null);
    setSuccessBanner(null);
    try {
      await aiService.updateProfile(currentProfile.featureKey, {
        modelName: currentProfile.modelName,
        temperature: currentProfile.temperature,
        maxTokens: currentProfile.maxTokens,
        rateLimitPerMinute: currentProfile.rateLimitPerMinute ?? 20,
        dailyQuota: currentProfile.dailyQuota ?? 200,
        systemInstruction: currentProfile.systemInstruction,
        quickPrompts: currentProfile.quickPrompts,
        isActive: currentProfile.isActive ?? true,
      });
      setSuccessBanner(`Đã lưu thiết lập cho tính năng "${getCleanFeatureName(currentProfile.featureKey, currentProfile.featureName)}" thành công.`);
      await fetchConfig();
    } catch (err: any) {
      console.error('[AiSettingsPage] Lỗi lưu feature profile:', err);
      const msg = err.response?.data?.message || err.message || 'Không thể cập nhật cấu hình tính năng.';
      setErrorBanner(msg);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleTestProfileSandbox = async () => {
    if (!currentProfile) return;
    if (!testPromptInput.trim()) {
      setErrorBanner('Vui lòng nhập nội dung thử nghiệm cho tính năng này.');
      return;
    }
    setTestingProfile(true);
    setErrorBanner(null);
    setTestResult(null);
    try {
      const res = await aiService.testProfile(currentProfile.featureKey, testPromptInput.trim());
      setTestResult(res);
      if (!res.success && res.errorMessage) {
        setErrorBanner(`Hệ thống AI phản hồi: ${res.errorMessage}`);
      }
    } catch (err: any) {
      console.error('[AiSettingsPage] Lỗi test profile:', err);
      setErrorBanner(err.message || err.response?.data?.message || 'Lỗi khi thử nghiệm phản hồi từ hệ thống AI.');
    } finally {
      setTestingProfile(false);
    }
  };

  // Vault Actions (AI-10)
  const handleAddNewVaultKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim() || !newRawApiKey.trim()) {
      setErrorBanner('Vui lòng điền đầy đủ tên gợi nhớ và mã khóa API.');
      return;
    }
    setAddingVaultKey(true);
    setErrorBanner(null);
    setSuccessBanner(null);
    try {
      await aiService.addVaultKey({
        keyName: newKeyName.trim(),
        provider: 'GEMINI',
        apiKey: newRawApiKey.trim(),
        priority: newKeyPriority,
      });
      setSuccessBanner(`Đã thêm khóa "${newKeyName}" vào Kho Khóa API thành công.`);
      setShowAddVaultModal(false);
      setNewKeyName('');
      setNewRawApiKey('');
      setNewKeyPriority(1);
      await fetchVaultKeys();
      await fetchConfig();
    } catch (err: any) {
      console.error('[AiSettingsPage] Lỗi thêm vault key:', err);
      setErrorBanner(err.response?.data?.message || err.message || 'Lỗi khi thêm khóa mới vào Kho.');
    } finally {
      setAddingVaultKey(false);
    }
  };

  const handleTestVaultKey = async (id: number) => {
    setTestingVaultKeyId(id);
    setErrorBanner(null);
    setSuccessBanner(null);
    try {
      const res = await aiService.testVaultKey(id);
      if (res.status === 'ACTIVE') {
        const details = [
          `Độ trễ: ${res.latencyMs}ms`,
          res.testedModel ? `Model: ${res.testedModel}` : null,
          res.quotaTier ? `Tier: ${res.quotaTier}` : null,
        ].filter(Boolean).join(' | ');
        setSuccessBanner(`Kiểm tra thành công: ${res.message} (${details})`);
      } else {
        setErrorBanner(`Khóa không khả dụng: ${res.message}`);
      }
      await fetchVaultKeys();
    } catch (err: any) {
      console.error('[AiSettingsPage] Lỗi test vault key:', err);
      setErrorBanner(err.response?.data?.message || err.message || 'Lỗi khi kiểm tra kết nối khóa.');
    } finally {
      setTestingVaultKeyId(null);
    }
  };

  const handleOpenEditModal = (keyItem: AiKeyVaultItem) => {
    setEditingKey(keyItem);
    setEditKeyName(keyItem.keyName);
    setEditKeyPriority(keyItem.priority);
    setEditKeyStatus(keyItem.status);
  };

  const handleSaveEditKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingKey) return;
    setSavingEditKey(true);
    setErrorBanner(null);
    setSuccessBanner(null);
    try {
      await aiService.updateVaultKey(editingKey.id, {
        keyName: editKeyName.trim(),
        priority: editKeyPriority,
        status: editKeyStatus,
      });
      setSuccessBanner(`Đã cập nhật cấu hình khóa "${editKeyName}" thành công.`);
      setEditingKey(null);
      await fetchVaultKeys();
    } catch (err: any) {
      console.error('[AiSettingsPage] Lỗi cập nhật vault key:', err);
      setErrorBanner(err.response?.data?.message || err.message || 'Không thể cập nhật thông tin khóa.');
    } finally {
      setSavingEditKey(false);
    }
  };

  const handleDeleteVaultKey = async (id: number, keyName: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa khóa "${keyName}" khỏi Kho Khóa API?`)) {
      return;
    }
    setErrorBanner(null);
    setSuccessBanner(null);
    try {
      await aiService.deleteVaultKey(id);
      setSuccessBanner(`Đã xóa khóa "${keyName}" thành công.`);
      await fetchVaultKeys();
    } catch (err: any) {
      console.error('[AiSettingsPage] Lỗi xóa vault key:', err);
      setErrorBanner(err.response?.data?.message || err.message || 'Không thể xóa khóa API.');
    }
  };

  if (loading) {
    return <div className={styles.container}>Đang tải trung tâm cấu hình AI đa module...</div>;
  }

  const global = multiConfig?.globalConfig;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Cấu Hình Trợ Lý Trí Tuệ Nhân Tạo (AI)</h1>
          <p className={styles.subtitle}>
            Quản trị kho khóa kết nối đa nguồn, phân tải xoay tua tự động và điều chỉnh hành vi cho từng nghiệp vụ.
          </p>
        </div>
        <div className={`${styles.statusBadge} ${global?.hasApiKey ? styles.statusActive : styles.statusInactive}`}>
          <span className={styles.statusDot} style={{ background: global?.hasApiKey ? '#10b981' : '#94a3b8' }} />
          <span>{global?.hasApiKey ? 'Đã Kết Nối Dịch Vụ' : 'Chưa Cài Đặt Khóa'}</span>
        </div>
      </div>

      {errorBanner && (
        <div className={styles.warningBox} style={{ background: '#fef2f2', borderColor: '#fecaca', color: '#991b1b' }}>
          <span>⚠️</span>
          <div>
            <strong>Thông báo:</strong> {errorBanner}
          </div>
        </div>
      )}

      {successBanner && (
        <div className={styles.warningBox} style={{ background: '#ecfdf5', borderColor: '#a7f3d0', color: '#065f46' }}>
          <span>✓</span>
          <div>{successBanner}</div>
        </div>
      )}

      {/* THANH ĐIỀU HƯỚNG TẦNG CAO (MASTER TABS) */}
      <div className={styles.masterTabsContainer}>
        <button
          type="button"
          className={`${styles.masterTabBtn} ${masterTab === 'PROFILES' ? styles.masterTabBtnActive : ''}`}
          onClick={() => setMasterTab('PROFILES')}
        >
          <span>🎯</span>
          <span>Cấu Hình Nghiệp Vụ</span>
        </button>
        <button
          type="button"
          className={`${styles.masterTabBtn} ${masterTab === 'VAULT' ? styles.masterTabBtnActive : ''}`}
          onClick={() => setMasterTab('VAULT')}
        >
          <span>🔐</span>
          <span>Kho Khóa Kết Nối</span>
        </button>
        <button
          type="button"
          className={`${styles.masterTabBtn} ${masterTab === 'PROMPTS' ? styles.masterTabBtnActive : ''}`}
          onClick={() => setMasterTab('PROMPTS')}
        >
          <span>📜</span>
          <span>Mẫu Chỉ Dẫn Nghiệp Vụ</span>
        </button>
      </div>

      {/* KHỐI 1: KHO KHÓA API ĐA NGUỒN (AI-10 MULTI-KEY VAULT) */}
      {masterTab === 'VAULT' && (
      <div className={styles.card} style={{ marginBottom: '24px' }}>
        <div className={styles.cardTitle} style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
          <div className={styles.cardTitleText}>
            <span>🔐</span>
            <span>Kho Khóa Kết Nối & Tự Động Phân Tải</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={fetchVaultKeys}
              disabled={loadingVault}
              style={{ fontSize: '13px', padding: '6px 12px' }}
            >
              {loadingVault ? 'Đang làm mới...' : '🔄 Làm mới'}
            </button>
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={() => setShowAddVaultModal(true)}
              style={{ fontSize: '13px', padding: '6px 14px', background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', color: '#fff', border: 'none' }}
            >
              + Thêm Khóa Mới
            </button>
          </div>
        </div>

        <p style={{ fontSize: '13px', color: '#64748b', marginTop: '10px', marginBottom: '14px', lineHeight: 1.5 }}>
          Hệ thống áp dụng cơ chế <strong>Phân tải xoay tua (Round-Robin)</strong> đều đặn giữa các khóa có cùng độ ưu tiên. 
          Khi một khóa chạm hạn ngạch (mã lỗi 429), hệ thống sẽ <strong>tự động chuyển ngay sang khóa tiếp theo</strong> mà không làm gián đoạn người dùng, đồng thời đưa khóa cũ vào thời gian nghỉ 60 giây.
        </p>

        {/* Thanh Tìm kiếm & Lọc Trạng thái (AI-10 UX Hardened) */}
        <div className={styles.vaultSearchFilterBar}>
          <input
            type="text"
            className={styles.vaultSearchInput}
            placeholder="🔍 Tìm kiếm theo tên khóa hoặc mã nhận diện..."
            value={vaultSearchTerm}
            onChange={(e) => setVaultSearchTerm(e.target.value)}
          />
          <select
            className={styles.vaultFilterSelect}
            value={vaultStatusFilter}
            onChange={(e) => setVaultStatusFilter(e.target.value as any)}
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">🟢 Đang hoạt động</option>
            <option value="COOLDOWN">🟡 Tạm nghỉ (Cooldown)</option>
            <option value="DISABLED">🔴 Đã vô hiệu hóa</option>
          </select>
        </div>

        {vaultKeys.length === 0 ? (
          global?.hasApiKey ? (
            <div className={styles.vaultSystemActiveCard}>
              <div className={styles.vaultSystemActiveHeader}>
                <div className={styles.vaultSystemIconBadge}>🔑</div>
                <div className={styles.vaultSystemInfo}>
                  <div className={styles.vaultSystemTitle}>
                    Khóa Chính Hệ Thống Đang Kích Hoạt (System Active Key)
                  </div>
                  <div className={styles.vaultSystemSub}>
                    Toàn bộ các tác vụ AI đang được vận hành thông suốt qua khóa {global.provider || 'Google Gemini'} mặc định ({global.maskedApiKey || '••••••••'}).
                  </div>
                </div>
                <div className={styles.vaultSystemStatusBadge}>
                  <span className={styles.statusDot} style={{ background: '#10b981' }} />
                  <span>Đang hoạt động (Ưu tiên 1)</span>
                </div>
              </div>
              <div className={styles.vaultSystemTip}>
                <span>💡</span>
                <span>
                  Hệ thống đang hoạt động với 1 khóa chính. Để kích hoạt tính năng <strong>phân tải xoay tua (Round-Robin)</strong> và tự động dự phòng khi chạm hạn ngạch (429), vui lòng bấm <strong>"+ Thêm Khóa Mới"</strong>.
                </span>
              </div>
            </div>
          ) : (
            <div className={styles.vaultEmptyBox}>
              <span>⚠️</span>
              <span>Hệ thống chưa có khóa API nào được cài đặt. Vui lòng bấm <strong>"+ Thêm Khóa Mới"</strong> để kích hoạt các tính năng AI.</span>
            </div>
          )
        ) : (
          <div className={styles.vaultTableWrapper}>
            <table className={styles.vaultTable}>
              <thead>
                <tr>
                  <th>Tên gợi nhớ</th>
                  <th>Nhà cung cấp</th>
                  <th>Mã khóa</th>
                  <th>Mức ưu tiên</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {vaultKeys
                  .filter((k) => {
                    const matchesSearch =
                      !vaultSearchTerm.trim() ||
                      k.keyName.toLowerCase().includes(vaultSearchTerm.toLowerCase()) ||
                      k.maskedKey.toLowerCase().includes(vaultSearchTerm.toLowerCase());
                    const matchesStatus = vaultStatusFilter === 'ALL' || k.status === vaultStatusFilter;
                    return matchesSearch && matchesStatus;
                  })
                  .map((k) => {
                    const isCooldown = k.status === 'COOLDOWN';
                    const isActive = k.status === 'ACTIVE';
                    const isDisabled = k.status === 'DISABLED';

                    return (
                      <tr key={k.id}>
                        <td style={{ fontWeight: 600, color: '#0f172a' }}>
                          {k.keyName}
                        </td>
                        <td>
                          <span className={styles.providerBadge}>
                            Google Gemini
                          </span>
                        </td>
                        <td>
                          <span className={styles.maskedKeyText}>
                            {k.maskedKey}
                          </span>
                        </td>
                        <td>
                          <span className={styles.priorityBadge}>
                            Ưu tiên {k.priority}
                          </span>
                        </td>
                        <td>
                          {isActive && (
                            <span className={styles.statusPillActive}>
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                              Đang hoạt động
                            </span>
                          )}
                          {isCooldown && (
                            <span className={styles.statusPillCooldown}>
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f59e0b' }} />
                              Tạm nghỉ ({k.cooldownSecondsRemaining}s)
                            </span>
                          )}
                          {isDisabled && (
                            <span className={styles.statusPillDisabled}>
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444' }} />
                              Đã vô hiệu hóa
                            </span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className={styles.vaultActionGroup}>
                            <button
                              type="button"
                              className={styles.vaultEditBtn}
                              onClick={() => handleOpenEditModal(k)}
                              title="Chỉnh sửa tên và mức ưu tiên"
                            >
                              ✏️ Sửa
                            </button>
                            <button
                              type="button"
                              className={styles.vaultTestBtn}
                              onClick={() => handleTestVaultKey(k.id)}
                              disabled={testingVaultKeyId === k.id}
                            >
                              {testingVaultKeyId === k.id ? 'Đang thử...' : '⚡ Thử nghiệm'}
                            </button>
                            <button
                              type="button"
                              className={styles.vaultDeleteBtn}
                              onClick={() => handleDeleteVaultKey(k.id, k.keyName)}
                              title="Xóa khóa khỏi kho"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      )}

      {/* MODAL SỬA CẤU HÌNH KHÓA (AI-10 UX HARDENED) */}
      {editingKey && (
        <div className={styles.vaultModalOverlay}>
          <div className={styles.vaultModalCard}>
            <div className={styles.vaultModalHeader}>
              <div className={styles.vaultModalIcon}>✏️</div>
              <div>
                <h3 className={styles.vaultModalTitle}>Cập Nhật Thiết Lập Khóa</h3>
                <p className={styles.vaultModalSubtitle}>
                  Thay đổi tên gợi nhớ, điều chỉnh mức độ ưu tiên xoay tua hoặc bật/tắt khóa này ({editingKey.maskedKey}).
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveEditKey}>
              <div className={styles.vaultModalBody}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <span>Tên gợi nhớ</span>
                    <span className={styles.labelBadge}>Bắt buộc</span>
                  </label>
                  <input
                    type="text"
                    className={styles.input}
                    value={editKeyName}
                    onChange={(e) => setEditKeyName(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <span>Mức độ ưu tiên phân bổ tải</span>
                    <span className={styles.labelBadge}>Priority Level</span>
                  </label>
                  <select
                    className={styles.select}
                    value={editKeyPriority}
                    onChange={(e) => setEditKeyPriority(Number(e.target.value))}
                  >
                    <option value={1}>Ưu tiên 1 (Phân bổ luân phiên trước)</option>
                    <option value={2}>Ưu tiên 2 (Chỉ dùng khi Ưu tiên 1 tạm nghỉ hoặc bận)</option>
                    <option value={3}>Ưu tiên 3 (Dự phòng cấp cao)</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <span>Trạng thái hoạt động</span>
                  </label>
                  <select
                    className={styles.select}
                    value={editKeyStatus}
                    onChange={(e) => setEditKeyStatus(e.target.value)}
                  >
                    <option value="ACTIVE">🟢 Đang hoạt động (ACTIVE)</option>
                    <option value="DISABLED">🔴 Tạm vô hiệu hóa (DISABLED)</option>
                  </select>
                </div>
              </div>

              <div className={styles.vaultModalActions}>
                <button
                  type="button"
                  className={styles.vaultModalCancelBtn}
                  onClick={() => setEditingKey(null)}
                  disabled={savingEditKey}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className={styles.vaultModalSubmitBtn}
                  disabled={savingEditKey}
                >
                  {savingEditKey ? 'Đang lưu...' : '✓ Lưu Cập Nhật'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL THÊM KHÓA MỚI (AI-10) */}
      {showAddVaultModal && (
        <div className={styles.vaultModalOverlay}>
          <div className={styles.vaultModalCard}>
            <div className={styles.vaultModalHeader}>
              <div className={styles.vaultModalIcon}>🔑</div>
              <div>
                <h3 className={styles.vaultModalTitle}>
                  Thêm Khóa Mới Vào Kho Dự Phòng
                </h3>
                <p className={styles.vaultModalSubtitle}>
                  Khóa API sẽ được kiểm tra kết nối với Google trước khi mã hóa an toàn và đưa vào vòng quay phân tải.
                </p>
              </div>
            </div>

            <form onSubmit={handleAddNewVaultKey}>
              <div className={styles.vaultModalBody}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <span>Tên gợi nhớ</span>
                    <span className={styles.labelSubText}>Ví dụ: Khóa Chính, Khóa Dự Phòng 2</span>
                  </label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Nhập tên khóa để phân biệt..."
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <span>Mã khóa API</span>
                    <span className={styles.labelSubText}>Google Gemini API Key</span>
                  </label>
                  <div className={styles.passwordInputWrapper}>
                    <input
                      type={showNewRawKey ? 'text' : 'password'}
                      className={styles.input}
                      placeholder="AIzaSy..."
                      value={newRawApiKey}
                      onChange={(e) => setNewRawApiKey(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className={styles.eyeButton}
                      onClick={() => setShowNewRawKey(!showNewRawKey)}
                      title={showNewRawKey ? 'Ẩn' : 'Hiện'}
                    >
                      {showNewRawKey ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <span>Mức độ ưu tiên phân bổ tải</span>
                    <span className={styles.labelBadge}>Priority Level</span>
                  </label>
                  <select
                    className={styles.select}
                    value={newKeyPriority}
                    onChange={(e) => setNewKeyPriority(Number(e.target.value))}
                  >
                    <option value={1}>Ưu tiên 1 (Mặc định - Phân bổ luân phiên trước)</option>
                    <option value={2}>Ưu tiên 2 (Chỉ dùng khi toàn bộ Ưu tiên 1 bận hoặc tạm nghỉ)</option>
                    <option value={3}>Ưu tiên 3 (Dự phòng cấp cao)</option>
                  </select>
                </div>
              </div>

              <div className={styles.vaultModalActions}>
                <button
                  type="button"
                  className={styles.vaultModalCancelBtn}
                  onClick={() => setShowAddVaultModal(false)}
                  disabled={addingVaultKey}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className={styles.vaultModalSubmitBtn}
                  disabled={addingVaultKey}
                >
                  {addingVaultKey ? 'Đang kiểm tra & lưu...' : '✓ Xác Thực & Thêm Vào Kho'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* KHỐI 2: TAB BAR 4 FEATURE PROFILES VỚI STATUS DOTS */}
      {masterTab === 'PROFILES' && (
      <>
      <div className={styles.tabsContainer}>
        {multiConfig?.profiles.map((p) => {
          const isSelected = p.featureKey === selectedFeatureKey;
          const cleanName = getCleanFeatureName(p.featureKey, p.featureName);
          return (
            <button
              key={p.featureKey}
              type="button"
              className={`${styles.tabBtn} ${isSelected ? styles.tabBtnActive : ''}`}
              onClick={() => handleSelectTab(p.featureKey)}
            >
              <span className={`${styles.tabDot} ${p.isActive ? styles.tabDotActive : styles.tabDotInactive}`} />
              <span>{cleanName}</span>
            </button>
          );
        })}
      </div>

      {/* NỘI DUNG CẤU HÌNH CHO PROFILE ĐƯỢC CHỌN */}
      {currentProfile && (
        <form onSubmit={handleSaveProfile}>
          <div className={styles.card}>
            <div className={styles.cardTitle}>
              <div className={styles.cardTitleText}>
                <span>⚙️</span>
                <span>Thiết Lập Chuyên Môn: {getCleanFeatureName(currentProfile.featureKey, currentProfile.featureName)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label className={styles.switchWrapper}>
                  <input
                    type="checkbox"
                    className={styles.switchInput}
                    checked={currentProfile.isActive}
                    onChange={(e) =>
                      setCurrentProfile({
                        ...currentProfile,
                        isActive: e.target.checked,
                      })
                    }
                  />
                  <span className={styles.switchSlider} />
                </label>
                <span className={styles.switchLabelText} style={{ color: currentProfile.isActive ? '#059669' : '#64748b' }}>
                  {currentProfile.isActive ? 'Đang Kích Hoạt' : 'Tạm Khóa'}
                </span>
              </div>
            </div>

            <div className={styles.profileDescription}>
              {getCleanFeatureDesc(currentProfile.featureKey, currentProfile.description)}
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <span>Tên đại diện chức năng</span>
                  <span className={styles.labelBadge}>Bắt buộc</span>
                </label>
                <input
                  type="text"
                  className={styles.input}
                  value={currentProfile.featureName}
                  onChange={(e) =>
                    setCurrentProfile({
                      ...currentProfile,
                      featureName: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <span>Mô hình ngôn ngữ xử lý</span>
                  <span className={styles.labelSubText}>Google Gemini</span>
                </label>
                <select
                  className={styles.select}
                  value={currentProfile.modelName}
                  onChange={(e) =>
                    setCurrentProfile({
                      ...currentProfile,
                      modelName: e.target.value,
                    })
                  }
                >
                  <option value="gemini-3.5-flash-lite">gemini-3.5-flash-lite (Tốc độ cao, phản hồi nhanh - Tiêu chuẩn)</option>
                  <option value="gemini-1.5-flash">gemini-1.5-flash (Xử lý tác vụ ngắn)</option>
                  <option value="gemini-1.5-pro">gemini-1.5-pro (Lập luận sâu, đọc tài liệu phức tạp)</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <div className={styles.sliderHeader}>
                  <label className={styles.label} style={{ margin: 0 }}>Độ sáng tạo câu trả lời</label>
                  <div className={styles.temperatureBadge}>
                    <span className={styles.temperatureValue}>{Number(currentProfile.temperature).toFixed(2)}</span>
                    <span className={styles.temperatureGuide}>
                      {currentProfile.temperature <= 0.2 ? 'Nghiêm ngặt' : currentProfile.temperature <= 0.6 ? 'Cân bằng' : 'Sáng tạo cao'}
                    </span>
                  </div>
                </div>
                <div className={styles.sliderWrapper}>
                  <input
                    type="range"
                    min="0.0"
                    max="1.0"
                    step="0.05"
                    className={styles.rangeSlider}
                    value={currentProfile.temperature}
                    onChange={(e) =>
                      setCurrentProfile({
                        ...currentProfile,
                        temperature: parseFloat(e.target.value),
                      })
                    }
                  />
                  <div className={styles.sliderScale}>
                    <span>0.0 (Chính xác)</span>
                    <span>0.5 (Cân bằng)</span>
                    <span>1.0 (Sáng tạo)</span>
                  </div>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <span>Giới hạn phản hồi</span>
                  <span className={styles.labelSubText}>Tokens</span>
                </label>
                <div className={styles.inputWithAffix}>
                  <input
                    type="number"
                    className={styles.input}
                    value={currentProfile.maxTokens}
                    min={128}
                    max={8192}
                    step={128}
                    onChange={(e) =>
                      setCurrentProfile({
                        ...currentProfile,
                        maxTokens: parseInt(e.target.value, 10) || 1024,
                      })
                    }
                    required
                  />
                  <span className={styles.inputAffix}>Tokens</span>
                </div>
              </div>

              {/* KHỐI KIỂM SOÁT LƯU LƯỢNG & HẠN MỨC (AI-12 UI REFINED) */}
              <div className={styles.quotaSectionCard}>
                <div className={styles.quotaHeader}>
                  <div className={styles.quotaHeaderTitle}>
                    <span>🛡️</span>
                    <span>Kiểm Soát Tải & Hạn Mức Tiêu Thụ</span>
                  </div>
                  <span className={styles.quotaHeaderSubtitle}>Token Bucket Guard (Fail-Closed)</span>
                </div>

                <div className={styles.quotaInputsRow}>
                  <div className={styles.compactInputGroup}>
                    <label className={styles.compactInputLabel}>Tần suất tối đa</label>
                    <div className={styles.inputWithAffix}>
                      <input
                        type="number"
                        className={styles.input}
                        value={currentProfile.rateLimitPerMinute ?? 20}
                        min={1}
                        max={600}
                        step={1}
                        onChange={(e) =>
                          setCurrentProfile({
                            ...currentProfile,
                            rateLimitPerMinute: parseInt(e.target.value, 10) || 1,
                          })
                        }
                        required
                      />
                      <span className={styles.inputAffix}>Lượt / phút</span>
                    </div>
                    <span className={styles.fieldHint}>Áp dụng cho mỗi User ID hoặc IP</span>
                  </div>

                  <div className={styles.compactInputGroup}>
                    <label className={styles.compactInputLabel}>Hạn ngạch ngày</label>
                    <div className={styles.inputWithAffix}>
                      <input
                        type="number"
                        className={styles.input}
                        value={currentProfile.dailyQuota ?? 200}
                        min={1}
                        max={5000}
                        step={5}
                        onChange={(e) =>
                          setCurrentProfile({
                            ...currentProfile,
                            dailyQuota: parseInt(e.target.value, 10) || 1,
                          })
                        }
                        required
                      />
                      <span className={styles.inputAffix}>Lượt / ngày</span>
                    </div>
                    <span className={styles.fieldHint}>Reset vào 00:00 hàng ngày</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.formGroup} style={{ marginTop: '16px' }}>
              <label className={styles.label}>
                <span>Chỉ dẫn chuyên môn mặc định (System Instructions)</span>
                <span className={styles.labelBadge}>System Prompt</span>
              </label>
              <textarea
                className={styles.textarea}
                rows={4}
                value={currentProfile.systemInstruction || ''}
                placeholder="Nhập vai trò, quy chuẩn trả lời và phong cách hành xử cho mô hình AI khi phục vụ tính năng này..."
                onChange={(e) =>
                  setCurrentProfile({
                    ...currentProfile,
                    systemInstruction: e.target.value,
                  })
                }
              />
              <div className={styles.helpText}>Chỉ dẫn này sẽ định hình tính cách và tiêu chuẩn đánh giá của mô hình đối với nghiệp vụ cụ thể.</div>
            </div>

            {/* Quick Prompts dành riêng cho Profile CHATBOT */}
            {currentProfile.featureKey === 'CHATBOT' && (
              <div className={styles.formGroup} style={{ marginTop: '16px' }}>
                <label className={styles.label}>
                  <span>Danh sách câu hỏi gợi ý nhanh cho thực tập sinh</span>
                  <span className={styles.labelSubText}>Quick Pills</span>
                </label>
                
                {/* Pill Tags đã thêm */}
                <div className={styles.quickPromptsWrapper}>
                  {(currentProfile.quickPrompts || []).map((prompt, idx) => (
                    <span key={idx} className={styles.quickPromptTag}>
                      <span className={styles.quickPromptDot} />
                      <span className={styles.quickPromptText}>{prompt}</span>
                      <button
                        type="button"
                        className={styles.quickPromptRemoveBtn}
                        onClick={() => handleRemoveQuickPrompt(idx)}
                        title="Xóa câu hỏi gợi ý này"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                  {(!currentProfile.quickPrompts || currentProfile.quickPrompts.length === 0) && (
                    <div className={styles.emptyPromptState}>
                      <span>💬</span>
                      <span>Chưa có câu hỏi gợi ý nhanh nào. Nhập câu hỏi mẫu bên dưới để tạo phím tắt tiện lợi cho thực tập sinh.</span>
                    </div>
                  )}
                </div>

                {/* Ô nhập thêm câu gợi ý mới */}
                <div className={styles.quickPromptAddWrapper}>
                  <input
                    type="text"
                    className={styles.quickPromptAddInput}
                    placeholder="Nhập nội dung câu hỏi gợi ý mới (ví dụ: 'Quy định nộp báo cáo tuần như thế nào?')..."
                    value={newQuickPromptInput}
                    onChange={(e) => setNewQuickPromptInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddQuickPrompt();
                      }
                    }}
                  />
                  <button
                    type="button"
                    className={styles.quickPromptAddBtn}
                    onClick={handleAddQuickPrompt}
                    disabled={!newQuickPromptInput.trim()}
                  >
                    + Thêm Gợi Ý
                  </button>
                </div>
              </div>
            )}

            <div className={styles.cardFooterActions}>
              <button type="submit" disabled={savingProfile} className={styles.saveBtn}>
                {savingProfile ? 'Đang lưu thiết lập...' : 'Lưu Thay Đổi Tính Năng'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* KHỐI 3: KHUNG THỬ NGHIỆM TRỰC TIẾP (SANDBOX TEST CONSOLE THEO FRONTEND-DESIGN) */}
      {currentProfile && (
        <div className={styles.sandboxCard}>
          <div className={styles.sandboxCardHeader}>
            <div className={styles.sandboxCardTitleGroup}>
              <div className={styles.sandboxIconBadge}>🧪</div>
              <div>
                <div className={styles.sandboxCardTitle}>
                  Khu Vực Thử Nghiệm Trực Tiếp: {getCleanFeatureName(currentProfile.featureKey, currentProfile.featureName)}
                </div>
                <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '2px' }}>
                  Mô phỏng phản hồi từ mô hình đã cấu hình để đánh giá chất lượng trước khi đưa vào vận hành.
                </div>
              </div>
            </div>

            <div className={styles.sandboxParamBadges}>
              <span className={styles.sandboxParamBadge}>
                <span className={styles.sandboxParamDot} />
                {currentProfile.modelName}
              </span>
              <span className={styles.sandboxParamBadge}>
                Temp: {Number(currentProfile.temperature).toFixed(2)}
              </span>
            </div>
          </div>

          <div className={styles.sandboxCardBody}>
            {/* Quick Suggestion Pills nếu có */}
            {currentProfile.quickPrompts && currentProfile.quickPrompts.length > 0 && (
              <div className={styles.sandboxQuickSuggestions}>
                <span className={styles.sandboxQuickSuggestionLabel}>Mẫu thử nhanh:</span>
                {currentProfile.quickPrompts.slice(0, 4).map((qp, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={styles.sandboxSuggestionPill}
                    onClick={() => setTestPromptInput(qp)}
                    title="Nhấn để đưa vào khung thử nghiệm"
                  >
                    {qp}
                  </button>
                ))}
              </div>
            )}

            <div className={styles.sandboxTextareaWrapper}>
              <textarea
                className={styles.sandboxTextarea}
                rows={3}
                value={testPromptInput}
                placeholder={`Nhập câu hỏi hoặc nội dung dữ liệu cần AI thẩm định (${getCleanFeatureName(currentProfile.featureKey, currentProfile.featureName)})...`}
                onChange={(e) => setTestPromptInput(e.target.value)}
              />
              <div className={styles.sandboxActionBar}>
                <div className={styles.sandboxHelperTip}>
                  <span>💡</span>
                  <span>Nhấn nút "Gửi Thử Nghiệm" để gọi mô hình qua vòng phân tải Key Vault tự động.</span>
                </div>
                <button
                  type="button"
                  disabled={testingProfile || !testPromptInput.trim()}
                  onClick={handleTestProfileSandbox}
                  className={styles.sandboxRunButton}
                >
                  {testingProfile ? 'Đang thực thi...' : '⚡ Gửi Thử Nghiệm'}
                </button>
              </div>
            </div>

            {/* KẾT QUẢ THỬ NGHIỆM TRONG CONSOLE TERMINAL CAO CẤP */}
            {testResult && (
              <div className={styles.sandboxResponseTerminal}>
                <div className={styles.terminalHeader}>
                  <div className={styles.terminalControls}>
                    <span className={`${styles.terminalDot} ${styles.terminalDotRed}`} />
                    <span className={`${styles.terminalDot} ${styles.terminalDotYellow}`} />
                    <span className={`${styles.terminalDot} ${styles.terminalDotGreen}`} />
                    <span className={styles.terminalTitle}>ai-sandbox-response.log</span>
                  </div>
                  <div className={styles.terminalMeta}>
                    <span
                      className={`${styles.latencyBadge} ${
                        testResult.latencyMs < 1500 ? styles.latencyBadgeFast : styles.latencyBadgeSlow
                      }`}
                    >
                      {testResult.latencyMs}ms
                    </span>
                    <button
                      type="button"
                      className={styles.copyTerminalBtn}
                      onClick={() => {
                        const contentToCopy = testResult.output || testResult.errorMessage || '';
                        navigator.clipboard.writeText(contentToCopy);
                        setSuccessBanner('Đã sao chép phản hồi vào clipboard.');
                      }}
                    >
                      Copy Log
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      )}
      </>
      )}

      {/* KHỐI 3: QUẢN TRỊ PROMPT TEMPLATES & PHIÊN BẢN (AI-19) */}
      {masterTab === 'PROMPTS' && (
        <div className={styles.promptWorkbench}>
          {/* Sidebar danh sách templates */}
          <div className={styles.promptSidebar}>
            <div className={styles.promptListHeader}>
              <div className={styles.promptListTitle}>
                <span>📚 Bộ Mẫu Chỉ Dẫn</span>
                <span className={styles.promptListCountBadge}>{promptTemplates.length} mẫu</span>
              </div>
              <select
                className={styles.promptFilterSelect}
                value={promptCategoryFilter}
                onChange={(e) => {
                  setPromptCategoryFilter(e.target.value);
                  fetchPromptTemplates(e.target.value);
                }}
              >
                <option value="ALL">Tất cả nghiệp vụ</option>
                <option value="INTERVIEW">Khảo Thí & Phỏng Vấn</option>
                <option value="SCREENING">Thẩm Định & Sàng Lọc CV</option>
                <option value="REPORT">Đánh Giá Báo Cáo Tuần</option>
                <option value="CHATBOT">Trợ Lý Giải Đáp FAQ</option>
              </select>
            </div>

            <div className={styles.promptCardsList}>
              {loadingPrompts && <div style={{ fontSize: '13px', color: '#64748b' }}>Đang tải danh sách mẫu...</div>}
              {!loadingPrompts && promptTemplates.length === 0 && (
                <div style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic' }}>Không tìm thấy mẫu nào.</div>
              )}
              {promptTemplates.map((t) => {
                const isSelected = selectedTemplate?.templateCode === t.templateCode;
                const badgeClass =
                  t.featureGroup === 'INTERVIEW'
                    ? styles.badgeInterview
                    : t.featureGroup === 'SCREENING'
                    ? styles.badgeScreening
                    : t.featureGroup === 'REPORT'
                    ? styles.badgeReport
                    : styles.badgeChat;

                const friendlyGroupName =
                  t.featureGroup === 'INTERVIEW'
                    ? 'Phỏng Vấn'
                    : t.featureGroup === 'SCREENING'
                    ? 'Sàng Lọc CV'
                    : t.featureGroup === 'REPORT'
                    ? 'Báo Cáo'
                    : 'Trợ Lý';

                const friendlyName = t.templateName
                  .replace(/System Instruction:\s*/gi, 'Chỉ dẫn hệ thống: ')
                  .replace(/User Prompt:\s*/gi, 'Khung dữ liệu: ')
                  .replace(/Prompt\s*/gi, 'Mẫu ');

                return (
                  <div
                    key={t.templateCode}
                    className={`${styles.promptCardItem} ${isSelected ? styles.promptCardItemActive : ''}`}
                    onClick={() => handleSelectPromptTemplate(t)}
                  >
                    <div className={styles.promptCardHeader}>
                      <span className={styles.promptCardName}>{friendlyName}</span>
                      <span className={`${styles.promptGroupBadge} ${badgeClass}`}>
                        {friendlyGroupName}
                      </span>
                    </div>
                    <div className={styles.promptCardMeta}>
                      <span>Phiên bản: <strong>v{t.version}</strong></span>
                      <span>•</span>
                      <span>{t.availableVariables?.length || 0} trường dữ liệu</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Editor & Quản lý phiên bản chi tiết */}
          {selectedTemplate ? (
            <div className={styles.promptEditorPane}>
              <div className={styles.promptEditorHeader}>
                <div className={styles.promptHeaderTitleGroup}>
                  <h2 className={styles.promptHeaderTitle}>
                    {selectedTemplate.templateName
                      .replace(/System Instruction:\s*/gi, 'Chỉ dẫn: ')
                      .replace(/User Prompt:\s*/gi, 'Khung dữ liệu: ')}
                  </h2>
                  <p className={styles.promptHeaderDesc}>
                    {selectedTemplate.description || 'Chỉnh sửa nội dung chỉ dẫn nghiệp vụ để chuẩn hóa phong cách và tiêu chuẩn phân tích của AI.'}
                  </p>
                </div>

                <div className={styles.promptVersionBar}>
                  <span className={styles.versionBadge}>✓ Đang áp dụng: v{selectedTemplate.version}</span>
                  <label style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>Lịch sử:</label>
                  <select
                    className={styles.versionSelect}
                    value={selectedVersionNum}
                    onChange={(e) => {
                      const vNum = Number(e.target.value);
                      setSelectedVersionNum(vNum);
                      const found = templateVersions.find((tv) => tv.version === vNum);
                      if (found) {
                        setEditingContent(found.templateContent || '');
                      }
                    }}
                  >
                    {templateVersions.map((v) => (
                      <option key={v.version} value={v.version}>
                        Bản v{v.version} {v.isActive ? '(Hiện tại)' : ''}
                      </option>
                    ))}
                  </select>
                  {selectedVersionNum !== selectedTemplate.version && (
                    <button
                      type="button"
                      className={styles.btnSecondary}
                      style={{ fontSize: '11.5px', padding: '4px 10px' }}
                      onClick={() => handleRollbackVersion(selectedVersionNum)}
                      disabled={savingTemplate}
                    >
                      Khôi phục bản v{selectedVersionNum}
                    </button>
                  )}
                </div>
              </div>

              {/* Dải Chips Biến Số Nội Suy */}
              <div className={styles.variablesShelf}>
                <span className={styles.variablesShelfLabel}>
                  <span>⚡</span>
                  <span>Trường dữ liệu tự động điền (Bấm vào để chèn nội dung vào văn bản):</span>
                </span>
                <div className={styles.variablesChipsList}>
                  {selectedTemplate.availableVariables?.map((v) => {
                    const cleanVar = v.replace(/^\{\{?/, '').replace(/\}\}?$/, '');
                    return (
                      <button
                        key={v}
                        type="button"
                        className={styles.varChipBtn}
                        onClick={() => handleInsertVariable(cleanVar)}
                        title={`Chèn trường {{${cleanVar}}}`}
                      >
                        + {cleanVar}
                      </button>
                    );
                  })}
                  {(!selectedTemplate.availableVariables || selectedTemplate.availableVariables.length === 0) && (
                    <span style={{ fontSize: '12.5px', color: '#94a3b8', fontStyle: 'italic' }}>
                      Chỉ dẫn này áp dụng cố định cho toàn bộ luồng, không yêu cầu điền dữ liệu động.
                    </span>
                  )}
                </div>
              </div>

              {/* Soạn thảo chỉ dẫn */}
              <div className={styles.promptEditorWrapper}>
                <textarea
                  className={styles.promptTextarea}
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                  placeholder="Nhập nội dung chỉ dẫn nghiệp vụ dành cho Trợ lý Trí tuệ Nhân tạo..."
                  rows={14}
                />
              </div>

              {/* Action Buttons */}
              <div className={styles.promptActionBar}>
                <button
                  type="button"
                  className={styles.previewBtn}
                  onClick={handleOpenPreviewModal}
                >
                  <span>👁️</span>
                  <span>Xem Trước Mẫu Thử Nghiệm</span>
                </button>
                <button
                  type="button"
                  className={styles.saveTemplateBtn}
                  onClick={handleSavePromptTemplate}
                  disabled={savingTemplate}
                >
                  <span>✓</span>
                  <span>{savingTemplate ? 'Đang cập nhật...' : `Lưu & Xuất Bản Bản Mới (v${selectedTemplate.version + 1})`}</span>
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
              Vui lòng chọn một mẫu chỉ dẫn từ danh sách bên trái.
            </div>
          )}
        </div>
      )}

      {/* MODAL DRY-RUN PREVIEW (AI-19) */}
      {previewModalOpen && (
        <div className={styles.vaultModalOverlay}>
          <div className={styles.vaultModalCard} style={{ maxWidth: '720px' }}>
            <div className={styles.vaultModalHeader}>
              <div className={styles.vaultModalIcon}>👁️</div>
              <div>
                <h3 className={styles.vaultModalTitle}>Xem Trước Chỉ Dẫn Khi Điền Dữ Liệu</h3>
                <p className={styles.vaultModalSubtitle}>
                  Kiểm tra cách các trường thông tin tự động thay thế trước khi lưu thành bản phát hành chính thức.
                </p>
              </div>
            </div>

            <div className={styles.vaultModalBody}>
              {selectedTemplate?.availableVariables && selectedTemplate.availableVariables.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                    Dữ liệu giả lập mẫu:
                  </h4>
                  <div className={styles.variablesTestGrid}>
                    {selectedTemplate.availableVariables.map((rawV) => {
                      const v = rawV.replace(/^\{\{?/, '').replace(/\}\}?$/, '');
                      return (
                        <div key={v} className={styles.compactInputGroup}>
                          <label className={styles.compactInputLabel}>{v}</label>
                          <input
                            type="text"
                            className={styles.input}
                            value={previewSampleVars[v] || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setPreviewSampleVars((prev) => ({ ...prev, [v]: val }));
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    className={styles.btnSecondary}
                    style={{ fontSize: '12px', padding: '6px 14px', marginBottom: '14px' }}
                    onClick={async () => {
                      setPreviewLoading(true);
                      try {
                        const res = await aiService.previewPromptTemplate({
                          templateContent: editingContent,
                          sampleVariables: previewSampleVars,
                        });
                        setPreviewResult(res);
                      } finally {
                        setPreviewLoading(false);
                      }
                    }}
                  >
                    🔄 Cập Nhật Xem Thử
                  </button>
                </div>
              )}

              <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                Nội dung hoàn chỉnh Trợ lý Trí tuệ Nhân tạo sẽ nhận được:
              </h4>
              <div className={styles.modalPreviewContent}>
                {previewLoading ? 'Đang tổng hợp dữ liệu...' : previewResult?.resolvedPrompt || editingContent}
              </div>
            </div>

            <div className={styles.vaultModalActions}>
              <button
                type="button"
                className={styles.vaultModalCancelBtn}
                onClick={() => setPreviewModalOpen(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiSettingsPage;

