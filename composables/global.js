export function user() {
  if (process.client) {
    return {
      userId: localStorage.getItem("userId") || undefined,
      username: localStorage.getItem("username") || undefined,
    };
  }
  return {
    userId: undefined,
    username: undefined,
  };
}

export function locale() {
  if (process.client) {
    return localStorage.getItem("locale") || undefined;
  }
  return undefined;
}
