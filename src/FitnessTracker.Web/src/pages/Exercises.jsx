import { useState, useEffect } from 'react';
import { exerciseDefinitionsApi, categoriesApi } from '../services/api';

export default function Exercises() {
    const [exercises, setExercises] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('exercises'); // 'exercises' or 'categories'
    const [showExerciseModal, setShowExerciseModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editingExercise, setEditingExercise] = useState(null);
    const [editingCategory, setEditingCategory] = useState(null);
    const [filterCategory, setFilterCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

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
            alert('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleExerciseSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingExercise) {
                await exerciseDefinitionsApi.update(editingExercise.id, exerciseForm);
            } else {
                await exerciseDefinitionsApi.create(exerciseForm);
            }
            await loadData();
            closeExerciseModal();
        } catch (error) {
            console.error('Error saving exercise:', error);
            alert('Failed to save exercise');
        }
    };

    const handleCategorySubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCategory) {
                await categoriesApi.update(editingCategory.id, categoryForm);
            } else {
                await categoriesApi.create(categoryForm);
            }
            await loadData();
            closeCategoryModal();
        } catch (error) {
            console.error('Error saving category:', error);
            alert('Failed to save category');
        }
    };

    const handleDeleteExercise = async (id) => {
        if (!confirm('Are you sure you want to delete this exercise?')) return;
        try {
            await exerciseDefinitionsApi.delete(id);
            await loadData();
        } catch (error) {
            console.error('Error deleting exercise:', error);
            alert('Failed to delete exercise');
        }
    };

    const handleDeleteCategory = async (id) => {
        if (!confirm('Are you sure you want to delete this category?')) return;
        try {
            await categoriesApi.delete(id);
            await loadData();
        } catch (error) {
            console.error('Error deleting category:', error);
            alert('Failed to delete category');
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
            <div className="loading">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">💪 Exercise Library</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn btn-secondary" onClick={() => openCategoryModal()}>
                        ➕ New Category
                    </button>
                    <button className="btn btn-primary" onClick={() => openExerciseModal()}>
                        ➕ New Exercise
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '1.5rem',
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: '0.5rem'
            }}>
                <button
                    className={`btn ${activeTab === 'exercises' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('exercises')}
                    style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0' }}
                >
                    Exercises ({exercises.length})
                </button>
                <button
                    className={`btn ${activeTab === 'categories' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('categories')}
                    style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0' }}
                >
                    Categories ({categories.length})
                </button>
            </div>

            {activeTab === 'exercises' ? (
                <>
                    {/* Filters */}
                    <div style={{
                        display: 'flex',
                        gap: '1rem',
                        marginBottom: '1.5rem',
                        flexWrap: 'wrap',
                        alignItems: 'center'
                    }}>
                        <input
                            type="text"
                            placeholder="🔍 Search exercises..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="form-input"
                            style={{ flex: '1', minWidth: '250px' }}
                        />
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="form-select"
                            style={{ minWidth: '200px' }}
                        >
                            <option value="all">All Categories</option>
                            <option value="uncategorized">Uncategorized</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Exercise Grid */}
                    {filteredExercises.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">🏋️</div>
                            <h3>No exercises found</h3>
                            <p>Create your first exercise to get started!</p>
                        </div>
                    ) : (
                        <div className="grid grid-3">
                            {filteredExercises.map(exercise => (
                                <div key={exercise.id} className="card">
                                    <div className="card-header">
                                        <div>
                                            <h3 className="card-title">{exercise.name}</h3>
                                            <p className="card-subtitle">{exercise.primaryMuscleGroup}</p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                className="btn btn-sm btn-secondary"
                                                onClick={() => openExerciseModal(exercise)}
                                                title="Edit"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className="btn btn-sm btn-danger"
                                                onClick={() => handleDeleteExercise(exercise.id)}
                                                title="Delete"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                    {exercise.description && (
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                                            {exercise.description}
                                        </p>
                                    )}
                                    {exercise.categoryName && (
                                        <div style={{ marginTop: '0.75rem' }}>
                                            <span className="badge badge-processing">
                                                {exercise.categoryName}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <>
                    {/* Categories Grid */}
                    {categories.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">📁</div>
                            <h3>No categories found</h3>
                            <p>Create your first category to organize exercises!</p>
                        </div>
                    ) : (
                        <div className="grid grid-3">
                            {categories.map(category => {
                                const categoryExercises = exercises.filter(ex => ex.categoryId === category.id);
                                return (
                                    <div key={category.id} className="card">
                                        <div className="card-header">
                                            <div>
                                                <h3 className="card-title">{category.name}</h3>
                                                <p className="card-subtitle">
                                                    {categoryExercises.length} exercise{categoryExercises.length !== 1 ? 's' : ''}
                                                </p>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    className="btn btn-sm btn-secondary"
                                                    onClick={() => openCategoryModal(category)}
                                                    title="Edit"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => handleDeleteCategory(category.id)}
                                                    title="Delete"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                        {category.description && (
                                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                                                {category.description}
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}

            {/* Exercise Modal */}
            {showExerciseModal && (
                <div className="modal-overlay" onClick={closeExerciseModal}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">
                                {editingExercise ? 'Edit Exercise' : 'New Exercise'}
                            </h2>
                            <button className="btn btn-icon btn-secondary" onClick={closeExerciseModal}>
                                ✕
                            </button>
                        </div>
                        <form onSubmit={handleExerciseSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Exercise Name *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={exerciseForm.name}
                                        onChange={(e) => setExerciseForm({ ...exerciseForm, name: e.target.value })}
                                        required
                                        placeholder="e.g., Barbell Row"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Primary Muscle Group *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={exerciseForm.primaryMuscleGroup}
                                        onChange={(e) => setExerciseForm({ ...exerciseForm, primaryMuscleGroup: e.target.value })}
                                        required
                                        placeholder="e.g., Back, Chest, Legs"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Category</label>
                                    <select
                                        className="form-select"
                                        value={exerciseForm.categoryId || ''}
                                        onChange={(e) => setExerciseForm({
                                            ...exerciseForm,
                                            categoryId: e.target.value ? parseInt(e.target.value) : null
                                        })}
                                    >
                                        <option value="">No Category</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Description</label>
                                    <textarea
                                        className="form-textarea"
                                        value={exerciseForm.description}
                                        onChange={(e) => setExerciseForm({ ...exerciseForm, description: e.target.value })}
                                        placeholder="Optional description..."
                                        rows="3"
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeExerciseModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingExercise ? 'Save Changes' : 'Create Exercise'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Category Modal */}
            {showCategoryModal && (
                <div className="modal-overlay" onClick={closeCategoryModal}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">
                                {editingCategory ? 'Edit Category' : 'New Category'}
                            </h2>
                            <button className="btn btn-icon btn-secondary" onClick={closeCategoryModal}>
                                ✕
                            </button>
                        </div>
                        <form onSubmit={handleCategorySubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Category Name *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={categoryForm.name}
                                        onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                                        required
                                        placeholder="e.g., Strength Training"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Description</label>
                                    <textarea
                                        className="form-textarea"
                                        value={categoryForm.description}
                                        onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                                        placeholder="Optional description..."
                                        rows="3"
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeCategoryModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingCategory ? 'Save Changes' : 'Create Category'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
