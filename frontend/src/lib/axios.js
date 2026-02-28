import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    if (error.response?.status === 403) {
      const { code, message, resource, limit, current, feature, requiredPlan } =
        error.response.data ?? {};

      if (code === 'PLAN_LIMIT_REACHED') {
        // Attach a friendly human message callers can read from err.planLimitMessage
        error.planLimitMessage =
          message ?? `You've reached the ${resource} limit (${current}/${limit}). Upgrade your plan.`;
        error.isPlanLimit      = true;
        error.limitResource    = resource;
        error.limitCurrent     = current;
        error.limitMax         = limit;
      }

      if (code === 'FEATURE_NOT_ALLOWED') {
        error.featureBlockedMessage =
          message ?? `This feature requires the ${requiredPlan} plan.`;
        error.isFeatureBlocked = true;
        error.blockedFeature   = feature;
        error.requiredPlan     = requiredPlan;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
