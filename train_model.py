import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models, Input

def create_model():
    # 1. Audio Input (MFCC)
    audio_input = Input(shape=(160, 13), name="audio_input")
    x_a = layers.Conv1D(64, 3, activation='relu')(audio_input)
    x_a = layers.MaxPooling1D(2)(x_a)
    x_a = layers.Flatten()(x_a)
    x_a = layers.Dense(64, activation='relu')(x_a)

    # 2. Video Input (Keypoints)
    video_input = Input(shape=(150, 18), name="video_input")
    x_v = layers.Conv1D(64, 3, activation='relu')(video_input)
    x_v = layers.MaxPooling1D(2)(x_v)
    x_v = layers.Flatten()(x_v)
    x_v = layers.Dense(64, activation='relu')(x_v)

    # 3. Behavioral Features
    beh_input = Input(shape=(3,), name="beh_input")
    x_b = layers.Dense(16, activation='relu')(beh_input)

    # 4. Concatenate and Output
    merged = layers.Concatenate()([x_a, x_v, x_b])
    merged = layers.Dense(128, activation='relu')(merged)
    merged = layers.Dropout(0.3)(merged)
    output = layers.Dense(1, activation='sigmoid', name="output")(merged)

    model = models.Model(inputs=[audio_input, video_input, beh_input], outputs=output)
    model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
    return model

def generate_synthetic_data(samples=500):
    """
    Generate synthetic data for "Normal" (low risk) and "ASD" cases.
    Normal data will have features shifted toward lower predicted values.
    """
    # Normal data (Label 0)
    normal_audio = np.random.normal(0, 0.5, (samples // 2, 160, 13))
    normal_video = np.random.normal(0.5, 0.1, (samples // 2, 150, 18))
    normal_beh = np.random.normal(0.2, 0.1, (samples // 2, 3))
    y_normal = np.random.uniform(0.0, 0.1, (samples // 2, 1)) # Explicitly low scores

    # ASD data (Label 1)
    asd_audio = np.random.normal(1.0, 0.8, (samples // 2, 160, 13))
    asd_video = np.random.normal(0.2, 0.3, (samples // 2, 150, 18))
    asd_beh = np.random.normal(0.8, 0.2, (samples // 2, 3))
    y_asd = np.random.uniform(0.7, 0.95, (samples // 2, 1)) # Explicitly high scores

    X_audio = np.concatenate([normal_audio, asd_audio])
    X_video = np.concatenate([normal_video, asd_video])
    X_beh = np.concatenate([normal_beh, asd_beh])
    Y = np.concatenate([y_normal, y_asd])

    # Shuffle
    indices = np.arange(samples)
    np.random.shuffle(indices)
    return {
        "audio_input": X_audio[indices],
        "video_input": X_video[indices],
        "beh_input": X_beh[indices]
    }, Y[indices]

def train_baseline_model():
    print("[INFO] Creating baseline multi-modal model...")
    model = create_model()
    print("[INFO] Generating synthetic 'Normal' and 'ASD' datasets...")
    X, Y = generate_synthetic_data()

    print("[INFO] Starting training...")
    model.fit(X, Y, epochs=5, batch_size=32, verbose=1)
    
    model_path = "autism_model.keras"
    model.save(model_path)
    print(f"[SUCCESS] Model saved to {model_path}")

if __name__ == "__main__":
    train_baseline_model()
