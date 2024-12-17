from flask import Flask, render_template, request, jsonify, redirect, url_for, session, send_file
from flask_pymongo import PyMongo
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import os
from bson.objectid import ObjectId

# Initialize Flask app
app = Flask(__name__)
app.secret_key = os.getenv('FLASK_SECRET_KEY', 'your_default_secret_key')  # Use environment variable for production

# Connect to MongoDB using Flask-PyMongo
app.config["MONGO_URI"] = "mongodb://localhost:27017/MedIntel"  # Ensure this matches your MongoDB setup
mongo = PyMongo(app)

# Create upload directory
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/medical_history')
def medical_history():
    # Fetch uploaded records from MongoDB
    records = mongo.db.medical_records.find()
    return render_template('medical_history.html', records=records)

@app.route('/upload_history', methods=['POST'])
def upload_history():
    try:
        # Get form data
        file = request.files['file']
        date = request.form['date']
        hospital = request.form['hospital']

        if not file or not date or not hospital:
            return jsonify({"message": "All fields are required."}), 400

        # Save file to the upload directory
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        # Insert record into MongoDB
        record = {
            "filename": filename,
            "filepath": filepath,
            "date": date,
            "hospital": hospital
        }
        record_id = mongo.db.medical_records.insert_one(record).inserted_id

        return jsonify({"message": "File uploaded successfully!", "record_id": str(record_id)}), 200
    except Exception as e:
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500

@app.route('/view_file/<record_id>', methods=['GET'])
def view_file(record_id):
    try:
        # Fetch record from MongoDB
        record = mongo.db.medical_records.find_one({"_id": ObjectId(record_id)})
        if not record:
            return jsonify({"message": "File not found."}), 404

        return send_file(record['filepath'], as_attachment=True)
    except Exception as e:
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500

@app.route('/delete_record/<record_id>', methods=['DELETE'])
def delete_record(record_id):
    try:
        # Fetch and delete record from MongoDB
        record = mongo.db.medical_records.find_one_and_delete({"_id": ObjectId(record_id)})
        if not record:
            return jsonify({"message": "Record not found."}), 404

        # Delete file from disk
        if os.path.exists(record['filepath']):
            os.remove(record['filepath'])

        return jsonify({"message": "Record deleted successfully."}), 200
    except Exception as e:
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500
    
@app.route('/signup', methods=['GET'])
def signup_page():
    return render_template('signup.html')


@app.route('/signin', methods=['GET'])
def signin_page():
    return render_template('signin.html')


@app.route('/signup', methods=['POST'])
def signup():
    try:
        # Get data from the signup form
        data = request.get_json()
        username = data['username']
        email = data['email']
        password = data['password']
        
        # Check if the email already exists in the database
        existing_user = mongo.db.login.find_one({'email': email})
        if existing_user:
            return jsonify({"message": "Email already exists"}), 400

        # Hash the password for security
        hashed_password = generate_password_hash(password, method='pbkdf2:sha256', salt_length=8)


        # Insert the new user into the database
        new_user = {
            'username': username,
            'email': email,
            'password': hashed_password
        }
        mongo.db.login.insert_one(new_user)

        return jsonify({"message": "Signup successful"}), 200
    except Exception as e:
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500


@app.route('/login', methods=['POST'])
def login():
    try:
        # Get email and password from the form
        data = request.get_json()
        email = data['email']
        password = data['password']

        # Query MongoDB for the user
        user = mongo.db.login.find_one({'email': email})

        if user and check_password_hash(user['password'], password):
            # Successful login, store email in session
            session['email'] = email
            return jsonify({"message": "Login successful"}), 200
        else:
            # Invalid login
            return jsonify({"message": "Invalid email or password"}), 401
    except Exception as e:
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500


@app.route('/dashboard')
def dashboard():
    if 'email' not in session:
        return redirect(url_for('signin_page'))
    return render_template('dashboard.html')


@app.route('/research')
def research():
    return render_template('research.html')

@app.route('/search_research', methods=['GET'])
def search_research():
    # Add logic to process symptoms and return results
    symptoms = request.args.get('symptoms')
    return jsonify({"message": f"Results for symptoms: {symptoms}"}), 200

@app.route('/specialists')
def specialists():
    return render_template('specialists.html')

@app.route('/find_specialists', methods=['GET'])
def find_specialists():
    # Add logic to find specialists for a given condition
    condition = request.args.get('condition')
    return jsonify({"message": f"Specialists for condition: {condition}"}), 200

@app.route('/prescriptions')
def prescriptions():
    return render_template('prescriptions.html')

@app.route('/analyze_prescription', methods=['POST'])
def analyze_prescription():
    # Add logic to analyze prescription details
    prescription = request.form.get('prescription')
    return jsonify({"message": f"Analysis for prescription: {prescription}"}), 200

@app.route('/accounts')
def accounts():
    return render_template('accounts.html')



@app.route('/logout')
def logout():
    session.pop('email', None)
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True)
