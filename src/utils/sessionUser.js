// A stable per-browser-tab identity, used only as the `userId` for seat
// locking (no real auth yet — see Login screen, which gates nothing).
// sessionStorage (not localStorage) so two tabs get two different ids —
// that's what makes the "two tabs, same seat" conflict test meaningful.
const KEY = 'cinehouse_session_user_id'

export function getSessionUserId() {
  let id = sessionStorage.getItem(KEY)
  if (!id) {
    id = `guest-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`
    sessionStorage.setItem(KEY, id)
  }
  return id
}
