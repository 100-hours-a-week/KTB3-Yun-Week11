document.addEventListener('DOMContentLoaded', () => {
    const auth = window.authClient;
    const form = document.getElementById('edit-post-form');
    const titleInput = document.getElementById('post-title');
    const contentInput = document.getElementById('post-content');
    const postImageInput = document.getElementById('post-image');
    const contentHelper = document.querySelector('.helper-text');
    const submitBtn = document.querySelector('.submit-btn');
    const readStartInput = document.getElementById('read-start-date');
    const readEndInput = document.getElementById('read-end-date');
    const currentBookTitle = document.getElementById('current-book-title');
    const currentBookMeta = document.getElementById('current-book-meta');
    const currentBookPeriod = document.getElementById('current-book-period');
    const currentBookCover = document.getElementById('current-book-cover');
    const fileNameDisplay = document.getElementById('file-name-display');
    const logoutBtn = document.getElementById('logout-btn');

    const params = new URLSearchParams(window.location.search);
    const postId = params.get('postId');
    const backLink = document.querySelector('.back-link');
    
    const API_BASE_URL = auth?.API_BASE_URL ?? 'http://127.0.0.1:8080';

    if (!auth) {
        console.error('인증 모듈을 불러올 수 없습니다.');
        location.replace('./login.html');
        return;
    }

    if (postId && backLink) {
        backLink.href = `./post.html?postId=${postId}`;
    }

    auth.authorizedFetch(`${API_BASE_URL}/posts/${postId}`, {
        method: 'GET',
    })
    .then((res) => {
        if (!res.ok) throw new Error('게시글 정보를 불러오지 못했습니다.');
        return res.json();
    })
    .then((body) => {
        const data = body?.data ?? body;
        titleInput.value = data.title;
        contentInput.value = data.content;
        postImageInput.value = '';

        if (fileNameDisplay) {
            fileNameDisplay.textContent = data.postImage ?? '파일을 선택해주세요';
        }

        if (readStartInput) {
            readStartInput.value = data.readStartDate ?? readStartInput.value;
        }
        if (readEndInput) {
            readEndInput.value = data.readEndDate ?? readEndInput.value;
        }

        const hasBook = Boolean(data.bookTitle || data.bookAuthor || data.bookGenre || data.bookImage);

        if (hasBook && currentBookTitle) {
            currentBookTitle.textContent = data.bookTitle ?? currentBookTitle.textContent;
        }
        if (hasBook && currentBookMeta) {
            const meta = [data.bookAuthor, data.bookGenre].filter(Boolean).join(' · ');
            currentBookMeta.textContent = meta || currentBookMeta.textContent;
        }
        if (hasBook && currentBookCover) {
            if (data.bookImage) {
                currentBookCover.src = data.bookImage;
            }
            currentBookCover.hidden = false;
        }
        if (hasBook && currentBookPeriod) {
            if (data.readStartDate || data.readEndDate) {
                currentBookPeriod.textContent = `${data.readStartDate ?? '?'} ~ ${data.readEndDate ?? '?'}`;
            }
        }
    })
    .catch((err) => {
        alert('게시글 정보를 불러오는 중 문제가 발생했습니다.');
        location.replace('./posts.html');
    })

    titleInput.addEventListener('input', handleInput);
    contentInput.addEventListener('input', handleInput);
    form.addEventListener('submit', handleSubmit);

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
            const res = await auth.authorizedFetch(`${API_BASE_URL}/posts/${postId}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({title, content, postImage}),
            });

            if (res.ok) {
                alert('게시글이 수정되었습니다.')
                location.replace(`./post.html?postId=${postId}`);
                return;
            }

            if (res.status === 401) {
                alert('로그인 후 이용해주세요.');
                location.replace('./login.html');
                return;
            }

            if (res.status === 403) {
                alert('작성자만 수정할 수 있습니다.');
                location.replace('./posts.html');
                return;
            }
        } catch (err) {
            alert('잠시 후에 다시 시도해주세요.');
        }

    }

    function isValidPost(title, content){
        const t = title.trim();
        const c = content.trim();

        if (!t || !c){
            return '*제목, 내용을 모두 작성해주세요';
        }
        return '';        
    }    

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
})
