export default function PrimaryButton( {children, type='button', disabled, onClick }) {
    return <button className="primary-btn" type={type} disabled={disabled} onClick={onClick}>
        {children}
    </button>;
}