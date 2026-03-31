export const resolveProfileImageUrl = (value) => {
  if (!value) return null
  if (/^https?:\/\//i.test(value)) return value
  return `/uploads/${value}`
}
