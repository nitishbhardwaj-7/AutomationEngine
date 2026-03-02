import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },  
    product_name: String,
    product_image: String,
    quantity: Number,
    size: String,
    price: Number
  }],
  total: {
    type: Number,
    required: true
  },
  shipping_address: {
    full_name: String,
    address_line1: String,
    address_line2: String,
    city: String,
    postal_code: String,
    country: String,
    phone: String
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  payment_method: String
}, {
  timestamps: true
});

export default mongoose.model('Order', orderSchema);