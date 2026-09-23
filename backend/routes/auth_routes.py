"""
Authentication routes for GLOBAL-SETU Platform
"""
from flask import Blueprint, request, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash
from database.db import get_db

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

VALID_ROLES = [
    'Administrator',
    'Logistics Operator',
    'Field Officer',
    'Disaster Management Officer',
    'Viewer'
]

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    username = data.get('username', '').strip().lower()
    password = data.get('password', '')
    confirm_password = data.get('confirm_password', '')
    role = data.get('role', 'Viewer')

    if not name or not email or not username or not password:
        return jsonify({'error': 'All fields are required.'}), 400

    if password != confirm_password:
        return jsonify({'error': 'Password and Confirm Password do not match.'}), 400

    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters.'}), 400

    if role not in VALID_ROLES:
        role = 'Viewer'

    conn = get_db()
    cursor = conn.cursor()

    # Check existing user
    cursor.execute("SELECT id FROM users WHERE username = ? OR email = ?", (username, email))
    if cursor.fetchone():
        conn.close()
        return jsonify({'error': 'Username or Email is already registered.'}), 409

    pwd_hash = generate_password_hash(password)
    cursor.execute(
        "INSERT INTO users (name, email, username, password_hash, role) VALUES (?, ?, ?, ?, ?)",
        (name, email, username, pwd_hash, role)
    )
    user_id = cursor.lastrowid
    conn.commit()
    conn.close()

    user_info = {
        'id': user_id,
        'name': name,
        'email': email,
        'username': username,
        'role': role
    }
    session['user'] = user_info

    return jsonify({
        'message': 'Registration successful',
        'user': user_info
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    username = data.get('username', '').strip().lower()
    password = data.get('password', '')

    if not username or not password:
        return jsonify({'error': 'Username and password required.'}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE username = ? OR email = ?", (username, username))
    user_row = cursor.fetchone()
    conn.close()

    if not user_row or not check_password_hash(user_row['password_hash'], password):
        return jsonify({'error': 'Invalid username or password.'}), 401

    user_info = {
        'id': user_row['id'],
        'name': user_row['name'],
        'email': user_row['email'],
        'username': user_row['username'],
        'role': user_row['role']
    }
    session['user'] = user_info

    return jsonify({
        'message': 'Login successful',
        'user': user_info
    }), 200

@auth_bp.route('/me', methods=['GET'])
def get_current_user():
    user = session.get('user')
    if not user:
        # Default guest / default demo user if not logged in
        return jsonify({'authenticated': False, 'user': None}), 200
    return jsonify({'authenticated': True, 'user': user}), 200

@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.pop('user', None)
    return jsonify({'message': 'Logged out successfully'}), 200
