export const CommentItem = ({
  commentId,
  nickname,
  avatar,
  createdAt,
  content,
  onEdit,
  onDelete,
}) => {
  return (
    <li className="comment-item">
      <div className="comment-meta">
        <img
          src={avatar || "https://avatars.githubusercontent.com/u/138593109?v=4"}
          alt="작성자 프로필"
          className="comment-avatar"
        />
        <span className="comment-author">{nickname}</span>
        <time className="comment-date">{createdAt}</time>
      </div>

      <p className="comment-content">{content}</p>

      <div className="comment-buttons">
        <button
          className="comment-edit"
          onClick={() => onEdit?.(commentId, content)}
        >
          수정
        </button>
        <button
          className="comment-delete"
          onClick={() => onDelete?.(commentId)}
        >
          삭제
        </button>
      </div>
    </li>
  );
};
