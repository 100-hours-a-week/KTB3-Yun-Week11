import { useState } from "react";
import { apiFetch } from "../api/common";
import { useNavigate } from "react-router-dom";
import PostForm from "../components/PostForm";

const initial = {
  title: "",
  content: "",
  genre: "",
  bookTitle: "",
  bookAuthor: "",
  bookPeriod: "",
  image: "",
};

export default function PostingPage() {
  const [readStart, setReadStart] = useState("");
  const [readEnd, setReadEnd] = useState("");
  const navigate = useNavigate();

  const handleCreate = async ({title, content, postImage}) => {
    try {
      const res = await apiFetch('/posts', {
        method: "POST",
        body: JSON.stringify({ title, content, postImage }),
      });

      if (res.status === 201) {
        const locationHeader = res.headers.get("Location");
        if (locationHeader) {
          const [, postId] = locationHeader.split("/posts/");
          navigate(`/post?postId=${postId}`);
          return;
        }
      } else if (res.status === 401) {
        alert("로그인 후 이용해주세요.");
        navigate("/");
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <main className="make-post-layout">
      <section
        className="book-search-card"
        aria-labelledby="book-search-heading"
      >
        <div className="book-search-card__header">
          <h2 id="book-search-heading">책 검색</h2>
          <p>어떤 책을 읽으셨나요?</p>
        </div>
        <div className="book-search-placeholder">
          <button
            type="button"
            className="search-btn"
          >
            + 책 검색하기
          </button>
        </div>
        <div className="read-period">
          <p className="read-period__label">독서 기간</p>
          <div className="read-period__dates">
            <label>
              시작일
              <input
                type="date"
                name="readStart"
                value={readStart}
                onChange={(e) => setReadStart(e.target.value)}
              />
            </label>
            <label>
              종료일
              <input
                type="date"
                name="readEnd"
                value={readEnd}
                onChange={(e) => setReadEnd(e.target.value)}
              />
            </label>
          </div>
        </div>
      </section>
      <section className="make-post-card">
        <div className="make-post-card__header">
          <h2 id="make-post-heading">새 문장 남기기</h2>
        </div>
        <PostForm
          initialValues={initial}
          submitLabel="완료"
          onSubmit={handleCreate}
        />
      </section>
    </main>
  );
}
