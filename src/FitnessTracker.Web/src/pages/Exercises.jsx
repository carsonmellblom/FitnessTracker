import { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Button,
    Tabs,
    Tab,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Card,
    CardContent,
    CardActions,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    Chip,
    CircularProgress,
    InputAdornment,
    Snackbar,
    Alert,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    FitnessCenter as FitnessCenterIcon,
    Folder as FolderIcon,
} from '@mui/icons-material';
import { exerciseDefinitionsApi, categoriesApi } from '../services/api';

// TabPanel component for accessible tab content
function TabPanel({ children, value, index, ...other }) {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`exercise-tabpanel-${index}`}
            aria-labelledby={`exercise-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
        </div>
    );
}

// Accessibility props for tabs
function a11yProps(index) {
    return {
        id: `exercise-tab-${index}`,
        'aria-controls': `exercise-tabpanel-${index}`,
    };
}

export default function Exercises() {
    const [exercises, setExercises] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(0); // 0 for exercises, 1 for categories
    const [showExerciseModal, setShowExerciseModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteType, setDeleteType] = useState(null);
    const [editingExercise, setEditingExercise] = useState(null);
    const [editingCategory, setEditingCategory] = useState(null);
    const [filterCategory, setFilterCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

    const [exerciseForm, setExerciseForm] = useState({
        name: '',
        primaryMuscleGroup: '',
        description: '',
        categoryId: null,
    });

    const [categoryForm, setCategoryForm] = useState({
        name: '',
        description: '',
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [exercisesData, categoriesData] = await Promise.all([
                exerciseDefinitionsApi.getAll(),
                categoriesApi.getAll()
            ]);
            setExercises(exercisesData);
            setCategories(categoriesData);
        } catch (error) {
            console.error('Error loading data:', error);
            showSnackbar('Failed to load data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showSnackbar = (message, severity = 'info') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const handleExerciseSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingExercise) {
                await exerciseDefinitionsApi.update(editingExercise.id, exerciseForm);
                showSnackbar('Exercise updated successfully', 'success');
            } else {
                await exerciseDefinitionsApi.create(exerciseForm);
                showSnackbar('Exercise created successfully', 'success');
            }
            await loadData();
            closeExerciseModal();
        } catch (error) {
            console.error('Error saving exercise:', error);
            showSnackbar('Failed to save exercise', 'error');
        }
    };

    const handleCategorySubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCategory) {
                await categoriesApi.update(editingCategory.id, categoryForm);
                showSnackbar('Category updated successfully', 'success');
            } else {
                await categoriesApi.create(categoryForm);
                showSnackbar('Category created successfully', 'success');
            }
            await loadData();
            closeCategoryModal();
        } catch (error) {
            console.error('Error saving category:', error);
            showSnackbar('Failed to save category', 'error');
        }
    };

    const handleDeleteClick = (id, type) => {
        setDeleteTarget(id);
        setDeleteType(type);
        setShowDeleteDialog(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            if (deleteType === 'exercise') {
                await exerciseDefinitionsApi.delete(deleteTarget);
                showSnackbar('Exercise deleted successfully', 'success');
            } else {
                await categoriesApi.delete(deleteTarget);
                showSnackbar('Category deleted successfully', 'success');
            }
            await loadData();
        } catch (error) {
            console.error('Error deleting:', error);
            showSnackbar(`Failed to delete ${deleteType}`, 'error');
        } finally {
            setShowDeleteDialog(false);
            setDeleteTarget(null);
            setDeleteType(null);
        }
    };

    const openExerciseModal = (exercise = null) => {
        if (exercise) {
            setEditingExercise(exercise);
            setExerciseForm({
                name: exercise.name,
                primaryMuscleGroup: exercise.primaryMuscleGroup,
                description: exercise.description || '',
                categoryId: exercise.categoryId || null,
            });
        } else {
            setEditingExercise(null);
            setExerciseForm({
                name: '',
                primaryMuscleGroup: '',
                description: '',
                categoryId: null,
            });
        }
        setShowExerciseModal(true);
    };

    const openCategoryModal = (category = null) => {
        if (category) {
            setEditingCategory(category);
            setCategoryForm({
                name: category.name,
                description: category.description || '',
            });
        } else {
            setEditingCategory(null);
            setCategoryForm({
                name: '',
                description: '',
            });
        }
        setShowCategoryModal(true);
    };

    const closeExerciseModal = () => {
        setShowExerciseModal(false);
        setEditingExercise(null);
        setExerciseForm({ name: '', primaryMuscleGroup: '', description: '', categoryId: null });
    };

    const closeCategoryModal = () => {
        setShowCategoryModal(false);
        setEditingCategory(null);
        setCategoryForm({ name: '', description: '' });
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const filteredExercises = exercises.filter(ex => {
        const matchesCategory = filterCategory === 'all' ||
            (filterCategory === 'uncategorized' && !ex.categoryId) ||
            ex.categoryId === parseInt(filterCategory);
        const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ex.primaryMuscleGroup.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    if (loading) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="100vh"
                role="status"
                aria-live="polite"
                aria-label="Loading exercises"
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
                        Exercise Library
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="outlined"
                            startIcon={<AddIcon />}
                            onClick={() => openCategoryModal()}
                            sx={{ textTransform: 'none' }}
                        >
                            New Category
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => openExerciseModal()}
                            sx={{ textTransform: 'none' }}
                        >
                            New Exercise
                        </Button>
                    </Box>
                </Box>

                {/* Tabs */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        aria-label="Exercise management tabs"
                    >
                        <Tab
                            label={`Exercises (${exercises.length})`}
                            {...a11yProps(0)}
                            sx={{ textTransform: 'none', minHeight: 48 }}
                        />
                        <Tab
                            label={`Categories (${categories.length})`}
                            {...a11yProps(1)}
                            sx={{ textTransform: 'none', minHeight: 48 }}
                        />
                    </Tabs>
                </Box>

                {/* Exercises Tab */}
                <TabPanel value={activeTab} index={0}>
                    {/* Filters */}
                    <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <TextField
                            placeholder="Search exercises..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            sx={{ flex: '1 1 300px' }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                            inputProps={{
                                'aria-label': 'Search exercises',
                            }}
                        />
                        <FormControl sx={{ minWidth: 200 }}>
                            <InputLabel id="category-filter-label">Category Filter</InputLabel>
                            <Select
                                labelId="category-filter-label"
                                value={filterCategory}
                                label="Category Filter"
                                onChange={(e) => setFilterCategory(e.target.value)}
                                inputProps={{
                                    'aria-label': 'Filter by category',
                                }}
                            >
                                <MenuItem value="all">All Categories</MenuItem>
                                <MenuItem value="uncategorized">Uncategorized</MenuItem>
                                {categories.map(cat => (
                                    <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    {/* Exercise Grid */}
                    {filteredExercises.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
                            <FitnessCenterIcon sx={{ fontSize: 80, mb: 2, opacity: 0.3 }} aria-hidden="true" />
                            <Typography variant="h5" gutterBottom>
                                No exercises found
                            </Typography>
                            <Typography variant="body1">
                                Create your first exercise to get started!
                            </Typography>
                        </Box>
                    ) : (
                        <Grid container spacing={3}>
                            {filteredExercises.map(exercise => (
                                <Grid item xs={12} sm={6} md={4} key={exercise.id}>
                                    <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                        <CardContent sx={{ flex: 1 }}>
                                            <Typography variant="h6" component="h3" gutterBottom>
                                                {exercise.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                                {exercise.primaryMuscleGroup}
                                            </Typography>
                                            {exercise.description && (
                                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                    {exercise.description}
                                                </Typography>
                                            )}
                                            {exercise.categoryName && (
                                                <Box sx={{ mt: 2 }}>
                                                    <Chip
                                                        label={exercise.categoryName}
                                                        size="small"
                                                        color="primary"
                                                        variant="outlined"
                                                    />
                                                </Box>
                                            )}
                                        </CardContent>
                                        <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                                            <IconButton
                                                onClick={() => openExerciseModal(exercise)}
                                                aria-label={`Edit ${exercise.name}`}
                                                color="primary"
                                                size="large"
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                onClick={() => handleDeleteClick(exercise.id, 'exercise')}
                                                aria-label={`Delete ${exercise.name}`}
                                                color="error"
                                                size="large"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </CardActions>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </TabPanel>

                {/* Categories Tab */}
                <TabPanel value={activeTab} index={1}>
                    {categories.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
                            <FolderIcon sx={{ fontSize: 80, mb: 2, opacity: 0.3 }} aria-hidden="true" />
                            <Typography variant="h5" gutterBottom>
                                No categories found
                            </Typography>
                            <Typography variant="body1">
                                Create your first category to organize exercises!
                            </Typography>
                        </Box>
                    ) : (
                        <Grid container spacing={3}>
                            {categories.map(category => {
                                const categoryExercises = exercises.filter(ex => ex.categoryId === category.id);
                                return (
                                    <Grid item xs={12} sm={6} md={4} key={category.id}>
                                        <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                            <CardContent sx={{ flex: 1 }}>
                                                <Typography variant="h6" component="h3" gutterBottom>
                                                    {category.name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                                    {categoryExercises.length} exercise{categoryExercises.length !== 1 ? 's' : ''}
                                                </Typography>
                                                {category.description && (
                                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                        {category.description}
                                                    </Typography>
                                                )}
                                            </CardContent>
                                            <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                                                <IconButton
                                                    onClick={() => openCategoryModal(category)}
                                                    aria-label={`Edit ${category.name} category`}
                                                    color="primary"
                                                    size="large"
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton
                                                    onClick={() => handleDeleteClick(category.id, 'category')}
                                                    aria-label={`Delete ${category.name} category`}
                                                    color="error"
                                                    size="large"
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </CardActions>
                                        </Card>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    )}
                </TabPanel>

                {/* Exercise Modal */}
                <Dialog
                    open={showExerciseModal}
                    onClose={closeExerciseModal}
                    maxWidth="sm"
                    fullWidth
                    aria-labelledby="exercise-dialog-title"
                >
                    <DialogTitle id="exercise-dialog-title">
                        {editingExercise ? 'Edit Exercise' : 'New Exercise'}
                    </DialogTitle>
                    <form onSubmit={handleExerciseSubmit}>
                        <DialogContent>
                            <TextField
                                autoFocus
                                margin="normal"
                                label="Exercise Name"
                                type="text"
                                fullWidth
                                required
                                value={exerciseForm.name}
                                onChange={(e) => setExerciseForm({ ...exerciseForm, name: e.target.value })}
                                placeholder="e.g., Barbell Row"
                            />
                            <TextField
                                margin="normal"
                                label="Primary Muscle Group"
                                type="text"
                                fullWidth
                                required
                                value={exerciseForm.primaryMuscleGroup}
                                onChange={(e) => setExerciseForm({ ...exerciseForm, primaryMuscleGroup: e.target.value })}
                                placeholder="e.g., Back, Chest, Legs"
                            />
                            <FormControl fullWidth margin="normal">
                                <InputLabel id="exercise-category-label">Category</InputLabel>
                                <Select
                                    labelId="exercise-category-label"
                                    value={exerciseForm.categoryId || ''}
                                    label="Category"
                                    onChange={(e) => setExerciseForm({
                                        ...exerciseForm,
                                        categoryId: e.target.value ? parseInt(e.target.value) : null
                                    })}
                                >
                                    <MenuItem value="">No Category</MenuItem>
                                    {categories.map(cat => (
                                        <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <TextField
                                margin="normal"
                                label="Description"
                                multiline
                                rows={3}
                                fullWidth
                                value={exerciseForm.description}
                                onChange={(e) => setExerciseForm({ ...exerciseForm, description: e.target.value })}
                                placeholder="Optional description..."
                            />
                        </DialogContent>
                        <DialogActions sx={{ px: 3, pb: 2 }}>
                            <Button onClick={closeExerciseModal} sx={{ textTransform: 'none' }}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="contained" sx={{ textTransform: 'none' }}>
                                {editingExercise ? 'Save Changes' : 'Create Exercise'}
                            </Button>
                        </DialogActions>
                    </form>
                </Dialog>

                {/* Category Modal */}
                <Dialog
                    open={showCategoryModal}
                    onClose={closeCategoryModal}
                    maxWidth="sm"
                    fullWidth
                    aria-labelledby="category-dialog-title"
                >
                    <DialogTitle id="category-dialog-title">
                        {editingCategory ? 'Edit Category' : 'New Category'}
                    </DialogTitle>
                    <form onSubmit={handleCategorySubmit}>
                        <DialogContent>
                            <TextField
                                autoFocus
                                margin="normal"
                                label="Category Name"
                                type="text"
                                fullWidth
                                required
                                value={categoryForm.name}
                                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                                placeholder="e.g., Strength Training"
                            />
                            <TextField
                                margin="normal"
                                label="Description"
                                multiline
                                rows={3}
                                fullWidth
                                value={categoryForm.description}
                                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                                placeholder="Optional description..."
                            />
                        </DialogContent>
                        <DialogActions sx={{ px: 3, pb: 2 }}>
                            <Button onClick={closeCategoryModal} sx={{ textTransform: 'none' }}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="contained" sx={{ textTransform: 'none' }}>
                                {editingCategory ? 'Save Changes' : 'Create Category'}
                            </Button>
                        </DialogActions>
                    </form>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog
                    open={showDeleteDialog}
                    onClose={() => setShowDeleteDialog(false)}
                    aria-labelledby="delete-dialog-title"
                    aria-describedby="delete-dialog-description"
                >
                    <DialogTitle id="delete-dialog-title">
                        Confirm Delete
                    </DialogTitle>
                    <DialogContent>
                        <Typography id="delete-dialog-description">
                            Are you sure you want to delete this {deleteType}? This action cannot be undone.
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
