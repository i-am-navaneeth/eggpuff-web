export const metadata = {
     title: "Community Guidelines • EggPuff",
};

export default function CommunityGuidelinesPage() {
  return (
    <div
      style={{
        maxWidth: 860,
        margin: '0 auto',
        padding: '56px 24px 80px',
        background: '#FFFFFF',
      }}
    >
      <h1
        style={{
          fontSize: 44,
          fontWeight: 800,
          lineHeight: 1.1,
          letterSpacing: '-1px',
          color: '#111827',
        }}
      >
        Community Guidelines
      </h1>

      <div
        style={{
          marginTop: 18,
          color: '#6B7280',
          fontSize: 14,
          lineHeight: 1.7,
        }}
      >
        <div>
          <strong>Effective date:</strong> July 13, 2026
        </div>

        <div>
          <strong>Last updated:</strong> July 13, 2026
        </div>
      </div>

      <p
        style={{
          marginTop: 28,
          fontSize: 19,
          lineHeight: 1.8,
          color: '#475569',
        }}
      >
        EggPuff exists to help students learn, connect, collaborate, and
        grow within their own college community. These guidelines help keep
        the platform respectful, trustworthy, and safe for everyone.
      </p>

      {/* ---------------- */}

      <Section
        title="1. Respect every student"
        body={
          <>
            Treat others with kindness and respect.
            <br />
            Bullying, harassment, discrimination, hate speech, intimidation,
            threats, or targeted abuse are never allowed.
          </>
        }
      />

      <Section
        title="2. Keep conversations genuine"
        body={
          <>
            Ask honest questions.
            Give genuine answers.
            <br />
            Do not intentionally spread false information, manipulate
            discussions, or post misleading content.
          </>
        }
      />

      <Section
        title="3. No spam or fake engagement"
        body={
          <>
            Don't repeatedly post the same content, create fake accounts,
            artificially increase engagement, or misuse EggPuff Points.
            Communities should stay useful—not noisy.
          </>
        }
      />

      <Section
        title="4. Protect everyone's privacy"
        body={
          <>
            Never share someone else's private information without permission,
            including phone numbers, addresses, student IDs, emails, private
            chats, or personal photos.
          </>
        }
      />

      <Section
        title="5. No impersonation"
        body={
          <>
            Do not pretend to be another student, college representative,
            organization, faculty member, or the EggPuff team.
          </>
        }
      />

      <Section
        title="6. Keep your college community relevant"
        body={
          <>
            Stay on topic.
            Communities should focus on meaningful discussions, learning,
            events, opportunities, projects, clubs, placements, friendships,
            and campus life.
          </>
        }
      />

      <Section
        title="7. Academic integrity"
        body={
          <>
            EggPuff supports learning—not cheating.
            <br />
            Do not share exam leaks, cheating services, forged attendance,
            fake certificates, or other dishonest academic material.
          </>
        }
      />

      <Section
        title="8. Illegal or harmful content"
        body={
          <>
            Content involving illegal activities, violence, terrorism,
            exploitation, scams, fraud, or anything that may harm individuals
            or communities is strictly prohibited.
          </>
        }
      />

      <Section
        title="9. Respect intellectual property"
        body={
          <>
            Only share content that you own or have permission to share.
            Respect copyrights, trademarks, and the work of other creators.
          </>
        }
      />

      <Section
        title="10. Responsible promotion"
        body={
          <>
            Promoting your projects, startups, portfolios, communities, or
            opportunities is welcome when relevant. Excessive advertising,
            deceptive promotions, or repeated self-promotion may be removed.
          </>
        }
      />

      <Section
        title="11. Report problems"
        body={
          <>
            If you notice spam, harassment, fake accounts, scams, or other
            rule violations, please report them. Community safety is a shared
            responsibility.
          </>
        }
      />

      <Section
        title="12. Enforcement"
        body={
          <>
            EggPuff may review reported content and take appropriate action,
            including removing content, limiting features, suspending
            communities, temporarily restricting accounts, or permanently
            removing accounts that repeatedly or seriously violate these
            guidelines.
          </>
        }
      />

      <Section
        title="13. Updates to these Guidelines"
        body={
          <>
            As EggPuff evolves, these Community Guidelines may be updated to
            reflect new features, improve community safety, or comply with
            applicable laws. Continued use of EggPuff means you agree to the
            latest version.
          </>
        }
      />

      <div
        style={{
          marginTop: 70,
          paddingTop: 24,
          borderTop: '1px solid #E5E7EB',
        }}
      >
        <p
          style={{
            color: '#64748B',
            lineHeight: 1.8,
            fontSize: 16,
          }}
        >
          Our goal isn't to punish students—it's to build a campus where
          everyone feels comfortable asking questions, helping others, making
          friends, and discovering opportunities.
        </p>
      </div>
    </div>
  )
}

function Section({
  title,
  body,
}: {
  title: string
  body: React.ReactNode
}) {
  return (
    <section style={{ marginTop: 48 }}>
      <h2
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: '#111827',
          marginBottom: 16,
        }}
      >
        {title}
      </h2>

      <div
        style={{
          color: '#475569',
          fontSize: 18,
          lineHeight: 1.9,
        }}
      >
        {body}
      </div>
    </section>
  )
}