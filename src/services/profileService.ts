import { apiClient } from './api';
import { API_ENDPOINTS } from '../constants/endpoints';
import type {
  User,
  InternProfile,
  ApiResponse,
  UpdateUserProfileRequest,
  UpdateInternAcademicRequest,
  ChangePasswordFormData,
  AvatarUploadUrlResponse,
  AvatarUpdateResponse,
} from '../types';

/**
 * Kiểm tra Magic Bytes thực tế của tệp ảnh trước khi tải lên (Client-side Security Check)
 */
export const validateImageMagicBytes = async (file: File): Promise<boolean> => {
  const buffer = await file.slice(0, 4).arrayBuffer();
  const bytes = new Uint8Array(buffer);
  
  // JPEG: FF D8 FF
  const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  // PNG: 89 50 4E 47
  const isPng = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  // WEBP: 52 49 46 46 (RIFF)
  const isWebp = bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46;

  return isJpeg || isPng || isWebp;
};

export const profileService = {
  /**
   * Lấy thông tin tài khoản của phiên đăng nhập hiện tại
   */
  async getMyAccount(signal?: AbortSignal): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>(
      API_ENDPOINTS.USER.PROFILE_ME,
      { signal }
    );
    if (response.data && response.data.data) {
      return response.data.data;
    }
    throw new Error('Không thể tải thông tin tài khoản từ máy chủ');
  },

  /**
   * Cập nhật thông tin cá nhân cơ bản (Nhóm B: SĐT, Địa chỉ, Bio, Giới tính)
   * Sử dụng endpoint Self-Service /api/users/me (dùng chung cho mọi role)
   */
  async updatePersonalInfo(
    payload: UpdateUserProfileRequest,
    signal?: AbortSignal
  ): Promise<User> {
    const response = await apiClient.put<ApiResponse<User>>(
      API_ENDPOINTS.USER.UPDATE_PROFILE,
      payload,
      { signal }
    );
    if (response.data && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data?.message || 'Không thể cập nhật thông tin cá nhân');
  },

  /**
   * Cập nhật thông tin học vấn & kỹ năng cho Thực tập sinh
   */
  async updateInternAcademic(
    payload: UpdateInternAcademicRequest,
    signal?: AbortSignal
  ): Promise<InternProfile> {
    const response = await apiClient.put<ApiResponse<InternProfile>>(
      '/api/interns/my-profile/academic',
      payload,
      { signal }
    );
    if (response.data && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data?.message || 'Không thể cập nhật thông tin học vấn');
  },

  /**
   * Xin Presigned Upload URL cho Avatar từ identity-service
   */
  async requestAvatarUploadUrl(
    file: File,
    signal?: AbortSignal
  ): Promise<AvatarUploadUrlResponse> {
    const payload = {
      fileName: file.name,
      contentType: file.type || 'image/webp',
      fileSize: file.size,
    };

    const response = await apiClient.post<ApiResponse<AvatarUploadUrlResponse>>(
      API_ENDPOINTS.USER.AVATAR_UPLOAD_URL,
      payload,
      { signal }
    );
    if (response.data && response.data.data) {
      return response.data.data;
    }
    throw new Error('Không thể xin liên kết tải lên ảnh đại diện');
  },

  /**
   * Tải trực tiếp binary file lên S3 qua HTTP PUT
   */
  async uploadBinaryToS3(
    presignedUrl: string,
    file: File,
    onProgress?: (percent: number) => void,
    signal?: AbortSignal
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', presignedUrl, true);
      xhr.setRequestHeader('Content-Type', file.type || 'image/webp');

      if (xhr.upload && onProgress) {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded * 100) / e.total);
            onProgress(percent);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Tải ảnh lên S3 thất bại với mã trạng thái: ${xhr.status}`));
        }
      };

      xhr.onerror = () => reject(new Error('Lỗi kết nối mạng khi tải ảnh lên máy chủ lưu trữ'));
      if (signal) {
        signal.addEventListener('abort', () => xhr.abort());
      }
      xhr.send(file);
    });
  },

  /**
   * Xác nhận avatarKey sau khi upload S3 thành công
   */
  async confirmAvatarUpdate(
    avatarKey: string,
    signal?: AbortSignal
  ): Promise<AvatarUpdateResponse> {
    const response = await apiClient.patch<ApiResponse<AvatarUpdateResponse>>(
      API_ENDPOINTS.USER.AVATAR_UPDATE,
      { avatarKey },
      { signal }
    );
    if (response.data && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data?.message || 'Xác nhận đổi ảnh đại diện thất bại');
  },

  /**
   * Đổi mật khẩu tài khoản bảo mật
   */
  async changePassword(
    payload: ChangePasswordFormData,
    signal?: AbortSignal
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<ApiResponse<void>>(
      '/api/auth/change-password',
      payload,
      { signal }
    );
    return {
      success: response.data?.code === 200 || !response.data?.errors,
      message: response.data?.message || 'Mật khẩu đã được cập nhật an toàn',
    };
  },
};

export default profileService;
