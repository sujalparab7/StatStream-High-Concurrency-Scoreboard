import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser } from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  
  // State management for form inputs and toggles
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle input changes dynamically
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Clear error when user types
  };

  // Submit handler for both Login and Registration
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // Hit the /login endpoint
        const response = await loginUser(formData);
        // Save the JWT token returned by your Go engine
        localStorage.setItem('token', response.data.token);
        navigate('/leaderboard');
      } else {
        // Hit the /register endpoint
        await registerUser(formData);
        // Automatically switch to login mode after successful registration
        setIsLogin(true);
        setError('Account created successfully! Please log in.');
      }
    } catch (err) {
      console.error('Auth Error:', err);
      setError(err.response?.data?.error || 'Authentication failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4 font-sans text-gray-100">
      <div className="w-full max-w-md border border-gray-800 bg-gray-900 p-8 rounded-2xl shadow-2xl">
        
        {/* Branding header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            COMPETITIVE ARENA
          </h1>
          <p className="text-sm text-gray-400 mt-2">
            {isLogin ? 'Sign in to sync your competitive profiles' : 'Create an account to join the ranking'}
          </p>
        </div>

        {/* Error notification banner */}
        {error && (
          <div className={`mb-6 text-sm p-3 rounded-lg border text-center ${
            error.includes('successfully') 
              ? 'bg-emerald-950/50 border-emerald-800 text-emerald-400' 
              : 'bg-rose-950/50 border-rose-800 text-rose-400'
          }`}>
            {error}
          </div>
        )}

        {/* Authentication Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-800 bg-gray-950 px-4 py-3 text-sm text-white focus:border-cyan-500 focus:outline-none transition font-mono"
              placeholder="e.g., tourist"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-800 bg-gray-950 px-4 py-3 text-sm text-white focus:border-cyan-500 focus:outline-none transition font-mono"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 text-sm font-bold text-white hover:from-cyan-400 hover:to-blue-500 transition shadow-lg shadow-cyan-500/10 disabled:opacity-50"
          >
            {loading ? 'Processing Arena Access...' : isLogin ? 'Enter Arena' : 'Register Coder'}
          </button>
        </form>

        {/* Switch between Login and Registration states */}
        <div className="mt-6 text-center text-sm text-gray-400">
          {isLogin ? "New to the platform? " : "Already registered? "}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setFormData({ username: '', password: '' });
            }}
            className="font-semibold text-cyan-400 hover:underline focus:outline-none"
          >
            {isLogin ? 'Create an account' : 'Sign in here'}
          </button>
        </div>

      </div>
    </div>
  );
}