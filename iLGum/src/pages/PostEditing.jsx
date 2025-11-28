import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiFetch } from "../api/common";
import PostForm from "../components/PostForm";
import "../styles/edit_post.css";

export default function PostEditingPage() {
  const [searchParams] = useSearchParams();
  const [initial, setInitial] = useState({
    title: "",
    content: "",
    postImage: "",
  });
  const postId = searchParams.get("postId");
  const navigate = useNavigate();

  useEffect(() => {
    if (!postId) {
      navigate("/posts");
      return;
    }

    const loadPost = async () => {
      try {
        const res = await apiFetch(`/posts/${postId}`, {
          method: "GET",
        });

        if (res.status === 401) {
          alert("로그인 후 이용해주세요.");
          navigate("/login");
          return;
        }

        if (res.ok) {
          const body = await res.json();
          const data = body?.data ?? body;
          setInitial({
            title: data.title ?? "",
            content: data.content ?? "",
            postImage: data.postImage ?? "",
          });
        }
      } catch (err) {
        alert("잠시 후 다시 시도해주세요.");
        console.log(err);
      }
    };
    loadPost();
  }, [postId, navigate]);

  const handleUpdate = async ({ title, content, postImage }) => {
    try {
      const res = await apiFetch(`/posts/${postId}`, {
        method: "PUT",
        body: JSON.stringify({ title, content, postImage }),
      });

      if (res.ok) {
        navigate(`/post?postId=${postId}`);
      } else if (res.status === 401) {
        alert("로그인 후 이용해주세요.");
        navigate("/login");
      } else if (res.status === 403) {
        alert("작성자만 수정할 수 있습니다.");
        navigate(`/post?postId=${postId}`);
      }
    } catch (err) {
      alert("잠시 후 다시 시도해주세요.");
      console.log(err);
    }
  };

  if (!initial) return <p className="post-empty">불러오는 중...</p>;

  return (
    <main className="make-post-layout">
      <section
        className="book-search-card"
        aria-labelledby="book-search-heading"
      >
        <div className="book-search-card__header">
          <h2 id="book-search-heading">책 정보 수정</h2>
          <p>어떤 책을 읽으셨나요?</p>
        </div>
        <div className="current-book">
    <p className="current-book__label">등록된 책 정보</p>
    <div className="current-book__content">
      <img src={"https://contents.kyobobook.co.kr/sih/fit-in/458x0/pdt/9788998441012.jpg"} alt="책 표지" className="result-cover" id="current-book-cover" />
      <div className="result-body">
        <strong id="current-book-title">모순</strong>
        <span id="current-book-meta">양귀자 · 국내 소설</span>
      </div>
    </div>
  </div>

  <div className="book-search-placeholder">
    <button type="button" className="search-btn">
      + 책 검색하기
    </button>
  </div>

  <div className="read-period">
    <p className="read-period__label">읽은 기간</p>
    <div className="read-period__dates">
      <label>
        시작일
        <input type="date" id="read-start-date" name="readStart" value={'2025.11.04'} />
      </label>
      <label>
        종료일
        <input type="date" id="read-end-date" name="readEnd" value={'2025.11.12'} />
      </label>
    </div>
  </div>
      </section>
      <section className="make-post-card">
        <div className="make-post-card__header">
          <h2 id="make-post-heading">게시글 수정</h2>
        </div>
        <PostForm
          key={`${postId}-${initial.title}-${initial.content}-${initial.postImage}`}
          initialValues={initial}
          submitLabel="수정"
          onSubmit={handleUpdate}
        />
      </section>
    </main>
  );
}
