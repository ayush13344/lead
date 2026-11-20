import { useAuth } from './auth.jsx';
import AuthPage from './pages/AuthPage.jsx';
import LeadsPage from './pages/LeadsPage.jsx';

export default function App() {
  const { user, booting } = useAuth();
  if (booting) return <div className="boot">Brewing your workspace…</div>;
  return user ? <LeadsPage /> : <AuthPage />;
}
