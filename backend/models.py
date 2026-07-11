"""
Database models using SQLAlchemy for PostgreSQL
"""
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import bcrypt

db = SQLAlchemy()


class User(db.Model):
    """User model for authentication"""
    __tablename__ = "users"
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default="user", nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    cart = db.relationship("Cart", back_populates="user", uselist=False, cascade="all, delete-orphan")
    
    def set_password(self, password):
        """Hash and set password"""
        salt = bcrypt.gensalt(10)
        self.password = bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")
    
    def check_password(self, password):
        """Verify password against hash"""
        return bcrypt.checkpw(password.encode("utf-8"), self.password.encode("utf-8"))
    
    def to_dict(self):
        """Convert user to dictionary"""
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
        }


class Product(db.Model):
    """Product model for store inventory"""
    __tablename__ = "products"
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, default="")
    price = db.Column(db.Float, nullable=False)
    original_price = db.Column(db.Float, nullable=True)
    image_url = db.Column(db.String(500), nullable=False)
    category = db.Column(
        db.String(50),
        default="suits",
        nullable=False,
        # Enum values: suits, fabrics, dupattas, accessories
    )
    stock = db.Column(db.Integer, default=10)
    rating = db.Column(db.Float, default=4.0)
    review_count = db.Column(db.Integer, default=0)
    is_featured = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    cart_items = db.relationship("CartItem", back_populates="product", cascade="all, delete-orphan")
    
    def to_dict(self):
        """Convert product to dictionary"""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "price": self.price,
            "originalPrice": self.original_price,
            "imageUrl": self.image_url,
            "category": self.category,
            "stock": self.stock,
            "rating": self.rating,
            "reviewCount": self.review_count,
            "isFeatured": self.is_featured,
        }


class Cart(db.Model):
    """Cart model for user shopping carts"""
    __tablename__ = "carts"
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = db.relationship("User", back_populates="cart")
    items = db.relationship("CartItem", back_populates="cart", cascade="all, delete-orphan")
    
    def to_dict(self):
        """Convert cart to dictionary"""
        return {
            "id": self.id,
            "user": self.user_id,
            "items": [item.to_dict() for item in self.items],
        }


class CartItem(db.Model):
    """CartItem model for individual items in cart"""
    __tablename__ = "cart_items"
    
    id = db.Column(db.Integer, primary_key=True)
    cart_id = db.Column(db.Integer, db.ForeignKey("carts.id"), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey("products.id"), nullable=False)
    quantity = db.Column(db.Integer, default=1, nullable=False)
    
    # Relationships
    cart = db.relationship("Cart", back_populates="items")
    product = db.relationship("Product", back_populates="cart_items")
    
    def to_dict(self):
        """Convert cart item to dictionary"""
        return {
            "product": self.product.to_dict() if self.product else None,
            "quantity": self.quantity,
        }


class Order(db.Model):
    """Order model for customer orders"""
    __tablename__ = "orders"
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    razorpay_order_id = db.Column(db.String(100), unique=True, nullable=False)
    razorpay_payment_id = db.Column(db.String(100), nullable=True)
    amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default="pending")  # pending, success, failed, cancelled
    payment_method = db.Column(db.String(50), default="razorpay")
    customer_email = db.Column(db.String(120), nullable=False)
    customer_name = db.Column(db.String(100), nullable=False)
    delivery_address = db.Column(db.String(500), nullable=False)
    delivery_city = db.Column(db.String(100), nullable=False)
    delivery_phone = db.Column(db.String(20), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = db.relationship("User", backref="orders")
    items = db.relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    
    def to_dict(self):
        """Convert order to dictionary"""
        return {
            "id": self.id,
            "razorpayOrderId": self.razorpay_order_id,
            "razorpayPaymentId": self.razorpay_payment_id,
            "amount": self.amount,
            "status": self.status,
            "paymentMethod": self.payment_method,
            "customerEmail": self.customer_email,
            "customerName": self.customer_name,
            "deliveryAddress": self.delivery_address,
            "deliveryCity": self.delivery_city,
            "deliveryPhone": self.delivery_phone,
            "items": [item.to_dict() for item in self.items],
            "createdAt": self.created_at.isoformat(),
        }


class OrderItem(db.Model):
    """OrderItem model for items in an order"""
    __tablename__ = "order_items"
    
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey("orders.id"), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey("products.id"), nullable=False)
    product_name = db.Column(db.String(200), nullable=False)
    product_price = db.Column(db.Float, nullable=False)
    quantity = db.Column(db.Integer, default=1, nullable=False)
    
    # Relationships
    order = db.relationship("Order", back_populates="items")
    product = db.relationship("Product")
    
    def to_dict(self):
        """Convert order item to dictionary"""
        return {
            "id": self.id,
            "productId": self.product_id,
            "productName": self.product_name,
            "productPrice": self.product_price,
            "quantity": self.quantity,
            "total": self.product_price * self.quantity,
        }
