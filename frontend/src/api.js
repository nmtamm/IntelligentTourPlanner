import axios from 'axios';

const API_URL = 'http://localhost:8000';

const loginUser = async (credentials) => {
    try {
        const params = new URLSearchParams();
        for (const key in credentials) {
            params.append(key, credentials[key]);
        }

        const response = await axios.post(
            `${API_URL}/auth/token`,
            params,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Login error:", error);
        throw error;
    }
};

const registerUser = async (userData) => {
    try {
        await axios.post(`${API_URL}/auth/register`, userData);
    } catch (error) {
        console.error("Registration error:", error);
        throw error;
    }
};

const fetchUserProfile = async (token) => {
    try {
        const response = await axios.get(`${API_URL}/users/me/`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Fetch user profile error:", error);
        throw error;
    }
};

// Trip API endpoints
const createTrip = async (tripData, token) => {
    try {
        const response = await axios.post(
            `${API_URL}/api/trips/`,
            tripData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error("Create trip error:", error);
        throw error;
    }
};

const getTrips = async (token) => {
    try {
        const response = await axios.get(`${API_URL}/api/trips/`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Get trips error:", error);
        throw error;
    }
};

const getTrip = async (tripId, token) => {
    try {
        const response = await axios.get(`${API_URL}/api/trips/${tripId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Get trip error:", error);
        throw error;
    }
};

const updateTrip = async (tripId, tripData, token) => {
    try {
        const response = await axios.put(
            `${API_URL}/api/trips/${tripId}`,
            tripData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error("Update trip error:", error);
        throw error;
    }
};

const deleteTrip = async (tripId, token) => {
    try {
        await axios.delete(`${API_URL}/api/trips/${tripId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    } catch (error) {
        console.error("Delete trip error:", error);
        throw error;
    }
};

export {
    loginUser,
    registerUser,
    fetchUserProfile,
    createTrip,
    getTrips,
    getTrip,
    updateTrip,
    deleteTrip
};