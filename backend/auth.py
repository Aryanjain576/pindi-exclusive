"""
Authentication routes and business logic
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from models import db, User
from datetime import timedelta
import os

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

JWT_SECRET = os.getenv("JWT_SECRET", "pindi_exclusive_super_secret_jwt_key_2026")


def generate_token(user_id):
    """Generate JWT token for user"""
    return create_access_token(
        identity=user_id,
        expires_delta=timedelta(days=7),
    )


@auth_bp.route("/signup", methods=["POST"])
def signup():
    """Create new user account"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data or not all(k in data for k in ["name", "email", "password"]):
            return jsonify({"message": "Please fill in all fields"}), 400
        
        name = data.get("name", "").strip()
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")
        
        # Validation
        if len(name) < 2:
            return jsonify({"message": "Name must be at least 2 characters"}), 400
        
        if len(password) < 6:
            return jsonify({"message": "Password must be at least 6 characters"}), 400
        
        if "@" not in email or "." not in email:
            return jsonify({"message": "Please enter a valid email"}), 400
        
        # Check if user already exists
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return jsonify({"message": "Email already registered"}), 400
        
        # Create new user
        user = User(name=name, email=email, role="user")
        user.set_password(password)
        
        db.session.add(user)
        db.session.commit()
        
        return jsonify({
            "message": "Account created successfully!",
            "user": user.to_dict(),
            "token": generate_token(user.id),
        }), 201
    
    except Exception as error:
        db.session.rollback()
        return jsonify({"message": "Server error during signup", "error": str(error)}), 500


@auth_bp.route("/login", methods=["POST"])
def login():
    """Login user with email and password"""
    try:
        data = request.get_json()
        
        if not data or not all(k in data for k in ["email", "password"]):
            return jsonify({"message": "Please provide email and password"}), 400
        
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")
        
        # Find user by email
        user = User.query.filter_by(email=email).first()
        if not user or not user.check_password(password):
            return jsonify({"message": "Invalid email or password"}), 401
        
        return jsonify({
            "message": "Login successful!",
            "user": user.to_dict(),
            "token": generate_token(user.id),
        }), 200
    
    except Exception as error:
        return jsonify({"message": "Server error during login", "error": str(error)}), 500


@auth_bp.route("/me", methods=["GET"])
def get_me():
    """Get current logged-in user"""
    from flask_jwt_extended import get_jwt_identity
    
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({"message": "User not found"}), 404
        
        return jsonify({"user": user.to_dict()}), 200
    
    except Exception as error:
        return jsonify({"message": "Error fetching user", "error": str(error)}), 500
