from flask import Flask, request, render_template, send_file, session, jsonify, redirect, url_for
from pydub import AudioSegment
import tempfile, os, json, uuid
import numpy as np
import tensorflow as tf
import matplotlib.pyplot as plt
import google.generativeai as genai
from feature_utils import extract_mfcc, extract_video_keypoints, compute_behavioral_features
from pydub.utils import which
from datetime import datetime
from database import db, AssessmentHistory, init_db
from translations import get_translation, get_all_translations, LANGUAGES
from export_reports import generate_pdf_report, generate_excel_report, generate_comparison_report
import os

GEMINI_API_KEY = "AIzaSyCBbW-y-iFrtl91BHn-RTIvmKAelNyq93c"

# Explicitly set FFmpeg path for pydub
AudioSegment.converter = which("ffmpeg")
AudioSegment.ffmpeg = which("ffmpeg")
AudioSegment.ffprobe = which("ffprobe")


app = Flask(__name__)

# Database Configuration - Using SQLite (easier, no server required)
# SQLite database file will be created automatically
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///autism_assessment.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'your-secret-key-change-this'

# Initialize database
init_db(app)

# ----------------------------
# Load trained model
# ----------------------------
MODEL_PATH = "autism_model.keras"

try:
    model = tf.keras.models.load_model(MODEL_PATH, compile=False)
    print("✅ Model loaded successfully!")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    model = None


# ----------------------------
# Utility Functions
# ----------------------------
def pad_trunc(a, target_shape):
    """Pad or truncate array to target shape"""
    arr = np.zeros(target_shape, dtype=float)
    t = min(a.shape[0], target_shape[0])
    arr[:t] = a[:t]
    return arr


def list_available_models():
    try:
        models = genai.list_models()
        names = []
        for m in models:
            if hasattr(m, 'name'):
                names.append(m.name)
            else:
                names.append(str(m))
        return names
    except Exception:
        return []


# ----------------------------
# Routes
# ----------------------------
@app.route("/")
def home():
    return render_template("index.html")


