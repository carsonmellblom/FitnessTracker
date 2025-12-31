import { useState, useEffect, useRef, useMemo } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    IconButton,
    Grid,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    MenuItem,
    TextField,
    Chip,
    Stack,
    ToggleButtonGroup,
    ToggleButton,
    Divider,
    Paper
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import CropIcon from '@mui/icons-material/Crop';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import BrokenImageIcon from '@mui/icons-material/BrokenImage';
import { photosApi, getPhotoUrl } from '../services/api';
import LandmarkOverlay from '../components/LandmarkOverlay';

// Helper function to get chip color based on quality score
const getQualityScoreColor = (score) => {
    switch (score) {
        case 'excellent':
            return 'success';
        case 'good':
            return 'warning';
        default:
            return 'default';
    }
};

function Photos() {
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [sortBy, setSortBy] = useState('date-desc');
    const [filterPose, setFilterPose] = useState('all');
    const [viewMode, setViewMode] = useState('original');
    const [editingDate, setEditingDate] = useState(false);
    const [newDate, setNewDate] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [photoToDelete, setPhotoToDelete] = useState(null);
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

    const availablePoses = useMemo(() => {
        const poses = new Set();
        photos.forEach(photo => {
            const pose = getPoseType(photo);
            if (pose) poses.add(pose);
        });
        return Array.from(poses).sort((a, b) => a.localeCompare(b));
    }, [photos]);

    const filteredAndSortedPhotos = useMemo(() => {
        let result = [...photos];

        if (filterPose !== 'all') {
            result = result.filter(photo => getPoseType(photo) === filterPose);
        }

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

    const handleDeleteClick = (photo) => {
        setPhotoToDelete(photo);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!photoToDelete) return;

        try {
            await photosApi.delete(photoToDelete.id);
            setDeleteDialogOpen(false);
            setPhotoToDelete(null);
            setSelectedPhoto(null);
            loadPhotos();
        } catch (error) {
            console.error('Failed to delete photo:', error);
            alert('Failed to delete photo.');
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setPhotoToDelete(null);
    };

    const handleUpdateDate = async () => {
        if (!selectedPhoto || !newDate) return;
        try {
            await photosApi.updateDate(selectedPhoto.id, newDate);
            setEditingDate(false);
            loadPhotos();
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
                <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Analysis Results
                    </Typography>

                    {analysis.image_quality && (
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="text.secondary" display="block">
                                Image Quality
                            </Typography>
                            <Chip
                                label={analysis.image_quality.quality_score}
                                color={getQualityScoreColor(analysis.image_quality.quality_score)}
                                size="small"
                            />
                        </Box>
                    )}

                    {analysis.original_dimensions && (
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="text.secondary" display="block">
                                Dimensions
                            </Typography>
                            <Typography variant="body2">
                                {analysis.original_dimensions.width} × {analysis.original_dimensions.height}
                            </Typography>
                        </Box>
                    )}

                    {analysis.body_detection && (
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="text.secondary" display="block">
                                Pose Detection
                            </Typography>
                            {analysis.body_detection.pose_detected ? (
                                <Box>
                                    <Chip
                                        label={analysis.body_detection.pose_type || 'Detected'}
                                        color="success"
                                        size="small"
                                        sx={{ mr: 1 }}
                                    />
                                    <Typography variant="caption" color="text.secondary">
                                        {analysis.body_detection.landmark_count} landmarks • {Math.round((analysis.body_detection.confidence || 0) * 100)}% confidence
                                    </Typography>
                                </Box>
                            ) : (
                                <Typography variant="body2" color="error">
                                    No pose detected
                                </Typography>
                            )}
                        </Box>
                    )}

                    {analysis.recommendations && analysis.recommendations.length > 0 && (
                        <Box>
                            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                                Recommendations
                            </Typography>
                            <Box component="ul" sx={{ pl: 2.5, m: 0 }}>
                                {analysis.recommendations.map((rec, i) => (
                                    <Typography
                                        key={i}
                                        component="li"
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        {typeof rec === 'string' ? rec : (rec.text || rec)}
                                    </Typography>
                                ))}
                            </Box>
                        </Box>
                    )}
                </Box>
            );
        } catch (e) {
            return null;
        }
    };

    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '50vh'
                }}
                role="status"
                aria-label="Loading photos"
            >
                <CircularProgress aria-label="Loading" />
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
            {/* Page Header */}
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <PhotoCameraIcon sx={{ fontSize: 32, color: 'primary.main' }} aria-hidden="true" />
                    <Typography
                        variant="h4"
                        component="h1"
                        sx={{ fontWeight: 'bold' }}
                    >
                        Progress Photos
                    </Typography>
                </Box>
            </Box>

            {/* Upload Zone */}
            <Paper
                sx={{
                    p: 4,
                    mb: 3,
                    textAlign: 'center',
                    border: '2px dashed',
                    borderColor: dragOver ? 'primary.main' : 'divider',
                    bgcolor: dragOver ? 'action.hover' : 'background.paper',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'action.hover'
                    }
                }}
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                role="button"
                aria-label="Upload photos"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        fileInputRef.current?.click();
                    }
                }}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                    aria-label="Select photo files"
                />
                {uploading ? (
                    <Box>
                        <CircularProgress sx={{ mb: 2 }} />
                        <Typography>Uploading...</Typography>
                    </Box>
                ) : (
                    <Box>
                        <CloudUploadIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" gutterBottom>
                            Upload Progress Photos
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Drag and drop photos here, or click to select files
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                            Supports JPEG, PNG, and WebP
                        </Typography>
                    </Box>
                )}
            </Paper>

            {/* Filter and Sort Controls */}
            {photos.length > 0 && (
                <Paper sx={{ p: 2, mb: 3 }}>
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={2}
                        alignItems={{ xs: 'stretch', sm: 'center' }}
                        justifyContent="space-between"
                    >
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField
                                select
                                label="Sort by"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                size="small"
                                sx={{ minWidth: 150 }}
                            >
                                <MenuItem value="date-desc">Date (Newest)</MenuItem>
                                <MenuItem value="date-asc">Date (Oldest)</MenuItem>
                                <MenuItem value="pose">Pose Type</MenuItem>
                            </TextField>

                            <TextField
                                select
                                label="Filter"
                                value={filterPose}
                                onChange={(e) => setFilterPose(e.target.value)}
                                size="small"
                                sx={{ minWidth: 200 }}
                            >
                                <MenuItem value="all">All Poses ({photos.length})</MenuItem>
                                {availablePoses.map(pose => (
                                    <MenuItem key={pose} value={pose}>
                                        {pose} ({photos.filter(p => getPoseType(p) === pose).length})
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Stack>

                        <Typography variant="body2" color="text.secondary">
                            Showing {filteredAndSortedPhotos.length} of {photos.length} photos
                        </Typography>
                    </Stack>
                </Paper>
            )}

            {/* Photo Grid */}
            {photos.length === 0 ? (
                <Card>
                    <CardContent>
                        <Box sx={{ textAlign: 'center', py: 6, px: 2 }}>
                            <PhotoCameraIcon
                                sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }}
                                aria-hidden="true"
                            />
                            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'medium' }}>
                                No photos yet
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Upload your first progress photo to start tracking your transformation!
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            ) : filteredAndSortedPhotos.length === 0 ? (
                <Card>
                    <CardContent>
                        <Box sx={{ textAlign: 'center', py: 6, px: 2 }}>
                            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'medium' }}>
                                No photos match your filter
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                                Try selecting a different pose type or clear the filter.
                            </Typography>
                            <Button
                                variant="contained"
                                onClick={() => setFilterPose('all')}
                            >
                                Show All Photos
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            ) : (
                <Grid container spacing={2}>
                    {filteredAndSortedPhotos.map((photo) => {
                        const poseType = getPoseType(photo);
                        return (
                            <Grid item xs={6} sm={4} md={3} key={photo.id}>
                                <Card
                                    sx={{
                                        cursor: 'pointer',
                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: 4
                                        }
                                    }}
                                    onClick={() => setSelectedPhoto(photo)}
                                    role="button"
                                    aria-label={`View photo ${photo.originalFileName}`}
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            setSelectedPhoto(photo);
                                        }
                                    }}
                                >
                                    <CardContent sx={{ p: 2 }}>
                                        {/* Title and Date */}
                                        <Typography
                                            variant="subtitle2"
                                            sx={{ fontWeight: 'bold', mb: 0.5 }}
                                        >
                                            {poseType || photo.processingStatus}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            display="block"
                                            sx={{ mb: 1.5 }}
                                        >
                                            {new Date(photo.uploadedAt).toLocaleDateString()}
                                        </Typography>

                                        {/* Photo */}
                                        <Box
                                            component="img"
                                            src={getPhotoUrl(photo.id, 'thumbnail')}
                                            alt={photo.originalFileName}
                                            onError={(e) => {
                                                // Only hide if image actually failed to load
                                                if (!e.target.complete || e.target.naturalHeight === 0) {
                                                    e.target.style.display = 'none';
                                                    const sibling = e.target.nextSibling;
                                                    if (sibling) sibling.style.display = 'flex';
                                                }
                                            }}
                                            sx={{
                                                width: '100%',
                                                height: 300,
                                                objectFit: 'cover',
                                                display: 'block',
                                                borderRadius: 1,
                                                bgcolor: 'action.hover'
                                            }}
                                        />
                                        <Box
                                            sx={{
                                                width: '100%',
                                                height: 300,
                                                display: 'none',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                bgcolor: 'action.hover',
                                                borderRadius: 1
                                            }}
                                        >
                                            <BrokenImageIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 1 }} />
                                            <Typography variant="caption" color="text.disabled">
                                                Image unavailable
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={handleDeleteCancel}
                aria-labelledby="delete-photo-dialog-title"
                aria-describedby="delete-photo-dialog-description"
            >
                <DialogTitle id="delete-photo-dialog-title">
                    Delete Photo?
                </DialogTitle>
                <DialogContent>
                    <Typography id="delete-photo-dialog-description">
                        Are you sure you want to delete this photo? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel} autoFocus>
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteConfirm} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Photo Detail Modal */}
            <Dialog
                open={!!selectedPhoto}
                onClose={() => setSelectedPhoto(null)}
                maxWidth="md"
                fullWidth
                aria-labelledby="photo-detail-dialog-title"
            >
                {selectedPhoto && (
                    <>
                        <DialogTitle id="photo-detail-dialog-title">
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="h6" component="span" noWrap>
                                    {selectedPhoto.originalFileName}
                                </Typography>
                                <IconButton
                                    onClick={() => setSelectedPhoto(null)}
                                    aria-label="Close dialog"
                                    size="small"
                                >
                                    <CloseIcon />
                                </IconButton>
                            </Box>
                        </DialogTitle>

                        <DialogContent dividers>
                            {/* View Mode Toggle */}
                            {(getLandmarks(selectedPhoto) || selectedPhoto.croppedImageUrl) && (
                                <Box sx={{ mb: 2 }}>
                                    <ToggleButtonGroup
                                        value={viewMode}
                                        exclusive
                                        onChange={(e, newMode) => newMode && setViewMode(newMode)}
                                        size="small"
                                        aria-label="View mode"
                                    >
                                        <ToggleButton value="original" aria-label="Original view">
                                            <PhotoCameraIcon fontSize="small" sx={{ mr: 0.5 }} />
                                            Original
                                        </ToggleButton>
                                        {getLandmarks(selectedPhoto) && (
                                            <ToggleButton value="landmarks" aria-label="Landmarks view">
                                                <AccessibilityNewIcon fontSize="small" sx={{ mr: 0.5 }} />
                                                Landmarks
                                            </ToggleButton>
                                        )}
                                        {selectedPhoto.croppedImageUrl && (
                                            <ToggleButton value="cropped" aria-label="Cropped view">
                                                <CropIcon fontSize="small" sx={{ mr: 0.5 }} />
                                                Cropped
                                            </ToggleButton>
                                        )}
                                    </ToggleButtonGroup>
                                </Box>
                            )}

                            {/* Photo Display */}
                            <Box sx={{ position: 'relative', display: 'inline-block', width: '100%', mb: 3 }}>
                                <Box
                                    component="img"
                                    ref={modalImageRef}
                                    src={getPhotoUrl(
                                        selectedPhoto.id,
                                        viewMode === 'cropped' ? 'cropped' : 'original'
                                    )}
                                    alt={selectedPhoto.originalFileName}
                                    sx={{
                                        width: '100%',
                                        maxHeight: '400px',
                                        objectFit: 'contain',
                                        borderRadius: 1
                                    }}
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                    }}
                                />
                                <Box
                                    sx={{
                                        width: '100%',
                                        height: '400px',
                                        display: 'none',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        bgcolor: 'action.hover',
                                        borderRadius: 1
                                    }}
                                >
                                    <BrokenImageIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
                                    <Typography variant="h6" color="text.disabled">
                                        Image Not Found
                                    </Typography>
                                </Box>
                                {viewMode === 'landmarks' && (
                                    <LandmarkOverlay
                                        landmarks={getLandmarks(selectedPhoto)}
                                        imageRef={modalImageRef}
                                        visible={true}
                                    />
                                )}
                            </Box>

                            {/* Photo Metadata */}
                            <Grid container spacing={2} sx={{ mb: 2 }}>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        Status
                                    </Typography>
                                    <Chip
                                        label={selectedPhoto.processingStatus}
                                        size="small"
                                        color={selectedPhoto.processingStatus === 'Completed' ? 'success' : 'default'}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        Uploaded
                                    </Typography>
                                    <Typography variant="body2">
                                        {new Date(selectedPhoto.uploadedAt).toLocaleString()}
                                    </Typography>
                                </Grid>
                            </Grid>

                            {/* Photo Taken Date */}
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                                    Photo Taken
                                    {!editingDate && (
                                        <IconButton
                                            size="small"
                                            onClick={() => {
                                                setEditingDate(true);
                                                setNewDate(selectedPhoto.photoTakenAt
                                                    ? new Date(selectedPhoto.photoTakenAt).toISOString().slice(0, 16)
                                                    : new Date().toISOString().slice(0, 16));
                                            }}
                                            aria-label="Edit photo taken date"
                                            sx={{ ml: 1 }}
                                        >
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                    )}
                                </Typography>
                                {editingDate ? (
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <TextField
                                            type="datetime-local"
                                            value={newDate}
                                            onChange={(e) => setNewDate(e.target.value)}
                                            size="small"
                                            fullWidth
                                        />
                                        <Button size="small" variant="contained" onClick={handleUpdateDate}>
                                            Save
                                        </Button>
                                        <Button size="small" onClick={() => setEditingDate(false)}>
                                            Cancel
                                        </Button>
                                    </Stack>
                                ) : (
                                    <Typography variant="body2">
                                        {selectedPhoto.photoTakenAt
                                            ? new Date(selectedPhoto.photoTakenAt).toLocaleString()
                                            : <em style={{ color: 'var(--text-muted)' }}>Not set (using upload date)</em>}
                                    </Typography>
                                )}
                            </Box>

                            {/* Processing Error */}
                            {selectedPhoto.processingError && (
                                <Paper
                                    sx={{
                                        p: 2,
                                        mb: 2,
                                        bgcolor: 'error.lighter',
                                        border: '1px solid',
                                        borderColor: 'error.main'
                                    }}
                                >
                                    <Typography variant="caption" color="error" display="block" fontWeight="bold">
                                        Processing Error
                                    </Typography>
                                    <Typography variant="body2">{selectedPhoto.processingError}</Typography>
                                </Paper>
                            )}

                            {/* Body Analysis */}
                            {selectedPhoto.bodyAnalysis && renderBodyAnalysis(selectedPhoto.bodyAnalysis)}
                        </DialogContent>

                        <DialogActions>
                            <Button
                                startIcon={<DeleteIcon />}
                                color="error"
                                onClick={() => handleDeleteClick(selectedPhoto)}
                            >
                                Delete Photo
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Box>
    );
}

export default Photos;
