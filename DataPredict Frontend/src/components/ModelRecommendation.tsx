import { Sparkles, Check, AlertCircle, ArrowRight, Loader2, Play } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

import { useWorkflow } from '../context/WorkflowContext';

export function ModelRecommendation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, updateState } = useWorkflow();

  const {
    datasetId: locId,
    preprocessingResult: locPrep,
    featureSelectionResult: locFeat,
    targetVariable: locTarget
  } = location.state || {};

  const datasetId = locId || state.datasetId;
  const preprocessingResult = locPrep || state.preprocessingResult;
  const featureSelectionResult = locFeat || state.featureSelectionResult;
  const targetVariable = locTarget || state.targetVariable;

  // Removed redundant state synchronization Effect


  interface Model {
    id: string;
    model: string; // Internal ID
    name: string; // Display Name
    score: number;
    pros: string[];
    cons: string[];
    complexity: string;
    speed: string;
    recommended?: boolean;
    explanation?: string[];
    suggestedParameters?: Record<string, any>;
  }

  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModelId, setSelectedModelIdLocal] = useState<string | null>(null);

  const setSelectedModelId = (id: string | null) => {
    setSelectedModelIdLocal(id);
    updateState({ selectedModel: id });
  };

  if (!datasetId) {
    return (
      <div className="text-gray-900 flex flex-col items-center justify-center p-20 h-96">
        <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
        <h3 className="text-gray-900 text-xl font-medium text-gray-700 -slate-300">Action requise</h3>
        <p className="text-gray-900 text-gray-500 mt-2">Veuillez importer un dataset pour accéder aux recommandations.</p>
        <button onClick={() => navigate('/import')} className="text-gray-900 mt-6 px-6 py-2 bg-[#1E293B] text-white rounded-lg">Aller à l'importation</button>
      </div>
    );
  }

  useEffect(() => {
    if (!featureSelectionResult) {
      setLoading(false);
      return;
    }

    const fetchRecommendations = async () => {
      try {
        setLoading(true);

        // Construct payload
        // We need numRows from preprocessing result passed from previous steps
        // If not available, we might default or fetch stats again. 
        // Assuming preprocessingResult has export info.

        const numRows = preprocessingResult?.numRows || 1000; // Fallback if not in state
        const taskType = featureSelectionResult?.mode || "CLASSIFICATION";

        const payload = {
          selectedFeatures: featureSelectionResult.selectedFeatures || [],
          rejectedFeatures: featureSelectionResult.rejectedFeatures || [],
          featureScores: featureSelectionResult.featureScores || [],
          datasetProfile: {
            numRows: numRows,
            numFeatures: (featureSelectionResult.selectedFeatures || []).length,
            taskType: taskType.toLowerCase(), // Backend expects lowercase probably? Verify. Backend uses "classification" in db.
            missingValues: 0 // Assumed handled by preprocessing
          }
        };

        console.log("Requesting recommendations with:", payload);

        const response = await fetch('/api/recommendation/recommend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Recommendation Response:", data);

          if (data.ranking && Array.isArray(data.ranking)) {
            const mappedModels: Model[] = data.ranking.map((m: any, index: number) => ({
              id: m.model, // Use model code as ID
              model: m.model,
              name: m.name || m.model, // Use provided name or fallback
              score: Math.round(m.score * 100), // Convert 0-1 to 0-100
              pros: m.pros || [],
              cons: m.cons || [],
              complexity: m.complexity || "Medium",
              speed: m.speed || "Medium",
              recommended: index === 0, // Top 1 is recommended
              suggestedParameters: m.suggestedParameters || {}
            }));

            setModels(mappedModels);
            updateState({ recommendations: mappedModels }); // Save to workflow state
            if (mappedModels.length > 0 && mappedModels[0]) {
              setSelectedModelId(mappedModels[0].id);
            }
          }
        } else {
          console.error("Failed to fetch recommendations");
          toast.error("Erreur lors de la récupération des recommandations");
        }
      } catch (e) {
        console.error("Error", e);
        toast.error("Service de recommandation indisponible");
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [datasetId, featureSelectionResult, preprocessingResult, navigate]);

  if (loading) {
    return (
      <div className="text-gray-900 flex flex-col items-center justify-center p-20 h-96">
        <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
        <h3 className="text-gray-900 text-xl font-medium text-gray-700 -slate-300">Analyse de vos données...</h3>
        <p className="text-gray-900 text-gray-500 mt-2">Notre IA évalue les meilleurs modèles pour votre dataset.</p>
      </div>
    );
  }

  // Find selected model object
  const selectedModel = models.find(m => m.id === selectedModelId) || models[0];

  if (!selectedModel) {
    return (
      <div className="p-10 text-center">
        <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
        <h3 className="text-gray-900 text-xl text-gray-800 -slate-200 -slate-200">Aucune recommandation disponible</h3>
        <p className="text-gray-900 text-gray-500 mt-2">Vérifiez que vous avez bien suivi le processus depuis l'import.</p>
        <button onClick={() => navigate('/import')} className="text-gray-900 mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg">Retour à l'accueil</button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="text-gray-900 mb-6">
        <h2 className="text-gray-900 page-title mb-1">Recommandation de modèle IA</h2>
        <p className="text-gray-900 text-gray-600">Notre IA a analysé vos données et recommande ces modèles</p>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 mb-8 shadow-sm">
        <div className="text-gray-900 flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
            <Sparkles size={24} className="text-gray-900 text-white" />
          </div>
          <div>
            <h3 className="text-gray-900 text-lg font-semibold text-gray-900 -white mb-2">Analyse terminée</h3>
            <p className="text-gray-900 text-gray-700 leading-relaxed">
              Basé sur votre dataset et la tâche de <span className="font-medium text-gray-900 text-blue-700">{featureSelectionResult?.mode || "détection"}</span>,
              nous recommandons <span className="font-bold text-gray-900 text-blue-700">{models[0]?.name}</span> comme meilleur choix avec une confiance de
              <span className="font-bold text-gray-900 text-green-600 -green-400"> {models[0]?.score}%</span>.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        {models.map((model, index) => {
          const isTop2 = index < 2;
          return (
            <div
              key={model.id}
              className={`bg-white rounded-xl border-2 p-6 transition-all relative overflow-hidden ${isTop2
                ? 'border-blue-500 shadow-md ring-1 ring-blue-500'
                : 'border-gray-200 opacity-75'
                }`}
            >
              {model.recommended && (
                <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-3 py-1 rounded-bl-lg font-medium z-10">
                  Recommandation IA
                </div>
              )}

              {index === 1 && (
                <div className="absolute top-0 right-0 bg-purple-500 text-white text-xs px-3 py-1 rounded-bl-lg font-medium z-10">
                  Challenger
                </div>
              )}

              <div className="text-gray-900 flex items-start justify-between mb-6">
                <div className="text-gray-900 flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold ${isTop2
                    ? 'border-blue-500 bg-blue-500 text-white'
                    : 'border-gray-300 text-gray-400'
                    }`}>
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-gray-900 text-xl font-bold text-gray-900 -white">{model.name}</h3>
                    <div className="flex gap-2 mt-1">
                      {index === 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-md border border-blue-100">
                          <Sparkles size={10} /> Meilleur score
                        </span>
                      )}
                      {isTop2 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-md border border-green-100">
                          <Check size={10} /> Sélectionné pour l'entraînement
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-gray-900 text-right">
                  <div className={`text-3xl font-bold ${model.score >= 90 ? 'text-green-600' : model.score >= 70 ? 'text-blue-600' : 'text-amber-500'}`}>
                    {model.score}%
                  </div>
                  <div className="text-gray-900 text-xs text-gray-500 uppercase tracking-wide font-medium">Confiance</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                <div>
                  <h4 className="text-gray-900 text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Avantages
                  </h4>
                  <ul className="space-y-2">
                    {model.pros.map((pro, idx) => (
                      <li key={idx} className="text-gray-900 flex items-start gap-2 text-sm text-gray-600">
                        <Check size={16} className="text-gray-900 text-green-500 mt-0.5 shrink-0" />
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-gray-900 text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div> Limitations
                  </h4>
                  <ul className="space-y-2">
                    {model.cons.map((con, idx) => (
                      <li key={idx} className="text-gray-900 flex items-start gap-2 text-sm text-gray-600">
                        <div className="w-4 h-4 rounded-full border border-red-200 bg-red-50 flex items-center justify-center shrink-0 mt-0.5 text-xs text-red-500">!</div>
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="text-gray-900 flex gap-4 pt-4 border-t border-gray-100">
                <div className="flex-1 px-4 py-2 bg-gray-50 rounded-lg text-center">
                  <div className="text-gray-900 text-xs text-gray-500 mb-1 font-medium">Complexité</div>
                  <div className="text-gray-900 text-sm text-gray-900 font-semibold text-gray-900 -white">{model.complexity}</div>
                </div>
                <div className="flex-1 px-4 py-2 bg-gray-50 rounded-lg text-center">
                  <div className="text-gray-900 text-xs text-gray-500 mb-1 font-medium">Vitesse</div>
                  <div className="text-gray-900 text-sm text-gray-900 font-semibold text-gray-900 -white">{model.speed}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-gray-900 flex justify-end gap-4">
        <button
          onClick={() => navigate('/variable-selection', { state: location.state })}
          className="px-6 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium"
        >
          Retour aux variables
        </button>
        <button
          onClick={() => navigate('/training', {
            state: {
              ...location.state,
              trainTop2: true, // Specific flag for training page
              modelsDetails: models.slice(0, 2)
            }
          })}
          className="px-8 py-3 bg-[#14b8a6] hover:bg-teal-600 text-white rounded-lg transition-colors shadow-lg hover:shadow-xl flex items-center gap-2 font-bold"
        >
          <Play size={18} fill="currentColor" />
          Entraîner les 2 meilleurs modèles
        </button>
      </div>
    </div>
  );
}
