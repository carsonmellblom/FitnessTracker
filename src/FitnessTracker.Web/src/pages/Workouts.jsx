import { useState, useEffect } from 'react';
import { workoutsApi, exerciseDefinitionsApi } from '../services/api';

function Workouts() {
    const [workouts, setWorkouts] = useState([]);
    const [definitions, setDefinitions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingWorkout, setEditingWorkout] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        durationMinutes: 30,
        workoutDate: new Date().toISOString().split('T')[0],
        exercises: [],
    });
    const [collapsedExercises, setCollapsedExercises] = useState(new Set());


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
        if (workout) {
            setEditingWorkout(workout);
            setFormData({
                title: workout.title,
                description: workout.description || '',
                durationMinutes: workout.durationMinutes,
                workoutDate: workout.workoutDate.split('T')[0],
                exercises: workout.exercises.map(ex => ({
                    ...ex,
                    sets: ex.sets.map(s => ({ ...s }))
                })) || [],
            });
        } else {
            setEditingWorkout(null);
            setFormData({
                title: '',
                description: '',
                durationMinutes: 30,
                workoutDate: new Date().toISOString().split('T')[0],
                exercises: [],
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingWorkout(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'durationMinutes' ? parseInt(value) || 0 : value,
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
                    sets: [{ setNumber: 1, reps: 10, weight: null }]
                },
            ],
        }));
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

        // Update collapsed state
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

        // Update collapsed state
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Clean up data for submission
            const submissionData = {
                ...formData,
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

            if (editingWorkout) {
                await workoutsApi.update(editingWorkout.id, submissionData);
            } else {
                await workoutsApi.create(submissionData);
            }
            handleCloseModal();
            loadWorkouts();
        } catch (error) {
            console.error('Failed to save workout:', error);
            alert(error.message || 'Failed to save workout. Please check your inputs.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this workout?')) return;
        try {
            await workoutsApi.delete(id);
            loadWorkouts();
        } catch (error) {
            console.error('Failed to delete workout:', error);
            alert(error.message || 'Failed to delete workout. Please try again.');
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
                <h1 className="page-title">Workouts</h1>
                <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                    ➕ Log Workout
                </button>
            </div>

            {workouts.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon">🏋️</div>
                        <h3>No workouts yet</h3>
                        <p>Start logging your workouts to track your progress!</p>
                        <button
                            className="btn btn-primary"
                            onClick={() => handleOpenModal()}
                            style={{ marginTop: '1rem' }}
                        >
                            Log Your First Workout
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-2">
                    {workouts.map((workout) => (
                        <div key={workout.id} className="card">
                            <div className="card-header">
                                <div>
                                    <h3 className="card-title">{workout.title}</h3>
                                    <p className="card-subtitle">
                                        {new Date(workout.workoutDate).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => handleOpenModal(workout)}
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleDelete(workout.id)}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>

                            {workout.description && (
                                <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                                    {workout.description}
                                </p>
                            )}

                            <div style={{ display: 'flex', gap: '2rem', marginBottom: '1rem' }}>
                                <div className="exercise-stat">
                                    <div className="exercise-stat-value">{workout.durationMinutes}</div>
                                    <div className="exercise-stat-label">Minutes</div>
                                </div>
                                <div className="exercise-stat">
                                    <div className="exercise-stat-value">{workout.exercises.length}</div>
                                    <div className="exercise-stat-label">Exercises</div>
                                </div>
                            </div>

                            {workout.exercises.length > 0 && (
                                <div className="exercise-list">
                                    {workout.exercises.map((exercise) => (
                                        <div
                                            key={exercise.id}
                                            className="exercise-item-vertical"
                                            style={{ marginBottom: '1rem' }}
                                        >
                                            <div style={{ marginBottom: '0.5rem' }}>
                                                <strong>{exercise.exerciseName}</strong>
                                                {exercise.notes && (
                                                    <div className="card-subtitle">{exercise.notes}</div>
                                                )}
                                            </div>
                                            <div className="sets-grid">
                                                {exercise.sets.map((set, idx) => (
                                                    <div key={idx} className="set-row">
                                                        <span className="set-number">Set {set.setNumber}</span>
                                                        <span className="set-stats">
                                                            {set.reps} reps @ {set.weight} lbs
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Workout Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">
                                {editingWorkout ? 'Edit Workout' : 'Log Workout'}
                            </h2>
                            <button
                                className="btn btn-secondary btn-icon"
                                onClick={handleCloseModal}
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Workout Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        className="form-input"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Upper Body Strength"
                                        required
                                    />
                                </div>

                                <div className="grid grid-2">
                                    <div className="form-group">
                                        <label className="form-label">Date</label>
                                        <input
                                            type="date"
                                            name="workoutDate"
                                            className="form-input"
                                            value={formData.workoutDate}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Duration (minutes)</label>
                                        <input
                                            type="number"
                                            name="durationMinutes"
                                            className="form-input"
                                            value={formData.durationMinutes}
                                            onChange={handleInputChange}
                                            min="1"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Notes (optional)</label>
                                    <textarea
                                        name="description"
                                        className="form-textarea"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="How did the workout go?"
                                    />
                                </div>

                                <div className="form-group">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <label className="form-label" style={{ margin: 0 }}>
                                            Exercises
                                        </label>
                                        <button
                                            type="button"
                                            className="btn btn-secondary btn-sm"
                                            onClick={handleAddExercise}
                                        >
                                            ➕ Add Exercise
                                        </button>
                                    </div>

                                    <div className="exercise-list">
                                        {formData.exercises.map((exercise, index) => {
                                            const isCollapsed = collapsedExercises.has(index);
                                            const selectedDef = definitions.find(d => d.id == exercise.exerciseDefinitionId);

                                            return (
                                                <div
                                                    key={index}
                                                    style={{
                                                        background: 'var(--bg-secondary)',
                                                        padding: '1rem',
                                                        borderRadius: 'var(--radius-md)',
                                                        marginBottom: '0.5rem',
                                                        border: '1px solid var(--border-color)',
                                                    }}
                                                >
                                                    {/* Exercise Header with Reorder Controls */}
                                                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', alignItems: 'center' }}>
                                                        {/* Reorder buttons */}
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                            <button
                                                                type="button"
                                                                className="btn btn-secondary"
                                                                onClick={() => moveExerciseUp(index)}
                                                                disabled={index === 0}
                                                                style={{
                                                                    padding: '2px 8px',
                                                                    fontSize: '0.7rem',
                                                                    minWidth: '28px',
                                                                    opacity: index === 0 ? 0.3 : 1,
                                                                    cursor: index === 0 ? 'not-allowed' : 'pointer'
                                                                }}
                                                                title="Move up"
                                                            >
                                                                ▲
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="btn btn-secondary"
                                                                onClick={() => moveExerciseDown(index)}
                                                                disabled={index >= formData.exercises.length - 1}
                                                                style={{
                                                                    padding: '2px 8px',
                                                                    fontSize: '0.7rem',
                                                                    minWidth: '28px',
                                                                    opacity: index >= formData.exercises.length - 1 ? 0.3 : 1,
                                                                    cursor: index >= formData.exercises.length - 1 ? 'not-allowed' : 'pointer'
                                                                }}
                                                                title="Move down"
                                                            >
                                                                ▼
                                                            </button>
                                                        </div>

                                                        {/* Exercise dropdown */}
                                                        <select
                                                            className="form-input"
                                                            value={exercise.exerciseDefinitionId}
                                                            onChange={(e) =>
                                                                handleExerciseChange(index, 'exerciseDefinitionId', e.target.value)
                                                            }
                                                            required
                                                            style={{ flex: 1 }}
                                                        >
                                                            {definitions.map(def => (
                                                                <option key={def.id} value={def.id}>
                                                                    {def.name} ({def.primaryMuscleGroup})
                                                                </option>
                                                            ))}
                                                        </select>

                                                        {/* Delete button */}
                                                        <button
                                                            type="button"
                                                            className="btn btn-danger btn-icon"
                                                            onClick={() => handleRemoveExercise(index)}
                                                            title="Remove exercise"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>

                                                    {/* Sets Section - Collapsible */}
                                                    <div className="sets-container" style={{ marginTop: '0.5rem' }}>
                                                        <div
                                                            style={{
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                marginBottom: '0.5rem',
                                                                cursor: 'pointer',
                                                                userSelect: 'none'
                                                            }}
                                                            onClick={() => toggleExerciseCollapse(index)}
                                                        >
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
                                                                    {isCollapsed ? '▶' : '▼'} Sets
                                                                </span>
                                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                                    ({exercise.sets.length})
                                                                </span>
                                                            </div>
                                                            {!isCollapsed && (
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-secondary btn-xs"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleAddSet(index);
                                                                    }}
                                                                >
                                                                    + Add Set
                                                                </button>
                                                            )}
                                                        </div>

                                                        {!isCollapsed && (
                                                            <div style={{
                                                                animation: 'fadeIn 0.2s ease',
                                                                overflow: 'hidden'
                                                            }}>
                                                                {exercise.sets.map((set, setIndex) => (
                                                                    <div key={setIndex} className="grid grid-3" style={{ gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                                                                        <div className="set-label">#{set.setNumber}</div>
                                                                        <input
                                                                            type="number"
                                                                            className="form-input btn-sm"
                                                                            placeholder="Reps"
                                                                            value={set.reps || ''}
                                                                            onChange={(e) => handleSetChange(index, setIndex, 'reps', e.target.value)}
                                                                            required
                                                                        />
                                                                        <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                                                                            <input
                                                                                type="number"
                                                                                step="0.5"
                                                                                className="form-input btn-sm"
                                                                                placeholder="lbs"
                                                                                value={set.weight === null ? '' : set.weight}
                                                                                onChange={(e) => handleSetChange(index, setIndex, 'weight', e.target.value)}
                                                                                max="2000"
                                                                            />
                                                                            <button
                                                                                type="button"
                                                                                className="btn btn-danger btn-xs"
                                                                                onClick={() => handleRemoveSet(index, setIndex)}
                                                                                disabled={exercise.sets.length === 1}
                                                                            >
                                                                                ✕
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Exercise Notes */}
                                                    <div style={{ marginTop: '0.75rem' }}>
                                                        <input
                                                            type="text"
                                                            className="form-input btn-sm"
                                                            placeholder="Exercise notes..."
                                                            value={exercise.notes || ''}
                                                            onChange={(e) => handleExerciseChange(index, 'notes', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={handleCloseModal}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingWorkout ? 'Save Changes' : 'Log Workout'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Workouts;
