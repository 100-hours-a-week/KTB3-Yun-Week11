(() => {
    const API_BASE_URL = 'http://127.0.0.1:8080';
    const STORAGE_KEY = 'ilgum.accessToken';
    let authState = loadAccessToken();

    function loadAccessToken() {
        try {
            return sessionStorage.getItem(STORAGE_KEY);
        } catch {
            return null;
        }
    }

    function extractTokenPayload(payload) {
        if (!payload) return null;
        const data = payload.data ?? payload;
        if (!data?.accessToken) return null;
        return {
            accessToken: data.accessToken,
        };
    }

    async function refreshTokens() {
        const opts = {
            method: 'POST',
            credentials: 'include',
        };
        if (authState?.refreshToken) {
            opts.headers = {'Content-Type': 'application/json'};
            opts.body = JSON.stringify({refreshToken: authState.refreshToken});
        }

        let res;
        try {
            res = await fetch(`${API_BASE_URL}/token`, opts);
        } catch (err) {
            console.error('[auth] refreshTokens network error', err);
            authState = null;
            return null;
        }

        if (!res.ok) {
            const msg = await res.text().catch(() => '');
            console.warn('[auth] refreshTokens failed', res.status, msg);
            authState = null;
            sessionStorage.removeItem(STORAGE_KEY);
            return null;
        }

        const payload = await res.json().catch((err) => {
            console.error('[auth] refreshTokens parse error', err);
            return null;
        });
        if (!payload) {
            authState = null;
            sessionStorage.removeItem(STORAGE_KEY);
            return null;
        }
        const tokens = extractTokenPayload(payload);
        if (!tokens) {
            authState = null;
            sessionStorage.removeItem(STORAGE_KEY);
            return null;
        }
        authState = tokens.accessToken;
        sessionStorage.setItem(STORAGE_KEY, tokens.accessToken);
        return tokens.accessToken;
    }

    function setTokens(payload) {
        const tokens = extractTokenPayload(payload);
        if (!tokens) {
            authState = null;
            sessionStorage.removeItem(STORAGE_KEY);
            return;
        }
        authState = tokens.accessToken;
        sessionStorage.setItem(STORAGE_KEY, tokens.accessToken);
    }

    function clearTokens() {
        authState = null;
        sessionStorage.removeItem(STORAGE_KEY);
    }

    async function authorizedFetch(url, options = {}, allowRetry = true) {
        const opts = {...options};
        if (!opts.credentials) {
            opts.credentials = 'include';
        }
        const headers = {...(options.headers || {})};
        // 최신 accessToken을 보장하기 위해 세션 스토리지에서도 한 번 더 읽어온다.
        if (!authState) {
            authState = loadAccessToken();
        }
        if (authState) {
            headers.Authorization = `Bearer ${authState}`;
        }
        opts.headers = headers;

        const res = await fetch(url, opts);
        if (res.status === 401 && allowRetry) {
            const refreshed = await refreshTokens();
            if (refreshed) {
                return authorizedFetch(url, options, false);
            }
        }
        return res;
    }

    window.authClient = {
        API_BASE_URL,
        authorizedFetch,
        setTokens,
        clearTokens,
        refreshTokens,
        getTokens: () => authState,
    };
})();
