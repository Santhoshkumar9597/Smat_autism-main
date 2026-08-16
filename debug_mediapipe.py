import sys
try:
    import mediapipe
    print(f"MediaPipe version: {getattr(mediapipe, '__version__', 'unknown')}")
    print(f"MediaPipe file: {getattr(mediapipe, '__file__', 'unknown')}")
    print(f"MediaPipe dir: {dir(mediapipe)}")
    
    try:
        from mediapipe import solutions
        print("Successfully imported solutions from mediapipe")
        print(f"Solutions dir: {dir(solutions)}")
    except Exception as e:
        print(f"Failed to import solutions from mediapipe: {e}")
        
    try:
        import mediapipe.solutions.face_mesh
        print("Successfully imported mediapipe.solutions.face_mesh")
    except Exception as e:
        print(f"Failed to import mediapipe.solutions.face_mesh: {e}")

except Exception as e:
    print(f"Failed to import mediapipe: {e}")
