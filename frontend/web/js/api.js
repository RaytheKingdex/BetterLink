(function () {
    const fallbackBases = [
        'http://localhost:5000',
        'https://localhost:5001'
    ];

    function normalizeBaseUrl(baseUrl) {
        return (baseUrl || '').trim().replace(/\/+$/, '');
    }

    function getConfiguredBaseUrl() {
        if (window.BetterLinkConfig && window.BetterLinkConfig.apiBaseUrl) {
            return normalizeBaseUrl(window.BetterLinkConfig.apiBaseUrl);
        }

        const stored = localStorage.getItem('betterlinkApiBaseUrl');
        if (stored) {
            return normalizeBaseUrl(stored);
        }

        if (window.location && window.location.protocol !== 'file:') {
            return normalizeBaseUrl(window.location.origin);
        }

        return '';
    }

    function getApiCandidates() {
        const candidates = [];
        const configured = getConfiguredBaseUrl();

        if (configured) {
            candidates.push(configured);
        }

        fallbackBases.forEach(baseUrl => candidates.push(baseUrl));

        return [...new Set(candidates.map(normalizeBaseUrl).filter(Boolean))];
    }

    function getAuthToken() {
        return localStorage.getItem('betterlinkToken') || '';
    }

    function isAuthenticated() {
        return getAuthToken() !== '';
    }

    function getCurrentRole() {
        return localStorage.getItem('betterlinkRole') || '';
    }

    function getCurrentUserEmail() {
        return localStorage.getItem('betterlinkUserEmail') || '';
    }

    function requireAuth(redirectUrl = 'SignUp.html') {
        if (isAuthenticated()) {
            return true;
        }

        window.location.href = redirectUrl;
        return false;
    }

    function requireRole(role, redirectUrl = 'SignUp.html') {
        if (!requireAuth(redirectUrl)) {
            return false;
        }

        return getCurrentRole().toLowerCase() === String(role || '').toLowerCase();
    }

    function setAuthSession(payload) {
        const token = payload.token || payload.Token || '';
        const role = payload.role || payload.Role || '';
        const email = payload.email || payload.Email || '';

        localStorage.setItem('betterlinkToken', token);
        localStorage.setItem('betterlinkRole', role);
        localStorage.setItem('betterlinkUserEmail', email);
    }

    function clearAuthSession() {
        localStorage.removeItem('betterlinkToken');
        localStorage.removeItem('betterlinkRole');
        localStorage.removeItem('betterlinkUserEmail');
    }

    function withLeadingSlash(path) {
        return path.startsWith('/') ? path : `/${path}`;
    }

    async function requestJson(path, options = {}) {
        const endpoint = withLeadingSlash(path);
        const candidates = getApiCandidates();
        let lastError = null;

        for (let index = 0; index < candidates.length; index += 1) {
            const baseUrl = candidates[index];

            try {
                const headers = new Headers(options.headers || {});
                headers.set('Accept', 'application/json');

                if (options.body && !headers.has('Content-Type')) {
                    headers.set('Content-Type', 'application/json');
                }

                const token = getAuthToken();
                if (token && !headers.has('Authorization')) {
                    headers.set('Authorization', `Bearer ${token}`);
                }

                const response = await fetch(`${baseUrl}${endpoint}`, {
                    ...options,
                    headers
                });

                const contentType = response.headers.get('content-type') || '';
                const payload = contentType.includes('application/json')
                    ? await response.json().catch(() => null)
                    : await response.text();

                if (!response.ok) {
                    const message = typeof payload === 'string'
                        ? payload
                        : payload?.message || payload?.title || `Request failed with status ${response.status}`;
                    throw new Error(message);
                }

                return payload;
            } catch (error) {
                lastError = error;
                if (index === candidates.length - 1) {
                    throw lastError;
                }
            }
        }

        throw lastError || new Error('Unable to reach the BetterLink API.');
    }

    window.BetterLinkApi = {
        requestJson,
        getAuthToken,
        isAuthenticated,
        getCurrentRole,
        getCurrentUserEmail,
        requireAuth,
        requireRole,
        setAuthSession,
        clearAuthSession,
        getApiCandidates
    };
})();