import { useState, useEffect } from 'react';
import { templatesApi, exerciseDefinitionsApi, workoutsApi } from '../services/api';
import { useNavigate } from 'react-router-dom';

function Templates() {
    const navigate = useNavigate();
    const [templates, setTemplates] = useState([]);
    const [definitions, setDefinitions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
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
                    exerciseDefinitionId: definitions[0]?.id || 0,
                    notes: '',
                    targetSets: [{ setNumber: 1, targetReps: 10, targetWeight: null }]
                },
            ],
        }));
    };

    const handleExerciseChange = (index, field, value) => {
        setFormData((prev) => ({
            ...prev,
            exercises: prev.exercises.map((ex, i) =>
                i === index ? { ...ex, [field]: value } : ex
            ),
        }));
    };

    const handleAddSet = (exerciseIndex) => {
        setFormData((prev) => {
            const newExercises = [...prev.exercises];
            const exercise = { ...newExercises[exerciseIndex] };
            const sets = [...exercise.targetSets];
            const lastSet = sets[sets.length - 1];

            sets.push({
                setNumber: sets.length + 1,
                targetReps: lastSet?.targetReps || 10,
                targetWeight: lastSet?.targetWeight || null,
            });

            exercise.targetSets = sets;
            newExercises[exerciseIndex] = exercise;
            return { ...prev, exercises: newExercises };
        });
    };

    const handleSetChange = (exerciseIndex, setIndex, field, value) => {
        setFormData((prev) => {
            const newExercises = [...prev.exercises];
            const exercise = { ...newExercises[exerciseIndex] };
            const sets = [...exercise.targetSets];

            sets[setIndex] = {
                ...sets[setIndex],
                [field]: value === '' ? null : (field === 'targetWeight' ? parseFloat(value) : parseInt(value)),
            };

            exercise.targetSets = sets;
            newExercises[exerciseIndex] = exercise;
            return { ...prev, exercises: newExercises };
        });
    };

    const handleRemoveSet = (exerciseIndex, setIndex) => {
        setFormData((prev) => {
            const newExercises = [...prev.exercises];
            const exercise = { ...newExercises[exerciseIndex] };
            exercise.targetSets = exercise.targetSets
                .filter((_, i) => i !== setIndex)
                .map((s, i) => ({ ...s, setNumber: i + 1 }));
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

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this template?')) return;
        try {
            await templatesApi.delete(id);
            loadTemplates();
        } catch (error) {
            console.error('Failed to delete template:', error);
        }
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
            <div className="loading">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1 className="page-title">Workout Templates</h1>
                <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                    ➕ Create Template
                </button>
            </div>

            {templates.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon">📋</div>
                        <h3>No templates yet</h3>
                        <p>Create templates for your regular routines to log workouts faster!</p>
                        <button
                            className="btn btn-primary"
                            onClick={() => handleOpenModal()}
                            style={{ marginTop: '1rem' }}
                        >
                            Create Your First Template
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-2">
                    {templates.map((template) => (
                        <div key={template.id} className="card">
                            <div className="card-header">
                                <div>
                                    <h3 className="card-title">{template.title}</h3>
                                    <p className="card-subtitle">
                                        {template.exercises.length} exercises
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        className="btn btn-primary btn-sm"
                                        onClick={() => handleLogWorkout(template.id)}
                                        title="Log Workout from Template"
                                    >
                                        🚀 Log
                                    </button>
                                    <button
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => handleOpenModal(template)}
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleDelete(template.id)}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>

                            {template.description && (
                                <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                                    {template.description}
                                </p>
                            )}

                            <div className="exercise-list">
                                {template.exercises.map((exercise) => (
                                    <div key={exercise.id} className="exercise-item-vertical" style={{ marginBottom: '0.5rem' }}>
                                        <div>
                                            <strong>{exercise.exerciseName}</strong>
                                            <span style={{ marginLeft: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                {exercise.targetSets.length} sets
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Template Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">
                                {editingTemplate ? 'Edit Template' : 'Create Template'}
                            </h2>
                            <button className="btn btn-secondary btn-icon" onClick={handleCloseModal}>
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Template Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        className="form-input"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Push Day A"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Description (optional)</label>
                                    <textarea
                                        name="description"
                                        className="form-textarea"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="What is this routine for?"
                                    />
                                </div>

                                <div className="form-group">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <label className="form-label" style={{ margin: 0 }}>Exercises</label>
                                        <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddExercise}>
                                            ➕ Add Exercise
                                        </button>
                                    </div>

                                    <div className="exercise-list">
                                        {formData.exercises.map((exercise, index) => (
                                            <div key={index} style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                                                    <select
                                                        className="form-input"
                                                        value={exercise.exerciseDefinitionId}
                                                        onChange={(e) => handleExerciseChange(index, 'exerciseDefinitionId', e.target.value)}
                                                        required
                                                    >
                                                        {definitions.map(def => (
                                                            <option key={def.id} value={def.id}>
                                                                {def.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <button type="button" className="btn btn-danger btn-icon" onClick={() => handleRemoveExercise(index)}>
                                                        ✕
                                                    </button>
                                                </div>

                                                <div className="sets-container">
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                                        <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Target Sets</span>
                                                        <button type="button" className="btn btn-secondary btn-xs" onClick={() => handleAddSet(index)}>
                                                            + Add Set
                                                        </button>
                                                    </div>
                                                    {exercise.targetSets?.map((set, setIndex) => (
                                                        <div key={setIndex} className="grid grid-3" style={{ gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                                                            <div className="set-label">#{set.setNumber}</div>
                                                            <input
                                                                type="number"
                                                                className="form-input btn-sm"
                                                                placeholder="Target Reps"
                                                                value={set.targetReps || ''}
                                                                onChange={(e) => handleSetChange(index, setIndex, 'targetReps', e.target.value)}
                                                                required
                                                            />
                                                            <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                                                                <input
                                                                    type="number"
                                                                    step="0.5"
                                                                    className="form-input btn-sm"
                                                                    placeholder="Target lbs"
                                                                    value={set.targetWeight === null ? '' : set.targetWeight}
                                                                    onChange={(e) => handleSetChange(index, setIndex, 'targetWeight', e.target.value)}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-danger btn-xs"
                                                                    onClick={() => handleRemoveSet(index, setIndex)}
                                                                    disabled={exercise.targetSets.length === 1}
                                                                >
                                                                    ✕
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancel</button>
                                <button type="submit" className="btn btn-primary">
                                    {editingTemplate ? 'Save Changes' : 'Create Template'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Templates;
