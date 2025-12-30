import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    CircularProgress,
    Card,
    CardContent
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
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

    const handleAccordionChange = (exerciseId) => (event, isExpanded) => {
        setExpandedExercises(prev => {
            const newSet = new Set(prev);
            if (isExpanded) {
                newSet.add(exerciseId);
            } else {
                newSet.delete(exerciseId);
            }
            return newSet;
        });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <Box>
                <Box sx={{ mb: 4 }}>
                    <Typography
                        variant="h4"
                        component="h1"
                        gutterBottom
                        sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}
                    >
                        <EmojiEventsIcon sx={{ fontSize: 'inherit', color: 'primary.main' }} aria-hidden="true" />
                        Personal Records
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Your best lifts for each exercise, organized by rep count
                    </Typography>
                </Box>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: '20vh'
                    }}
                    role="status"
                    aria-label="Loading personal records"
                >
                    <CircularProgress aria-label="Loading" />
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
            {/* Page Header */}
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <EmojiEventsIcon sx={{ fontSize: 32, color: 'primary.main' }} aria-hidden="true" />
                    <Typography
                        variant="h4"
                        component="h1"
                        sx={{ fontWeight: 'bold' }}
                    >
                        Personal Records
                    </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                    Your best lifts for each exercise, organized by rep count
                </Typography>
            </Box>

            {/* Empty State */}
            {records.length === 0 ? (
                <Card>
                    <CardContent>
                        <Box
                            sx={{
                                textAlign: 'center',
                                py: 6,
                                px: 2,
                            }}
                        >
                            <EmojiEventsIcon
                                sx={{
                                    fontSize: 80,
                                    color: 'text.secondary',
                                    mb: 2
                                }}
                                aria-hidden="true"
                            />
                            <Typography
                                variant="h5"
                                component="h2"
                                gutterBottom
                                sx={{ fontWeight: 'medium' }}
                            >
                                No personal records yet
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Start logging workouts to track your PRs!
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            ) : (
                <Box sx={{ maxWidth: 1200, mx: 'auto' }} component="section" aria-label="Personal records by exercise">
                    {records.map((exercise) => (
                        <Accordion
                            key={exercise.exerciseDefinitionId}
                            expanded={expandedExercises.has(exercise.exerciseDefinitionId)}
                            onChange={handleAccordionChange(exercise.exerciseDefinitionId)}
                            sx={{ mb: 2 }}
                            slotProps={{
                                transition: { unmountOnExit: false }
                            }}
                        >
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls={`exercise-${exercise.exerciseDefinitionId}-content`}
                                id={`exercise-${exercise.exerciseDefinitionId}-header`}
                                sx={{
                                    '&:focus-visible': {
                                        outline: '2px solid',
                                        outlineColor: 'primary.main',
                                        outlineOffset: '-2px'
                                    }
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                                    <FitnessCenterIcon
                                        sx={{ color: 'primary.main' }}
                                        aria-hidden="true"
                                    />
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Typography
                                            variant="h6"
                                            component="h2"
                                            sx={{ fontWeight: 'bold' }}
                                        >
                                            {exercise.exerciseName}
                                        </Typography>
                                    </Box>
                                    <Chip
                                        label={`${exercise.records.length} PR${exercise.records.length === 1 ? '' : 's'}`}
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                        aria-label={`${exercise.records.length} personal record${exercise.records.length === 1 ? '' : 's'}`}
                                    />
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                                <TableContainer>
                                    <Table
                                        aria-label={`Personal records for ${exercise.exerciseName}`}
                                        size="small"
                                    >
                                        <TableHead>
                                            <TableRow>
                                                <TableCell
                                                    align="center"
                                                    sx={{ fontWeight: 'bold' }}
                                                >
                                                    Reps
                                                </TableCell>
                                                <TableCell
                                                    align="center"
                                                    sx={{ fontWeight: 'bold' }}
                                                >
                                                    Weight
                                                </TableCell>
                                                <TableCell
                                                    align="center"
                                                    sx={{ fontWeight: 'bold' }}
                                                >
                                                    Date Achieved
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {exercise.records.map((record) => (
                                                <TableRow
                                                    key={record.reps}
                                                    sx={{
                                                        '&:last-child td, &:last-child th': { border: 0 },
                                                        '&:hover': { backgroundColor: 'action.hover' }
                                                    }}
                                                >
                                                    <TableCell
                                                        align="center"
                                                        sx={{ fontWeight: 'bold' }}
                                                    >
                                                        {record.reps}
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Box
                                                            sx={{
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: 0.5,
                                                                color: 'primary.main',
                                                                fontWeight: 'bold'
                                                            }}
                                                        >
                                                            <EmojiEventsIcon
                                                                fontSize="small"
                                                                aria-hidden="true"
                                                            />
                                                            <span aria-label={`${record.weight} pounds`}>
                                                                {record.weight} lbs
                                                            </span>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell
                                                        align="center"
                                                        sx={{ color: 'text.secondary' }}
                                                    >
                                                        <Box
                                                            component="time"
                                                            dateTime={record.achievedDate}
                                                        >
                                                            {formatDate(record.achievedDate)}
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </Box>
            )}
        </Box>
    );
}

export default PersonalRecords;
