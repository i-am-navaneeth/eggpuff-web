export default function WhatIsEggPuff() {
  return (
    <main className="min-h-screen bg-white text-black px-6 py-16">

      <div className="max-w-3xl mx-auto">

        {/* TITLE */}
        <h1 className="text-4xl font-bold mb-6">
          What is EggPuff?
        </h1>

        <p className="text-lg text-gray-600 mb-10">
          EggPuff is a campus-based platform where students can ask questions,
          connect with others, and grow together — all within their own college.
        </p>

        {/* WHY */}
        <h2 className="text-2xl font-semibold mb-4">
          Why students need EggPuff
        </h2>

        <p className="text-gray-600 mb-8">
          In college, students often struggle to find the right information,
          the right people, or even the right opportunities. Most platforms are
          too broad, filled with strangers, or not relevant to campus life.
        </p>

        <p className="text-gray-600 mb-10">
          EggPuff focuses only on your college — making everything more relevant,
          faster, and more useful.
        </p>

        {/* WHAT YOU CAN DO */}
        <h2 className="text-2xl font-semibold mb-4">
          What you can do on EggPuff
        </h2>

        <ul className="space-y-3 text-gray-700 mb-10">
          <li>• Ask questions to your campus</li>
          <li>• Get answers from real students</li>
          <li>• Find people with similar interests</li>
          <li>• Discover opportunities and resources</li>
          <li>• Connect with your college community</li>
        </ul>

        {/* DIFFERENCE */}
        <h2 className="text-2xl font-semibold mb-4">
          What makes EggPuff different
        </h2>

        <p className="text-gray-600 mb-10">
          Unlike traditional social platforms, EggPuff is limited to your campus.
          This means every interaction is more meaningful, relevant, and real.
        </p>

        {/* CTA */}
        <div className="mt-12">
          <a
            href="/"
            className="inline-block bg-black text-white px-6 py-3 rounded-lg font-medium"
          >
            Go to EggPuff
          </a>
        </div>

      </div>

    </main>
  )
}