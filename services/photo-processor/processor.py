"""
Photo Processor Module
Handles thumbnail generation and body composition analysis with MediaPipe pose detection
"""
import json
import math
import os
from datetime import datetime, timezone
from io import BytesIO
from PIL import Image
import numpy as np
import cv2
import mediapipe as mp

from config import THUMBNAIL_SIZE, UPLOADS_PATH

# MediaPipe drawing utilities
mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles
mp_pose = mp.solutions.pose


def extract_photo_date(img: Image.Image) -> str:
    """
    Extract the date the photo was taken from EXIF metadata.
    
    Args:
        img: PIL Image object
        
    Returns:
        ISO format date string or None if not found
    """
    try:
        exif_data = img._getexif()
        if exif_data:
            # EXIF tag 36867 = DateTimeOriginal
            # EXIF tag 36868 = DateTimeDigitized  
            # EXIF tag 306 = DateTime (last modified)
            for tag_id in [36867, 36868, 306]:
                if tag_id in exif_data:
                    date_str = exif_data[tag_id]
                    # EXIF format: "YYYY:MM:DD HH:MM:SS"
                    # Convert to ISO format
                    date_obj = datetime.strptime(date_str, "%Y:%m:%d %H:%M:%S")
                    print(f"  EXIF - Found photo date: {date_obj.isoformat()}", flush=True)
                    return date_obj.isoformat()
    except Exception as e:
        print(f"  EXIF - Could not extract date: {e}", flush=True)
    
    return None



def crop_to_subject(img_array: np.ndarray, pose_landmarks, original_path: str) -> str:
    """
    Crop the image to focus on the detected subject using pose landmarks.
    
    Args:
        img_array: RGB numpy array of the image
        pose_landmarks: MediaPipe pose landmarks object
        original_path: Path to original image (for naming)
        
    Returns:
        Path to the saved cropped image
    """
    height, width = img_array.shape[:2]
    
    # Get all visible landmark positions
    x_coords = []
    y_coords = []
    
    for lm in pose_landmarks.landmark:
        if lm.visibility > 0.5:  # Only use reasonably visible landmarks
            x_coords.append(lm.x * width)
            y_coords.append(lm.y * height)
    
    if not x_coords or not y_coords:
        print("  CROP - No visible landmarks, skipping crop", flush=True)
        return None
    
    # Calculate bounding box
    min_x = min(x_coords)
    max_x = max(x_coords)
    min_y = min(y_coords)
    max_y = max(y_coords)
    
    # Calculate subject dimensions
    subject_width = max_x - min_x
    subject_height = max_y - min_y
    
    # Add padding (15% on sides and bottom)
    padding_x = subject_width * 0.15
    padding_bottom = subject_height * 0.15
    
    # Add more padding on top for head (landmarks don't include top of head)
    # Head is roughly 25% above the nose landmark
    padding_top = subject_height * 0.35
    
    # Calculate final crop coordinates
    crop_x1 = max(0, int(min_x - padding_x))
    crop_y1 = max(0, int(min_y - padding_top))
    crop_x2 = min(width, int(max_x + padding_x))
    crop_y2 = min(height, int(max_y + padding_bottom))
    
    # Enforce minimum aspect ratio (3:4 portrait = 0.75 width/height)
    # This prevents overly skinny crops
    min_aspect_ratio = 0.75
    crop_width = crop_x2 - crop_x1
    crop_height = crop_y2 - crop_y1
    current_ratio = crop_width / crop_height if crop_height > 0 else 1
    
    if current_ratio < min_aspect_ratio:
        # Need to expand width to meet minimum ratio
        target_width = int(crop_height * min_aspect_ratio)
        width_to_add = target_width - crop_width
        
        # Try to expand equally on both sides
        expand_left = width_to_add // 2
        expand_right = width_to_add - expand_left
        
        # Adjust for image boundaries
        new_x1 = max(0, crop_x1 - expand_left)
        new_x2 = min(width, crop_x2 + expand_right)
        
        # If we hit a boundary, try to compensate on the other side
        if new_x1 == 0:
            new_x2 = min(width, new_x2 + (crop_x1 - expand_left - new_x1))
        if new_x2 == width:
            new_x1 = max(0, new_x1 - (crop_x2 + expand_right - new_x2))
        
        crop_x1, crop_x2 = new_x1, new_x2
        print(f"  CROP - Expanded width to meet {min_aspect_ratio} aspect ratio", flush=True)
    
    # Ensure minimum crop size
    if crop_x2 - crop_x1 < 100 or crop_y2 - crop_y1 < 100:
        print("  CROP - Crop area too small, skipping", flush=True)
        return None
    
    # Perform the crop
    cropped_image = img_array[crop_y1:crop_y2, crop_x1:crop_x2]
    
    # Generate output path
    base_name = os.path.splitext(os.path.basename(original_path))[0]
    cropped_filename = f"{base_name}_cropped.jpg"
    cropped_path = os.path.join(UPLOADS_PATH, cropped_filename)
    
    # Convert RGB to BGR for OpenCV and save
    cropped_bgr = cv2.cvtColor(cropped_image, cv2.COLOR_RGB2BGR)
    cv2.imwrite(cropped_path, cropped_bgr, [cv2.IMWRITE_JPEG_QUALITY, 95])
    
    print(f"  CROP - Saved cropped image to: {cropped_filename} ({crop_x2-crop_x1}x{crop_y2-crop_y1})", flush=True)
    return cropped_path  # Return full path so main.py can upload it

