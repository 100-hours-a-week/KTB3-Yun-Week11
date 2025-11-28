import { CommentItem } from "./CommentItem"

export const CommentsList = ({comments =[], onEdit, onDelete }) => {
    if (!comments.length) {
    return (
      <section className="comment-list">
        <ul id="comment-list">
          <li className="comment-item comment-empty">첫 번째 댓글을 남겨보세요.</li>
        </ul>
      </section>
    )
  }

  return (
    <section className="comment-list">
      <ul id="comment-list">
        {comments.map((c) => (
          <CommentItem
            key={c.commentId}
            commentId={c.commentId}
            nickname={c.nickname}
            avatar={c.avatar}
            createdAt={c.createdAt}
            content={c.content}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </ul>
    </section>
  )
}