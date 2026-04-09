'use client';

import { useEffect, useState } from 'react';

interface User {
  name: string;
  email: string;
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => { if (d.name) setUser(d); })
      .catch(() => {});
  }, []);

  return user;
}
