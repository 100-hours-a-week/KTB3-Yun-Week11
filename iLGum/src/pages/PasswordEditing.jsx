import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch, logoutFetch } from "../api/common";
import { isValidConfirmPassword, isValidPassword } from "../utils/validation";
import { auth } from "../api/auth";
import { BackButton, DropdownMenu } from "../components/Buttons";
import "../styles/edit_password.css";

export default function PasswordEditingPage() {
  const [memberId, setMemberId] = useState(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [passwordHelper, setPasswordHelper] = useState("");
  const [confirmHelper, setConfirmHelper] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadMyInfo = async () => {
      try {
        const res = await apiFetch("/members/me");
        if (res.ok) {
          const data = (await res.json())?.data ?? {};
          setMemberId(data.memberId);
        }
      } catch (err) {
        console.log(err);
        navigate("/");
      }
    };
    loadMyInfo();
  }, [navigate]);

  const isDisabled = Boolean(
    isValidPassword(password, confirm) ||
      isValidConfirmPassword(password, confirm)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const passwordMsg = isValidPassword(password, confirm);
    setPasswordHelper(passwordMsg);
    const confirmMsg = isValidConfirmPassword(password, confirm);
    setConfirmHelper(confirmMsg);

    try {
      const res = await apiFetch(`/members/${memberId}`, {
        method: "PATCH",
        body: JSON.stringify({ password, confirmPassword: confirm }),
      });

      if (res.ok) {
        alert("비밀번호가 변경되었습니다.");
        auth.clearToken();
        navigate("/");
      } else if (res.status === 422) {
        setPasswordHelper("*이미 사용 중인 비밀번호입니다.");
      } else if (res.status === 401) {
        alert("로그인 후 이용해주세요.");
        navigate("/");
      } else if (res.status === 403) {
        alert("본인의 비밀번호만 변경할 수 있습니다.");
        auth.clearToken();
        navigate("/");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await logoutFetch();
      if (res.status === 204) {
        auth.clearToken();
        navigate("/");
        return;
      }

      if (res.status === 403) {
        console.log(res.body);
        navigate("/");
      }
    } catch (err) {
      console.log("요청 실패", err);
    }
  };

  return (
    <>
      <header className="site-header" role="banner">
        <div className="site-header__inner">
          <BackButton ariaLabel="게시글 목록으로 돌아가기" />
          <h1 className="site-title">iLGum</h1>
          <DropdownMenu onClick={handleLogout} />
        </div>
      </header>

      <main className="edit-password-layout">
        <section className="password-card" aria-labelledby="password-heading">
          <div className="password-card__header">
            <h2 id="password-heading">비밀번호 수정</h2>
          </div>

          <form id="password-form" onSubmit={handleSubmit} noValidate>
            <div className="form-field">
              <label htmlFor="password">새 비밀번호</label>
              <input
                type="password"
                id="password"
                placeholder="새 비밀번호를 입력하세요"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordHelper(isValidPassword(e.target.value, confirm));
                  setConfirmHelper(
                    isValidConfirmPassword(e.target.value, confirm)
                  );
                }}
                required
                autoComplete="new-password"
                aria-describedby="password-helper"
              />
              <p id="password-helper" className="helper-text">
                {passwordHelper}
              </p>
            </div>

            <div className="form-field">
              <label htmlFor="password-check">비밀번호 확인</label>
              <input
                type="password"
                id="password-check"
                placeholder="비밀번호를 한번 더 입력하세요"
                value={confirm}
                onChange={(e) => {
                  setConfirm(e.target.value);
                  setPasswordHelper(isValidPassword(password, e.target.value));
                  setConfirmHelper(
                    isValidConfirmPassword(password, e.target.value)
                  );
                }}
                required
                autoComplete="new-password"
                aria-describedby="password-check-helper"
              />
              <p id="password-check-helper" className="helper-text">
                {confirmHelper}
              </p>
            </div>

            <button
              id="password-btn"
              type="submit"
              className="submit-btn"
              disabled={isDisabled}
            >
              수정하기
            </button>
          </form>
        </section>
      </main>
    </>
  );
}
