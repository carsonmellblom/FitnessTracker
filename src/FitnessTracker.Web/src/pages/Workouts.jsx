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
    const [dirtySets, setDirtySets] = useState(new Set()); // Track which sets have unsaved changes


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
            const exercises = workout.exercises.map(ex => ({
                ...ex,
                sets: ex.sets.map(s => ({ ...s }))
            })) || [];
            setFormData({
                title: workout.title,
                description: workout.description || '',
                durationMinutes: workout.durationMinutes,
                workoutDate: workout.workoutDate.split('T')[0],
                exercises,
            });
            // Initialize all exercises as collapsed
            setCollapsedExercises(new Set(exercises.map((_, idx) => idx)));
        } else {
            setEditingWorkout(null);
            setFormData({
                title: '',
                description: '',
                durationMinutes: 30,
                workoutDate: new Date().toISOString().split('T')[0],
                exercises: [],
            });
            setCollapsedExercises(new Set());
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
        // Don't collapse new exercises - user wants to fill them in immediately
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

    const handleAddSet = async (exerciseIndex) => {
        const exercise = formData.exercises[exerciseIndex];
        const lastSet = exercise.sets[exercise.sets.length - 1];

        const newSetData = {
            setNumber: exercise.sets.length + 1,
            reps: lastSet?.reps || 10,
            weight: lastSet?.weight || null,
        };

        // If editing existing workout, save to API immediately
        if (editingWorkout && exercise.id) {
            try {
                await workoutsApi.addSet(editingWorkout.id, exercise.id, newSetData);

                // Reload entire workout to get updated PR status for ALL sets
                const reloaded = await workoutsApi.getById(editingWorkout.id);
                setEditingWorkout(reloaded);

                const exercises = reloaded.exercises.map(ex => ({
                    ...ex,
                    sets: ex.sets.map(s => ({ ...s }))
                })) || [];

                setFormData(prev => ({
                    ...prev,
                    exercises,
                }));

                // Mark the new set as dirty so save icon appears immediately
                const newSetIndex = exercises[exerciseIndex]?.sets.length - 1;
                if (newSetIndex >= 0) {
                    const key = `${exerciseIndex}-${newSetIndex}`;
                    setDirtySets(prev => new Set(prev).add(key));
                }
            } catch (error) {
                console.error('Failed to add set:', error);
                alert(error.message || 'Failed to add set');
            }
        } else {
            // For new workouts without IDs, create the workout first
            try {
                // Create workout with current exercises
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

                const created = await workoutsApi.create(submissionData);
                const reloaded = await workoutsApi.getById(created.id);
                setEditingWorkout(reloaded);

                // Update form data with the reloaded workout (has IDs now)
                const exercises = reloaded.exercises.map(ex => ({
                    ...ex,
                    sets: ex.sets.map(s => ({ ...s }))
                })) || [];

                setFormData({
                    title: reloaded.title,
                    description: reloaded.description || '',
                    durationMinutes: reloaded.durationMinutes,
                    workoutDate: reloaded.workoutDate.split('T')[0],
                    exercises,
                });

                // Now add the new set via API
                const reloadedExercise = exercises[exerciseIndex];
                if (reloadedExercise && reloadedExercise.id) {
                    const savedSet = await workoutsApi.addSet(reloaded.id, reloadedExercise.id, newSetData);

                    // Update local state with the new set
                    setFormData((prev) => {
                        const newExercises = [...prev.exercises];
                        const exercise = { ...newExercises[exerciseIndex] };
                        exercise.sets = [...exercise.sets, savedSet];
                        newExercises[exerciseIndex] = exercise;
                        return { ...prev, exercises: newExercises };
                    });

                    // Mark the new set as dirty
                    const newSetIndex = reloadedExercise.sets.length;
                    const key = `${exerciseIndex}-${newSetIndex}`;
                    setDirtySets(prev => new Set(prev).add(key));
                }
            } catch (error) {
                console.error('Failed to create workout and add set:', error);
                alert(error.message || 'Failed to add set');
            }
        }
    };

    const handleSaveSet = async (exerciseIndex, setIndex) => {
        const exercise = formData.exercises[exerciseIndex];
        const set = exercise.sets[setIndex];

        if (!editingWorkout || !exercise.id || !set.id) {
            alert('Cannot save set - workout must be saved first');
            return;
        }

        try {
            const setData = {
                setNumber: set.setNumber,
                reps: set.reps != null ? parseInt(set.reps) : null,
                weight: set.weight != null ? Math.round(parseFloat(set.weight) * 100) / 100 : null
            };

            await workoutsApi.updateSet(editingWorkout.id, exercise.id, set.id, setData);

            // Reload entire workout to get updated PR status for ALL sets
            const reloaded = await workoutsApi.getById(editingWorkout.id);
            setEditingWorkout(reloaded);

            const exercises = reloaded.exercises.map(ex => ({
                ...ex,
                sets: ex.sets.map(s => ({ ...s }))
            })) || [];

            setFormData(prev => ({
                ...prev,
                exercises,
            }));

            // Mark set as clean after successful save
            markSetClean(exerciseIndex, setIndex);
        } catch (error) {
            console.error('Failed to save set:', error);
            alert(error.message || 'Failed to save set');
        }
    };

    const handleSetChange = (exerciseIndex, setIndex, field, value) => {
        const exercise = formData.exercises[exerciseIndex];
        const set = exercise.sets[setIndex];

        // Mark set as dirty if it has an ID (existing set)
        if (set.id) {
            const key = `${exerciseIndex}-${setIndex}`;
            setDirtySets(prev => new Set(prev).add(key));
        }

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

    const isSetDirty = (exerciseIndex, setIndex) => {
        const key = `${exerciseIndex}-${setIndex}`;
        return dirtySets.has(key);
    };

    const markSetClean = (exerciseIndex, setIndex) => {
        const key = `${exerciseIndex}-${setIndex}`;
        setDirtySets(prev => {
            const newSet = new Set(prev);
            newSet.delete(key);
            return newSet;
        });
    };

    const handleRemoveSet = async (exerciseIndex, setIndex) => {
        const exercise = formData.exercises[exerciseIndex];
        const set = exercise.sets[setIndex];

        // If editing existing workout and set has an ID, delete from API
        if (editingWorkout && exercise.id && set.id) {
            if (!window.confirm('Are you sure you want to delete this set?')) return;

            try {
                await workoutsApi.deleteSet(editingWorkout.id, exercise.id, set.id);

                // Reload entire workout to get updated PR status for remaining sets
                const reloaded = await workoutsApi.getById(editingWorkout.id);
                setEditingWorkout(reloaded);

                const exercises = reloaded.exercises.map(ex => ({
                    ...ex,
                    sets: ex.sets.map(s => ({ ...s }))
                })) || [];

                setFormData(prev => ({
                    ...prev,
                    exercises,
                }));
            } catch (error) {
                console.error('Failed to delete set:', error);
                alert(error.message || 'Failed to delete set');
            }
        } else {
            // For new workouts, just update local state
            setFormData((prev) => {
                const newExercises = [...prev.exercises];
                const exercise = { ...newExercises[exerciseIndex] };
                exercise.sets = exercise.sets.filter((_, i) => i !== setIndex).map((s, i) => ({ ...s, setNumber: i + 1 }));
                newExercises[exerciseIndex] = exercise;
                return { ...prev, exercises: newExercises };
            });
        }
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

    const toggleCollapseAll = () => {
        // If all are collapsed, expand all. Otherwise, collapse all.
        const allCollapsed = formData.exercises.every((_, idx) => collapsedExercises.has(idx));

        if (allCollapsed) {
            // Expand all
            setCollapsedExercises(new Set());
        } else {
            // Collapse all
            setCollapsedExercises(new Set(formData.exercises.map((_, idx) => idx)));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // If editing an existing workout, auto-save all dirty sets then close
        if (editingWorkout) {
            await autoSaveAllDirtySets();
            handleCloseModal();
            loadWorkouts();
            return;
        }

        // For new workouts, create the workout skeleton first
        try {
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

            const created = await workoutsApi.create(submissionData);

            // Reload the created workout to get IDs for all entities
            const reloaded = await workoutsApi.getById(created.id);
            setEditingWorkout(reloaded);

            // Update form data with the reloaded workout (has IDs now)
            const exercises = reloaded.exercises.map(ex => ({
                ...ex,
                sets: ex.sets.map(s => ({ ...s }))
            })) || [];

            setFormData({
                title: reloaded.title,
                description: reloaded.description || '',
                durationMinutes: reloaded.durationMinutes,
                workoutDate: reloaded.workoutDate.split('T')[0],
                exercises,
            });

            setDirtySets(new Set()); // All sets are clean after creation
        } catch (error) {
            console.error('Failed to save workout:', error);
            alert(error.message || 'Failed to save workout. Please check your inputs.');
        }
    };

    const autoSaveAllDirtySets = async () => {
        const savePromises = [];

        formData.exercises.forEach((exercise, exerciseIndex) => {
            exercise.sets.forEach((set, setIndex) => {
                if (isSetDirty(exerciseIndex, setIndex) && set.id) {
                    savePromises.push(handleSaveSet(exerciseIndex, setIndex));
                }
            });
        });

        await Promise.all(savePromises);
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
                                    <h3 className="card-title">
                                        {new Date(workout.workoutDate).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </h3>
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
                                                            {set.isPR && (
                                                                <span
                                                                    style={{
                                                                        marginLeft: '0.5rem',
                                                                        fontSize: '1.1rem',
                                                                        filter: 'drop-shadow(0 0 4px rgba(255, 215, 0, 0.6))'
                                                                    }}
                                                                    title="Personal Record!"
                                                                >
                                                                    🏆
                                                                </span>
                                                            )}
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
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            {formData.exercises.length > 0 && (
                                                <button
                                                    type="button"
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={toggleCollapseAll}
                                                    title={formData.exercises.every((_, idx) => collapsedExercises.has(idx)) ? "Expand all sets" : "Collapse all sets"}
                                                >
                                                    {formData.exercises.every((_, idx) => collapsedExercises.has(idx)) ? '📂 Expand All' : '📁 Collapse All'}
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                className="btn btn-secondary btn-sm"
                                                onClick={handleAddExercise}
                                            >
                                                ➕ Add Exercise
                                            </button>
                                        </div>
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
                                                                    <div key={setIndex} className="grid" style={{ gridTemplateColumns: '40px 1fr 1fr auto', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                                                                        <div className="set-label">#{set.setNumber}</div>
                                                                        <input
                                                                            type="number"
                                                                            className="form-input btn-sm"
                                                                            placeholder="Reps"
                                                                            value={set.reps || ''}
                                                                            onChange={(e) => handleSetChange(index, setIndex, 'reps', e.target.value)}
                                                                            required
                                                                        />
                                                                        <input
                                                                            type="number"
                                                                            step="0.5"
                                                                            className="form-input btn-sm"
                                                                            placeholder="lbs"
                                                                            value={set.weight === null ? '' : set.weight}
                                                                            onChange={(e) => handleSetChange(index, setIndex, 'weight', e.target.value)}
                                                                            max="2000"
                                                                        />
                                                                        <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                                                                            {/* Show save button only for existing sets that have been modified */}
                                                                            {editingWorkout && exercise.id && set.id && isSetDirty(index, setIndex) && (
                                                                                <button
                                                                                    type="button"
                                                                                    className="btn btn-primary btn-xs"
                                                                                    onClick={() => handleSaveSet(index, setIndex)}
                                                                                    title="Save changes to this set"
                                                                                >
                                                                                    💾
                                                                                </button>
                                                                            )}
                                                                            {/* Show PR trophy if applicable */}
                                                                            {set.isPR && (
                                                                                <span
                                                                                    style={{
                                                                                        fontSize: '1.1rem',
                                                                                        filter: 'drop-shadow(0 0 4px rgba(255, 215, 0, 0.6))'
                                                                                    }}
                                                                                    title="Personal Record!"
                                                                                >
                                                                                    🏆
                                                                                </span>
                                                                            )}
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
                                <button type="submit" className="btn btn-primary">
                                    Close
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
