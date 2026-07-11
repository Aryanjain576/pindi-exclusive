"""
Cart routes and business logic
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required
from models import db, Cart, CartItem, Product, User

cart_bp = Blueprint("cart", __name__, url_prefix="/api/cart")


@cart_bp.route("", methods=["GET"])
@jwt_required()
def get_cart():
    """Get user's cart"""
    try:
        user_id = get_jwt_identity()
        
        # Find or create cart for user
        cart = Cart.query.filter_by(user_id=user_id).first()
        if not cart:
            user = User.query.get(user_id)
            cart = Cart(user_id=user_id)
            db.session.add(cart)
            db.session.commit()
        
        # Calculate total price
        total_price = 0
        for item in cart.items:
            if item.product:
                total_price += item.product.price * item.quantity
        
        return jsonify({
            "cart": cart.to_dict(),
            "totalPrice": total_price,
        }), 200
    
    except Exception as error:
        return jsonify({"message": "Error fetching cart", "error": str(error)}), 500


@cart_bp.route("/add", methods=["POST"])
@jwt_required()
def add_to_cart():
    """Add product to cart"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data or "productId" not in data:
            return jsonify({"message": "Product ID is required"}), 400
        
        product_id = data.get("productId")
        quantity = int(data.get("quantity", 1))
        
        if quantity < 1:
            return jsonify({"message": "Quantity must be at least 1"}), 400
        
        # Get or create cart
        cart = Cart.query.filter_by(user_id=user_id).first()
        if not cart:
            cart = Cart(user_id=user_id)
            db.session.add(cart)
            db.session.flush()
        
        # Check if product exists
        product = Product.query.get(product_id)
        if not product:
            return jsonify({"message": "Product not found"}), 404
        
        # Check if item already in cart
        item = CartItem.query.filter_by(
            cart_id=cart.id,
            product_id=product_id
        ).first()
        
        if item:
            item.quantity += quantity
        else:
            item = CartItem(cart_id=cart.id, product_id=product_id, quantity=quantity)
            db.session.add(item)
        
        db.session.commit()
        
        # Calculate total price
        total_price = sum(i.product.price * i.quantity for i in cart.items if i.product)
        
        return jsonify({
            "message": "Product added to cart",
            "cart": cart.to_dict(),
            "totalPrice": total_price,
        }), 201
    
    except ValueError as error:
        return jsonify({"message": "Invalid quantity format", "error": str(error)}), 400
    except Exception as error:
        db.session.rollback()
        return jsonify({"message": "Error adding to cart", "error": str(error)}), 500


@cart_bp.route("/update", methods=["PUT"])
@jwt_required()
def update_cart_item():
    """Update quantity of product in cart"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data or "productId" not in data:
            return jsonify({"message": "Product ID is required"}), 400
        
        product_id = data.get("productId")
        quantity = int(data.get("quantity", 1))
        
        if quantity < 1:
            return jsonify({"message": "Quantity must be at least 1"}), 400
        
        # Get cart
        cart = Cart.query.filter_by(user_id=user_id).first()
        if not cart:
            return jsonify({"message": "Cart not found"}), 404
        
        # Find item in cart
        item = CartItem.query.filter_by(
            cart_id=cart.id,
            product_id=product_id
        ).first()
        
        if not item:
            return jsonify({"message": "Item not in cart"}), 404
        
        item.quantity = quantity
        db.session.commit()
        
        # Calculate total price
        total_price = sum(i.product.price * i.quantity for i in cart.items if i.product)
        
        return jsonify({
            "message": "Cart item updated",
            "cart": cart.to_dict(),
            "totalPrice": total_price,
        }), 200
    
    except ValueError as error:
        return jsonify({"message": "Invalid quantity format", "error": str(error)}), 400
    except Exception as error:
        db.session.rollback()
        return jsonify({"message": "Error updating cart", "error": str(error)}), 500


@cart_bp.route("/remove/<int:product_id>", methods=["DELETE"])
@jwt_required()
def remove_from_cart(product_id):
    """Remove product from cart"""
    try:
        user_id = get_jwt_identity()
        
        # Get cart
        cart = Cart.query.filter_by(user_id=user_id).first()
        if not cart:
            return jsonify({"message": "Cart not found"}), 404
        
        # Find and delete item
        item = CartItem.query.filter_by(
            cart_id=cart.id,
            product_id=product_id
        ).first()
        
        if not item:
            return jsonify({"message": "Item not in cart"}), 404
        
        db.session.delete(item)
        db.session.commit()
        
        # Calculate total price
        total_price = sum(i.product.price * i.quantity for i in cart.items if i.product)
        
        return jsonify({
            "message": "Product removed from cart",
            "cart": cart.to_dict(),
            "totalPrice": total_price,
        }), 200
    
    except Exception as error:
        db.session.rollback()
        return jsonify({"message": "Error removing from cart", "error": str(error)}), 500


@cart_bp.route("/clear", methods=["DELETE"])
@jwt_required()
def clear_cart():
    """Clear all items from cart"""
    try:
        user_id = get_jwt_identity()
        
        # Get cart
        cart = Cart.query.filter_by(user_id=user_id).first()
        if not cart:
            return jsonify({"message": "Cart not found"}), 404
        
        # Delete all items
        CartItem.query.filter_by(cart_id=cart.id).delete()
        db.session.commit()
        
        return jsonify({
            "message": "Cart cleared",
            "cart": cart.to_dict(),
            "totalPrice": 0,
        }), 200
    
    except Exception as error:
        db.session.rollback()
        return jsonify({"message": "Error clearing cart", "error": str(error)}), 500
