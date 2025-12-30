import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    IconButton,
    Box,
    Typography,
    Paper,
    Grid,
    Chip,
    Collapse,
    Alert,
} from '@mui/material';
import {
    Close as CloseIcon,
    Add as AddIcon,
    Delete as DeleteIcon,
    ExpandMore as ExpandMoreIcon,
    ArrowUpward as ArrowUpwardIcon,
    ArrowDownward as ArrowDownwardIcon,
    UnfoldMore as UnfoldMoreIcon,
    UnfoldLess as UnfoldLessIcon,
    Notes as NotesIcon,
} from '@mui/icons-material';
import { workoutsApi } from '../services/api';

/**
 * Reusable Workout Modal Component
 * 
 * Props:
 * - isOpen: boolean - Controls modal visibility
 * - onClose: function - Called when modal should close
 * - onSave: function - Called after successful save
 * - workout: object|null - Existing workout to edit, or null for new
 * - initialDate: string - Pre-filled date (YYYY-MM-DD) for new workouts
 * - definitions: array - Exercise definitions for dropdown
 * - templateData: object|null - Pre-filled data from a template
 */
function WorkoutModal({ isOpen, onClose, onSave, workout, initialDate, definitions, templateData }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        durationMinutes: 30,
        workoutDate: new Date().toISOString().split('T')[0],
        exercises: [],
    });
    const [collapsedExercises, setCollapsedExercises] = useState(new Set());
    const [showNotes, setShowNotes] = useState(false);
    const [error, setError] = useState('');

    // Computed values
    const usedExerciseDefinitionIds = formData.exercises.map(e => e.exerciseDefinitionId);
    const unusedExerciseDefinitions = definitions.filter(d => !usedExerciseDefinitionIds.includes(d.id));

    // Initialize form data when modal opens or workout changes
    useEffect(() => {
        if (!isOpen) return;

        if (workout) {
            // Editing existing workout
            const exercises = workout.exercises.map(ex => ({
                ...ex,
                id: ex.id || crypto.randomUUID(), // Ensure ID exists
                sets: ex.sets.map(s => ({
                    ...s,
                    id: s.id || crypto.randomUUID() // Ensure ID exists
                }))
            })) || [];
            setFormData({
                title: workout.title,
                description: workout.description || '',
                durationMinutes: workout.durationMinutes,
                workoutDate: workout.workoutDate.split('T')[0],
                exercises,
            });
            // Start with all exercises expanded for better keyboard navigation
            setCollapsedExercises(new Set());
            setShowNotes(!!workout.description);
        } else if (templateData) {
            // Creating from template
            setFormData({
                title: '',
                description: templateData.description || '',
                durationMinutes: templateData.durationMinutes || 30,
                workoutDate: initialDate || new Date().toISOString().split('T')[0],
                exercises: templateData.exercises.map(ex => ({
                    ...ex,
                    id: ex.id || crypto.randomUUID(), // Ensure ID exists
                    sets: (ex.targetSets || ex.sets || []).map(s => ({
                        ...s,
                        id: s.id || crypto.randomUUID(), // Ensure ID exists
                        setNumber: s.setNumber,
                        reps: s.targetReps || s.reps || 10,
                        weight: s.targetWeight || s.weight || null,
                    }))
                })) || [],
            });
            // Start with all exercises expanded for better keyboard navigation
            setCollapsedExercises(new Set());
            setShowNotes(!!templateData.description);
        } else {
            // Creating new workout from scratch
            setFormData({
                title: '',
                description: '',
                durationMinutes: 30,
                workoutDate: initialDate || new Date().toISOString().split('T')[0],
                exercises: [],
            });
            setCollapsedExercises(new Set());
            setShowNotes(false);
        }
        setError('');
    }, [isOpen, workout, initialDate, templateData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'durationMinutes' ? parseInt(value) || 0 : value,
        }));
    };

    const handleAddExercise = () => {
        const usedIds = formData.exercises.map(e => e.exerciseDefinitionId);
        const unusedDefs = definitions.filter(def => !usedIds.includes(def.id));
        if (unusedDefs.length === 0) {
            setError('No more exercises to add!');
            return;
        }
        setFormData((prev) => ({
            ...prev,
            exercises: [
                ...prev.exercises,
                {
                    id: crypto.randomUUID(), // Generated once when created
                    exerciseDefinitionId: unusedDefs[0].id,
                    notes: '',
                    sets: [{
                        id: crypto.randomUUID(), // Generated once when created
                        setNumber: 1,
                        reps: 10,
                        weight: null
                    }]
                },
            ],
        }));
        setError('');
    };

    const handleExerciseChange = (index, field, value) => {
        setFormData((prev) => ({
            ...prev,
            exercises: prev.exercises.map((ex, i) =>
                i === index
                    ? {
                        ...ex,
                        [field]: value,
                    }
                    : ex
            ),
        }));
    };

    const handleAddSet = (exerciseIndex) => {
        setFormData((prev) => {
            const newExercises = [...prev.exercises];
            const exercise = { ...newExercises[exerciseIndex] };
            const sets = [...exercise.sets];
            const lastSet = sets[sets.length - 1];

            sets.push({
                id: crypto.randomUUID(), // Generated once when created
                setNumber: sets.length + 1,
                reps: lastSet?.reps || 10,
                weight: lastSet?.weight || null,
            });

            exercise.sets = sets;
            newExercises[exerciseIndex] = exercise;
            return { ...prev, exercises: newExercises };
        });
    };

    const handleSetChange = (exerciseIndex, setIndex, field, value) => {
        setFormData((prev) => {
            const newExercises = [...prev.exercises];
            const exercise = { ...newExercises[exerciseIndex] };
            const sets = [...exercise.sets];

            sets[setIndex] = {
                ...sets[setIndex],
                [field]: value === '' ? null : (field === 'weight' ? parseFloat(value) : parseInt(value)),
            };

            exercise.sets = sets;
            newExercises[exerciseIndex] = exercise;
            return { ...prev, exercises: newExercises };
        });
    };

    const handleRemoveSet = (exerciseIndex, setIndex) => {
        setFormData((prev) => {
            const newExercises = [...prev.exercises];
            const exercise = { ...newExercises[exerciseIndex] };
            exercise.sets = exercise.sets.filter((_, i) => i !== setIndex).map((s, i) => ({ ...s, setNumber: i + 1 }));
            newExercises[exerciseIndex] = exercise;
            return { ...prev, exercises: newExercises };
        });
    };

    const handleRemoveExercise = (index) => {
        setFormData((prev) => ({
            ...prev,
            exercises: prev.exercises.filter((_, i) => i !== index),
        }));
    };

    const toggleExerciseCollapse = (index) => {
        setCollapsedExercises(prev => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    };

    const moveExerciseUp = (index) => {
        if (index === 0) return;
        setFormData((prev) => {
            const newExercises = [...prev.exercises];
            [newExercises[index - 1], newExercises[index]] = [newExercises[index], newExercises[index - 1]];
            return { ...prev, exercises: newExercises };
        });

        setCollapsedExercises(prev => {
            const newSet = new Set();
            prev.forEach(i => {
                if (i === index) newSet.add(index - 1);
                else if (i === index - 1) newSet.add(index);
                else newSet.add(i);
            });
            return newSet;
        });
    };

    const moveExerciseDown = (index) => {
        if (index >= formData.exercises.length - 1) return;
        setFormData((prev) => {
            const newExercises = [...prev.exercises];
            [newExercises[index], newExercises[index + 1]] = [newExercises[index + 1], newExercises[index]];
            return { ...prev, exercises: newExercises };
        });

        setCollapsedExercises(prev => {
            const newSet = new Set();
            prev.forEach(i => {
                if (i === index) newSet.add(index + 1);
                else if (i === index + 1) newSet.add(index);
                else newSet.add(i);
            });
            return newSet;
        });
    };

    const toggleCollapseAll = () => {
        const allCollapsed = formData.exercises.every((_, idx) => collapsedExercises.has(idx));

        if (allCollapsed) {
            setCollapsedExercises(new Set());
        } else {
            setCollapsedExercises(new Set(formData.exercises.map((_, idx) => idx)));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Auto-generate title based on date
            const workoutDate = new Date(formData.workoutDate);
            const autoTitle = workout?.title || `Workout - ${workoutDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

            const submissionData = {
                ...formData,
                title: autoTitle,
                exercises: formData.exercises.map(ex => ({
                    exerciseDefinitionId: parseInt(ex.exerciseDefinitionId),
                    notes: ex.notes,
                    sets: ex.sets.map(s => ({
                        setNumber: s.setNumber,
                        reps: s.reps != null ? parseInt(s.reps) : null,
                        weight: s.weight != null ? Math.round(parseFloat(s.weight) * 100) / 100 : null
                    }))
                }))
            };

            if (workout) {
                await workoutsApi.update(workout.id, submissionData);
            } else {
                await workoutsApi.create(submissionData);
            }
            onClose();
            if (onSave) onSave();
        } catch (error) {
            console.error('Failed to save workout:', error);
            setError(error.message || 'Failed to save workout. Please check your inputs.');
        }
    };

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            aria-labelledby="workout-dialog-title"
        >
            <DialogTitle id="workout-dialog-title" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {workout ? 'Edit Workout' : 'Log Workout'}
                <IconButton onClick={onClose} aria-label="Close dialog" edge="end">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <form onSubmit={handleSubmit}>
                <DialogContent dividers>
                    {error && (
                        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {/* Date and Duration */}
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                type="date"
                                name="workoutDate"
                                label="Date"
                                fullWidth
                                required
                                value={formData.workoutDate}
                                onChange={handleInputChange}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                type="number"
                                name="durationMinutes"
                                label="Duration (minutes)"
                                fullWidth
                                required
                                value={formData.durationMinutes}
                                onChange={handleInputChange}
                                inputProps={{ min: 1 }}
                            />
                        </Grid>
                    </Grid>

                    {/* Exercises Section Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" component="h3">
                            Exercises
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            {formData.exercises.length > 0 && (
                                <Button
                                    type="button"
                                    size="small"
                                    variant="outlined"
                                    onClick={toggleCollapseAll}
                                    startIcon={formData.exercises.every((_, idx) => collapsedExercises.has(idx)) ? <UnfoldMoreIcon /> : <UnfoldLessIcon />}
                                    sx={{ textTransform: 'none' }}
                                    aria-label={formData.exercises.every((_, idx) => collapsedExercises.has(idx)) ? "Expand all exercises" : "Collapse all exercises"}
                                >
                                    {formData.exercises.every((_, idx) => collapsedExercises.has(idx)) ? 'Expand All' : 'Collapse All'}
                                </Button>
                            )}
                            <Button
                                type="button"
                                size="small"
                                variant="contained"
                                onClick={handleAddExercise}
                                disabled={unusedExerciseDefinitions.length === 0}
                                startIcon={<AddIcon />}
                                sx={{ textTransform: 'none' }}
                            >
                                Add Exercise
                            </Button>
                        </Box>
                    </Box>

                    {/* Exercises List */}
                    {formData.exercises.map((exercise, index) => {
                        const isCollapsed = collapsedExercises.has(index);
                        const availableForThisRow = definitions.filter(d =>
                            d.id == exercise.exerciseDefinitionId ||
                            !formData.exercises.some((ex, i) => i !== index && ex.exerciseDefinitionId == d.id)
                        );
                        const exerciseName = definitions.find(d => d.id == exercise.exerciseDefinitionId)?.name || 'Exercise';

                        return (
                            <Paper key={exercise.id} elevation={1} sx={{ mb: 2, p: 2 }}>
                                {/* Exercise Header */}
                                <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'center' }}>
                                    {/* Reorder buttons */}
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                                        <IconButton
                                            size="small"
                                            onClick={() => moveExerciseUp(index)}
                                            disabled={index === 0}
                                            aria-label={`Move ${exerciseName} up`}
                                        >
                                            <ArrowUpwardIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => moveExerciseDown(index)}
                                            disabled={index >= formData.exercises.length - 1}
                                            aria-label={`Move ${exerciseName} down`}
                                        >
                                            <ArrowDownwardIcon fontSize="small" />
                                        </IconButton>
                                    </Box>

                                    {/* Exercise dropdown */}
                                    <FormControl fullWidth required>
                                        <InputLabel id={`exercise-${index}-label`}>Exercise</InputLabel>
                                        <Select
                                            labelId={`exercise-${index}-label`}
                                            value={exercise.exerciseDefinitionId}
                                            label="Exercise"
                                            onChange={(e) =>
                                                handleExerciseChange(index, 'exerciseDefinitionId', e.target.value)
                                            }
                                        >
                                            {availableForThisRow.map(def => (
                                                <MenuItem key={def.id} value={def.id}>
                                                    {def.name} ({def.primaryMuscleGroup})
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    {/* Delete button */}
                                    <IconButton
                                        color="error"
                                        onClick={() => handleRemoveExercise(index)}
                                        aria-label={`Remove ${exerciseName}`}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>

                                {/* Sets Section - Collapsible */}
                                <Box>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            mb: 1,
                                            cursor: 'pointer',
                                        }}
                                        onClick={() => toggleExerciseCollapse(index)}
                                        role="button"
                                        tabIndex={-1}
                                        aria-expanded={!isCollapsed}
                                        aria-label={`${isCollapsed ? 'Expand' : 'Collapse'} sets for ${exerciseName}`}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <ExpandMoreIcon
                                                sx={{
                                                    transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                                                    transition: 'transform 0.2s',
                                                }}
                                            />
                                            <Typography variant="subtitle2" fontWeight={600}>
                                                Sets
                                            </Typography>
                                            <Chip label={exercise.sets.length} size="small" />
                                        </Box>
                                        {!isCollapsed && (
                                            <Button
                                                type="button"
                                                size="small"
                                                variant="outlined"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAddSet(index);
                                                }}
                                                onKeyDown={(e) => {
                                                    // Prevent parent's keyboard handler from interfering
                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                        e.stopPropagation();
                                                    }
                                                }}
                                                startIcon={<AddIcon />}
                                                sx={{ textTransform: 'none' }}
                                            >
                                                Add Set
                                            </Button>
                                        )}
                                    </Box>

                                    <Collapse in={!isCollapsed}>
                                        <Box sx={{ mt: 1 }}>
                                            {exercise.sets.map((set, setIndex) => (
                                                <Grid container spacing={1} key={set.id} sx={{ mb: 1, alignItems: 'center' }}>
                                                    <Grid item xs={2}>
                                                        <Chip label={`#${set.setNumber}`} size="small" sx={{ width: '100%' }} />
                                                    </Grid>
                                                    <Grid item xs={4}>
                                                        <TextField
                                                            type="number"
                                                            label="Reps"
                                                            size="small"
                                                            fullWidth
                                                            required
                                                            value={set.reps || ''}
                                                            onChange={(e) => handleSetChange(index, setIndex, 'reps', e.target.value)}
                                                            inputProps={{ min: 1 }}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={4}>
                                                        <TextField
                                                            type="number"
                                                            label="Weight (lbs)"
                                                            size="small"
                                                            fullWidth
                                                            value={set.weight === null ? '' : set.weight}
                                                            onChange={(e) => handleSetChange(index, setIndex, 'weight', e.target.value)}
                                                            inputProps={{ step: 0.5, max: 2000 }}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={2}>
                                                        <IconButton
                                                            color="error"
                                                            size="small"
                                                            onClick={() => handleRemoveSet(index, setIndex)}
                                                            disabled={exercise.sets.length === 1}
                                                            aria-label={`Remove set ${setIndex + 1} from ${exerciseName}`}
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Grid>
                                                </Grid>
                                            ))}
                                        </Box>
                                    </Collapse>
                                </Box>

                                {/* Exercise Notes */}
                                <TextField
                                    label="Exercise notes"
                                    size="small"
                                    fullWidth
                                    value={exercise.notes || ''}
                                    onChange={(e) => handleExerciseChange(index, 'notes', e.target.value)}
                                    sx={{ mt: 1 }}
                                    placeholder="Add notes for this exercise..."
                                />
                            </Paper>
                        );
                    })}

                    {/* Workout Notes Section - Collapsible */}
                    <Box sx={{ mt: 3 }}>
                        <Button
                            type="button"
                            fullWidth
                            variant="outlined"
                            onClick={() => setShowNotes(!showNotes)}
                            startIcon={<NotesIcon />}
                            sx={{ textTransform: 'none', justifyContent: 'flex-start' }}
                        >
                            {showNotes ? 'Hide Workout Notes' : 'Add Workout Notes'}
                            {formData.description && !showNotes && (
                                <Chip label="•" size="small" sx={{ ml: 1 }} />
                            )}
                        </Button>
                        <Collapse in={showNotes}>
                            <TextField
                                name="description"
                                multiline
                                rows={3}
                                fullWidth
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="How did the workout go?"
                                sx={{ mt: 1 }}
                            />
                        </Collapse>
                    </Box>
                </DialogContent>

                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button type="button" onClick={onClose} sx={{ textTransform: 'none' }}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="contained" sx={{ textTransform: 'none' }}>
                        {workout ? 'Save Changes' : 'Log Workout'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}

WorkoutModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func,
    workout: PropTypes.object,
    initialDate: PropTypes.string,
    definitions: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        primaryMuscleGroup: PropTypes.string,
    })).isRequired,
    templateData: PropTypes.object,
};

export default WorkoutModal;
