document.addEventListener('DOMContentLoaded', () => {
    const auth = window.authClient;
    const form = document.querySelector('#edit-profile-form');
    const submitBtn = document.querySelector('#profile-submit');
    const profileImageInput = document.querySelector('#profile-picture-input');
    const emailInput = document.querySelector('#email');
    const nicknameInput = document.querySelector('#nickname');
    const nicknameHelper = document.querySelector('#nickname-error');
    const toast = document.querySelector('#edit-toast');
    const modalConfirmBtn = document.querySelector('.modal-btn.modal-btn--confirm');
    const logoutBtn = document.getElementById('logout-btn');
    const withdrawBtn = document.querySelector('.withdraw-btn');
    const withdrawModal = document.getElementById('withdraw-modal');
    const modalOverlay = withdrawModal?.querySelector('.modal-overlay');
    const modalCancelBtn = withdrawModal?.querySelector('.modal-btn--cancel');
    const fileNameDisplay = document.getElementById('file-name-display');

    const API_BASE_URL = auth?.API_BASE_URL ?? 'http://127.0.0.1:8080';

    if (!auth) {
        console.error('인증 모듈을 불러올 수 없습니다.');
        location.replace('./login.html');
        return;
    }

    let memberId = null;
    let toastTimer = null;
    let initialNickname = '';
    let initialProfileImage = '';

    //로그인 한 사용자 정보 받아오기
    auth.authorizedFetch(`${API_BASE_URL}/members/me`, {
        method: 'GET',
    })
        .then((res) => {
            if (!res.ok) throw new Error('유저 정보를 가져올 수 없습니다.');
            return res.json();
        })
        .then((body) => {
            const data = body?.data ?? body;
            memberId = data.memberId;
            if (emailInput && data.email) {
                emailInput.value = data.email;
            }
            if (nicknameInput && data.nickname) {
                nicknameInput.value = data.nickname;
                initialNickname = data.nickname;
            }
            initialProfileImage = data.profileImage ?? '';
            if (fileNameDisplay) {
                fileNameDisplay.textContent = initialProfileImage || '기존 파일 이름';
            }
            updateSubmitState();
        })
        .catch((err) => {
            alert(err.message || '회원 정보를 불러오지 못했습니다.');
            location.replace('./login.html');
        });


    //
    async function handleSubmit(e) {
        e.preventDefault();

        const nickname = nicknameInput.value.trim();
        const profileImage = profileImageInput.value.trim();
        const nicknameMsg = validateNickname(nickname);
        nicknameHelper.textContent = nicknameMsg;

        try {
            if (!auth.getTokens?.()) {
                location.replace('./login.html');
                return;
            }
            const res = await auth.authorizedFetch(`${API_BASE_URL}/members/${memberId}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({nickname, profileImage}),
            });

            if (res.ok) {
                initialNickname = nickname;
                initialProfileImage = profileImage;
                showToast();
                updateSubmitState();
                return;
            }
            
            if (res.status === 409) {
                nicknameHelper.textContent = '*중복된 닉네임입니다.';
            }
        } catch(err) {
            alert('잠시 후 다시 시도해주세요.');
        }
    }

    async function handleWithdraw(e) {
        e.preventDefault();

        try {
            if (!auth.getTokens?.()) {
                location.replace('./login.html');
                return;
            }
            const res = await auth.authorizedFetch(`${API_BASE_URL}/members/${memberId}`, {
                method: 'DELETE',
                headers: {'Content-Type': 'application/json'},
            });

            if (res.status === 204) {
                alert('탈퇴 성공');
                auth.clearTokens?.();
                location.replace('./login.html');
                return;
            }

            if (res.status === 401) {
                alert('로그인이 필요합니다.');
                auth.clearTokens?.();
                location.replace('./login.html');
            }
        } catch (err) {
            alert('잠시 후 다시 시도해주세요.');
        }
    }

    function validateNickname(nickname) {
        const n = nickname.trim();

        if (!n) {
            return '*닉네임을 입력해주세요.';
        } else if (n.length>10){
            return '*닉네임은 최대 10자까지 작성 가능합니다.';
        }
    }

    function showToast() {
        if (!toast) return;
        toast.hidden = false;
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
            toast.hidden = true;
        }, 2000);
    }

    function updateSubmitState() {
        const nickname = nicknameInput.value.trim();
        const profileImage = profileImageInput.value.trim();
        const nicknameMsg = validateNickname(nickname);
        nicknameHelper.textContent = nicknameMsg ?? '';
        const changed = nickname !== initialNickname || profileImage !== initialProfileImage;
        const isDisabled = Boolean(nicknameMsg) || !changed;
        if (submitBtn) {
            submitBtn.disabled = isDisabled;
        }
    }

    nicknameInput?.addEventListener('input', () => {
        updateSubmitState();
    });
    profileImageInput?.addEventListener('input', () => {
        if (fileNameDisplay) {
            const file = profileImageInput.files?.[0];
            fileNameDisplay.textContent = file?.name || initialProfileImage || '기존 파일 이름';
        }
        updateSubmitState();
    });

    form.addEventListener('submit', handleSubmit);
    modalConfirmBtn.addEventListener('click', handleWithdraw);
    withdrawBtn?.addEventListener('click', () => withdrawModal?.removeAttribute('hidden'));
    modalOverlay?.addEventListener('click', (event) => {
        if (event.target.dataset.action === 'modal-overlay') {
            withdrawModal?.setAttribute('hidden', '');
        }
    });
    modalCancelBtn?.addEventListener('click', () => withdrawModal?.setAttribute('hidden', ''));

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
