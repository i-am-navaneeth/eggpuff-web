'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useNotify } from '@/components/NotificationProvider';
import { setCurrentProfile } from '@/lib/currentProfile';
import ConfirmationSheet from '@/components/ui/ConfirmationSheet'

const avatars = [
  '/avatars/a1.png',
  '/avatars/a2.png',
  '/avatars/a3.png',
  '/avatars/a4.png',
  '/avatars/eggpuff.png',
];

type Props = {
  scrollContainer?: React.RefObject<HTMLDivElement |null>
}

const formatCollegeName = (value: string) => {
  const smallWords = new Set([
    'of',
    'the',
    'and',
    'in',
    'at',
    'for',
    'on',
  ]);

  return value
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((word, index) => {
      if (index > 0 && smallWords.has(word)) {
        return word;
      }

      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
};

export default function EditProfileScreen({
  scrollContainer,
}: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [batchYear, setBatchYear] = useState('');
  const [batchYearError, setBatchYearError] = useState('');
  const [collegeId, setCollegeId] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState(
  avatars[Math.floor(Math.random() * (avatars.length - 1))]
);

  const [colleges, setColleges] = useState<any[]>([]);
  const [collegeSearch, setCollegeSearch] = useState('');
  const [collegeSearching, setCollegeSearching] = useState(false);
  const [collegeExistsInDB, setCollegeExistsInDB] = useState(false);
  const [collegeRequestSent, setCollegeRequestSent] = useState(false);
  
  const [usernameStatus, setUsernameStatus] = useState<
  'idle' | 'checking' | 'available' | 'taken'
>('idle');
  const [usernameError, setUsernameError] = useState('');
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);
  const [originalProfile, setOriginalProfile] = useState<any>(null);

 const isFormValid =
  name.trim().length > 0 &&
  username.length >= 3 &&
  !usernameError &&
  usernameStatus !== 'taken' &&
  (!!collegeId || collegeRequestSent) &&
  /^\d{4}-\d{2}$/.test(batchYear) &&
  !batchYearError;

const isChanged =
  !!originalProfile &&
  JSON.stringify({
    name,
    username,
    bio,
    batchYear,
    collegeId,
    avatar,
  }) !==
  JSON.stringify({
    name: originalProfile.name || "",
    username: originalProfile.username || "",
    bio: originalProfile.bio || "",
    batchYear: originalProfile.batch_year || "",
    collegeId: originalProfile.college_id || "",
    avatar: originalProfile.avatar_url || avatars[0],
  });

const canSave = isFormValid && isChanged;

const [isLocked, setIsLocked] = useState(false);
const [isSetupMode, setIsSetupMode] = useState(false);
const { notify } = useNotify();

const [collegeName, setCollegeName] = useState('');
const dangerTexts = [
  'Leaving already? Your campus will miss you 🥲',
  'Logging out? Your questions will feel abandoned 😭',
  'Stepping out of EggPuff? Don’t let the puff go cold 🥐',
  'Careful… this exits your campus world ⚠️',
  'Bro you sure? The campus gossip continues without you 👀',
];

const [dangerIndex, setDangerIndex] = useState(0);
const [dangerFade, setDangerFade] = useState(true);
const [showLogoutSheet, setShowLogoutSheet] = useState(false)
  /* ---------------- LOAD PROFILE ---------------- */
  useEffect(() => {
    const load = async () => {
      const {
  data: { session },
} = await supabase.auth.getSession()

const user = session?.user

      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('user_id', user.id)
  .maybeSingle()

      if (profile) {
        setName(profile.name || '');
        setUsername(profile.username || '');
        setBio(profile.bio || '');
        setBatchYear(profile.batch_year || '');
        setCollegeId(profile.college_id || '');
        setAvatar(profile.avatar_url || avatars[0]);
        setOriginalProfile(profile);
        if (profile.college_id && profile.batch_year) {
  setIsLocked(true);
  setIsSetupMode(false); // ✅ existing user
} else {
  setIsLocked(false);
  setIsSetupMode(true); // 🔥 first-time user
}
      }
      if (profile && profile.college_id) {
  // College already exists in EggPuff
  const { data: college } = await supabase
    .from('colleges')
    .select('name')
    .eq('id', profile.college_id)
    .maybeSingle();

  setCollegeName(college?.name || '');
  setCollegeSearch(college?.name || '');
  setCollegeRequestSent(false);
} else {
  // No EP college yet — check whether this user already requested one
  const { data: request } = await supabase
    .from('college_requests')
    .select('name, status')
    .eq('requested_by', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (request) {
  const formattedCollegeName = formatCollegeName(request.name || '');

  setCollegeSearch(formattedCollegeName);
  setCollegeName(formattedCollegeName);
  setCollegeRequestSent(true);
}
}

setLoading(false);
    };

    load();
  }, []);

 /* ---------------- SEARCH COLLEGES ---------------- */
useEffect(() => {
  const search = collegeSearch.trim();

  // Empty search / locked profile / already requested
  if (!search || isLocked || collegeRequestSent) {
    setColleges([]);
    setCollegeSearching(false);

    if (!search || isLocked) {
      setCollegeExistsInDB(false);
    }

    return;
  }

  // 🔎 Searching
  setCollegeSearching(true);
  setCollegeExistsInDB(false);
  setColleges([]);

  const fetchColleges = async () => {
    console.log('🔎 COLLEGE SEARCH:', search);

    // 1️⃣ Search EggPuff database first
    const { data: localColleges, error: localError } = await supabase
      .from('colleges')
      .select('*')
      .ilike('name', `%${search}%`)
      .limit(6);

    console.log('🏫 LOCAL RESULT:', localColleges);
    console.log('❌ LOCAL ERROR:', localError);

    // ✅ College exists in EggPuff DB
    if (localColleges && localColleges.length > 0) {
      console.log('✅ COLLEGE EXISTS IN EGGPuff DB');

      setCollegeExistsInDB(true);
      setColleges(localColleges);
      setCollegeSearching(false);
      return;
    }

    // 2️⃣ Not in EggPuff DB → check Hipo
    console.log('🌍 NOT IN EGGPuff DB → CALLING HIPO API');

    // Important: keep this false even if Hipo finds the college
    setCollegeExistsInDB(false);

    const apiUrl =
      `/api/colleges/search?q=${encodeURIComponent(search)}`;

    console.log('📡 API URL:', apiUrl);

    try {
      const response = await fetch(apiUrl);

      console.log('📡 API STATUS:', response.status);
      console.log('📡 API OK:', response.ok);

      const rawText = await response.text();

      console.log('📦 API RAW RESPONSE:', rawText);

      if (!response.ok) {
        console.error('❌ HIPO API FAILED');

        setColleges([]);
        setCollegeSearching(false);
        return;
      }

      let result;

      try {
        result = JSON.parse(rawText);
      } catch (jsonError) {
        console.error('❌ API DID NOT RETURN JSON:', jsonError);

        setColleges([]);
        setCollegeSearching(false);
        return;
      }

      console.log('📦 API JSON:', result);
      console.log('🎓 API COLLEGES:', result.results);

      // Hipo results are NOT EggPuff colleges yet.
      // We keep them only as reference, but the request warning will show.
      setColleges(result.results ?? []);
      setCollegeSearching(false);

    } catch (error) {
      console.error('🔥 FETCH ERROR:', error);

      setColleges([]);
      setCollegeSearching(false);
      setCollegeExistsInDB(false);
    }
  };

  // ⏳ Debounce
  const timer = setTimeout(fetchColleges, 300);

  return () => clearTimeout(timer);
}, [collegeSearch, isLocked, collegeRequestSent]);


  /* ---------------- SAVE ---------------- */
  const handleSave = async () => {
    if (saving) return;
    if (!username || username.length < 3) {
  notify('Username must be at least 3 characters');
  return;
}

if (!/^[a-z0-9_]+$/.test(username)) {
  notify('Invalid username format');
  return;
}

if (usernameStatus === 'taken') {
  notify('Username already taken');
  return;
}
    setSaving(true);

    const {
  data: { session },
} = await supabase.auth.getSession()

const user = session?.user

  const { data, error } = await supabase
  .from("profiles")
  .update({
    name,
    username,
    bio,
    batch_year: batchYear,
    college_id: collegeId || null,
    avatar_url: avatar,
    profile_completed: true,

    // Legal acceptance
  terms_accepted: true,
  terms_accepted_at: new Date().toISOString(),
  terms_version: '2026-07-14',
  })
  .eq("user_id", user?.id)
  .select();


    if (error) {
      console.error('Profile update failed:', error);
      
  const msg = error.message.toLowerCase();

  if (msg.includes('unique_username')) {
    notify('Username already taken ❌');
  } else if (msg.includes('username_format_check')) {
    notify('Invalid username format ❌');
  } else {
    notify('Something went wrong. Please try again.');
  }

  setSaving(false);
  return;
} else {
  notify('Profile updated ✅');
  setSaving(false);

  // 🔥 Update global profile instantly
  setCurrentProfile({
    user_id: user!.id,
    username,
    name,
    avatar_url: avatar,
  });

  // ✅ Mark profile setup as completed locally
  // College is mandatory before this point because canSave must be true.
  if (isSetupMode) {
    localStorage.setItem('eggpuff_profile_setup_completed', 'true');

    window.location.replace('/feed');
  } else {
    router.replace(`/u/${username}`);
  }
}
  };

 useEffect(() => {
  const checkUsername = async () => {
    if (
      !username ||
      username.length < 3 ||
      username === (originalProfile?.username || '')
    ) {
      setUsernameStatus('idle');
      setUsernameSuggestions([]);
      return;
    }

    setUsernameStatus('checking');

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const user = session?.user;

    if (!user) return;

    // Fast indexed lookup
    const { data } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .neq('user_id', user.id)
      .limit(1);

    if (!data || data.length === 0) {
      setUsernameStatus('available');
      setUsernameSuggestions([]);
      return;
    }

    setUsernameStatus('taken');

    // Candidate suggestions
    const candidates = [
      `${username}${Math.floor(Math.random() * 99)}`,
      `${username}_${Math.floor(Math.random() * 999)}`,
      `${username}01`,
      `${username}07`,
      `${username}${new Date().getFullYear()}`,
    ];

    const { data: existing } = await supabase
      .from('profiles')
      .select('username')
      .in('username', candidates);

    const taken = new Set(existing?.map((x) => x.username));

    setUsernameSuggestions(
      candidates.filter((x) => !taken.has(x))
    );
  };

  const timer = setTimeout(checkUsername, 180);

  return () => clearTimeout(timer);
}, [username, originalProfile]);

useEffect(() => {
  let mounted = true

  let steps = 0
  const maxSteps = 3

  const interval = setInterval(() => {
    if (steps >= maxSteps) {
      clearInterval(interval)
      return
    }

    setDangerFade(false)

    const timeout = setTimeout(() => {
      if (!mounted) return

      setDangerIndex((prev) => (prev + 1) % dangerTexts.length)
      setDangerFade(true)
    }, 200)

    steps++

    return () => clearTimeout(timeout)
  }, 3000)

  return () => {
    mounted = false
    clearInterval(interval)
  }
}, [])

useEffect(() => {
  let steps = 0;
  const maxSteps = 3; // 🔥 rotate only few times, then stop

  const interval = setInterval(() => {
    if (steps >= maxSteps) {
      clearInterval(interval);
      return;
    }

    setDangerFade(false);

    setTimeout(() => {
      setDangerIndex((prev) => (prev + 1) % dangerTexts.length);
      setDangerFade(true);
    }, 200);

    steps++;
  }, 3000); // ⏱ every 3s

  return () => clearInterval(interval);
}, []);

useEffect(() => {
  if (loading) return

  const shouldScrollToCollege =
    sessionStorage.getItem('eggpuff_scroll_to_college') === 'true'

  if (!shouldScrollToCollege) return

  sessionStorage.removeItem('eggpuff_scroll_to_college')

  const scrollToCollege = () => {
    const collegeInput = document.querySelector(
      '[data-college-input]'
    ) as HTMLElement | null

    if (!collegeInput) return

    const container = scrollContainer?.current

    // If the profile page uses a custom scroll container
    if (container) {
      const inputRect = collegeInput.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()

      const targetScroll =
        container.scrollTop +
        (inputRect.top - containerRect.top) -
        container.clientHeight / 2 +
        collegeInput.offsetHeight / 2

      container.scrollTo({
        top: Math.max(0, targetScroll),
        behavior: 'smooth',
      })

      return
    }

    // Fallback: normal page/window scrolling
    collegeInput.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
  }

  // Wait until the profile DOM has fully painted
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      scrollToCollege()
    })
  })
}, [loading, scrollContainer])

  /* ---------------- LOGOUT ---------------- */
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) return <div style={{ padding: 20 }}>Loading your profile...</div>;

