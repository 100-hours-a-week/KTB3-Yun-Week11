import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch, logoutFetch } from "../api/common";
import { auth } from "../api/auth";
import PostCard from "../components/PostCard";
import { DropdownMenu } from "../components/Buttons";
import "../styles/posts.css";

export default function PostsListPage() {
  const [posts, setPosts] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const res = await apiFetch("/posts", { method: "GET" });

        if (res.ok) {
          const body = await res.json();
          const list = Array.isArray(body)
            ? body
            : Array.isArray(body?.data)
            ? body.data
            : [];
          setPosts(list);
        }

        if (res.status === 401) {
          navigate("/");
        }
      } catch (err) {
        console.log("요청 실패", err);
      }
    };
    loadPosts();
  }, [navigate]);

  const renderPosts = () => {
    return posts.length ? (
      posts.map((p) => (
        <PostCard
          key={p.postId}
          postId={p.postId}
          title={p.title}
          likes={p.likes}
          comments={p.comments}
          views={p.views}
          createdAt={p.createdAt}
          nickname={p.nickname}
        />
      ))
    ) : (
      <p className="post-empty">아직 작성된 게시글이 없습니다.</p>
    );
  };

  const handleLogout = async () => {
    try {
      const res = await logoutFetch();
      if (res.status === 204) {
        auth.clearToken();
        navigate("/");
        return
      }
    } catch (err) {
      console.log("요청 실패", err);
    }
  };

  return (
    <>
      <header className="site-header" role="banner">
        <div className="site-header__inner">
          <h1 className="site-title">iLGum</h1>
          <div className="site-search">
            <input type="text" placeholder="게시글 검색어를 입력해주세요." aria-label="게시글 검색" />
          </div>
          <DropdownMenu onClick={handleLogout} />
        </div>
      </header>

      <main className="container" role="main">
        <section className="intro">
          <div className="intro-left">
            <p className="greeting">당신이 캐낸 문장을 <strong>iLGum</strong>에 심어 보세요.</p>
            <div className="category-filter" role="group" aria-label="장르 선택">
              <button className="category-btn is-active">전체</button>
              <button className="category-btn">시/소설</button>
              <button className="category-btn">에세이</button>
              <button className="category-btn">자기계발</button>
              <button className="category-btn">기타</button>
            </div>
          </div>
          <a className="compose-btn" href="/newpost" aria-label="새 기록 남기기">+ 새 문장 심기</a>
        </section>

        <section className="post-list" aria-label="게시글 목록">
          {renderPosts()}
        </section>
      </main>
    </>
  );
}
