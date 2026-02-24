import { supabase } from '../config/supabaseClient.js';

/**
 * Express middleware to check for a valid Supabase JWT.
 * If valid, it attaches the user object to req.user.
 * If invalid, it sends a 401 Unauthorized response.
 */
export const authMiddleware = async (req, res, next) => {
  // 1. Get the token from the "Authorization" header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided.' });
  }

  const token = authHeader.split(' ')[1]; // "Bearer TOKEN" -> "TOKEN"

  // 2. Verify the token with Supabase
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error) {
    console.error('Token validation error:', error.message);
    return res.status(401).json({ error: 'Invalid token.' });
  }

  if (!user) {
    return res.status(401).json({ error: 'User not found.' });
  }

  // 3. Attach user to the request and proceed
  req.user = user;
  next(); // Go to the next function (e.g., the controller)
};