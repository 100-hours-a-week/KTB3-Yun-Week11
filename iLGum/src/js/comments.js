document.addEventListener('DOMContentLoaded', () => {
    const auth = window.authClient;
    const API_BASE_URL = auth?.API_BASE_URL ?? 'http://127.0.0.1:8080';

    if (!auth) {
        console.error('인증 모듈을 불러올 수 없습니다.');
        location.replace('./login.html');
        return;
    }

    const form = document.getElementById('comment-form');
    const commentInput = document.getElementById('comment-input');
    const submitBtn = document.getElementById('comment-submit');
    const modal = document.getElementById('comment-delete-modal');
    const modalCancleBtn = document.querySelector('[data-action="comment-delete-cancel"]');
    const modalConfirmBtn = document.querySelector('[data-action="comment-delete-confirm"]');
    const commentList = document.getElementById('comment-list');

    const params = new URLSearchParams(window.location.search);
    const postId = params.get('postId');

    let editingCommentId = null;
    let deleteCommentId = null;

    //수정 모드 전환을 위한 전역 헬퍼
    window.setCommentFormMode = function setCommentFormMode(mode, initialText = ''){
        if (mode === 'edit') {
            submitBtn.textContent = '댓글 수정';
            submitBtn.disabled = false;
            commentInput.value = initialText;
            commentInput.focus();
        } else {
            editingCommentId = null;
            submitBtn.textContent = '댓글 등록';
            commentInput.value = '';
            submitBtn.disabled = true;
        }
    };

    commentInput.addEventListener('input', () => {
        submitBtn.disabled = !commentInput.value.trim();
    })

    form.addEventListener('submit', handleSubmit);

    //댓글 작성 및 수정
    async function handleSubmit(e) {
        e.preventDefault();

        const content = commentInput.value.trim();
        if (!auth.getTokens?.()) {
            location.replace('./login.html');
            return;
        }

        if (!editingCommentId) {
            try { //댓글 작성
                const res = await auth.authorizedFetch(`${API_BASE_URL}/posts/${postId}/comments`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({content}),
                })

                if (res.status === 201) {
                    location.reload();
                    return;
                }

                if (res.status === 401) {
                    alert('로그인 후 이용해주세요.');
                    location.assign('./login.html');
                    return;
                }
            } catch (err) {
                alert('잠시 후에 다시 시도해주세요.');
            }
        } else {
            try { //댓글 수정
                const res = await auth.authorizedFetch(`${API_BASE_URL}/posts/${postId}/comments/${editingCommentId}`, {
                    method: 'PUT',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({content}),
                })

                if (res.ok) {
                    location.reload();
                    return;
                }

                if (res.status === 401) {
                    alert('로그인 후 이용해주세요.');
                    location.assign('./login.html');
                    return;
                }

                if (res.status === 403) {
                    alert('작성자만 수정 가능합니다.');
                    location.reload();
                    return;
                }
            } catch (err) {
                alert('잠시 후에 다시 시도해주세요.');
            }
        }
    }
    
    //댓글 수정 버튼 클릭
    commentList.addEventListener('click', (event) => {
        const editBtn = event.target.closest('.comment-edit');
        if (editBtn) {
            const commentItem = editBtn.closest('.comment-item');
            const id = commentItem?.dataset?.commentId;
            const content = commentItem?.querySelector('.comment-content')?.textContent ?? '';
            if (!id) return;
            editingCommentId = id;
            window.setCommentFormMode('edit', content.trim());
            return;
        }

        const deleteBtn = event.target.closest('.comment-delete');
        if (!deleteBtn) return;

        const commentItem = deleteBtn.closest('.comment-item');
        const id = commentItem?.dataset?.commentId;
        if (!id || !modal) return;

        deleteCommentId = id;
        modal.hidden = false;
        document.body.classList.add('no-scroll');
    })

    modalCancleBtn.addEventListener('click', closeModal);
    modal.querySelector('.modal-overlay').addEventListener('click', (event) => {
        if (event.target === event.currentTarget) closeModal();
    });

    function closeModal() {
        if (!modal) return;
        modal.hidden = true;
        document.body.classList.remove('no-scroll');
        deleteCommentId = null;
    }

    modalConfirmBtn.addEventListener('click', async () => {
        if (!auth.getTokens?.()) {
            location.replace('./login.html');
            return;
        }
        try {
            const res = await auth.authorizedFetch(`${API_BASE_URL}/posts/${postId}/comments/${deleteCommentId}`, {
                method: 'DELETE',
            })

            if (res.status === 204) {
                location.reload();
                return;
            }

            if (res.status === 401) {
                alert('로그인이 필요합니다.');
                location.replace('./login.html');
                return;
            }

            if (res.status === 403) {
                alert('작성자만 삭제할 수 있습니다.');
                location.reload();
                return;
            }
        } catch (err) {
            alert('잠시 후 다시 시도해주세요.');
        }
    })
})
