import { useEffect, useState } from 'react';
import { getLeaderboard, submitScore } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';

export default function Leaderboard() {
  const navigate = useNavigate();
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Adjusted states to match Go's "language" field
  const [language, setLanguage] = useState('Go');
  const [ratingScore, setRatingScore] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem('token');

  const fetchScores = async () => {
    try {
      const response = await getLeaderboard();
      setScores(response.data || []);
    } catch (error) {
      console.error("Failed to fetch leaderboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScores();
  }, []);

  const handleScoreSubmit = async (e) => {
    e.preventDefault();
    if (!ratingScore) return;

    setSubmitting(true);
    try {
      // Keys now match your Go ScoreInput struct perfectly
      await submitScore({ 
        language: language, 
        score: parseInt(ratingScore, 10) 
      });
      setRatingScore('');
      await fetchScores(); 
    } catch (error) {
      console.error("Failed to submit score:", error);
      alert("Session unauthorized or invalid token. Please log in again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans">
      <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
          COMPETITIVE ARENA
        </h1>
        {token ? (
          <button onClick={handleLogout} className="bg-rose-950/40 hover:bg-rose-900 border border-rose-800/50 text-rose-400 text-sm font-medium px-4 py-2 rounded-lg transition">
            Disconnect Profile
          </button>
        ) : (
          <Link to="/login" className="bg-gray-800 hover:bg-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition">
            Account Login
          </Link>
        )}
      </nav>

      <main className="max-w-4xl mx-auto mt-12 px-4 pb-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Global Leaderboard</h2>
          <p className="text-gray-400 mt-2">Real-time standings based on submission language</p>
        </div>

        {token && (
          <div className="mb-10 p-6 bg-gray-900 border border-gray-800 rounded-xl shadow-xl">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-cyan-400 mb-4">Submit Runtime Performance</h3>
            <form onSubmit={handleScoreSubmit} className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <select 
                  value={language} 
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-sm focus:border-cyan-500 focus:outline-none text-white"
                >
                  <option value="Go">Go</option>
                  <option value="C++">C++</option>
                  <option value="Python">Python</option>
                  <option value="Java">Java</option>
                </select>
              </div>
              <div className="flex-1">
                <input 
                  type="number" 
                  placeholder="Enter Runtime Score" 
                  value={ratingScore}
                  onChange={(e) => setRatingScore(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-sm focus:border-cyan-500 focus:outline-none font-mono text-white"
                  required
                />
              </div>
              <button 
                type="submit" 
                disabled={submitting}
                className="bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold px-6 py-2.5 rounded-lg text-sm transition disabled:opacity-50"
              >
                {submitting ? 'Syncing...' : 'Submit Score'}
              </button>
            </form>
          </div>
        )}

        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
          {loading ? (
            <div className="p-12 text-center text-gray-500">Loading arena data...</div>
          ) : scores.length === 0 ? (
            <div className="p-16 text-center">
              <div className="text-4xl mb-4">🏆</div>
              <p className="text-gray-400 font-medium">The Arena is currently empty.</p>
              <p className="text-sm text-gray-600 mt-1">Log in and submit your runtime performance!</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-850/50 text-xs font-semibold tracking-wider text-gray-400 uppercase">
                  <th className="py-4 px-6 text-center w-20">Rank</th>
                  <th className="py-4 px-6">User ID</th>
                  <th className="py-4 px-6">Language</th>
                  <th className="py-4 px-6 text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {scores.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-850/30 transition">
                    <td className="py-4 px-6 text-center font-bold text-cyan-400">{index + 1}</td>
                    <td className="py-4 px-6 font-medium textwhite">{row.username}</td>
                    <td className="py-4 px-6">
                      <span className="bg-cyan-950/40 text-cyan-400 text-xs px-2.5 py-1 rounded-md font-semibold uppercase border border-cyan-900/30">
                        {row.language}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right font-mono font-bold text-emerald-400">{row.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}