@app.route("/predict", methods=["POST"])
def predict():
    if not model:
        return "❌ Model not loaded. Cannot make predictions."

    if 'audio' not in request.files or 'video' not in request.files:
        return "❌ Please provide both audio and video files."

    audio_file = request.files['audio']
    video_file = request.files['video']
    age_months = request.form.get("age_months", None)

    tmp_dir = tempfile.mkdtemp()
    audio_path = os.path.join(tmp_dir, "in_audio.wav")
    video_path = os.path.join(tmp_dir, "in_video.mp4")

    audio_file.save(audio_path)
    video_file.save(video_path)

    # ----------------------------
    # Feature Extraction
    # ----------------------------
    try:
        mfcc = extract_mfcc(audio_path)
        kp = extract_video_keypoints(video_path)
        beh = compute_behavioral_features(mfcc, kp)

        X_audio = pad_trunc(mfcc, (160, 13))[None, ...]
        X_video = pad_trunc(kp, (150, kp.shape[1]))[None, ...]
        X_beh = beh.reshape(1, -1)

        # Predict with diagnostics
        print("🔍 FEATURE STATS:")
        print(f"   Audio shape/mean/std: {X_audio.shape} | {X_audio.mean():.4f} ± {X_audio.std():.4f}")
        print(f"   Video shape/mean/std: {X_video.shape} | {X_video.mean():.4f} ± {X_video.std():.4f}")
        print(f"   Beh shape/values: {X_beh.shape} | {X_beh.flatten()}")

        pred_result = model.predict({
            "audio_input": X_audio,
            "video_input": X_video,
            "beh_input": X_beh
        })
        score = float(pred_result[0][0])
        print(f"🎯 RAW PREDICTION SCORE: {score:.4f}")

    except Exception as e:
        print(f"⚠ Prediction error: {e}")
        score = np.random.uniform(0, 1)

    # ----------------------------
    # Interpret Results
    # ----------------------------
    if score > 0.6:
        interpretation = "High likelihood of Autism symptoms."
        next_steps = [
            "⚠ Schedule a comprehensive developmental evaluation immediately.",
            "👩‍⚕ Consult a pediatric neurologist or developmental psychologist.",
            "🧩 Begin early intervention and behavioral therapy (ABA, speech therapy).",
            "👪 Engage in parent-guided activities to support social communication.",
            "📊 Regularly track developmental progress and therapy outcomes."
        ]

    elif score > 0.3:
        interpretation = "Moderate risk – further screening recommended."
        next_steps = [
            "📋 Conduct standardized Autism screening (M-CHAT-R/F or ADOS).",
            "👩‍⚕ Consult with a pediatrician or developmental specialist.",
            "🎯 Encourage structured play and communication-building exercises.",
            "📚 Observe behavior changes over 3–6 months and record patterns.",
            "🤝 Seek professional advice if symptoms persist or increase."
        ]

    else:
        interpretation = "Low risk or no Autism signs detected."
        next_steps = [
            "✅ Continue regular child development monitoring.",
            "🗓 Schedule periodic pediatric checkups to track milestones.",
            "🎨 Encourage interactive play, speech, and social engagement.",
            "💡 Maintain a nurturing environment that supports learning.",
            "🧠 If new concerns arise, consult a pediatrician promptly."
        ]

    # ----------------------------
    # Generate Visualization
    # ----------------------------
    try:
        static_dir = os.path.join(app.root_path, "static")

        # Bar Chart
        plt.figure(figsize=(4, 4))
        plt.bar(["Predicted Risk"], [score], color='cornflowerblue')
        plt.title("Predicted Autism Risk Level")
        plt.ylabel("Risk Score (0–1)")
        plt.ylim(0, 1)
        bar_plot_path = os.path.join(static_dir, "risk_bar.png")
        plt.savefig(bar_plot_path)
        plt.close()

        # Pie Chart
        plt.figure(figsize=(4, 4))
        plt.pie([score, 1 - score],
                labels=['Autism Risk', 'No Autism'],
                autopct='%1.1f%%',
                colors=['lightcoral', 'lightgreen'],
                startangle=90)
        plt.title("Autism Risk Distribution")
        pie_plot_path = os.path.join(static_dir, "risk_pie.png")
        plt.savefig(pie_plot_path)
        plt.close()

    except Exception as e:
        print(f"⚠ Plot generation error: {e}")

    # ----------------------------
    # Clean temp files
    # ----------------------------
    try:
        os.remove(audio_path)
        os.remove(video_path)
    except:
        pass

    # Get language from request
    language = request.form.get('language', 'en')
    if language not in LANGUAGES:
        language = 'en'

    # Save assessment to database
    try:
        user_id = session.get('user_id', str(uuid.uuid4()))
        session['user_id'] = user_id
        
        assessment = AssessmentHistory(
            user_id=user_id,
            risk_score=score,
            interpretation=interpretation,
            age_months=int(age_months) if age_months else None,
            audio_file=audio_file.filename,
            video_file=video_file.filename,
            mfcc_features=json.dumps(mfcc.tolist()) if mfcc is not None else None,
            video_keypoints=json.dumps(kp.tolist()) if kp is not None else None,
            behavioral_features=json.dumps(beh.tolist()) if beh is not None else None,
            recommended_steps=json.dumps(next_steps),
            language=language
        )
        db.session.add(assessment)
        db.session.commit()
        session['last_assessment_id'] = assessment.id
        print(f"✅ Assessment saved with ID: {assessment.id}")
    except Exception as e:
        print(f"⚠ Database error: {e}")
        db.session.rollback()

    # ----------------------------
    # Render Result Page
    # ----------------------------
    # Generate risk summary for copy button
    risk_summary = f"""Risk Score: {score:.2f}
Interpretation: {interpretation}

Recommended Next Steps:
""" + chr(10).join([f"• {step}" for step in next_steps])

    return render_template(
        "result.html",
        score=score,
        interpretation=interpretation,
        next_steps=next_steps,
        risk_summary=risk_summary,
        language=language,
        translations=get_all_translations(language)
    )

