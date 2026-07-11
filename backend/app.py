"""
Main Flask application entry point
"""
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import models and blueprints
from config import Config
from models import db, Product
from auth import auth_bp
from products import products_bp
from cart import cart_bp

# Create Flask app
app = Flask(__name__)
app.config.from_object(Config)

# Initialize extensions
db.init_app(app)
CORS(app)
jwt = JWTManager(app)

# Register blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(products_bp)
app.register_blueprint(cart_bp)


# ─── Root Route ─────────────────────────────────────────────
@app.route("/", methods=["GET"])
def root():
    """Welcome endpoint"""
    return jsonify({"message": "Welcome to Pindi Exclusive API 🛍️"}), 200


# ─── Global Error Handler ───────────────────────────────────
@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({"message": "Endpoint not found"}), 404


@app.errorhandler(500)
def server_error(error):
    """Handle 500 errors"""
    return jsonify({"message": "Internal server error"}), 500


@app.errorhandler(401)
def unauthorized(error):
    """Handle 401 errors"""
    return jsonify({"message": "Unauthorized"}), 401


# ─── Database Setup ─────────────────────────────────────────
with app.app_context():
    try:
        db.create_all()
        print("✅ Database tables created successfully")
    except Exception as e:
        print(f"❌ Database setup error: {e}")


if __name__ == "__main__":
    PORT = int(os.getenv("PORT", 5000))
    print(f"🚀 Starting Flask server on http://localhost:{PORT}")
    app.run(debug=True, host="0.0.0.0", port=PORT)
