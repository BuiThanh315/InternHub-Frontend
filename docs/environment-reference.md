# InternHub Project Repositories & Environment Reference

Tài liệu này lưu trữ thông tin môi trường và địa chỉ repository của dự án InternHub để phục vụ tra cứu và phối hợp phát triển.

> **Lưu ý**: Theo quy tắc bảo mật tại `AGENTS.md`, các file `.env*` chứa bí mật không được đọc/sửa trực tiếp. File này đóng vai trò tham chiếu cấu hình công khai.

---

## 1. Repository URLs

- **Frontend Repository**:
  - URL: `https://github.com/BuiThanh315/InternHub-Frontend.git`
  - Active Branch: `feature/TM-1-to-TM-5/intern-management-core`
  - Stack: React 19, TypeScript, Vite, Tailwind CSS, TanStack React Query v5

- **Backend Repository**:
  - URL: `https://github.com/khanhld3010/InternHub.git`
  - Stack: Spring Cloud Microservices, Eureka Server, Spring Cloud Gateway

---

## 2. Default Local Services & Endpoints

| Service / Thành phần | URL / Port | Ghi chú |
| :--- | :--- | :--- |
| **API Gateway** | `http://localhost:8080` | Entrypoint cho toàn bộ API Frontend |
| **Eureka Server** | `http://localhost:8761` | Service Registry |
| **Frontend Dev Server** | `http://localhost:5173` | Vite Dev Server |

---

## 3. Environment Variables (PowerShell System / User Scope)

Đã được cấu hình tự động vào biến môi trường:
- `INTERNHUB_FE_REPO` = `https://github.com/BuiThanh315/InternHub-Frontend.git`
- `INTERNHUB_BE_REPO` = `https://github.com/khanhld3010/InternHub.git`
- `INTERNHUB_API_GATEWAY` = `http://localhost:8080`
