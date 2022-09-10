export const getStorage = (key, isSession) => {
  if (isSession) {
    const value = sessionStorage.getItem(key)
    return value ? JSON.parse(value) : undefined
  } else {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : undefined
  }
}

export const setStorage = (key, value, isSession) => {
  if (isSession) {
    sessionStorage.setItem(key, JSON.stringify(value))
  } else {
    localStorage.setItem(key, JSON.stringify(value))
  }
}
