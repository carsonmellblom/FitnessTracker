import { useState, useEffect, useRef, useMemo } from 'react';
import { photosApi, getImageUrl } from '../services/api';
import LandmarkOverlay from '../components/LandmarkOverlay';

function Photos() {
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [sortBy, setSortBy] = useState('date-desc');
    const [filterPose, setFilterPose] = useState('all');
    const [viewMode, setViewMode] = useState('original'); // 'original', 'landmarks', 'cropped'
    const [editingDate, setEditingDate] = useState(false);
    const [newDate, setNewDate] = useState('');
    const fileInputRef = useRef(null);
    const modalImageRef = useRef(null);

    useEffect(() => {
        loadPhotos();
    }, []);

    const loadPhotos = async () => {
        try {
            const data = await photosApi.getAll();
            setPhotos(data);
        } catch (error) {
            console.error('Failed to load photos:', error);
        } finally {
            setLoading(false);
        }
    };

    // Extract pose type from photo's body analysis
    const getPoseType = (photo) => {
        if (!photo.bodyAnalysis) return null;
        try {
            const analysis = typeof photo.bodyAnalysis === 'string'
                ? JSON.parse(photo.bodyAnalysis)
                : photo.bodyAnalysis;
            return analysis?.body_detection?.pose_type || null;
        } catch {
            return null;
        }
    };

    // Extract landmarks from photo's body analysis
    const getLandmarks = (photo) => {
        if (!photo?.bodyAnalysis) return null;
        try {
            const analysis = typeof photo.bodyAnalysis === 'string'
                ? JSON.parse(photo.bodyAnalysis)
                : photo.bodyAnalysis;
            return analysis?.body_detection?.landmarks || null;
        } catch {
            return null;
        }
    };

    // Get unique pose types for filter dropdown
    const availablePoses = useMemo(() => {
        const poses = new Set();
        photos.forEach(photo => {
            const pose = getPoseType(photo);
            if (pose) poses.add(pose);
        });
        return Array.from(poses).sort();
    }, [photos]);

    // Filter and sort photos
    const filteredAndSortedPhotos = useMemo(() => {
        let result = [...photos];

        // Filter by pose type
        if (filterPose !== 'all') {
            result = result.filter(photo => getPoseType(photo) === filterPose);
        }

        // Sort
        result.sort((a, b) => {
            switch (sortBy) {
                case 'date-desc':
                    return new Date(b.uploadedAt) - new Date(a.uploadedAt);
                case 'date-asc':
                    return new Date(a.uploadedAt) - new Date(b.uploadedAt);
                case 'pose':
                    const poseA = getPoseType(a) || 'zzz';
                    const poseB = getPoseType(b) || 'zzz';
                    return poseA.localeCompare(poseB);
                default:
                    return 0;
            }
        });

        return result;
    }, [photos, sortBy, filterPose]);

    const handleUpload = async (files) => {
        if (!files || files.length === 0) return;

        setUploading(true);
        try {
            for (const file of files) {
                await photosApi.upload(file);
            }
            loadPhotos();
        } catch (error) {
            console.error('Failed to upload photo:', error);
            alert('Failed to upload photo. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleFileSelect = (e) => {
        handleUpload(e.target.files);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        handleUpload(e.dataTransfer.files);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = () => {
        setDragOver(false);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this photo?')) return;
        try {
            await photosApi.delete(id);
            setSelectedPhoto(null);
            loadPhotos();
        } catch (error) {
            console.error('Failed to delete photo:', error);
        }
    };

    const handleUpdateDate = async () => {
        if (!selectedPhoto || !newDate) return;
        try {
            await photosApi.updateDate(selectedPhoto.id, newDate);
            setEditingDate(false);
            loadPhotos();
            // Update selectedPhoto with new date
            setSelectedPhoto({ ...selectedPhoto, photoTakenAt: newDate });
        } catch (error) {
            console.error('Failed to update photo date:', error);
        }
    };

    const renderBodyAnalysis = (bodyAnalysis) => {
        if (!bodyAnalysis) return null;

        try {
            const analysis = typeof bodyAnalysis === 'string' ? JSON.parse(bodyAnalysis) : bodyAnalysis;

            return (
                <div style={{ marginTop: '1rem' }}>
                    <h4 style={{ marginBottom: '0.5rem' }}>Analysis Results</h4>

                    {analysis.image_quality && (
                        <div style={{ marginBottom: '0.75rem' }}>
                            <div className="card-subtitle" style={{ marginBottom: '0.25rem' }}>Image Quality</div>
                            <span className={`badge badge-${analysis.image_quality.quality_score === 'excellent' ? 'completed' : analysis.image_quality.quality_score === 'good' ? 'processing' : 'pending'}`}>
                                {analysis.image_quality.quality_score}
                            </span>
                        </div>
                    )}

                    {analysis.original_dimensions && (
                        <div style={{ marginBottom: '0.75rem' }}>
                            <div className="card-subtitle" style={{ marginBottom: '0.25rem' }}>Dimensions</div>
                            <span>{analysis.original_dimensions.width} × {analysis.original_dimensions.height}</span>
                        </div>
                    )}

                    {analysis.body_detection && (
                        <div style={{ marginBottom: '0.75rem' }}>
                            <div className="card-subtitle" style={{ marginBottom: '0.25rem' }}>Pose Detection</div>
                            {analysis.body_detection.pose_detected ? (
                                <div>
                                    <span className="badge badge-completed" style={{ marginRight: '0.5rem' }}>
                                        {analysis.body_detection.pose_type || 'Detected'}
                                    </span>
                                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                        {analysis.body_detection.landmark_count} landmarks • {Math.round((analysis.body_detection.confidence || 0) * 100)}% confidence
                                    </span>
                                </div>
                            ) : (
                                <span style={{ color: 'var(--text-secondary)' }}>❌ No pose detected</span>
                            )}
                        </div>
                    )}

                    {analysis.recommendations && analysis.recommendations.length > 0 && (
                        <div>
                            <div className="card-subtitle" style={{ marginBottom: '0.25rem' }}>Recommendations</div>
                            <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
                                {analysis.recommendations.map((rec, i) => (
                                    <li key={i} style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{rec}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            );
        } catch (e) {
            return null;
        }
    };

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1 className="page-title">Progress Photos</h1>
            </div>

            {/* Upload Zone */}
            <div
                className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                style={{ marginBottom: '1.5rem' }}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                />
                {uploading ? (
                    <>
                        <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
                        <p>Uploading...</p>
                    </>
                ) : (
                    <>
                        <div className="upload-icon">📸</div>
                        <h3>Upload Progress Photos</h3>
                        <p className="card-subtitle">
                            Drag and drop photos here, or click to select files
                        </p>
                        <p className="card-subtitle">
                            Supports JPEG, PNG, and WebP
                        </p>
                    </>
                )}
            </div>

            {/* Filter and Sort Controls */}
            {photos.length > 0 && (
                <div className="filter-bar">
                    <div className="filter-group">
                        <label htmlFor="sort-select">Sort by:</label>
                        <select
                            id="sort-select"
                            className="filter-select"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="date-desc">Date (Newest)</option>
                            <option value="date-asc">Date (Oldest)</option>
                            <option value="pose">Pose Type</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label htmlFor="filter-select">Filter:</label>
                        <select
                            id="filter-select"
                            className="filter-select"
                            value={filterPose}
                            onChange={(e) => setFilterPose(e.target.value)}
                        >
                            <option value="all">All Poses ({photos.length})</option>
                            {availablePoses.map(pose => (
                                <option key={pose} value={pose}>
                                    {pose} ({photos.filter(p => getPoseType(p) === pose).length})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-count">
                        Showing {filteredAndSortedPhotos.length} of {photos.length} photos
                    </div>
                </div>
            )}

            {/* Photo Grid */}
            {photos.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon">📷</div>
                        <h3>No photos yet</h3>
                        <p>Upload your first progress photo to start tracking your transformation!</p>
                    </div>
                </div>
            ) : filteredAndSortedPhotos.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon">🔍</div>
                        <h3>No photos match your filter</h3>
                        <p>Try selecting a different pose type or clear the filter.</p>
                        <button className="btn btn-primary" onClick={() => setFilterPose('all')}>
                            Show All Photos
                        </button>
                    </div>
                </div>
            ) : (
                <div className="photo-grid">
                    {filteredAndSortedPhotos.map((photo) => {
                        const poseType = getPoseType(photo);
                        return (
                            <div
                                key={photo.id}
                                className="photo-card"
                                onClick={() => setSelectedPhoto(photo)}
                            >
                                <img
                                    src={getImageUrl(photo.thumbnailUrl || photo.imageUrl)}
                                    alt={photo.originalFileName}
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/300?text=Image';
                                    }}
                                />
                                <div className="photo-overlay">
                                    {poseType && (
                                        <span className="badge badge-pose">
                                            {poseType}
                                        </span>
                                    )}
                                    {!poseType && (
                                        <span className={`badge badge-${photo.processingStatus.toLowerCase()}`}>
                                            {photo.processingStatus}
                                        </span>
                                    )}
                                    <div className="photo-date">
                                        {new Date(photo.uploadedAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Photo Detail Modal */}
            {selectedPhoto && (
                <div className="modal-overlay" onClick={() => setSelectedPhoto(null)}>
                    <div
                        className="modal"
                        style={{ maxWidth: '800px' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h2 className="modal-title">{selectedPhoto.originalFileName}</h2>
                            <button
                                className="btn btn-secondary btn-icon"
                                onClick={() => setSelectedPhoto(null)}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="modal-body">
                            {/* Image toggle buttons */}
                            {(getLandmarks(selectedPhoto) || selectedPhoto.croppedImageUrl) && (
                                <div style={{ marginBottom: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        className={`btn btn-sm ${viewMode === 'original' ? 'btn-primary' : 'btn-secondary'}`}
                                        onClick={() => setViewMode('original')}
                                    >
                                        📷 Original
                                    </button>
                                    {getLandmarks(selectedPhoto) && (
                                        <button
                                            className={`btn btn-sm ${viewMode === 'landmarks' ? 'btn-primary' : 'btn-secondary'}`}
                                            onClick={() => setViewMode('landmarks')}
                                        >
                                            🦴 Landmarks
                                        </button>
                                    )}
                                    {selectedPhoto.croppedImageUrl && (
                                        <button
                                            className={`btn btn-sm ${viewMode === 'cropped' ? 'btn-primary' : 'btn-secondary'}`}
                                            onClick={() => setViewMode('cropped')}
                                        >
                                            ✂️ Cropped
                                        </button>
                                    )}
                                </div>
                            )}
                            <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
                                <img
                                    ref={modalImageRef}
                                    src={getImageUrl(
                                        viewMode === 'cropped' && selectedPhoto.croppedImageUrl
                                            ? selectedPhoto.croppedImageUrl
                                            : selectedPhoto.imageUrl
                                    )}
                                    alt={selectedPhoto.originalFileName}
                                    style={{
                                        width: '100%',
                                        maxHeight: '400px',
                                        objectFit: 'contain',
                                        borderRadius: 'var(--radius-md)',
                                        marginBottom: '1rem',
                                    }}
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/600x400?text=Image+Not+Found';
                                    }}
                                />
                                {viewMode === 'landmarks' && (
                                    <LandmarkOverlay
                                        landmarks={getLandmarks(selectedPhoto)}
                                        imageRef={modalImageRef}
                                        visible={true}
                                    />
                                )}
                            </div>

                            <div className="grid grid-2" style={{ gap: '1rem' }}>
                                <div>
                                    <div className="card-subtitle">Status</div>
                                    <span className={`badge badge-${selectedPhoto.processingStatus.toLowerCase()}`}>
                                        {selectedPhoto.processingStatus}
                                    </span>
                                </div>
                                <div>
                                    <div className="card-subtitle">Uploaded</div>
                                    <span>
                                        {new Date(selectedPhoto.uploadedAt).toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            {/* Photo Taken Date */}
                            <div style={{ marginTop: '1rem' }}>
                                <div className="card-subtitle" style={{ marginBottom: '0.25rem' }}>
                                    Photo Taken
                                    {!editingDate && (
                                        <button
                                            className="btn btn-xs btn-secondary"
                                            style={{ marginLeft: '0.5rem' }}
                                            onClick={() => {
                                                setEditingDate(true);
                                                setNewDate(selectedPhoto.photoTakenAt
                                                    ? new Date(selectedPhoto.photoTakenAt).toISOString().slice(0, 16)
                                                    : new Date().toISOString().slice(0, 16));
                                            }}
                                        >
                                            ✏️ Edit
                                        </button>
                                    )}
                                </div>
                                {editingDate ? (
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <input
                                            type="datetime-local"
                                            className="form-input"
                                            style={{ maxWidth: '250px' }}
                                            value={newDate}
                                            onChange={(e) => setNewDate(e.target.value)}
                                        />
                                        <button className="btn btn-sm btn-primary" onClick={handleUpdateDate}>Save</button>
                                        <button className="btn btn-sm btn-secondary" onClick={() => setEditingDate(false)}>Cancel</button>
                                    </div>
                                ) : (
                                    <span>
                                        {selectedPhoto.photoTakenAt
                                            ? new Date(selectedPhoto.photoTakenAt).toLocaleString()
                                            : <em style={{ color: 'var(--text-muted)' }}>Not set (using upload date)</em>}
                                    </span>
                                )}
                            </div>

                            {selectedPhoto.processingError && (
                                <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-md)' }}>
                                    <div className="card-subtitle" style={{ color: 'var(--accent-danger)' }}>Processing Error</div>
                                    <p>{selectedPhoto.processingError}</p>
                                </div>
                            )}

                            {selectedPhoto.bodyAnalysis && renderBodyAnalysis(selectedPhoto.bodyAnalysis)}
                        </div>

                        <div className="modal-footer">
                            <button
                                className="btn btn-danger"
                                onClick={() => handleDelete(selectedPhoto.id)}
                            >
                                🗑️ Delete Photo
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Photos;
