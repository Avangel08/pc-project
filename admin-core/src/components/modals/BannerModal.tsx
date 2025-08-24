import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Calendar, Link, Image as ImageIcon } from 'lucide-react';
import { Banner, CreateBannerRequest, UpdateBannerRequest } from '@/models/Banner';

interface BannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  banner?: Banner;
  onSubmit: (data: CreateBannerRequest | UpdateBannerRequest) => void;
  isLoading?: boolean;
  mode?: 'create' | 'edit' | 'view';
}

export const BannerModal: React.FC<BannerModalProps> = ({
  isOpen,
  onClose,
  banner,
  onSubmit,
  isLoading = false,
  mode = 'create'
}) => {
  const [formData, setFormData] = useState<CreateBannerRequest>({
    title: '',
    description: '',
    images: [],
    linkUrl: '',
    position: 'hero',
    status: 'draft',
    startDate: '',
    endDate: '',
    priority: 1,
    autoPlay: true,
    autoPlaySpeed: 5
  });

  const [imageInputs, setImageInputs] = useState<Array<{url: string, alt: string, title: string}>>([
    { url: '', alt: '', title: '' }
  ]);

  useEffect(() => {
    if (banner) {
      setFormData({
        title: banner.title,
        description: banner.description || '',
        images: banner.images || [],
        linkUrl: banner.linkUrl || '',
        position: banner.position,
        status: banner.status,
        startDate: banner.startDate,
        endDate: banner.endDate,
        priority: banner.priority,
        autoPlay: banner.autoPlay !== undefined ? banner.autoPlay : true,
        autoPlaySpeed: banner.autoPlaySpeed || 5
      });
      setImageInputs(banner.images?.map(img => ({
        url: img.url,
        alt: img.alt || '',
        title: img.title || ''
      })) || [{ url: '', alt: '', title: '' }]);
    } else {
      setFormData({
        title: '',
        description: '',
        images: [],
        linkUrl: '',
        position: 'hero',
        status: 'draft',
        startDate: '',
        endDate: '',
        priority: 1,
        autoPlay: true,
        autoPlaySpeed: 5
      });
      setImageInputs([{ url: '', alt: '', title: '' }]);
    }
  }, [banner, isOpen]);

  const handleInputChange = (field: keyof CreateBannerRequest, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageInputChange = (index: number, field: 'url' | 'alt' | 'title', value: string) => {
    setImageInputs(prev => {
      const newInputs = [...prev];
      newInputs[index] = { ...newInputs[index], [field]: value };
      return newInputs;
    });
  };

  const addImageInput = () => {
    setImageInputs(prev => [...prev, { url: '', alt: '', title: '' }]);
  };

  const removeImageInput = (index: number) => {
    if (imageInputs.length > 1) {
      setImageInputs(prev => prev.filter((_, i) => i !== index));
    }
  };



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate images
    const validImages = imageInputs
      .filter(img => img.url.trim() !== '')
      .map(img => ({
        url: img.url.trim(),
        alt: img.alt.trim(),
        title: img.title.trim()
      }));

    if (validImages.length === 0) {
      alert('Vui lòng nhập ít nhất một URL ảnh');
      return;
    }

    const submitData = {
      ...formData,
      images: validImages
    };

    if (banner) {
      onSubmit({
        _id: banner._id!,
        ...submitData
      } as UpdateBannerRequest);
    } else {
      onSubmit(submitData);
    }
  };

  const getPositionLabel = (position: string) => {
    switch (position) {
      case 'hero': return 'Trang chủ - Hero';
      case 'promotion': return 'Trang chủ - Khuyến mãi';
      case 'sidebar': return 'Sidebar';
      case 'category': return 'Danh mục';
      default: return position;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-gaming-green text-black">Đang hoạt động</Badge>;
      case 'draft':
        return <Badge className="bg-gaming-gold text-black">Bản nháp</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Không hoạt động</Badge>;
      default:
        return <Badge variant="secondary">Không xác định</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gaming-dark border-gaming-cyan/20">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">
            {mode === 'view' ? 'Chi tiết Banner' : banner ? 'Chỉnh sửa Banner' : 'Thêm Banner mới'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Thông tin cơ bản */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-white">Tiêu đề Banner *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="bg-gaming-darker border-gaming-cyan/30 text-white"
                  placeholder="Nhập tiêu đề banner..."
                  required
                />
              </div>



              <div>
                <Label htmlFor="linkUrl" className="text-white">Link liên kết</Label>
                <div className="relative">
                  <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="linkUrl"
                    value={formData.linkUrl}
                    onChange={(e) => handleInputChange('linkUrl', e.target.value)}
                    className="pl-10 bg-gaming-darker border-gaming-cyan/30 text-white"
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="position" className="text-white">Vị trí *</Label>
                  <Select value={formData.position} onValueChange={(value) => handleInputChange('position', value)}>
                    <SelectTrigger className="bg-gaming-darker border-gaming-cyan/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gaming-darker border-gaming-cyan/30">
                      <SelectItem value="hero">Trang chủ - Hero</SelectItem>
                      <SelectItem value="promotion">Trang chủ - Khuyến mãi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status" className="text-white">Trạng thái *</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger className="bg-gaming-darker border-gaming-cyan/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gaming-darker border-gaming-cyan/30">
                      <SelectItem value="draft">Bản nháp</SelectItem>
                      <SelectItem value="active">Đang hoạt động</SelectItem>
                      <SelectItem value="inactive">Không hoạt động</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate" className="text-white">Ngày bắt đầu *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white w-4 h-4" />
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      className="pl-10 bg-gaming-darker border-gaming-cyan/30 text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="endDate" className="text-white">Ngày kết thúc *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white w-4 h-4" />
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      className="pl-10 bg-gaming-darker border-gaming-cyan/30 text-white"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="priority" className="text-white">Độ ưu tiên</Label>
                <Input
                  id="priority"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', parseInt(e.target.value))}
                  className="bg-gaming-darker border-gaming-cyan/30 text-white"
                  placeholder="1-10"
                />
              </div>


            </div>

            {/* Upload ảnh */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-white">Hình ảnh Banner *</Label>
                  <Button
                    type="button"
                    onClick={addImageInput}
                    variant="outline"
                    size="sm"
                    className="border-gaming-cyan/30 text-gaming-cyan hover:bg-gaming-cyan/20"
                  >
                    + Thêm ảnh
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {imageInputs.map((image, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">Ảnh {index + 1}</span>
                        {imageInputs.length > 1 && (
                          <Button
                            type="button"
                            onClick={() => removeImageInput(index)}
                            variant="ghost"
                            size="sm"
                            className="text-gaming-red hover:bg-gaming-red/20"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="relative">
                          <ImageIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            value={image.url}
                            onChange={(e) => handleImageInputChange(index, 'url', e.target.value)}
                            className="pl-10 bg-gaming-darker border-gaming-cyan/30 text-white"
                            placeholder="https://example.com/image.jpg"
                            required
                          />
                        </div>
                        

                        
                        {/* Image Preview */}
                        {image.url && (
                          <div className="border border-gaming-cyan/30 rounded-lg overflow-hidden">
                            <img
                              src={image.url}
                              alt={image.alt || `Preview ${index + 1}`}
                              className="w-full h-32 object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling!.style.display = 'flex';
                              }}
                            />
                            <div className="hidden w-full h-32 bg-gaming-darker flex items-center justify-center text-gray-400">
                              <div className="text-center">
                                <ImageIcon className="w-6 h-6 mx-auto mb-1" />
                                <p className="text-xs">Không thể tải ảnh</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Thông tin hiện tại */}
              {banner && (
                <div className="space-y-3">
                  <h4 className="text-white font-semibold">Thông tin hiện tại</h4>
                  <div className="bg-gaming-darker p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Vị trí:</span>
                      <span className="text-white">{getPositionLabel(banner.position)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Trạng thái:</span>
                      {getStatusBadge(banner.status)}
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-400">Lượt xem:</span>
                      <span className="text-white">{banner.views}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gaming-cyan/20">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-gaming-cyan/30 text-gaming-cyan hover:bg-gaming-cyan/20"
            >
              {mode === 'view' ? 'Đóng' : 'Hủy'}
            </Button>
            {mode !== 'view' && (
              <Button
                type="submit"
                disabled={isLoading || !formData.title || !formData.startDate || !formData.endDate || imageInputs.every(img => !img.url.trim())}
                className="bg-gaming-cyan hover:bg-gaming-cyan/80 text-black"
              >
                {isLoading ? 'Đang lưu...' : (banner ? 'Cập nhật' : 'Tạo banner')}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 