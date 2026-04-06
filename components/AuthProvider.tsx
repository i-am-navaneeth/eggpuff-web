'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type Props = {
  children: ReactNode;
  skipRedirect?: boolean; // ✅ NEW (optional)
};

export default function AuthProvider({ children, skipRedirect }: Props) {
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      if (typeof window === 'undefined') return;

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const path = window.location.pathname;

      // 🛑 Ignore during OAuth callback
      if (path.includes('auth/callback')) return;

      // 🔐 Not logged in → go login
      if (!session?.user) {
  const publicRoutes = ['/', '/login', '/what-is-eggpuff']

  const isPublicRoute =
    publicRoutes.includes(path) ||
    path.startsWith('/what-is-eggpuff')

  if (!skipRedirect && !isPublicRoute) {
    router.replace('/login')
  }

  return
}

// ✅ Logged in → allow access everywhere
// Only prevent staying on login page
if (path === '/login') {
  router.replace('/feed')
}
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      // 🛑 Prevent unstable redirects
      if (event === 'INITIAL_SESSION') return;
      if (event === 'SIGNED_OUT') return;

      init();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, skipRedirect]); // ✅ added dependency

  return <>{children}</>;
}