return (
  <div
  style={{
    minHeight: '100dvh',
    width: '100%',
    background: '#FFFFFF',
    display: 'flex',
    justifyContent: 'center',
    paddingTop: 0,
    paddingRight: 16,
    paddingBottom: 0,      // ← remove bottom padding
    paddingLeft: 16,
    boxSizing: 'border-box',
  }}
>
  <div
    style={{
      width: '100%',
      maxWidth: 420,
      minHeight: '100dvh',  // ← fill entire screen
      background: '#FFFFFF',
      paddingTop: 8,
      paddingRight: 20,
      paddingBottom: 40,
      paddingLeft: 20,
      boxSizing: 'border-box',
    }}
  >

    {/* TOP BAR */}
<div
  style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 58,
    paddingBottom: 12,
    marginBottom: 18,
    borderBottom: '1px solid #ECECEC',
  }}
>
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 14,
    }}
  >
    {!isSetupMode && (
      <button
        onClick={() => router.back()}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          width: 28,
          height: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: '#1F2937',
          fontSize: 28,
          lineHeight: 1,
        }}
      >
        ‹
      </button>
    )}

    <div
      style={{
        fontSize: 18,
        fontWeight: 700,
        color: '#111827',
        letterSpacing: '-0.02em',
      }}
    >
      {isSetupMode ? 'Complete Profile' : 'Edit Profile'}
    </div>
  </div>

  <button
    onClick={handleSave}
    disabled={saving || !canSave}
    style={{
      minWidth: 84,
      height: 42,
      border: 'none',
      borderRadius: 14,
      background: canSave ? '#F4B860' : '#ECEFF3',
      color: canSave ? '#111827' : '#9CA3AF',
      fontSize: 15,
      fontWeight: 700,
      cursor: canSave ? 'pointer' : 'not-allowed',
      transition: '0.18s',
    }}
  >
    {saving ? 'Saving…' : 'Save'}
  </button>
