"""
Database setup script - Creates the PostgreSQL database if it doesn't exist
"""
import psycopg2
from psycopg2 import sql
import os
from dotenv import load_dotenv

load_dotenv()

# Parse connection details
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:12345@localhost:5432/pindi_exclusive")

# Extract connection parameters
# Format: postgresql://user:password@host:port/dbname
parts = DATABASE_URL.replace("postgresql://", "").split("@")
user_pass = parts[0].split(":")
user = user_pass[0]
password = user_pass[1]

host_port_db = parts[1].split("/")
host_port = host_port_db[0].split(":")
host = host_port[0]
port = host_port[1]
dbname = host_port_db[1]

print(f"🔧 Setting up database: {dbname}")
print(f"📍 Connecting to {host}:{port} as user '{user}'...")

try:
    # Connect to default 'postgres' database to create new database
    conn = psycopg2.connect(
        host=host,
        port=port,
        user=user,
        password=password,
        database="postgres"
    )
    conn.autocommit = True
    cursor = conn.cursor()
    
    # Check if database already exists
    cursor.execute(f"SELECT 1 FROM pg_database WHERE datname = '{dbname}'")
    exists = cursor.fetchone()
    
    if exists:
        print(f"✅ Database '{dbname}' already exists")
    else:
        # Create the database
        cursor.execute(sql.SQL("CREATE DATABASE {}").format(sql.Identifier(dbname)))
        print(f"✅ Database '{dbname}' created successfully")
    
    cursor.close()
    conn.close()
    
    print("\n🚀 You can now start your Flask app with: python app.py")
    
except Exception as e:
    print(f"❌ Error: {e}")
    print(f"\nMake sure PostgreSQL is running on {host}:{port}")
