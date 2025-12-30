import mediapipe as mp
# Initialize Pose to trigger model download
mp.solutions.pose.Pose(model_complexity=2, static_image_mode=True)
print("MediaPipe Pose model (heavy) downloaded successfully")
