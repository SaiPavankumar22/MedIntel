# MedIntel - Medical Records Management System

MedIntel is a comprehensive medical records management system that helps healthcare providers and patients manage medical records, analyze reports, and access medical information efficiently.

## 🌟 Features

- **User Authentication**
  - Secure signup and login system
  - Password hashing for security
  - Session management

- **Medical Records Management**
  - Upload and store medical reports (PDF, images)
  - Organize records by hospital and category
  - View and download medical files
  - Categorize reports automatically

- **AI-Powered Analysis**
  - Automatic categorization of medical reports
  - Extraction of key medical values
  - Integration with LLM for intelligent analysis
  - Support for multiple report types:
    - Blood Tests
    - Urine Tests
    - ECG Reports
    - Diabetes Reports
    - Cholesterol Reports
    - Cardiology Reports

- **Data Visualization**
  - Integration with Google Sheets for data storage
  - Visual representation of medical data
  - Trend analysis and historical data tracking

- **Medical Information System**
  - Disease information based on symptoms
  - Medicine information and dosage
  - Precautions for various diseases
  - Research tools and resources

## 🛠️ Technical Stack

- **Backend**
  - Python 3.x
  - Flask (Web Framework)
  - MongoDB (Database)
  - PyMongo (MongoDB Python Driver)
  - LangChain (LLM Integration)
  - Groq API (Language Model)
  - Google Sheets API

- **Frontend**
  - HTML5
  - CSS3
  - JavaScript
  - Bootstrap (UI Framework)

- **Additional Tools**
  - PyTesseract (OCR for report analysis)
  - PyMuPDF (PDF processing)
  - Pandas (Data analysis)
  - NumPy (Numerical computations)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Python 3.x
- MongoDB
- Tesseract OCR
- Git

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SaiPavankumar22/MedIntel.git
   cd MedIntel
   ```

2. **Create and activate virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   Create a `.env` file in the root directory with:
   ```
   FLASK_SECRET_KEY=your_secret_key
   GROQ_API_KEY=your_groq_api_key
   MONGO_URI=mongodb://localhost:27017/med
   ```

5. **Set up Google Sheets API**
   - Create a Google Cloud Project
   - Enable Google Sheets API
   - Create service account credentials
   - Download the JSON key file
   - Place it in the specified path in the code

6. **Initialize MongoDB**
   - Ensure MongoDB is running
   - The application will create necessary collections automatically

## 🔧 Configuration

1. **Google Sheets Setup**
   - Update `SHEET_IDS` in `app.py` with your Google Sheet IDs
   - Configure sheet names and columns according to your needs

2. **LLM Configuration**
   - Update the Groq API key in the environment variables
   - Configure model parameters in `app.py`

3. **File Upload Configuration**
   - The upload folder is set to 'uploads/'
   - Ensure the directory has proper write permissions

## 🏃‍♂️ Running the Application

1. **Start MongoDB**
   ```bash
   mongod
   ```

2. **Run the Flask application**
   ```bash
   python app.py
   ```

3. **Access the application**
   - Open your browser and go to `http://localhost:5000`

## 📁 Project Structure

```
MedIntel/
├── app.py                  # Main application file
├── requirements.txt        # Python dependencies
├── .env                    # Environment variables
├── uploads/               # Directory for uploaded files
├── static/                # Static files
│   ├── css/              # CSS stylesheets
│   ├── js/               # JavaScript files
│   └── images/           # Image assets
└── templates/             # HTML templates
    ├── accounts.html
    ├── dashboard.html
    ├── directory.html
    ├── landing.html
    ├── login.html
    ├── medical_records.html
    ├── research.html
    └── signup.html
```

## 🔐 Security Considerations

- All passwords are hashed using PBKDF2 with SHA256
- API keys are stored in environment variables
- File uploads are validated for type and size
- Session management for user authentication
- Secure file storage and access control

## 📊 Data Flow

1. **Report Upload**
   - User uploads medical report
   - System processes the file (OCR for PDF/images)
   - LLM analyzes and categorizes the report
   - Data is stored in MongoDB and Google Sheets

2. **Data Analysis**
   - System extracts key medical values
   - Data is visualized in the dashboard
   - Historical trends are analyzed
   - Reports are categorized automatically

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

- **Devisetti Sai Pavan Kumar**
- GitHub: [@SaiPavankumar22](https://github.com/SaiPavankumar22)

## 🙏 Acknowledgments

- Flask community for the amazing web framework
- MongoDB for the database solution
- Groq for the LLM API
- Google for the Sheets API
- All contributors and users of the project 