def process_photo(image_path: str, photo_id: int) -> dict:
    """
    Process a photo: generate thumbnail, landmarks overlay, and perform body analysis.
    
    Args:
        image_path: Path to the original image file
        photo_id: Database ID of the photo
        
    Returns:
        dict with processing results
    """
    result = {
        'photo_id': photo_id,
        'success': False,
        'thumbnail_path': None,
        'cropped_path': None,
        'photo_taken_at': None,
        'body_analysis': None,
        'error': None
    }
    
    try:
        # Open and process the image
        with Image.open(image_path) as img:
            # Get original image info
            original_size = img.size
            original_format = img.format or 'JPEG'
            
            # Extract photo date from EXIF
            photo_taken_at = extract_photo_date(img)
            result['photo_taken_at'] = photo_taken_at
            
            # Generate thumbnail
            thumbnail_path = generate_thumbnail(img, image_path, photo_id)
            result['thumbnail_path'] = thumbnail_path
            
            # Convert to numpy array for analysis
            img_array = np.array(img.convert('RGB'))
            
            # Perform body composition analysis with pose detection
            body_analysis, pose_landmarks = analyze_body_composition_with_landmarks(img)
            body_analysis['original_dimensions'] = {
                'width': original_size[0],
                'height': original_size[1]
            }
            body_analysis['format'] = original_format
            result['body_analysis'] = body_analysis
            
            # Crop to subject if pose was detected
            if pose_landmarks:
                cropped_path = crop_to_subject(img_array, pose_landmarks, image_path)
                result['cropped_path'] = cropped_path
            
            result['success'] = True
            
    except Exception as e:
        result['error'] = str(e)
        print(f"Error processing photo {photo_id}: {e}", flush=True)
    
    return result


def generate_thumbnail(img: Image.Image, original_path: str, photo_id: int) -> str:
    """
    Generate a thumbnail for the image.
    
    Args:
        img: PIL Image object
        original_path: Path to original image
        photo_id: Database ID
        
    Returns:
        Path to the generated thumbnail
    """
    # Create thumbnail
    thumbnail = img.copy()
    thumbnail.thumbnail(THUMBNAIL_SIZE, Image.Resampling.LANCZOS)
    
    # Determine thumbnail path
    base_name = os.path.basename(original_path)
    name, ext = os.path.splitext(base_name)
    thumbnail_name = f"{name}_thumb{ext}"
    thumbnail_path = os.path.join(os.path.dirname(original_path), thumbnail_name)
    
    # Save thumbnail
    if thumbnail.mode in ('RGBA', 'P'):
        thumbnail = thumbnail.convert('RGB')
    thumbnail.save(thumbnail_path, 'JPEG', quality=85)
    
    print(f"Generated thumbnail for photo {photo_id}: {thumbnail_path}", flush=True)
    return thumbnail_path  # Return full path so main.py can upload it


