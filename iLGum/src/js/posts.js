document.addEventListener('DOMContentLoaded', () => {
    const auth = window.authClient;
    const API_BASE_URL = auth?.API_BASE_URL ?? 'http://127.0.0.1:8080';

    if (!auth) {
        console.error('인증 모듈을 불러올 수 없습니다.');
        location.replace('./login.html');
        return;
    }
    const logoutBtn = document.getElementById('logout-btn');
    const postList = document.getElementById('post-list');
    const postTemplate = document.getElementById('post-card-template');

    function clearListExceptTemplate() {
        if (!postList || !postTemplate) {
            return;
        }
        Array.from(postList.children).forEach((child) => {
            if (child !== postTemplate) {
                child.remove();
            }
        });
    }

    function cloneTemplate() {
        if (!postTemplate) {
            return null;
        }
        const clone = postTemplate.cloneNode(true);
        clone.removeAttribute('id');
        clone.classList.remove('post-card-template');
        clone.removeAttribute('aria-hidden');
        const article = clone.querySelector('.post-card');
        if (article) {
            article.tabIndex = 0;
        }
        return clone;
    }

    function fillPostCard(link, post) {
        if (!link) {
            return;
        }
        link.href = `./post.html?postId=${post.postId}`;
        link.setAttribute('aria-label', `${post.title} 상세 보기`);

        const title = link.querySelector('.post-title');
        if (title) {
            title.textContent = post.title ?? '';
        }

        const likes = link.querySelector('.stat-like');
        if (likes) {
            likes.textContent = `좋아요 ${post.likes ?? 0}`;
        }

        const comments = link.querySelector('.stat-comment');
        if (comments) {
            comments.textContent = `댓글 ${post.comments ?? 0}`;
        }

        const views = link.querySelector('.stat-view');
        if (views) {
            views.textContent = `조회수 ${post.views ?? 0}`;
        }

        const time = link.querySelector('.post-time');
        if (time) {
            time.dateTime = post.createdAt ?? '';
            time.textContent = post.createdAt ?? '';
        }

        const author = link.querySelector('.author-name');
        if (author) {
            author.textContent = post.nickname ?? '';
        }
    }

    function renderPosts(posts) {
        if (!postList) {
            return;
        }
        clearListExceptTemplate();

        if (!posts.length) {
            const empty = document.createElement('p');
            empty.className = 'post-empty';
            empty.textContent = '아직 작성된 게시글이 없습니다.';
            postList.appendChild(empty);
            return;
        }

        const fragment = document.createDocumentFragment();
        posts.forEach((post) => {
            const link = cloneTemplate();
            if (!link) {
                return;
            }
            fillPostCard(link, post);
            fragment.appendChild(link);
        });
        postList.appendChild(fragment);
    }

    async function fetchPosts() {
        if (!auth.getTokens?.()) {
            location.replace('./login.html');
            return;
        }

        try {
            const res = await auth.authorizedFetch(`${API_BASE_URL}/posts`, {
                method: 'GET',
            });

            if (!res.ok) {
                if (res.status === 401) {
                    location.replace('./login.html');
                    return;
                }
                throw new Error('게시글을 불러오지 못했습니다.');
            }

            const body = await res.json();
            const posts = Array.isArray(body)
                ? body
                : Array.isArray(body?.data)
                    ? body.data
                    : [];
            renderPosts(posts);
        } catch (error) {
            clearListExceptTemplate();
            if (postList) {
                const errorMsg = document.createElement('p');
                errorMsg.className = 'post-error';
                errorMsg.textContent = '게시글을 가져오지 못했습니다. 잠시 후 다시 시도해주세요.';
                postList.appendChild(errorMsg);
            }
            console.error(error);
        }
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

    fetchPosts();
});
