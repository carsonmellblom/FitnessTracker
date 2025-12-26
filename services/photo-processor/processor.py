"""
Photo Processor Module
Handles thumbnail generation and body composition analysis
"""
import json
import os
from datetime import datetime
from io import BytesIO
from PIL import Image
import numpy as np

from config import THUMBNAIL_SIZE, UPLOADS_PATH


def process_photo(image_path: str, photo_id: int) -> dict:
    """
    Process a photo: generate thumbnail and perform body analysis.
    
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
        'body_analysis': None,
        'error': None
    }
    
    try:
        # Open and process the image
        with Image.open(image_path) as img:
            # Get original image info
            original_size = img.size
            original_format = img.format or 'JPEG'
            
            # Generate thumbnail
            thumbnail_path = generate_thumbnail(img, image_path, photo_id)
            result['thumbnail_path'] = thumbnail_path
            
            # Perform body composition analysis
            body_analysis = analyze_body_composition(img)
            body_analysis['original_dimensions'] = {
                'width': original_size[0],
                'height': original_size[1]
            }
            body_analysis['format'] = original_format
            result['body_analysis'] = body_analysis
            
            result['success'] = True
            
    except Exception as e:
        result['error'] = str(e)
        print(f"Error processing photo {photo_id}: {e}")
    
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
    
    print(f"Generated thumbnail for photo {photo_id}: {thumbnail_path}")
    return f"/uploads/{thumbnail_name}"


def analyze_body_composition(img: Image.Image) -> dict:
    """
    Perform basic body composition analysis on the image.
    This is a simplified analysis - in production, you would use
    a proper ML model like MediaPipe or OpenPose.
    
    Args:
        img: PIL Image object
        
    Returns:
        dict with analysis results
    """
    # Convert to numpy array for analysis
    img_array = np.array(img.convert('RGB'))
    
    # Basic image statistics
    brightness = np.mean(img_array)
    contrast = np.std(img_array)
    
    # Color distribution analysis
    r_mean, g_mean, b_mean = np.mean(img_array, axis=(0, 1))
    
    # Detect dominant colors (simplified)
    # In a real app, you'd use skin tone detection for body analysis
    skin_tone_detected = detect_skin_tones(img_array)
    
    # Calculate image quality score
    quality_score = calculate_quality_score(img_array, brightness, contrast)
    
    analysis = {
        'analyzed_at': datetime.utcnow().isoformat(),
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
            'skin_tones_detected': bool(skin_tone_detected),
            'pose_detected': False,  # Would require ML model
            'landmarks': []  # Would contain body landmarks with ML
        },
        'recommendations': generate_recommendations(quality_score, brightness)
    }
    
    return analysis


def detect_skin_tones(img_array: np.ndarray) -> bool:
    """
    Simple skin tone detection based on color ranges.
    """
    # Convert to HSV-like analysis
    r, g, b = img_array[:,:,0], img_array[:,:,1], img_array[:,:,2]
    
    # Simple skin color detection (RGB ranges for various skin tones)
    skin_mask = (
        (r > 95) & (g > 40) & (b > 20) &
        ((np.maximum(r, np.maximum(g, b)) - np.minimum(r, np.minimum(g, b))) > 15) &
        (np.abs(r.astype(int) - g.astype(int)) > 15) &
        (r > g) & (r > b)
    )
    
    skin_percentage = np.sum(skin_mask) / skin_mask.size * 100
    return skin_percentage > 10  # At least 10% skin tones detected


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


def generate_recommendations(quality_score: str, brightness: float) -> list:
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
        
    if not recommendations:
        recommendations.append("Great photo quality! Keep it up!")
        
    return recommendations
