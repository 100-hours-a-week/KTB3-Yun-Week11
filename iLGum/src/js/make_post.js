document.addEventListener('DOMContentLoaded', () => {
    const auth = window.authClient;
    const form = document.querySelector('#make-post-form');
    const titleInput = document.querySelector('#post-title');
    const contentInput = document.querySelector('#post-content');
    const postImageInput = document.querySelector('#post-image');
    const contentHelper = document.querySelector('.helper-text');
    const submitBtn = document.querySelector('.submit-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const searchModal = document.getElementById('book-search-modal');
    const searchBtn = document.querySelector('[data-open="#book-search-modal"]');
    const modalOverlay = searchModal?.querySelector('.modal-overlay');
    const modalCloseBtn = searchModal?.querySelector('.modal-btn--cancel');

    const API_BASE_URL = auth?.API_BASE_URL ?? 'http://127.0.0.1:8080';

    if (!auth) {
        console.error('인증 모듈을 불러올 수 없습니다.');
        location.replace('./login.html');
        return;
    }

    titleInput.addEventListener('input', handleInput);
    contentInput.addEventListener('input', handleInput);
    postImageInput.addEventListener('input', handleInput);

    function handleInput() {
        const contentMsg = isValidPost(titleInput.value, contentInput.value);

        contentHelper.textContent = contentMsg;

        const isValid = !contentMsg;
        submitBtn.disabled = !isValid;
    }

    async function handleSubmit(e) {
        e.preventDefault();

        const title = titleInput.value.trim();
        const content = contentInput.value.trim();
        const postImage = postImageInput.value.trim();
        if (!auth.getTokens?.()) {
            location.replace('./login.html');
            return;
        }

        try {
            const res = await auth.authorizedFetch(`${API_BASE_URL}/posts`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({title, content, postImage}),
            });

            if (res.status === 201) {
                const locationHeader = res.headers.get('Location');
                if (locationHeader){
                    const [, postId] = locationHeader.split('/posts/');
                    location.assign(`./post.html?postId=${postId}`);
                }
                return;
            }
            if (res.status === 401) {
                alert('로그인 후 이용해주세요.');
                location.assign('./login.html');
            }
            return;
        } catch (err) {
            alert('잠시 후에 다시 시도해주세요.');
        }
    }

    form.addEventListener('submit', handleSubmit);
    searchBtn?.addEventListener('click', () => searchModal?.removeAttribute('hidden'));
    modalOverlay?.addEventListener('click', (event) => {
        if (event.target.dataset.action === 'modal-overlay') {
            searchModal?.setAttribute('hidden', '');
        }
    });
    modalCloseBtn?.addEventListener('click', () => searchModal?.setAttribute('hidden', ''));

    function isValidPost(title, content){
        const t = title.trim();
        const c = content.trim();

        if (!t || !c){
            return '*제목, 내용을 모두 작성해주세요';
        }
        return '';
    }

    handleInput();

    async function handleLogout() {
        try {
            const res = await auth.authorizedFetch(`${API_BASE_URL}/members/logout`, {
                method: 'POST',
            });

            if (res.status === 204) {
                auth.clearTokens?.();
                location.assign('./login.html');
                return;
            }

            alert('로그아웃에 실패했습니다. 잠시 후 다시 시도해주세요.');
        } catch (error) {
            alert('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
        }
    }

    logoutBtn.addEventListener('click', handleLogout);
});
