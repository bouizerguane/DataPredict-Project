import { Download, FileText, Package, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWorkflow } from '../context/WorkflowContext';
import { toast } from 'sonner';

export function ModelExport() {
  const navigate = useNavigate();
  const { state } = useWorkflow();
  const { trainingResults, selectedModel } = state;

  // Determine winner or selected model
  // If we came from training comparison, we might want the winner.
  // For simplicity, let's pick the best model from the results if available.
  const getBestModel = () => {
    if (!trainingResults || !trainingResults.comparison) return null;
    const entries = Object.entries(trainingResults.comparison);
    if (entries.length === 0) return null;

    // Sort by accuracy (or another primary metric)
    // Assuming accuracy is key 'accuracy'
    return entries.sort(([, metricsA], [, metricsB]) => {
      const accA = (metricsA as any).accuracy || 0;
      const accB = (metricsB as any).accuracy || 0;
      return accB - accA;
    })[0];
  };

  const bestModelEntry = getBestModel();
  const modelName = bestModelEntry ? bestModelEntry[0] : "Modèle Inconnu";
  const metrics = bestModelEntry ? (bestModelEntry[1] as any) : {};
  const trainingId = trainingResults?.trainingRefId;

  const handleDownload = (format: string) => {
    if (!trainingId) {
      toast.error("ID d'entraînement manquant");
      return;
    }
    window.open(`/api/training/download/${trainingId}?format=${format}`, '_blank');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl text-[#1E293B] mb-1">Exportation du modèle</h2>
        <p className="text-gray-600">Téléchargez votre modèle entraîné dans différents formats</p>
      </div>

      <div className="bg-white rounded-lg p-6 border border-[#E2E8F0] mb-6">
        <h3 className="text-lg text-[#1E293B] mb-4">Informations du modèle</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-[#F8FAFC] rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Nom du modèle</div>
            <div className="text-[#1E293B] font-medium">{modelName}</div>
          </div>
          <div className="p-4 bg-[#F8FAFC] rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Date d'entraînement</div>
            <div className="text-[#1E293B] font-medium">{new Date().toLocaleDateString()}</div>
          </div>
          <div className="p-4 bg-[#F8FAFC] rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Accuracy</div>
            <div className="text-[#1E293B] font-medium">{(metrics.accuracy * 100).toFixed(2)}%</div>
          </div>
          <div className="p-4 bg-[#F8FAFC] rounded-lg">
            <div className="text-sm text-gray-600 mb-1">F1-Score</div>
            <div className="text-[#1E293B] font-medium">{(metrics.f1 * 100).toFixed(2)}%</div>
          </div>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div className="bg-white rounded-lg p-6 border-2 border-[#E2E8F0] hover:border-blue-500 transition-all">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Package size={28} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg text-[#1E293B] mb-2">Format Pickle (.pkl)</h3>
              <p className="text-sm text-gray-600 mb-4">
                Format natif Python pour scikit-learn. Compatible avec tous les environnements Python.
              </p>
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  Taille estimée : <span className="text-[#1E293B]">~2 MB</span>
                </div>
                <button
                  onClick={() => handleDownload('pkl')}
                  className="ml-auto px-6 py-2 bg-[#1E293B] text-white rounded-lg hover:bg-[#334155] transition-colors flex items-center gap-2"
                >
                  <Download size={16} />
                  Télécharger .pkl
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border-2 border-[#E2E8F0] hover:border-purple-500 transition-all">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Database size={28} className="text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg text-[#1E293B] mb-2">Format H5 (.h5)</h3>
              <p className="text-sm text-gray-600 mb-4">
                Format hiérarchique pour stocker de grands modèles (Keras/TensorFlow) ou données structurées.
              </p>
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  Taille estimée : <span className="text-[#1E293B]">~5 MB</span>
                </div>
                <button
                  onClick={() => handleDownload('h5')}
                  className="ml-auto px-6 py-2 bg-[#1E293B] text-white rounded-lg hover:bg-[#334155] transition-colors flex items-center gap-2"
                >
                  <Download size={16} />
                  Télécharger .h5
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border-2 border-[#E2E8F0] hover:border-green-500 transition-all">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText size={28} className="text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg text-[#1E293B] mb-2">Rapport complet (.pdf)</h3>
              <p className="text-sm text-gray-600 mb-4">
                Rapport détaillé avec métriques, visualisations et recommandations.
              </p>
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  Taille estimée : <span className="text-[#1E293B]">~1.5 MB</span>
                </div>
                <button
                  onClick={() => handleDownload('pdf')}
                  className="ml-auto px-6 py-2 bg-[#1E293B] text-white rounded-lg hover:bg-[#334155] transition-colors flex items-center gap-2"
                >
                  <Download size={16} />
                  Télécharger PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="text-sm text-blue-900 mb-2">Instructions d&apos;utilisation</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <div>1. Téléchargez le modèle au format souhaité</div>
          <div>2. Pour .pkl : chargez avec <code className="px-2 py-0.5 bg-blue-100 rounded">pickle.load()</code></div>
          <div>3. Pour .h5 : utilisez <code className="px-2 py-0.5 bg-blue-100 rounded">keras.models.load_model()</code></div>
          <div>4. Assurez-vous d&apos;appliquer le même preprocessing sur les nouvelles données</div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button
          onClick={() => navigate('/training')}
          className="px-6 py-3 border border-[#E2E8F0] rounded-lg hover:bg-[#F8FAFC] transition-colors"
        >
          Retour
        </button>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-6 py-3 bg-[#1E293B] text-white rounded-lg hover:#334155 transition-colors"
        >
          Tableau de bord
        </button>
      </div>
    </div>
  );
}
