import axiosInstance from './axiosInstance';

export const getCustomers = async (params = {}) => {
  const response = await axiosInstance.get('/customers', { params });
  return response.data;
};

export const getCustomer = async (id) => {
  const response = await axiosInstance.get(`/customers/${id}`);
  return response.data;
};

export const createCustomer = async (customerData) => {
  const response = await axiosInstance.post('/customers', customerData);
  return response.data;
};

export const updateCustomer = async (id, customerData) => {
  const response = await axiosInstance.put(`/customers/${id}`, customerData);
  return response.data;
};

export const deleteCustomer = async (id) => {
  const response = await axiosInstance.delete(`/customers/${id}`);
  return response.data;
};
