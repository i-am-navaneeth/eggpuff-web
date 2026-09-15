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

      const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/what-is-eggpuff',
  '/privacy',
  '/terms',
  '/community-guidelines',
  '/support',
  '/contact',
];

     const isPublicRoute = PUBLIC_ROUTES.some((route) =>
  path.startsWith(route)
);

      const isAdminRoute = path.startsWith('/admin$$$db');

      let isAdmin = false;

if (user) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('user_id', user.id)
    .maybeSingle();

  isAdmin = profile?.is_admin === true;
}

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

    // ✅ Logged in → check the REAL profile completion state
if (path === '/login') {
  const { data: profile } = await supabase
    .from('profiles')
    .select('college_id, batch_year, profile_completed')
    .eq('user_id', user.id)
    .maybeSingle();

  const profileSetupCompleted =
    profile?.profile_completed === true &&
    !!profile?.college_id &&
    !!profile?.batch_year;

  if (!profileSetupCompleted) {
    // Fresh account / incomplete profile
    localStorage.removeItem('eggpuff_profile_setup_completed');
    router.replace('/profile');
  } else {
    // Existing completed account
    localStorage.setItem('eggpuff_profile_setup_completed', 'true');
    router.replace('/feed');
  }

  setLoading(false);
  return;
}

      // ✅ IMPORTANT: DO NOT force redirect to /feed everywhere
      // (this was causing your bug)

      setLoading(false);
    };

    init();

    const handleSignedIn = async (userId: string) => {
  if (!mounted || pathname !== '/login') return;

  const { data: profile } = await supabase
    .from('profiles')
    .select('college_id, batch_year, profile_completed')
    .eq('user_id', userId)
    .maybeSingle();

  if (!mounted) return;

  const profileSetupCompleted =
    profile?.profile_completed === true &&
    !!profile?.college_id &&
    !!profile?.batch_year;

  if (!profileSetupCompleted) {
    localStorage.removeItem('eggpuff_profile_setup_completed');
    router.replace('/profile');
  } else {
    localStorage.setItem(
      'eggpuff_profile_setup_completed',
      'true'
    );
    router.replace('/feed');
  }
};

const {
  data: { subscription },
} = supabase.auth.onAuthStateChange((event, session) => {
  if (!mounted) return;

  switch (event) {
    case 'SIGNED_IN': {
      const userId = session?.user?.id;

      if (userId) {
        void handleSignedIn(userId);
      }

      break;
    }

    case 'SIGNED_OUT':
      if (!skipRedirect) {
        router.replace('/login');
      }
      break;

    default:
      break;
  }
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