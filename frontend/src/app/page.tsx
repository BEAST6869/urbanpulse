import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <main className="text-center max-w-2xl mx-auto">
        <h1 className="text-6xl font-bold text-gray-900 mb-6">
          UrbanPulse
        </h1>
        <p className="text-2xl text-gray-700 mb-12">
          Report issues instantly
        </p>
        <Link 
          href="/report"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg text-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
        >
          Report an Issue
        </Link>
        <div className="mt-16 text-gray-600">
          <p className="text-lg">Help improve your community by reporting infrastructure issues</p>
        </div>
      </main>
    </div>
  );
}
