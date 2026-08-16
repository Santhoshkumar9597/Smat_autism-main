# Installation and Setup Instructions

## New Features Added

### 1. Assessment History Tracking
- Assessments are now stored in SQL Server database
- Track multiple predictions over time for each user
- Query and view all past assessments

### 2. Export Reports
- Export individual assessments as PDF or Excel
- Export all assessments as a single Excel file
- Comparison reports between two assessments

### 3. Multi-Language Support
- English
- Tamil
- Hindi
- Language switching on the fly
- All UI strings are translatable

## Installation Steps

### 1. Install Required Python Packages

```bash
pip install flask-sqlalchemy pyodbc reportlab openpyxl
```

### 2. SQL Server Setup

#### Option A: Using Local SQL Server (with Express Edition)

1. Download and install [SQL Server Express](https://www.microsoft.com/en-us/sql-server/sql-server-downloads)
2. Install [SQL Server Management Studio (SSMS)](https://docs.microsoft.com/en-us/sql/ssms/download-sql-server-management-studio-ssms)
3. Create a new database called `autism_assessment`:

```sql
CREATE DATABASE autism_assessment;
GO

USE autism_assessment;
GO
```

4. The tables will be created automatically when the Flask app first runs.

#### Option B: Using SQL Server in Docker

```bash
docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=YourPassword123!" -p 1433:1433 --name mssql-server mcr.microsoft.com/mssql/server:2019-latest
```

Then create the database:

```sql
sqlcmd -S localhost -U sa -P YourPassword123!
> CREATE DATABASE autism_assessment;
> GO
```

### 3. Update Flask Configuration

Edit `app_fixed.py` and update the database URI:

```python
# For local SQL Server
app.config['SQLALCHEMY_DATABASE_URI'] = 'mssql+pyodbc://@localhost/autism_assessment?driver=ODBC+Driver+17+for+SQL+Server'

# Or with authentication
app.config['SQLALCHEMY_DATABASE_URI'] = 'mssql+pyodbc://username:password@localhost/autism_assessment?driver=ODBC+Driver+17+for+SQL+Server'

# Or with Docker
app.config['SQLALCHEMY_DATABASE_URI'] = 'mssql+pyodbc://sa:YourPassword123!@localhost/autism_assessment?driver=ODBC+Driver+17+for+SQL+Server'
```

### 4. Run the Application

```bash
python app_fixed.py
```

The tables will be automatically created on first run.

## New Routes

- `/history` - View assessment history for the current user
- `/export/<id>?format=pdf|excel` - Export single assessment
- `/export/all` - Export all assessments as Excel
- `/compare/<a1_id>/<a2_id>` - Compare two assessments
- `/api/language/set/<language>` - Set language preference

## New Files Created

1. **database.py** - Database models and initialization
2. **translations.py** - Multi-language support
3. **export_reports.py** - PDF/Excel export functionality
4. **templates/history.html** - Assessment history view
5. **templates/compare.html** - Comparison view

## Database Schema

### assessment_history Table

| Column | Type | Description |
|--------|------|-------------|
| id | INT (PRIMARY KEY) | Unique assessment ID |
| user_id | VARCHAR(100) | User identifier |
| assessment_date | DATETIME | When assessment was done |
| risk_score | FLOAT | Predicted risk score (0-1) |
| interpretation | VARCHAR(255) | Risk interpretation |
| age_months | INT | Age in months |
| audio_file | VARCHAR(255) | Original audio filename |
| video_file | VARCHAR(255) | Original video filename |
| mfcc_features | TEXT (JSON) | Audio features (MFCC) |
| video_keypoints | TEXT (JSON) | Video keypoints |
| behavioral_features | TEXT (JSON) | Behavioral features |
| recommended_steps | TEXT (JSON) | Recommended next steps |
| notes | TEXT | Additional notes |
| language | VARCHAR(10) | Assessment language |

## Troubleshooting

### ODBC Driver Error
If you get "ODBC Driver 17 for SQL Server not found", install it:

**Windows:**
```bash
choco install sql-server-odbc-driver
```

**macOS:**
```bash
brew tap microsoft/mssql-release https://github.com/Microsoft/homebrew-mssql-release
brew install msodbcsql17
```

**Linux (Ubuntu):**
```bash
sudo apt-get install odbc-mssql
```

### Connection Issues
- Verify SQL Server is running
- Check firewall settings
- Confirm credentials in connection string
- Use SSMS to test connection independently

## Usage

### The app now supports:

1. **Assessment History** - All previous assessments are automatically saved
2. **Multiple Users** - Each session tracks a unique user
3. **Language Selection** - Users can choose their preferred language
4. **Export Capabilities** - Download reports in PDF or Excel format
5. **Comparison Analysis** - Compare two assessments side-by-side with trend analysis

## Future Enhancements

- User authentication (login/registration)
- Cloud storage for assessments
- Advanced analytics and trend analysis
- Mobile app integration
- API for third-party integrations
