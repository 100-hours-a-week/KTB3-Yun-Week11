import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api/common";
import {
  isValidEmail,
  isValidPassword,
  isValidConfirmPassword,
  isValidNickname,
} from "../utils/validation";
import PrimaryButton from "../components/PrimaryButton";
import "../styles/signup.css";
import "../styles/buttons.css";

export default function SignupPage() {
  const [profileImage, setProfileImage] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [helper, setHelper] = useState({
    profileImage: "",
    email: "",
    password: "",
    confirmPassword: "",
    nickname: "",
  });

  const isDisabled =
    isValidEmail(email) ||
    isValidPassword(password, confirmPassword) ||
    isValidConfirmPassword(password, confirmPassword) ||
    isValidNickname(nickname);

  const navigate = useNavigate();

  const handleChange = (name) => (e) => {
    const v = e.target.value;
    if (name === "email") setEmail(v);
    if (name === "password") setPassword(v);
    if (name === "confirmPassword") setConfirmPassword(v);
    if (name === "nickname") setNickname(v);

    setHelper((prev) => ({
      ...prev,
      email: name === "email" ? isValidEmail(v) : prev.email,
      password:
        name === "password"
          ? isValidPassword(v, confirmPassword)
          : name === "confirmPassword"
          ? isValidPassword(password, v)
          : prev.password,
      confirmPassword:
        name === "password"
          ? isValidConfirmPassword(v, confirmPassword)
          : name === "confirmPassword"
          ? isValidConfirmPassword(password, v)
          : prev.confirmPassword,
      nickname: name === "nickname" ? isValidNickname(v) : prev.nickname,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailMsg = isValidEmail(email);
    const passwordMsg = isValidPassword(password, confirmPassword);
    const confirmPasswordMsg = isValidConfirmPassword(password, confirmPassword);
    const nicknameMsg = isValidNickname(nickname);

    if (emailMsg || passwordMsg || confirmPasswordMsg || nicknameMsg) {
      setHelper({
        email: emailMsg,
        password: passwordMsg,
        confirmPassword: confirmPasswordMsg,
        nickname: nicknameMsg,
      });
      return;
    }

    try {
      const res = await apiFetch("/members", {
        method: "POST",
        body: JSON.stringify({
          profileImage,
          email,
          password,
          confirmPassword,
          nickname,
        }),
      });

      if (res.status === 201) {
        alert("회원가입 성공");
        navigate("/");
      }
      return;
    } catch (err) {
      console.log("요청 실패", err);
      alert("잠시 후에 다시 시도해주세요.");
    }
  };

  return (
    <>
      <main className="signup-layout">
        <section className="signup-card" aria-labelledby="signup-heading">
          <div className="signup-card__header">
            <h2 id="signup-heading">회원가입</h2>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="profile-field">
              <label htmlFor="profileImage" className="field-label">
                프로필 이미지
              </label>
              <label
                className="avatar-upload"
                htmlFor="profileImage"
                aria-label="프로필 이미지 업로드"
              >
                <span className="avatar-mark">+</span>
                <input
                  id="profileImage"
                  name="profileImage"
                  type="file"
                  accept="image/*"
                  onChange={setProfileImage}
                />
              </label>
              <p className="helper-text">{helper.profileImage}</p>
            </div>

            <div className="form-field">
              <label htmlFor="email">이메일 *</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="example@ilgum.com"
                value={email}
                onChange={handleChange("email")}
              />
              <p className="helper-text">{helper.email}</p>
            </div>

            <div className="form-field">
              <label htmlFor="password">비밀번호 *</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={handleChange("password")}
              />
              <p className="helper-text">{helper.password}</p>
            </div>

            <div className="form-field">
              <label htmlFor="passwordConfirm">비밀번호 확인 *</label>
              <input
                id="passwordConfirm"
                name="passwordConfirm"
                type="password"
                placeholder="비밀번호를 한 번 더 입력하세요"
                value={confirmPassword}
                onChange={handleChange("confirmPassword")}
              />
              <p className="helper-text">{helper.confirmPassword}</p>
            </div>

            <div className="form-field">
              <label htmlFor="nickname">닉네임 *</label>
              <input
                id="nickname"
                name="nickname"
                type="text"
                placeholder="닉네임을 입력하세요"
                value={nickname}
                onChange={handleChange("nickname")}
              />
              <p className="helper-text">{helper.nickname}</p>
            </div>

            <PrimaryButton id="signup-btn" type="submit" disabled={isDisabled}>
              회원가입
            </PrimaryButton>

            <p className="alt-link">
              이미 계정이 있다면?{" "}
              <a id="login-link" href="/">
                로그인
              </a>
            </p>
          </form>
        </section>
      </main>
    </>
  );
}
