import os, tempfile, json, uuid, time
from dotenv import load_dotenv
load_dotenv()  # Load API keys from .env file
from datetime import datetime

# Set FFmpeg path before importing pydub
FFMPEG_BIN = r"C:\Users\dhara\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1-full_build\bin"
os.environ["PATH"] += os.pathsep + FFMPEG_BIN

import openai
from google import genai
from flask import Flask, request, render_template, send_file, jsonify, send_from_directory, make_response, session
from pydub import AudioSegment
import numpy as np
import tensorflow as tf
from feature_utils import extract_mfcc, extract_video_keypoints, compute_behavioral_features
from database import db, AssessmentHistory, init_db
from export_reports import generate_pdf_report, generate_excel_report

# Explicitly set FFmpeg path for pydub
AudioSegment.converter = os.path.join(FFMPEG_BIN, "ffmpeg.exe")
AudioSegment.ffmpeg = os.path.join(FFMPEG_BIN, "ffmpeg.exe")
AudioSegment.ffprobe = os.path.join(FFMPEG_BIN, "ffprobe.exe")

app = Flask(__name__, 
            static_folder="insightful-futures-main/dist", 
            static_url_path="")

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///autism_assessment.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-key-autism-123')

# Initialize database
init_db(app)

# ----------------------------
# Load trained model
# ----------------------------
MODEL_PATH = "autism_model.keras"

def reload_model():
    global model
    try:
        if not os.path.exists(MODEL_PATH):
            print("[WARN] Model file missing. Triggering automated training...")
            import train_model
            train_model.train_baseline_model()
        
        model = tf.keras.models.load_model(MODEL_PATH, compile=False)
        print("[SUCCESS] Model loaded successfully!")
        return True
    except Exception as e:
        print(f"[ERROR] Error loading model: {e}")
        model = None
        return False

# Initial load
reload_model()


# ----------------------------
# Utility Functions
# ----------------------------
def pad_trunc(a, target_shape):
    """Pad or truncate array to target shape"""
    arr = np.zeros(target_shape, dtype=float)
    t = min(a.shape[0], target_shape[0])
    arr[:t] = a[:t]
    return arr


def process_prediction(audio_path, video_path, age_months=None):
    """Shared prediction logic for Web UI and API"""
    if not model:
        raise RuntimeError("Model not loaded")

    # 1. Feature Extraction
    mfcc = extract_mfcc(audio_path)
    kp = extract_video_keypoints(video_path)
    beh = compute_behavioral_features(mfcc, kp)

    # 2. Shape Alignment
    X_audio = pad_trunc(mfcc, (160, 13))[None, ...]
    X_video = pad_trunc(kp, (150, 18))[None, ...]
    X_beh = beh.reshape(1, 3)

    # 3. Predict
    pred_result = model.predict({
        "audio_input": X_audio,
        "video_input": X_video,
        "beh_input": X_beh
    }, verbose=0)
    
    score = float(pred_result[0][0])
    
    # 4. Interpret based on probability score
    if score > 0.7:
        risk_level = "High"
        interpretation = "Multimodal analysis indicates a high probability of behavioral patterns associated with Autism Spectrum Disorder (ASD)."
        observations = [
            "Significant variations in speech rhythm and prosody detected.",
            "Reduced frequency of eye contact and facial micro-expressions.",
            "Repetitive motor patterns observed in video sequence."
        ]
        next_steps = ["Clinical evaluation by a Developmental Pediatrician", "Formal ADOS-2 or M-CHAT-R assessment", "Early behavioral intervention therapy"]
    elif score > 0.35:
        risk_level = "Moderate"
        interpretation = "Analysis suggests some atypical behavioral indicators that warrant further clinical observation."
        observations = [
            "Mild irregularities in verbal social engagement.",
            "Occasional delays in facial mirroring and social response.",
            "Minimal repetitive behavioral cues detected."
        ]
        next_steps = ["Follow-up screening in 3 months", "Occupational therapy consultation", "Monitor social communication milestones"]
    else:
        risk_level = "Low"
        interpretation = "Behavioral patterns analyzed fall within the neurotypical range for the reported age."
        observations = [
            "Consistent vocal-verbal engagement patterns.",
            "Normal range of facial emotional reciprocity.",
            "Typical motor coordination and social curiosity."
        ]
        next_steps = ["Regular developmental monitoring", "Maintain standard pediatric checkups"]
        
    return {
        "score": score,
        "risk_level": risk_level,
        "interpretation": interpretation,
        "observations": observations,
        "next_steps": next_steps,
        "features": {
            "behavioral": beh.tolist()
        }
    }

# ----------------------------
# AI Keys (set via env vars or replace below)
# ----------------------------
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")

print(f"[DEBUG] OpenAI key loaded: {'YES (' + OPENAI_API_KEY[:10] + '...)' if OPENAI_API_KEY else 'NO'}")
print(f"[DEBUG] Gemini key loaded: {'YES (' + GEMINI_API_KEY[:10] + '...)' if GEMINI_API_KEY else 'NO'}")

SYSTEM_PROMPT = (
    "You are a helpful AI assistant specialised in autism support and child development. "
    "Give accurate, empathetic, and relevant answers. "
    "When answering questions about autism risk or screening results, reference established "
    "guidelines (DSM-5, CDC, M-CHAT). Keep responses concise and clear."
)


