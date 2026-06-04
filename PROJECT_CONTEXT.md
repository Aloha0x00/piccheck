# Project Context: PIC Check AI

Tài liệu này kế thừa bối cảnh từ chat "Xây dựng website kiểm tra AI" cho project hiện tại.

## Dinh vi san pham

Muc tieu la xay dung website cho phep nguoi dung upload anh hoac video de uoc luong kha nang media do AI tao ra. San pham khong nen duoc dinh vi la cong cu "xac minh chac chan 100%". Dinh vi dung hon la:

- PIC Check AI
- AI-generated likelihood checker
- Cong cu cham diem rui ro/tham khao

Ket qua nen luon trinh bay theo dang xac suat/rui ro, vi du "Khả năng do AI tạo: 78%" kem do tin cay va ly do phat hien. Khong nen noi "anh nay chac chan do AI tao".

## Ly do can canh bao

Detector AI media co gioi han ky thuat ro rang:

- Anh/video AI ngay cang giong that.
- Anh that co the bi nen, crop, sua mau, upscale hoac mat metadata.
- Anh AI co the bi chup lai man hinh, nen lai, chinh sua hoac xoa dau vet.
- Video can phan tich theo frame va chuyen dong, nen phuc tap hon anh tinh.

Neu dung trong bao chi, phap ly, tuyen sinh, bao hiem hoac cac ngu canh co rui ro cao, can disclaimer ro rang, audit, benchmark dataset va quy trinh con nguoi xem lai.

## MVP hien tai

Project hien tai la MVP web tinh, chay truc tiep trong trinh duyet:

- File chinh: `index.html`, `styles.css`, `app.js`, `README.md`.
- Cho phep upload/keo tha anh JPG, PNG, WEBP, GIF.
- Preview anh da chon.
- Doc pixel bang canvas client-side.
- Cham diem rui ro bang heuristic.
- Hien thi phan tram, do tin cay tham khao, kich thuoc, dung luong va cac tin hieu phat hien.

Heuristic hien tai dung cac tin hieu:

- Do min cua chuyen mau.
- Mat do canh sac.
- Entropy/phong phu sang toi.
- Do bao hoa mau.
- Kich thuoc vuong do phan giai cao.
- Dinh dang file PNG/WEBP so voi JPEG.
- Thoi gian file duoc tao/chinh sua gan day.

Phan tram hien tai la diem rui ro tham khao, khong phai "accuracy" da duoc do tren dataset.

## Huong kien truc production

Khi nang cap thanh san pham that, nen chuyen sang pipeline co backend:

1. Frontend upload va hien thi ket qua.
2. Backend nhan file, gioi han dung luong, validate MIME/file signature va scan an toan.
3. Storage tam thoi, uu tien xoa file sau khi xu ly neu khong can luu.
4. Worker xu ly anh/video bat dong bo.
5. Model service chay detector ML/forensic.
6. Database luu ket qua, metadata, audit log va feedback nguoi dung.

Stack de xuat tu chat goc:

- Frontend: Next.js hoac React.
- Backend: FastAPI hoac Node.js.
- Image processing: Python, OpenCV, Pillow.
- Video processing: FFmpeg de tach frame.
- Storage: S3-compatible storage.
- Database: PostgreSQL.
- Queue: Redis + Celery/RQ/BullMQ cho tac vu nang, dac biet video.

## Roadmap de xuat

1. Hoan thien MVP anh tinh voi UX upload, ket qua va disclaimer.
2. Them backend upload an toan va gioi han dung luong.
3. Them phan tich metadata/EXIF.
4. Tich hop model/API detector anh AI da benchmark.
5. Tao bo dataset danh gia rieng theo nhom anh va tinh precision/recall.
6. Them feedback loop de nguoi dung bao ket qua dung/sai.
7. Mo rong sang video bang cach tach 10-30 frame moi video, cham diem tung frame va tong hop rui ro.
8. Them bao cao giai thich: tin hieu metadata, tin hieu pixel, tin hieu model, muc do chac chan.

## Nguyen tac UI/ket qua

- Luon dung ngon ngu "kha nang", "rui ro", "tham khao", "khong du bang chung".
- Hien thi ly do ngan gon kem diem so.
- Tach "AI likelihood" voi "confidence" de tranh hieu nham.
- Co trang thai loi khi file khong hop le hoac trinh duyet khong doc duoc anh.
- Khong luu file cua nguoi dung neu chua co chinh sach rieng tu ro rang.

