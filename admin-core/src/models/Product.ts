import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  id: { 
    type: String, 
    required: [true, 'ID sản phẩm là bắt buộc'], 
    unique: true 
  },
  productCode: { 
    type: String, 
    required: [true, 'Mã sản phẩm là bắt buộc'], 
    unique: true,
    trim: true,
    minlength: [2, 'Mã sản phẩm phải có ít nhất 2 ký tự'],
    validate: {
      validator: function(v: string) {
        return !v.includes(' ');
      },
      message: 'Mã sản phẩm không được chứa khoảng trắng'
    }
  },
  name: { 
    type: String, 
    required: [true, 'Tên sản phẩm là bắt buộc'],
    trim: true,
    minlength: [3, 'Tên sản phẩm phải có ít nhất 3 ký tự']
  },
  description: { 
    type: String, 
    required: false, // Không bắt buộc, sẽ có default
    trim: true,
    default: 'Chưa có mô tả',
    validate: {
      validator: function(v: string) {
        // Nếu có description thì phải >= 10 ký tự, nếu không có thì dùng default
        return !v || v.trim().length === 0 || v.trim().length >= 10;
      },
      message: 'Mô tả sản phẩm phải có ít nhất 10 ký tự hoặc để trống'
    }
  },
  price: { 
    type: Number, 
    required: [true, 'Giá sản phẩm là bắt buộc'],
    min: [0, 'Giá sản phẩm phải lớn hơn hoặc bằng 0']
  },
  oldPrice: { 
    type: Number, 
    default: 0,
    min: [0, 'Giá cũ phải lớn hơn hoặc bằng 0']
  },
  discount: { 
    type: Number, 
    default: 0,
    min: [0, 'Giảm giá phải lớn hơn hoặc bằng 0'],
    max: [100, 'Giảm giá không được vượt quá 100%']
  },
  category: { 
    type: String, 
    required: [true, 'Danh mục sản phẩm là bắt buộc'],
    trim: true
  },
  images: [{ 
    type: String,
    validate: {
      validator: function(v: string) {
        // Cho phép array rỗng, nhưng nếu có phần tử thì phải không rỗng
        if (v === undefined || v === null) return false;
        return v.trim().length > 0;
      },
      message: 'URL hình ảnh không được để trống'
    }
  }],
  status: { 
    type: String, 
    enum: {
      values: ['sap_ve', 'con_hang', 'sap_het', 'het_hang', 'ngung_kinh_doanh'],
      message: 'Trạng thái không hợp lệ'
    }, 
    default: 'con_hang' 
  },
  colors: [{ 
    type: String,
    trim: true
  }],
  tags: [{ 
    type: String,
    trim: true
  }],
  specs: [{
    name: { 
      type: String, 
      required: true,
      trim: true
    },
    value: { 
      type: String, 
      required: true,
      trim: true
    }
  }],
  stock: {
    type: Number,
    default: 0,
    min: [0, 'Số lượng tồn kho phải lớn hơn hoặc bằng 0']
  },
  supplier: {
    type: String,
    trim: true,
    default: ''
  }
}, { 
  timestamps: true,
  // Thêm index để tối ưu tìm kiếm
  indexes: [
    { productCode: 1 },
    { name: 1 },
    { category: 1 },
    { status: 1 }
  ]
});

export const Product = mongoose.model('Product', productSchema); 