def _call_openai(messages: list, retries: int = 3) -> str:
    """Call OpenAI GPT-4o-mini with retry logic for 429/503."""
    client = openai.OpenAI(api_key=OPENAI_API_KEY)
    delay = 2
    for attempt in range(retries):
        try:
            resp = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
                temperature=0.7,
                max_tokens=600,
            )
            return resp.choices[0].message.content.strip()
        except openai.RateLimitError:
            if attempt < retries - 1:
                time.sleep(delay)
                delay *= 2
                continue
            raise
        except openai.APIStatusError as e:
            if e.status_code in (503, 529) and attempt < retries - 1:
                time.sleep(delay)
                delay *= 2
                continue
            raise


def _call_gemini(user_message: str, retries: int = 3) -> str:
    """Fallback: call Gemini with retry logic and model fallback."""
    client = genai.Client(api_key=GEMINI_API_KEY)
    models_to_try = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-pro"]

    for model_name in models_to_try:
        delay = 2
        for attempt in range(retries):
            try:
                resp = client.models.generate_content(
                    model=model_name,
                    contents=user_message,
                    config={"system_instruction": SYSTEM_PROMPT},
                )
                print(f"[INFO] Gemini response from model: {model_name}")
                return resp.text.strip()
            except Exception as e:
                code = getattr(e, "status_code", None) or getattr(e, "code", None)
                if code == 404:
                    print(f"[WARN] Model {model_name} not found, trying next...")
                    break  # try next model
                if code in (429, 503) and attempt < retries - 1:
                    time.sleep(delay)
                    delay *= 2
                    continue
                raise
    raise RuntimeError(f"No available Gemini model found. Tried: {models_to_try}")


# ----------------------------
# API Routes
# ----------------------------

@app.route("/api/predict", methods=["POST"])
def api_predict():
    if 'audio' not in request.files or 'video' not in request.files:
        return jsonify({"error": "Please provide both audio and video files."}), 400

    audio_file = request.files['audio']
    video_file = request.files['video']
    age_months = request.form.get("age_months", 48)

    tmp_dir = tempfile.mkdtemp()
    audio_path = os.path.join(tmp_dir, "in_audio.wav")
    video_path = os.path.join(tmp_dir, "in_video.mp4")

    try:
        audio_file.save(audio_path)
        video_file.save(video_path)
        results = process_prediction(audio_path, video_path, age_months)
        
        user_id = session.get('user_id', str(uuid.uuid4()))
        session['user_id'] = user_id
        
        history = AssessmentHistory(
            user_id=user_id,
            risk_score=results['score'],
            interpretation=results['interpretation'],
            recommended_steps=json.dumps(results['next_steps']),
            age_months=int(age_months),
            behavioral_features=json.dumps(results['features']['behavioral'])
        )
        db.session.add(history)
        db.session.commit()
        
        return jsonify({
            "id": history.id,
            "score": round(results['score'] * 100),
            "interpretation": results['interpretation'],
            "next_steps": results['next_steps']
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        try:
            if os.path.exists(audio_path): os.remove(audio_path)
            if os.path.exists(video_path): os.remove(video_path)
        except: pass

@app.route("/api/chat", methods=["POST"])
def api_chat():
    """AI Chat — Gemini (primary, fast & free) with OpenAI fallback."""
    data = request.get_json(force=True, silent=True) or {}
    user_message = data.get("message", "").strip()

    if not user_message:
        return jsonify({"error": "No message provided."}), 400

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_message},
    ]

    # --- Primary: Gemini (fast, free tier) ---
    if GEMINI_API_KEY:
        try:
            reply = _call_gemini(user_message)
            return jsonify({"response": reply, "source": "gemini"})
        except Exception as gemini_err:
            print(f"[WARN] Gemini failed: {gemini_err} — trying OpenAI fallback")

    # --- Fallback: OpenAI ---
    if OPENAI_API_KEY:
        try:
            reply = _call_openai(messages)
            return jsonify({"response": reply, "source": "openai"})
        except Exception as openai_err:
            print(f"[ERROR] OpenAI fallback also failed: {openai_err}")
            return jsonify({"error": "Both AI services are currently unavailable. Please try again later."}), 503

    return jsonify({"error": "No AI API key configured. Set OPENAI_API_KEY or GEMINI_API_KEY."}), 500


@app.route("/api/history", methods=["GET"])
def get_history():
    user_id = session.get('user_id')
    history_records = AssessmentHistory.query.filter_by(user_id=user_id).all() if user_id else []
    return jsonify([record.to_dict() for record in history_records])

@app.route("/api/download_report", methods=["POST"])
def download_report():
    data = request.json
    try:
        if 'score' in data and 'risk_score' not in data:
            data['risk_score'] = float(data['score']) / 100
        buffer = generate_pdf_report(data)
        return send_file(buffer, mimetype='application/pdf', as_attachment=True, download_name='report.pdf')
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ----------------------------
# SPA Handling
# ----------------------------

# Serve index.html at the root
@app.route("/")
def index():
    return send_from_directory(app.static_folder, 'index.html')

# Catch-all for files and other routes
@app.route("/<path:path>")
def serve_static(path):
    # Try to serve a physical file from the static folder
    if os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    # If not a file, let SPA handle it (fall back to index.html)
    return send_from_directory(app.static_folder, 'index.html')

# Robust 404 handler for deep links and refreshes
@app.errorhandler(404)
def handle_404(e):
    # For any 404, serve index.html to support SPA routing
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == "__main__":
    app.run(debug=True,use_reloader=False, port=5000)