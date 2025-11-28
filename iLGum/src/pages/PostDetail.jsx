import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { apiFetch, logoutFetch } from "../api/common";
import { auth } from "../api/auth";
import Comments from "../components/Comments";
import { ConfirmModal } from "../components/Modal";
import { BackButton, DropdownMenu, EditButton } from "../components/Buttons";
import "../styles/post.css";

export default function PostDetailPage() {
  const [searchParams] = useSearchParams();
  const postId = searchParams.get("postId");
  const [post, setPost] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post?.likes ?? 0);
  const [showPostModal, setShowPostModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!postId) {
      navigate("/posts");
      return;
    }

    const loadPost = async () => {
      try {
        const res = await apiFetch(`/posts/${postId}`, { method: "GET" });
        if (res.ok) {
          const body = await res.json();
          setPost(body?.data ?? body);
          setLikeCount(body?.data.likes ?? 0);
        } else if (res.status === 403) {
          console.log(res.body);
          navigate("/");
        }
      } catch (err) {
        console.log("요청 실패", err);
      }
    };

    const loadIsLiked = async () => {
      const res = await apiFetch(`/posts/${postId}/likes`, { method: "GET" });
      if (res.ok) {
        const body = await res.json();
        setLiked(Boolean(body));
      }
    };
    loadPost();
    loadIsLiked();
  }, [postId, navigate]);

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

  const handleDelete = async () => {
    try {
      const res = await apiFetch(`/posts/${postId}`, { method: "DELETE" });
      if (res.status === 204) {
        alert("게시글이 삭제되었습니다.");
        navigate("/posts");
      }

      if (res.status === 403) {
        alert("작성자만 삭제할 수 있습니다.");
        setShowPostModal(false);
        return;
      }
    } catch (err) {
      console.log("요청 실패", err);
      return;
    }
  };

  const toggleLike = async () => {
    const next = !liked;
    setLiked(next);
    setLikeCount((prev) => prev + (next ? 1 : -1));
    try {
      const res = await apiFetch(`/posts/${postId}/likes`, {
        method: next ? "POST" : "DELETE",
      });
      if (!res.ok) throw new Error();
    } catch {
      setLiked(!next);
      setLikeCount((prev) => prev + (next ? -1 : 1));
    }
  };

  if (!post) return <p className="post-empty">불러오는 중...</p>;

  return (
    <>
      <header className="site-header" role="banner">
        <div className="site-header__inner">
          <BackButton ariaLabel="피드로 돌아가기" />
          <h1 className="site-title">iLGum</h1>
          <DropdownMenu onClick={handleLogout} />
        </div>
      </header>

      <main className="post-layout">
        <article className="post-card">
          <header className="post-header">
            <h2 className="post-title">{post.title}</h2>
            <div className="post-meta">
              <div className="post-author">
                <img
                  src={
                    post.authorAvatar ||
                    "https://avatars.githubusercontent.com/u/138593109?v=4"
                  }
                  alt="작성자 프로필"
                  className="author-avatar"
                />
                <span className="author-name">{post.nickname}</span>
                <time className="post-date">{post.createdAt}</time>
              </div>
              <div className="post-buttons">
                <EditButton as="link" to={`/editpost?postId=${postId}`}>
                  수정
                </EditButton>
                <button
                  className="delete-btn"
                  onClick={() => setShowPostModal(true)}
                >
                  삭제
                </button>
              </div>
            </div>
          </header>

          <figure className="post-image" hidden={!post.postImage}>
            {post.postImage && <img src={post.postImage} alt="게시글 이미지" />}
          </figure>

          <section className="book-info">
            <img
              className="book-cover"
              src={
                post.bookCover ||
                "https://contents.kyobobook.co.kr/sih/fit-in/458x0/pdt/9788998441012.jpg"
              }
              alt="책 표지"
            />
            <div className="book-meta">
              <p className="book-title">{post.bookTitle || "모순"}</p>
              <p className="book-author">
                {post.bookAuthor || "양귀자 · 국내 소설"}
              </p>
              <p className="book-period">
                독서 기간: {post.bookPeriod || "2025.11.04 - 2025.11.12"}
              </p>
            </div>
          </section>

          <section className="post-content">
            <p>{post.content}</p>
          </section>

          <section className="post-stats">
            <div
              className="stat-item stat-like-toggle"
              data-liked={liked? 'true' : 'false'}
              onClick={toggleLike}
            >
              <div className="stat-value">{likeCount}</div>
              <div className="stat-label">좋아요수</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{post.views ?? 0}</div>
              <div className="stat-label">조회수</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{post.comments ?? 0}</div>
              <div className="stat-label">댓글</div>
            </div>
          </section>
          <Comments postId={postId} initialComments={post.commentsList || []} />
        </article>
      </main>
      <ConfirmModal
        open={showPostModal}
        title="게시글을 삭제하시겠습니까?"
        message="삭제한 내용은 복구할 수 없습니다."
        onConfirm={handleDelete}
        onCancel={() => setShowPostModal(false)}
      />
    </>
  );
}
