import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-indigo-600">Formly AI</h1>
        <Link
          href="/auth/login"
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          Sign in
        </Link>
      </nav>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <h2 className="text-5xl font-bold text-gray-900 tracking-tight">
          AI-powered forms with
          <span className="text-indigo-600"> weighted insights</span>
        </h2>
        <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
          Create segmented assessments, apply weighting logic, and generate
          actionable insights — all powered by AI.
        </p>
        <div className="mt-10 flex gap-4 justify-center">
          <Link
            href="/auth/login"
            className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            Get started
          </Link>
        </div>
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8 text-left">
          <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
            <h3 className="font-semibold text-gray-900">AI Question Generation</h3>
            <p className="mt-2 text-sm text-gray-600">
              Describe what you need and let AI generate structured question sets
              in seconds.
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
            <h3 className="font-semibold text-gray-900">Segmented Audiences</h3>
            <p className="mt-2 text-sm text-gray-600">
              Assign questions to specific respondent groups and weight their
              responses accordingly.
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
            <h3 className="font-semibold text-gray-900">Weighted Insights</h3>
            <p className="mt-2 text-sm text-gray-600">
              Apply question and segment weights to produce meaningful, actionable
              scoring dashboards.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
