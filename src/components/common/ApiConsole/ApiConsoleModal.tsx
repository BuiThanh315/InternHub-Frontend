import React, { useState } from 'react';
import {
  X,
  Play,
  Terminal,
  Copy,
  Check,
  Zap,
} from 'lucide-react';

import { Button } from '../Button/Button';
import { toast } from 'sonner';
import { apiClient } from '../../../services/api';
import { ENDPOINTS, type ApiEndpointConfig } from './apiConsole.config';
import styles from './ApiConsoleModal.module.css';

interface ApiConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TestResult {
  id: string;
  name: string;
  status: 'SUCCESS' | 'ERROR';
  code: number;
  time: number;
}

export const ApiConsoleModal: React.FC<ApiConsoleModalProps> = ({ isOpen, onClose }) => {
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

  const [autoTesting, setAutoTesting] = useState(false);
  const [autoResults, setAutoResults] = useState<TestResult[]>([]);

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
      let parsedBody: unknown = undefined;
      if (['POST', 'PUT', 'PATCH'].includes(selectedEndpoint.method) && requestBodyText.trim()) {
        try {
          parsedBody = JSON.parse(requestBodyText);
        } catch (e) {
          const errMsg = e instanceof Error ? e.message : 'Lỗi cú pháp';
          toast.error('JSON Payload không hợp lệ: ' + errMsg);
          setLoading(false);
          return;
        }
      }

      let res;
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
      setResponseStatus(res ? res.status : 200);
      setResponseBody(JSON.stringify(res?.data, null, 2));
    } catch (err: unknown) {
      const duration = Math.round(performance.now() - startTime);
      setResponseDuration(duration);
      const axiosErr = err as { response?: { status: number; data: unknown }; message?: string };
      setResponseStatus(axiosErr.response?.status || 500);
      setResponseBody(JSON.stringify(axiosErr.response?.data || { error: axiosErr.message }, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const runAllAutomatedTests = async () => {
    setAutoTesting(true);
    const results: TestResult[] = [];

    for (const ep of ENDPOINTS) {
      const start = performance.now();
      try {
        let res;
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
        const status = res && res.status >= 200 && res.status < 400 ? 'SUCCESS' : 'ERROR';
        results.push({ id: ep.id, name: ep.name, status, code: res?.status || 200, time });
      } catch (err: unknown) {
        const time = Math.round(performance.now() - start);
        const axiosErr = err as { response?: { status: number } };
        const code = axiosErr.response ? axiosErr.response.status : 500;
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

  const getMethodClass = (method: string) => {
    switch (method) {
      case 'GET': return styles.methodGet;
      case 'POST': return styles.methodPost;
      case 'PUT': return styles.methodPut;
      case 'PATCH': return styles.methodPatch;
      default: return '';
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modalCard}>
        {/* Modal Header */}
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <Terminal size={22} className={styles.headerIcon} />
            <div>
              <h3 className={styles.titleText}>InternHub Microservices REST API Console</h3>
            </div>
          </div>
          <button onClick={onClose} className={styles.closeBtn}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className={styles.bodyLayout}>
          {/* Sidebar */}
          <div className={styles.sidebar}>
            <div className={styles.sidebarHeader}>API Endpoints ({ENDPOINTS.length})</div>
            {ENDPOINTS.map((ep) => (
              <div
                key={ep.id}
                onClick={() => handleSelectEndpoint(ep)}
                className={`${styles.endpointItem} ${
                  selectedEndpoint.id === ep.id ? styles.endpointSelected : ''
                }`}
              >
                <div>
                  <span className={`${styles.methodBadge} ${getMethodClass(ep.method)}`}>
                    {ep.method}
                  </span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{ep.name}</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '3px' }}>
                  {ep.url}
                </div>
              </div>
            ))}
          </div>

          {/* Main Workspace */}
          <div className={styles.mainContent}>
            {/* URL bar */}
            <div className={styles.urlBar}>
              <span className={`${styles.methodBadge} ${getMethodClass(selectedEndpoint.method)}`}>
                {selectedEndpoint.method}
              </span>
              <input
                type="text"
                value={requestUrl}
                onChange={(e) => setRequestUrl(e.target.value)}
                className={styles.urlInput}
              />
              <Button variant="primary" size="sm" onClick={handleExecute} disabled={loading}>
                <Play size={15} /> {loading ? 'Đang gửi...' : 'Send'}
              </Button>
            </div>

            {/* Request Body editor if POST/PUT/PATCH */}
            {['POST', 'PUT', 'PATCH'].includes(selectedEndpoint.method) && (
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>
                  JSON Request Body:
                </div>
                <textarea
                  value={requestBodyText}
                  onChange={(e) => setRequestBodyText(e.target.value)}
                  className={styles.codeArea}
                />
              </div>
            )}

            {/* Response Area */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  Response: {responseStatus ? `Status: ${responseStatus}` : ''}{' '}
                  {responseDuration ? `(${responseDuration}ms)` : ''}
                </span>
                {responseBody && (
                  <button onClick={copyToClipboard} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.75rem' }}>
                    {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? 'Đã sao chép' : 'Sao chép'}
                  </button>
                )}
              </div>
              <pre className={styles.responseBox}>
                {responseBody || '// Kết quả phản hồi từ API sẽ hiển thị tại đây...'}
              </pre>
            </div>

            {/* Automated Test Suite Trigger */}
            <div style={{ marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button variant="outline" size="sm" onClick={runAllAutomatedTests} disabled={autoTesting}>
                <Zap size={14} /> {autoTesting ? 'Đang kiểm thử toàn bộ...' : 'Chạy kiểm thử toàn bộ API (Auto-Test)'}
              </Button>
              {autoResults.length > 0 && (
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  Đã test: {autoResults.filter((r) => r.status === 'SUCCESS').length}/{autoResults.length} endpoints pass
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiConsoleModal;
