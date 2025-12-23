import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { workoutsApi, photosApi } from '../services/api';

function Dashboard() {
    const [stats, setStats] = useState({
        totalWorkouts: 0,
        totalPhotos: 0,
        recentWorkouts: [],
        recentPhotos: [],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [workouts, photos] = await Promise.all([
                workoutsApi.getAll(),
                photosApi.getAll(),
            ]);

            setStats({
                totalWorkouts: workouts.length,
                totalPhotos: photos.length,
                recentWorkouts: workouts.slice(0, 5),
                recentPhotos: photos.slice(0, 4),
            });
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setLoading(false);
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
                <h1 className="page-title">Dashboard</h1>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-value">{stats.totalWorkouts}</div>
                    <div className="stat-label">Total Workouts</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{stats.totalPhotos}</div>
                    <div className="stat-label">Progress Photos</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">
                        {stats.recentWorkouts.reduce((sum, w) => sum + w.durationMinutes, 0)}
                    </div>
                    <div className="stat-label">Minutes This Week</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">
                        {stats.recentWorkouts.reduce(
                            (sum, w) => sum + w.exercises.length,
                            0
                        )}
                    </div>
                    <div className="stat-label">Exercises Completed</div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-2">
                {/* Recent Workouts */}
                <div className="card">
                    <div className="card-header">
                        <div>
                            <h2 className="card-title">Recent Workouts</h2>
                            <p className="card-subtitle">Your latest training sessions</p>
                        </div>
                        <Link to="/workouts" className="btn btn-secondary btn-sm">
                            View All
                        </Link>
                    </div>

                    {stats.recentWorkouts.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">🏋️</div>
                            <p>No workouts yet. Start logging your first workout!</p>
                        </div>
                    ) : (
                        <div className="exercise-list">
                            {stats.recentWorkouts.map((workout) => (
                                <div key={workout.id} className="exercise-item" style={{ gridTemplateColumns: '1fr 100px 100px' }}>
                                    <div>
                                        <strong>{workout.title}</strong>
                                        <div className="card-subtitle">
                                            {new Date(workout.workoutDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="exercise-stat">
                                        <div className="exercise-stat-value">{workout.durationMinutes}</div>
                                        <div className="exercise-stat-label">Minutes</div>
                                    </div>
                                    <div className="exercise-stat">
                                        <div className="exercise-stat-value">{workout.exercises.length}</div>
                                        <div className="exercise-stat-label">Exercises</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Photos */}
                <div className="card">
                    <div className="card-header">
                        <div>
                            <h2 className="card-title">Progress Photos</h2>
                            <p className="card-subtitle">Track your transformation</p>
                        </div>
                        <Link to="/photos" className="btn btn-secondary btn-sm">
                            View All
                        </Link>
                    </div>

                    {stats.recentPhotos.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">📸</div>
                            <p>No photos yet. Upload your first progress photo!</p>
                        </div>
                    ) : (
                        <div className="photo-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                            {stats.recentPhotos.map((photo) => (
                                <div key={photo.id} className="photo-card">
                                    <img
                                        src={`http://localhost:5067${photo.thumbnailUrl || photo.imageUrl}`}
                                        alt={photo.originalFileName}
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/300?text=Image';
                                        }}
                                    />
                                    <div className="photo-overlay">
                                        <span className={`badge badge-${photo.processingStatus.toLowerCase()}`}>
                                            {photo.processingStatus}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
