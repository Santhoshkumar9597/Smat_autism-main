"""
Database models and configuration for assessment history
"""
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

db = SQLAlchemy()

class AssessmentHistory(db.Model):
    __tablename__ = 'assessment_history'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(100), nullable=False, index=True)
    assessment_date = db.Column(db.DateTime, default=datetime.utcnow)
    risk_score = db.Column(db.Float)
    interpretation = db.Column(db.String(255))
    age_months = db.Column(db.Integer)
    audio_file = db.Column(db.String(255))
    video_file = db.Column(db.String(255))
    mfcc_features = db.Column(db.Text)  # JSON
    video_keypoints = db.Column(db.Text)  # JSON
    behavioral_features = db.Column(db.Text)  # JSON
    recommended_steps = db.Column(db.Text)  # JSON
    notes = db.Column(db.Text)
    language = db.Column(db.String(10), default='en')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'assessment_date': self.assessment_date.isoformat(),
            'risk_score': self.risk_score,
            'interpretation': self.interpretation,
            'age_months': self.age_months,
            'recommended_steps': json.loads(self.recommended_steps) if self.recommended_steps else [],
            'language': self.language
        }
    
    def __repr__(self):
        return f'<AssessmentHistory {self.id} - Score: {self.risk_score}>'


def init_db(app):
    """Initialize database connection"""
    db.init_app(app)
    with app.app_context():
        try:
            db.create_all()
            print("Database tables created successfully!")
        except Exception as e:
            print(f"Database initialization warning: {e}")
            print("App will continue, but assessment history features may not work.")
