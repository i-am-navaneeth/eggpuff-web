export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: 800, margin: '40px auto', padding: 20 }}>
      <h1>Privacy Policy</h1>

      <p style={{ marginTop: 12 }}>
        Last updated: {new Date().toLocaleDateString()}
      </p>

      <h3 style={{ marginTop: 24 }}>1. Information We Collect</h3>
      <p>
        EggPuff collects basic account information such as your email
        address, questions you post, and payment
        reference details (UTR) when you purchase EggPuffs.
      </p>

      <h3 style={{ marginTop: 24 }}>2. How We Use Your Information</h3>
      <p>
        We use your information to:
      </p>
      <ul>
        <li>Provide access to the platform</li>
        <li>Manage rewards and EggPuff balance</li>
        <li>Verify payments</li>
        <li>Improve user experience</li>
      </ul>

      <h3 style={{ marginTop: 24 }}>3. Data Storage</h3>
      <p>
        All data is securely stored using Supabase infrastructure.
        We do not sell or share your personal information with third parties.
      </p>

      <h3 style={{ marginTop: 24 }}>4. Payments</h3>
      <p>
        When you submit a payment, only your UTR reference number is stored
        for manual verification purposes.
      </p>

      <h3 style={{ marginTop: 24 }}>5. Contact Us</h3>
      <p>
        If you have questions about this Privacy Policy, contact us at:
        <br />
        <p style={{ marginTop: 12 }}>
  📩 Contact us at{' '}
  <a
    href="mailto:support@eggpuff.in"
    style={{
      color: '#F4B860',
      fontWeight: 600,
      textDecoration: 'none',
    }}
  >
    support@eggpuff.in
  </a>
</p>

      </p>
    </div>
  )
}
