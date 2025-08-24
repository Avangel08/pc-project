import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Package, ShoppingCart, Users, BarChart3 } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gaming-dark gaming-gradient flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        {/* Logo và Title */}
        <div className="space-y-4">
          <div className="w-20 h-20 bg-gradient-to-br from-gaming-cyan to-gaming-purple rounded-2xl flex items-center justify-center mx-auto glow-effect">
            <Package className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-7xl font-orbitron font-bold text-gradient">
            ARENA-PC
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Hệ thống quản trị website bán phụ kiện máy tính, thiết bị gaming và mô hình anime chuyên nghiệp
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12">
          <div className="card-hover bg-gaming-darker/50 p-6 rounded-xl border border-gaming-cyan/20">
            <div className="w-12 h-12 bg-gaming-cyan/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Package className="w-6 h-6 text-gaming-cyan" />
            </div>
            <h3 className="text-xl font-orbitron font-bold text-white mb-2">Quản lý Sản phẩm</h3>
            <p className="text-gray-400">Quản lý toàn bộ sản phẩm gaming, mô hình anime và phụ kiện máy tính</p>
          </div>

          <div className="card-hover bg-gaming-darker/50 p-6 rounded-xl border border-gaming-purple/20">
            <div className="w-12 h-12 bg-gaming-purple/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-6 h-6 text-gaming-purple" />
            </div>
            <h3 className="text-xl font-orbitron font-bold text-white mb-2">Quản lý Đơn hàng</h3>
            <p className="text-gray-400">Theo dõi và xử lý đơn hàng từ khách hàng một cách hiệu quả</p>
          </div>

          <div className="card-hover bg-gaming-darker/50 p-6 rounded-xl border border-gaming-green/20">
            <div className="w-12 h-12 bg-gaming-green/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-6 h-6 text-gaming-green" />
            </div>
            <h3 className="text-xl font-orbitron font-bold text-white mb-2">Thống kê & Báo cáo</h3>
            <p className="text-gray-400">Phân tích doanh thu, xu hướng bán hàng và hiệu quả kinh doanh</p>
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-4">
          <Link to="/admin">
            <Button className="bg-gradient-to-r from-gaming-cyan to-gaming-purple hover:from-gaming-cyan/80 hover:to-gaming-purple/80 text-white px-8 py-3 text-lg font-orbitron glow-effect">
              Vào Bảng Điều Khiển Admin
            </Button>
          </Link>
          <p className="text-sm text-gray-400">
            Đăng nhập với quyền quản trị để truy cập đầy đủ tính năng
          </p>
        </div>

        {/* Footer */}
        <div className="pt-8 border-t border-gaming-cyan/20">
          <p className="text-gray-400 text-sm">
            © 2024 ARENA-PC Admin Panel. Được phát triển bởi team chuyên nghiệp.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
