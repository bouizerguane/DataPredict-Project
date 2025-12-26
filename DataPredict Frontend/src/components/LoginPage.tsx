import { useState } from 'react';
import { Lock, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validation
    if (!email || !password) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Veuillez entrer une adresse email valide");
      return;
    }

    try {
      // 2. API Call
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        // Backend returns raw string token, not JSON
        const token = await response.text();
        if (token) {
          localStorage.setItem('token', token);

          // Store user info (extract from email for now, or fetch from API)
          const username = email.split('@')[0] || 'Utilisateur';
          const userInfo = {
            username: username.charAt(0).toUpperCase() + username.slice(1),
            email: email,
            role: 'Admin'
          };
          localStorage.setItem('user', JSON.stringify(userInfo));
        }

        // 3. Success
        toast.success("Bienvenue !");

        // Short delay to let user see the toast before redirecting
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        // 4. Error
        toast.error("Email ou mot de passe incorrect");
      }
    } catch (error) {
      console.error(error);
      toast.error("Impossible de contacter le serveur");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 -slate-950 -slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white -slate-900 rounded-2xl shadow-2xl p-8 border border-gray-200 -slate-800">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-transparent mb-2">
              DataPredict
            </h1>
            <p className="text-gray-600 -slate-400">Plateforme d'apprentissage automatique</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 -slate-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 -slate-500" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 -slate-800 border border-gray-200 -slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 -teal-600 text-gray-900 -white placeholder-gray-400 -slate-500 transition-colors"
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 -slate-300 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 -slate-500" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 -slate-800 border border-gray-200 -slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 -teal-600 text-gray-900 -white placeholder-gray-400 -slate-500 transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Se connecter
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 -slate-400">
              Pas encore de compte ?{' '}
              <Link
                to="/register"
                className="text-teal-600 -teal-400 hover:underline font-medium"
              >
                S'inscrire
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
