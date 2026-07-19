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

export default function EditProfileScreen({
  scrollContainer,
}: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [batchYear, setBatchYear] = useState('');
  const [collegeId, setCollegeId] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState(
  avatars[Math.floor(Math.random() * (avatars.length - 1))]
);

  const [colleges, setColleges] = useState<any[]>([]);
  const [collegeSearch, setCollegeSearch] = useState('');
  
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
  !!collegeId &&
  !!batchYear;

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
  const { data: college } = await supabase
    .from('colleges')
    .select('name')
    .eq('id', profile.college_id)
    .maybeSingle();

  setCollegeName(college?.name || '');
  setCollegeSearch(college?.name || '');
}

      setLoading(false);
    };

    load();
  }, []);

  /* ---------------- SEARCH COLLEGES ---------------- */
  useEffect(() => {
    const fetchColleges = async () => {
      if (!collegeSearch || isLocked) {
  setColleges([]);
  return;
}

      const { data } = await supabase
        .from('colleges')
        .select('*')
        .ilike('name', `%${collegeSearch}%`)
        .limit(6);

      if (data) setColleges(data);
    };

    fetchColleges();
  }, [collegeSearch, isLocked]);

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
    college_id: collegeId,
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

if (isSetupMode) {
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
  value={collegeSearch}
  onChange={(e) =>
    setCollegeSearch(e.target.value)
  }
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

        {/* 🔥 NO RESULTS → REQUEST COLLEGE */}
{!isLocked &&
  collegeSearch &&
  colleges.length === 0 &&
  !collegeId && ( 
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
      <div style={{ marginBottom: 6 }}>
        No college found. Type full name and
      </div>

      <span
        onClick={async () => {
          const {
  data: { session },
} = await supabase.auth.getSession()

const user = session?.user

          if (!user) return

           const normalizedCollege = collegeSearch.trim().toLowerCase()

          // 🔒 prevent duplicate
          const { data: existing } = await supabase
            .from('college_requests')
            .select('id')
            .eq('requested_by', user.id)
            .ilike('name', collegeSearch)
            .maybeSingle()

          if (existing) {
            notify('Already requested 👍')
            return
          }

          const { error } = await supabase
            .from('college_requests')
            .insert({
              name: normalizedCollege,
              requested_by: user.id,
              status: 'pending',
            })

          if (error) {
            notify('Failed to send request ❌')
            return
          }

          notify('🎓 College request sent!')

          // optional cleanup
          setCollegeSearch('')
        }}
        style={{
          fontWeight: 600,
          cursor: 'pointer',
          color: '#92400E',
        }}
      >
        Request college.
      </span>
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
    {colleges.map((c) => (
      <div
        key={c.id}
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
<select
  value={batchYear}
  onChange={(e) => {
  setBatchYear(e.target.value)
}}
  style={{
    ...input(isLocked),
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    backgroundImage:
      "url(\"data:image/svg+xml;utf8,<svg fill='%236B7280' height='20' viewBox='0 0 20 20' width='20' xmlns='http://www.w3.org/2000/svg'><path d='M5 7l5 5 5-5H5z'/></svg>\")",
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    backgroundSize: '16px',
    paddingRight: 36,
  }}
  disabled={isLocked}
>
  <option value="">Select batch</option>

{Array.from(
  { length: Math.max(new Date().getFullYear(), 2026) - 2022 + 1 },
  (_, i) => {
    const start = Math.max(new Date().getFullYear(), 2026) - i;
    const end = String(start + 4).slice(-2);

    return (
      <option key={start} value={`${start}-${end}`}>
        {start}–{end}
      </option>
    );
  }
)}
</select>

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