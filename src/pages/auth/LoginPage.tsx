import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Pastikan backend berjalan di port 3000
      const response = await axios.post('http://localhost:3000/api/auth/login', {
        username,
        password,
      });

      const { token, user } = response.data;
      login(token, user);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Terjadi kesalahan saat login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
          WMS Login
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Silakan masuk ke akun Anda
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-200">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md border border-red-200">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700">Username</label>
              <div className="mt-1">
                <input
                  type="text"
                  required
                  className="input-field w-full"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin atau user"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  className="input-field w-full"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="admin atau user"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Masuk...' : 'Masuk'}
              </button>
            </div>
            
            <div className="mt-4 text-xs text-slate-500 text-center">
              Gunakan kredensial dummy: <br/>
              <b>admin / admin</b> atau <b>user / user</b>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
