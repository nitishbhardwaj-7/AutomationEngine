import express from 'express';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Get user's cart
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('cart.product_id');
    res.json(user.cart || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add item to cart
router.post('/add', protect, async (req, res) => {
  try {
    const { product_id, quantity, size } = req.body;

    if (!product_id || !quantity || !size) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const user = await User.findById(req.user._id);
    const cart = user.cart || [];

    // Check if item already exists in cart with same size
    const existingItemIndex = cart.findIndex(
      item => item.product_id.toString() === product_id && item.size === size
    );

    if (existingItemIndex > -1) {
      // Update quantity
      cart[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.push({ product_id, quantity, size });
    }

    user.cart = cart;
    await user.save();

    const updatedUser = await User.findById(req.user._id).populate('cart.product_id');
    res.json(updatedUser.cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update cart item quantity
router.put('/update', protect, async (req, res) => {
  try {
    const { product_id, size, quantity } = req.body;

    if (!product_id || !size || quantity === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const user = await User.findById(req.user._id);
    const cart = user.cart || [];

    const itemIndex = cart.findIndex(
      item => item.product_id.toString() === product_id && item.size === size
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      cart.splice(itemIndex, 1);
    } else {
      // Update quantity
      cart[itemIndex].quantity = quantity;
    }

    user.cart = cart;
    await user.save();

    const updatedUser = await User.findById(req.user._id).populate('cart.product_id');
    res.json(updatedUser.cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove item from cart
router.delete('/remove', protect, async (req, res) => {
  try {
    const { product_id, size } = req.body;

    if (!product_id || !size) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const user = await User.findById(req.user._id);
    const cart = user.cart || [];

    user.cart = cart.filter(
      item => !(item.product_id.toString() === product_id && item.size === size)
    );

    await user.save();

    const updatedUser = await User.findById(req.user._id).populate('cart.product_id');
    res.json(updatedUser.cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Clear entire cart
router.delete('/clear', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.cart = [];
    await user.save();

    res.json({ message: 'Cart cleared', cart: [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;