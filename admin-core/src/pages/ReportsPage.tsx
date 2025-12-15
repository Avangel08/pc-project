import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { CalendarIcon, Download, BarChart2, LineChart, PieChart, Users, Clock, MessageSquare, Star } from 'lucide-react';

// Mock data
const mockTicketStats = {
  total: 1250,
  open: 45,
  pending: 28,
  resolved: 1150,
  closed: 27,
  avgResponseTime: '15 phút',
  avgResolutionTime: '2 giờ 30 phút',
  satisfactionRate: 4.5
};

const mockAgentStats = [
  {
    id: '1',
    name: 'Trần Thị B',
    ticketsHandled: 450,
    avgResponseTime: '12 phút',
    avgResolutionTime: '2 giờ',
    satisfactionRate: 4.7,
    status: 'online'
  },
  {
    id: '2',
    name: 'Phạm Văn D',
    ticketsHandled: 380,
    avgResponseTime: '18 phút',
    avgResolutionTime: '2 giờ 45 phút',
    satisfactionRate: 4.3,
    status: 'offline'
  },
  {
    id: '3',
    name: 'Nguyễn Văn G',
    ticketsHandled: 420,
    avgResponseTime: '15 phút',
    avgResolutionTime: '2 giờ 15 phút',
    satisfactionRate: 4.6,
    status: 'online'
  }
];

const mockCategoryStats = [
  { category: 'Kỹ thuật', count: 450, percentage: 36 },
  { category: 'Đơn hàng', count: 300, percentage: 24 },
  { category: 'Thanh toán', count: 250, percentage: 20 },
  { category: 'Khác', count: 250, percentage: 20 }
];

const mockTrendData = [
  { date: '2024-05-01', tickets: 45, resolved: 40 },
  { date: '2024-05-02', tickets: 52, resolved: 48 },
  { date: '2024-05-03', tickets: 48, resolved: 45 },
  { date: '2024-05-04', tickets: 55, resolved: 50 },
  { date: '2024-05-05', tickets: 50, resolved: 47 }
];

