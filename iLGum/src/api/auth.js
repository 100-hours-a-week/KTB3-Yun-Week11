const STORAGE_KEY = 'accessToken'
let authState = null

const load = () => authState ?? (authState = sessionStorage.getItem(STORAGE_KEY))

const setTokens = (payload) => {
    const token = payload?.data?.accessToken ?? payload?.accessToken
    if (!token) return

    authState = token
    sessionStorage.setItem(STORAGE_KEY, token)
}

const clearToken = () => { authState = null; sessionStorage.removeItem(STORAGE_KEY)}

const getToken = () => {
    load()
    return { accessToken: authState }
}

export const auth = {setTokens, clearToken, getToken}