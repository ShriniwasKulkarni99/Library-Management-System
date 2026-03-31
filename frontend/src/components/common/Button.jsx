import styles from './Button.module.css'

export default function Button({
  children,
  variant = 'primary',   // primary | secondary | danger | ghost
  size = 'md',           // sm | md | lg
  loading = false,
  fullWidth = false,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={loading || props.disabled}
      className={[
        styles.btn,
        styles[variant],
        styles[size],
        fullWidth ? styles.fullWidth : '',
      ].join(' ')}
      {...props}
    >
      {loading ? <span className={styles.spinner} /> : null}
      {children}
    </button>
  )
}
