import styles from './FormInput.module.css'

export default function FormInput({
  label,
  error,
  hint,
  type = 'text',
  required,
  className = '',
  ...props
}) {
  return (
    <div className={`${styles.group} ${className}`}>
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      {type === 'textarea' ? (
        <textarea className={`${styles.input} ${error ? styles.inputError : ''}`} {...props} rows={props.rows || 3} />
      ) : type === 'select' ? (
        <select className={`${styles.input} ${styles.select} ${error ? styles.inputError : ''}`} {...props}>
          {props.children}
        </select>
      ) : (
        <input
          type={type}
          className={`${styles.input} ${error ? styles.inputError : ''}`}
          {...props}
        />
      )}
      {error && <p className={styles.error}>{error}</p>}
      {hint && !error && <p className={styles.hint}>{hint}</p>}
    </div>
  )
}
