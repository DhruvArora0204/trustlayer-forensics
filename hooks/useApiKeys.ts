import { useState, useCallback, useEffect } from 'react';

const KEYS_STORAGE_KEY = 'trustlayer-api-keys';

export interface ApiKeys {
  serp: string;
  groq: string;
}

export const useApiKeys = () => {
  const [keys, setKeys] = useState<ApiKeys>({ serp: '', groq: '' });

  useEffect(() => {
    try {
      const storedKeys = localStorage.getItem(KEYS_STORAGE_KEY);
      if (storedKeys) {
        const parsedKeys = JSON.parse(storedKeys);
        // Ensure gemini key is not loaded from storage, even if it exists there from a previous version
        const { gemini, ...otherKeys } = parsedKeys;
        setKeys({ serp: '', groq: '', ...otherKeys });
      }
    } catch (error) {
      console.error("Failed to parse keys from localStorage", error);
    }
  }, []);

  const saveKeys = useCallback((newKeys: ApiKeys) => {
    setKeys(newKeys);
    localStorage.setItem(KEYS_STORAGE_KEY, JSON.stringify(newKeys));
  }, []);

  return { keys, saveKeys };
};