import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api/common";
import { isValidEmail, isEmptyPassword } from "../utils/validation";
import {auth} from '../api/auth'
import "../styles/login.css";
import "../styles/buttons.css";
import PrimaryButton from "../components/PrimaryButton";

export default function LoginPage() {  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [helper, setHelper] = useState({ email: "", password: "" });

  const isDisabled = isValidEmail(email) || isEmptyPassword(password);

  const navigate = useNavigate()

  const handleChange = (setter, key) => (e) => {
    const v = e.target.value;
    setter(v);
    setHelper((prev) => ({
      ...prev,
      [key]: key === "email" ? isValidEmail(v) : isEmptyPassword(v),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailMsg = isValidEmail(email);
    const passwordMsg = isEmptyPassword(password);
    if (emailMsg || passwordMsg) {
      setHelper({ email: emailMsg, password: passwordMsg });
      return;
    }

    try {
      const res = await apiFetch("/members/session", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const payload = await res.json();
        auth.setTokens(payload);
        alert("로그인 성공");
        navigate('/posts');
      } else if (res.status === 404 || res.status === 401) {
        setHelper((p) => ({
          ...p,
          password: "*아이디 또는 비밀번호를 확인해주세요",
        }));
      }
    } catch (err) {
      console.log("요청 실패", err);
      alert("잠시 후 다시 시도해주세요.");
    }
  };

  return (
    <>
      <main className="login-layout">
        <section className="brand-panel">
          <h1>
            당신의 <span>읽음</span>이<br /> 당신의 세상을<span> iLGum</span>
          </h1>
        </section>
        <section className="login-card">
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-field">
              <label htmlFor="email">이메일</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={handleChange(setEmail, "email")}
              />
              <p className="helper-text">{helper.email}</p>
            </div>
            <div className="form-field">
              <label htmlFor="password">비밀번호</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={handleChange(setPassword, "password")}
              />
              <p className="helper-text">{helper.password}</p>
            </div>
            <PrimaryButton type="submit" disabled={isDisabled}>
              로그인
            </PrimaryButton>
            <p>
              <a id="signup-link" href="/signup">
                회원가입
              </a>
            </p>
          </form>
        </section>
      </main>
      <footer className="site-footer">
        <p className="quote-text">Reading is the seed of knowledge.</p>
        <p className="quote-author">(Melvil Dewey, 1851-1931)</p>
      </footer>
    </>
  );
}
