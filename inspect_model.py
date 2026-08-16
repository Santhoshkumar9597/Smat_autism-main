import tensorflow as tf
import os

MODEL_PATH = "autism_model.keras"

if os.path.exists(MODEL_PATH):
    try:
        model = tf.keras.models.load_model(MODEL_PATH, compile=False)
        print("Model Inputs:")
        for i, input_layer in enumerate(model.inputs):
            print(f"Input {i}: {input_layer.name}, Shape: {input_layer.shape}")
        
    except Exception as e:
        print(f"Error: {e}")
else:
    print(f"Model not found at {MODEL_PATH}")
