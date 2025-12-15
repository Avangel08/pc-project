# Cloudinary Setup Guide

## Cấu hình Cloudinary

Dự án đã được tích hợp Cloudinary để lưu trữ ảnh sản phẩm.

### Bước 1: Tạo file .env

Tạo file `.env` trong thư mục `admin-core/` với nội dung:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/pc-shop

# Server Port
PORT=3001

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=dt6qjhboo
CLOUDINARY_API_KEY=524297257895767
CLOUDINARY_API_SECRET=D7wHDHwURcH0Wi2ZhzG1H05z1eE
```

### Bước 2: Cài đặt dependencies

```bash
cd admin-core
npm install
```

Các package đã được thêm:
- `cloudinary` - SDK để upload ảnh lên Cloudinary
- `multer` - Middleware để xử lý file upload
- `@types/multer` - TypeScript types cho multer

### Bước 3: Khởi động server

```bash
npm run server
```

Server sẽ tự động load Cloudinary config từ file `.env`.

## Sử dụng

### Trong Admin Panel

1. Mở form thêm/sửa sản phẩm
2. Trong phần "Hình ảnh sản phẩm":
   - **Upload từ máy tính**: Click "Upload ảnh từ máy tính" và chọn file
   - **Nhập URL**: Vẫn có thể nhập URL trực tiếp (tương thích ngược)
3. Có thể upload nhiều ảnh cùng lúc (tối đa 8 ảnh/sản phẩm)

### API Endpoints

#### Upload single image
```
POST /api/upload/image
Content-Type: multipart/form-data
Body: { image: File }
Response: { success: true, url: string, public_id: string }
```

#### Upload multiple images
```
POST /api/upload/images
Content-Type: multipart/form-data
Body: { images: File[] }
Response: { success: true, urls: string[], public_ids: string[] }
```

#### Delete image
```
DELETE /api/upload/image/:publicId
Response: { success: true, message: string }
```

## Lưu ý

- Ảnh được lưu trong folder `pc-project/products` trên Cloudinary
- Tự động resize và optimize ảnh (max 1200x1200px)
- Format tự động (WebP khi có thể)
- Giới hạn file size: 10MB
- Chỉ chấp nhận file ảnh (image/*)

## Troubleshooting

### Lỗi "Cloudinary not configured"
- Kiểm tra file `.env` đã được tạo chưa
- Kiểm tra các biến môi trường có đúng không
- Restart server sau khi thay đổi `.env`

### Lỗi upload
- Kiểm tra kết nối internet
- Kiểm tra Cloudinary credentials
- Kiểm tra file size (max 10MB)
- Kiểm tra file format (chỉ ảnh)

