import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { full_name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      full_name,
      email,
      password
    });

    res.status(201).json({
      _id: user._id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    
    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        cart: user.cart,
        wishlist: user.wishlist,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get current user
router.get('/me', protect, async (req, res) => {
  res.json({
    _id: req.user._id,
    full_name: req.user.full_name,
    email: req.user.email,
    role: req.user.role,
    cart: req.user.cart,
    wishlist: req.user.wishlist
  });
});

// Update user profile
router.put('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (req.body.full_name) user.full_name = req.body.full_name;
    if (req.body.cart !== undefined) user.cart = req.body.cart;
    if (req.body.wishlist !== undefined) user.wishlist = req.body.wishlist;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      full_name: updatedUser.full_name,
      email: updatedUser.email,
      role: updatedUser.role,
      cart: updatedUser.cart,
      wishlist: updatedUser.wishlist
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;