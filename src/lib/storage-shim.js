// The atlases were originally written for Claude.ai's window.storage API.
// Here we shim it onto localStorage so progress, completed chapters, quiz
// answers, and stack-profile choices persist across reloads.
//
// API surface used by the atlases:
//   await window.storage.get(key)          -> {key, value, shared} | null
//   await window.storage.set(key, value)   -> {key, value, shared} | null
//   await window.storage.delete(key)       -> {key, deleted, shared} | null
//   await window.storage.list(prefix)      -> {keys, prefix} | null

if (typeof window !== 'undefined' && !window.storage) {
  window.storage = {
    async get(key) {
      try {
        const value = localStorage.getItem(key);
        if (value === null) return null;
        return { key, value, shared: false };
      } catch (e) {
        return null;
      }
    },

    async set(key, value, shared = false) {
      try {
        localStorage.setItem(key, value);
        return { key, value, shared };
      } catch (e) {
        return null;
      }
    },

    async delete(key) {
      try {
        localStorage.removeItem(key);
        return { key, deleted: true, shared: false };
      } catch (e) {
        return null;
      }
    },

    async list(prefix = '', shared = false) {
      try {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && (!prefix || k.startsWith(prefix))) keys.push(k);
        }
        return { keys, prefix, shared };
      } catch (e) {
        return null;
      }
    },
  };
}

export {};
