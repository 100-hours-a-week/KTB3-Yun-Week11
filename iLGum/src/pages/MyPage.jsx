import { useEffect, useState } from "react";
import { apiFetch, logoutFetch } from "../api/common";
import { useNavigate } from "react-router-dom";
import { isValidNickname } from "../utils/validation";
import { auth } from "../api/auth";
import { BackButton, DropdownMenu } from "../components/Buttons";
import { ConfirmModal } from "../components/Modal";
import "../styles/edit_profile.css"

export default function MyPage() {
  const [memberId, setMemberId] = useState(null);
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [initialProfileImage, setInitialProfileImage] = useState("");
  const [helper, setHelper] = useState("");
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [toast, setToast] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const loadMyInfo = async () => {
      try {
        const res = await apiFetch("/members/me");
        if (res.ok) {
          const data = (await res.json())?.data ?? {};
          setMemberId(data.memberId);
          setEmail(data.email ?? "");
          setNickname(data.nickname ?? "");
          setProfileImage(data.profileImage ?? "");
          setInitialProfileImage(data.profileImage ?? "");
        }
      } catch (err) {
        console.log(err);
        navigate("/");
      }
    };
    loadMyInfo();
  }, [navigate]);

  const isDisabled = Boolean(isValidNickname(nickname));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const msg = isValidNickname(nickname);
    setHelper(msg);

    try {
      const res = await apiFetch(`/members/${memberId}`, {
        method: "PUT",
        body: JSON.stringify({ nickname, profileImage }),
      });

      if (res.ok) {
        setInitialProfileImage(profileImage);
        setToast(true);
        setTimeout(() => setToast(false), 2000);
      } else if (res.status === 409) {
        setHelper("*중복된 닉네임입니다.");
      } else if (res.status === 401) {
        alert("로그인 후 이용해주세요.");
        navigate("/");
      } else if (res.status === 403) {
        alert("본인의 닉네임만 변경할 수 있습니다.");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleWithdraw = async () => {
    try {
      const res = await apiFetch(`/members/${memberId}`, {
        method: "DELETE",
      });
      if (res.status === 204) {
        auth.clearToken();
        navigate("/");
      } else if (res.status === 401) {
        alert("로그인 후 이용해주세요.");
        navigate("/");
      } else if (res.status === 403) {
        alert("본인의 계정만 탈퇴할 수 있습니다.");
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
  <header className="site-header">
    <div className="site-header__inner">
      <BackButton ariaLabel="게시글 목록으로 돌아가기" />
      <h1 className="site-title">iLGum</h1>
      <DropdownMenu onClick={handleLogout} />
    </div>
  </header>

  <main className="edit-profile-layout">
    <section className="profile-card" aria-labelledby="profile-card-heading">
      <div className="profile-card__header"><h2 id="profile-card-heading">회원정보 수정</h2></div>
      <form id="edit-profile-form" onSubmit={handleSubmit} noValidate>
        <div className="form-field profile-picture-field">
          <label className="profile-picture-label" htmlFor="profile-picture-input">프로필 사진</label>
          <label className="avatar-upload" htmlFor="profile-picture-input">
            <span id="profile-picture-preview" className="avatar-placeholder">+</span>
            <input
              type="file"
              id="profile-picture-input"
              accept="image/*"
              hidden
              onChange={(e) => setProfileImage(e.target.files?.[0]?.name || '')}
            />
          </label>
          <span id="file-name-display" className="file-name">
            {profileImage || initialProfileImage || '기존 파일 이름'}
          </span>
        </div>

        <div className="form-field">
          <label htmlFor="email">이메일</label>
          <input type="email" id="email" value={email} readOnly />
        </div>

        <div className="form-field">
          <label htmlFor="nickname">닉네임</label>
          <input
            type="text"
            id="nickname"
            maxLength={15}
            value={nickname}
            onChange={(e) => { setNickname(e.target.value); setHelper(isValidNickname(e.target.value)) }}
            required
          />
          <p id="nickname-error" className="helper-text">{helper}</p>
        </div>

        <button type="submit" id="profile-submit" className="submit-btn" disabled={isDisabled}>수정하기</button>
        <button type="button" className="withdraw-btn" onClick={() => setShowWithdraw(true)}>회원 탈퇴</button>
      </form>
    </section>

    <section className="my-posts-card" aria-labelledby="my-posts-heading">
      <div className="my-posts-card__header">
        <h2 id="my-posts-heading">내가 쓴 글</h2>
        <label className="my-posts-search">
          <input type="text" placeholder="게시글 검색어를 입력해주세요." aria-label="내가 쓴 글 검색" />
        </label>
      </div>
      <ul className="my-posts-list">
        <li>
          <p className="post-title">당신 옆을 스쳐간 그 소녀의 이름은</p>
          <p className="post-meta">2025.10.18</p>
        </li>
        <li>
          <p className="post-title">모순에 대한 짧은 기록</p>
          <p className="post-meta">2025.11.09</p>
        </li>
        <li>
          <p className="post-title">읽고 싶은 책 모음</p>
          <p className="post-meta">2025.11.12</p>
        </li>
      </ul>
      <button type="button" className="view-posts-btn">+ 더 보기</button>
    </section>
  </main>

  <ConfirmModal
    open={showWithdraw}
    title="탈퇴 하시겠습니까?"
    message="탈퇴한 회원 정보는 복구할 수 없습니다."
    onConfirm={handleWithdraw}
    onCancel={() => setShowWithdraw(false)}
  />
  <div id="edit-toast" className="edit-toast" hidden={!toast}>수정 완료</div>
</>
)
}
