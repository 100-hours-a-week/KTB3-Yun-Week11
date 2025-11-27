import { Link } from 'react-router-dom'

export default function PostCard({
    postId,
    title,
    likes=0,
    comments=0,
    views=0,
    createdAt='',
    nickname='',
}) {
    return (
    <Link to={`/post?postId=${postId}`} className="post-link" aria-label={`${title} 상세 보기`}>
      <article className="post-card" tabIndex={-1}>
        <header className="post-head">
          <h3 className="post-title">{title}</h3>
        </header>
        <div className="post-meta">
          <div className="post-stats" aria-label="통계">
            <span className="stat stat-like">좋아요 {likes}</span>
            <span className="stat stat-comment">댓글 {comments}</span>
            <span className="stat stat-view">조회수 {views}</span>
          </div>
          <time className="post-time" dateTime={createdAt}>{createdAt}</time>
        </div>
        <footer className="post-foot">
          <span className="author-avatar" aria-hidden="true"></span>
          <span className="author-name">{nickname}</span>
        </footer>
      </article>
    </Link>
  )
}