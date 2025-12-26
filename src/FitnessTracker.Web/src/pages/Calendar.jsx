import { useState, useEffect } from 'react';
import { workoutsApi, exerciseDefinitionsApi, templatesApi } from '../services/api';
import { useNavigate } from 'react-router-dom';
import WorkoutModal from '../components/WorkoutModal';

function Calendar() {
    const navigate = useNavigate();
    const [workouts, setWorkouts] = useState([]);
    const [definitions, setDefinitions] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedWorkoutId, setSelectedWorkoutId] = useState(null);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [showChoiceModal, setShowChoiceModal] = useState(false);
    const [editingWorkout, setEditingWorkout] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [templateData, setTemplateData] = useState(null); // Pre-filled data from template

    useEffect(() => {
        loadData();
    }, []);

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
        if (!window.confirm(`Copy "${workout.title}" to today?`)) return;

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
            alert('Workout copied to today!');
        } catch (error) {
            console.error('Failed to copy workout:', error);
            alert(error.message || 'Failed to copy workout');
        }
    };

    const handleDeleteWorkout = async (workout) => {
        if (!window.confirm(`Delete "${workout.title}"?`)) return;

        try {
            await workoutsApi.delete(workout.id);
            await loadWorkouts();
            setSelectedWorkoutId(null);
        } catch (error) {
            console.error('Failed to delete workout:', error);
            alert(error.message || 'Failed to delete workout');
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
            <div className="loading">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1 className="page-title">Workout Calendar</h1>
                <button className="btn btn-secondary" onClick={() => navigate('/workouts')}>
                    📋 View All Workouts
                </button>
            </div>

            <div className="card">
                <div className="calendar-header">
                    <button className="btn btn-secondary" onClick={previousMonth}>
                        ← Previous
                    </button>
                    <h2 style={{ margin: 0 }}>
                        {monthNames[month]} {year}
                    </h2>
                    <button className="btn btn-secondary" onClick={nextMonth}>
                        Next →
                    </button>
                </div>

                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    Click any day to log a workout
                </p>

                <div className="calendar-grid">
                    {dayNames.map(day => (
                        <div key={day} className="calendar-day-name">
                            {day}
                        </div>
                    ))}

                    {days.map((day, index) => {
                        const dateKey = getDateKey(day);
                        const dayWorkouts = dateKey ? workoutsByDate[dateKey] || [] : [];
                        const isTodayDate = isToday(day);
                        const hasWorkout = dayWorkouts.length > 0;

                        return (
                            <div
                                key={index}
                                className={`calendar-day ${!day ? 'calendar-day-empty' : ''} ${isTodayDate ? 'calendar-day-today' : ''}`}
                                onClick={() => handleDayClick(day)}
                                style={{ cursor: day ? 'pointer' : 'default' }}
                            >
                                {day && (
                                    <>
                                        <div className="calendar-day-number">{day}</div>
                                        <div className="calendar-workouts">
                                            {dayWorkouts.map(workout => (
                                                <div key={workout.id} className="calendar-workout-item">
                                                    <div
                                                        className="calendar-workout-title"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedWorkoutId(selectedWorkoutId === workout.id ? null : workout.id);
                                                        }}
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        💪 {workout.title}
                                                    </div>
                                                    {selectedWorkoutId === workout.id && (
                                                        <div className="calendar-workout-details">
                                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                                                {workout.exercises.length} exercise{workout.exercises.length !== 1 ? 's' : ''} • {workout.durationMinutes} min
                                                            </div>
                                                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                                <button
                                                                    className="btn btn-secondary btn-xs"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setEditingWorkout(workout);
                                                                        setSelectedDate(null);
                                                                        setTemplateData(null);
                                                                        setShowModal(true);
                                                                    }}
                                                                >
                                                                    ✏️ Edit
                                                                </button>
                                                                <button
                                                                    className="btn btn-danger btn-xs"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDeleteWorkout(workout);
                                                                    }}
                                                                >
                                                                    🗑️ Delete
                                                                </button>
                                                                {!isTodayDate && (
                                                                    <button
                                                                        className="btn btn-primary btn-xs"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleCopyToToday(workout);
                                                                        }}
                                                                    >
                                                                        📋 Copy to Today
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                            {!hasWorkout && (
                                                <div style={{
                                                    fontSize: '0.75rem',
                                                    color: 'var(--text-muted)',
                                                    opacity: 0.5,
                                                    textAlign: 'center',
                                                    padding: '0.25rem'
                                                }}>
                                                    + Add
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Choice Modal - New Workout or From Template */}
            {showChoiceModal && (
                <div className="modal-overlay" onClick={() => setShowChoiceModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                        <div className="modal-header">
                            <h2 className="modal-title">Add Workout</h2>
                            <button
                                className="btn btn-secondary btn-icon"
                                onClick={() => setShowChoiceModal(false)}
                            >
                                ✕
                            </button>
                        </div>
                        <div className="modal-body">
                            <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                                {selectedDate && new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleNewWorkout}
                                    style={{ padding: '1rem', fontSize: '1rem' }}
                                >
                                    ➕ New Workout
                                </button>

                                {templates.length > 0 ? (
                                    <>
                                        <div style={{
                                            textAlign: 'center',
                                            color: 'var(--text-muted)',
                                            fontSize: '0.85rem',
                                            margin: '0.5rem 0'
                                        }}>
                                            — or use a template —
                                        </div>
                                        <div style={{
                                            maxHeight: '200px',
                                            overflowY: 'auto',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '0.5rem'
                                        }}>
                                            {templates.map(template => (
                                                <button
                                                    key={template.id}
                                                    className="btn btn-secondary"
                                                    onClick={() => handleFromTemplate(template)}
                                                    style={{
                                                        padding: '0.75rem',
                                                        textAlign: 'left',
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center'
                                                    }}
                                                >
                                                    <span>📋 {template.title}</span>
                                                    <span style={{
                                                        fontSize: '0.75rem',
                                                        color: 'var(--text-muted)'
                                                    }}>
                                                        {template.exercises.length} exercises
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <p style={{
                                        fontSize: '0.85rem',
                                        color: 'var(--text-muted)',
                                        textAlign: 'center'
                                    }}>
                                        No templates yet. <a href="/templates" style={{ color: 'var(--primary)' }}>Create one</a>
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
        </div>
    );
}

export default Calendar;
