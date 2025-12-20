/**
 * RYVYNN Crisis 911 Page
 * Static, dependency-free emergency resource page
 * Works even if DB/Auth/Stripe/AI fail
 */
export default function Crisis911() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="bg-red-700 text-white py-4 px-6 text-center">
        <h1 className="text-2xl font-bold">Emergency Services</h1>
        <p className="text-sm mt-1">For immediate danger or medical emergencies</p>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 space-y-8">
        {/* Call Button */}
        <a
          href="tel:911"
          className="bg-red-700 hover:bg-red-800 text-white text-5xl font-bold py-10 px-20 rounded-2xl shadow-lg transition-all hover:scale-105"
        >
          Call 911
        </a>

        {/* When to Call */}
        <div className="max-w-md text-center space-y-4 mt-8">
          <h2 className="text-xl font-bold text-red-500">Call 911 if:</h2>
          <ul className="text-gray-300 space-y-2 text-left">
            <li>• You or someone else is in immediate physical danger</li>
            <li>• There is a medical emergency</li>
            <li>• Someone has harmed themselves or is about to</li>
            <li>• You witness a crime in progress</li>
            <li>• There is a fire or other emergency</li>
          </ul>
        </div>

        {/* Alternative Resources */}
        <div className="max-w-md text-center space-y-4 mt-8 p-6 bg-gray-900 rounded-xl">
          <h2 className="text-lg font-bold">Not an emergency?</h2>
          <div className="space-y-3">
            <a
              href="/988"
              className="block text-primary hover:underline"
            >
              988 - Suicide & Crisis Lifeline
            </a>
            <a
              href="/crisis"
              className="block text-primary hover:underline"
            >
              View all crisis resources
            </a>
          </div>
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
          RYVYNN is a wellness tool, not a medical service. For emergencies,
          always call 911 or your local emergency number.
        </p>
      </footer>
    </div>
  );
}
