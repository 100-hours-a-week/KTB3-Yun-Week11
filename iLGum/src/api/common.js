import {auth} from './auth'

export const API_BASE = 'http://127.0.0.1:8080'
export const apiFetch = async (path, options={}) => {
    const {accessToken} = auth.getToken()
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}`} : {}),
    }

    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        credentials: options.credentials ?? 'include',
        headers,
    })

    if (res.status === 401) {
        const res = await apiFetch('/token', {
            method: 'POST',
            credentials: 'include',
        })

        if (res.ok) {
            const payload = await res.json()
            auth.setTokens(payload)
            return apiFetch(path, options)
        }
        auth.clearToken()
        return res
    }
    return res
}
    