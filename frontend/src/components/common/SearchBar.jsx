import styles from './SearchBar.module.css'

export default function SearchBar({ value, onChange, placeholder = 'Search…', onClear }) {
  return (
    <div className={styles.wrapper}>
      <span className={styles.icon}>🔍</span>
      <input
        type="text"
        className={styles.input}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {value && (
        <button className={styles.clear} onClick={() => { onChange(''); onClear?.() }}>✕</button>
      )}
    </div>
  )
}
