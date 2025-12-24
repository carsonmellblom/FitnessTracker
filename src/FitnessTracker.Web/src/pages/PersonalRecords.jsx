import { useState, useEffect } from 'react';
import { personalRecordsApi } from '../services/api';

function PersonalRecords() {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedExercises, setExpandedExercises] = useState(new Set());

    useEffect(() => {
        loadRecords();
    }, []);

    const loadRecords = async () => {
        try {
            setLoading(true);
            const data = await personalRecordsApi.getAll();
            setRecords(data);
            // Expand all exercises by default
            setExpandedExercises(new Set(data.map(e => e.exerciseDefinitionId)));
        } catch (error) {
            console.error('Failed to load personal records:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = (id) => {
        setExpandedExercises(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="page">
                <div className="page-header">
                    <h1>🏆 Personal Records</h1>
                </div>
                <div className="loading">Loading records...</div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="page-header">
                <h1>🏆 Personal Records</h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    Your best lifts for each exercise, organized by rep count
                </p>
            </div>

            {records.length === 0 ? (
                <div className="empty-state">
                    <p>No personal records yet. Start logging workouts to track your PRs!</p>
                </div>
            ) : (
                <div className="pr-list">
                    {records.map(exercise => (
                        <div key={exercise.exerciseDefinitionId} className="card" style={{ marginBottom: '1rem' }}>
                            <div
                                className="card-header"
                                onClick={() => toggleExpand(exercise.exerciseDefinitionId)}
                                style={{
                                    cursor: 'pointer',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '1rem'
                                }}
                            >
                                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    🏋️ {exercise.exerciseName}
                                    <span style={{
                                        fontSize: '0.875rem',
                                        color: 'var(--text-secondary)',
                                        fontWeight: 'normal'
                                    }}>
                                        ({exercise.records.length} PR{exercise.records.length !== 1 ? 's' : ''})
                                    </span>
                                </h3>
                                <span style={{ fontSize: '1.25rem' }}>
                                    {expandedExercises.has(exercise.exerciseDefinitionId) ? '▼' : '▶'}
                                </span>
                            </div>

                            {expandedExercises.has(exercise.exerciseDefinitionId) && (
                                <div style={{ padding: '0 1rem 1rem 1rem' }}>
                                    <table className="data-table" style={{ width: '100%' }}>
                                        <thead>
                                            <tr>
                                                <th style={{ textAlign: 'center', width: '80px' }}>Reps</th>
                                                <th style={{ textAlign: 'center', width: '120px' }}>Weight</th>
                                                <th style={{ textAlign: 'center' }}>Date Achieved</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {exercise.records.map(record => (
                                                <tr key={record.reps}>
                                                    <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                                                        {record.reps}
                                                    </td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        <span style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '0.25rem',
                                                            color: 'var(--accent-primary)',
                                                            fontWeight: 'bold'
                                                        }}>
                                                            🏆 {record.weight} lbs
                                                        </span>
                                                    </td>
                                                    <td style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                                                        {formatDate(record.achievedDate)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default PersonalRecords;
