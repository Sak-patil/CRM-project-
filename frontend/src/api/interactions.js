import api from './axiosInstance';

export const getInteractions = async (params) => {
  const response = await api.get('/interactions', { params });
  return response.data;
};

export const getInteraction = async (id) => {
  const response = await api.get(`/interactions/${id}`);
  return response.data;
};

export const createInteraction = async (data) => {
  const response = await api.post('/interactions', data);
  return response.data;
};

export const updateInteraction = async (id, data) => {
  const response = await api.put(`/interactions/${id}`, data);
  return response.data;
};

export const deleteInteraction = async (id) => {
  const response = await api.delete(`/interactions/${id}`);
  return response.data;
};
