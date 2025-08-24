# Hướng dẫn sửa lỗi hệ thống quản lý sản phẩm

## Các lỗi đã được sửa

### 1. ✅ Logic Frontend - Đã sửa
**Vấn đề:** Frontend chỉ gọi API import khi thay đổi stock, không gọi API export khi giảm stock.

**Giải pháp:** Đã sửa logic trong `InventoryManagement.tsx`:
- Khi tăng stock: gọi API `/api/stock/import`
- Khi giảm stock: gọi API `/api/stock/export`
- Logic đã được cập nhật trong hàm `handleEditStock()`

### 2. ✅ Validation Backend - Đã sửa
**Vấn đề:** Backend validation quá nghiêm ngặt, không cho phép stock = 0.

**Giải pháp:** Đã cải thiện validation trong `server.js`:

#### API Import Stock:
- Cho phép stock >= 0 (bao gồm cả 0)
- Kiểm tra sản phẩm tồn tại trước khi cập nhật
- Thêm logging chi tiết

#### API Export Stock:
- Kiểm tra stock hiện tại có đủ để xuất không
- Trả về thông báo lỗi rõ ràng khi không đủ stock
- Thêm logging chi tiết

### 3. ✅ Logging - Đã thêm
**Vấn đề:** Thiếu logging để debug các lỗi API.

**Giải pháp:** Đã thêm logging chi tiết:
- Log request data
- Log validation errors
- Log stock changes
- Log success/failure

### 4. 🔧 Dọn dữ liệu MongoDB - Cần thực hiện
**Vấn đề:** Dữ liệu có sản phẩm trùng lặp và không nhất quán.

**Giải pháp:** Đã tạo scripts để dọn dữ liệu:

### 5. ✅ Validation tạo sản phẩm mới - Đã sửa
**Vấn đề:** Không có validation khi tạo sản phẩm mới, có thể tạo sản phẩm với dữ liệu không hợp lệ.

**Giải pháp:** Đã thêm validation đầy đủ:

#### Frontend Validation (ProductModal.tsx):
- Kiểm tra productCode: không được trống, ít nhất 2 ký tự, không chứa khoảng trắng
- Kiểm tra tên sản phẩm: không được trống, ít nhất 3 ký tự
- Kiểm tra danh mục: không được trống
- Kiểm tra giá: phải lớn hơn 0
- Kiểm tra stock: phải >= 0
- Tự động trim dữ liệu trước khi lưu

#### Backend Validation (server.js):
- Validation chi tiết tương tự frontend
- Kiểm tra productCode đã tồn tại chưa
- Xử lý lỗi MongoDB duplicate key
- Logging chi tiết cho debug

#### Model Validation (Product.ts):
- Thêm validation rules trong Mongoose schema
- Trim tự động cho các trường string
- Min/max length validation
- Custom validator cho productCode (không chứa khoảng trắng)
- Thêm indexes để tối ưu tìm kiếm

## Cách sử dụng scripts dọn dữ liệu

### Bước 1: Chạy script kiểm tra dữ liệu
```bash
npm run cleanup
```

Script này sẽ:
- Đếm tổng số sản phẩm
- Tìm sản phẩm có productCode chứa khoảng trắng
- Tìm sản phẩm trùng lặp
- Tìm sản phẩm thiếu dữ liệu bắt buộc
- Tự động sửa một số lỗi dữ liệu
- Hiển thị hướng dẫn xóa thủ công

### Bước 2: Xóa sản phẩm trùng lặp cụ thể
```bash
npm run delete-duplicates
```

Script này sẽ xóa 2 sản phẩm trùng lặp:
- Sản phẩm có productCode `"xenon6 "` (có khoảng trắng)
- Sản phẩm có productCode `"Xenon6"` (không có khoảng trắng)

### Bước 3: Test validation
```bash
npm run test-validation
```

Script này sẽ test tất cả các trường hợp validation:
- Sản phẩm hợp lệ
- ProductCode trống/có khoảng trắng/quá ngắn
- Tên sản phẩm trống/quá ngắn
- Giá âm
- Stock âm
- Mô tả quá ngắn
- Danh mục trống
- ProductCode trùng lặp

### Bước 4: Xóa thủ công (nếu cần)
Nếu có sản phẩm trùng lặp khác, sử dụng mongosh:

```javascript
// Kết nối MongoDB
mongosh

// Chuyển đến database
use pc-shop

// Xem tất cả sản phẩm
db.products.find()

// Xóa sản phẩm theo ID
db.products.deleteOne({ "_id": ObjectId("ID_CỦA_SẢN_PHẨM") })

// Xóa sản phẩm theo productCode
db.products.deleteOne({ "productCode": "MÃ_SẢN_PHẨM" })
```

## Kiểm tra sau khi sửa

### 1. Khởi động lại server
```bash
npm run server
```

### 2. Kiểm tra frontend
- Vào trang Inventory Management
- Thử tăng/giảm stock của sản phẩm
- Kiểm tra xem số lượng có cập nhật đúng không

### 3. Kiểm tra logs
- Xem console của server để đảm bảo không có lỗi
- Kiểm tra logs khi thao tác với stock

### 4. Kiểm tra dữ liệu
- Vào MongoDB Compass hoặc mongosh
- Kiểm tra số lượng sản phẩm hiển thị đúng
- Đảm bảo không có sản phẩm trùng lặp

## Lưu ý quan trọng

1. **Backup dữ liệu** trước khi chạy scripts xóa
2. **Khởi động lại server** sau khi sửa code
3. **Refresh trang** frontend sau khi sửa dữ liệu
4. **Kiểm tra logs** để đảm bảo không có lỗi

## Các file đã được sửa

- `server.js` - Cải thiện validation và logging
- `src/pages/InventoryManagement.tsx` - Logic frontend đã đúng
- `src/components/modals/ProductModal.tsx` - Thêm validation frontend
- `src/models/Product.ts` - Cải thiện Mongoose schema validation
- `cleanup-data.js` - Script dọn dữ liệu (mới)
- `delete-duplicates.js` - Script xóa trùng lặp (mới)
- `test-product-validation.js` - Script test validation (mới)
- `package.json` - Thêm scripts (mới)
- `FIXES_README.md` - Hướng dẫn này (mới) 