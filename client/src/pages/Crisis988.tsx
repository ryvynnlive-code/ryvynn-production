/**
 * RYVYNN Crisis 988 Page
 * Static, dependency-free crisis resource page
 * Works even if DB/Auth/Stripe/AI fail
 */
export default function Crisis988() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="bg-red-600 text-white py-4 px-6 text-center">
        <h1 className="text-2xl font-bold">988 Suicide & Crisis Lifeline</h1>
        <p className="text-sm mt-1">Free, confidential support 24/7</p>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 space-y-8">
        {/* Call Button */}
        <a
          href="tel:988"
          className="bg-red-600 hover:bg-red-700 text-white text-4xl font-bold py-8 px-16 rounded-2xl shadow-lg transition-all hover:scale-105"
        >
          Call 988
        </a>

        {/* Text Option */}
        <div className="text-center space-y-2">
          <p className="text-gray-400">Or text</p>
          <a
            href="sms:988"
            className="text-3xl font-bold text-primary hover:underline"
          >
            Text 988
          </a>
        </div>

        {/* Chat Option */}
        <div className="text-center space-y-2">
          <p className="text-gray-400">Or chat online</p>
          <a
            href="https://988lifeline.org/chat/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xl text-primary hover:underline"
          >
            988lifeline.org/chat
          </a>
        </div>

        {/* Info */}
        <div className="max-w-md text-center text-gray-400 mt-8 space-y-4">
          <p>
            The 988 Suicide and Crisis Lifeline provides free and confidential
            emotional support to people in suicidal crisis or emotional distress
            24 hours a day, 7 days a week, across the United States.
          </p>
          <p className="text-sm">
            Veterans: Press 1 after dialing 988 for the Veterans Crisis Line
          </p>
          <p className="text-sm">
            Spanish: Press 2 after dialing 988 for Spanish language support
          </p>
        </div>

        {/* Back Link */}
        <a
          href="/"
          className="text-gray-500 hover:text-white mt-8 text-sm"
        >
          ← Return to RYVYNN
        </a>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 py-4 px-6 text-center text-sm text-gray-500">
        <p>
          RYVYNN is a wellness tool, not a medical service. If you are in
          immediate danger, please call 911.
        </p>
      </footer>
    </div>
  );
}
