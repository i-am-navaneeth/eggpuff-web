export default function SupportPage() {
  return (
    <div style={{ maxWidth: 700, margin: '40px auto', padding: 20 }}>
      <h1>Support</h1>

      <p style={{ marginTop: 16 }}>
        If you're facing any issue with:
      </p>

      <ul>
        <li>Payments</li>
        <li>EggPuff balance</li>
        <li>Account login</li>
        <li>Technical errors</li>
      </ul>


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


      <p style={{ marginTop: 12 }}>
        We usually respond within 24–48 hours.
      </p>

      <p style={{ marginTop: 24, opacity: 0.6 }}>
        Thank you for being part of EggPuff 🥐
      </p>
    </div>
  )
}