</div>

        {/* PROFILE HEADER */}
<div
  style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 28,
  }}
>
  <img
    src={avatar}
    alt="avatar"
    style={{
      width: 88,
      height: 88,
      borderRadius: '50%',
      objectFit: 'cover',
      border: '3px solid #F4B860',
      marginBottom: 12,
    }}
  />

  <div
  style={{
    fontSize: 24,
    fontWeight: 700,
    color: '#111827',
  }}
>
  @{username || 'username'}
</div>

<div
  style={{
    marginTop: 4,
    fontSize: 16,
    color: '#4B5563',
    fontWeight: 500,
  }}
>
  {name || 'Your Name'}
</div>
</div>

<div
  style={{
    height:0,
    background: '#F3F4F6',
    margin: '22px 0',
  }}
/>

{/* PROFILE */}
<div
  style={{
    fontSize: 12,
    fontWeight: 700,
    color: '#9CA3AF',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 14,
  }}
>
  Profile
</div>

{/* PROFILE PICTURE */}
<div style={{ marginBottom: 26 }}>
<p style={label}>Select your avatar</p>

  <div
    style={{
      display: 'flex',
      gap: 12,
      flexWrap: 'wrap',
    }}
  >
    {avatars
      .filter(
        (a) =>
          a !== '/avatars/eggpuff.png' ||
          username === 'eggpuffofficial'
      )
      .map((a) => (
        <img
          key={a}
          src={a}
          alt="avatar"
          onClick={() => setAvatar(a)}
          style={{
  width: 56,
  height: 56,
  borderRadius: '50%',
  cursor: 'pointer',
  transition: 'transform .18s ease, border-color .18s ease',
  border:
    avatar === a
      ? '3px solid #F4B860'
      : '2px solid #E5E7EB',
  transform:
    avatar === a ? 'scale(1.08)' : 'scale(1)',
  boxSizing: 'border-box',
}}
        />
      ))}
  </div>
