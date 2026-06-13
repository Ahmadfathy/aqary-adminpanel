import { api } from './api';

const PREFIX = 'v1';

export const AuthAPI = {
  login: (data: any) => api.post(`${PREFIX}/auth/login`, data),
  logout: () => api.post(`${PREFIX}/auth/logout`),
  getMe: () => api.get(`${PREFIX}/auth/me`),
};

export const AdminProfileAPI = {
  getProfile: () => api.get(`${PREFIX}/admin/profile`),
  updateProfile: (data: any) => api.put(`${PREFIX}/admin/profile`, data),
};

export const AdminDashboardAPI = {
  getStats: () => api.get(`${PREFIX}/admin/dashboard/stats`),
  getRecentProperties: (params?: any) => api.get(`${PREFIX}/admin/dashboard/recent-properties`, { params }),
  getRecentUsers: (params?: any) => api.get(`${PREFIX}/admin/dashboard/recent-users`, { params }),
  getRecentAppointments: (params?: any) => api.get(`${PREFIX}/admin/dashboard/recent-appointments`, { params }),
  getRecentDeals: (params?: any) => api.get(`${PREFIX}/admin/dashboard/recent-deals`, { params }),
};

export const AdminUsersAPI = {
  getUsers: (params?: any) => api.get(`${PREFIX}/admin/users`, { params }),
  createUser: (data: any) => api.post(`${PREFIX}/admin/users`, data),
  getUser: (id: string | number) => api.get(`${PREFIX}/admin/users/${id}`),
  updateUser: (id: string | number, data: any) => api.put(`${PREFIX}/admin/users/${id}`, data),
  toggleStatus: (id: string | number) => api.patch(`${PREFIX}/admin/users/${id}/toggle-status`),
  changeType: (id: string | number, data: any) => api.patch(`${PREFIX}/admin/users/${id}/change-type`, data),
  resetPassword: (id: string | number, data: any) => api.patch(`${PREFIX}/admin/users/${id}/reset-password`, data),
  deleteUser: (id: string | number) => api.delete(`${PREFIX}/admin/users/${id}`),
};

export const AdminPropertyTypesAPI = {
  getTypes: () => api.get(`${PREFIX}/admin/property-types`),
  createType: (data: any) => api.post(`${PREFIX}/admin/property-types`, data),
  getType: (id: string | number) => api.get(`${PREFIX}/admin/property-types/${id}`),
  updateType: (id: string | number, data: any) => api.put(`${PREFIX}/admin/property-types/${id}`, data),
  toggleStatus: (id: string | number) => api.patch(`${PREFIX}/admin/property-types/${id}/toggle-status`),
  deleteType: (id: string | number) => api.delete(`${PREFIX}/admin/property-types/${id}`),
};

export const AdminPropertyFeaturesAPI = {
  getFeatures: () => api.get(`${PREFIX}/admin/property-features`),
  createFeature: (data: any) => api.post(`${PREFIX}/admin/property-features`, data),
  getFeature: (id: string | number) => api.get(`${PREFIX}/admin/property-features/${id}`),
  updateFeature: (id: string | number, data: any) => api.put(`${PREFIX}/admin/property-features/${id}`, data),
  toggleStatus: (id: string | number) => api.patch(`${PREFIX}/admin/property-features/${id}/toggle-status`),
  deleteFeature: (id: string | number) => api.delete(`${PREFIX}/admin/property-features/${id}`),
};

export const AdminPropertyCategoriesAPI = {
  getCategories: (params?: any) => api.get(`${PREFIX}/admin/property-categories`, { params }),
};

export const AdminPropertiesAPI = {
  getProperties: (params?: any) => api.get(`${PREFIX}/admin/properties`, { params }),
  getProperty: (id: string | number) => api.get(`${PREFIX}/admin/properties/${id}`),
  approveProperty: (id: string | number) => api.patch(`${PREFIX}/admin/properties/${id}/status`, { status: 'approved' }),
  rejectProperty: (id: string | number, reason?: string) => api.patch(`${PREFIX}/admin/properties/${id}/status`, { status: 'rejected', rejection_reason: reason }),
  deleteProperty: (id: string | number) => api.delete(`${PREFIX}/admin/properties/${id}`),
  getPropertyImages: (id: string | number) => api.get(`${PREFIX}/admin/properties/${id}/images`),
};

