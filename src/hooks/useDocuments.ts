import { useState, useEffect, useCallback, useRef } from 'react';
import { documentService } from '../services/documentService';
import type { DocumentResponse, DocumentType, ReviewDocumentRequest } from '../types';
import type { AppError } from '../services/api';

export interface UseDocumentsOptions {
  internCode?: string;
  autoFetch?: boolean;
}

export function useDocuments(options: UseDocumentsOptions = {}) {
  const { internCode, autoFetch = true } = options;

  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(autoFetch);
  const [error, setError] = useState<AppError | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchDocuments = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      if (internCode) {
        const list = await documentService.getDocumentsByInternCode(internCode);
        setDocuments(list);
      } else {
        const list = await documentService.getAllDocuments();
        setDocuments(list);
      }
    } catch (err: any) {
      if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
        setError(err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [internCode]);

  useEffect(() => {
    if (autoFetch) {
      fetchDocuments();
    }
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [autoFetch, fetchDocuments]);

  const uploadDocument = async (
    targetInternCode: string,
    file: File,
    type: DocumentType
  ): Promise<DocumentResponse> => {
    setUploadProgress(0);
    try {
      const uploaded = await documentService.uploadDocument(
        targetInternCode,
        file,
        type,
        (progress) => setUploadProgress(progress)
      );
      setUploadProgress(100);
      await fetchDocuments();
      return uploaded;
    } finally {
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const reviewDocument = async (
    documentId: number,
    request: ReviewDocumentRequest
  ): Promise<DocumentResponse> => {
    const reviewed = await documentService.reviewDocument(documentId, request);
    await fetchDocuments();
    return reviewed;
  };

  return {
    documents,
    isLoading,
    error,
    uploadProgress,
    refetch: fetchDocuments,
    uploadDocument,
    reviewDocument,
  };
}
