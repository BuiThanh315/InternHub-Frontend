/**
 * Trả về Avatar URL chuẩn cho người dùng trên toàn hệ thống (Design Spec mục 1.4)
 * - Ưu tiên 1: avatarUrl thật từ S3 Public Storage (kèm cache-busting timestamp nếu có).
 * - Ưu tiên 2: Fallback 100% bằng DiceBear collection `notionists` seed-based theo userId/username.
 */
export const getAvatarUrl = (user?: {
  avatarUrl?: string | null;
  id?: number | string | null;
  userId?: number | string | null;
  username?: string | null;
}): string => {
  if (user?.avatarUrl && user.avatarUrl.trim() !== '') {
    return user.avatarUrl;
  }

  const rawSeed = user?.id ?? user?.userId ?? user?.username ?? 'internhub-user';
  const seed = encodeURIComponent(String(rawSeed));

  return `https://api.dicebear.com/7.x/notionists/svg?seed=${seed}&backgroundColor=eef0ff`;
};

export default getAvatarUrl;
