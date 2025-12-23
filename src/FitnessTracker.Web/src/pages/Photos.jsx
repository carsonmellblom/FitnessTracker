import { useState, useEffect, useRef } from 'react';
import { photosApi, getImageUrl } from '../services/api';

function Photos() {
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const fileInputRef = useRef(null);

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
                            <div className="card-subtitle" style={{ marginBottom: '0.25rem' }}>Body Detection</div>
                            <span>{analysis.body_detection.skin_tones_detected ? '✅ Detected' : '❌ Not detected'}</span>
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
                style={{ marginBottom: '2rem' }}
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

            {/* Photo Grid */}
            {photos.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon">📷</div>
                        <h3>No photos yet</h3>
                        <p>Upload your first progress photo to start tracking your transformation!</p>
                    </div>
                </div>
            ) : (
                <div className="photo-grid">
                    {photos.map((photo) => (
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
                                <span className={`badge badge-${photo.processingStatus.toLowerCase()}`}>
                                    {photo.processingStatus}
                                </span>
                                <div style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                                    {new Date(photo.uploadedAt).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    ))}
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
                            <img
                                src={getImageUrl(selectedPhoto.imageUrl)}
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
