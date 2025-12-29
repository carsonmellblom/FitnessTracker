import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    CardActions,
    Button,
    IconButton,
    Grid,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Chip,
    Stack,
    Divider
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import { workoutsApi, exerciseDefinitionsApi } from '../services/api';
import WorkoutModal from '../components/WorkoutModal';

function Workouts() {
    const [workouts, setWorkouts] = useState([]);
    const [definitions, setDefinitions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingWorkout, setEditingWorkout] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [workoutToDelete, setWorkoutToDelete] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [workoutsData, definitionsData] = await Promise.all([
                workoutsApi.getAll(),
                exerciseDefinitionsApi.getAll()
            ]);
            setWorkouts(workoutsData);
            setDefinitions(definitionsData);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadWorkouts = async () => {
        try {
            const data = await workoutsApi.getAll();
            setWorkouts(data);
        } catch (error) {
            console.error('Failed to load workouts:', error);
        }
    };

    const handleOpenModal = (workout = null) => {
        setEditingWorkout(workout);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingWorkout(null);
    };

    const handleDeleteClick = (workout) => {
        setWorkoutToDelete(workout);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!workoutToDelete) return;

        try {
            await workoutsApi.delete(workoutToDelete.id);
            setDeleteDialogOpen(false);
            setWorkoutToDelete(null);
            loadWorkouts();
        } catch (error) {
            console.error('Failed to delete workout:', error);
            alert(error.message || 'Failed to delete workout. Please try again.');
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setWorkoutToDelete(null);
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
                aria-label="Loading workouts"
            >
                <CircularProgress aria-label="Loading" />
            </Box>
        );
    }

    return (
        <Box>
            {/* Page Header */}
            <Box sx={{ mb: 4 }}>
                <Typography
                    variant="h4"
                    component="h1"
                    gutterBottom
                    sx={{ fontWeight: 'bold' }}
                >
                    Workouts
                </Typography>
            </Box>

            {/* Empty State */}
            {workouts.length === 0 ? (
                <Card>
                    <CardContent>
                        <Box
                            sx={{
                                textAlign: 'center',
                                py: 6,
                                px: 2
                            }}
                        >
                            <FitnessCenterIcon
                                sx={{
                                    fontSize: 80,
                                    color: 'text.secondary',
                                    mb: 2
                                }}
                                aria-hidden="true"
                            />
                            <Typography
                                variant="h5"
                                component="h2"
                                gutterBottom
                                sx={{ fontWeight: 'medium' }}
                            >
                                No workouts yet
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Go to the Calendar page to log your first workout!
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            ) : (
                <Grid container spacing={3}>
                    {workouts.map((workout) => (
                        <Grid item xs={12} md={6} key={workout.id}>
                            <Card
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                                component="article"
                                aria-label={`Workout: ${workout.title}`}
                            >
                                <CardContent sx={{ flexGrow: 1 }}>
                                    {/* Card Header */}
                                    <Box sx={{ mb: 2 }}>
                                        <Box sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start',
                                            mb: 1
                                        }}>
                                            <Typography
                                                variant="h6"
                                                component="h2"
                                                sx={{ fontWeight: 'bold' }}
                                            >
                                                {workout.title}
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleOpenModal(workout)}
                                                    aria-label={`Edit ${workout.title}`}
                                                    sx={{
                                                        '&:focus-visible': {
                                                            outline: '2px solid',
                                                            outlineColor: 'primary.main',
                                                        }
                                                    }}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleDeleteClick(workout)}
                                                    aria-label={`Delete ${workout.title}`}
                                                    sx={{
                                                        '&:focus-visible': {
                                                            outline: '2px solid',
                                                            outlineColor: 'error.main',
                                                        }
                                                    }}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        </Box>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            component="time"
                                            dateTime={workout.workoutDate}
                                        >
                                            {new Date(workout.workoutDate).toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </Typography>
                                    </Box>

                                    {/* Description */}
                                    {workout.description && (
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ mb: 2 }}
                                        >
                                            {workout.description}
                                        </Typography>
                                    )}

                                    {/* Stats */}
                                    <Stack
                                        direction="row"
                                        spacing={3}
                                        sx={{ mb: 2 }}
                                        component="dl"
                                    >
                                        <Box>
                                            <Typography
                                                variant="h5"
                                                component="dt"
                                                sx={{
                                                    fontWeight: 'bold',
                                                    color: 'primary.main'
                                                }}
                                                aria-label={`Duration: ${workout.durationMinutes} minutes`}
                                            >
                                                {workout.durationMinutes}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                component="dd"
                                                color="text.secondary"
                                                aria-hidden="true"
                                            >
                                                Minutes
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography
                                                variant="h5"
                                                component="dt"
                                                sx={{
                                                    fontWeight: 'bold',
                                                    color: 'primary.main'
                                                }}
                                                aria-label={`${workout.exercises.length} exercises`}
                                            >
                                                {workout.exercises.length}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                component="dd"
                                                color="text.secondary"
                                                aria-hidden="true"
                                            >
                                                Exercises
                                            </Typography>
                                        </Box>
                                    </Stack>

                                    {/* Exercises List */}
                                    {workout.exercises.length > 0 && (
                                        <Box
                                            component="section"
                                            aria-label="Exercises"
                                        >
                                            <Divider sx={{ mb: 2 }} />
                                            <Stack spacing={2}>
                                                {workout.exercises.map((exercise) => (
                                                    <Box
                                                        key={exercise.id}
                                                        component="article"
                                                        aria-label={`Exercise: ${exercise.exerciseName}`}
                                                    >
                                                        <Typography
                                                            variant="subtitle2"
                                                            sx={{ fontWeight: 'bold', mb: 0.5 }}
                                                            component="h3"
                                                        >
                                                            {exercise.exerciseName}
                                                        </Typography>
                                                        {exercise.notes && (
                                                            <Typography
                                                                variant="caption"
                                                                color="text.secondary"
                                                                sx={{ display: 'block', mb: 1 }}
                                                            >
                                                                {exercise.notes}
                                                            </Typography>
                                                        )}
                                                        <Stack
                                                            spacing={0.5}
                                                            component="ul"
                                                            sx={{
                                                                listStyle: 'none',
                                                                padding: 0,
                                                                margin: 0
                                                            }}
                                                            aria-label={`Sets for ${exercise.exerciseName}`}
                                                        >
                                                            {exercise.sets.map((set, idx) => (
                                                                <Box
                                                                    key={idx}
                                                                    component="li"
                                                                    sx={{
                                                                        display: 'flex',
                                                                        justifyContent: 'space-between',
                                                                        alignItems: 'center',
                                                                        py: 0.5,
                                                                        px: 1,
                                                                        backgroundColor: 'action.hover',
                                                                        borderRadius: 1
                                                                    }}
                                                                >
                                                                    <Typography
                                                                        variant="caption"
                                                                        sx={{ fontWeight: 'medium' }}
                                                                    >
                                                                        Set {set.setNumber}
                                                                    </Typography>
                                                                    <Typography
                                                                        variant="caption"
                                                                        aria-label={`${set.reps} reps at ${set.weight} pounds`}
                                                                    >
                                                                        {set.reps} reps @ {set.weight} lbs
                                                                    </Typography>
                                                                </Box>
                                                            ))}
                                                        </Stack>
                                                    </Box>
                                                ))}
                                            </Stack>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={handleDeleteCancel}
                aria-labelledby="delete-dialog-title"
                aria-describedby="delete-dialog-description"
            >
                <DialogTitle id="delete-dialog-title">
                    Delete Workout?
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="delete-dialog-description">
                        Are you sure you want to delete "{workoutToDelete?.title}"? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleDeleteCancel}
                        autoFocus
                        sx={{
                            '&:focus-visible': {
                                outline: '2px solid',
                                outlineColor: 'primary.main',
                            }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        color="error"
                        variant="contained"
                        sx={{
                            '&:focus-visible': {
                                outline: '2px solid',
                                outlineColor: 'error.main',
                                outlineOffset: '2px',
                            }
                        }}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Workout Modal */}
            <WorkoutModal
                isOpen={showModal}
                onClose={handleCloseModal}
                onSave={loadWorkouts}
                workout={editingWorkout}
                initialDate={new Date().toISOString().split('T')[0]}
                definitions={definitions}
                templateData={null}
            />
        </Box>
    );
}

export default Workouts;
