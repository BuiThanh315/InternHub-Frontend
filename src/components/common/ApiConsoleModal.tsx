import React, { useState } from 'react';
import {
  X,
  Play,
  Terminal,
  Clock,
  Copy,
  Check,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { apiClient } from '../../services/api';

interface ApiEndpointConfig {
  id: string;
  name: string;
  category: 'AUTH' | 'INTERN' | 'DOCS' | 'USERS' | 'SYSTEM';
  method: 'GET' | 'POST' | 'PUT' | 'PATCH';
  url: string;
  description: string;
  defaultHeaders?: Record<string, string>;
  defaultBody?: any;
  requiresAuth?: boolean;
}

const ENDPOINTS: ApiEndpointConfig[] = [
  {
    id: 'ping',
    name: '1. Ping Gateway & Employee Service',
    category: 'SYSTEM',
    method: 'GET',
    url: '/api/employees',
    description: 'Kiểm tra thông luồng API Gateway (8080) sang Employee Service (8081)',
  },
  {
    id: 'login-hr',
    name: '2. Đăng Nhập Lấy Token (HR)',
    category: 'AUTH',
    method: 'POST',
    url: '/api/auth/login',
    description: 'Xác thực tài khoản HR (hr / 123456) và cấp Bearer JWT Token',
    defaultBody: { username: 'hr', password: '123456' },
  },
  {
    id: 'login-admin',
    name: '3. Đăng Nhập Lấy Token (Admin)',
    category: 'AUTH',
    method: 'POST',
    url: '/api/auth/login',
    description: 'Xác thực tài khoản Admin (admin / 123456) và cấp Bearer JWT Token',
    defaultBody: { username: 'admin', password: '123456' },
  },
  {
    id: 'get-interns',
    name: '4. Lấy Danh Sách Thực Tập Sinh (Phân trang)',
    category: 'INTERN',
    method: 'GET',
    url: '/api/employees/interns?page=0&size=10',
    description: 'Tìm kiếm, lọc hồ sơ TTS với các tiêu chí keyword, university, status',
    requiresAuth: true,
  },
  {
    id: 'create-intern',
    name: '5. Tạo Mới Hồ Sơ Thực Tập Sinh (TM-1)',
    category: 'INTERN',
    method: 'POST',
    url: '/api/employees/interns',
    description: 'Tạo hồ sơ mới (Public / Candidate registration)',
    defaultBody: {
      fullName: 'Phan Minh Hoàng',
      email: `hoang.phan${Math.floor(Math.random() * 9000 + 1000)}@gmail.com`,
      phone: `09${Math.floor(Math.random() * 90000000 + 10000000)}`,
      university: 'Đại Học Bách Khoa',
      major: 'Kỹ Thuật Phần Mềm',
      appliedPosition: 'Thực tập sinh Backend (Java/Spring)',
      startDate: new Date().toISOString().split('T')[0],
      gender: 'MALE',
      academicYear: '2022-2026',
      address: 'Hai Bà Trưng, Hà Nội',
    },
  },
  {
    id: 'update-intern',
    name: '6. Cập Nhật Trạng Thái & Thông Tin (TM-2)',
    category: 'INTERN',
    method: 'PUT',
    url: '/api/employees/interns/1',
    description: 'Cập nhật hồ sơ và chuyển trạng thái PENDING -> APPROVED -> INTERNING -> COMPLETED',
    requiresAuth: true,
    defaultBody: {
      fullName: 'Nguyễn Hoàng Long (Đã Cập Nhật)',
      email: 'long.nguyen@gmail.com',
      phone: '0912345678',
      university: 'Đại Học Bách Khoa',
      major: 'Khoa Học Máy Tính',
      appliedPosition: 'Thực tập sinh Backend (Java/Spring)',
      startDate: '2026-10-01',
      status: 'APPROVED',
      gender: 'MALE',
      academicYear: '2022-2026',
      address: 'Hà Nội',
      notes: 'Đã hoàn thành phỏng vấn vòng 1, chuyển duyệt hồ sơ.',
    },
  },
  {
    id: 'get-users',
    name: '7. Lấy Danh Sách Người Dùng (Admin/Users)',
    category: 'USERS',
    method: 'GET',
    url: '/api/employees/users',
    description: 'Danh sách tài khoản hệ thống từ database Microservices',
    requiresAuth: true,
  },
  {
    id: 'review-doc',
    name: '8. Thẩm Định Phê Duyệt Tài Liệu (TM-5)',
    category: 'DOCS',
    method: 'PATCH',
    url: '/api/employees/interns/documents/1/review',
    description: 'HR phê duyệt hoặc từ chối tài liệu đính kèm kèm lý do tối thiểu 5 ký tự',
    requiresAuth: true,
    defaultBody: {
      status: 'APPROVED',
      rejectionReason: '',
    },
  },
];

export const ApiConsoleModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpointConfig>(ENDPOINTS[0]);
  const [requestUrl, setRequestUrl] = useState(ENDPOINTS[0].url);
  const [requestBodyText, setRequestBodyText] = useState(
    ENDPOINTS[0].defaultBody ? JSON.stringify(ENDPOINTS[0].defaultBody, null, 2) : ''
  );

  const [loading, setLoading] = useState(false);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseDuration, setResponseDuration] = useState<number | null>(null);
  const [responseBody, setResponseBody] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Automated Test Suite State
  const [autoTesting, setAutoTesting] = useState(false);
  const [autoResults, setAutoResults] = useState<
    Array<{ id: string; name: string; status: 'SUCCESS' | 'ERROR'; code: number; time: number }>
  >([]);

  if (!isOpen) return null;

  const handleSelectEndpoint = (ep: ApiEndpointConfig) => {
    setSelectedEndpoint(ep);
    setRequestUrl(ep.url);
    setRequestBodyText(ep.defaultBody ? JSON.stringify(ep.defaultBody, null, 2) : '');
    setResponseStatus(null);
    setResponseDuration(null);
    setResponseBody(null);
  };

  const handleExecute = async () => {
    setLoading(true);
    setResponseStatus(null);
    setResponseBody(null);
    const startTime = performance.now();

    try {
      let parsedBody: any = undefined;
      if (['POST', 'PUT', 'PATCH'].includes(selectedEndpoint.method) && requestBodyText.trim()) {
        try {
          parsedBody = JSON.parse(requestBodyText);
        } catch (e: any) {
          alert('JSON Payload không hợp lệ: ' + e.message);
          setLoading(false);
          return;
        }
      }

      let res: any;
      if (selectedEndpoint.method === 'GET') {
        res = await apiClient.get(requestUrl);
      } else if (selectedEndpoint.method === 'POST') {
        res = await apiClient.post(requestUrl, parsedBody);
      } else if (selectedEndpoint.method === 'PUT') {
        res = await apiClient.put(requestUrl, parsedBody);
      } else if (selectedEndpoint.method === 'PATCH') {
        res = await apiClient.patch(requestUrl, parsedBody);
      }

      const duration = Math.round(performance.now() - startTime);
      setResponseDuration(duration);
      setResponseStatus(res.status);
      setResponseBody(JSON.stringify(res.data, null, 2));
    } catch (err: any) {
      const duration = Math.round(performance.now() - startTime);
      setResponseDuration(duration);
      if (err.response) {
        setResponseStatus(err.response.status);
        setResponseBody(JSON.stringify(err.response.data, null, 2));
      } else {
        setResponseStatus(500);
        setResponseBody(JSON.stringify({ error: err.message || 'Lỗi mạng hoặc Backend Offline' }, null, 2));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRunAllTests = async () => {
    setAutoTesting(true);
    const results: Array<{ id: string; name: string; status: 'SUCCESS' | 'ERROR'; code: number; time: number }> = [];

    for (const ep of ENDPOINTS) {
      const start = performance.now();
      try {
        let res: any;
        if (ep.method === 'GET') {
          res = await apiClient.get(ep.url);
        } else if (ep.method === 'POST') {
          res = await apiClient.post(ep.url, ep.defaultBody);
        } else if (ep.method === 'PUT') {
          res = await apiClient.put(ep.url, ep.defaultBody);
        } else if (ep.method === 'PATCH') {
          res = await apiClient.patch(ep.url, ep.defaultBody);
        }
        const time = Math.round(performance.now() - start);
        results.push({
          id: ep.id,
          name: ep.name,
          status: res.status >= 200 && res.status < 400 ? 'SUCCESS' : 'ERROR',
          code: res.status,
          time,
        });
      } catch (err: any) {
        const time = Math.round(performance.now() - start);
        const code = err.response ? err.response.status : 500;
        results.push({
          id: ep.id,
          name: ep.name,
          status: code >= 200 && code < 400 ? 'SUCCESS' : 'ERROR',
          code,
          time,
        });
      }
      setAutoResults([...results]);
    }
    setAutoTesting(false);
  };

  const copyToClipboard = () => {
    if (responseBody) {
      navigator.clipboard.writeText(responseBody);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '1100px',
          height: '88vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
          backgroundColor: '#0f172a',
          border: '1px solid #334155',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#1e293b',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                color: '#818cf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Terminal size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                Bảng Điều Khiển & Thao Tác API Backend (Live API Console)
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>
                Thực hiện trực tiếp các yêu cầu HTTP Axios tới API Gateway (Port 8080) và quan sát phản hồi JSON
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={handleRunAllTests}
              disabled={autoTesting}
              className="btn btn-sm btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}
            >
              <Zap size={14} />
              <span>{autoTesting ? 'Đang chạy kiểm thử...' : 'Test Tự Động Tất Cả API'}</span>
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '0.25rem',
              }}
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Modal Body: Left API Directory | Right Execution & Output */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Left Column: API Endpoints List */}
          <div
            style={{
              width: '320px',
              borderRight: '1px solid #1e293b',
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              overflowY: 'auto',
              padding: '0.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem',
            }}
          >
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', padding: '0.4rem' }}>
              Danh Mục API Microservices
            </span>

            {ENDPOINTS.map((ep) => {
              const isSelected = ep.id === selectedEndpoint.id;
              return (
                <div
                  key={ep.id}
                  onClick={() => handleSelectEndpoint(ep)}
                  style={{
                    padding: '0.65rem 0.75rem',
                    borderRadius: '8px',
                    border: isSelected ? '1px solid #6366f1' : '1px solid transparent',
                    backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.4rem',
                        borderRadius: '4px',
                        backgroundColor:
                          ep.method === 'GET'
                            ? 'rgba(59, 130, 246, 0.2)'
                            : ep.method === 'POST'
                            ? 'rgba(16, 185, 129, 0.2)'
                            : ep.method === 'PUT'
                            ? 'rgba(245, 158, 11, 0.2)'
                            : 'rgba(139, 92, 246, 0.2)',
                        color:
                          ep.method === 'GET'
                            ? '#60a5fa'
                            : ep.method === 'POST'
                            ? '#34d399'
                            : ep.method === 'PUT'
                            ? '#fbbf24'
                            : '#a78bfa',
                      }}
                    >
                      {ep.method}
                    </span>
                    <span style={{ fontSize: '0.68rem', color: '#64748b' }}>{ep.category}</span>
                  </div>
                  <p
                    style={{
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: isSelected ? '#fff' : '#cbd5e1',
                      margin: 0,
                      lineHeight: 1.3,
                    }}
                  >
                    {ep.name}
                  </p>
                </div>
              );
            })}

            {/* Test All Results Widget */}
            {autoResults.length > 0 && (
              <div
                style={{
                  marginTop: '1rem',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#e2e8f0' }}>Kết Quả Kiểm Thử</span>
                  <span style={{ fontSize: '0.7rem', color: '#10b981' }}>
                    {autoResults.filter((r) => r.status === 'SUCCESS').length}/{autoResults.length} Đạt
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: '160px', overflowY: 'auto' }}>
                  {autoResults.map((res) => (
                    <div
                      key={res.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.725rem',
                        color: res.status === 'SUCCESS' ? '#34d399' : '#f87171',
                      }}
                    >
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>
                        {res.name}
                      </span>
                      <span>
                        {res.code} ({res.time}ms)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Request Composer & Live Response Viewer */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: '#0b1120' }}>
            {/* Top Bar: URL & Execute Button */}
            <div
              style={{
                padding: '1rem 1.25rem',
                borderBottom: '1px solid #1e293b',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <span
                style={{
                  padding: '0.45rem 0.75rem',
                  borderRadius: '6px',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  backgroundColor:
                    selectedEndpoint.method === 'GET'
                      ? 'rgba(59, 130, 246, 0.2)'
                      : selectedEndpoint.method === 'POST'
                      ? 'rgba(16, 185, 129, 0.2)'
                      : selectedEndpoint.method === 'PUT'
                      ? 'rgba(245, 158, 11, 0.2)'
                      : 'rgba(139, 92, 246, 0.2)',
                  color:
                    selectedEndpoint.method === 'GET'
                      ? '#60a5fa'
                      : selectedEndpoint.method === 'POST'
                      ? '#34d399'
                      : selectedEndpoint.method === 'PUT'
                      ? '#fbbf24'
                      : '#a78bfa',
                }}
              >
                {selectedEndpoint.method}
              </span>

              <input
                type="text"
                className="form-input"
                style={{
                  flex: 1,
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  backgroundColor: '#1e293b',
                  borderColor: '#334155',
                  color: '#f8fafc',
                }}
                value={requestUrl}
                onChange={(e) => setRequestUrl(e.target.value)}
              />

              <button
                onClick={handleExecute}
                disabled={loading}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1.25rem' }}
              >
                <Play size={16} fill="currentColor" />
                <span>{loading ? 'Đang gửi...' : 'Gửi Request'}</span>
              </button>
            </div>

            {/* Middle Section: Request Body & Response Tabs */}
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1.2fr', overflow: 'hidden' }}>
              {/* Left Sub-column: Request Payload Editor */}
              <div
                style={{
                  borderRight: '1px solid #1e293b',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  padding: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8' }}>
                    Request Body (JSON)
                  </span>
                  {selectedEndpoint.defaultBody && (
                    <button
                      onClick={() =>
                        setRequestBodyText(JSON.stringify(selectedEndpoint.defaultBody, null, 2))
                      }
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#818cf8',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                    >
                      <RotateCcw size={12} /> Đặt lại mẫu
                    </button>
                  )}
                </div>

                {['POST', 'PUT', 'PATCH'].includes(selectedEndpoint.method) ? (
                  <textarea
                    rows={12}
                    value={requestBodyText}
                    onChange={(e) => setRequestBodyText(e.target.value)}
                    style={{
                      flex: 1,
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      fontFamily: 'monospace',
                      fontSize: '0.8rem',
                      padding: '0.75rem',
                      resize: 'none',
                    }}
                    placeholder="Nhập JSON body..."
                  />
                ) : (
                  <div
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#64748b',
                      fontSize: '0.85rem',
                      border: '1px dashed #334155',
                      borderRadius: '8px',
                      textAlign: 'center',
                      padding: '1.5rem',
                    }}
                  >
                    Phương thức {selectedEndpoint.method} không cần Request Body. Bạn có thể truyền Query Params trên thanh URL.
                  </div>
                )}

                <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.6rem', marginBottom: 0 }}>
                  💡 {selectedEndpoint.description}
                </p>
              </div>

              {/* Right Sub-column: Live Response Inspector */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  padding: '1rem',
                  backgroundColor: '#070d18',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8' }}>Phản Hồi (Response)</span>
                    {responseStatus !== null && (
                      <span
                        style={{
                          fontSize: '0.725rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          backgroundColor:
                            responseStatus >= 200 && responseStatus < 300
                              ? 'rgba(16, 185, 129, 0.2)'
                              : 'rgba(239, 68, 68, 0.2)',
                          color: responseStatus >= 200 && responseStatus < 300 ? '#34d399' : '#f87171',
                        }}
                      >
                        Status: {responseStatus}
                      </span>
                    )}
                    {responseDuration !== null && (
                      <span style={{ fontSize: '0.725rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <Clock size={12} /> {responseDuration} ms
                      </span>
                    )}
                  </div>

                  {responseBody && (
                    <button
                      onClick={copyToClipboard}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: copied ? '#34d399' : '#818cf8',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                    >
                      {copied ? <Check size={13} /> : <Copy size={13} />}
                      <span>{copied ? 'Đã sao chép' : 'Sao chép JSON'}</span>
                    </button>
                  )}
                </div>

                <div
                  style={{
                    flex: 1,
                    backgroundColor: '#0f172a',
                    border: '1px solid #1e293b',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    overflowY: 'auto',
                    fontFamily: 'monospace',
                    fontSize: '0.8rem',
                    color: responseStatus && responseStatus >= 400 ? '#fca5a5' : '#a5f3fc',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {loading ? (
                    <div style={{ color: '#94a3b8', textAlign: 'center', padding: '3rem' }}>
                      Đang kết nối tới Backend Gateway http://localhost:8080...
                    </div>
                  ) : responseBody ? (
                    responseBody
                  ) : (
                    <div style={{ color: '#475569', textAlign: 'center', padding: '3rem' }}>
                      Nhấn "Gửi Request" để thực thi API và quan sát kết quả tại đây
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
