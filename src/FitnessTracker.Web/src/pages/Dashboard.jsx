import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    CardMedia,
    CardHeader,
    Button,
    CircularProgress,
    Paper,
    List,
    ListItem,
    ListItemText,
    Stack,
} from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import BrokenImageIcon from '@mui/icons-material/BrokenImage';
import { workoutsApi, photosApi, getPhotoUrl } from '../services/api';

function Dashboard() {
    const [stats, setStats] = useState({
        totalWorkouts: 0,
        totalPhotos: 0,
        recentWorkouts: [],
        recentPhotos: [],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [workouts, photos] = await Promise.all([
                workoutsApi.getAll(),
                photosApi.getAll(),
            ]);

            setStats({
                totalWorkouts: workouts.length,
                totalPhotos: photos.length,
                recentWorkouts: workouts.slice(0, 5),
                recentPhotos: photos.slice(0, 4),
            });
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="100vh"
                role="status"
                aria-live="polite"
                aria-label="Loading dashboard"
            >
                <CircularProgress size={60} />
            </Box>
        );
    }

    const totalMinutes = stats.recentWorkouts.reduce((sum, w) => sum + w.durationMinutes, 0);
    const totalExercises = stats.recentWorkouts.reduce((sum, w) => sum + w.exercises.length, 0);

    // Helper function to parse body analysis and get pose type
    const getPoseInfo = (photo) => {
        if (!photo.bodyAnalysis) {
            return { poseType: null, isProcessed: false };
        }
        try {
            const analysis = JSON.parse(photo.bodyAnalysis);
            return {
                poseType: analysis.body_detection.pose_type || null,
                isProcessed: photo.processingStatus === 'Completed'
            };
        } catch {
            return { poseType: null, isProcessed: false };
        }
    };

    // Helper function to format pose name for display
    const formatPoseName = (poseName) => {
        if (!poseName) return null;
        // Convert from snake_case to Title Case
        return poseName
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    return (
        <Box sx={{ py: 4 }}>
            <Container maxWidth="md" sx={{ mx: 'auto' }}>
                {/* Page Header */}
                <Typography
                    component="h1"
                    variant="h4"
                    gutterBottom
                    sx={{ fontWeight: 600, mb: 4, textAlign: 'center' }}
                >
                    Dashboard
                </Typography>

                {/* Stats Grid */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper
                            elevation={2}
                            sx={{
                                p: 3,
                                textAlign: 'center',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                            }}
                        >
                            <Typography
                                variant="h3"
                                component="div"
                                sx={{ fontWeight: 700, color: 'primary.main' }}
                                aria-label={`${stats.totalWorkouts} total workouts`}
                            >
                                {stats.totalWorkouts}
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Total Workouts
                            </Typography>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Paper
                            elevation={2}
                            sx={{
                                p: 3,
                                textAlign: 'center',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                            }}
                        >
                            <Typography
                                variant="h3"
                                component="div"
                                sx={{ fontWeight: 700, color: 'secondary.main' }}
                                aria-label={`${stats.totalPhotos} progress photos`}
                            >
                                {stats.totalPhotos}
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Progress Photos
                            </Typography>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Paper
                            elevation={2}
                            sx={{
                                p: 3,
                                textAlign: 'center',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                            }}
                        >
                            <Typography
                                variant="h3"
                                component="div"
                                sx={{ fontWeight: 700, color: 'success.main' }}
                                aria-label={`${totalMinutes} minutes this week`}
                            >
                                {totalMinutes}
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Minutes This Week
                            </Typography>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Paper
                            elevation={2}
                            sx={{
                                p: 3,
                                textAlign: 'center',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                            }}
                        >
                            <Typography
                                variant="h3"
                                component="div"
                                sx={{ fontWeight: 700, color: 'info.main' }}
                                aria-label={`${totalExercises} exercises completed`}
                            >
                                {totalExercises}
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Exercises Completed
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Recent Activity */}
                <Grid container spacing={3}>
                    {/* Recent Workouts */}
                    <Grid item xs={12} md={6}>
                        <Card elevation={2}>
                            <CardHeader
                                title="Recent Workouts"
                                subheader="Your latest training sessions"
                                action={
                                    <Button
                                        component={RouterLink}
                                        to="/workouts"
                                        variant="outlined"
                                        size="small"
                                        sx={{
                                            minHeight: 36,
                                            textTransform: 'none',
                                        }}
                                    >
                                        View All
                                    </Button>
                                }
                            />
                            <CardContent>
                                {stats.recentWorkouts.length === 0 ? (
                                    <Box
                                        sx={{
                                            textAlign: 'center',
                                            py: 6,
                                            color: 'text.secondary',
                                        }}
                                    >
                                        <FitnessCenterIcon
                                            sx={{ fontSize: 60, mb: 2, opacity: 0.3 }}
                                            aria-hidden="true"
                                        />
                                        <Typography variant="body1">
                                            No workouts yet. Start logging your first workout!
                                        </Typography>
                                    </Box>
                                ) : (
                                    <List disablePadding>
                                        {stats.recentWorkouts.map((workout, index) => (
                                            <ListItem
                                                key={workout.id}
                                                divider={index !== stats.recentWorkouts.length - 1}
                                                sx={{
                                                    px: 0,
                                                    display: 'flex',
                                                    gap: 2,
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <ListItemText
                                                    primary={
                                                        <Typography variant="subtitle1" fontWeight={600}>
                                                            {workout.title}
                                                        </Typography>
                                                    }
                                                    secondary={
                                                        <Typography variant="body2" color="text.secondary">
                                                            {new Date(workout.workoutDate).toLocaleDateString()}
                                                        </Typography>
                                                    }
                                                    sx={{ flex: 1 }}
                                                />
                                                <Stack direction="row" spacing={3}>
                                                    <Box sx={{ textAlign: 'center', minWidth: 60 }}>
                                                        <Typography variant="h6" component="div">
                                                            {workout.durationMinutes}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Minutes
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ textAlign: 'center', minWidth: 60 }}>
                                                        <Typography variant="h6" component="div">
                                                            {workout.exercises.length}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Exercises
                                                        </Typography>
                                                    </Box>
                                                </Stack>
                                            </ListItem>
                                        ))}
                                    </List>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Recent Photos */}
                    <Grid item xs={12} md={6}>
                        <Card elevation={2}>
                            <CardHeader
                                title="Progress Photos"
                                subheader="Track your transformation"
                                action={
                                    <Button
                                        component={RouterLink}
                                        to="/photos"
                                        variant="outlined"
                                        size="small"
                                        sx={{
                                            minHeight: 36,
                                            textTransform: 'none',
                                        }}
                                    >
                                        View All
                                    </Button>
                                }
                            />
                            <CardContent>
                                {stats.recentPhotos.length === 0 ? (
                                    <Box
                                        sx={{
                                            textAlign: 'center',
                                            py: 6,
                                            color: 'text.secondary',
                                        }}
                                    >
                                        <CameraAltIcon
                                            sx={{ fontSize: 60, mb: 2, opacity: 0.3 }}
                                            aria-hidden="true"
                                        />
                                        <Typography variant="body1">
                                            No photos yet. Upload your first progress photo!
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Grid container spacing={2}>
                                        {stats.recentPhotos.map((photo) => {
                                            const { poseType, isProcessed } = getPoseInfo(photo);
                                            const formattedPose = formatPoseName(poseType);
                                            const photoDate = photo.photoTakenAt || photo.uploadedAt;

                                            // Build descriptive alt text
                                            let altText = `Progress photo from ${new Date(photoDate).toLocaleDateString()}`;
                                            if (isProcessed && formattedPose) {
                                                altText += ` showing ${formattedPose} pose`;
                                            } else if (!isProcessed) {
                                                altText += ' (still processing)';
                                            }

                                            // Determine caption text
                                            let captionText;
                                            if (photo.processingStatus === 'Failed') {
                                                captionText = 'Processing Failed';
                                            } else if (!isProcessed) {
                                                captionText = 'Processing...';
                                            } else if (formattedPose) {
                                                captionText = formattedPose;
                                            } else {
                                                captionText = 'No Pose Detected';
                                            }

                                            return (
                                                <Grid item xs={6} key={photo.id}>
                                                    <Box>
                                                        <Typography
                                                            variant="subtitle2"
                                                            fontWeight={600}
                                                            sx={{ mb: 0.5 }}
                                                        >
                                                            {captionText}
                                                        </Typography>
                                                        <Typography
                                                            variant="caption"
                                                            color="text.secondary"
                                                            sx={{ display: 'block', mb: 1 }}
                                                        >
                                                            {new Date(photoDate).toLocaleDateString()}
                                                        </Typography>
                                                        <Card
                                                            variant="outlined"
                                                            sx={{
                                                                '&:focus-within': {
                                                                    outline: '2px solid',
                                                                    outlineColor: 'primary.main',
                                                                    outlineOffset: 2,
                                                                },
                                                            }}
                                                        >
                                                            <CardMedia
                                                                component="img"
                                                                height="150"
                                                                image={getPhotoUrl(photo.id, 'thumbnail')}
                                                                alt={altText}
                                                                title={altText}
                                                                sx={{ objectFit: 'cover' }}
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                    e.target.nextSibling.style.display = 'flex';
                                                                }}
                                                            />
                                                            <Box
                                                                sx={{
                                                                    height: 150,
                                                                    display: 'none',
                                                                    flexDirection: 'column',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    bgcolor: 'action.hover'
                                                                }}
                                                            >
                                                                <BrokenImageIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 0.5 }} />
                                                                <Typography variant="caption" color="text.disabled">
                                                                    Unavailable
                                                                </Typography>
                                                            </Box>
                                                        </Card>
                                                    </Box>
                                                </Grid>
                                            );
                                        })}
                                    </Grid>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}

export default Dashboard;
