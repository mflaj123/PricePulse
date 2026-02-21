import os
import datetime
import json
import re
from functools import wraps
from dotenv import load_dotenv
from flask import Flask, request, jsonify, redirect, url_for, session
from flask_cors import CORS
from google.cloud import bigquery, storage
from google.oauth2.credentials import Credentials
from authlib.integrations.flask_client import OAuth
from werkzeug.middleware.proxy_fix import ProxyFix

# Load environment variables
load_dotenv()                   

app = Flask(__name__)

# --- Tell Flask it is behind a secure Cloud Run Proxy ---
# Required for Cloud Run to trust HTTPS headers from the Google Load Balancer
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

# --- SECURITY & COOKIE CONFIGURATION ---
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "supersecretkey")

# ULTIMATE CORS FIX: Use flask-cors with a broad regex for AI Studio/Cloud Run
# DO NOT use @app.after_request manually with this, or you will get duplicate headers
cors_pattern = re.compile(r".*")
CORS(app, supports_credentials=True, origins=cors_pattern)

# Cookie settings for cross-site access in iframes
app.config['SESSION_COOKIE_SAMESITE'] = 'None'
app.config['SESSION_COOKIE_SECURE'] = True

app.config["GOOGLE_CLIENT_ID"] = os.environ.get("GOOGLE_CLIENT_ID")
app.config["GOOGLE_CLIENT_SECRET"] = os.environ.get("GOOGLE_CLIENT_SECRET")
app.config["GOOGLE_DISCOVERY_URL"] = "https://accounts.google.com/.well-known/openid-configuration"

# --- OAUTH SETUP ---
oauth = OAuth(app)
google = oauth.register(
    name="google",
    client_id=app.config["GOOGLE_CLIENT_ID"],
    client_secret=app.config["GOOGLE_CLIENT_SECRET"],
    server_metadata_url=app.config["GOOGLE_DISCOVERY_URL"],
    # Scope includes cloud-platform.read-only to enable project listing
    client_kwargs={"scope": "openid email profile https://www.googleapis.com/auth/bigquery https://www.googleapis.com/auth/cloud-platform.read-only"},
)

# --- GCP SYSTEM CONFIGURATION ---
PROJECT_ID = "glo-tech-dev-max" 
BQ_CLIENT = bigquery.Client(project=PROJECT_ID)       
STORAGE_CLIENT = storage.Client(project=PROJECT_ID)   
SEARCH_API_KEY = os.environ.get("SEARCH_API_KEY")

# --- USER-AWARE BIGQUERY CLIENT HELPER ---
def get_user_bq_client():
    """Creates a BigQuery client acting specifically as the logged-in user."""
    token = session.get("access_token")
    if not token:
        return bigquery.Client(project=PROJECT_ID)
    creds = Credentials(token)
    return bigquery.Client(project=PROJECT_ID, credentials=creds)

# --- SECURITY WRAPPER ---
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # 1. Instantly approve CORS preflight checks!
        if request.method == 'OPTIONS':
            return jsonify({}), 200
            
        # 2. Check for login
        if "user" not in session:
            # Return 401 for API routes to allow React to handle the error
            api_routes = ['/me', '/list_projects', '/list_datasets', '/list_tables_in_dataset', '/get_table_schema', '/setup_pipeline']
            if request.path in api_routes:
                 return jsonify({"status": "error", "message": "Unauthorized"}), 401
            return redirect(url_for("login"))
            
        return f(*args, **kwargs)
    return decorated_function

# --- AUTHENTICATION ROUTES ---
@app.route('/login')
def login():
    frontend_redirect_uri = request.args.get('redirect_uri')
    if frontend_redirect_uri:
        session['frontend_redirect_uri'] = frontend_redirect_uri

    if 'localhost' in request.host or '127.0.0.1' in request.host:
        redirect_uri = 'http://127.0.0.1:8080/oauth2callback'
    else:
        redirect_uri = 'https://shopping-backend-635452941137.europe-west2.run.app/oauth2callback'
        
    return google.authorize_redirect(redirect_uri)