</div>



{/* Name */}
<p style={label}>Display Name</p>

<input
  type="text"
  name="profile-name"
  value={name}
  onChange={(e) => setName(e.target.value)}
  placeholder="Name"
  autoComplete="name"
  autoCorrect="off"
  autoCapitalize="words"
  spellCheck={false}
  enterKeyHint="next"
  style={input(false)}
/>

       {/* Username */}
<p
  style={{
    ...label,
    marginTop: 14,
  }}
>
  Username
</p>

<input
  type="text"
  name="profile-username"
  value={username}
  onChange={(e) => {
    let value = e.target.value

    // Lowercase + clean
    value = value
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '')

    if (value.length > 20) return

    setUsername(value)

    // 🔥 Validation
    if (value.length === 0) {
      setUsernameError('')
      setUsernameStatus('idle')
    } else if (value.length < 3) {
      setUsernameError(
        'Minimum 3 characters required'
      )
    } else if (
      !/^[a-z0-9_]+$/.test(value)
    ) {
      setUsernameError(
        'Only lowercase letters, numbers, "_" allowed'
      )
    } else {
      setUsernameError('')
    }
  }}
  placeholder="Username"
  autoComplete="off"
  autoCorrect="off"
  autoCapitalize="none"
  spellCheck={false}
  enterKeyHint="done"
  style={input(false)}
