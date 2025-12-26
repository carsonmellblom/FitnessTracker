import { useState, useEffect } from 'react';
import { workoutsApi, exerciseDefinitionsApi } from '../services/api';
import WorkoutModal from '../components/WorkoutModal';

function Workouts() {
    const [workouts, setWorkouts] = useState([]);
    const [definitions, setDefinitions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingWorkout, setEditingWorkout] = useState(null);

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
                {/* Log Workout button removed - use Calendar to create workouts */}
            </div>

            {workouts.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon">🏋️</div>
                        <h3>No workouts yet</h3>
                        <p>Go to the Calendar page to log your first workout!</p>
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
            <WorkoutModal
                isOpen={showModal}
                onClose={handleCloseModal}
                onSave={loadWorkouts}
                workout={editingWorkout}
                initialDate={new Date().toISOString().split('T')[0]}
                definitions={definitions}
                templateData={null}
            />
        </div>
    );
}

export default Workouts;
