import { Download, Package, Code, FileJson, CheckCircle, ArrowLeft, Copy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWorkflow } from '../context/WorkflowContext';
import { useState } from 'react';
import { toast } from 'sonner';

export function Export() {
    const navigate = useNavigate();
    const { state } = useWorkflow();
    const { trainingResults } = state;
    const [copiedCode, setCopiedCode] = useState(false);

    if (!state.datasetId || !trainingResults) {
        return (
            <div className="text-gray-900 -white flex flex-col items-center justify-center p-20 h-96 bg-white rounded-xl border border-gray-200 -slate-800">
                <Package size={48} className="text-gray-900 -white text-gray-300 mb-4" />
                <h3 className="text-gray-900 -white text-xl font-medium text-gray-700 -slate-300 -slate-300">Exportation impossible</h3>
                <p className="text-gray-900 -white text-gray-500 mt-2 text-center max-w-sm">
                    Aucun modèle n'est prêt pour l'exportation. Terminez d'abord l'entraînement.
                </p>
                <button
                    onClick={() => navigate('/import')}
                    className="text-gray-900 -white mt-6 px-6 py-3 bg-[#1E293B] text-white rounded-lg"
                >
                    Nouveau projet
                </button>
            </div>
        );
    }

    const { bestModel } = trainingResults;

    const handleDownloadModel = async (format: string) => {
        try {
            // Call backend to prepare export
            const response = await fetch(`/api/training/export/1?format=${format}`); // Hardcoded ID for demo
            if (response.ok) {
                const data = await response.json();
                toast.success(`Préparation de l'export ${format.toUpperCase()}...`);

                // Simulate download from backend URL
                setTimeout(() => {
                    const element = document.createElement('a');
                    const file = new Blob([`Model Export Data\nTarget: ${data.downloadUrl}`], { type: 'text/plain' });
                    element.href = URL.createObjectURL(file);
                    element.download = `${bestModel.toLowerCase()}_model.${format}`;
                    document.body.appendChild(element);
                    element.click();
                    document.body.removeChild(element);
                    toast.success(`Modèle téléchargé via le backend`);
                }, 1000);
            }
        } catch (e) {
            console.error("Export failed", e);
            toast.error("Erreur lors de l'exportation");
        }
    };

    const pythonCode = `# Code Python pour utiliser le modèle ${bestModel}
import joblib
import pandas as pd

# Charger le modèle
model = joblib.load('${bestModel.toLowerCase()}_model.pkl')

# Préparer vos données
data = pd.DataFrame({
    'surface': [120],
    'age': [5],
    'localisation': [1],
    'chambres': [3],
    'étage': [2]
})

# Faire une prédiction
prediction = model.predict(data)
print(f"Prédiction: {prediction[0]}")`;

    const handleCopyCode = () => {
        navigator.clipboard.writeText(pythonCode);
        setCopiedCode(true);
        toast.success('Code copié dans le presse-papiers');
        setTimeout(() => setCopiedCode(false), 2000);
    };

    const exportOptions = [
        {
            title: 'Format PKL (Pickle)',
            description: 'Format natif Python pour scikit-learn',
            icon: Package,
            format: 'pkl',
            color: 'blue',
            recommended: true
        },
        {
            title: 'Format ONNX',
            description: 'Format universel pour déploiement multi-plateforme',
            icon: Code,
            format: 'onnx',
            color: 'purple'
        },
        {
            title: 'Format JSON',
            description: 'Métadonnées et paramètres du modèle',
            icon: FileJson,
            format: 'json',
            color: 'green'
        }
    ];

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-gray-900 -white mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-gray-900 -white text-3xl font-bold text-gray-900 -white -white mb-2">Exportation du modèle</h1>
                    <p className="text-gray-900 -white text-gray-600 -slate-400">Téléchargez votre modèle <span className="font-bold text-gray-900 -white text-blue-600 -blue-400">{bestModel}</span> dans différents formats</p>
                </div>
                <button
                    onClick={() => navigate('/visualization')}
                    className="text-gray-900 -white flex items-center gap-2 px-4 py-2 border border-gray-200 -slate-800 rounded-lg hover:bg-gray-50 -slate-800 transition-colors"
                >
                    <ArrowLeft size={18} />
                    Retour
                </button>
            </div>

            {/* Export Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {exportOptions.map((option) => {
                    const Icon = option.icon;
                    const colorClasses = {
                        blue: 'from-blue-500 to-cyan-500',
                        purple: 'from-purple-500 to-pink-500',
                        green: 'from-green-500 to-emerald-500'
                    };

                    return (
                        <div
                            key={option.format}
                            className="relative bg-white rounded-xl p-6 border-2 border-gray-200 -slate-800 hover:border-blue-300 transition-all hover:shadow-lg group"
                        >
                            {option.recommended && (
                                <div className="absolute -top-3 -right-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs px-3 py-1 rounded-full font-bold shadow-md">
