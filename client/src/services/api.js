import { supabase } from './supabaseClient';

// This is the base URL of your backend server
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
/**
 * A helper function to get the user's auth token.
 * This is how your server knows who you are.
 */
const getAuthHeaders = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('User is not logged in.');
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`
  };
};

/**
 * Fetches all tasks from the backend
 */
export const getTasks = async () => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/tasks`, {
    method: 'GET',
    headers: headers,
  });
  if (!response.ok) {
    throw new Error('Failed to fetch tasks.');
  }
  return response.json();
};

/**
 * Creates a new task
 * @param {object} taskData - { title, start, end, priority }
 */
export const createTask = async (taskData) => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/tasks`, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(taskData),
  });
  if (!response.ok) {
    throw new Error('Failed to create task.');
  }
  return response.json();
};

/**
 * Updates an existing task
 * @param {string} id - The ID of the task to update
 * @param {object} updateData - { title, start, end, priority }
 */
export const updateTask = async (id, updateData) => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: headers,
    body: JSON.stringify(updateData),
  });
  if (!response.ok) {
    throw new Error('Failed to update task.');
  }
  return response.json();
};

/**
 * Deletes a task
 * @param {string} id - The ID of the task to delete
 */
export const deleteTask = async (id) => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/tasks/${id}`, {
    method: 'DELETE',
    headers: headers,
  });
  if (!response.ok) {
    throw new Error('Failed to delete task.');
  }
  return response.json();
};