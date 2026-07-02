'use client';
console.log('EDIT PROFILE SCREEN MOUNTED');
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useNotify } from '@/components/NotificationProvider';

const avatars = [
  '/avatars/a1.png',
  '/avatars/a2.png',
  '/avatars/a3.png',
  '/avatars/a4.png',
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
  const [avatar, setAvatar] = useState(avatars[0]);

  const [colleges, setColleges] = useState<any[]>([]);
  const [collegeSearch, setCollegeSearch] = useState('');
  
  const [usernameStatus, setUsernameStatus] = useState<
  'idle' | 'checking' | 'available' | 'taken'
>('idle');
  const [usernameError, setUsernameError] = useState('');
  const [originalProfile, setOriginalProfile] = useState<any>(null);

 const isFormValid =
  name.trim().length > 0 &&
  username.length >= 3 &&
  !usernameError &&
  usernameStatus !== 'taken' &&
  !!collegeId &&
  !!batchYear;

const isChanged =
  originalProfile &&
  (
    name !== (originalProfile.name || '') ||
    username !== (originalProfile.username || '') ||
    (batchYear || '') !== (originalProfile.batch_year || '') ||
    (collegeId || '') !== (originalProfile.college_id || '') ||
    avatar !== (originalProfile.avatar_url || avatars[0])
  );

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

    const { error } = await supabase
      .from('profiles')
      .upsert({
  user_id: user?.id,
  name,
  username,
  batch_year: batchYear,
  college_id: collegeId,
  avatar_url: avatar,
})
      .eq('user_id', user?.id);

    if (error) {
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
      router.push('/feed');
    }
  };

 useEffect(() => {
  const checkUsername = async () => {
    if (
  !username ||
  username.length < 3 ||
  username === (originalProfile?.username || '')
) {
  setUsernameStatus('idle'); // 🔥 don't show anything
  return;
}

    setUsernameStatus('checking');

    // 🔥 Get current user (FIXED)
    const {
  data: { session },
} = await supabase.auth.getSession();

const user = session?.user ?? null;

    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .neq('user_id', user.id)
      .limit(1);

    if (data && data.length > 0) {
      setUsernameStatus('taken');
    } else {
      setUsernameStatus('available');
    }
  };

  const delay = setTimeout(checkUsername, 500); // debounce

  return () => clearTimeout(delay);
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
        minHeight: '100vh',
        background: '#F9FAFB',
        display: 'flex',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
  style={{
    width: '100%',
    maxWidth: 420,
    background: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginTop: 48, 
    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
  }}
>

      <div
  style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  }}
>
  {/* Back */}
  {!isSetupMode && (
  <button
    onClick={() => router.back()}
    style={{
      background: 'none',
      border: 'none',
      fontSize: 14,
      cursor: 'pointer',
      color: '#6B7280',
    }}
  >
    ← Back
  </button>
)}

  {/* Save */}
  <button
    onClick={handleSave}
    disabled={saving || !canSave}
    style={{
      padding: '8px 14px',
      borderRadius: 10,
      border: 'none',
      background: canSave ? '#F4B860' : '#E5E7EB',
      color: canSave ? '#111827' : '#9CA3AF',
      fontWeight: 600,
      cursor: canSave ? 'pointer' : 'not-allowed',
    }}
  >
    {saving ? 'Saving...' : 'Save'}
  </button>
</div>
        {/* TITLE */}
        <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>
  {isSetupMode ? 'Complete your profile 🚀' : 'Your Profile'}
</h2>

{isSetupMode && (
  <p
    style={{
      fontSize: 13,
      color: '#6B7280',
      marginBottom: 16,
    }}
  >
    Add your college & batch to unlock your campus feed
  </p>
)}

        {/* AVATAR */}
        <div style={{ marginBottom: 20 }}>
          <p style={label}>Profile Picture</p>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {avatars.map((a) => (
              <img
                alt="avatar"
                key={a}
                src={a}
                onClick={() => setAvatar(a)}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  cursor: 'pointer',
                  border:
                    avatar === a
                      ? '3px solid #F4B860'
                      : '2px solid #E5E7EB',
                }}
              />
            ))}
          </div>
        </div>

        {/* NAME */}
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          style={input(false)}
        />

        {/* USERNAME */}
        <input
          value={username}
          onChange={(e) => {
  let value = e.target.value;

  // Lowercase + clean
  value = value.toLowerCase().replace(/[^a-z0-9_]/g, '');

  if (value.length > 20) return;

  setUsername(value);

  // 🔥 Validation
  if (value.length === 0) {
    setUsernameError('');
    setUsernameStatus('idle');
  } else if (value.length < 3) {
    setUsernameError('Minimum 3 characters required');
  } else if (!/^[a-z0-9_]+$/.test(value)) {
    setUsernameError('Only lowercase letters, numbers, "_" allowed');
  } else {
    setUsernameError('');
  }
}}
          placeholder="Username"
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
        <div style={{ fontSize: 12, marginBottom: 10 }}>
  {usernameStatus === 'checking' && 'Checking...'}
  {usernameStatus === 'available' && (
    <span style={{ color: 'green' }}>Awesome! Username is available.</span>
  )}
  {usernameStatus === 'taken' && (
    <span style={{ color: 'red' }}>Oops! Username already taken.</span>
  )}
</div>

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
  value={collegeSearch}
  onChange={(e) => setCollegeSearch(e.target.value)}
  placeholder="Search college"
  style={input(isLocked)}
  disabled={isLocked}
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


        {/* BATCH */}
        <select
  value={batchYear}
  onChange={(e) => setBatchYear(e.target.value)}
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
          <option value="2025-29">2025–29</option>
          <option value="2024-28">2024–28</option>
          <option value="2023-27">2023–27</option>
          <option value="2022-26">2022–26</option>
        </select>

        <div
  style={{
    marginTop: 16,
    padding: 14,
    borderRadius: 14,
    background: '#F9FAFB',
    border: '1px solid #E5E7EB',
  }}
>
  <p style={{ fontSize: 12, color: '#6B7280' }}>Preview</p>

  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <img
      src={avatar}
      style={{ width: 40, height: 40, borderRadius: '50%' }}
    />

    <div>
      <div style={{ fontWeight: 600 }}>{name || 'Your Name'}</div>
      <div style={{ fontSize: 12, color: '#6B7280' }}>
        @{username || 'username'}
      </div>
    </div>
  </div>
</div>

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
</div>

        {/* LOGOUT */}
        {!isSetupMode && (
  <button onClick={handleLogout} style={logoutBtn}>
    Logout
  </button>
)}
      </div>
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