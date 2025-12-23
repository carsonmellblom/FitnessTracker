import { useState, useEffect } from 'react';
import { workoutsApi } from '../services/api';
import { useNavigate } from 'react-router-dom';

function Calendar() {
    const navigate = useNavigate();
    const [workouts, setWorkouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);

    useEffect(() => {
        loadWorkouts();
    }, []);

    const loadWorkouts = async () => {
        try {
            setLoading(true);
            const data = await workoutsApi.getAll();
            setWorkouts(data);
        } catch (error) {
            console.error('Failed to load workouts:', error);
        } finally {
            setLoading(false);
        }
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
                <button className="btn btn-primary" onClick={() => navigate('/workouts')}>
                    📋 Back to List
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

                        return (
                            <div
                                key={index}
                                className={`calendar-day ${!day ? 'calendar-day-empty' : ''} ${isTodayDate ? 'calendar-day-today' : ''}`}
                            >
                                {day && (
                                    <>
                                        <div className="calendar-day-number">{day}</div>
                                        <div className="calendar-workouts">
                                            {dayWorkouts.map(workout => (
                                                <div key={workout.id} className="calendar-workout-item">
                                                    <div
                                                        className="calendar-workout-title"
                                                        onClick={() => setSelectedDate(selectedDate === workout.id ? null : workout.id)}
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        💪 {workout.title}
                                                    </div>
                                                    {selectedDate === workout.id && (
                                                        <div className="calendar-workout-details">
                                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                                                {workout.exercises.length} exercise{workout.exercises.length !== 1 ? 's' : ''} • {workout.durationMinutes} min
                                                            </div>
                                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                                <button
                                                                    className="btn btn-secondary btn-xs"
                                                                    onClick={() => navigate('/workouts')}
                                                                >
                                                                    View
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
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default Calendar;