export const ReportsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: new Date(),
    to: new Date()
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gaming-cyan">Báo cáo Thống kê</h1>
        <div className="flex gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="bg-gaming-darker border-gaming-border text-white">
                <CalendarIcon className="w-4 h-4 mr-2" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, 'dd/MM/yyyy', { locale: vi })} -{' '}
                      {format(dateRange.to, 'dd/MM/yyyy', { locale: vi })}
                    </>
                  ) : (
                    format(dateRange.from, 'dd/MM/yyyy', { locale: vi })
                  )
                ) : (
                  'Chọn khoảng thời gian'
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-gaming-darker border-gaming-border">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={dateRange}
                onSelect={(range) => {
                  if (range?.from && range?.to) {
                    setDateRange({ from: range.from, to: range.to });
                  } else if (range?.from) {
                    setDateRange({ from: range.from, to: range.from });
                  }
                }}
                numberOfMonths={2}
                className="bg-gaming-darker text-white"
              />
            </PopoverContent>
          </Popover>
          <Button className="bg-gaming-cyan text-black hover:bg-gaming-cyan/80">
            <Download className="w-4 h-4 mr-2" />
            Xuất báo cáo
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-gaming-darker">
          <TabsTrigger value="overview" className="data-[state=active]:bg-gaming-cyan data-[state=active]:text-black">
            Tổng quan
          </TabsTrigger>
          <TabsTrigger value="agents" className="data-[state=active]:bg-gaming-cyan data-[state=active]:text-black">
            Agent
          </TabsTrigger>
          <TabsTrigger value="categories" className="data-[state=active]:bg-gaming-cyan data-[state=active]:text-black">
            Danh mục
          </TabsTrigger>
          <TabsTrigger value="trends" className="data-[state=active]:bg-gaming-cyan data-[state=active]:text-black">
            Xu hướng
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <Card className="bg-gaming-darker border-gaming-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Tổng số ticket</CardTitle>
                <MessageSquare className="w-4 h-4 text-gaming-cyan" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{mockTicketStats.total}</div>
                <div className="flex gap-2 mt-2">
                  <Badge className="bg-gaming-cyan text-black">{mockTicketStats.open} mở</Badge>
                  <Badge className="bg-gaming-gold text-black">{mockTicketStats.pending} chờ</Badge>
                  <Badge className="bg-gaming-green text-black">{mockTicketStats.resolved} đã giải quyết</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gaming-darker border-gaming-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Thời gian phản hồi trung bình</CardTitle>
                <Clock className="w-4 h-4 text-gaming-cyan" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{mockTicketStats.avgResponseTime}</div>
                <p className="text-xs text-gray-400 mt-2">Từ khi ticket được tạo đến khi agent phản hồi đầu tiên</p>
              </CardContent>
            </Card>

            <Card className="bg-gaming-darker border-gaming-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Thời gian giải quyết trung bình</CardTitle>
                <Clock className="w-4 h-4 text-gaming-cyan" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{mockTicketStats.avgResolutionTime}</div>
                <p className="text-xs text-gray-400 mt-2">Từ khi ticket được tạo đến khi được giải quyết</p>
              </CardContent>
            </Card>

            <Card className="bg-gaming-darker border-gaming-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Đánh giá hài lòng</CardTitle>
                <Star className="w-4 h-4 text-gaming-cyan" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{mockTicketStats.satisfactionRate}/5</div>
                <div className="flex gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= mockTicketStats.satisfactionRate
                          ? 'text-gaming-gold fill-gaming-gold'
                          : 'text-gray-400'
                      }`}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-gaming-darker border-gaming-border">
              <CardHeader>
                <CardTitle className="text-gaming-cyan">Phân bố theo danh mục</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockCategoryStats.map((stat) => (
                    <div key={stat.category} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-white">{stat.category}</span>
                        <span className="text-gray-400">{stat.count} tickets ({stat.percentage}%)</span>
                      </div>
                      <div className="h-2 bg-gaming-darker rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gaming-cyan"
                          style={{ width: `${stat.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gaming-darker border-gaming-border">
              <CardHeader>
                <CardTitle className="text-gaming-cyan">Xu hướng ticket</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-end gap-2">
                  {mockTrendData.map((data) => (
                    <div key={data.date} className="flex-1 flex flex-col items-center gap-2">
                      <div className="flex-1 w-full flex items-end gap-1">
                        <div
                          className="w-full bg-gaming-cyan rounded-t"
                          style={{ height: `${(data.tickets / 60) * 100}%` }}
                        />
                        <div
                          className="w-full bg-gaming-green rounded-t"
                          style={{ height: `${(data.resolved / 60) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400">
                        {format(new Date(data.date), 'dd/MM', { locale: vi })}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gaming-cyan rounded" />
                    <span className="text-sm text-gray-400">Tổng ticket</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gaming-green rounded" />
                    <span className="text-sm text-gray-400">Đã giải quyết</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="agents" className="space-y-4">
          <Card className="bg-gaming-darker border-gaming-border">
            <CardHeader>
              <CardTitle className="text-gaming-cyan">Hiệu suất Agent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAgentStats.map((agent) => (
                  <div key={agent.id} className="p-4 bg-gaming-dark rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-white">{agent.name}</h3>
                          <span
                            className={`w-2 h-2 rounded-full ${
                              agent.status === 'online' ? 'bg-gaming-green' : 'bg-gray-500'
                            }`}
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-4">
                          <div>
                            <p className="text-sm text-gray-400">Tickets đã xử lý</p>
                            <p className="text-lg font-semibold text-white">{agent.ticketsHandled}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">Thời gian phản hồi TB</p>
                            <p className="text-lg font-semibold text-white">{agent.avgResponseTime}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">Thời gian giải quyết TB</p>
                            <p className="text-lg font-semibold text-white">{agent.avgResolutionTime}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <span className="text-lg font-semibold text-white">{agent.satisfactionRate}</span>
                          <Star className="w-4 h-4 text-gaming-gold fill-gaming-gold" />
                        </div>
                        <p className="text-sm text-gray-400">Đánh giá hài lòng</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card className="bg-gaming-darker border-gaming-border">
            <CardHeader>
              <CardTitle className="text-gaming-cyan">Thống kê theo danh mục</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockCategoryStats.map((stat) => (
                  <div key={stat.category} className="p-4 bg-gaming-dark rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{stat.category}</h3>
                        <p className="text-sm text-gray-400 mt-1">{stat.count} tickets</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gaming-cyan">{stat.percentage}%</div>
                        <div className="h-2 w-24 bg-gaming-darker rounded-full overflow-hidden mt-2">
                          <div
                            className="h-full bg-gaming-cyan"
                            style={{ width: `${stat.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card className="bg-gaming-darker border-gaming-border">
            <CardHeader>
              <CardTitle className="text-gaming-cyan">Xu hướng ticket theo thời gian</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-end gap-2">
                {mockTrendData.map((data) => (
                  <div key={data.date} className="flex-1 flex flex-col items-center gap-2">
                    <div className="flex-1 w-full flex items-end gap-1">
                      <div
                        className="w-full bg-gaming-cyan rounded-t"
                        style={{ height: `${(data.tickets / 60) * 100}%` }}
                      />
                      <div
                        className="w-full bg-gaming-green rounded-t"
                        style={{ height: `${(data.resolved / 60) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400">
                      {format(new Date(data.date), 'dd/MM', { locale: vi })}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gaming-cyan rounded" />
                  <span className="text-sm text-gray-400">Tổng ticket</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gaming-green rounded" />
                  <span className="text-sm text-gray-400">Đã giải quyết</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 