@app.route("/oauth2callback")
def authorize():
    token = google.authorize_access_token()
    session["user"] = token["userinfo"]
    session["access_token"] = token.get("access_token")
    
    frontend_url = session.pop('frontend_redirect_uri', None)
    if not frontend_url:
        frontend_url = 'https://pricepulse-enterprise-price-comparison-635452941137.us-west1.run.app'
    
    separator = '&' if '?' in frontend_url else '?'
    return redirect(f"{frontend_url}{separator}loggedIn=true")

@app.route("/logout")
def logout():
    session.clear()
    return redirect("/")

@app.route("/me", methods=['GET', 'OPTIONS'])
@login_required
def me():
    user = session.get("user")
    return jsonify({
        "id": user.get("sub"),
        "name": user.get("name"),
        "email": user.get("email"),
        "picture": user.get("picture")
    }), 200

# --- HIERARCHICAL BIGQUERY SEARCH ENDPOINTS ---

@app.route('/list_projects', methods=['GET', 'OPTIONS'])
@login_required
def list_projects():
    try:
        user_bq_client = get_user_bq_client()
        projects = list(user_bq_client.list_projects())
        project_list = [{"projectId": p.project_id, "friendlyName": p.friendly_name or p.project_id} for p in projects]
        return jsonify({"projects": project_list}), 200
    except Exception as e:
        print(f"Error listing projects: {e}")
        return jsonify({"projects": [{"projectId": PROJECT_ID, "friendlyName": "Fallback (Permission Error)"}]}), 200

@app.route('/list_datasets', methods=['GET', 'OPTIONS'])
@login_required
def list_datasets():
    project_id = request.args.get('projectId', PROJECT_ID)
    try:
        user_bq_client = get_user_bq_client()
        datasets = list(user_bq_client.list_datasets(project=project_id))
        dataset_list = [{"datasetId": d.dataset_id, "projectId": d.project} for d in datasets]
        return jsonify({"datasets": dataset_list}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/list_tables_in_dataset', methods=['GET', 'OPTIONS'])
@login_required
def list_tables_in_dataset():
    project_id = request.args.get('projectId')
    dataset_id = request.args.get('datasetId')
    if not project_id or not dataset_id:
        return jsonify({"status": "error", "message": "Missing projectId or datasetId"}), 400
    try:
        user_bq_client = get_user_bq_client()
        dataset_ref = f"{project_id}.{dataset_id}"
        tables = list(user_bq_client.list_tables(dataset_ref))
        table_list = [{"tableId": t.table_id, "type": t.table_type} for t in tables]
        return jsonify({"tables": table_list}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/get_table_schema', methods=['GET', 'OPTIONS'])
@login_required
def get_table_schema():
    project_id = request.args.get('projectId')
    dataset_id = request.args.get('datasetId')
    table_id = request.args.get('tableId')
    if not all([project_id, dataset_id, table_id]):
        return jsonify({"status": "error", "message": "Missing parameters"}), 400
    try:
        user_bq_client = get_user_bq_client()
        table_ref = f"{project_id}.{dataset_id}.{table_id}"
        table = user_bq_client.get_table(table_ref)
        schema_names = [field.name for field in table.schema]
        return jsonify({"schema": schema_names}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/setup_pipeline', methods=['POST', 'OPTIONS'])
@login_required
def setup_pipeline():
    try:
        data = request.get_json()
        client_name = data.get('clientName')
        dataset_id = f"{re.sub(r'[^a-zA-Z0-9]', '_', client_name.lower())}_dataset"
        
        # Insert config into master control table using SYSTEM client
        BQ_CLIENT.insert_rows_json(f"{PROJECT_ID}.app_control.search_configs", [{
            "client_name": client_name,
            "gcp_dataset_id": dataset_id,
            "frequency": data.get('frequency'),
            "next_run_at": datetime.datetime.utcnow().isoformat(),
            "search_params": json.dumps({"domain": data.get('domain'), "gl": "uk"})
        }])
        return jsonify({"status": "success", "dataset": dataset_id}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)