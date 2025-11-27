export const SubmitButton = ({children, type='button', disabled, onClick }) => {
    return <button className="submit-btn" type={type} disabled={disabled} onClick={onClick}>{children}</button>
}