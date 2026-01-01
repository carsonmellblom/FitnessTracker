const API_BASE_URL = import.meta.env.VITE_API_URL;
if (!API_BASE_URL) {
    console.error('VITE_API_URL is missing!');
}

// Helper to include credentials (cookies) in all requests
const fetchWithAuth = (url, options = {}) => {
    return fetch(url, {
        ...options,
        credentials: 'include', // Always include cookies for auth
        headers: {
            ...options.headers,
        },
    });
};

// Helper to construct secure photo URLs (proxied through API with auth check)
export const getPhotoUrl = (photoId, type = 'original') => {
    if (!photoId) return null;
    const typeParam = type !== 'original' ? `?type=${type}` : '';
    return `${API_BASE_URL}/photos/${photoId}/image${typeParam}`;
};

// Workout API
export const workoutsApi = {
    getAll: async () => {
        const response = await fetchWithAuth(`${API_BASE_URL}/workouts`);
        if (!response.ok) throw new Error('Failed to fetch workouts');
        return response.json();
    },

    getById: async (id) => {
        const response = await fetchWithAuth(`${API_BASE_URL}/workouts/${id}`);
        if (!response.ok) throw new Error('Failed to fetch workout');
        return response.json();
    },

    create: async (workout) => {
        const response = await fetchWithAuth(`${API_BASE_URL}/workouts`, {
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
        const response = await fetchWithAuth(`${API_BASE_URL}/workouts/${id}`, {
            method: 'PATCH',
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
        const response = await fetchWithAuth(`${API_BASE_URL}/workouts/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete workout');
    },
    logFromTemplate: async (templateId) => {
        const response = await fetchWithAuth(`${API_BASE_URL}/workouts/from-template/${templateId}`, {
            method: 'POST',
        });
        if (!response.ok) throw new Error('Failed to log workout from template');
        return response.json();
    },

    // Individual set operations
    addSet: async (workoutId, exerciseId, setData) => {
        const response = await fetchWithAuth(`${API_BASE_URL}/workouts/${workoutId}/exercises/${exerciseId}/sets`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(setData),
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Failed to add set');
        }
        return response.json();
    },

    updateSet: async (workoutId, exerciseId, setId, setData) => {
        const response = await fetchWithAuth(`${API_BASE_URL}/workouts/${workoutId}/exercises/${exerciseId}/sets/${setId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(setData),
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Failed to update set');
        }
        return response.json();
    },

    deleteSet: async (workoutId, exerciseId, setId) => {
        const response = await fetchWithAuth(`${API_BASE_URL}/workouts/${workoutId}/exercises/${exerciseId}/sets/${setId}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete set');
    },
};

// Photos API
export const photosApi = {
    getAll: async () => {
        const response = await fetchWithAuth(`${API_BASE_URL}/photos`);
        if (!response.ok) throw new Error('Failed to fetch photos');
        return response.json();
    },

    getById: async (id) => {
        const response = await fetchWithAuth(`${API_BASE_URL}/photos/${id}`);
        if (!response.ok) throw new Error('Failed to fetch photo');
        return response.json();
    },

    upload: async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetchWithAuth(`${API_BASE_URL}/photos`, {
            method: 'POST',
            body: formData,
        });
        if (!response.ok) throw new Error('Failed to upload photo');
        return response.json();
    },

    delete: async (id) => {
        const response = await fetchWithAuth(`${API_BASE_URL}/photos/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete photo');
    },

    updateDate: async (id, photoTakenAt) => {
        const response = await fetchWithAuth(`${API_BASE_URL}/photos/${id}/date`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ photoTakenAt }),
        });
        if (!response.ok) throw new Error('Failed to update photo date');
        return response.json();
    },
};

// Exercise Definitions API
export const exerciseDefinitionsApi = {
    getAll: async () => {
        const response = await fetchWithAuth(`${API_BASE_URL}/exercisedefinitions`);
        if (!response.ok) throw new Error('Failed to fetch exercise definitions');
        return response.json();
    },
    getById: async (id) => {
        const response = await fetchWithAuth(`${API_BASE_URL}/exercisedefinitions/${id}`);
        if (!response.ok) throw new Error('Failed to fetch exercise definition');
        return response.json();
    },
    create: async (data) => {
        const response = await fetchWithAuth(`${API_BASE_URL}/exercisedefinitions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create exercise definition');
        return response.json();
    },
    update: async (id, data) => {
        const response = await fetchWithAuth(`${API_BASE_URL}/exercisedefinitions/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update exercise definition');
        return response.json();
    },
    delete: async (id) => {
        const response = await fetchWithAuth(`${API_BASE_URL}/exercisedefinitions/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete exercise definition');
    },
};

// Exercise Definition Categories API
export const categoriesApi = {
    getAll: async () => {
        const response = await fetchWithAuth(`${API_BASE_URL}/exercisedefinitioncategories`);
        if (!response.ok) throw new Error('Failed to fetch categories');
        return response.json();
    },
    getById: async (id) => {
        const response = await fetchWithAuth(`${API_BASE_URL}/exercisedefinitioncategories/${id}`);
        if (!response.ok) throw new Error('Failed to fetch category');
        return response.json();
    },
    create: async (data) => {
        const response = await fetchWithAuth(`${API_BASE_URL}/exercisedefinitioncategories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create category');
        return response.json();
    },
    update: async (id, data) => {
        const response = await fetchWithAuth(`${API_BASE_URL}/exercisedefinitioncategories/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update category');
        return response.json();
    },
    delete: async (id) => {
        const response = await fetchWithAuth(`${API_BASE_URL}/exercisedefinitioncategories/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete category');
    },
};

// Workout Templates API
export const templatesApi = {
    getAll: async () => {
        const response = await fetchWithAuth(`${API_BASE_URL}/workouttemplates`);
        if (!response.ok) throw new Error('Failed to fetch templates');
        return response.json();
    },
    getById: async (id) => {
        const response = await fetchWithAuth(`${API_BASE_URL}/workouttemplates/${id}`);
        if (!response.ok) throw new Error('Failed to fetch template');
        return response.json();
    },
    create: async (data) => {
        const response = await fetchWithAuth(`${API_BASE_URL}/workouttemplates`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create template');
        return response.json();
    },
    update: async (id, data) => {
        const response = await fetchWithAuth(`${API_BASE_URL}/workouttemplates/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update template');
        return response.json();
    },
    delete: async (id) => {
        const response = await fetchWithAuth(`${API_BASE_URL}/workouttemplates/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete template');
    },
};

// Personal Records API
export const personalRecordsApi = {
    getAll: async () => {
        const response = await fetchWithAuth(`${API_BASE_URL}/personalrecords`);
        if (!response.ok) throw new Error('Failed to fetch personal records');
        return response.json();
    },
};

// Helper to get full image URL
export const getImageUrl = (path) => {
    if (!path) return null;
    // Derive the base URL from the API base URL (remove '/api/v1' or '/api' suffix)
    const baseUrl = API_BASE_URL.replace(/\/api\/v\d+$/, '').replace(/\/api$/, '');
    return `${baseUrl}${path}`;
};
