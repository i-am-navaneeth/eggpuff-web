export const metadata = {
  title: 'Contact – EggPuff',
}

export default function ContactPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#FFFFFF',
        padding: '64px 24px',
      }}
    >
      <div
        style={{
          maxWidth: 760,
          margin: '0 auto',
        }}
      >
        {/* Header */}

        <h1
          style={{
            fontSize: 46,
            fontWeight: 800,
            letterSpacing: '-1.5px',
            color: '#111827',
            marginBottom: 18,
          }}
        >
          Contact EggPuff
        </h1>

        <p
          style={{
            fontSize: 19,
            lineHeight: 1.8,
            color: '#6B7280',
            maxWidth: 620,
            marginBottom: 56,
          }}
        >
          We'd love to hear from you.
          Whether you're a student, college, organization,
          or simply curious about EggPuff, feel free to reach out.
        </p>

        {/* Support */}

        <section
          style={{
            border: '1px solid #E5E7EB',
            borderRadius: 20,
            padding: 28,
            marginBottom: 26,
          }}
        >
          <h2
            style={{
              fontSize: 28,
              fontWeight: 700,
              marginBottom: 12,
            }}
          >
            Student Support
          </h2>

          <p
            style={{
              color: '#6B7280',
              lineHeight: 1.8,
              marginBottom: 16,
            }}
          >
            Need help with your account, reporting a bug,
            payments, or anything related to EggPuff?
          </p>

          <a
            href="mailto:support@eggpuff.in"
            style={{
              color: '#D97706',
              fontWeight: 700,
              textDecoration: 'none',
              fontSize: 18,
            }}
          >
            support@eggpuff.in
          </a>
        </section>

        {/* Colleges */}

        <section
          style={{
            border: '1px solid #E5E7EB',
            borderRadius: 20,
            padding: 28,
            marginBottom: 26,
          }}
        >
          <h2
            style={{
              fontSize: 28,
              fontWeight: 700,
              marginBottom: 12,
            }}
          >
            Colleges & Universities
          </h2>

          <p
            style={{
              color: '#6B7280',
              lineHeight: 1.8,
            }}
          >
            Interested in bringing EggPuff to your campus,
            collaborating with us, or verifying your institution?
            We'd be happy to hear from you.
          </p>
        </section>

        {/* Partnerships */}

        <section
          style={{
            border: '1px solid #E5E7EB',
            borderRadius: 20,
            padding: 28,
            marginBottom: 26,
          }}
        >
          <h2
            style={{
              fontSize: 28,
              fontWeight: 700,
              marginBottom: 12,
            }}
          >
            Partnerships
          </h2>

          <p
            style={{
              color: '#6B7280',
              lineHeight: 1.8,
            }}
          >
            We're always interested in partnering with student clubs,
            creators, communities, startups, and organizations that
            share our vision of helping students learn, connect,
            and grow together.
          </p>
        </section>

        {/* Press */}

        <section
          style={{
            border: '1px solid #E5E7EB',
            borderRadius: 20,
            padding: 28,
          }}
        >
          <h2
            style={{
              fontSize: 28,
              fontWeight: 700,
              marginBottom: 12,
            }}
          >
            Press & General Enquiries
          </h2>

          <p
            style={{
              color: '#6B7280',
              lineHeight: 1.8,
              marginBottom: 18,
            }}
          >
            For media requests, interviews, business enquiries,
            or anything else, please email us.
          </p>

          <a
            href="mailto:support@eggpuff.in"
            style={{
              color: '#D97706',
              fontWeight: 700,
              textDecoration: 'none',
              fontSize: 18,
            }}
          >
            support@eggpuff.in
          </a>
        </section>

        {/* Footer */}

        <div
          style={{
            marginTop: 56,
            paddingTop: 28,
            borderTop: '1px solid #E5E7EB',
          }}
        >
          <p
            style={{
              color: '#9CA3AF',
              lineHeight: 1.8,
              fontSize: 15,
            }}
          >
            We usually reply within <strong>24–48 hours</strong>.
            <br />
            Thank you for helping us build a better campus community.
          </p>
        </div>
      </div>
    </main>
  )
}