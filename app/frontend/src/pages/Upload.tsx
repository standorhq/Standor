import { Navigate } from 'react-router-dom';

// Removed legacy feature. Redirect to create-session.
export default function Upload() {
  return <Navigate to="/create-session" replace />;
}
