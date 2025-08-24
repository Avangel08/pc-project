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
  MessageSquare,
  Percent,
  Bell,
  User
} from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';

const menuItems = [
  {
    title: "Tổng quan",
    icon: BarChart3,
    url: "/sales",
    group: "main"
  },
  {
    title: "Quản lý đơn hàng",
    icon: ShoppingCart,
    url: "/sales/orders",
    group: "sales"
  },
  {
    title: "Quản lý khách hàng",
    icon: Users,
    url: "/sales/customers",
    group: "sales"
  },
  {
    title: "Quản lý sản phẩm",
    icon: Package,
    url: "/sales/products",
    group: "sales"
  },
  {
    title: "Hỗ trợ khách hàng",
    icon: MessageSquare,
    url: "/sales/support",
    group: "support"
  },
  {
    title: "Khuyến mãi",
    icon: Percent,
    url: "/sales/promotions",
    group: "sales"
  },
  {
    title: "Thông báo",
    icon: Bell,
    url: "/sales/notifications",
    group: "system"
  },
  {
    title: "Tài khoản",
    icon: User,
    url: "/sales/profile",
    group: "system"
  }
];

const groupLabels = {
  main: "Dashboard",
  sales: "Bán hàng",
  support: "Hỗ trợ",
  system: "Hệ thống"
};

export const SalesSidebar = () => {
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
            <ShoppingCart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-orbitron font-bold text-xl text-gradient">
              ARENA-PC
            </h1>
            <p className="text-sm text-muted-foreground">Sales Panel</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="py-4">
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
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-gaming-cyan/20">
        <div className="text-center text-xs text-muted-foreground">
          <p>© 2024 ARENA-PC Sales</p>
          <p className="text-gaming-cyan">Version 1.0.0</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}; 