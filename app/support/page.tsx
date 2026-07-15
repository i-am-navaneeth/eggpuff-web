export const metadata = {
   title: "Support • EggPuff",
};

export default function SupportPage() {
  return (
    <div
      style={{
        maxWidth: 760,
        margin: '0 auto',
        padding: '25px 24px 80px',
        background: '#FFFFFF',
      }}
    >
      <h1
        style={{
          fontSize: 44,
          fontWeight: 800,
          letterSpacing: '-1px',
          color: '#111827',
        }}
      >
        Support
      </h1>

      <p
        style={{
          marginTop: 22,
          fontSize: 19,
          lineHeight: 1.8,
          color: '#475569',
        }}
      >
        Need help? We're here for you.
        <br />
        If something isn't working as expected, we'll do our best to help you
        as quickly as possible.
      </p>

      {/* What we can help with */}

      <div
        style={{
          marginTop: 42,
          padding: 28,
          borderRadius: 18,
          background: '#F8FAFC',
          border: '1px solid #E5E7EB',
        }}
      >
        <h2
          style={{
            fontSize: 24,
            fontWeight: 700,
            marginBottom: 18,
            color: '#111827',
          }}
        >
          We can help with
        </h2>

        <ul
          style={{
            margin: 0,
            paddingLeft: 22,
            color: '#475569',
            lineHeight: 2,
            fontSize: 17,
          }}
        >
          <li>Account login or sign-in issues</li>
          <li>Bug reports and technical problems</li>
          <li>Questions about your account</li>
          <li>Community or safety concerns</li>
          <li>Reporting inappropriate content or users</li>
          <li>EggPuff Points or future payment-related questions</li>
          <li>General feedback and feature suggestions</li>
        </ul>
      </div>

      {/* Contact */}

      <div
        style={{
          marginTop: 42,
          padding: 28,
          borderRadius: 18,
          background: '#FFF8ED',
          border: '1px solid #FDE7B0',
        }}
      >
        <h2
          style={{
            fontSize: 24,
            fontWeight: 700,
            marginBottom: 12,
            color: '#111827',
          }}
        >
          Contact us
        </h2>

        <p
          style={{
            color: '#475569',
            lineHeight: 1.8,
            fontSize: 17,
            marginBottom: 18,
          }}
        >
          Send us an email anytime and include as much detail as possible so we
          can help faster.
        </p>

        <a
          href="mailto:support@eggpuff.in"
          style={{
            display: 'inline-block',
            color: '#D97706',
            fontWeight: 700,
            fontSize: 18,
            textDecoration: 'none',
          }}
        >
          support@eggpuff.in
        </a>

        <p
          style={{
            marginTop: 20,
            color: '#64748B',
            fontSize: 15,
          }}
        >
          Typical response time: <strong>within 24–48 hours.</strong>
        </p>
      </div>

      {/* Footer note */}

      <div
        style={{
          marginTop: 52,
          paddingTop: 24,
          borderTop: '1px solid #E5E7EB',
        }}
      >
        <p
          style={{
            color: '#64748B',
            fontSize: 16,
            lineHeight: 1.8,
          }}
        >
          We're continuously improving EggPuff. Every bug report, suggestion,
          and piece of feedback helps us build a better experience for students.
          Thank you for being part of our journey.
        </p>
      </div>
    </div>
  )
}