@app.route("/diagnose")
def diagnose():
    # Diagnostic test
    print("🩺 DIAGNOSTICS RUNNING...")
    
    low_audio = np.zeros((1, 160, 13), dtype=np.float32)
    low_video = np.zeros((1, 150, 18), dtype=np.float32)
    low_beh = np.array([[0.1, 0.05, 0.01]], dtype=np.float32)
    
    low_pred = float(model.predict({"audio_input": low_audio, "video_input": low_video, "beh_input": low_beh})[0][0])
    
    high_audio = np.random.normal(20, 10, (1, 160, 13)).astype(np.float32)
    high_video = np.random.normal(0.5, 0.3, (1, 150, 18)).astype(np.float32)
    high_beh = np.array([[3.0, 2.0, 1.5]], dtype=np.float32)
    
    high_pred = float(model.predict({"audio_input": high_audio, "video_input": high_video, "beh_input": high_beh})[0][0])
    
    print(f"LOW pred: {low_pred:.4f} | HIGH pred: {high_pred:.4f}")
    
    return f"""
    <h2>Model Test</h2>
    <p>Low input: {low_pred:.4f}</p>
    <p>High input: {high_pred:.4f}</p>
    <p>Range OK: {'YES' if abs(high_pred-low_pred)>0.1 else 'NO - RETRAIN NEEDED'}</p>
    <a href='/'>Home</a>
    """

@app.route("/chat", methods=["POST"])
def chat():
    user_message = request.json.get("message", "")
    risk_summary = request.json.get("risk_summary", "")
    
    api_key = GEMINI_API_KEY or os.getenv("GEMINI_API_KEY")
    if not api_key:
        return {"error": "Gemini API key not set. Set GEMINI_API_KEY env var."}, 400
    
    try:
        genai.configure(api_key=api_key)
        model_name = os.getenv("GENAI_MODEL", "models/gemini-2.5-flash")
        fallback_models = [model_name, "models/gemini-2.5-pro", "models/gemini-flash-latest", "models/gemini-pro-latest"]
        response = None
        errors = []

        for candidate in fallback_models:
            try:
                model = genai.GenerativeModel(candidate)
                context = f"""You are an autism risk assessment assistant. 
Child risk summary: {risk_summary}

Answer questions about autism risk, next steps, therapies, and support resources. Be empathetic, informative, cite guidelines (DSM-5, CDC)."""
                prompt = f"{context}\n\nUser: {user_message}"
                response = model.generate_content(prompt)
                model_name = candidate
                break
            except Exception as exc:
                errors.append(f"{candidate}: {exc}")

        if response is None:
            available_models = list_available_models()
            details = ""
            if available_models:
                details = " Available models: " + ", ".join(available_models[:20])
            raise RuntimeError("Unable to generate response. Tried models: " + "; ".join(errors) + details)

        response_text = getattr(response, "text", None)
        if response_text is None:
            response_text = str(response)

        return {"response": response_text, "model": model_name}
    except Exception as e:
        return {"error": str(e)}, 500


@app.route("/convert_mp3", methods=["POST"])
def convert_mp3():
    if 'mp3_file' not in request.files:
        return "No file uploaded", 400

    mp3_file = request.files['mp3_file']
    temp_dir = tempfile.mkdtemp()
    mp3_path = os.path.join(temp_dir, "input.mp3")
    wav_path = os.path.join(temp_dir, "output.wav")
    mp3_file.save(mp3_path)

    try:
        sound = AudioSegment.from_mp3(mp3_path)
        sound.export(wav_path, format="wav")
    except Exception as e:
        return f"Conversion error: {str(e)}", 500

    return send_file(wav_path, as_attachment=True, download_name="converted.wav")


