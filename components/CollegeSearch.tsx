'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useNotify } from './NotificationProvider';

type College = {
  id: string;
  name: string;
};

type Props = {
  onSelect: (college: College) => void;
};

export default function CollegeSearch({ onSelect }: Props) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<College[]>([]);
  const [selected, setSelected] = useState<College | null>(null);
  const [loading, setLoading] = useState(false);

  const { notify } = useNotify(); // ✅ FIXED

  useEffect(() => {
    const fetchColleges = async () => {
      if (!search) {
        setResults([]);
        return;
      }

      setLoading(true);

      const { data, error } = await supabase
        .from('colleges')
        .select('*')
        .ilike('name', `%${search}%`)
        .limit(10);

      setLoading(false);

      if (!error && data) {
        setResults(data);
      }
    };

    fetchColleges();
  }, [search]);

  const handleSelect = (college: College) => {
    setSelected(college);
    setSearch(college.name);
    setResults([]);
    onSelect(college);
  };

  const handleRequestCollege = async () => {
    if (!search.trim()) return;

    const {
  data: { session },
} = await supabase.auth.getSession()

const user = session?.user

    if (!user) return;

    // 🔒 prevent duplicate request
    const { data: existing } = await supabase
      .from('college_requests')
      .select('id')
      .eq('requested_by', user.id)
      .ilike('name', search)
      .maybeSingle();

    if (existing) {
      notify('Already requested 👍');
      return;
    }

    // ✅ insert request
    const { error } = await supabase
      .from('college_requests')
      .insert({
        name: search,
        requested_by: user.id,
        status: 'pending',
      });

    if (error) {
      notify('Failed to send request ❌');
      return;
    }

    notify('🎓 College request sent!');

    // ✨ UX cleanup
    setSearch('');
    setResults([]);
    setSelected(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <input
  type="search"
  name="college-search"
  placeholder="Search college..."
  value={search}
  onChange={(e) => {
    setSearch(e.target.value)
    setSelected(null)
  }}
  autoComplete="off"
  autoCorrect="off"
  autoCapitalize="words"
  spellCheck={false}
  enterKeyHint="search"
  data-form-type="other"
  style={{
    padding: '10px 12px',

    borderRadius: 12,

    border: '1px solid #E5E7EB',

    fontSize: 14,

    width: '100%',

    outline: 'none',

    boxSizing: 'border-box',

    WebkitAppearance: 'none',

    transition:
      'border-color .18s ease, box-shadow .18s ease',
  }}
/>

      {/* Results */}
      {results.length > 0 && (
        <div
          style={{
            border: '1px solid #E5E7EB',
            borderRadius: 12,
            maxHeight: '150px',
            overflowY: 'auto',
            background: '#fff',
          }}
        >
          {results.map((college) => (
            <div
              key={college.id}
              style={{
                padding: '10px 12px',
                cursor: 'pointer',
                borderBottom: '1px solid #F3F4F6',
              }}
              onClick={() => handleSelect(college)}
            >
              {college.name}
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {search && results.length === 0 && !selected && !loading && (
        <div
          style={{
            marginTop: 6,
            padding: 12,
            borderRadius: 12,
            background: '#FEF3C7',
            fontSize: 13,
            textAlign: 'center',
          }}
        >
          <div style={{ marginBottom: 6 }}>
            No results found
          </div>

          <button
            onClick={handleRequestCollege}
            style={{
              border: 'none',
              background: 'transparent',
              fontWeight: 600,
              cursor: 'pointer',
              color: '#92400E',
            }}
          >
            Can’t find your college? Request
          </button>
        </div>
      )}
    </div>
  );
}