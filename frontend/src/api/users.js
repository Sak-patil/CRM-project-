import axiosInstance from './axiosInstance';

/**
 * Get all users (Admin only)
 */
export const getUsers = async () => {
  const response = await axiosInstance.get('/users');
  return response.data;
};

/**
 * Get a specific user by ID (Admin only)
 */
export const getUser = async (id) => {
  const response = await axiosInstance.get(`/users/${id}`);
  return response.data;
};

/**
 * Create a new user (Admin only)
 */
export const createUser = async (userData) => {
  const response = await axiosInstance.post('/users', userData);
  return response.data;
};

/**
 * Update a user (Admin only)
 */
export const updateUser = async (id, userData) => {
  const response = await axiosInstance.put(`/users/${id}`, userData);
  return response.data;
};

/**
 * Delete a user (Admin only)
 */
export const deleteUser = async (id) => {
  const response = await axiosInstance.delete(`/users/${id}`);
  return response.data;
};

/**
 * Update the current authenticated user's profile
 */
export const updateProfile = async (profileData) => {
  const response = await axiosInstance.put('/auth/me', profileData);
  return response.data;
};
