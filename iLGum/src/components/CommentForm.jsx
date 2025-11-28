export const CommentForm = ({ value, onChange, onSubmit, disabled }) => {
  return (
    <section className="comment-card">
      <form onSubmit={onSubmit} noValidate>
        <div className="comment-card__inner">
          <label htmlFor="comment-input" className="visually-hidden">
            댓글 입력
          </label>
          <textarea
            id="comment-input"
            rows={4}
            placeholder="댓글을 남겨주세요!"
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            required
          />
          <div className="comment-card__actions">
            <button
              type="submit"
              id="comment-submit"
              className="comment-submit"
              disabled={disabled}
            >
              댓글 등록
            </button>
          </div>
        </div>
      </form>
    </section>
  );
};