/>

        {usernameError && (
  <div
    style={{
      fontSize: 12,
      color: '#DC2626',
      marginBottom: 10,
    }}
  >
    {usernameError}
  </div>
)}
        <div
  style={{
    fontSize: 12,
    marginBottom: 12,
  }}
>
  {usernameStatus === 'checking' && (
    <span style={{ color: '#6B7280' }}>
      Checking...
    </span>
  )}

  {usernameStatus === 'available' && (
    <span style={{ color: '#16A34A' }}>
      ✓ Username available
    </span>
  )}

  {usernameStatus === 'taken' && (
    <>
      <div
        style={{
          color: '#DC2626',
          marginBottom: 8,
        }}
      >
        Username already taken.
      </div>

      {usernameSuggestions.length > 0 && (
        <div
          style={{
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
          }}
        >
          {usernameSuggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setUsername(s)}
              style={{
                border: '1px solid #E5E7EB',
                background: '#F9FAFB',
                borderRadius: 999,
                padding: '6px 12px',
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              @{s}
            </button>
          ))}
        </div>
      )}
    </>
  )}
</div>

<div
  style={{
    height: 1,
    background: '#F3F4F6',
    margin: '22px 0',
  }}
/>

{/* ABOUT */}
<div
  style={{
    fontSize: 12,
    fontWeight: 700,
    color: '#9CA3AF',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 14,
  }}
>
  About
</div>

<p style={label}>Bio</p>

<textarea
  value={bio}
  onChange={(e) => {
    if (e.target.value.length <= 80)
      setBio(e.target.value);
  }}
  placeholder="Helping juniors with coding • Coffee addict ☕ (optional)"
  rows={3}
  style={{
    ...input(false),
    resize: 'none',
    minHeight: 82,
    fontFamily: 'inherit',
    lineHeight: 1.5,
  }}
/>

<div
  style={{
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: -8,
    marginBottom: 12,
  }}
