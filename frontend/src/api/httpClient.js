// One axios instance for the whole app.
// Every error is turned into a simple object: { message, fieldErrors, status }.
import axios from 'axios';

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 10000,
});

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'Something went wrong. Please try again.';
    let fieldErrors = [];

    if (error.response) {
      // Server answered with an error (400, 404, 500...)
      message = error.response.data?.message || message;
      fieldErrors = error.response.data?.errors || [];
    } else if (error.request) {
      // No answer at all: backend is off or network is down
      message = 'Cannot reach the server. Please check that the backend is running.';
    }

    return Promise.reject({ message, fieldErrors, status: error.response?.status });
  }
);

export default httpClient;
