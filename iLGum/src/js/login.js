document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#login-form');
    const emailInput = document.querySelector('#email');
    const passwordInput = document.querySelector('#password');
    const submitBtn = document.querySelector('#login-btn');
    const emailHelper = document.querySelector('#email-helper');
    const passwordHelper = document.querySelector('#password-helper');

    const API_BASE_URL = 'http://127.0.0.1:8080';

//입력 이벤트 등록
    emailInput.addEventListener('input', handleInput);
    passwordInput.addEventListener('input', handleInput);

//제출 이벤트 등록
    function handleInput() {
        const emailMsg = validateEmail(emailInput.value);
        const passwordMsg = validatePassword(passwordInput.value);

        emailHelper.textContent = emailMsg;
        passwordHelper.textContent = passwordMsg;

        //두 필드가 모두 채워졌는지 확인
        const isValid = !emailMsg && !passwordMsg;
        submitBtn.disabled = !isValid;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const email = emailInput.value.trim();
        const password = passwordInput.value;

        try {
            const res = await fetch(`${API_BASE_URL}/members/session`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                credentials: 'include',
                body: JSON.stringify({email, password}),
            });

            if (res.ok) {
                const payload = await res.json();
                window.authClient?.setTokens(payload);
                alert("로그인 성공")
                location.assign('./posts.html');
                return;
            }
            
            if (res.status === 404 || res.status === 401) {
                passwordHelper.textContent = '*아이디 또는 비밀번호를 확인해주세요';
            }

        } catch (err) {
            alert('잠시 후 다시 시도해주세요.');
        }
    }
    form.addEventListener('submit', handleSubmit);

    function validateEmail(email) {
        const pattern = /^[a-z]{4,20}@[a-z]+(\.[a-z]+)*(\.[a-z]{2,})$/;
        const v = email.trim();
        if (!v || !pattern.test(v)) {
            return '*올바른 이메일 주소 형식을 입력해주세요. (예: example@example.com)';
        }
        return '';
    }

    function validatePassword(password) {
        const v = password.trim();
        if (!v) {
            return '*비밀번호를 입력해주세요';
        }
        return '';
    }
});
