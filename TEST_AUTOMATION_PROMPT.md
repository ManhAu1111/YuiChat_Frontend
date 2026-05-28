# 🤖 YÊU CẦU TỰ ĐỘNG: KIỂM TRA VÀ SỬA E2E TESTS (PLAYWRIGHT)

**Bối cảnh:**
Dự án YuiChat sử dụng Vue 3 cho Frontend và Playwright để test E2E. Khi UI hoặc API bị thay đổi, các test trong `tests/` thường bị fail do sai locator (class, id) hoặc sai API endpoint.

**Mục tiêu của AI:**
Hãy tự động hóa việc chạy test, phát hiện lỗi và cập nhật lại file test để chúng Pass 100% mà không được thay đổi code nguồn của ứng dụng.

## 📋 CÁC BƯỚC THỰC HIỆN DÀNH CHO AI (Vui lòng chạy tuần tự):

### Bước 1: Chạy toàn bộ Test để lấy Report
- Chạy lệnh sau trong terminal background:
  `npx playwright test --project=chromium --workers=1 --reporter=list > test-report.log 2>&1`
- Đọc file `test-report.log` hoặc kiểm tra thư mục `test-results/` (đặc biệt là các file `error-context.md`) để xác định chính xác các test case đang bị fail.

### Bước 2: Phân tích nguyên nhân & Tra cứu code nguồn
- Đối chiếu lỗi từ Playwright (ví dụ: `TimeoutError: locator.waitFor`, `strict mode violation`, hoặc lỗi API mock không khớp).
- Dùng công cụ `grep_search` để tìm kiếm các text hoặc element tương ứng bên trong thư mục `src/components/` hoặc `src/views/` để xem logic / ID / class mới nhất của element đó là gì.
- **Lưu ý đặc biệt cho YuiChat:** 
  - Input chat sử dụng ID `#chat-message-input` (không phải `textarea`).
  - Nút gửi tin nhắn sử dụng ID `#chat-send-btn` (có thể bị ẩn `v-if` khi không có text).
  - Các API của backend thường có prefix `/api/` (ví dụ: `/api/search` thay vì `/api/users/search`).
  - Các modal (ví dụ: Tạo nhóm) có thể không bắt sự kiện phím `Escape`, hãy ưu tiên dùng cách click vào nút "Huỷ" hoặc click vào background.

### Bước 3: Cập nhật file Test
- Tiến hành chỉnh sửa các file test trong thư mục `tests/` bằng công cụ `replace_file_content`.
- **TUYỆT ĐỐI KHÔNG** được chỉnh sửa bất kỳ file nào trong thư mục `src/`. Chỉ được sửa code trong thư mục `tests/`.

### Bước 4: Chạy lại Test để xác minh
- Sau khi sửa xong, chạy lại lệnh:
  `npx playwright test --project=chromium --workers=1`
- Nếu vẫn còn test fail, quay lại Bước 2. Nếu đã Pass 100%, chuyển sang Bước 5.

### Bước 5: Báo cáo kết quả
- Viết một báo cáo ngắn gọn bằng tiếng Việt liệt kê các file test đã được sửa, lý do fail ban đầu là gì và cách bạn đã fix nó.

---
*Người dùng: Lần sau chỉ cần đính kèm file này (ví dụ: gõ `@TEST_AUTOMATION_PROMPT.md`) và bảo AI: "Hãy chạy quy trình test theo file này"*