>
  {bio.length}/80
</div>
<div
  style={{
    height: 1,
    background: '#F3F4F6',
    margin: '22px 0',
  }}
/>

{/* CAMPUS */}
<div
  style={{
    fontSize: 12,
    fontWeight: 700,
    color: '#9CA3AF',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 14,
  }}
>
  Campus
</div>

<p style={label}>College Name</p>



{!isLocked && collegeId && (
  <div
    style={{
      fontSize: 12,
      color: '#B45309',
      background: '#FEF3C7',
      padding: 8,
      borderRadius: 10,
      marginBottom: 10,
    }}
  >
    Once saved, you cannot change college & batch ⚠️
  </div>
)}

        {/* COLLEGE */}
<input
  type="search"
  name="college-search"
  data-college-input
  value={collegeSearch}
  onChange={(e) => {
  const value = e.target.value;

  setCollegeSearch(value);

  // User is changing the requested college,
  // so the previous request message should disappear.
  if (collegeRequestSent) {
    setCollegeRequestSent(false);
    setCollegeId('');
    setCollegeName('');
  }
}}
  placeholder="Search college"
  disabled={isLocked}
  autoComplete="off"
  autoCorrect="off"
  autoCapitalize="words"
  spellCheck={false}
  enterKeyHint="search"
  data-form-type="other"
  style={input(isLocked)}
/>

{/* 🔎 COLLEGE SEARCHING ANIMATION */}
{!isLocked &&
  collegeSearch.trim() &&
  collegeSearching && (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          padding: '12px 14px',
          marginTop: -6,
          marginBottom: 12,
          borderRadius: 12,
          background: '#F9FAFB',
          border: '1px solid #F1F3F5',
          color: '#6B7280',
          fontSize: 13,
          animation: 'collegeSearchFadeIn 0.2s ease',
        }}
      >
        <span>Searching campus</span>

        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 3,
          }}
        >
          <span className="college-search-dot" />
          <span className="college-search-dot" />
          <span className="college-search-dot" />
        </span>
      </div>

      <style jsx>{`
        @keyframes collegeSearchDot {
          0%,
          60%,
          100% {
            transform: translateY(0);
            opacity: 0.35;
          }

          30% {
            transform: translateY(-3px);
            opacity: 1;
          }
        }

        @keyframes collegeSearchFadeIn {
          from {
            opacity: 0;
            transform: translateY(-3px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .college-search-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #9CA3AF;
          animation: collegeSearchDot 1.1s infinite ease-in-out;
        }

        .college-search-dot:nth-child(2) {
          animation-delay: 0.15s;
        }

        .college-search-dot:nth-child(3) {
          animation-delay: 0.3s;
        }
      `}</style>
    </>
  )}

    {/* 🔥 COLLEGE NOT YET AVAILABLE → REQUEST COLLEGE */}
{!isLocked &&
  collegeSearch.trim() &&
  !collegeSearching &&
  !collegeExistsInDB &&
  !collegeId &&
  !collegeRequestSent && (
    <div
      style={{
        background: '#FEF3C7',
        borderRadius: 12,
        padding: 12,
        marginTop: -6,
        marginBottom: 12,
        textAlign: 'center',
        fontSize: 13,
      }}
    >
      <div
        style={{
          marginBottom: 6,
          color: '#374151',
        }}
      >
        We don’t have this college in EggPuff yet.
      </div>

      <div
        style={{
          fontSize: 12,
          color: '#6B7280',
          marginBottom: 8,
        }}
      >
        Request it and we’ll add it to the campus list.
      </div>

      <span
        onClick={async () => {
          const {
            data: { session },
          } = await supabase.auth.getSession();

          const user = session?.user;

          if (!user) return;

          const requestedName = formatCollegeName(collegeSearch.trim());

// 🔑 requested_by references profiles.id, NOT auth.users.id
const { data: profile, error: profileError } = await supabase
  .from('profiles')
  .select('id')
  .eq('user_id', user.id)
  .maybeSingle();

if (profileError || !profile) {
  console.error('❌ Could not find user profile:', profileError);
  notify('Could not find your profile ❌');
  return;
}

const profileId = profile.id;

// 🔒 Prevent duplicate requests from the same user
const { data: existing } = await supabase
  .from('college_requests')
  .select('id')
  .eq('requested_by', profileId)
  .ilike('name', requestedName)
  .maybeSingle();

if (existing) {
  setCollegeRequestSent(true);
  notify('Already requested 👍');
  return;
}

const { data: insertedRequest, error } = await supabase
  .from('college_requests')
  .insert({
    name: requestedName,
    requested_by: profileId,
    status: 'pending',
  })
  .select()
  .single();

if (error) {
  console.error('❌ College request failed:', {
    message: error.message,
    details: error.details,
    hint: error.hint,
    code: error.code,
  });

  notify(
    error.message
      ? `Failed: ${error.message}`
      : 'Failed to send request ❌'
  );

  return;
}

console.log('✅ College request inserted:', insertedRequest);

          // ✅ Keep the college name in the input
          setCollegeSearch(requestedName);
          setCollegeName(requestedName);

          // ✅ Mark this user's request as sent
          setCollegeRequestSent(true);

          // ❌ DO NOT clear collegeSearch
          notify('🎓 College request sent!');
        }}
        style={{
          fontWeight: 600,
          cursor: 'pointer',
          color: '#92400E',
        }}
      >
        Request this college →
      </span>
    </div>
  )}

