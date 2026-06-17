# BQ Pulse: BigQuery Release Notes & Social Share

BQ Pulse is a premium, lightweight web application built to monitor Google Cloud BigQuery release updates and dynamically compose updates to share directly on Twitter/X.

## 🚀 Features

*   **Real-time RSS Aggregation**: Fetches current release notes directly from the official Google Cloud feeds.
*   **Intelligent Auto-Categorization**: Automatically parses and badges updates into categories (Features, Fixes, Deprecations, Changes) based on content analysis.
*   **Instant Tweet Composer**: Drafts a social update card including title, cleaned excerpt, relevant hashtags, and resource link.
*   **Character Limits & Safety**: Real-time counter validates tweet length to ensure it falls within the 280-character limit.
*   **Unified Search & Filter**: Instant, client-side search query matching and category tab switching.
*   **Pleasing Light UI**: Clean, responsive layout designed with interactive hover transitions, subtle shadows, and modern typography.

## 🛠️ Architecture

*   **Backend**: Python 3.11 with Flask, `requests` for fetching raw XML, and `feedparser` for structured feed node extraction.
*   **Frontend**: Single Page Application using standard HTML5, custom CSS3, and ES6 JavaScript.

## 📂 Project Directory Structure

```
agy-cli-projects/
├── venv/                       # Python Virtual Environment
├── app.py                      # Flask Server Main Entry Point
├── static/
│   ├── css/
│   │   └── styles.css          # Premium Light-Theme styles
│   └── js/
│       └── app.js              # State tracking, filtering, and Twitter intents
├── templates/
│   └── index.html              # Core Layout Structure
└── .gitignore                  # Development environment exclusions
```

## ⚙️ Setup & Running Locally

### Prerequisites
*   Python 3.11+
*   Git

### 1. Clone the Repository
```bash
git clone https://github.com/milar55/Rudmila-event-talks-app.git
cd Rudmila-event-talks-app
```

### 2. Set Up Virtual Environment
Create and activate the virtual environment:
```bash
python -m venv venv
venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install Flask requests feedparser
```

### 4. Run the Application
Start the Flask development server:
```bash
python app.py
```

Open your browser and navigate to: **[http://127.0.0.1:5050](http://127.0.0.1:5050)**.

## 🤝 Contribution
Contributions are welcome! Please make sure to update tests and documentation as appropriate.
