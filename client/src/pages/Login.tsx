import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser, logAuditAction } from '../api';

const Login = () => {
  const [username, setUsername] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      let user;
      if (isLogin) {
        user = await loginUser(username);
      } else {
        user = await registerUser(username, `${username}@test.com`);
      }
      localStorage.setItem('user', JSON.stringify(user));
      await logAuditAction('USER_LOGIN', { userId: user.id, username: user.username });
      navigate('/');
      window.location.reload(); // Quick refresh for navbar
    } catch (err) {
      setError('Failed to authenticate');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">{isLogin ? 'Login' : 'Sign Up'}</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Username or Email</label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">
          {isLogin ? 'Login' : 'Sign Up'}
        </button>
      </form>
      <button
        className="mt-4 text-green-600 hover:underline w-full text-center"
        onClick={() => setIsLogin(!isLogin)}
      >
        {isLogin ? 'Need an account? Sign up' : 'Already have an account? Login'}
      </button>
    </div>
  );
};

export default Login;
