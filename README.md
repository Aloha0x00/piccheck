# PIC Check AI

Web app cho phép người dùng upload ảnh và nhận điểm rủi ro ảnh có thể do AI tạo ra.

Xem thêm [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) để biết bối cảnh kế thừa từ chat "Xây dựng website kiểm tra AI", định vị sản phẩm, roadmap và hướng kiến trúc production.

## Cách chạy

Chạy local dev server để static app gọi được route `/api/analyze`:

```bash
npm run dev
```

Sau đó mở `http://localhost:3000`. Khi deploy production, domain dự kiến là `https://piccheck.vercel.app`.

Nếu mở trực tiếp `index.html` bằng `file://`, app vẫn chạy nhưng không gọi được API detector và sẽ fallback sang heuristic local.

## Cấu hình API detector

Project dùng serverless function tại `api/analyze.js` để gọi AI detector providers. Khi chạy local, `dev-server.js` sẽ phục vụ static files và route `/api/analyze`. Không đặt API key trong `app.js` vì key sẽ lộ ở browser.

Biến môi trường cho Sightengine:

```bash
SIGHTENGINE_API_USER=your_api_user
SIGHTENGINE_API_SECRET=your_api_secret
```

Tuỳ chọn:

```bash
SIGHTENGINE_MODELS=genai,type
```

`recapture` có thể giúp phát hiện ảnh chụp lại màn hình/bản in, nhưng Sightengine có thể yêu cầu paid plan cho model này. Nếu tài khoản hỗ trợ, có thể đổi thành `genai,type,recapture`.

Biến môi trường cho fallback provider:

```bash
AI_DETECTOR_PROVIDER_ORDER=sightengine,hive,aiornot,realityai
HIVE_API_KEY=your_hive_project_api_key
AIORNOT_API_KEY=your_ai_or_not_api_key
REALITYAI_API_KEY=your_reality_ai_api_key
```

Nếu không có key của provider nào, provider đó sẽ tự bị bỏ qua. Khi provider trước gặp quota/rate limit và provider sau đã được cấu hình, serverless function sẽ tự chuyển sang provider tiếp theo. Thứ tự mặc định hiện là Sightengine -> Hive -> AI or Not -> Reality AI.

Nếu toàn bộ provider uy tín đều bị quota/rate limit, app sẽ dùng heuristic local trong browser và hiển thị cảnh báo rằng kết quả built-in kém chính xác hơn, kèm email/Telegram admin để user báo lỗi.

Khi mở trực tiếp `index.html` bằng `file://`, app không gọi được `/api/analyze` nên sẽ tự fallback về heuristic local.

## Tính năng

- Upload hoặc kéo thả ảnh JPG, PNG, WEBP, GIF.
- Preview ảnh lớn theo từng ảnh đã chọn.
- Hỗ trợ English/Vietnamese, mặc định English.
- Guest scan 1 ảnh/lần, tối đa 5 ảnh tổng cộng trên trình duyệt hiện tại.
- Member có 2 lợi ích chính: scan 3 ảnh cùng lúc và tiếp tục scan sau giới hạn 5 ảnh của guest.
- Đánh dấu trực tiếp trên ảnh nếu kết quả là `AI Generated xx%`.
- Đăng nhập Firebase bằng Google.
- Lưu email Google member vào Firestore collection `marketing_members`.
- Lưu lịch sử scan của member vào `users/{uid}/scans`, gồm thumbnail nhỏ để xem lại trong profile.
- Khi chạy qua Vercel/serverless: gọi Sightengine `genai,type` để lấy điểm AI và loại media.
- Fallback provider theo thứ tự cấu hình nếu provider trước bị quota/rate limit.
- Cache kết quả theo SHA-256 của ảnh ở browser và serverless memory để tránh tốn quota khi kiểm tra lại cùng ảnh.
- Khi mở trực tiếp file tĩnh: phân tích pixel bằng canvas ngay trong trình duyệt.
- Trả về:
  - phần trăm khả năng ảnh do AI tạo,
  - độ tin cậy tham khảo,
  - kích thước và dung lượng ảnh,
  - các tín hiệu phát hiện.

## Cấu hình Firebase

Tạo Firebase project mới, sau đó cập nhật `firebase-config.js` bằng Web app config từ Firebase Console:

```js
export const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

Trong Firebase Console cần bật:

- Authentication > Sign-in method > Google.
- Firestore Database.

Google sign-in cần chạy qua HTTP local/deploy URL, không chạy bằng `file://`. Trong Firebase Console, kiểm tra thêm `Authentication > Settings > Authorized domains` và đảm bảo có domain bạn đang mở, ví dụ `localhost` khi chạy local hoặc `piccheck.vercel.app` khi deploy.

Firebase Game Center chỉ phù hợp cho Apple app/native flow, không dùng được cho web app hiện tại nên không hiển thị trong UI.

Collections app đang dùng:

- `marketing_members/{uid}`: lưu email Google, display name, avatar, provider và thời điểm user đăng nhập.
- `users/{uid}/scans/{scanId}`: lưu lịch sử scan của user.

Firestore rules gợi ý cho giai đoạn thử nghiệm:

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /marketing_members/{userId} {
      allow create, update: if request.auth != null && request.auth.uid == userId;
      allow read: if false;
    }

    match /users/{userId}/scans/{scanId} {
      allow read, create: if request.auth != null && request.auth.uid == userId;
      allow update, delete: if false;
    }
  }
}
```

## Giới hạn

Phần trăm hiển thị là điểm rủi ro tham khảo, không phải độ chính xác đã được kiểm chứng trên dataset chuẩn.

Khi dùng API bên thứ ba, kết quả vẫn là xác suất/rủi ro, không phải kết luận tuyệt đối. Screenshot, ảnh nén mạnh, ảnh chụp lại màn hình, ảnh minh hoạ hoặc ảnh đã qua chỉnh sửa có thể làm confidence thấp hơn.

Muốn đưa vào sản phẩm thật nên bổ sung:

- backend upload an toàn,
- scan file và giới hạn dung lượng,
- model AI image detector đã benchmark,
- phân tích metadata/EXIF đầy đủ,
- dataset đánh giá theo từng loại ảnh,
- báo cáo kết quả dạng xác suất kèm disclaimer.
