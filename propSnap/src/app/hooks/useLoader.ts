import { useState } from 'react';

export function useLoader(initialState: boolean = false) {
  const [loading, setLoading] = useState<boolean>(initialState);

  return {
    loading,
    setLoading
  };
}