"""
Product routes and business logic
"""
from flask import Blueprint, request, jsonify
from models import db, Product

products_bp = Blueprint("products", __name__, url_prefix="/api/products")


@products_bp.route("", methods=["GET"])
def get_products():
    """Get all products with filtering and sorting"""
    try:
        category = request.args.get("category")
        search = request.args.get("search")
        sort = request.args.get("sort", "createdAt")
        featured = request.args.get("featured")
        
        # Build query
        query = Product.query
        
        # Apply filters
        if category:
            query = query.filter_by(category=category)
        
        if featured and featured.lower() == "true":
            query = query.filter_by(is_featured=True)
        
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                (Product.name.ilike(search_term)) |
                (Product.description.ilike(search_term))
            )
        
        # Apply sorting
        if sort == "price-asc":
            query = query.order_by(Product.price.asc())
        elif sort == "price-desc":
            query = query.order_by(Product.price.desc())
        elif sort == "rating":
            query = query.order_by(Product.rating.desc())
        else:
            query = query.order_by(Product.created_at.desc())
        
        products = query.all()
        
        return jsonify({
            "count": len(products),
            "products": [p.to_dict() for p in products],
        }), 200
    
    except Exception as error:
        return jsonify({"message": "Error fetching products", "error": str(error)}), 500


@products_bp.route("/<int:product_id>", methods=["GET"])
def get_product_by_id(product_id):
    """Get product by ID"""
    try:
        product = Product.query.get(product_id)
        if not product:
            return jsonify({"message": "Product not found"}), 404
        
        return jsonify({"product": product.to_dict()}), 200
    
    except Exception as error:
        return jsonify({"message": "Error fetching product", "error": str(error)}), 500


@products_bp.route("", methods=["POST"])
def create_product():
    """Create new product (admin only)"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data or not all(k in data for k in ["name", "price", "imageUrl"]):
            return jsonify({"message": "Name, price, and image URL are required"}), 400
        
        product = Product(
            name=data.get("name"),
            description=data.get("description", ""),
            price=float(data.get("price")),
            original_price=data.get("originalPrice"),
            image_url=data.get("imageUrl"),
            category=data.get("category", "suits"),
            stock=int(data.get("stock", 10)),
            is_featured=data.get("isFeatured", False),
        )
        
        db.session.add(product)
        db.session.commit()
        
        return jsonify({
            "message": "Product created successfully",
            "product": product.to_dict(),
        }), 201
    
    except ValueError as error:
        return jsonify({"message": "Invalid data format", "error": str(error)}), 400
    except Exception as error:
        db.session.rollback()
        return jsonify({"message": "Error creating product", "error": str(error)}), 500


@products_bp.route("/<int:product_id>", methods=["PUT"])
def update_product(product_id):
    """Update product (admin only)"""
    try:
        product = Product.query.get(product_id)
        if not product:
            return jsonify({"message": "Product not found"}), 404
        
        data = request.get_json()
        
        # Update fields if provided
        if "name" in data:
            product.name = data["name"]
        if "description" in data:
            product.description = data["description"]
        if "price" in data:
            product.price = float(data["price"])
        if "originalPrice" in data:
            product.original_price = data["originalPrice"]
        if "imageUrl" in data:
            product.image_url = data["imageUrl"]
        if "category" in data:
            product.category = data["category"]
        if "stock" in data:
            product.stock = int(data["stock"])
        if "isFeatured" in data:
            product.is_featured = data["isFeatured"]
        
        db.session.commit()
        
        return jsonify({
            "message": "Product updated",
            "product": product.to_dict(),
        }), 200
    
    except ValueError as error:
        return jsonify({"message": "Invalid data format", "error": str(error)}), 400
    except Exception as error:
        db.session.rollback()
        return jsonify({"message": "Error updating product", "error": str(error)}), 500


@products_bp.route("/<int:product_id>", methods=["DELETE"])
def delete_product(product_id):
    """Delete product (admin only)"""
    try:
        product = Product.query.get(product_id)
        if not product:
            return jsonify({"message": "Product not found"}), 404
        
        db.session.delete(product)
        db.session.commit()
        
        return jsonify({"message": "Product deleted successfully"}), 200
    
    except Exception as error:
        db.session.rollback()
        return jsonify({"message": "Error deleting product", "error": str(error)}), 500


@products_bp.route("/seed/init", methods=["POST"])
def seed_products():
    """Seed database with initial products"""
    try:
        # Check if products already exist
        if Product.query.first():
            return jsonify({"message": "Products already seeded"}), 400
        
        seed_data = [
            {
                "name": "Premium Silk Suit",
                "description": "Elegant premium silk suit perfect for special occasions",
                "price": 5999,
                "original_price": 7999,
                "image_url": "https://via.placeholder.com/300?text=Silk+Suit",
                "category": "suits",
                "stock": 15,
                "is_featured": True,
            },
            {
                "name": "Cotton Fabric Roll",
                "description": "High-quality cotton fabric suitable for any outfit",
                "price": 599,
                "original_price": 799,
                "image_url": "https://via.placeholder.com/300?text=Cotton",
                "category": "fabrics",
                "stock": 30,
                "is_featured": False,
            },
            {
                "name": "Embroidered Dupatta",
                "description": "Beautiful embroidered dupatta with exquisite designs",
                "price": 1299,
                "original_price": 1699,
                "image_url": "https://via.placeholder.com/300?text=Dupatta",
                "category": "dupattas",
                "stock": 20,
                "is_featured": True,
            },
            {
                "name": "Gold Jewelry Set",
                "description": "Elegant gold jewelry set with modern designs",
                "price": 3999,
                "original_price": 5999,
                "image_url": "https://via.placeholder.com/300?text=Jewelry",
                "category": "accessories",
                "stock": 10,
                "is_featured": False,
            },
        ]
        
        for item in seed_data:
            product = Product(**item)
            db.session.add(product)
        
        db.session.commit()
        
        return jsonify({
            "message": f"Seeded {len(seed_data)} products successfully"
        }), 201
    
    except Exception as error:
        db.session.rollback()
        return jsonify({"message": "Error seeding products", "error": str(error)}), 500