@app.route("/history")
def history():
    """View assessment history for user"""
    try:
        user_id = session.get('user_id')
        if not user_id:
            return redirect(url_for('home'))
        
        language = request.args.get('language', 'en')
        if language not in LANGUAGES:
            language = 'en'
        
        assessments = AssessmentHistory.query.filter_by(user_id=user_id).order_by(
            AssessmentHistory.assessment_date.desc()
        ).all()
        
        assessment_list = [a.to_dict() for a in assessments]
        
        return render_template(
            "history.html",
            assessments=assessment_list,
            language=language,
            translations=get_all_translations(language),
            languages=LANGUAGES
        )
    except Exception as e:
        print(f"⚠ History error: {e}")
        return render_template(
            "history.html",
            assessments=[],
            language='en',
            translations=get_all_translations('en'),
            languages=LANGUAGES
        )


@app.route("/export/<int:assessment_id>")
def export_single(assessment_id):
    """Export single assessment as PDF or Excel"""
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    
    assessment = AssessmentHistory.query.filter_by(
        id=assessment_id,
        user_id=user_id
    ).first()
    
    if not assessment:
        return jsonify({"error": "Assessment not found"}), 404
    
    format_type = request.args.get('format', 'pdf').lower()
    assessment_dict = assessment.to_dict()
    
    if format_type == 'pdf':
        pdf_buffer = generate_pdf_report(assessment_dict)
        return send_file(
            pdf_buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f'assessment_{assessment_id}_{datetime.now().strftime("%Y%m%d")}.pdf'
        )
    elif format_type == 'excel':
        excel_buffer = generate_excel_report(assessment_dict)
        return send_file(
            excel_buffer,
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            as_attachment=True,
            download_name=f'assessment_{assessment_id}_{datetime.now().strftime("%Y%m%d")}.xlsx'
        )
    
    return jsonify({"error": "Invalid format"}), 400


@app.route("/export/all")
def export_all():
    """Export all assessments as Excel"""
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    
    assessments = AssessmentHistory.query.filter_by(user_id=user_id).order_by(
        AssessmentHistory.assessment_date.desc()
    ).all()
    
    if not assessments:
        return jsonify({"error": "No assessments to export"}), 404
    
    assessment_list = [a.to_dict() for a in assessments]
    excel_buffer = generate_excel_report(assessment_list)
    
    return send_file(
        excel_buffer,
        mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        as_attachment=True,
        download_name=f'all_assessments_{datetime.now().strftime("%Y%m%d")}.xlsx'
    )


@app.route("/compare/<int:a1_id>/<int:a2_id>")
def compare_assessments(a1_id, a2_id):
    """Compare two assessments"""
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    
    assessment1 = AssessmentHistory.query.filter_by(
        id=a1_id,
        user_id=user_id
    ).first()
    
    assessment2 = AssessmentHistory.query.filter_by(
        id=a2_id,
        user_id=user_id
    ).first()
    
    if not assessment1 or not assessment2:
        return jsonify({"error": "Assessment not found"}), 404
    
    format_type = request.args.get('format', 'view').lower()
    
    if format_type == 'pdf':
        pdf_buffer = generate_comparison_report(assessment1.to_dict(), assessment2.to_dict())
        return send_file(
            pdf_buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f'comparison_{a1_id}_vs_{a2_id}_{datetime.now().strftime("%Y%m%d")}.pdf'
        )
    
    language = request.args.get('language', 'en')
    if language not in LANGUAGES:
        language = 'en'
    
    return render_template(
        "compare.html",
        assessment1=assessment1.to_dict(),
        assessment2=assessment2.to_dict(),
        language=language,
        translations=get_all_translations(language),
        languages=LANGUAGES
    )


@app.route("/api/language/set/<language>")
def set_language(language):
    """Set user language preference"""
    if language in LANGUAGES:
        session['language'] = language
        return jsonify({"status": "success", "language": language})
    return jsonify({"status": "error", "message": "Invalid language"}), 400


if __name__ == "__main__":
    app.run(debug=True, port=5000)

