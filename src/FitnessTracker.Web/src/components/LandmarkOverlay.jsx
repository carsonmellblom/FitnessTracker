import { useRef, useEffect, useState } from 'react';

/**
 * MediaPipe pose skeleton connections
 * Each pair represents [startLandmarkIndex, endLandmarkIndex]
 */
const POSE_CONNECTIONS = [
    // Face
    [0, 1], [1, 2], [2, 3], [3, 7],  // Left eye
    [0, 4], [4, 5], [5, 6], [6, 8],  // Right eye
    [9, 10],  // Mouth

    // Torso
    [11, 12],  // Shoulders
    [11, 23], [12, 24],  // Shoulder to hip
    [23, 24],  // Hips

    // Left arm
    [11, 13], [13, 15],  // Upper arm to forearm
    [15, 17], [15, 19], [15, 21], [17, 19],  // Wrist to fingers

    // Right arm
    [12, 14], [14, 16],  // Upper arm to forearm
    [16, 18], [16, 20], [16, 22], [18, 20],  // Wrist to fingers

    // Left leg
    [23, 25], [25, 27],  // Thigh to shin
    [27, 29], [27, 31], [29, 31],  // Ankle to foot

    // Right leg
    [24, 26], [26, 28],  // Thigh to shin
    [28, 30], [28, 32], [30, 32],  // Ankle to foot
];

/**
 * Calculate the actual rendered position and size of an image with object-fit: contain
 */
function getContainedImageRect(imgElement) {
    const containerWidth = imgElement.clientWidth;
    const containerHeight = imgElement.clientHeight;
    const naturalWidth = imgElement.naturalWidth;
    const naturalHeight = imgElement.naturalHeight;

    if (!naturalWidth || !naturalHeight) {
        return { x: 0, y: 0, width: containerWidth, height: containerHeight };
    }

    const containerRatio = containerWidth / containerHeight;
    const imageRatio = naturalWidth / naturalHeight;

    let renderedWidth, renderedHeight, offsetX, offsetY;

    if (imageRatio > containerRatio) {
        // Image is wider than container (letterboxed top/bottom)
        renderedWidth = containerWidth;
        renderedHeight = containerWidth / imageRatio;
        offsetX = 0;
        offsetY = (containerHeight - renderedHeight) / 2;
    } else {
        // Image is taller than container (letterboxed left/right)
        renderedHeight = containerHeight;
        renderedWidth = containerHeight * imageRatio;
        offsetX = (containerWidth - renderedWidth) / 2;
        offsetY = 0;
    }

    return {
        x: offsetX,
        y: offsetY,
        width: renderedWidth,
        height: renderedHeight
    };
}

/**
 * LandmarkOverlay - Canvas overlay to draw pose landmarks on an image
 * 
 * @param {Object} props
 * @param {Array} props.landmarks - Array of landmark objects with {x, y, visibility}
 * @param {Object} props.imageRef - React ref to the image element
 * @param {boolean} props.visible - Whether to show the overlay
 */
function LandmarkOverlay({ landmarks, imageRef, visible }) {
    const canvasRef = useRef(null);
    const [imageRect, setImageRect] = useState(null);

    // Update canvas size when image loads or window resizes
    useEffect(() => {
        const updateSize = () => {
            if (imageRef?.current && imageRef.current.complete) {
                const rect = getContainedImageRect(imageRef.current);
                setImageRect({
                    containerWidth: imageRef.current.clientWidth,
                    containerHeight: imageRef.current.clientHeight,
                    ...rect
                });
            }
        };

        // Initial update
        updateSize();

        // Also update when image loads
        const img = imageRef?.current;
        if (img) {
            img.addEventListener('load', updateSize);
        }

        window.addEventListener('resize', updateSize);
        return () => {
            window.removeEventListener('resize', updateSize);
            if (img) {
                img.removeEventListener('load', updateSize);
            }
        };
    }, [imageRef, visible]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !landmarks || !visible || !imageRect) return;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, imageRect.containerWidth, imageRect.containerHeight);

        const { x: offsetX, y: offsetY, width, height } = imageRect;

        // Draw connections first (so dots appear on top)
        ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)';
        ctx.lineWidth = 3;

        POSE_CONNECTIONS.forEach(([startIdx, endIdx]) => {
            const start = landmarks[startIdx];
            const end = landmarks[endIdx];

            if (!start || !end) return;
            if (start.visibility < 0.5 || end.visibility < 0.5) return;

            ctx.beginPath();
            ctx.moveTo(offsetX + start.x * width, offsetY + start.y * height);
            ctx.lineTo(offsetX + end.x * width, offsetY + end.y * height);
            ctx.stroke();
        });

        // Draw landmark points
        landmarks.forEach((lm) => {
            if (lm.visibility < 0.5) return;

            const x = offsetX + lm.x * width;
            const y = offsetY + lm.y * height;

            // Outer circle (dark outline)
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, 2 * Math.PI);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fill();

            // Inner circle (bright color)
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fillStyle = '#00ff00';
            ctx.fill();
        });

    }, [landmarks, imageRect, visible]);

    if (!visible || !landmarks || !imageRect) return null;

    return (
        <canvas
            ref={canvasRef}
            width={imageRect.containerWidth}
            height={imageRect.containerHeight}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                pointerEvents: 'none',
            }}
        />
    );
}

export default LandmarkOverlay;
