import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  withCredentials: true,                  // ✅ Send cookies like `csrftoken`
  xsrfCookieName: 'csrftoken',            // ✅ Django's default CSRF cookie name
  xsrfHeaderName: 'X-CSRFToken',          // ✅ Django expects this header
});

export default api;
