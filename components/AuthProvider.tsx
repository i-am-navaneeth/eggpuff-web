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
    const init = async () => {
      if (typeof window === 'undefined') return;

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const path = window.location.pathname;

      // 🛑 Ignore during OAuth callback
      if (path.includes('auth/callback')) {
        setLoading(false);
        return;
      }

      const publicRoutes = ['/', '/login', '/what-is-eggpuff'];

      const isPublicRoute =
        publicRoutes.includes(path) ||
        path.startsWith('/what-is-eggpuff');

      // 🔐 Not logged in
      if (!session?.user) {
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