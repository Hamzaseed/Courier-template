export const localApi = {
  get<T>(key: string): T | null {
    if (typeof window === "undefined") return null;
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  },
  post<T>(key: string, value: T) {
    localStorage.setItem(key, JSON.stringify(value));
    return value;
  },
  patch<T extends object>(key: string, value: Partial<T>) {
    const current = localApi.get<T>(key) || ({} as T);
    const next = { ...current, ...value };
    localStorage.setItem(key, JSON.stringify(next));
    return next;
  },
  delete(key: string) {
    localStorage.removeItem(key);
  },
};