def analyze_body_composition(img: Image.Image) -> dict:
    """
    Perform body composition analysis on the image using MediaPipe pose detection.
    
    Args:
        img: PIL Image object
        
    Returns:
        dict with analysis results including pose detection
    """
    # Convert to numpy array for analysis
    img_array = np.array(img.convert('RGB'))
    
    # Basic image statistics
    brightness = np.mean(img_array)
    contrast = np.std(img_array)
    
    # Color distribution analysis
    r_mean, g_mean, b_mean = np.mean(img_array, axis=(0, 1))
    
    # Perform pose detection
    pose_result = analyze_pose(img_array)
    
    # Calculate image quality score
    quality_score = calculate_quality_score(img_array, brightness, contrast)
    
    analysis = {
        'analyzed_at': datetime.now(timezone.utc).isoformat(),
        'image_quality': {
            'brightness': round(float(brightness), 2),
            'contrast': round(float(contrast), 2),
            'quality_score': quality_score
        },
        'color_profile': {
            'red_mean': round(float(r_mean), 2),
            'green_mean': round(float(g_mean), 2),
            'blue_mean': round(float(b_mean), 2)
        },
        'body_detection': {
            'pose_detected': pose_result['pose_detected'],
            'pose_type': pose_result.get('pose_type'),
            'landmark_count': pose_result.get('landmark_count', 0),
            'confidence': pose_result.get('confidence', 0),
            'landmarks': pose_result.get('landmarks', [])
        },
        'recommendations': generate_recommendations(quality_score, brightness, pose_result['pose_detected'])
    }
    
    return analysis


def analyze_body_composition_with_landmarks(img: Image.Image) -> tuple:
    """
    Perform body composition analysis and also return raw pose landmarks for drawing.
    
    Args:
        img: PIL Image object
        
    Returns:
        tuple of (analysis dict, pose_landmarks or None)
    """
    # Convert to numpy array for analysis
    img_array = np.array(img.convert('RGB'))
    
    # Basic image statistics
    brightness = np.mean(img_array)
    contrast = np.std(img_array)
    
    # Color distribution analysis
    r_mean, g_mean, b_mean = np.mean(img_array, axis=(0, 1))
    
    # Perform pose detection and get raw landmarks
    pose_result, raw_landmarks = analyze_pose_with_raw_landmarks(img_array)
    
    # Calculate image quality score
    quality_score = calculate_quality_score(img_array, brightness, contrast)
    
    analysis = {
        'analyzed_at': datetime.now(timezone.utc).isoformat(),
        'image_quality': {
            'brightness': round(float(brightness), 2),
            'contrast': round(float(contrast), 2),
            'quality_score': quality_score
        },
        'color_profile': {
            'red_mean': round(float(r_mean), 2),
            'green_mean': round(float(g_mean), 2),
            'blue_mean': round(float(b_mean), 2)
        },
        'body_detection': {
            'pose_detected': pose_result['pose_detected'],
            'pose_type': pose_result.get('pose_type'),
            'landmark_count': pose_result.get('landmark_count', 0),
            'confidence': pose_result.get('confidence', 0),
            'landmarks': pose_result.get('landmarks', [])
        },
        'recommendations': generate_recommendations(quality_score, brightness, pose_result['pose_detected'])
    }
    
    return analysis, raw_landmarks


