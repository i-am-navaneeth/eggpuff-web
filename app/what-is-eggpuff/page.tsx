export const metadata = {
  title: "What is EggPuff? • EggPuff",
}

export default function WhatIsEggPuff() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="max-w-3xl mx-auto px-6 py-16">

        {/* HERO */}

        <h1 className="text-5xl font-bold tracking-tight leading-tight">
          What is EggPuff?
        </h1>

        <p className="mt-6 text-xl leading-9 text-gray-600">
          EggPuff is a campus community built exclusively for college students.
          It's a place where students ask questions, help each other,
          discover opportunities, and build meaningful connections—
          all within their own college.
        </p>

        <div className="mt-12 h-px bg-gray-200" />

        {/* WHY */}

        <section className="mt-14">

          <h2 className="text-3xl font-bold">
            Why EggPuff exists
          </h2>

          <p className="mt-6 text-lg leading-8 text-gray-600">
            College is full of opportunities.
            But most students never discover them.
          </p>

          <p className="mt-5 text-lg leading-8 text-gray-600">
            Useful notes stay inside small friend groups.
            Seniors have valuable advice that juniors never hear.
            Students struggle to find teammates,
            internships,
            events,
            clubs,
            and people who share their interests.
          </p>

          <p className="mt-5 text-lg leading-8 text-gray-600">
            We believe knowledge and opportunities should travel across the
            entire campus—not just small circles.
          </p>

        </section>

        {/* WHAT YOU CAN DO */}

        <section className="mt-16">

          <h2 className="text-3xl font-bold">
            What you can do
          </h2>

          <div className="mt-8 space-y-5">

            <Item
              title="Ask your campus"
              text="Get answers from students who have already experienced it."
            />

            <Item
              title="Help others"
              text="Share your knowledge and build your reputation."
            />

            <Item
              title="Find your people"
              text="Meet classmates with similar interests, goals, and passions."
            />

            <Item
              title="Discover opportunities"
              text="Explore internships, hackathons, clubs, events, and more."
            />

            <Item
              title="Grow together"
              text="Learn from students and contribute back to your community."
            />

          </div>

        </section>

        {/* DIFFERENCE */}

        <section className="mt-16">

          <h2 className="text-3xl font-bold">
            What makes EggPuff different?
          </h2>

          <p className="mt-6 text-lg leading-8 text-gray-600">
            Most social platforms connect you with the entire internet.
            EggPuff connects you with your own campus.
          </p>

          <p className="mt-5 text-lg leading-8 text-gray-600">
            That means conversations are more relevant,
            answers are more trustworthy,
            and connections become meaningful because you're interacting with
            students who actually share your college experience.
          </p>

        </section>

        {/* MISSION */}

        <section className="mt-16">

          <h2 className="text-3xl font-bold">
            Our mission
          </h2>

          <p className="mt-6 text-lg leading-8 text-gray-600">
            To help every student learn,
            connect,
            and grow through meaningful campus conversations.
          </p>

          <p className="mt-5 text-lg leading-8 text-gray-600">
            We want every student to have easier access to knowledge,
            friendships,
            opportunities,
            and communities that help shape their college journey.
          </p>

        </section>

        {/* STORY */}

        <section className="mt-16">

          <h2 className="text-3xl font-bold">
            Our story
          </h2>

          <p className="mt-6 text-lg leading-8 text-gray-600">
            EggPuff was founded by
            <strong> Navaneeth Kumar Sivakoti </strong>
            after noticing how much valuable knowledge remained trapped inside
            small friend groups instead of reaching every student.
          </p>

          <p className="mt-5 text-lg leading-8 text-gray-600">
            Every campus already has brilliant students,
            experienced seniors,
            exciting clubs,
            and amazing opportunities.
            The challenge isn't creating them—
            it's helping students discover them.
          </p>

          <p className="mt-5 text-lg leading-8 text-gray-600">
            EggPuff was created to bridge that gap.
          </p>

        </section>

        {/* FUTURE */}

        <section className="mt-16">

          <h2 className="text-3xl font-bold">
            Looking ahead
          </h2>

          <p className="mt-6 text-lg leading-8 text-gray-600">
            We're building more than another social platform.
          </p>

          <p className="mt-5 text-lg leading-8 text-gray-600">
            Our vision is to become the digital layer of every college—
            where students naturally discover knowledge,
            opportunities,
            communities,
            and lifelong friendships throughout their educational journey.
          </p>

        </section>

        {/* CONTACT */}

        <section className="mt-16">

          <h2 className="text-3xl font-bold">
            Contact us
          </h2>

          <p className="mt-6 text-lg leading-8 text-gray-600">
            We'd love to hear from students,
            educators,
            organizations,
            and anyone who shares our vision.
          </p>

          <a
            href="mailto:support@eggpuff.in"
            className="inline-block mt-6 text-lg font-semibold underline"
          >
            support@eggpuff.in
          </a>

        </section>

        {/* CTA */}

        <div className="mt-20 border-t border-gray-200 pt-12 text-center">

          <h2 className="text-3xl font-bold">
            Ready to join your campus?
          </h2>

          <p className="mt-4 text-gray-600 text-lg">
            Meet students. Share knowledge. Grow together.
          </p>

          <a
            href="/login"
            className="inline-block mt-8 rounded-xl bg-black px-8 py-4 text-white font-semibold transition hover:bg-gray-900"
          >
            Join EggPuff
          </a>

        </div>

      </div>
    </main>
  )
}

function Item({
  title,
  text,
}: {
  title: string
  text: string
}) {
  return (
    <div className="rounded-2xl border border-gray-200 p-6">
      <h3 className="font-semibold text-xl">
        {title}
      </h3>

      <p className="mt-2 text-gray-600 leading-7">
        {text}
      </p>
    </div>
  )
}