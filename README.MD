# 🚀 PC Project - website Thương Mại Điện Tử

Cần 3 terminal riêng biệt:
Terminal 1 - API Server (Backend)
cd ~/pc-project/admin-core
node --loader ts-node/esm server.js

Terminal 2 - Admin Panel

cd ~/pc-project/admin-core
npm run dev

Terminal 3 - Customer Site

cd ~/pc-project/project-custumer
npm run dev




## 📋 Mô Tả Dự Án(  phát triển 1/06- 23/7 cần phát triển thêm)  

Đây là một hệ thống thương mại điện tử hoàn chỉnh bao gồm 3 phần chính:

- **🏢 Admin Core**: Backend API + Admin Dashboard (React + TypeScript + Vite)
- **🛒 Customer Site**: Website bán hàng cho khách hàng (Next.js + TypeScript)
- **🗄️ MongoDB**: Cơ sở dữ liệu 



## 📦 Cài Đặt Dependencies

### **1. Clone Repository**
```bash
git clone <repository-url>
cd pc-project
```

### **2. Cài đặt Node.js và npm**


Server 1: Admin API (Backend)
Chức năng: "Bộ não" xử lý dữ liệu.
Terminal 1:

        # Di chuyển đến thư mục
    cd /home/thanh/pc-project/admin-core

    # Chạy server
    node --loader ts-node/esm server.js

Apply to popover.tsx
Run
Server 2: Admin Panel (Giao diện Quản lý)
Chức năng: Trang web cho admin.
Terminal 2 (Mở cửa sổ mới):

    # Di chuyển đến thư mục
    cd /home/thanh/pc-project/admin-core

    # Chạy server giao diện
    npm run dev


Apply to popover.tsx
Run
Server 3: Customer Site (Giao diện Khách hàng)
Chức năng: Trang web cho khách hàng.
Terminal 3 (Mở cửa sổ mới):

    # Di chuyển đến thư mục
    cd /home/thanh/pc-project/project-custumer

    # Chạy server giao diện
    npm run dev


Sau khi chạy cả 3 lệnh này trong 3 terminal riêng biệt, toàn bộ hệ thống của bạn sẽ hoạt động.

## 🚀 Chạy Dự Án

### **Cấu trúc thư mục:**
```
pc-project/
├── admin-core/          # Backend API + Admin Dashboard
├── project-custumer/    # Customer Website
└── README.MD
```

### **Chạy với 3 Terminal riêng biệt:**



Nếu gặp vấn đề:
1. Kiểm tra logs của từng service
2. Kiểm tra quyền truy cập file/thư mục
3. Kiểm tra kết nối MongoDB
4. Kiểm tra ports đang sử dụng


---
# Kiểm tra trạng thái
git status

# Add và commit
git add .
git commit -m "Mô tả thay đổi"

# Push
git push origin master

