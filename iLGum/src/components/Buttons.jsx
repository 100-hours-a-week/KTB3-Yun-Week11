import { Link } from "react-router-dom"

export const SubmitButton = ({children, type='button', disabled, onClick }) => {
    return <button className="submit-btn" type={type} disabled={disabled} onClick={onClick}>{children}</button>
}

export const EditButton = ({ as = 'button', to, onClick, children, ...props }) => {
  if (as === 'link') return <Link className="edit-btn" to={to} {...props}>{children}</Link>
  return <button type="button" className="edit-btn" onClick={onClick} {...props}>{children}</button>
}

export const DeleteButton = ({children, ...props}) => {
    return <button className="delete-btn" {...props}>{children}</button>
}

export const ConfirmButton = ({ children = '확인', ...props }) => (
  <button type="button" className="confirm-btn" {...props}>{children}</button>
)

export const CancelButton = ({ children = '취소', ...props }) => (
  <button type="button" className="cancel-btn" {...props}>{children}</button>
)

export const ProfileButton = ({ children, avatar = 'https://avatars.githubusercontent.com/u/138593109?v=4' }) => {
  return (
    <summary className="profile-button" aria-label="내 프로필">
      <img src={avatar} alt="프로필" className="profile-avatar" />
      {children}
    </summary>
  )
}

export const BackButton = () => {
    return (
        <Link className="back-link" to='/posts'>‹</Link>
  )
}

export const DropdownMenu = ({onClick}) => {
    return (
    <details className="profile-dropdown">
      <ProfileButton />
      <ul className="profile-dropdown-menu">
        <li><Link to="/mypage">마이페이지</Link></li>
        <li><Link to="/newpassword">비밀번호변경</Link></li>
        <li><button type="button" className="logout-link" onClick={onClick}>로그아웃</button></li>
      </ul>
    </details>
  )
}
