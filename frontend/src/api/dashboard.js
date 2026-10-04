import axiosInstance from './axiosInstance';

/**
 * Get Sales Executive dashboard metrics.
 * For SEs: returns their own scoped data.
 * For Admins: returns all-system data (but via the se endpoint for SE view).
 */
export const getSeDashboard = (userId = null) => {
  const url = userId ? `/dashboard/se?userId=${userId}` : '/dashboard/se';
  return axiosInstance.get(url);
};

/**
 * Get Admin dashboard metrics (system-wide aggregations).
 * Admin only.
 */
export const getAdminDashboard = () => axiosInstance.get('/dashboard/admin');
