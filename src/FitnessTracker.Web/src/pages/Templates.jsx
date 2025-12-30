import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    IconButton,
    Grid,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Stack,
    Paper
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';
import CloseIcon from '@mui/icons-material/Close';
import { templatesApi, exerciseDefinitionsApi, workoutsApi } from '../services/api';
import { useNavigate } from 'react-router-dom';

function Templates() {
    const navigate = useNavigate();
    const [templates, setTemplates] = useState([]);
    const [definitions, setDefinitions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [templateToDelete, setTemplateToDelete] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        exercises: [],
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [templatesData, definitionsData] = await Promise.all([
                templatesApi.getAll(),
                exerciseDefinitionsApi.getAll()
            ]);
            setTemplates(templatesData);
            setDefinitions(definitionsData);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadTemplates = async () => {
        try {
            const data = await templatesApi.getAll();
            setTemplates(data);
        } catch (error) {
            console.error('Failed to load templates:', error);
        }
    };

    const handleOpenModal = (template = null) => {
        if (template) {
            setEditingTemplate(template);
            setFormData({
                title: template.title,
                description: template.description || '',
                exercises: template.exercises.map(ex => ({
                    ...ex,
                    targetSets: ex.targetSets.map(s => ({ ...s }))
                })) || [],
            });
        } else {
            setEditingTemplate(null);
            setFormData({
                title: '',
                description: '',
                exercises: [],
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingTemplate(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleAddExercise = () => {
        setFormData((prev) => ({
            ...prev,
            exercises: [
                ...prev.exercises,
                {
                    id: crypto.randomUUID(), // Generated once when created
                    exerciseDefinitionId: definitions[0]?.id || 0,
                    notes: '',
                    targetSets: [{
                        id: crypto.randomUUID(), // Generated once when created
                        setNumber: 1,
                        targetReps: 10,
                        targetWeight: null
                    }]
                },
            ],
        }));
    };

    const handleExerciseChange = (exerciseId, field, value) => {
        setFormData((prev) => ({
            ...prev,
            exercises: prev.exercises.map((exercise) =>
                exercise.id === exerciseId ? { ...exercise, [field]: value } : exercise
            ),
        }));
    };

    const handleAddSet = (exerciseId) => {
        setFormData((prev) => ({
            ...prev,
            exercises: prev.exercises.map((exercise) => {
                if (exercise.id !== exerciseId) return exercise;

                const sets = exercise.targetSets || [];
                const lastSet = sets[sets.length - 1];

                return {
                    ...exercise,
                    targetSets: [
                        ...sets,
                        {
                            id: crypto.randomUUID(), // Generated once when created
                            setNumber: sets.length + 1,
                            targetReps: lastSet?.targetReps || 10,
                            targetWeight: lastSet?.targetWeight || null,
                        }
                    ]
                };
            })
        }));
    };

    const handleSetChange = (exerciseId, setId, field, value) => {
        setFormData((prev) => ({
            ...prev,
            exercises: prev.exercises.map((exercise) => {
                if (exercise.id !== exerciseId) return exercise;

                return {
                    ...exercise,
                    targetSets: exercise.targetSets.map((set) =>
                        set.id === setId
                            ? {
                                ...set,
                                [field]: value === '' ? null : (field === 'targetWeight' ? parseFloat(value) : parseInt(value)),
                            }
                            : set
                    )
                };
            })
        }));
    };

    const handleRemoveSet = (exerciseId, setId) => {
        setFormData((prev) => ({
            ...prev,
            exercises: prev.exercises.map((exercise) => {
                if (exercise.id !== exerciseId) return exercise;

                return {
                    ...exercise,
                    targetSets: exercise.targetSets
                        .filter((set) => set.id !== setId)
                        .map((s, i) => ({ ...s, setNumber: i + 1 }))
                };
            })
        }));
    };

    const handleRemoveExercise = (exerciseId) => {
        setFormData((prev) => ({
            ...prev,
            exercises: prev.exercises.filter((ex) => ex.id !== exerciseId),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const submissionData = {
                ...formData,
                exercises: formData.exercises.map(ex => ({
                    exerciseDefinitionId: parseInt(ex.exerciseDefinitionId),
                    notes: ex.notes,
                    targetSets: ex.targetSets.map(s => ({
                        setNumber: s.setNumber,
                        targetReps: s.targetReps != null ? parseInt(s.targetReps) : null,
                        targetWeight: s.targetWeight != null ? Math.round(parseFloat(s.targetWeight) * 100) / 100 : null
                    }))
                }))
            };

            if (editingTemplate) {
                await templatesApi.update(editingTemplate.id, submissionData);
            } else {
                await templatesApi.create(submissionData);
            }
            handleCloseModal();
            loadTemplates();
        } catch (error) {
            console.error('Failed to save template:', error);
            alert(error.message || 'Failed to save template.');
        }
    };

    const handleDeleteClick = (template) => {
        setTemplateToDelete(template);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!templateToDelete) return;

        try {
            await templatesApi.delete(templateToDelete.id);
            setDeleteDialogOpen(false);
            setTemplateToDelete(null);
            loadTemplates();
        } catch (error) {
            console.error('Failed to delete template:', error);
            alert('Failed to delete template.');
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setTemplateToDelete(null);
    };

    const handleLogWorkout = async (templateId) => {
        try {
            const workout = await workoutsApi.logFromTemplate(templateId);
            alert('Workout logged successfully!');
            navigate('/workouts');
        } catch (error) {
            console.error('Failed to log workout from template:', error);
            alert('Failed to log workout.');
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
                aria-label="Loading templates"
            >
                <CircularProgress aria-label="Loading" />
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
            {/* Page Header */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <FolderSpecialIcon sx={{ fontSize: 32, color: 'primary.main' }} aria-hidden="true" />
                        <Typography
                            variant="h4"
                            component="h1"
                            sx={{ fontWeight: 'bold' }}
                        >
                            Workout Templates
                        </Typography>
                    </Box>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenModal()}
                    aria-label="Create new template"
                >
                    Create Template
                </Button>
            </Box>

            {/* Empty State */}
            {templates.length === 0 ? (
                <Card>
                    <CardContent>
                        <Box
                            sx={{
                                textAlign: 'center',
                                py: 6,
                                px: 2
                            }}
                        >
                            <FolderSpecialIcon
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
                                No templates yet
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                                Create templates for your regular routines to log workouts faster!
                            </Typography>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => handleOpenModal()}
                                aria-label="Create your first template"
                            >
                                Create Your First Template
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            ) : (
                <Grid container spacing={3}>
                    {templates.map((template) => (
                        <Grid item xs={12} md={6} key={template.id}>
                            <Card
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                                component="article"
                                aria-label={`Template: ${template.title}`}
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
                                            <Box>
                                                <Typography
                                                    variant="h6"
                                                    component="h2"
                                                    sx={{ fontWeight: 'bold' }}
                                                >
                                                    {template.title}
                                                </Typography>
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                >
                                                    {template.exercises.length} exercises
                                                </Typography>
                                            </Box>
                                            <Stack direction="row" spacing={0.5}>
                                                <IconButton
                                                    size="small"
                                                    color="primary"
                                                    onClick={() => handleLogWorkout(template.id)}
                                                    aria-label={`Log workout from ${template.title}`}
                                                    title="Log Workout from Template"
                                                >
                                                    <RocketLaunchIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleOpenModal(template)}
                                                    aria-label={`Edit ${template.title}`}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleDeleteClick(template)}
                                                    aria-label={`Delete ${template.title}`}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Stack>
                                        </Box>
                                    </Box>

                                    {/* Description */}
                                    {template.description && (
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ mb: 2 }}
                                        >
                                            {template.description}
                                        </Typography>
                                    )}

                                    {/* Exercises List */}
                                    <Stack spacing={1} component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                                        {template.exercises.map((exercise) => (
                                            <Box
                                                key={exercise.id}
                                                component="li"
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    py: 0.5
                                                }}
                                            >
                                                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                    {exercise.exerciseName}
                                                </Typography>
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                    aria-label={`${exercise.targetSets.length} sets`}
                                                >
                                                    {exercise.targetSets.length} sets
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Stack>
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
                    Delete Template?
                </DialogTitle>
                <DialogContent>
                    <Typography id="delete-dialog-description">
                        Are you sure you want to delete "{templateToDelete?.title}"? This action cannot be undone.
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

            {/* Template Modal */}
            <Dialog
                open={showModal}
                onClose={handleCloseModal}
                maxWidth="md"
                fullWidth
                aria-labelledby="template-dialog-title"
            >
                <DialogTitle id="template-dialog-title">
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" component="span">
                            {editingTemplate ? 'Edit Template' : 'Create Template'}
                        </Typography>
                        <IconButton
                            onClick={handleCloseModal}
                            aria-label="Close dialog"
                            size="small"
                        >
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>

                <form onSubmit={handleSubmit}>
                    <DialogContent dividers>
                        <Stack spacing={3}>
                            {/* Template Title */}
                            <TextField
                                label="Template Title"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="e.g., Push Day A"
                                required
                                fullWidth
                                autoFocus
                            />

                            {/* Description */}
                            <TextField
                                label="Description (optional)"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="What is this routine for?"
                                multiline
                                rows={2}
                                fullWidth
                            />

                            {/* Exercises Section */}
                            <Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 'bold' }}>
                                        Exercises
                                    </Typography>
                                    <Button
                                        size="small"
                                        startIcon={<AddIcon />}
                                        onClick={handleAddExercise}
                                        aria-label="Add exercise"
                                    >
                                        Add Exercise
                                    </Button>
                                </Box>

                                <Stack spacing={2}>
                                    {formData.exercises.map((exercise) => (
                                        <Paper
                                            key={exercise.id}
                                            sx={{ p: 2, bgcolor: 'action.hover' }}
                                            component="section"
                                            aria-label={`Exercise ${exercise.exerciseName}`}
                                        >
                                            {/* Exercise Selection and Remove */}
                                            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                                                <TextField
                                                    select
                                                    value={exercise.exerciseDefinitionId}
                                                    onChange={(e) => handleExerciseChange(exercise.id, 'exerciseDefinitionId', e.target.value)}
                                                    required
                                                    fullWidth
                                                    label="Exercise"
                                                    size="small"
                                                >
                                                    {definitions.map(def => (
                                                        <MenuItem key={def.id} value={def.id}>
                                                            {def.name}
                                                        </MenuItem>
                                                    ))}
                                                </TextField>
                                                <IconButton
                                                    color="error"
                                                    onClick={() => handleRemoveExercise(exercise.id)}
                                                    aria-label="Remove exercise"
                                                    size="small"
                                                >
                                                    <CloseIcon />
                                                </IconButton>
                                            </Stack>

                                            {/* Target Sets */}
                                            <Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                        Target Sets
                                                    </Typography>
                                                    <Button
                                                        size="small"
                                                        onClick={() => handleAddSet(exercise.id)}
                                                        aria-label="Add set"
                                                    >
                                                        + Add Set
                                                    </Button>
                                                </Box>
                                                <Stack spacing={1}>
                                                    {exercise.targetSets?.map((set) => (
                                                        <Stack
                                                            key={set.id}
                                                            direction="row"
                                                            spacing={1}
                                                            alignItems="center"
                                                        >
                                                            <Typography
                                                                variant="body2"
                                                                sx={{
                                                                    minWidth: 40,
                                                                    fontWeight: 'medium',
                                                                    color: 'text.secondary'
                                                                }}
                                                            >
                                                                #{set.setNumber}
                                                            </Typography>
                                                            <TextField
                                                                type="number"
                                                                placeholder="Target Reps"
                                                                value={set.targetReps || ''}
                                                                onChange={(e) => handleSetChange(exercise.id, set.id, 'targetReps', e.target.value)}
                                                                required
                                                                size="small"
                                                                sx={{ flex: 1 }}
                                                                inputProps={{ 'aria-label': `Set ${set.setNumber} target reps` }}
                                                            />
                                                            <TextField
                                                                type="number"
                                                                step="0.5"
                                                                placeholder="Target lbs"
                                                                value={set.targetWeight === null ? '' : set.targetWeight}
                                                                onChange={(e) => handleSetChange(exercise.id, set.id, 'targetWeight', e.target.value)}
                                                                size="small"
                                                                sx={{ flex: 1 }}
                                                                inputProps={{ 'aria-label': `Set ${set.setNumber} target weight` }}
                                                            />
                                                            <IconButton
                                                                color="error"
                                                                size="small"
                                                                onClick={() => handleRemoveSet(exercise.id, set.id)}
                                                                disabled={exercise.targetSets.length === 1}
                                                                aria-label={`Remove set ${set.setNumber}`}
                                                            >
                                                                <CloseIcon fontSize="small" />
                                                            </IconButton>
                                                        </Stack>
                                                    ))}
                                                </Stack>
                                            </Box>
                                        </Paper>
                                    ))}
                                </Stack>
                            </Box>
                        </Stack>
                    </DialogContent>

                    <DialogActions>
                        <Button onClick={handleCloseModal}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="contained">
                            {editingTemplate ? 'Save Changes' : 'Create Template'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
}

export default Templates;
