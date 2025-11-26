export function isValidEmail(email) {
    return /^[a-z]{4,20}@[a-z]+(\.[a-z]+)*(\.[a-z]{2,})$/.test(email.trim()) ? '' : '*올바른 이메일 주소 형식을 입력해주세요. (예: example@example.com)'
}

export function isEmptyPassword(password) {
    return password.trim() ? '' : '*비밀번호를 입력해주세요'
}

export function isValidPassword(password, confirm) {
    const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-={}:;<>?,.]).{8,20}$/
    const p = password.trim()
    const c = confirm.trim()

    if (!p) {
        return '*비밀번호를 입력해주세요'
    } else if (!pattern.test(p)) {
        return '*비밀번호는 8자 이상 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.'
    } else if (p !== c) {
        return '*비밀번호가 다릅니다.'
    }
    return ''
}

export function isValidConfirmPassword(password, confirm) {
    const p = password.trim()
    const c = confirm.trim()

    if (!c) {
        return '*비밀번호를 한번더 입력해주세요'
    } else if (p !== c){
        return '*비밀번호가 다릅니다.'
    }
    return ''
}

export function isValidNickname(nickname) {
    const pattern = /^[^\s]+$/
    const n = nickname.trim()

    if (!n){
        return '*닉네임을 입력해주세요.'
    } else if (!pattern.test(n)) {
        return '*띄어쓰기를 없애주세요.'
    } else if (n.length > 10) {
        return '*닉네임은 최대 10자까지 작성 가능합니다.'
    }
    
    return ''
}