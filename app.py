from flask import Flask, render_template, request, jsonify, redirect, url_for, session, send_file
from flask_pymongo import PyMongo
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import os
from flask_cors import CORS
from PIL import Image
import pytesseract
import fitz  # PyMuPDF
import gspread
from google.oauth2.service_account import Credentials
from bson.objectid import ObjectId
import io
from io import BytesIO
import json
from langchain_groq import ChatGroq
import difflib
import numpy as np
import pandas as pd  # Import pandas

app = Flask(__name__)
app.secret_key = os.getenv('FLASK_SECRET_KEY', 'your_default_secret_key')
app.config["MONGO_URI"] = os.getenv('MONGO_URI', 'mongodb://localhost:27017/med')
mongo = PyMongo(app)

# Directories
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
# Ensure MongoDB collections exist
mongo.db.directories.create_index("name", unique=True)

# LLM setup
llm = ChatGroq(
    temperature=0.6,
    groq_api_key=os.getenv('GROQ_API_KEY'),
    model_name="llama-3.3-70b-versatile"
)

# Google Sheets setup
SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
SERVICE_ACCOUNT_FILE = os.getenv('GOOGLE_SERVICE_ACCOUNT_FILE')

credentials = Credentials.from_service_account_file(SERVICE_ACCOUNT_FILE, scopes=SCOPES)
client = gspread.authorize(credentials)

# Google Sheet IDs
SHEET_IDS = {
    "Blood Test": os.getenv('BLOOD_TEST_SHEET_ID'),
    "Urine Test": os.getenv('URINE_TEST_SHEET_ID'),
    "ECG": os.getenv('ECG_SHEET_ID'),
    "Diabetes": os.getenv('DIABETES_SHEET_ID'),
    "Cholesterol": os.getenv('CHOLESTEROL_SHEET_ID'),
    "Cardiology": os.getenv('CARDIOLOGY_SHEET_ID')
}
sheets = {key: client.open_by_key(sheet_id).sheet1 for key, sheet_id in SHEET_IDS.items()}


@app.route('/')
def home():
    return render_template('landing.html')

@app.route('/signup', methods=['GET'])
def signup_page():
    return render_template('signup.html')


@app.route('/login', methods=['GET'])
def signin_page():
    return render_template('login.html')

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
    return render_template('dashboard.html')



@app.route('/upload_file/<directory_id>/<folder_name>', methods=['POST'])
def upload_file(directory_id, folder_name):
    if 'file' not in request.files or 'test_date' not in request.form:
        return jsonify({"error": "File or test date not provided"}), 400

    file = request.files['file']
    test_date = request.form['test_date']

    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file:
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)

        # Process only PDF and image files
        if filename.lower().endswith('.pdf'):
            try:
                doc = fitz.open(file_path)
                text = ""
                for page_num in range(len(doc)):
                    page = doc.load_page(page_num)
                    pix = page.get_pixmap()
                    img = Image.open(io.BytesIO(pix.tobytes("png")))
                    text += pytesseract.image_to_string(img)
            except Exception as e:
                return jsonify({'error': f"Error processing PDF: {str(e)}"}), 500

        elif filename.lower().endswith(('.png', '.jpg', '.jpeg')):
            try:
                text = pytesseract.image_to_string(Image.open(file_path))
            except Exception as e:
                return jsonify({'error': f"Error processing image: {str(e)}"}), 500

        else:
            return jsonify({"error": "Unsupported file type"}), 400

        # LLM Processing
        prompt = (
            f"{text}\n\n"
            "Categorize the given medical report into one of the following categories: Blood Test, Urine Test, ECG, Diabetes, Cholesterol, or Cardiology. "
            "Then, extract the specific values based on the identified report type.\n\n"
            "Report types and corresponding values to extract:\n"
            "- Blood Test: Hemoglobin, White Blood Cells, Platelets, Cholesterol, Blood Sugar, Date\n"
            "- Urine Test: pH, Protein, Glucose, Date\n"
            "- ECG: Heart Rate, PR Interval, ST Segment Changes, Date\n"
            "- Diabetes: Blood Sugar, Postprandial Blood Sugar, Date\n"
            "- Cholesterol: Total Cholesterol, HDL, LDL, Date\n"
            "- Cardiology: Ejection Fraction, Blood Pressure, Date\n\n"
            "Ensure the output is strictly in JSON format, adhering to the following rules:\n"
            "- Use double quotes (\") for all strings.\n"
            "- Use null for missing values.\n"
            "- Format the output as a single JSON array like so:\n"
            "[\"Report Type\", \"Value 1\", \"Value 2\", \"Value 3\", ...]\n"
            "For example:\n"
            "[\"Blood Test\", 15, 5500, 11550000, null, null, \"12-Aug-2011\"]\n\n"
            "Provide only the JSON-formatted list as the output, with no additional text or explanations."
        )
        response = llm.invoke(prompt)
        extracted_data = response.content.strip()
        print(f"LLM Response (raw): {extracted_data}")

        try:
            # Attempt to parse LLM response
            extracted_list = json.loads(extracted_data)

            # Validate extracted list
            if not isinstance(extracted_list, list) or len(extracted_list) < 2:
                raise ValueError("Response is not a valid list or is too short.")

            # Modify the first and last elements
            extracted_list[0] = f'"{extracted_list[0]}"'  # Enclose the first element in double quotes
            extracted_list = [
                "null" if item is None else item
                for item in extracted_list
            ]

            print(f"Processed Extracted Data: {extracted_list}")

        except (json.JSONDecodeError, ValueError) as e:
            return jsonify({"error": f"Invalid LLM response format: {str(e)}"}), 400

        # Save to Google Sheets
        report_type = extracted_list[0].strip('"')  # Remove quotes for lookup
        if report_type in sheets:
            sheets[report_type].append_row(extracted_list[1:])
        else:
            return jsonify({"error": "Unsupported report type"}), 400

        # Save file data in MongoDB
        file_data = {
            "filename": file.filename,
            "content": file.read(),
            "test_date": test_date
        }
        mongo.db.directories.update_one(
            {"_id": ObjectId(directory_id)},
            {"$push": {f"folders.{folder_name}": file_data}}
        )

        return redirect(url_for('dashboard'))

    return jsonify({"error": "Unexpected error"}), 500


