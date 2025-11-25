document.addEventListener('DOMContentLoaded', () => {
    const profileImageInput = document.querySelector('#profileImage');
    const form = document.querySelector('#signupForm');
    const emailInput = document.querySelector('#email');
    const passwordInput = document.querySelector('#password');
    const passwordConfirmInput = document.querySelector('#passwordConfirm');
    const nicknameInput = document.querySelector('#nickname');
    const profileImageHelper = document.querySelector('#profileImageHelp');
    const emailHelper = document.querySelector('#emailHelp');
    const passwordHelper = document.querySelector('#passwordHelp');
    const passwordConfirmHelper = document.querySelector('#passwordConfirmHelp');
    const nicknameHelper = document.querySelector('#nicknameHelp');
    const submitBtn = document.querySelector('#signup-btn');

    const API_BASE_URL = 'http://127.0.0.1:8080';

    //입력 이벤트 등록
    profileImageInput.addEventListener('input', handleInput);
    emailInput.addEventListener('input', handleInput);
    passwordInput.addEventListener('input', handleInput);
    passwordConfirmInput.addEventListener('input', handleInput);
    nicknameInput.addEventListener('input', handleInput);

    function handleInput() {
        const profileImageMsg = profileImageInput.value ? '' : '*프로필 사진을 추가해주세요.';
        const emailMsg = validateEmail(emailInput.value);
        const passwordMsg = validatePassword(passwordInput.value, passwordConfirmInput.value);
        const passwordConfirmMsg = validatePasswordConfirm(passwordInput.value, passwordConfirmInput.value);
        const nicknameMsg = validateNickname(nicknameInput.value);

        profileImageHelper.textContent = profileImageMsg;
        emailHelper.textContent = emailMsg;
        passwordHelper.textContent = passwordMsg;
        passwordConfirmHelper.textContent = passwordConfirmMsg;
        nicknameHelper.textContent = nicknameMsg;

        const isValid = !emailMsg && !passwordMsg && !passwordConfirmMsg && !nicknameMsg;
        submitBtn.disabled = !isValid;
    }

    //제출 이벤트

    async function handleSubmit(e) {
        e.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const confirmPassword = passwordConfirmInput.value.trim();
        const nickname = nicknameInput.value.trim();
        const profileImage = profileImageInput.value.trim();

        try {
            const res = await fetch(`${API_BASE_URL}/members`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({email, password, confirmPassword, nickname, profileImage}),
            });

            //signup을 body text와 비교하는 로직이 굳이 필요할까 싶음
            if (res.status === 201) {
                const signup = (await res.text()).trim();
                if (signup === 'register_success') {
                    alert('회원가입 성공')
                    location.assign('./login.html');
                    return;
                }
                return;
            }
        } catch (err) {
            alert('잠시 후에 다시 시도해주세요.');
        }

    }

    form.addEventListener('submit', handleSubmit);
    


    //입력값 검증
    function validateEmail(value) {
        const pattern = /^[a-z]{4,20}@[a-z]+(\.[a-z]+)*(\.[a-z]{2,})$/;
        const v = value.trim();
        if (!v){
            return '*이메일을 입력해주세요.';
        } else if (!pattern.test(v)) {
            return '*올바른 이메일 주소 형식을 입력해주세요. (예: example@example.com)';
        }
        return '';
    }

    function validatePassword(value, confirm) {
        const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-={}:;<>?,.]).{8,20}$/;
        const v = value.trim();
        const c = confirm.trim();

        if (!v) {
            return '*비밀번호를 입력해주세요';
        } else if (!pattern.test(v)) {
            return '*비밀번호는 8자 이상 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.';
        } else if (v !== c) {
            return '*비밀번호가 다릅니다.';
        }
        return '';
    }

    function validatePasswordConfirm(value, confirm) {
        const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-={}:;<>?,.]).{8,20}$/;
        const v = value.trim();
        const c = confirm.trim();

        if (!c) {
            return '*비밀번호를 한번더 입력해주세요';
        } else if( v !== c) {
            return '*비밀번호가 다릅니다.';
        }

    }

    function validateNickname(value) {
        const pattern = /^[^\s]+$/;
        const v = value.trim();

        if(!v){
            return '*닉네임을 입력해주세요.';
        } else if (!pattern.test(v)) {
            return '*띄어쓰기를 없애주세요.';
        } else if (v.length > 10) {
            return '*닉네임은 최대 10자까지 작성 가능합니다.';
        }
        return '';
    }

});