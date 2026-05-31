'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { usePathname } from 'next/navigation';

type Props = {
  children: ReactNode;
  skipRedirect?: boolean;
};

export default function AuthProvider({ children, skipRedirect }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {

    let mounted = true;

    const init = async () => {
      if (typeof window === 'undefined') return;

      const {
  data: { session },
} = await supabase.auth.getSession();

const user = session?.user ?? null;

      const path = pathname;

      // 🔥 Handle OAuth redirect properly
if (
  typeof window !== 'undefined' &&
  window.location.search.includes('code=')
) {

  if (path !== '/feed') {

    const {
      data: { subscription: oauthSubscription },
    } = supabase.auth.onAuthStateChange(
      (event, newSession) => {

        if (
          event === 'SIGNED_IN' &&
          newSession?.user
        ) {

          window.history.replaceState(
            {},
            document.title,
            '/feed'
          )

          router.replace('/feed')
        }
      }
    )

    if (!mounted) {
      oauthSubscription.unsubscribe()
      return
    }

    setLoading(false)

    return
  }
}

      const publicRoutes = ['/', '/login', '/what-is-eggpuff'];

      const isPublicRoute =
        publicRoutes.includes(path) ||
        path.startsWith('/what-is-eggpuff');

      const isAdminRoute = path.startsWith('/admin$$$db');

      // 🔐 fetch admin status
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('user_id', user?.id)
        .maybeSingle();

      const isAdmin = profile?.is_admin === true;

      // 🔥 Admin protection (KEEP)
      if (isAdminRoute && !isAdmin) {
        router.replace('/feed');
        setLoading(false);
        return;
      }

      // 🔐 Not logged in
      if (!user) {
        if (!skipRedirect && !isPublicRoute) {
          router.replace('/login');
        }
        setLoading(false);
        return;
      }

      // ✅ Logged in → only redirect from login page
      if (path === '/login') {
        router.replace('/feed');
        setLoading(false);
        return;
      }

      // ✅ IMPORTANT: DO NOT force redirect to /feed everywhere
      // (this was causing your bug)

      setLoading(false);
    };

    init();

    const {
  data: { subscription },
} = supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'INITIAL_SESSION') return;
  if (event === 'SIGNED_OUT') return;

  // 🔥 LOGIN SUCCESS → FORCE FEED
 if (event === 'SIGNED_IN' && session?.user) {
  // 🔥 ONLY redirect if coming from login page
  if (pathname === '/login') {
    router.replace('/feed');
  }
  return;
}

  init();
});

    return () => {
  mounted = false
  subscription.unsubscribe()
};
  }, [router, skipRedirect, pathname]);

  // 🔥 Prevent UI flicker
  if (loading) return null;

  return <>{children}</>;
}