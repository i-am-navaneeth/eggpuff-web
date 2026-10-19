'use client'

import Link from 'next/link'

export default function CompleteProfilePrompt() {
  const textColor = '#171717'
  const mutedColor = '#737373'
  const borderColor = '#E9E5DE'
  const accentColor = '#F4B860'

  const checklistItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    minWidth: 0,
  } as const

  const iconBoxStyle = {
    width: '42px',
    height: '42px',
    minWidth: '42px',
    borderRadius: '13px',
    background: '#FFF0D5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '21px',
  } as const

  return (
    <section
      aria-labelledby="complete-profile-title"
      style={{
        width: '100%',
        boxSizing: 'border-box',
        padding: '18px',
        borderRadius: '22px',
        border: `1px solid ${borderColor}`,
        background: '#FFFFFF',
        color: textColor,
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
        boxShadow: '0 3px 14px rgba(35, 27, 12, 0.035)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '13px',
        }}
      >
        <div
          style={{
            ...iconBoxStyle,
            width: '50px',
            height: '50px',
            minWidth: '50px',
            borderRadius: '16px',
            fontSize: '25px',
          }}
          aria-hidden="true"
        >
          🎓
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h3
            id="complete-profile-title"
            style={{
              margin: '0 0 5px',
              fontSize: 'clamp(17px, 4.2vw, 20px)',
              fontWeight: 800,
              letterSpacing: '-0.45px',
              lineHeight: 1.25,
              color: textColor,
            }}
          >
            Make EggPuff yours ✨
          </h3>

          <p
            style={{
              margin: 0,
              fontSize: '13px',
              lineHeight: 1.55,
              color: mutedColor,
            }}
          >
            A couple of details and you’re ready to
            connect with your campus.
          </p>
        </div>
      </div>

      {/* Profile checklist */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          padding: '15px',
          borderRadius: '17px',
          border: '1px solid #F0E9DE',
          background: '#FFFCF6',
        }}
      >
        <div style={checklistItemStyle}>
          <div style={iconBoxStyle} aria-hidden="true">
            🏫
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                margin: '0 0 4px',
                fontSize: '14px',
                fontWeight: 750,
                lineHeight: 1.35,
                color: textColor,
              }}
            >
              Add your college
            </p>

            <p
              style={{
                margin: 0,
                fontSize: '12px',
                lineHeight: 1.45,
                color: mutedColor,
              }}
            >
              Find students from your campus.
            </p>
          </div>

          <span
            aria-hidden="true"
            style={{
              width: '19px',
              height: '19px',
              minWidth: '19px',
              border: '1.8px solid #D5C6AD',
              borderRadius: '50%',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div
          style={{
            height: '1px',
            background: '#EEE5D7',
            marginLeft: '54px',
          }}
        />

        <div style={checklistItemStyle}>
          <div style={iconBoxStyle} aria-hidden="true">
            📅
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                margin: '0 0 4px',
                fontSize: '14px',
                fontWeight: 750,
                lineHeight: 1.35,
                color: textColor,
              }}
            >
              Add your batch year
            </p>

            <p
              style={{
                margin: 0,
                fontSize: '12px',
                lineHeight: 1.45,
                color: mutedColor,
              }}
            >
              Connect with students in your year.
            </p>
          </div>

          <span
            aria-hidden="true"
            style={{
              width: '19px',
              height: '19px',
              minWidth: '19px',
              border: '1.8px solid #D5C6AD',
              borderRadius: '50%',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* Primary action */}
      <Link
        href="/profile"
        style={{
          minHeight: '49px',
          padding: '0 16px',
          borderRadius: '15px',
          background: accentColor,
          color: '#241A0B',
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '9px',
          fontSize: '14px',
          fontWeight: 800,
          letterSpacing: '-0.1px',
          boxSizing: 'border-box',
          boxShadow: '0 3px 0 rgba(166, 105, 24, 0.10)',
          transition:
            'background 0.18s ease, transform 0.18s ease',
        }}
      >
        Complete your profile
        <span
          aria-hidden="true"
          style={{ fontSize: '17px', lineHeight: 1 }}
        >
          →
        </span>
      </Link>
    </section>
  )
}