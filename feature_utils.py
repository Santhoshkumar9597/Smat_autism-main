# feature_utils.py
import numpy as np
import soundfile as sf
import cv2
import os

HAS_MEDIAPIPE = False
mp_face_mesh = None
mp_pose = None

# Reliable MediaPipe import
try:
    import mediapipe as mp
    mp_face_mesh = mp.solutions.face_mesh
    mp_pose = mp.solutions.pose
    HAS_MEDIAPIPE = True
    print("[SUCCESS] MediaPipe imported successfully")
except Exception as e:
    print(f"[WARNING] MediaPipe import failed: {e}")
    HAS_MEDIAPIPE = False


# --- Audio: extract MFCCs (normalized) ---
def _mel_filterbank(sample_rate, n_fft, n_mels=26):
    """Build a small mel filter bank without relying on Librosa at runtime."""
    def hz_to_mel(hz):
        return 2595 * np.log10(1 + hz / 700)

    def mel_to_hz(mel):
        return 700 * (10 ** (mel / 2595) - 1)

    mel_points = np.linspace(hz_to_mel(0), hz_to_mel(sample_rate / 2), n_mels + 2)
    bins = np.floor((n_fft + 1) * mel_to_hz(mel_points) / sample_rate).astype(int)
    filters = np.zeros((n_mels, n_fft // 2 + 1), dtype=np.float32)

    for index in range(1, n_mels + 1):
        left, center, right = bins[index - 1], bins[index], bins[index + 1]
        center = max(center, left + 1)
        right = max(right, center + 1)
        for frequency_bin in range(left, min(center, filters.shape[1])):
            filters[index - 1, frequency_bin] = (frequency_bin - left) / (center - left)
        for frequency_bin in range(center, min(right, filters.shape[1])):
            filters[index - 1, frequency_bin] = (right - frequency_bin) / (right - center)
    return filters


def extract_mfcc(path, sr=16000, n_mfcc=13, duration=5.0):
    x, sr = sf.read(path)
    if x.ndim > 1:
        x = np.mean(x, axis=1)
    target_len = int(sr * duration)
    if len(x) < target_len:
        x = np.pad(x, (0, target_len - len(x)))
    else:
        x = x[:target_len]
    # Frame and transform the audio, then apply mel filters and a DCT. Keeping
    # this NumPy-only avoids Librosa's optional JIT path, which can block the
    # web request for minutes on some Windows installations.
    frame_length = max(int(0.025 * sr), 1)
    hop_length = max(int(0.010 * sr), 1)
    frame_count = 1 + max((len(x) - frame_length) // hop_length, 0)
    frames = np.empty((frame_count, frame_length), dtype=np.float32)
    for frame_index in range(frame_count):
        start = frame_index * hop_length
        frames[frame_index] = x[start:start + frame_length]
    frames *= np.hamming(frame_length).astype(np.float32)

    n_fft = 1 << (frame_length - 1).bit_length()
    spectrum = np.abs(np.fft.rfft(frames, n=n_fft, axis=1)) ** 2
    log_mel = np.log(np.maximum(spectrum @ _mel_filterbank(sr, n_fft).T, 1e-10))
    coefficients = np.cos(
        np.pi / log_mel.shape[1]
        * np.arange(n_mfcc)[:, None]
        * (np.arange(log_mel.shape[1]) + 0.5)
    )
    mfcc = log_mel @ coefficients.T
    mfcc = (mfcc - mfcc.mean()) / (mfcc.std() + 1e-8)  # Normalize
    return mfcc


# --- Video: use MediaPipe if available, otherwise dummy ---
def extract_video_keypoints(video_path, max_frames=30, downscale=0.25):
    if not HAS_MEDIAPIPE:
        print("[INFO] Using realistic dummy keypoints (MediaPipe unavailable)")
        frames = []
        for i in range(max_frames):
            t = i / max_frames
            nose_x = 0.5 + 0.1*np.sin(2*np.pi*t*3)
            nose_y = 0.4 + 0.05*np.cos(2*np.pi*t*2)
            dummy_face = [nose_x, nose_y, 0.45, 0.35, 0.55, 0.35]
            dummy_pose = [0.5, 0.7, 0, 0.6, 0.8, 0, 0.4, 0.8, 0, 0.6, 0.7, 0]
            feat = dummy_face + dummy_pose
            frames.append(feat)
        keypoints = np.array(frames)
        return (keypoints - keypoints.mean()) / (keypoints.std() + 1e-8)

    cap = cv2.VideoCapture(video_path)
    face_mesh_lib = mp_face_mesh.FaceMesh(static_image_mode=False, max_num_faces=1)
    pose_lib = mp_pose.Pose(static_image_mode=False)
    features, frame_count = [], 0

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    # Sample across the clip rather than processing every early frame. This
    # preserves temporal coverage while keeping analysis responsive.
    sample_count = min(max_frames, total_frames) if total_frames > 0 else max_frames
    frame_interval = max(total_frames // sample_count, 1) if total_frames > 0 else 1
    source_frame = 0

    while cap.isOpened() and frame_count < sample_count:
        ret, frame = cap.read()
        if not ret:
            break
        if source_frame % frame_interval != 0:
            source_frame += 1
            continue
        source_frame += 1
        if downscale != 1.0:
            h, w = frame.shape[:2]
            frame = cv2.resize(frame, (int(w * downscale), int(h * downscale)))
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        fm_res = face_mesh_lib.process(rgb)
        ps_res = pose_lib.process(rgb)
        feat = []
        if fm_res.multi_face_landmarks:
            lm = fm_res.multi_face_landmarks[0].landmark
            nose = lm[1]
            left_eye_idx = [33, 133, 160, 159]
            right_eye_idx = [263, 362, 387, 386]
            def avg_pts(idxs):
                xs = [lm[i].x for i in idxs]
                ys = [lm[i].y for i in idxs]
                return (np.mean(xs), np.mean(ys))
            le = avg_pts(left_eye_idx)
            re = avg_pts(right_eye_idx)
            feat += [nose.x, nose.y, le[0], le[1], re[0], re[1]]
        else:
            feat += [0.5] * 6
        if ps_res.pose_landmarks:
            pl = ps_res.pose_landmarks.landmark
            for idx in [11, 12, 23, 24]:
                p = pl[idx]
                feat += [p.x, p.y, p.z]
        else:
            feat += [0.5, 0.8, 0] * 4
        features.append(feat)
        frame_count += 1
    cap.release()
    face_mesh_lib.close()
    pose_lib.close()
    keypoints = np.array(features) if len(features) else np.zeros((1, 18))
    return (keypoints - keypoints.mean()) / (keypoints.std() + 1e-8)


# --- Behavioral features (Aligned with model: exactly 3 features) ---
def compute_behavioral_features(mfcc, keypoints):
    """
    Extract exactly 3 behavioral features:
    1. Speech Energy (Audio)
    2. Pitch Proxy (Audio)
    3. Motion Variance (Video)
    """
    # Audio features
    speech_energy = np.mean(np.abs(mfcc)) if mfcc is not None and mfcc.size > 0 else 0.0
    pitch_proxy = np.mean(np.abs(mfcc[:, 0])) if mfcc is not None and mfcc.shape[1] > 0 else 0.0
    
    # Video features
    motion_var = np.var(keypoints) if keypoints is not None and keypoints.size > 0 else 0.0
    
    # Returning exactly 3 features as expected by the functional Keras model
    feats = np.array([speech_energy, pitch_proxy, motion_var], dtype=np.float32)
    
    # Zero-centering / normalization (safety check for std)
    f_mean = np.mean(feats)
    f_std = np.std(feats) + 1e-8
    return (feats - f_mean) / f_std
