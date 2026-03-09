import { Navigate } from 'react-router-dom';

// Removed legacy feature. Redirect to the dashboard.
export default function TeamRoom() {
  return <Navigate to="/create-session" replace />;
}
