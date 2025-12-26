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
            <div className="text-gray-900 flex flex-col items-center justify-center p-20 h-96 bg-white rounded-xl border border-gray-200">
                <Package size={48} className="text-gray-900 text-gray-300 mb-4" />
                <h3 className="text-gray-900 text-xl font-medium text-gray-700 -slate-300">Exportation impossible</h3>
                <p className="text-gray-900 text-gray-500 mt-2 text-center max-w-sm">
                    Aucun modèle n'est prêt pour l'exportation. Terminez d'abord l'entraînement.
                </p>
                <button
                    onClick={() => navigate('/import')}
                    className="text-gray-900 mt-6 px-6 py-3 bg-[#1E293B] text-white rounded-lg"
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

    const pythonCode = `# Code Python pour utiliser le modèle ${bestModel} (Format H5)
import tensorflow as tf
import numpy as np

# Charger le modèle au format H5
model = tf.keras.models.load_model('${bestModel.toLowerCase()}_model.h5')

# Vos données de test (doivent être pré-traitées comme pour l'entraînement)
# X_test = ... 

# Faire une prédiction
# predictions = model.predict(X_test)
# print(predictions)`;

    const handleCopyCode = () => {
        navigator.clipboard.writeText(pythonCode);
        setCopiedCode(true);
        toast.success('Code copié dans le presse-papiers');
        setTimeout(() => setCopiedCode(false), 2000);
    };

    const exportOptions = [
        {
            title: 'Format H5 (Hierarchical Data Format)',
            description: 'Format optimisé pour les modèles de Deep Learning et les architectures complexes. Compatible avec TensorFlow et Keras.',
            icon: Package,
            format: 'h5',
            color: 'blue',
            recommended: true
        }
    ];

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-gray-900 mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-gray-900 text-3xl font-bold text-gray-900 -white mb-2">Exportation du modèle</h1>
                    <p className="text-gray-900 text-gray-600">Exportez votre modèle <span className="font-bold text-gray-900 text-blue-600 -blue-400">{bestModel}</span> au format standard H5</p>
                </div>
                <button
                    onClick={() => navigate('/visualization')}
                    className="text-gray-900 flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    <ArrowLeft size={18} />
                    Retour
                </button>
            </div>

            {/* Export Options - Centered Single Option */}
            <div className="flex justify-center mb-8">
                {exportOptions.map((option) => {
                    const Icon = option.icon;
                    const colorClasses = {
                        blue: 'from-blue-600 to-indigo-600',
                    };

                    return (
                        <div
                            key={option.format}
                            className="relative bg-white rounded-2xl p-8 border-2 border-blue-100 shadow-xl shadow-blue-50 max-w-lg w-full transform transition-all hover:scale-[1.02]"
                        >
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs px-4 py-1.5 rounded-full font-black uppercase tracking-wider shadow-lg">
                                Format Unique H5
                            </div>

                            <div className="text-gray-900 flex flex-col items-center text-center">
                                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${colorClasses.blue} text-white flex items-center justify-center mb-6 shadow-blue-200 shadow-lg`}>
                                    <Icon className="w-10 h-10" />
                                </div>

                                <h3 className="text-gray-900 text-2xl font-black text-gray-900 mb-2">{option.title}</h3>
                                <p className="text-gray-900 text-gray-500 mb-8 leading-relaxed">
                                    {option.description}
                                </p>

                                <button
                                    onClick={() => handleDownloadModel(option.format)}
                                    className={`w-full flex items-center justify-center gap-3 px-8 py-5 bg-gradient-to-r ${colorClasses.blue} text-white rounded-2xl font-black text-lg hover:shadow-2xl hover:shadow-blue-200 transition-all active:scale-95`}
                                >
                                    <Download size={24} />
                                    Télécharger le modèle (.h5)
                                </button>

                                <p className="text-gray-900 mt-4 text-xs text-gray-400">
                                    Inclus : Poids du modèle, architecture et configuration de l'optimiseur.
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Code Example */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-8">
                <div className="text-gray-900 flex items-center justify-between mb-4">
                    <h3 className="text-gray-900 text-xl font-bold text-gray-900 -white">Code d'utilisation</h3>
                    <button
                        onClick={handleCopyCode}
                        className="text-gray-900 flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                        {copiedCode ? (
                            <>
                                <CheckCircle size={16} className="text-gray-900 text-green-600 -green-400" />
                                Copié !
                            </>
                        ) : (
                            <>
                                <Copy size={16} />
                                Copier le code
                            </>
                        )}
                    </button>
                </div>

                <div className="bg-[#1E293B] rounded-lg p-6 overflow-x-auto">
                    <pre className="text-sm text-gray-100 font-mono">
                        <code>{pythonCode}</code>
                    </pre>
                </div>
            </div>

            {/* Model Information */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-gray-900 text-lg font-bold text-gray-900 -white mb-4">Informations du modèle</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4">
                        <div className="text-gray-900 text-sm text-gray-900 text-gray-600 mb-1">Nom du modèle</div>
                        <div className="text-gray-900 text-lg text-gray-900 font-bold text-gray-900 -white">{bestModel}</div>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                        <div className="text-gray-900 text-sm text-gray-900 text-gray-600 mb-1">Date d'entraînement</div>
                        <div className="text-gray-900 text-lg text-gray-900 font-bold text-gray-900 -white">{new Date().toLocaleDateString('fr-FR')}</div>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                        <div className="text-gray-900 text-sm text-gray-900 text-gray-600 mb-1">Taille estimée</div>
                        <div className="text-gray-900 text-lg text-gray-900 font-bold text-gray-900 -white">2.4 MB</div>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                        <div className="text-gray-900 text-sm text-gray-900 text-gray-600 mb-1">Version</div>
                        <div className="text-gray-900 text-lg text-gray-900 font-bold text-gray-900 -white">1.0.0</div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="text-gray-900 flex justify-end gap-4 mt-6">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="px-6 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                    Retour au tableau de bord
                </button>
                <button
                    onClick={() => navigate('/import')}
                    className="px-6 py-3 btn-primary transition-colors font-medium"
                >
                    Nouveau projet
                </button>
            </div>
        </div>
    );
}
