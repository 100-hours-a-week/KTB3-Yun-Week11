document.addEventListener('DOMContentLoaded', () => {
    const auth = window.authClient;
    const API_BASE_URL = auth?.API_BASE_URL ?? 'http://127.0.0.1:8080';
    const params = new URLSearchParams(window.location.search);
    const postId = params.get('postId');

    const postTitle = document.getElementById('post-title');
    const postAuthorName = document.getElementById('post-author-name');
    const postDate = document.getElementById('post-date');
    const postContent = document.getElementById('post-content');
    const postImage = document.getElementById('post-image');
    const postImageWrapper = document.querySelector('.post-image');
    const postLikes = document.getElementById('post-likes');
    const postViews = document.getElementById('post-views');
    const postCommentsCount = document.getElementById('post-comments-count');
    const commentList = document.getElementById('comment-list');
    const commentTemplate = document.getElementById('comment-template');
    const logoutBtn = document.getElementById('logout-btn');
    const deleteBtn = document.getElementById('delete-post-btn');
    const modal = document.getElementById('post-delete-modal');
    const modalConfirmBtn = document.getElementById('post-delete-confirm');
    const modalCancleBtn = document.querySelector('[data-action="post-delete-cancel"]');
    const editLink = document.getElementById('edit-post-link');
    const likeBtn = document.getElementById('post-likes');
    const likeToggle = document.querySelector('.stat-like-toggle');

    if (!auth) {
        console.error('인증 모듈을 불러올 수 없습니다.');
        location.replace('./login.html');
        return;
    }

    if (!postId) {
        alert('게시글 정보를 찾을 수 없습니다.');
        window.location.replace('./posts.html');
        return;
    }

    if (postId && editLink) {
        editLink.href = `./edit_post.html?postId=${postId}`;
    }

    function renderPost(post) {
        if (postTitle) {
            postTitle.textContent = post.title ?? '';
        }
        if (postAuthorName) {
            postAuthorName.textContent = post.nickname ?? '';
        }
        if (postDate) {
            postDate.textContent = post.createdAt ?? '';
        }
        if (postContent) {
            postContent.textContent = post.content ?? '';
        }
        if (postImage) {
            if (post.postImage) {
                postImage.src = post.postImage;
                postImage.removeAttribute('hidden');
                if (postImageWrapper) {
                    postImageWrapper.removeAttribute('hidden');
                }
            } else {
                postImage.setAttribute('hidden', 'true');
                if (postImageWrapper) {
                    postImageWrapper.setAttribute('hidden', 'true');
                }
            }
        }
        if (postLikes) {
            postLikes.textContent = post.likes ?? 0;
        }
        if (postViews) {
            postViews.textContent = post.views ?? 0;
        }
        if (postCommentsCount) {
            postCommentsCount.textContent = post.comments ?? 0;
        }

        renderComments(Array.isArray(post.commentsList) ? post.commentsList : []);
    }

    function clearComments() {
        if (!commentList || !commentTemplate) {
            return;
        }
        Array.from(commentList.children).forEach((child) => {
            if (child !== commentTemplate) {
                child.remove();
            }
        });
    }

    function cloneCommentTemplate() {
        if (!commentTemplate) {
            return null;
        }
        const clone = commentTemplate.cloneNode(true);
        clone.removeAttribute('id');
        clone.classList.remove('comment-template');
        clone.removeAttribute('aria-hidden');
        return clone;
    }

    function fillCommentItem(item, comment) {
        item.dataset.commentId = comment.commentId;
        const author = item.querySelector('.comment-author');
        if (author) {
            author.textContent = comment.nickname ?? '';
        }

        const content = item.querySelector('.comment-content');
        if (content) {
            content.textContent = comment.content ?? '';
        }

        const date = item.querySelector('.comment-date');
        if (date) {
            date.textContent = comment.createdAt ?? '';
        }
    }

    function renderComments(comments) {
        if (!commentList) {
            return;
        }
        clearComments();

        if (!comments.length) {
            const emptyItem = document.createElement('li');
            emptyItem.className = 'comment-item comment-empty';
            emptyItem.textContent = '첫 번째 댓글을 남겨보세요.';
            commentList.appendChild(emptyItem);
            return;
        }

        const fragment = document.createDocumentFragment();
        comments.forEach((comment) => {
            const item = cloneCommentTemplate();
            if (!item) {
                return;
            }
            fillCommentItem(item, comment);
            fragment.appendChild(item);
        });
        commentList.appendChild(fragment);
    }

    async function fetchPostDetail() {
        if (!auth.getTokens?.()) {
            location.replace('./login.html');
            return;
        }
        try {
            const res = await auth.authorizedFetch(`${API_BASE_URL}/posts/${postId}`, {
                method: 'GET',
            });

            if (!res.ok) {
                throw new Error('게시글을 불러오지 못했습니다.');
            }

            const body = await res.json();
            const post = body?.data ?? body;
            renderPost(post);
        } catch (error) {
            alert('게시글을 로드하는 중 오류가 발생했습니다.');
            console.error(error);
        }
    }

    //좋아요 상태 확인
    async function fetchLikeStatus() {
        if (!auth.getTokens?.()) {
            location.replace('./login.html');
            return;
        }
        try {
            const res = await auth.authorizedFetch(`${API_BASE_URL}/posts/${postId}/likes`, {
            method: 'GET',
            });
            if (res.ok) {
                const isLiked = await res.json();
                likeToggle.dataset.liked = isLiked ? 'true' : 'false';
                return;
            }            
        } catch(err) {
            alert('잠시 후 다시 시도해주세요.');
        }
    }

    fetchPostDetail();
    fetchLikeStatus();

    //좋아요, 좋아요 취소
    likeBtn.addEventListener('click', async () => {

        const isLiked = likeToggle.dataset.liked;

        if (isLiked === 'false'){
            try {
                if (!auth.getTokens?.()) {
                    location.replace('./login.html');
                    return;
                }
                const res = await auth.authorizedFetch(`${API_BASE_URL}/posts/${postId}/likes`, {
                    method: 'POST',
                });

                if (res.status === 204) {
                    likeToggle.dataset.liked = 'true';
                    postLikes.textContent = Number(postLikes.textContent) + 1;
                    return;
                }
                
                if (res.status === 401) {
                    alert('로그인이 필요합니다.');
                    location.replace('./login.html');
                    return;
                }
            } catch (err) {
                alert('잠시 후 다시 시도해주세요.');
            }
        } else if (isLiked === 'true') {
            try {
                if (!auth.getTokens?.()) {
                    location.replace('./login.html');
                    return;
                }
                const res = await auth.authorizedFetch(`${API_BASE_URL}/posts/${postId}/likes`, {
                    method: 'DELETE',
                });

                if (res.status === 204) {
                    likeToggle.dataset.liked = 'false';
                    postLikes.textContent = Number(postLikes.textContent) - 1;
                    return;
                }
                
                if (res.status === 401) {
                    alert('로그인이 필요합니다.');
                    location.replace('./login.html');
                    return;
                }
            } catch (err) {
                alert('잠시 후 다시 시도해주세요.');
            }
        }
    });

    //게시글 삭제 모달 띄우기
    deleteBtn.addEventListener('click', (event) => {
        event.preventDefault();
        modal.hidden = false;
        document.body.classList.add('no-scroll');
    });

    modalCancleBtn.addEventListener('click', closeModal);
    modal.querySelector('.modal-overlay').addEventListener('click', (event) => {
        if (event.target === event.currentTarget) closeModal();
    });

    function closeModal(){
        modal.hidden = true;
        document.body.classList.remove('no-scroll');
    }

    modalConfirmBtn.addEventListener('click', async () => {
        if (!auth.getTokens?.()) {
            location.replace('./login.html');
            return;
        }
        try {
            const res = await auth.authorizedFetch(`${API_BASE_URL}/posts/${postId}`, {
                method: 'DELETE',
                headers: {'Content-Type': 'application/json'},
            });

            if (res.status === 204) {
                alert('게시글이 삭제되었습니다.');
                location.replace('./posts.html');
                return;
            }

            if (res.status === 401) {
                alert('로그인이 필요합니다.');
                location.replace('./login.html');
                return;
            }

            if (res.status === 403) {
                alert('작성자만 삭제할 수 있습니다.');
                location.replace('./posts.html');
                return;
            }
        } catch(err) {
            alert('잠시 후 다시 시도해주세요.');
        }
    });

    //로그아웃
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
