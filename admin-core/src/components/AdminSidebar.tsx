import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  BarChart3,
  Image,
  MessageSquare,
  UserCheck,
  Percent,
  Bell,
  Warehouse
} from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';

const menuItems = [
  {
    title: "Tổng quan",
    icon: BarChart3,
    url: "/",
    group: "main"
  },
  {
    title: "Quản lý sản phẩm",
    icon: Package,
    url: "/admin/products",
    group: "product"
  },
  {
    title: "Quản lý đơn hàng",
    icon: ShoppingCart,
    url: "/admin/orders",
    group: "product"
  },
  {
    title: "Quản lý kho hàng",
    icon: Warehouse,
    url: "/admin/inventory",
    group: "product"
  },
  {
    title: "Quản lý khách hàng",
    icon: Users,
    url: "/admin/customers",
    group: "customer"
  },
  {
    title: "Khuyến mãi & Mã giảm giá",
    icon: Percent,
    url: "/admin/promotions",
    group: "marketing"
  },
  {
    title: "Quản lý nội dung",
    icon: Image,
    url: "/admin/content",
    group: "content"
  },
  {
    title: "Đánh giá & Bình luận",
    icon: MessageSquare,
    url: "/admin/reviews",
    group: "content"
  },
  {
    title: "Cài đặt hệ thống",
    icon: Settings,
    url: "/admin/settings",
    group: "system"
  }
];

const groupLabels = {
  main: "Dashboard",
  product: "Sản phẩm & Đơn hàng & Kho hàng",
  customer: "Khách hàng",
  marketing: "Marketing",
  content: "Nội dung",
  system: "Hệ thống"
};

export const AdminSidebar = () => {
  const location = useLocation();

  const groupedItems = menuItems.reduce((acc, item) => {
    if (!acc[item.group]) {
      acc[item.group] = [];
    }
    acc[item.group].push(item);
    return acc;
  }, {} as Record<string, typeof menuItems>);

  return (
    <Sidebar className="bg-gaming-darker border-r border-gaming-cyan/20">
      <SidebarHeader className="p-6 border-b border-gaming-cyan/20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-gaming-cyan to-gaming-purple rounded-lg flex items-center justify-center">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-orbitron font-bold text-xl text-gradient">
              ARENA
            </h1>
            <p className="text-sm text-muted-foreground">Admin Panel</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="py-4 scrollbar-cyan">
        <div
          className="scrollbar-thin scrollbar-thumb-[#00fff7] scrollbar-track-[#10151a] ..."
        >
        {Object.entries(groupedItems).map(([group, items]) => (
          <SidebarGroup key={group}>
            <SidebarGroupLabel className="text-gaming-cyan font-medium text-xs uppercase tracking-wider mb-2">
              {groupLabels[group as keyof typeof groupLabels]}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => {
                  const isActive = location.pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`group transition-all duration-200 ${
                          isActive 
                            ? 'bg-gaming-cyan/20 text-gaming-cyan border-l-2 border-gaming-cyan' 
                            : 'text-gray-300 hover:text-gaming-cyan hover:bg-gaming-cyan/10'
                        }`}
                      >
                        <Link to={item.url}>
                          <item.icon className={`w-5 h-5 ${isActive ? 'text-gaming-cyan' : 'group-hover:text-gaming-cyan'}`} />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
        </div>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-gaming-cyan/20">
        <div className="text-center text-xs text-muted-foreground">
          <p>© 2025 ARENA Admin</p>
          <p className="text-gaming-cyan">Version 2.5.0</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};
