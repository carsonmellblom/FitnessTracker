import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Button,
    Card,
    CardContent,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Paper,
    Snackbar,
    Alert,
    CircularProgress,
    Chip,
    Collapse,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Divider,
} from '@mui/material';
import {
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon,
    FitnessCenter as FitnessCenterIcon,
    ViewList as ViewListIcon,
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    ContentCopy as ContentCopyIcon,
    Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { workoutsApi, exerciseDefinitionsApi, templatesApi } from '../services/api';
import WorkoutModal from '../components/WorkoutModal';

function Calendar() {
    const navigate = useNavigate();
    const [workouts, setWorkouts] = useState([]);
    const [definitions, setDefinitions] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedWorkoutId, setSelectedWorkoutId] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [showChoiceModal, setShowChoiceModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [workoutToDelete, setWorkoutToDelete] = useState(null);
    const [editingWorkout, setEditingWorkout] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [templateData, setTemplateData] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const showSnackbar = (message, severity = 'info') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const loadData = async () => {
        try {
            setLoading(true);
            const [workoutsData, definitionsData, templatesData] = await Promise.all([
                workoutsApi.getAll(),
                exerciseDefinitionsApi.getAll(),
                templatesApi.getAll()
            ]);
            setWorkouts(workoutsData);
            setDefinitions(definitionsData);
            setTemplates(templatesData);
        } catch (error) {
            console.error('Failed to load data:', error);
            showSnackbar('Failed to load data', 'error');
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
            showSnackbar('Failed to load workouts', 'error');
        }
    };

    const handleDayClick = (day) => {
        if (!day) return;

        const dateKey = getDateKey(day);
        const dayWorkouts = workoutsByDate[dateKey] || [];

        if (dayWorkouts.length > 0) {
            // Day has a workout - open it for editing
            setEditingWorkout(dayWorkouts[0]);
            setSelectedDate(null);
            setTemplateData(null);
            setShowModal(true);
        } else {
            // Empty day - show choice modal
            setSelectedDate(dateKey);
            setShowChoiceModal(true);
        }
    };

    const handleNewWorkout = () => {
        setShowChoiceModal(false);
        setEditingWorkout(null);
        setTemplateData(null);
        setShowModal(true);
    };

    const handleFromTemplate = (template) => {
        setShowChoiceModal(false);
        setEditingWorkout(null);

        // Convert template exercises to workout exercises format
        const exercises = template.exercises.map(ex => ({
            exerciseDefinitionId: ex.exerciseDefinitionId,
            notes: ex.notes || '',
            sets: ex.targetSets.map(s => ({
                setNumber: s.setNumber,
                reps: s.targetReps,
                weight: s.targetWeight
            }))
        }));

        setTemplateData({
            description: template.description || '',
            durationMinutes: 30,
            exercises
        });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setShowChoiceModal(false);
        setEditingWorkout(null);
        setSelectedDate(null);
        setTemplateData(null);
    };

    const handleCopyToToday = async (workout) => {
        try {
            const today = new Date();
            const newWorkout = {
                title: workout.title,
                description: workout.description,
                durationMinutes: workout.durationMinutes,
                workoutDate: today.toISOString().split('T')[0],
                exercises: workout.exercises.map(ex => ({
                    exerciseDefinitionId: ex.exerciseDefinitionId,
                    notes: ex.notes,
                    sets: ex.sets.map(s => ({
                        setNumber: s.setNumber,
                        reps: s.reps,
                        weight: s.weight
                    }))
                }))
            };

            await workoutsApi.create(newWorkout);
            await loadWorkouts();
            showSnackbar('Workout copied to today!', 'success');
        } catch (error) {
            console.error('Failed to copy workout:', error);
            showSnackbar(error.message || 'Failed to copy workout', 'error');
        }
    };

    const handleDeleteClick = (workout) => {
        setWorkoutToDelete(workout);
        setShowDeleteDialog(true);
    };

    const handleDeleteConfirm = async () => {
        if (!workoutToDelete) return;

        try {
            await workoutsApi.delete(workoutToDelete.id);
            await loadWorkouts();
            setSelectedWorkoutId(null);
            showSnackbar('Workout deleted successfully', 'success');
        } catch (error) {
            console.error('Failed to delete workout:', error);
            showSnackbar(error.message || 'Failed to delete workout', 'error');
        } finally {
            setShowDeleteDialog(false);
            setWorkoutToDelete(null);
        }
    };

    // Get calendar data
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday

    // Create array of days
    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
        days.push(null); // Empty cells before month starts
    }
    for (let day = 1; day <= daysInMonth; day++) {
        days.push(day);
    }

    // Group workouts by date
    const workoutsByDate = {};
    workouts.forEach(workout => {
        const date = new Date(workout.workoutDate).toISOString().split('T')[0];
        if (!workoutsByDate[date]) {
            workoutsByDate[date] = [];
        }
        workoutsByDate[date].push(workout);
    });

    const getDateKey = (day) => {
        if (!day) return null;
        const date = new Date(year, month, day);
        return date.toISOString().split('T')[0];
    };

    const isToday = (day) => {
        if (!day) return false;
        const today = new Date();
        return day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear();
    };

    const previousMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    if (loading) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="100vh"
                role="status"
                aria-live="polite"
                aria-label="Loading calendar"
            >
                <CircularProgress size={60} />
            </Box>
        );
    }

    return (
        <Box sx={{ py: 4 }}>
            <Container maxWidth="lg">
                {/* Page Header */}
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Typography
                        component="h1"
                        variant="h4"
                        sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}
                    >
                        <FitnessCenterIcon fontSize="large" aria-hidden="true" />
                        Workout Calendar
                    </Typography>
                    <Button
                        variant="outlined"
                        startIcon={<ViewListIcon />}
                        onClick={() => navigate('/workouts')}
                        sx={{ textTransform: 'none' }}
                    >
                        View All Workouts
                    </Button>
                </Box>

                <Card elevation={2}>
                    {/* Calendar Header */}
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 3,
                        borderBottom: 1,
                        borderColor: 'divider'
                    }}>
                        <IconButton
                            onClick={previousMonth}
                            aria-label="Previous month"
                            size="large"
                        >
                            <ChevronLeftIcon />
                        </IconButton>
                        <Typography
                            variant="h5"
                            component="h2"
                            sx={{ fontWeight: 600 }}
                            aria-live="polite"
                        >
                            {monthNames[month]} {year}
                        </Typography>
                        <IconButton
                            onClick={nextMonth}
                            aria-label="Next month"
                            size="large"
                        >
                            <ChevronRightIcon />
                        </IconButton>
                    </Box>

                    <CardContent>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ textAlign: 'center', mb: 3 }}
                        >
                            Click any day to log a workout
                        </Typography>

                        {/* Calendar Grid */}
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(7, 1fr)',
                                gap: 1,
                            }}
                            role="grid"
                            aria-label="Workout calendar"
                        >
                            {/* Day Names Header */}
                            {dayNames.map(day => (
                                <Box
                                    key={day}
                                    sx={{
                                        p: 1,
                                        textAlign: 'center',
                                        fontWeight: 600,
                                        color: 'text.secondary',
                                    }}
                                    role="columnheader"
                                >
                                    {day}
                                </Box>
                            ))}

                            {/* Calendar Days */}
                            {days.map((day, index) => {
                                const dateKey = getDateKey(day);
                                const dayWorkouts = dateKey ? workoutsByDate[dateKey] || [] : [];
                                const isTodayDate = isToday(day);
                                const hasWorkout = dayWorkouts.length > 0;

                                return (
                                    <Paper
                                        key={index}
                                        elevation={day ? 1 : 0}
                                        sx={{
                                            minHeight: 100,
                                            p: 1,
                                            cursor: day ? 'pointer' : 'default',
                                            backgroundColor: day ? (isTodayDate ? 'primary.dark' : 'background.paper') : 'transparent',
                                            border: isTodayDate ? 2 : 1,
                                            borderColor: isTodayDate ? 'primary.main' : 'divider',
                                            transition: 'all 0.2s',
                                            '&:hover': day ? {
                                                backgroundColor: isTodayDate ? 'primary.dark' : 'action.hover',
                                                transform: 'translateY(-2px)',
                                                boxShadow: 3,
                                            } : {},
                                        }}
                                        onClick={() => handleDayClick(day)}
                                        role="gridcell"
                                        aria-label={day ? `${monthNames[month]} ${day}, ${year}${hasWorkout ? `, ${dayWorkouts.length} workout${dayWorkouts.length > 1 ? 's' : ''}` : ', no workouts'}` : 'Empty'}
                                        tabIndex={day ? 0 : -1}
                                        onKeyDown={(e) => {
                                            if (day && (e.key === 'Enter' || e.key === ' ')) {
                                                e.preventDefault();
                                                handleDayClick(day);
                                            }
                                        }}
                                    >
                                        {day && (
                                            <>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontWeight: isTodayDate ? 700 : 600,
                                                        mb: 0.5,
                                                    }}
                                                >
                                                    {day}
                                                </Typography>
                                                {dayWorkouts.map(workout => (
                                                    <Box key={workout.id} sx={{ mb: 0.5 }}>
                                                        <Chip
                                                            icon={<FitnessCenterIcon />}
                                                            label={workout.title}
                                                            size="small"
                                                            color="primary"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedWorkoutId(selectedWorkoutId === workout.id ? null : workout.id);
                                                            }}
                                                            sx={{
                                                                width: '100%',
                                                                justifyContent: 'flex-start',
                                                                fontSize: '0.7rem',
                                                            }}
                                                        />
                                                        <Collapse in={selectedWorkoutId === workout.id}>
                                                            <Box sx={{ mt: 1, p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                                                                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                                                                    {workout.exercises.length} exercise{workout.exercises.length !== 1 ? 's' : ''} • {workout.durationMinutes} min
                                                                </Typography>
                                                                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                                                    <IconButton
                                                                        size="small"
                                                                        color="primary"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setEditingWorkout(workout);
                                                                            setSelectedDate(null);
                                                                            setTemplateData(null);
                                                                            setShowModal(true);
                                                                        }}
                                                                        aria-label={`Edit ${workout.title}`}
                                                                    >
                                                                        <EditIcon fontSize="small" />
                                                                    </IconButton>
                                                                    <IconButton
                                                                        size="small"
                                                                        color="error"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleDeleteClick(workout);
                                                                        }}
                                                                        aria-label={`Delete ${workout.title}`}
                                                                    >
                                                                        <DeleteIcon fontSize="small" />
                                                                    </IconButton>
                                                                    {!isTodayDate && (
                                                                        <IconButton
                                                                            size="small"
                                                                            color="secondary"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleCopyToToday(workout);
                                                                            }}
                                                                            aria-label={`Copy ${workout.title} to today`}
                                                                        >
                                                                            <ContentCopyIcon fontSize="small" />
                                                                        </IconButton>
                                                                    )}
                                                                </Box>
                                                            </Box>
                                                        </Collapse>
                                                    </Box>
                                                ))}
                                                {!hasWorkout && (
                                                    <Typography
                                                        variant="caption"
                                                        color="text.disabled"
                                                        sx={{ display: 'block', textAlign: 'center', mt: 1, opacity: 0.5 }}
                                                    >
                                                        + Add
                                                    </Typography>
                                                )}
                                            </>
                                        )}
                                    </Paper>
                                );
                            })}
                        </Box>
                    </CardContent>
                </Card>

                {/* Choice Modal - New Workout or From Template */}
                <Dialog
                    open={showChoiceModal}
                    onClose={() => setShowChoiceModal(false)}
                    maxWidth="xs"
                    fullWidth
                    aria-labelledby="choice-dialog-title"
                >
                    <DialogTitle id="choice-dialog-title">
                        Add Workout
                    </DialogTitle>
                    <DialogContent>
                        {selectedDate && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </Typography>
                        )}

                        <Button
                            variant="contained"
                            fullWidth
                            startIcon={<AddIcon />}
                            onClick={handleNewWorkout}
                            sx={{ mb: 2, py: 1.5, textTransform: 'none' }}
                        >
                            New Workout
                        </Button>

                        {templates.length > 0 ? (
                            <>
                                <Divider sx={{ my: 2 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        or use a template
                                    </Typography>
                                </Divider>
                                <List sx={{ maxHeight: 200, overflow: 'auto' }}>
                                    {templates.map((template) => (
                                        <ListItem key={template.id} disablePadding>
                                            <ListItemButton onClick={() => handleFromTemplate(template)}>
                                                <AssignmentIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                                <ListItemText
                                                    primary={template.title}
                                                    secondary={`${template.exercises.length} exercises`}
                                                />
                                            </ListItemButton>
                                        </ListItem>
                                    ))}
                                </List>
                            </>
                        ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
                                No templates yet.{' '}
                                <Typography
                                    component="a"
                                    href="/templates"
                                    variant="body2"
                                    color="primary"
                                    sx={{ textDecoration: 'none' }}
                                >
                                    Create one
                                </Typography>
                            </Typography>
                        )}
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2 }}>
                        <Button onClick={() => setShowChoiceModal(false)} sx={{ textTransform: 'none' }}>
                            Cancel
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog
                    open={showDeleteDialog}
                    onClose={() => setShowDeleteDialog(false)}
                    aria-labelledby="delete-dialog-title"
                    aria-describedby="delete-dialog-description"
                >
                    <DialogTitle id="delete-dialog-title">
                        Delete Workout
                    </DialogTitle>
                    <DialogContent>
                        <Typography id="delete-dialog-description">
                            Are you sure you want to delete "{workoutToDelete?.title}"? This action cannot be undone.
                        </Typography>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2 }}>
                        <Button onClick={() => setShowDeleteDialog(false)} sx={{ textTransform: 'none' }}>
                            Cancel
                        </Button>
                        <Button onClick={handleDeleteConfirm} color="error" variant="contained" sx={{ textTransform: 'none' }}>
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
                    initialDate={selectedDate}
                    definitions={definitions}
                    templateData={templateData}
                />

                {/* Snackbar for notifications */}
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
                    onClose={handleCloseSnackbar}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Container>
        </Box>
    );
}

export default Calendar;
