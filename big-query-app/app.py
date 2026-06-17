import os
import requests
import feedparser
from flask import Flask, render_template, jsonify

app = Flask(__name__)

FEED_URL = "https://docs.cloud.google.com/feeds/bigquery-release-notes.xml"

def clean_html(text):
    # If we need clean text for tweets
    import re
    clean = re.compile('<.*?>')
    # Replace multiple spaces/newlines with a single space
    cleaned = re.sub(clean, '', text)
    return ' '.join(cleaned.split())

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/release-notes")
def get_release_notes():
    try:
        # Fetch the feed
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        response = requests.get(FEED_URL, headers=headers, timeout=10)
        response.raise_for_status()
        
        # Parse feed
        feed = feedparser.parse(response.text)
        
        notes = []
        for entry in feed.entries:
            title = entry.get("title", "BigQuery Update")
            published = entry.get("published", entry.get("updated", ""))
            
            # Content extraction
            content_val = ""
            if "content" in entry:
                content_val = entry["content"][0]["value"]
            elif "summary" in entry:
                content_val = entry["summary"]
                
            link = entry.get("link", "")
            
            # Categories based on tags/content
            category = "General"
            lower_title = title.lower()
            lower_content = content_val.lower()
            
            if "feature" in lower_title or "feature" in lower_content or "new" in lower_title or "introducing" in lower_title:
                category = "Feature"
            elif "deprecated" in lower_title or "deprecated" in lower_content or "deprecation" in lower_title:
                category = "Deprecation"
            elif "bug" in lower_title or "fix" in lower_title or "resolve" in lower_content or "fixed" in lower_title:
                category = "Fix"
            elif "change" in lower_title or "update" in lower_title:
                category = "Change"

            plain = clean_html(content_val)
            
            notes.append({
                "id": entry.get("id", link),
                "title": title,
                "published": published,
                "content": content_val,
                "plain_text": plain,
                "link": link,
                "category": category
            })
            
        return jsonify({"success": True, "notes": notes})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5050)