export const AdminAppointmentsAPI = {
  getAppointments: (params?: any) => api.get(`${PREFIX}/admin/appointments`, { params }),
  getAppointment: (id: string | number) => api.get(`${PREFIX}/admin/appointments/${id}`),
  updateStatus: (id: string | number, status: string) => api.patch(`${PREFIX}/admin/appointments/${id}/status`, { status }),
};

export const AdminLocationsAPI = {
  getCountries: (params?: any) => api.get(`${PREFIX}/admin/countries`, { params }),
  getGovernorates: (params?: any) => api.get(`${PREFIX}/admin/governorates`, { params }),
  createGovernorate: (data: any) => api.post(`${PREFIX}/admin/governorates`, data),
  getGovernorate: (id: string | number) => api.get(`${PREFIX}/admin/governorates/${id}`),
  updateGovernorate: (id: string | number, data: any) => api.put(`${PREFIX}/admin/governorates/${id}`, data),
  deleteGovernorate: (id: string | number) => api.delete(`${PREFIX}/admin/governorates/${id}`),
  toggleGovernorateStatus: (id: string | number) => api.patch(`${PREFIX}/admin/governorates/${id}/toggle-status`),
  getCities: (params?: any) => api.get(`${PREFIX}/admin/cities`, { params }),
  createCity: (data: any) => api.post(`${PREFIX}/admin/cities`, data),
  getCity: (id: string | number) => api.get(`${PREFIX}/admin/cities/${id}`),
  updateCity: (id: string | number, data: any) => api.put(`${PREFIX}/admin/cities/${id}`, data),
  deleteCity: (id: string | number) => api.delete(`${PREFIX}/admin/cities/${id}`),
  toggleCityStatus: (id: string | number) => api.patch(`${PREFIX}/admin/cities/${id}/toggle-status`),
  getAreas: (params?: any) => api.get(`${PREFIX}/admin/areas`, { params }),
  createArea: (data: any) => api.post(`${PREFIX}/admin/areas`, data),
  getArea: (id: string | number) => api.get(`${PREFIX}/admin/areas/${id}`),
  updateArea: (id: string | number, data: any) => api.put(`${PREFIX}/admin/areas/${id}`, data),
  deleteArea: (id: string | number) => api.delete(`${PREFIX}/admin/areas/${id}`),
  toggleAreaStatus: (id: string | number) => api.patch(`${PREFIX}/admin/areas/${id}/toggle-status`),
};

export const AdminAdvertisementsAPI = {
  getAdvertisements: (params?: any) => api.get(`${PREFIX}/admin/advertisements`, { params }),
  createAdvertisement: (data: FormData) => api.post(`${PREFIX}/admin/advertisements`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getAdvertisement: (id: string | number) => api.get(`${PREFIX}/admin/advertisements/${id}`),
  updateAdvertisement: (id: string | number, data: FormData) => api.post(`${PREFIX}/admin/advertisements/update/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteAdvertisement: (id: string | number) => api.delete(`${PREFIX}/admin/advertisements/delete/${id}`),
  toggleStatus: (id: string | number) => api.post(`${PREFIX}/admin/advertisements/toggle-status/${id}`),
  getHomeSlider: () => api.get(`${PREFIX}/public/advertisements/home-slider`),
};

export const AdminSettingsAPI = {
  getSettings: () => api.get(`${PREFIX}/admin/settings`),
  updateSettings: (data: any) => api.put(`${PREFIX}/admin/settings`, data),
};

export const AdminOfficeSubscriptionPlansAPI = {
  getPlans: (params?: any) => api.get(`${PREFIX}/admin/office-subscription-plans`, { params }),
  updatePlan: (id: string | number, data: any) => api.put(`${PREFIX}/admin/office-subscription-plans/${id}`, data),
};

export const AdminDealsAPI = {
  getDeals: (params?: any) => api.get(`${PREFIX}/admin/deals`, { params }),
  getDeal: (id: string | number) => api.get(`${PREFIX}/admin/deals/${id}`),
  updateStatus: (id: string | number, status: string) => api.patch(`${PREFIX}/admin/deals/${id}/status`, { status }),
};

export const AdminNotificationsAPI = {
  getNotifications: (params?: any) => api.get(`${PREFIX}/admin/notifications`, { params }),
  getNotification: (id: string | number) => api.get(`${PREFIX}/admin/notifications/${id}`),
};
