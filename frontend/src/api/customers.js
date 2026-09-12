import axiosInstance from './axiosInstance';

export const getCustomers = async () => {
  const response = await axiosInstance.get('/customers');
  return response.data;
};
