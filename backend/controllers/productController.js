// ============================================================
// controllers/productController.js - Product Business Logic
// ============================================================

const { Product, sequelize } = require("../models");
const { Op } = require("sequelize");

// ─── @route  GET /api/products ───────────────────────────────
// ─── @access Public ──────────────────────────────────────────
const getProducts = async (req, res) => {
  try {
    const { category, search, sort, featured } = req.query;

    // Build where clause
    let where = {};
    if (category) where.category = category;
    if (featured === "true") where.isFeatured = true;
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    // Build order clause
    let order = [["createdAt", "DESC"]]; // Default: newest first
    if (sort === "price-asc") order = [["price", "ASC"]];
    if (sort === "price-desc") order = [["price", "DESC"]];
    if (sort === "rating") order = [["rating", "DESC"]];

    const products = await Product.findAll({
      where,
      order,
    });

    res.json({
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching products", error: error.message });
  }
};

// ─── @route  GET /api/products/:id ───────────────────────────
// ─── @access Public ──────────────────────────────────────────
const getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ product });
  } catch (error) {
    res.status(500).json({ message: "Error fetching product", error: error.message });
  }
};

// ─── @route  POST /api/products ──────────────────────────────
// ─── @access Admin Only ───────────────────────────────────────
const createProduct = async (req, res) => {
  try {
    const { name, description, price, originalPrice, imageUrl, category, stock, isFeatured } = req.body;

    if (!name || !price || !imageUrl) {
      return res.status(400).json({ message: "Name, price, and image URL are required" });
    }

    const product = await Product.create({
      name,
      description,
      price,
      originalPrice,
      imageUrl,
      category,
      stock,
      isFeatured,
    });

    res.status(201).json({ message: "Product created successfully", product });
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      const messages = error.errors.map((e) => e.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    res.status(500).json({ message: "Error creating product", error: error.message });
  }
};

// ─── @route  PUT /api/products/:id ───────────────────────────
// ─── @access Admin Only ───────────────────────────────────────
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    
    await product.update(req.body);
    res.json({ message: "Product updated", product });
  } catch (error) {
    res.status(500).json({ message: "Error updating product", error: error.message });
  }
};

// ─── @route  DELETE /api/products/:id ────────────────────────
// ─── @access Admin Only ───────────────────────────────────────
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    
    await product.destroy();
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product", error: error.message });
  }
};

// ─── @route  POST /api/products/seed ─────────────────────────
// ─── @access Public (dev only) ───────────────────────────────
const seedProducts = async (req, res) => {
  try {
    await Product.destroy({ where: {} });

    const sampleProducts = [
      {
        name: "Luxury Embroidered Lawn Suit",
        description: "3-piece premium lawn suit with intricate embroidery. Perfect for casual and semi-formal occasions.",
        price: 3500,
        originalPrice: 4500,
        imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500",
        category: "suits",
        stock: 15,
        rating: 4.8,
        reviewCount: 124,
        isFeatured: true,
      },
      {
        name: "Bridal Chiffon Collection",
        description: "Elegant bridal chiffon suit with heavy embroidery and stone work. Perfect for weddings.",
        price: 8500,
        originalPrice: 12000,
        imageUrl: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=500",
        category: "suits",
        stock: 8,
        rating: 4.9,
        reviewCount: 89,
        isFeatured: true,
      },
      {
        name: "Premium Cotton Fabric (Per Meter)",
        description: "High quality Pakistani cotton fabric. Breathable and comfortable for summers.",
        price: 650,
        originalPrice: 850,
        imageUrl: "https://images.unsplash.com/photo-1558171813-2d87ad3e3b49?w=500",
        category: "fabrics",
        stock: 50,
        rating: 4.5,
        reviewCount: 67,
        isFeatured: false,
      },
      {
        name: "Silk Dupatta - Rose Gold",
        description: "Pure silk dupatta with hand-embroidered border. Available in multiple colors.",
        price: 1800,
        originalPrice: 2500,
        imageUrl: "https://images.unsplash.com/photo-1602810316498-ab67cf68c8e1?w=500",
        category: "dupattas",
        stock: 20,
        rating: 4.7,
        reviewCount: 45,
        isFeatured: true,
      },
      {
        name: "Khaddar Winter Suit",
        description: "Warm khaddar suit perfect for winter. Features traditional block printing.",
        price: 4200,
        originalPrice: 5500,
        imageUrl: "https://images.unsplash.com/photo-1612902403222-ac34e07cc99e?w=500",
        category: "suits",
        stock: 12,
        rating: 4.6,
        reviewCount: 78,
        isFeatured: false,
      },
      {
        name: "Digital Print Lawn - Summer Special",
        description: "Vibrant digital print lawn suit. Lightweight and perfect for hot summers.",
        price: 2800,
        originalPrice: 3200,
        imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500",
        category: "suits",
        stock: 25,
        rating: 4.4,
        reviewCount: 156,
        isFeatured: true,
      },
      {
        name: "Velvet Fabric - Royal Blue",
        description: "Premium velvet fabric perfect for formal suits and shawls. Rich texture.",
        price: 1200,
        originalPrice: 1600,
        imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500",
        category: "fabrics",
        stock: 30,
        rating: 4.3,
        reviewCount: 34,
        isFeatured: false,
      },
      {
        name: "Embroidered Organza Suit",
        description: "Stunning organza suit with floral embroidery. Ideal for festive occasions.",
        price: 6500,
        originalPrice: 8000,
        imageUrl: "https://images.unsplash.com/photo-1614684888744-7ff5d4f8b3b2?w=500",
        category: "suits",
        stock: 10,
        rating: 4.8,
        reviewCount: 92,
        isFeatured: true,
      },
    ];

    const products = await Product.bulkCreate(sampleProducts);
    res.json({ message: `✅ ${products.length} products seeded successfully!`, products });
  } catch (error) {
    res.status(500).json({ message: "Error seeding products", error: error.message });
  }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct, seedProducts };
