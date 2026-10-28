// The ONLY file that talks to the backend. Components never call axios directly.
import httpClient from './httpClient';

// Returns { data: [tasks], meta: { total, page, limit, totalPages } }
export async function getTasks(params = {}) {
  const response = await httpClient.get('/tasks', { params });
  return response.data;
}

export async function getTask(id) {
  const response = await httpClient.get(`/tasks/${id}`);
  return response.data.data;
}

export async function createTask(task) {
  const response = await httpClient.post('/tasks', task);
  return response.data.data;
}

export async function updateTask(id, changes) {
  const response = await httpClient.put(`/tasks/${id}`, changes);
  return response.data.data;
}

export async function deleteTask(id) {
  const response = await httpClient.delete(`/tasks/${id}`);
  return response.data;
}
