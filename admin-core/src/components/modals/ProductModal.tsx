import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from '@/hooks/use-toast';
import { Product } from '@/types/product';
import { X, Plus, Image as ImageIcon, Upload, Loader2 } from 'lucide-react';
import { uploadImage, uploadImages } from '@/lib/api';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product;
  mode: 'create' | 'edit' | 'view';
  onSave: (product: Product) => void;
}

const categories = [
  'Chuột',
  'Bàn phím',
  'Lót chuột',
  'Tai nghe',
  'Bàn',
  'Ghế',
  'Mô hình',
  'Decor'
];

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  product,
  mode,
  onSave
}) => {
  const [formData, setFormData] = useState<Partial<Product>>({
    productCode: '',
    name: '',
    category: '',
    price: 0,
    oldPrice: 0,
    discount: 0,
    description: '',
    images: [],
    status: 'con_hang',
    stock: 0,
    colors: [],
    specs: [],
    supplier: '',
    createdAt: '',
    updatedAt: '',
  });

  const [newColor, setNewColor] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newSpecName, setNewSpecName] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');
  const [uploading, setUploading] = useState(false);

  // Bảng màu cho gaming gear
  const colorPalette = [
    { name: 'Đen', value: '#000000', bg: 'bg-black' },
    { name: 'Trắng', value: '#FFFFFF', bg: 'bg-white' },
    { name: 'Xám', value: '#808080', bg: 'bg-gray-500' },
    { name: 'Xanh dương', value: '#0000FF', bg: 'bg-blue-500' },
    { name: 'Xanh lá', value: '#00FF00', bg: 'bg-green-500' },
    { name: 'Đỏ', value: '#FF0000', bg: 'bg-red-500' },
    { name: 'Vàng', value: '#FFFF00', bg: 'bg-yellow-500' },
    { name: 'Cam', value: '#FFA500', bg: 'bg-orange-500' },
    { name: 'Tím', value: '#800080', bg: 'bg-purple-500' },
    { name: 'Hồng', value: '#FFC0CB', bg: 'bg-pink-300' },
    { name: 'Nâu', value: '#A52A2A', bg: 'bg-amber-800' },
    { name: 'Xanh cyan', value: '#00FFFF', bg: 'bg-cyan-400' },
    { name: 'Xanh navy', value: '#000080', bg: 'bg-blue-800' },
    { name: 'Xanh mint', value: '#98FF98', bg: 'bg-green-300' },
    { name: 'Đỏ đậm', value: '#8B0000', bg: 'bg-red-800' },
    { name: 'Vàng đậm', value: '#B8860B', bg: 'bg-yellow-600' },
  ];

  // Tags phổ biến cho gaming gear
  const commonTags = [
    'Mới về',
    'Bán chạy',
    'Sắp hết hàng',
    'Giảm giá',
    'Hàng độc quyền',
    'Limited Edition',
    'Đặt trước',
    'Đã ngừng kinh doanh'
    // Đã xóa các tag Giảm 1% - Giảm 30%
  ];

  useEffect(() => {
    if (product) {
      setFormData(product);
    } else {
      setFormData({
        productCode: '',
        name: '',
        category: 'Chuột',
        price: 0,
        oldPrice: 0,
        discount: 0,
        description: '',
        images: [],
        status: 'con_hang',
        stock: 0,
        colors: [],
        specs: [],
        supplier: '',
        createdAt: '',
        updatedAt: '',
      });
    }
    setNewColor('');
    setNewTag('');
    setNewSpecName('');
    setNewSpecValue('');
  }, [product]);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Chưa có';
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Helper to format number as VND currency
  const formatCurrency = (value: number | string) => {
    if (!value && value !== 0) return '';
    const num = typeof value === 'string' ? Number(value.replace(/\D/g, '')) : value;
    if (isNaN(num)) return '';
    return num.toLocaleString('vi-VN');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'view') return;

    // Validation chi tiết
    const errors = [];

    // Kiểm tra productCode
    if (!formData.productCode || !formData.productCode.trim()) {
      errors.push("Mã sản phẩm không được để trống");
    } else if (formData.productCode.trim().length < 2) {
      errors.push("Mã sản phẩm phải có ít nhất 2 ký tự");
    } else if (formData.productCode.includes(' ')) {
      errors.push("Mã sản phẩm không được chứa khoảng trắng");
    }

    // Kiểm tra tên sản phẩm
    if (!formData.name || !formData.name.trim()) {
      errors.push("Tên sản phẩm không được để trống");
    } else if (formData.name.trim().length < 3) {
      errors.push("Tên sản phẩm phải có ít nhất 3 ký tự");
    }

    // Kiểm tra danh mục
    if (!formData.category || !formData.category.trim()) {
      errors.push("Danh mục không được để trống");
    }

    // Kiểm tra giá
    if (!formData.price || formData.price <= 0) {
      errors.push("Giá sản phẩm phải lớn hơn 0");
    }

    // Kiểm tra stock
    if (formData.stock === undefined || formData.stock === null || formData.stock < 0) {
      errors.push("Số lượng tồn kho phải lớn hơn hoặc bằng 0");
    }

    // Hiển thị lỗi nếu có
    if (errors.length > 0) {
      toast({
        title: "Lỗi validation",
        description: errors.join(", "),
        variant: "destructive",
      });
      return;
    }

    // Trim dữ liệu trước khi lưu
    const cleanedData = {
      ...formData,
      productCode: formData.productCode.trim(),
      name: formData.name.trim(),
      category: formData.category.trim(),
      description: formData.description?.trim() || '',
      supplier: formData.supplier?.trim() || ''
    };

    // Tự động giới hạn giảm giá tối đa 30%
    const limitedDiscount = Math.min(formData.discount || 0, 30);

    const productData: Product = {
      id: product?.id || '',
      productCode: cleanedData.productCode,
      name: cleanedData.name,
      description: cleanedData.description,
      price: cleanedData.price,
      oldPrice: cleanedData.oldPrice || 0,
      discount: limitedDiscount,
      category: cleanedData.category,
      images: cleanedData.images || [],
      status: cleanedData.status || 'con_hang',
      stock: cleanedData.stock || 0,
      colors: cleanedData.colors || [],
      tags: cleanedData.tags || [],
      specs: cleanedData.specs || [],
      supplier: cleanedData.supplier,
      createdAt: cleanedData.createdAt,
      updatedAt: cleanedData.updatedAt,
    };

    // Thông báo nếu giảm giá bị giới hạn
    if ((formData.discount || 0) > 30) {
      toast({
        title: "Thông báo",
        description: `Giảm giá đã được tự động giới hạn từ ${formData.discount}% xuống 30%`,
        variant: "default",
      });
    }

    onSave(productData);
    toast({
      title: mode === 'create' ? "Thêm sản phẩm thành công" : "Cập nhật sản phẩm thành công",
      description: `Sản phẩm "${formData.name}" đã được ${mode === 'create' ? 'thêm' : 'cập nhật'}.`,
    });
    onClose();
  };


  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const maxFiles = 8 - (formData.images?.length || 0);
    if (files.length > maxFiles) {
      toast({
        title: 'Lỗi',
        description: `Chỉ có thể upload tối đa ${maxFiles} ảnh nữa`,
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);
    try {
      const fileArray = Array.from(files);
      const urls = await uploadImages(fileArray);
      
      setFormData({
        ...formData,
        images: [...(formData.images || []), ...urls]
      });
      
      toast({
        title: 'Thành công',
        description: `Đã upload ${urls.length} ảnh thành công`
      });
    } catch (error: any) {
      toast({
        title: 'Lỗi upload',
        description: error.message || 'Không thể upload ảnh',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
      // Reset input
      event.target.value = '';
    }
  };

  const handleSingleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if ((formData.images?.length || 0) >= 8) {
      toast({
        title: 'Lỗi',
        description: 'Đã đạt giới hạn 8 ảnh',
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);
    try {
      const url = await uploadImage(file);
      setFormData({
        ...formData,
        images: [...(formData.images || []), url]
      });
      
      toast({
        title: 'Thành công',
        description: 'Đã upload ảnh thành công'
      });
    } catch (error: any) {
      toast({
        title: 'Lỗi upload',
        description: error.message || 'Không thể upload ảnh',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = formData.images?.filter((_: string, i: number) => i !== index) || [];
    setFormData({ ...formData, images: updatedImages });
  };

  const addColor = (colorName: string) => {
    if (!formData.colors?.includes(colorName)) {
      setFormData({
        ...formData,
        colors: [...(formData.colors || []), colorName]
      });
    }
  };

  const removeColor = (index: number) => {
    const updatedColors = formData.colors?.filter((_: string, i: number) => i !== index) || [];
    setFormData({ ...formData, colors: updatedColors });
  };

  const addTag = (tagName: string) => {
    const trimmedTag = tagName.trim();
    if (!trimmedTag) return;
      setFormData({
        ...formData,
      tags: [trimmedTag] // Chỉ giữ 1 tag duy nhất
      });
      setNewTag('');
  };

  const removeTag = (_index: number) => {
    setFormData({ ...formData, tags: [] });
  };

  const addSpec = () => {
    if (newSpecName.trim() && newSpecValue.trim()) {
      setFormData({
        ...formData,
        specs: [...(formData.specs || []), { name: newSpecName.trim(), value: newSpecValue.trim() }]
      });
      setNewSpecName('');
      setNewSpecValue('');
    }
  };

  const removeSpec = (index: number) => {
    const updatedSpecs = formData.specs?.filter((_: any, i: number) => i !== index) || [];
    setFormData({ ...formData, specs: updatedSpecs });
  };

  const isReadOnly = mode === 'view';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-gaming-dark border-gaming-cyan/20">
        <DialogHeader>
          <DialogTitle className="text-white">
            {(() => {
              switch (mode) {
                case 'create':
                  return 'Thêm sản phẩm mới';
                case 'edit':
                  return 'Chỉnh sửa sản phẩm';
                case 'view':
                  return 'Chi tiết sản phẩm';
              }
            })()}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gaming-cyan border-b border-gaming-cyan/20 pb-2">
              Thông tin cơ bản
            </h3>
            
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="productCode" className="text-gray-300">Mã sản phẩm *</Label>
                <Input
                  id="productCode"
                  value={formData.productCode || ''}
                  onChange={(e) => setFormData({ ...formData, productCode: e.target.value })}
                  className="bg-gaming-darker border-gaming-cyan/30 text-white"
                  readOnly={isReadOnly}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-300">Tên sản phẩm *</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-gaming-darker border-gaming-cyan/30 text-white"
                readOnly={isReadOnly}
                required
              />
            </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="category" className="text-gray-300">Danh mục *</Label>
              <Select
                value={formData.category || ''}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
                disabled={isReadOnly}
              >
                <SelectTrigger className="bg-gaming-darker border-gaming-cyan/30 text-white">
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent className="bg-gaming-darker border-gaming-cyan/30">
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat} className="text-white">
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
              <div className="space-y-2">
                <Label htmlFor="stock" className="text-gray-300">Số lượng</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={formData.stock || 0}
                  onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                  className="bg-gaming-darker border-gaming-cyan/30 text-white"
                  readOnly={isReadOnly}
                  required
                />
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2 col-span-1.5">
              <Label htmlFor="price" className="text-gray-300">Giá (VNĐ) *</Label>
              <Input
                id="price"
                type="text"
                value={formatCurrency(formData.price ?? '')}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, '');
                  let newPrice = Number(raw);
                  let newOldPrice = formData.oldPrice;
                  if ((formData.discount || 0) > 0) {
                    newOldPrice = Math.round(newPrice / (1 - (formData.discount || 0) / 100));
                  } else {
                    newOldPrice = newPrice;
                  }
                  setFormData({ ...formData, price: newPrice, oldPrice: newOldPrice });
                }}
                onBlur={(e) => {
                  setFormData((prev) => ({ ...prev, price: prev.price ? Number(prev.price) : 0 }));
                }}
                className="bg-gaming-darker border-gaming-cyan/30 text-white"
                readOnly={isReadOnly}
                required
                inputMode="numeric"
                maxLength={15}
                placeholder="Nhập giá (VD: 150000)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discount" className="text-gray-300">Giảm giá (%)</Label>
              <Input
                id="discount"
                type="number"
                min="0"
                max="30"
                value={formData.discount || 0}
                onChange={(e) => {
                  const newDiscount = Number(e.target.value);
                  let newOldPrice = formData.oldPrice;
                  if (newDiscount > 0) {
                    newOldPrice = Math.round((formData.price || 0) / (1 - newDiscount / 100));
                  } else {
                    newOldPrice = formData.price || 0;
                  }
                  setFormData({ ...formData, discount: newDiscount, oldPrice: newOldPrice });
                }}
                className="bg-gaming-darker border-gaming-cyan/30 text-white"
                readOnly={isReadOnly}
              />
            </div>
            <div className="space-y-2 col-span-1.5">
              <Label htmlFor="oldPrice" className="text-gray-300">Giá cũ (VNĐ)</Label>
              <Input
                id="oldPrice"
                type="text"
                value={formatCurrency(formData.oldPrice ?? '')}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, '');
                  setFormData({ ...formData, oldPrice: Number(raw) });
                }}
                onBlur={(e) => {
                  setFormData((prev) => ({ ...prev, oldPrice: prev.oldPrice ? Number(prev.oldPrice) : 0 }));
                }}
                className="bg-gaming-darker border-gaming-cyan/30 text-white"
                readOnly={isReadOnly}
                inputMode="numeric"
                maxLength={15}
                placeholder="Nhập giá cũ (VD: 200000)"
              />
            </div>
          </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-gray-300">Trạng thái *</Label>
              <Select
                value={formData.status || 'con_hang'}
                onValueChange={(value) => setFormData({ ...formData, status: value as Product['status'] })}
                disabled={isReadOnly}
              >
                <SelectTrigger className="bg-gaming-darker border-gaming-cyan/30 text-white">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent className="bg-gaming-darker border-gaming-cyan/30">
                  <SelectItem value="sap_ve" className="text-white">Sắp về</SelectItem>
                  <SelectItem value="con_hang" className="text-white">Còn hàng</SelectItem>
                  <SelectItem value="sap_het" className="text-white">Sắp hết</SelectItem>
                  <SelectItem value="het_hang" className="text-white">Hết hàng</SelectItem>
                  <SelectItem value="ngung_kinh_doanh" className="text-white">Ngừng kinh doanh</SelectItem>
                </SelectContent>
              </Select>
            </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-300">Mô tả</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-gaming-darker border-gaming-cyan/30 text-white"
              readOnly={isReadOnly}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplier" className="text-gray-300">Nhà cung cấp</Label>
              <Input
                id="supplier"
                value={formData.supplier || ''}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                className="bg-gaming-darker border-gaming-cyan/30 text-white"
                readOnly={isReadOnly}
                placeholder="Nhập tên nhà cung cấp"
              />
            </div>
          </div>

            {/* Date Information */}
            {(formData.createdAt || formData.updatedAt) && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Ngày tạo</Label>
                  <Input
                    value={formatDate(formData.createdAt)}
                    className="bg-gaming-darker/50 border-gaming-cyan/20 text-gray-400"
                    readOnly
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Ngày cập nhật</Label>
                  <Input
                    value={formatDate(formData.updatedAt)}
                    className="bg-gaming-darker/50 border-gaming-cyan/20 text-gray-400"
                    readOnly
                  />
                </div>
              </div>
            )}
          </div>

          {/* Specifications Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gaming-cyan border-b border-gaming-cyan/20 pb-2">
              Thông số kỹ thuật
            </h3>
            
            <div className="flex gap-2 items-center">
              <Input
                placeholder="Tên thông số"
                value={newSpecName}
                onChange={(e) => setNewSpecName(e.target.value)}
                className="bg-gaming-darker border-gaming-cyan/30 text-white flex-1 min-w-0"
                disabled={isReadOnly}
              />
              <Input
                placeholder="Giá trị"
                value={newSpecValue}
                onChange={(e) => setNewSpecValue(e.target.value)}
                className="bg-gaming-darker border-gaming-cyan/30 text-white flex-1 min-w-0"
              disabled={isReadOnly}
              />
              <Button
                type="button"
                onClick={addSpec}
                disabled={isReadOnly || !newSpecName.trim() || !newSpecValue.trim()}
                className="bg-gaming-cyan text-black hover:bg-gaming-cyan/80 h-10 w-10 min-w-0 flex items-center justify-center rounded-lg"
                style={{padding: 0}}
              >
                <Plus className="h-6 w-6" />
              </Button>
            </div>

            {formData.specs && formData.specs.length > 0 && (
              <div className="space-y-2">
                {formData.specs.map((spec, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gaming-darker/50 rounded border border-gaming-cyan/20">
                    <div className="flex-1">
                      <span className="font-medium text-gaming-cyan">{spec.name}:</span>
                      <span className="ml-2 text-gray-300">{spec.value}</span>
                    </div>
                    {!isReadOnly && (
                      <Button
                        type="button"
                        onClick={() => removeSpec(index)}
                        className="h-6 w-6 p-0 bg-red-500 hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tags Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gaming-cyan border-b border-gaming-cyan/20 pb-2">
              Tags
            </h3>
            
            <div className="flex gap-2">
              <Input
                placeholder="Nhập tag tùy chỉnh"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="bg-gaming-darker border-gaming-cyan/30 text-white flex-1"
              disabled={isReadOnly}
              />
              <Button
                type="button"
                onClick={() => addTag(newTag)}
                disabled={isReadOnly || !newTag.trim()}
                className="bg-gaming-cyan text-black hover:bg-gaming-cyan/80"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Common Tags */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-300">Tags phổ biến:</h4>
              <div className="flex flex-wrap gap-2">
                {commonTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => addTag(tag)}
                    disabled={isReadOnly || formData.tags?.includes(tag)}
                    className={`
                      px-3 py-1 rounded-full text-xs font-medium transition-all duration-200
                      ${formData.tags?.includes(tag)
                        ? 'bg-gaming-cyan/20 text-gaming-cyan border border-gaming-cyan/40 opacity-60'
                        : 'bg-gaming-darker border border-gaming-cyan/30 text-gray-300 hover:bg-gaming-cyan/10 hover:text-gaming-cyan hover:border-gaming-cyan/50'
                      }
                      ${isReadOnly ? 'cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {formData.tags && formData.tags.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-300 mb-2">Tags đã chọn:</h4>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-gaming-cyan/20 text-gaming-cyan border-gaming-cyan/30"
                    >
                      {tag}
                      {!isReadOnly && (
                        <Button
                          type="button"
                          onClick={() => removeTag(index)}
                          className="ml-2 h-4 w-4 p-0 bg-transparent hover:bg-red-500/20"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {(!formData.tags || formData.tags.length === 0) && (
              <div className="text-center py-4 text-gray-400 border border-dashed border-gaming-cyan/20 rounded">
                <p>Chưa có tag nào</p>
                <p className="text-sm">Chọn từ tags phổ biến hoặc nhập tag tùy chỉnh</p>
              </div>
            )}
          </div>

          {/* Images Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gaming-cyan border-b border-gaming-cyan/20 pb-2">
                Hình ảnh sản phẩm
              </h3>
              <div className="text-sm text-gray-400">
                {formData.images?.length || 0}/8 ảnh
              </div>
            </div>
            
            <div className="space-y-3">
              {/* Upload File Section */}
              <div className="flex gap-2">
                <label className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    disabled={isReadOnly || uploading || (formData.images?.length || 0) >= 8}
                    className="hidden"
                    id="image-upload-multiple"
                  />
                  <Button
                    type="button"
                    onClick={() => document.getElementById('image-upload-multiple')?.click()}
                    disabled={isReadOnly || uploading || (formData.images?.length || 0) >= 8}
                    className="w-full bg-gaming-cyan text-black hover:bg-gaming-cyan/80"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Đang upload...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload ảnh từ máy tính
                      </>
                    )}
                  </Button>
                </label>
                {(formData.images?.length || 0) < 8 && (
                  <Button
                    type="button"
                    onClick={() => document.getElementById('image-upload-multiple')?.click()}
                    disabled={isReadOnly || uploading}
                    variant="outline"
                    className="border-gaming-cyan/30 text-gaming-cyan hover:bg-gaming-cyan/20"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm ảnh
                  </Button>
                )}
              </div>
            </div>

            {formData.images && formData.images.length > 0 && (
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Product ${index + 1}`}
                      className="w-full h-20 object-cover rounded border border-gaming-cyan/30"
                      onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjMzMzMzMzIi8+Cjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pgo8L3N2Zz4K';
                      }}
                    />
                    <div className="absolute top-1 left-1 bg-black/50 text-white text-xs px-1 rounded">
                      {index + 1}
                    </div>
                    {!isReadOnly && (
                      <Button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 h-6 w-6 p-0 bg-red-500 hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {(!formData.images || formData.images.length === 0) && (
              <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gaming-cyan/20 rounded">
                <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Chưa có hình ảnh nào</p>
                <p className="text-sm">Có thể thêm tối đa 8 hình ảnh sản phẩm</p>
              </div>
            )}

            {formData.images && formData.images.length > 0 && formData.images.length < 8 && (
              <div className="text-center py-4 text-blue-400 bg-blue-400/10 border border-blue-400/20 rounded">
                <p>Có thể thêm {8 - formData.images.length} hình ảnh nữa (tùy chọn)</p>
              </div>
            )}
          </div>

          {/* Colors Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gaming-cyan border-b border-gaming-cyan/20 pb-2">
              Màu sắc
            </h3>
            
            <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
              {colorPalette.map((color) => (
                <button
                  key={color.name}
                  type="button"
                  onClick={() => addColor(color.name)}
                  disabled={isReadOnly || formData.colors?.includes(color.name)}
                  className={`
                    relative p-3 rounded-lg border-2 transition-all duration-200
                    ${color.bg} 
                    ${formData.colors?.includes(color.name) 
                      ? 'border-gaming-cyan scale-95 opacity-60' 
                      : 'border-gray-600 hover:border-gaming-cyan/50 hover:scale-105'
                    }
                    ${isReadOnly ? 'cursor-not-allowed' : 'cursor-pointer'}
                  `}
                  title={color.name}
                >
                  <span className="sr-only">{color.name}</span>
                  {formData.colors?.includes(color.name) && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-gaming-cyan rounded-full flex items-center justify-center">
                      <span className="text-black text-xs">✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {formData.colors && formData.colors.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-300 mb-2">Màu sắc đã chọn:</h4>
                <div className="flex flex-wrap gap-2">
                  {formData.colors.map((color, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-gaming-cyan/20 text-gaming-cyan border-gaming-cyan/30"
                    >
                      {color}
                      {!isReadOnly && (
                        <Button
                          type="button"
                          onClick={() => removeColor(index)}
                          className="ml-2 h-4 w-4 p-0 bg-transparent hover:bg-red-500/20"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {(!formData.colors || formData.colors.length === 0) && (
              <div className="text-center py-4 text-gray-400 border border-dashed border-gaming-cyan/20 rounded">
                <p>Chưa chọn màu sắc nào</p>
                <p className="text-sm">Nhấp vào các ô màu bên trên để chọn</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="bg-gaming-dark/50 border-gaming-cyan/20">
              Hủy
            </Button>
            {mode !== 'view' && (
              <Button type="submit" className="bg-gaming-cyan text-black hover:bg-gaming-cyan/80">
                {mode === 'create' ? 'Thêm sản phẩm' : 'Cập nhật'}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 