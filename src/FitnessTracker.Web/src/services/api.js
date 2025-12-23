const API_BASE_URL = 'http://localhost:5067/api';

// Workout API
export const workoutsApi = {
    getAll: async () => {
        const response = await fetch(`${API_BASE_URL}/workouts`);
        if (!response.ok) throw new Error('Failed to fetch workouts');
        return response.json();
    },

    getById: async (id) => {
        const response = await fetch(`${API_BASE_URL}/workouts/${id}`);
        if (!response.ok) throw new Error('Failed to fetch workout');
        return response.json();
    },

    create: async (workout) => {
        const response = await fetch(`${API_BASE_URL}/workouts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(workout),
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Failed to create workout');
        }
        return response.json();
    },

    update: async (id, workout) => {
        const response = await fetch(`${API_BASE_URL}/workouts/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(workout),
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Failed to update workout');
        }
        return response.json();
    },

    delete: async (id) => {
        const response = await fetch(`${API_BASE_URL}/workouts/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete workout');
    },
    logFromTemplate: async (templateId) => {
        const response = await fetch(`${API_BASE_URL}/workouts/from-template/${templateId}`, {
            method: 'POST',
        });
        if (!response.ok) throw new Error('Failed to log workout from template');
        return response.json();
    },
};

// Photos API
export const photosApi = {
    getAll: async () => {
        const response = await fetch(`${API_BASE_URL}/photos`);
        if (!response.ok) throw new Error('Failed to fetch photos');
        return response.json();
    },

    getById: async (id) => {
        const response = await fetch(`${API_BASE_URL}/photos/${id}`);
        if (!response.ok) throw new Error('Failed to fetch photo');
        return response.json();
    },

    upload: async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_BASE_URL}/photos`, {
            method: 'POST',
            body: formData,
        });
        if (!response.ok) throw new Error('Failed to upload photo');
        return response.json();
    },

    delete: async (id) => {
        const response = await fetch(`${API_BASE_URL}/photos/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete photo');
    },
};

// Exercise Definitions API
export const exerciseDefinitionsApi = {
    getAll: async () => {
        const response = await fetch(`${API_BASE_URL}/exercisedefinitions`);
        if (!response.ok) throw new Error('Failed to fetch exercise definitions');
        return response.json();
    },
    getById: async (id) => {
        const response = await fetch(`${API_BASE_URL}/exercisedefinitions/${id}`);
        if (!response.ok) throw new Error('Failed to fetch exercise definition');
        return response.json();
    },
    create: async (data) => {
        const response = await fetch(`${API_BASE_URL}/exercisedefinitions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create exercise definition');
        return response.json();
    },
    update: async (id, data) => {
        const response = await fetch(`${API_BASE_URL}/exercisedefinitions/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update exercise definition');
        return response.json();
    },
    delete: async (id) => {
        const response = await fetch(`${API_BASE_URL}/exercisedefinitions/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete exercise definition');
    },
};

// Exercise Definition Categories API
export const categoriesApi = {
    getAll: async () => {
        const response = await fetch(`${API_BASE_URL}/exercisedefinitioncategories`);
        if (!response.ok) throw new Error('Failed to fetch categories');
        return response.json();
    },
    getById: async (id) => {
        const response = await fetch(`${API_BASE_URL}/exercisedefinitioncategories/${id}`);
        if (!response.ok) throw new Error('Failed to fetch category');
        return response.json();
    },
    create: async (data) => {
        const response = await fetch(`${API_BASE_URL}/exercisedefinitioncategories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create category');
        return response.json();
    },
    update: async (id, data) => {
        const response = await fetch(`${API_BASE_URL}/exercisedefinitioncategories/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update category');
        return response.json();
    },
    delete: async (id) => {
        const response = await fetch(`${API_BASE_URL}/exercisedefinitioncategories/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete category');
    },
};

// Workout Templates API
export const templatesApi = {
    getAll: async () => {
        const response = await fetch(`${API_BASE_URL}/workouttemplates`);
        if (!response.ok) throw new Error('Failed to fetch templates');
        return response.json();
    },
    getById: async (id) => {
        const response = await fetch(`${API_BASE_URL}/workouttemplates/${id}`);
        if (!response.ok) throw new Error('Failed to fetch template');
        return response.json();
    },
    create: async (data) => {
        const response = await fetch(`${API_BASE_URL}/workouttemplates`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create template');
        return response.json();
    },
    update: async (id, data) => {
        const response = await fetch(`${API_BASE_URL}/workouttemplates/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update template');
        return response.json();
    },
    delete: async (id) => {
        const response = await fetch(`${API_BASE_URL}/workouttemplates/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete template');
    },
};

// Helper to get full image URL
export const getImageUrl = (path) => {
    if (!path) return null;
    return `http://localhost:5067${path}`;
};
