import { useState, useEffect } from 'react';
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
            setShowNotes(!!workout.description);
        } else if (templateData) {
            // Creating from template
            setFormData({
                title: '',
                description: templateData.description || '',
                durationMinutes: templateData.durationMinutes || 30,
                workoutDate: initialDate || new Date().toISOString().split('T')[0],
                exercises: templateData.exercises || [],
            });
            // Collapse all template exercises initially
            setCollapsedExercises(new Set((templateData.exercises || []).map((_, idx) => idx)));
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
            alert('No more exercises to add!');
            return;
        }
        setFormData((prev) => ({
            ...prev,
            exercises: [
                ...prev.exercises,
                {
                    exerciseDefinitionId: unusedDefs[0].id,
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
            alert(error.message || 'Failed to save workout. Please check your inputs.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">
                        {workout ? 'Edit Workout' : 'Log Workout'}
                    </h2>
                    <button
                        className="btn btn-secondary btn-icon"
                        onClick={onClose}
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">

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
                                        disabled={unusedExerciseDefinitions.length === 0}
                                    >
                                        ➕ Add Exercise
                                    </button>
                                </div>
                            </div>

                            <div className="exercise-list">
                                {formData.exercises.map((exercise, index) => {
                                    const isCollapsed = collapsedExercises.has(index);
                                    const availableForThisRow = definitions.filter(d =>
                                        d.id == exercise.exerciseDefinitionId ||
                                        !formData.exercises.some((ex, i) => i !== index && ex.exerciseDefinitionId == d.id)
                                    );

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
                                                    {availableForThisRow.map(def => (
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

                        {/* Notes Section - Collapsible at bottom */}
                        <div className="form-group" style={{ marginTop: '1rem' }}>
                            <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => setShowNotes(!showNotes)}
                                style={{ width: '100%' }}
                            >
                                {showNotes ? '📝 Hide Notes' : '📝 Add Notes'}
                                {formData.description && !showNotes && (
                                    <span style={{ marginLeft: '0.5rem', opacity: 0.7 }}>•</span>
                                )}
                            </button>
                            {showNotes && (
                                <textarea
                                    name="description"
                                    className="form-textarea"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="How did the workout go?"
                                    style={{ marginTop: '0.5rem' }}
                                />
                            )}
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {workout ? 'Save Changes' : 'Log Workout'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default WorkoutModal;
