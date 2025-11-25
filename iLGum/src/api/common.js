export const API_BASE = 'http://127.0.0.1:8080'
export const apiFetch = (path, options={}) => 
    fetch(`${API_BASE}${path}`, {
        ...options,
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    })