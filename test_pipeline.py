import os, json
import numpy as np
import tensorflow as tf
from feature_utils import extract_mfcc, extract_video_keypoints, compute_behavioral_features

def test_full_pipeline():
    print("Testing Backend Pipeline...")
    
    # ----------------------------
    # 1. Check MediaPipe Import
    # ----------------------------
    from feature_utils import HAS_MEDIAPIPE
    print(f"   MediaPipe Available: {HAS_MEDIAPIPE}")

    # ----------------------------
    # 2. Test Feature Extraction (Dummy Mode)
    # ----------------------------
    # Using dummy data to simulate mfcc and keypoints
    mfcc_dummy = np.random.normal(0, 1, (160, 13))
    kp_dummy = np.random.normal(0, 1, (150, 18))
    
    print("   Extracting behavioral features...")
    beh = compute_behavioral_features(mfcc_dummy, kp_dummy)
    print(f"   Behavioral features shape: {beh.shape} (Expected: (3,))")
    
    if beh.shape != (3,):
        print("x FAILED: Behavioral features shape mismatch!")
        return
    else:
        print("ok SUCCESS: Behavioral features shape is correct.")

    # ----------------------------
    # 3. Check Model Input Expectations
    # ----------------------------
    MODEL_PATH = "autism_model.keras"
    if os.path.exists(MODEL_PATH):
        try:
            model = tf.keras.models.load_model(MODEL_PATH, compile=False)
            print(f"   Model loaded. Inputs: {[i.name for i in model.inputs]}")
            
            # Prepare inputs as in app.py
            X_audio = mfcc_dummy[None, ...]
            X_video = kp_dummy[None, ...]
            X_beh = beh.reshape(1, 3)
            
            print("   Running test prediction...")
            pred = model.predict({
                "audio_input": X_audio,
                "video_input": X_video,
                "beh_input": X_beh
            }, verbose=0)
            
            print(f"ok SUCCESS: Prediction worked! Score: {pred[0][0]:.4f}")
            
        except Exception as e:
            print(f"x FAILED: Prediction error: {e}")
    else:
        print("skip Skipping model test: autism_model.keras not found.")

    print("\nBackend Pipeline Test Complete!")

if __name__ == "__main__":
    test_full_pipeline()
