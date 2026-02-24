import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      navigate('/timetable');
    }
  }, [session, navigate]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password 
        });
        if (error) throw error;
        alert("Account created! You can now log in.");
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ 
          email, 
          password 
        });
        if (error) throw error;
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      if (error) throw error;
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '80px auto', padding: '40px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', borderRadius: '15px', backgroundColor: '#fff' }}>
      <h2 style={{ color: '#333', marginBottom: '10px' }}>
        {isSignUp ? 'Join ScholarHuddle' : 'ScholarHuddle Login'}
      </h2>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        {isSignUp ? 'Create an account to start tracking.' : 'Welcome back!'}
      </p>
      
      <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input 
          type="email" placeholder="Email Address" value={email} 
          onChange={(e) => setEmail(e.target.value)} required 
          style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
        />
        <input 
          type="password" placeholder="Password" value={password} 
          onChange={(e) => setPassword(e.target.value)} required 
          style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
        />
        <button 
          type="submit" disabled={loading}
          style={{ padding: '14px', backgroundColor: isSignUp ? '#007bff' : '#28a745', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Login')}
        </button>
      </form>

      <div style={{ margin: '25px 0', display: 'flex', alignItems: 'center', color: '#888' }}>
        <div style={{ flex: 1, height: '1px', backgroundColor: '#eee' }}></div>
        <span style={{ margin: '0 10px', fontSize: '14px' }}>OR</span>
        <div style={{ flex: 1, height: '1px', backgroundColor: '#eee' }}></div>
      </div>

      <button 
        onClick={handleGoogleLogin}
        style={{ width: '100%', padding: '12px', backgroundColor: '#fff', color: '#555', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
      >
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width="18"/>
        Continue with Google
      </button>

      <p style={{ marginTop: '25px', fontSize: '14px', color: '#555' }}>
        {isSignUp ? "Already have an account?" : "New to ScholarHuddle?"}{' '}
        <span 
          onClick={() => setIsSignUp(!isSignUp)} 
          style={{ color: '#007bff', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {isSignUp ? 'Log in here' : 'Create an account'}
        </span>
      </p>
    </div>
  );
}

export default Login;