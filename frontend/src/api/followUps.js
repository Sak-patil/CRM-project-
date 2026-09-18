import api from './axiosInstance';

export const getFollowUps = async (params) => {
  const response = await api.get('/follow-ups', { params });
  return response.data;
};

export const getFollowUp = async (id) => {
  const response = await api.get(`/follow-ups/${id}`);
  return response.data;
};

export const createFollowUp = async (data) => {
  const response = await api.post('/follow-ups', data);
  return response.data;
};

export const updateFollowUp = async (id, data) => {
  const response = await api.put(`/follow-ups/${id}`, data);
  return response.data;
};

export const updateFollowUpStatus = async (id, status) => {
  const response = await api.patch(`/follow-ups/${id}/status`, { status });
  return response.data;
};

export const deleteFollowUp = async (id) => {
  const response = await api.delete(`/follow-ups/${id}`);
  return response.data;
};
