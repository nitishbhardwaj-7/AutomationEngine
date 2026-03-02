import Product from "../models/Product.js";
import { detectCategory } from "../utils/categoryDetector.js";
import { generateSizes } from "../utils/sizeGenerator.js";
import { generateDescription } from "../services/descriptionService.js";

export const smartCreateProduct = async (req, res) => {
  try {
    const { name, price, image_url } = req.body;

    if (!name || !price) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const category = detectCategory(name);

    const description = await generateDescription(name, category);

    const product = new Product({
      name,
      price,
      category,
      description,
      image_url,
      sizes: generateSizes(name),
      in_stock: true,
      featured: false
    });

    await product.save();

    res.status(201).json({
      message: "Smart product created",
      product
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};