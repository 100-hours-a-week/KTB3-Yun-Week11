import { useState } from "react"
import { SubmitButton } from "./Buttons"
import "../styles/make_post.css"

export default function PostForm({ initialValues, onSubmit, submitLabel = "등록" }) {
  const [title, setTitle] = useState(initialValues.title || "")
  const [content, setContent] = useState(initialValues.content || "")
  const [postImage, setPostImage] = useState(initialValues.postImage || "")

  const isValid = title.trim() && content.trim()
  const helperText = isValid ? "" : "*제목, 내용을 모두 작성해주세요"

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!isValid) return
    onSubmit?.({
      title: title.trim(),
      content: content.trim(),
      postImage: postImage,
    })
  }

  return (
    <form id="make-post-form" onSubmit={handleSubmit} noValidate>
      <div className="form-field">
        <label htmlFor="post-title">제목 *</label>
        <input
          id="post-title"
          name="title"
          maxLength={26}
          placeholder="제목을 입력해주세요 (최대 26글자)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="form-field">
        <label htmlFor="post-content">내용 *</label>
        <textarea
          id="post-content"
          name="content"
          rows={8}
          placeholder="당신의 감상을 자유롭게 적어주세요!"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        <p className="helper-text">{helperText}</p>
      </div>

      <div className="form-field">
        <label htmlFor="post-image">이미지</label>
        <label className="image-upload" htmlFor="post-image">
          <span className="file-name" id="file-name-display">
            {postImage || '파일을 선택해주세요'}
          </span>
          <input
            type="file"
            id="post-image"
            name="image"
            accept="image/*"
            onChange={(e) => setPostImage(e.target.value)}
          />
        </label>
      </div>

      <SubmitButton id="submit-btn" type="submit" disabled={!isValid}>
        {submitLabel}
      </SubmitButton>
      <a className="alt-link" href='/posts'>목록으로 돌아가기</a>
    </form>
  )

}
