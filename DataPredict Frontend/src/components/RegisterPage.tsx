import { useState } from 'react';
import { Lock, Mail, User } from 'lucide-react';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';

export function RegisterPage() {
    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Verify inputs are inserted
        if (!formData.nom || !formData.prenom || !formData.email || !formData.password || !formData.confirmPassword) {
            toast.error("Veuillez remplir tous les champs");
            return;
        }

        // 2. Verify email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            toast.error("Veuillez entrer une adresse email valide");
            return;
        }

        // 3. Verify password length
        if (formData.password.length < 5) {
            toast.error("Le mot de passe doit contenir au moins 5 caractères");
            return;
        }

        // 4. Verify passwords match
        if (formData.password !== formData.confirmPassword) {
            toast.error("Les mots de passe ne correspondent pas");
            return;
        }

        try {
            // 3. Send to backend
            const response = await fetch('/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nom: formData.nom,
                    prenom: formData.prenom,
                    email: formData.email,
                    password: formData.password,
                }),
            });

            if (response.ok) {
                // Show success toast and navigate
                toast.success("Compte créé avec succès !");
                setTimeout(() => {
                    navigate('/login');
                }, 1500);
            } else {
                // Try to get error message from server
                const errorData = await response.text();
                toast.error(`Erreur lors de l'inscription: ${errorData || response.statusText}`);
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
                        <p className="text-gray-600 -slate-400">Créer un nouveau compte</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 -slate-300 mb-2">Nom</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 -slate-500" size={20} />
                                    <input
                                        type="text"
                                        name="nom"
                                        value={formData.nom}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 -slate-800 border border-gray-200 -slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 -teal-600 text-gray-900 -white placeholder-gray-400 -slate-500 transition-colors"
                                        placeholder="Votre nom"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 -slate-300 mb-2">Prénom</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 -slate-500" size={20} />
                                    <input
                                        type="text"
                                        name="prenom"
                                        value={formData.prenom}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 -slate-800 border border-gray-200 -slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 -teal-600 text-gray-900 -white placeholder-gray-400 -slate-500 transition-colors"
                                        placeholder="Votre prénom"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 -slate-300 mb-2">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 -slate-500" size={20} />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 -slate-800 border border-gray-200 -slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 -teal-600 text-gray-900 -white placeholder-gray-400 -slate-500 transition-colors"
                                    placeholder="votre@email.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 -slate-300 mb-2">Mot de passe</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 -slate-500" size={20} />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 -slate-800 border border-gray-200 -slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 -teal-600 text-gray-900 -white placeholder-gray-400 -slate-500 transition-colors"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 -slate-300 mb-2">Confirmer mot de passe</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 -slate-500" size={20} />
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 -slate-800 border border-gray-200 -slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 -teal-600 text-gray-900 -white placeholder-gray-400 -slate-500 transition-colors"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 mt-6"
                        >
                            S'inscrire
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600 -slate-400">
                            Déjà un compte ?{' '}
                            <Link
                                to="/login"
                                className="text-teal-600 -teal-400 hover:underline font-medium"
                            >
                                Se connecter
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