def detect_face_present(img_array: np.ndarray) -> dict:
    """
    Use MediaPipe Face Detection to definitively detect if a face is visible.
    This is more reliable than pose landmark visibility for front/back detection.
    
    Args:
        img_array: RGB numpy array of the image
        
    Returns:
        dict with face_detected (bool) and confidence (float)
    """
    mp_face = mp.solutions.face_detection
    
    try:
        with mp_face.FaceDetection(
            model_selection=1,  # 0 for close-range, 1 for full-range (up to 5m)
            min_detection_confidence=0.5
        ) as face_detection:
            results = face_detection.process(img_array)
            
            if results.detections:
                # Face detected - get the best confidence
                best_confidence = max(d.score[0] for d in results.detections)
                print(f"  FACE DETECTION - Face found with confidence: {best_confidence:.2f}", flush=True)
                return {
                    'face_detected': True,
                    'confidence': float(best_confidence),
                    'face_count': len(results.detections)
                }
            else:
                print(f"  FACE DETECTION - No face detected (person likely facing away)", flush=True)
                return {
                    'face_detected': False,
                    'confidence': 0,
                    'face_count': 0
                }
    except Exception as e:
        print(f"  FACE DETECTION - Error: {e}", flush=True)
        return {
            'face_detected': False,
            'confidence': 0,
            'face_count': 0,
            'error': str(e)
        }


def analyze_pose(img_array: np.ndarray) -> dict:
    """
    Detect body pose using MediaPipe and classify bodybuilding poses.
    
    Args:
        img_array: RGB numpy array of the image
        
    Returns:
        dict with pose detection results
    """
    mp_pose = mp.solutions.pose
    
    try:
        with mp_pose.Pose(
            static_image_mode=True,
            model_complexity=2,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        ) as pose:
            # MediaPipe expects RGB
            results = pose.process(img_array)
            
            if not results.pose_landmarks:
                return {
                    'pose_detected': False,
                    'landmarks': [],
                    'pose_type': None,
                    'landmark_count': 0,
                    'confidence': 0
                }
            
            # Extract landmarks
            landmarks = []
            total_visibility = 0
            for idx, lm in enumerate(results.pose_landmarks.landmark):
                landmarks.append({
                    'id': idx,
                    'x': round(float(lm.x), 4),
                    'y': round(float(lm.y), 4),
                    'z': round(float(lm.z), 4),
                    'visibility': round(float(lm.visibility), 2)
                })
                total_visibility += lm.visibility
            
            avg_confidence = total_visibility / len(landmarks) if landmarks else 0
            
            # First, use dedicated face detection to determine orientation
            face_result = detect_face_present(img_array)
            facing_camera = face_result['face_detected']
            
            # Classify bodybuilding pose using face detection result
            pose_type = classify_bodybuilding_pose(landmarks, facing_camera)
            
            print(f"Pose detected: {pose_type} (confidence: {avg_confidence:.2f})", flush=True)
            
            return {
                'pose_detected': True,
                'landmarks': landmarks,
                'pose_type': pose_type,
                'landmark_count': len(landmarks),
                'confidence': round(float(avg_confidence), 2)
            }
            
    except Exception as e:
        print(f"Pose detection error: {e}", flush=True)
        return {
            'pose_detected': False,
            'landmarks': [],
            'pose_type': None,
            'landmark_count': 0,
            'confidence': 0,
            'error': str(e)
        }


def analyze_pose_with_raw_landmarks(img_array: np.ndarray) -> tuple:
    """
    Detect body pose and return both results dict and raw landmarks for drawing.
    
    Args:
        img_array: RGB numpy array of the image
        
    Returns:
        tuple of (pose_result dict, raw pose_landmarks or None)
    """
    try:
        with mp_pose.Pose(
            static_image_mode=True,
            model_complexity=2,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        ) as pose:
            results = pose.process(img_array)
            
            if not results.pose_landmarks:
                return {
                    'pose_detected': False,
                    'landmarks': [],
                    'pose_type': None,
                    'landmark_count': 0,
                    'confidence': 0
                }, None
            
            # Extract landmarks as dict
            landmarks = []
            total_visibility = 0
            for idx, lm in enumerate(results.pose_landmarks.landmark):
                landmarks.append({
                    'id': idx,
                    'x': round(float(lm.x), 4),
                    'y': round(float(lm.y), 4),
                    'z': round(float(lm.z), 4),
                    'visibility': round(float(lm.visibility), 2)
                })
                total_visibility += lm.visibility
            
            avg_confidence = total_visibility / len(landmarks) if landmarks else 0
            
            # Use dedicated face detection to determine orientation
            face_result = detect_face_present(img_array)
            facing_camera = face_result['face_detected']
            
            # Classify bodybuilding pose
            pose_type = classify_bodybuilding_pose(landmarks, facing_camera)
            
            print(f"Pose w/ landmarks: {pose_type} (confidence: {avg_confidence:.2f})", flush=True)
            
            result = {
                'pose_detected': True,
                'landmarks': landmarks,
                'pose_type': pose_type,
                'landmark_count': len(landmarks),
                'confidence': round(float(avg_confidence), 2)
            }
            
            return result, results.pose_landmarks
            
    except Exception as e:
        print(f"Pose detection error: {e}", flush=True)
        return {
            'pose_detected': False,
            'landmarks': [],
            'pose_type': None,
            'landmark_count': 0,
            'confidence': 0,
            'error': str(e)
        }, None