@app.route('/create_directory', methods=['POST'])
def create_directory():
    hospital_name = request.form['hospital_name']
    directory = {
        "name": hospital_name,
        "folders": {
            "op": [],
            "prescription": [],
            "medical_report": []
        }
    }
    try:
        mongo.db.directories.insert_one(directory)
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    return redirect(url_for('index'))

@app.route('/open_directory/<directory_id>')
def open_directory(directory_id):
    directory = mongo.db.directories.find_one({"_id": ObjectId(directory_id)})
    return render_template('directory.html', directory=directory)


@app.route('/view_file/<directory_id>/<folder_name>/<filename>')
def view_file(directory_id, folder_name, filename):
    directory = mongo.db.directories.find_one({"_id": ObjectId(directory_id)})
    files = directory['folders'].get(folder_name, [])
    for file in files:
        if file['filename'] == filename:
            mime_type = "application/pdf" if filename.endswith(".pdf") else "image/png"
            return send_file(BytesIO(file['content']), download_name=file['filename'], mimetype=mime_type, as_attachment=False)
    return "File not found", 404


@app.route('/medical_records')
def index():
    directories = list(mongo.db.directories.find())
    return render_template('medical_records.html', directories=directories)


@app.route('/data', methods=['GET'])
def get_data():
    data = {}
    for report_type, sheet in sheets.items():
        records = sheet.get_all_records()
        df = pd.DataFrame(records)
        data[report_type] = {
            "values": df.to_dict(orient='records'),
            "date_counts": df['Date'].value_counts().to_dict() if 'Date' in df else {}
        }
    return jsonify(data)

@app.route('/account')
def account():
    return render_template('accounts.html')

@app.route('/research')
def research():
    return render_template('research.html')


LLAMA_API_KEY1 = os.getenv('GROQ_API_KEY_2')
llm1 = ChatGroq(api_key=LLAMA_API_KEY1)

@app.route('/get_diseases', methods=['GET'])
def get_diseases():
    symptoms = request.args.get('symptoms', '').strip()
    if not symptoms:
        return jsonify({'error': 'No symptoms provided'}), 400

    prompt = f"Given these symptoms: {symptoms}, only list 4 the disease names, one per line, without any additional explanations or notes."
    
    try:
        response = llm1.invoke(prompt)
        diseases = response.content.strip().split("\n")
        return jsonify({'diseases': diseases}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/medicine', methods=['GET'])
def get_medicine_info():
    medicine_name = request.args.get('medicine_name', '').strip()
    print(f"Received medicine_name: {medicine_name}")  # Debugging output

    if not medicine_name:
        return jsonify({'error': 'No medicine name provided'}), 400

    prompt = f"For the medicine '{medicine_name}', provide its uses and recommended dosages."
    
    try:
        response = llm1.invoke(prompt)
        result = response.content.strip()
        return jsonify({'medicine_info': result}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/get_precautions', methods=['GET'])
def get_precautions():
    disease_name = request.args.get('disease', '').strip()
    if not disease_name:
        return jsonify({'error': 'No disease name provided'}), 400

    prompt = f"""Given the disease "{disease_name}", list exactly 4 specific precautions to prevent or manage it. 
    Provide them as a numbered list without any additional explanation or notes."""

    try:
        response = llm1.invoke(prompt)
        precautions = response.content.strip().split("\n")  # Splitting numbered list
        return jsonify({'disease': disease_name, 'precautions': precautions}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