{/* 🎓 COLLEGE REQUEST SENT */}
{!isLocked &&
  collegeSearch.trim() &&
  collegeRequestSent && (
    <div
      style={{
        background: '#FEF3C7',
        borderRadius: 12,
        padding: 12,
        marginTop: -6,
        marginBottom: 12,
        textAlign: 'center',
        fontSize: 13,
      }}
    >
      <div
        style={{
          color: '#92400E',
          fontWeight: 600,
          marginBottom: 4,
        }}
      >
        🎓 College request sent
      </div>

      <div
        style={{
          fontSize: 12,
          color: '#6B7280',
        }}
      >
        We’ll add this college to EggPuff’s campus list once it’s approved.
      </div>
    </div>
  )}
  {!isLocked &&
  collegeSearch &&
  colleges.length > 0 &&
  collegeSearch !== collegeName && (
  <div
    style={{
      background: '#fff',
      border: '1px solid #E5E7EB',
      borderRadius: 12,
      marginTop: -8,
      marginBottom: 12,
      maxHeight: 160,
      overflowY: 'auto',
      boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
    }}
  >
    {colleges.map((c, index) => (
  <div
    key={c.id ?? `${c.name}-${c.country}-${index}`}
    onClick={() => {
      setCollegeId(c.id)
      setCollegeName(c.name)
      setCollegeSearch(c.name)
      setColleges([])
    }}
        style={{
          padding: '10px 12px',
          cursor: 'pointer',
          fontSize: 14,
          borderBottom: '1px solid #F3F4F6',
        }}
        onMouseEnter={(e) => {
  e.currentTarget.style.backgroundColor = '#F9FAFB'
}}
onMouseLeave={(e) => {
  e.currentTarget.style.backgroundColor = '#FFFFFF'
}}
      >
        {c.name}
      </div>
    ))}
  </div>
)}

<p
  style={{
    ...label,
    marginTop: 14,
  }}
>
  Graduation Batch
</p>
{/* BATCH */}
<input
  type="text"
  name="graduation-batch"
  value={batchYear}
  onChange={(e) => {
  let value = e.target.value

  // Allow only numbers and "-"
  value = value.replace(/[^0-9-]/g, '')

  if (value.length > 7) return

  setBatchYear(value)

  if (value.length === 0) {
    setBatchYearError('')
    return
  }

  // Check format first
  if (!/^\d{4}-\d{2}$/.test(value)) {
    setBatchYearError('Please use this format: 2025-29')
    return
  }

  const [start, end] = value.split('-').map(Number)
  const endYear = Math.floor(start / 100) * 100 + end

  // Years must be between 1900–2100
  if (start < 1900 || start > 2100 || endYear < 1900 || endYear > 2100) {
    setBatchYearError('Please use this format: 2025-29')
    return
  }

  // Starting year must be before ending year
  if (endYear <= start) {
    setBatchYearError('Please use this format: 2025-29')
    return
  }

  setBatchYearError('')
}}