def classify_bodybuilding_pose(landmarks: list, facing_camera: bool) -> str:
    """
    Classify the detected pose into common bodybuilding poses.
    
    Args:
        landmarks: List of pose landmarks from MediaPipe
        facing_camera: Whether face detection found a face (True = front, False = back)
    
    MediaPipe landmark indices:
    - 11, 12: Left/Right shoulder
    - 13, 14: Left/Right elbow
    - 15, 16: Left/Right wrist
    - 23, 24: Left/Right hip
    """
    if len(landmarks) < 25:
        return "Unknown"
    
    # Key body landmarks for pose classification
    left_shoulder = landmarks[11]
    right_shoulder = landmarks[12]
    left_elbow = landmarks[13]
    right_elbow = landmarks[14]
    left_wrist = landmarks[15]
    right_wrist = landmarks[16]
    left_hip = landmarks[23]
    right_hip = landmarks[24]
    
    print(f"  POSE CLASSIFICATION - facing_camera={facing_camera}", flush=True)
    
    # Calculate arm angles
    left_arm_angle = calculate_angle(left_shoulder, left_elbow, left_wrist)
    right_arm_angle = calculate_angle(right_shoulder, right_elbow, right_wrist)
    
    # Check arm elevation (wrist above shoulder = arms raised)
    left_arm_raised = left_wrist['y'] < left_shoulder['y']
    right_arm_raised = right_wrist['y'] < right_shoulder['y']
    
    # Check if elbows are bent (angle < 120 degrees)
    # Check if elbows are bent (angle < 120 degrees)
    left_elbow_bent = left_arm_angle < 120
    right_elbow_bent = right_arm_angle < 120

    # Check for body rotation (Side poses)
    # If shoulders have significant Z-depth difference or visibility difference
    shoulder_z_diff = abs(left_shoulder['z'] - right_shoulder['z'])
    is_side_turn = shoulder_z_diff > 0.15 or abs(left_shoulder['visibility'] - right_shoulder['visibility']) > 0.3
    
    # Check for front-facing hips (Most Muscular requirement)
    # Both hips should be visible and roughly aligned in Z
    hips_visible = left_hip['visibility'] > 0.6 and right_hip['visibility'] > 0.6
    hips_aligned = abs(left_hip['z'] - right_hip['z']) < 0.15
    is_facing_front_body = hips_visible and hips_aligned

    # Symmetry Check (Most Muscular is symmetric, Selfie Side Chest is not)
    # Check vertical distance between wrists
    wrist_y_diff = abs(left_wrist['y'] - right_wrist['y'])
    is_symmetric_arms = wrist_y_diff < 0.15
    
    # "Hands Clasped" / "Crab" Most Muscular Check
    # Wrists close together in X
    is_hands_clasped = abs(left_wrist['x'] - right_wrist['x']) < 0.15
    
    # Classification logic
    
    # Special Case: Crab Most Muscular (Hands clasped + elbows bent)
    # This often involves hunching which might obscure hips, so we skip the hip checks
    if is_hands_clasped and left_elbow_bent and right_elbow_bent and is_symmetric_arms:
        return "Most Muscular"
    
    # Double Biceps: Both arms raised and bent
    if left_arm_raised and right_arm_raised and left_elbow_bent and right_elbow_bent:
        if facing_camera:
            return "Front Double Biceps"
        else:
            return "Rear Double Biceps"
    
    # Lat Spread: Arms raised but straight/wide
    elif left_arm_raised and right_arm_raised and not left_elbow_bent and not right_elbow_bent:
        if facing_camera:
            return "Front Lat Spread"
        else:
            return "Rear Lat Spread"
    
    # Side Chest: Significant side turn + one arm bent/flexed
    # One arm might be holding a phone (not fully visible or weird angle), but the "posing" arm is bent
    # Also capture asymmetric "selfie" poses that are side-turned
    elif (is_side_turn or not is_symmetric_arms) and (left_elbow_bent or right_elbow_bent):
         return "Side Chest"
         
    # Must precede legacy side chest to catch the specific selfie case where is_side_turn is weak but asymmetry is high
    
    # Side poses legacy fallback: One arm bent, one straight
    elif (left_elbow_bent and not right_elbow_bent) or (right_elbow_bent and not left_elbow_bent):
        return "Side Chest"
    
    # Most Muscular: Both arms tightly contracted in front AND facing front body
    # STRICTER: Must be symmetric (hands roughly level)
    elif left_arm_angle < 100 and right_arm_angle < 100 and facing_camera and is_facing_front_body and is_symmetric_arms:
        return "Most Muscular"
    
    # Fallback to Hands Clasped if only wrists are close but arms not bent enough (e.g. at waist)
    elif is_hands_clasped:
        return "Hands Clasped"
    
    else:
        return "Standing Pose"


