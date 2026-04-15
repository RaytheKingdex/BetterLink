// js/api.js — BetterLink shared API + auth utilities
const BASE_URL = 'http://localhost:5000';

// ── Auth storage ───────────────────────────────────────────────────────────────
function getToken() { return localStorage.getItem('bl_token'); }
function getUser()  { return JSON.parse(localStorage.getItem('bl_user') || 'null'); }

function setAuth(token, user) {
    localStorage.setItem('bl_token', token);
    localStorage.setItem('bl_user', JSON.stringify(user));
}

function clearAuth() {
    localStorage.removeItem('bl_token');
    localStorage.removeItem('bl_user');
}

function signOut() {
    clearAuth();
    window.location.replace('Login.html');
}

// ── Route guards ───────────────────────────────────────────────────────────────
function requireAuth() {
    if (!getToken()) { window.location.replace('Login.html'); return false; }
    return true;
}

function requireRole(role) {
    if (!requireAuth()) return false;
    const user = getUser();
    if (user?.role !== role) {
        window.location.replace('Feed.html');
        return false;
    }
    return true;
}

// ── Fetch wrapper ──────────────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
    const token = getToken();
    const isFormData = options.body instanceof FormData;
    const headers = { ...(options.headers || {}) };
    if (!isFormData) headers['Content-Type'] = 'application/json';
    if (token)       headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(BASE_URL + path, { ...options, headers });

    if (res.status === 401) { clearAuth(); window.location.replace('Login.html'); return null; }
    if (res.status === 204) return null;

    if (!res.ok) {
        let msg = `Error ${res.status}`;
        try {
            const err = await res.json();
            if (typeof err === 'string') msg = err;
            else if (err.message) msg = err.message;
            else if (Array.isArray(err) && err[0]?.description) msg = err[0].description;
        } catch {}
        throw new Error(msg);
    }

    return res.json();
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function escHtml(str) {
    return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function fmtDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('en-US', {
        month:'short', day:'numeric', year:'numeric',
        hour:'numeric', minute:'2-digit', hour12:true,
    });
}

function initials(first, last) {
    return ((first?.[0] || '') + (last?.[0] || '')).toUpperCase() || '?';
}

// ── Sidebar nav links by role ──────────────────────────────────────────────────
const STUDENT_LINKS = [
    { href:'Feed.html',        icon:'bi-newspaper',      label:'Feed' },
    { href:'Communities.html', icon:'bi-people-fill',    label:'Communities' },
    { href:'Jobs.html',        icon:'bi-briefcase-fill', label:'Browse Jobs' },
    { href:'Profile.html',     icon:'bi-person-fill',    label:'Profile' },
];

const EMPLOYER_LINKS = [
    { href:'Feed.html',    icon:'bi-newspaper',       label:'Feed' },
    { href:'JobPost.html', icon:'bi-plus-circle-fill', label:'Post a Job' },
    { href:'MyJobs.html',  icon:'bi-briefcase-fill',  label:'My Jobs' },
    { href:'Profile.html', icon:'bi-person-fill',     label:'Profile' },
];

// ── Build sidebar ──────────────────────────────────────────────────────────────
function buildSidebar() {
    const nav = document.getElementById('sidebarNav');
    if (!nav) return;

    const user = getUser();
    const links = user?.role === 'Employer' ? EMPLOYER_LINKS : STUDENT_LINKS;
    const current = window.location.pathname.split('/').pop();

    nav.innerHTML = links.map(l => `
        <li>
            <a href="${l.href}" class="nav-link${current === l.href ? ' active' : ''}">
                <i class="bi ${l.icon}"></i>
                <span class="sidebar-label">${l.label}</span>
            </a>
        </li>`).join('');
}

// ── Update top-nav user chip ───────────────────────────────────────────────────
function updateNavUser() {
    const user = getUser();
    const chip = document.getElementById('navUserChip');
    if (chip && user) {
        chip.textContent = user.firstName ? `${user.firstName} (${user.role})` : user.email;
    }
}

// ── initPage — call at the top of every protected page ─────────────────────────
//   options.roles = ['Student'] | ['Employer'] | undefined (any auth)
function initPage(options = {}) {
    if (!requireAuth()) return false;

    if (options.roles) {
        const user = getUser();
        if (!options.roles.includes(user?.role)) {
            window.location.replace('Feed.html');
            return false;
        }
    }

    buildSidebar();
    updateNavUser();

    // Sidebar collapse toggle
    const toggleBtn = document.getElementById('sidebarToggle');
    const sidebar   = document.getElementById('sidebar');
    const mainArea  = document.getElementById('mainArea');
    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            mainArea?.classList.toggle('collapsed');
        });
    }

    return true;
}