onBlur={() => {
  if (!batchYear) return

  if (!/^\d{4}-\d{2}$/.test(batchYear)) {
    setBatchYearError('Please use this format: 2025-29')
    return
  }

  const [start, end] = batchYear.split('-').map(Number)
  const endYear = Math.floor(start / 100) * 100 + end

  if (
    start < 1900 ||
    start > 2100 ||
    endYear < 1900 ||
    endYear > 2100
  ) {
    setBatchYearError('Please use this format: 2025-29')
    return
  }

  if (endYear <= start) {
    setBatchYearError('Please use this format: 2025-29')
    return
  }

  setBatchYearError('')
}}
  placeholder="ex: 2025-29"
  inputMode="numeric"
  autoComplete="off"
  autoCorrect="off"
  autoCapitalize="none"
  spellCheck={false}
  disabled={isLocked}
  style={{
    ...input(isLocked),
    marginBottom: batchYearError ? 6 : 12,
  }}
/>

{batchYearError && (
  <div
    style={{
      fontSize: 12,
      color: '#DC2626',
      marginBottom: 12,
    }}
  >
    ⚠️ {batchYearError}
  </div>
)}

{/* DANGER ZONE TEXT */}
        {!isSetupMode && (
<div
  style={{
    marginTop: 24,
    marginBottom: 12,
    borderTop: '1.5px solid #D1D5DB', // 🔥 stronger divider
    paddingTop: 14,
  }}
>
  <div
    style={{
      fontWeight: 600,
      fontSize: 14,
      color: '#DC2626', // 🔥 red title
    }}
  >
    ⚠️ Danger Zone
  </div>

  <div
    style={{
      fontSize: 12,
      color: '#374151', // 🔥 softer red text
      marginTop: 4,
      opacity: dangerFade ? 1 : 0,
      transition: 'opacity 0.3s ease',
    }}
  >
    {dangerTexts[dangerIndex]}
  </div>
</div>)}

   {/* LOGOUT */}
        {!isSetupMode && (     
  <button
  onClick={() => setShowLogoutSheet(true)}
  style={logoutBtn}
>
  Logout
</button>
)}
      </div>

      <ConfirmationSheet
  open={showLogoutSheet}
  title="Log out?"
  description="You'll need to sign in again to access your EggPuff account."
  confirmText="Log out"
  cancelText="Cancel"
  confirmColor="#DC2626"
  onCancel={() => setShowLogoutSheet(false)}
  onConfirm={async () => {
    setShowLogoutSheet(false)
    await handleLogout()
  }}
/>

    </div>
  );
}

/* ---------------- STYLES ---------------- */

const input = (disabled = false): React.CSSProperties => ({
  width: '100%',
  padding: '12px 14px',
  marginBottom: 12,
  borderRadius: 12,
  border: '1px solid #E5E7EB',
  fontSize: 14,
  background: disabled ? '#F3F4F6' : '#FFFFFF',
  color: disabled ? '#6B7280' : '#111827',
});

const primaryBtn: React.CSSProperties = {
  width: '100%',
  padding: 14,
  borderRadius: 14,
  border: 'none',
  background: '#F4B860',
  fontWeight: 600,
  fontSize: 15,
  cursor: 'pointer',
  marginTop: 10,
};

const logoutBtn: React.CSSProperties = {
  width: '100%',
  padding: 12,
  borderRadius: 14,
  border: '1px solid #E5E7EB',
  background: '#fff',
  fontWeight: 500,
  fontSize: 14,
  cursor: 'pointer',
  marginTop: 10,
};

const label: React.CSSProperties = {
  fontSize: 13,
  color: '#6B7280',
  marginBottom: 8,
};