def calculate_angle(a: dict, b: dict, c: dict) -> float:
    """
    Calculate the angle at point b given three landmark points.
    
    Args:
        a, b, c: Landmark dicts with 'x' and 'y' keys
        
    Returns:
        Angle in degrees at point b
    """
    ba = (a['x'] - b['x'], a['y'] - b['y'])
    bc = (c['x'] - b['x'], c['y'] - b['y'])
    
    dot = ba[0] * bc[0] + ba[1] * bc[1]
    mag_ba = math.sqrt(ba[0]**2 + ba[1]**2)
    mag_bc = math.sqrt(bc[0]**2 + bc[1]**2)
    
    if mag_ba * mag_bc == 0:
        return 0
    
    cos_angle = dot / (mag_ba * mag_bc)
    cos_angle = max(-1, min(1, cos_angle))  # Clamp for numerical stability
    return math.degrees(math.acos(cos_angle))


def calculate_quality_score(img_array: np.ndarray, brightness: float, contrast: float) -> str:
    """
    Calculate an overall image quality score.
    """
    # Ideal ranges for progress photos
    ideal_brightness = (80, 180)
    ideal_contrast = (40, 80)
    
    brightness_ok = ideal_brightness[0] <= brightness <= ideal_brightness[1]
    contrast_ok = ideal_contrast[0] <= contrast <= ideal_contrast[1]
    
    # Check resolution
    height, width = img_array.shape[:2]
    resolution_ok = width >= 640 and height >= 480
    
    if brightness_ok and contrast_ok and resolution_ok:
        return 'excellent'
    elif (brightness_ok or contrast_ok) and resolution_ok:
        return 'good'
    elif resolution_ok:
        return 'fair'
    else:
        return 'poor'


def generate_recommendations(quality_score: str, brightness: float, pose_detected: bool) -> list:
    """
    Generate recommendations for better progress photos.
    """
    recommendations = []
    
    if quality_score in ('fair', 'poor'):
        if brightness < 80:
            recommendations.append("Try to take photos in better lighting conditions")
        elif brightness > 180:
            recommendations.append("The image may be overexposed, try softer lighting")
            
    if quality_score == 'poor':
        recommendations.append("Consider using a higher resolution camera")
    
    if not pose_detected:
        recommendations.append("No body pose detected - ensure your full body is visible in the frame")
    
    if not recommendations:
        recommendations.append("Great photo quality! Keep it up!")
        
    return recommendations
