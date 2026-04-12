'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type Props = {
  children: ReactNode;
  skipRedirect?: boolean;
};

export default function AuthProvider({ children, skipRedirect }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(true); // 🔥 NEW

  useEffect(() => {
  const handleSession = async () => {
    await supabase.auth.getUser()
  }

  handleSession()
}, [])

  useEffect(() => {
    const init = async () => {
      if (typeof window === 'undefined') return;

      const {
  data: { user },
} = await supabase.auth.getUser();

      const path = window.location.pathname;

// 🔥 Handle OAuth redirect properly (FINAL FIX)
if (window.location.search.includes('code=')) {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, newSession) => {
    if (event === 'SIGNED_IN' && newSession?.user) {
      window.history.replaceState({}, document.title, '/feed');
      router.replace('/feed');
    }
  });

  setLoading(false);

  return () => {
    subscription.unsubscribe();
  };
}

      const publicRoutes = ['/', '/login', '/what-is-eggpuff'];

      const isPublicRoute =
        publicRoutes.includes(path) ||
        path.startsWith('/what-is-eggpuff');

        // 🔥 ALWAYS redirect if logged in (FINAL FIX)
if (user) {
  if (path !== '/feed') {
    router.replace('/feed')
    return // ❌ DO NOT setLoading(false) here
  }
}
      // 🔐 Not logged in
      if (!user) {
        if (!skipRedirect && !isPublicRoute) {
          router.replace('/login');
        }
        setLoading(false);
        return;
      }

      // ✅ Logged in → prevent staying on login page
      if (path === '/login') {
        router.replace('/feed');
      }

      setLoading(false);
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'INITIAL_SESSION') return;
      if (event === 'SIGNED_OUT') return;

      init();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, skipRedirect]);

  // 🔥 Prevent UI flicker / wrong redirects
  if (loading) return null;

  return <>{children}</>;
}