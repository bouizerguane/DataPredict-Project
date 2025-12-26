import { Play, CheckCircle, Loader, AlertCircle, Trophy, TrendingUp, Download, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useWorkflow } from '../context/WorkflowContext';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ModelResult {
  modelName: string;
  metrics: Record<string, number>;
  trainingTime: number;
  status: 'training' | 'completed' | 'error' | 'failed';
}

export function Training() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, updateState } = useWorkflow();

  const { trainTop2, customParameters, selectedModel } = location.state || { trainTop2: true };

  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentModel, setCurrentModel] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modelResults, setModelResults] = useState<ModelResult[]>([]);

  const algorithmsToTrain = trainTop2 ? 2 : 1;

  const steps = [
    { name: 'Préparation des données', duration: 15 },
    { name: 'Division train/test', duration: 10 },
    ...(algorithmsToTrain === 2
      ? [
        { name: 'Entraînement du modèle 1', duration: 35 },
        { name: 'Entraînement du modèle 2', duration: 35 }
      ]
      : [
        { name: 'Entraînement du modèle', duration: 70 }
      ]
    ),
    { name: 'Comparaison des résultats', duration: 5 },
  ];

  useEffect(() => {
    const startTraining = async () => {
      console.log("Training Component State:", state);

      if (!state.datasetId) {
        return;
      }

      if (!state.recommendations) {
        setError("Recommandations manquantes.");
        return;
      }

      const allRecommendations = state.recommendations;
      let topAlgorithms = [];

      if (trainTop2) {
        topAlgorithms = allRecommendations.slice(0, 2);
      } else {
        const selected = allRecommendations.find(r => r.id === selectedModel) || allRecommendations[0];
        topAlgorithms = [selected];
      }

      if (topAlgorithms.length === 0) {
        setError("Aucun algorithme disponible pour l'entraînement.");
        return;
      }

      setError(null);
      setProgress(0);
      setIsComplete(false);

      // Initialize results
      const initialResults: ModelResult[] = topAlgorithms.map(algo => ({
        modelName: algo.model || algo.name,
        metrics: {},
        trainingTime: 0,
        status: 'training' as const
      }));

      setModelResults(initialResults);

      try {
        console.log("Starting training with algorithms:", topAlgorithms);

        // Infer task type (fallback mechanism)
        let resolvedTaskType = state.featureSelectionResult?.mode || "CLASSIFICATION";
        if (topAlgorithms.some(algo => (algo.model || algo.name).toLowerCase().includes("regressor"))) {
          resolvedTaskType = "REGRESSION";
        }
        console.log("Resolved Task Type:", resolvedTaskType);

        // Prepare single payload
        const payload = {
          datasetId: state.preprocessingResult?.exportedFilePath || state.datasetId,
          targetColumn: state.targetVariable || "target",
          taskType: resolvedTaskType,
          description: state.datasetDescription || "",
          algorithms: topAlgorithms.map(algo => {
            const isSelected = (algo.id === selectedModel);
            return {
              name: algo.model || algo.name,
              score: algo.score,
              parameters: isSelected && customParameters ? customParameters : (algo.suggestedParameters || {})
            };
          })
        };

        console.log("Sending training request:", payload);

        // Start progress simulation
        const progressInterval = setInterval(() => {
          setProgress(prev => {
            if (prev >= 95) return 95;
            return prev + 0.5;
          });
        }, 200);

        // Send single request to train both models
        const response = await fetch('/api/training/train', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        clearInterval(progressInterval);

        if (response.ok) {
          const result = await response.json();
          console.log("Training result:", result);

          // Extract results for both models
          const extractedResults: ModelResult[] = topAlgorithms.map(algo => {
            const modelName = algo.model || algo.name;
            const metrics = (result.comparison && result.comparison[modelName]);

            if (!metrics || Object.keys(metrics).length <= 1) { // only trainingTime or empty
              return {
                modelName,
                metrics: {},
                trainingTime: 0,
                status: 'error' as const
              };
            }

            const numericMetrics: Record<string, number> = {};
            Object.keys(metrics).forEach(key => {
              if (typeof metrics[key] === 'number') {
                numericMetrics[key] = metrics[key];
              }
            });

            return {
              modelName,
              metrics: numericMetrics,
              trainingTime: metrics.trainingTime ?? 0,
              status: 'completed' as const
            };
          });

          setModelResults(extractedResults);
          setProgress(100);
          setCurrentStep(4);
          setIsComplete(true);

          // Save results to workflow state
          updateState({
            trainingResults: result
          });

          toast.success("Entraînement et comparaison terminés !");
        } else {
          const errorText = await response.text();
          console.error("Training error response:", errorText);
          throw new Error(`Erreur serveur (${response.status}): ${errorText}`);
        }
      } catch (err: any) {
        console.error("Training execution failed:", err);
        setError(err.message || "Une erreur est survenue lors de l'entraînement");
        toast.error("Échec de l'entraînement");
      }
    };

    startTraining();
  }, [state.datasetId, state.recommendations]);

  useEffect(() => {
    if (progress >= 100) setCurrentStep(3); // Just dummy update for internal logic if any
  }, [progress]);

  const winner = (modelResults.length > 0 && modelResults.every(r => r.status === 'completed' || r.status === 'error'))
    ? modelResults
      .filter(r => r.status === 'completed' && Object.keys(r.metrics).length > 0)
      .reduce((best: ModelResult | null, current: ModelResult) => {
        if (!best) return current;
        const b = best.metrics as Record<string, number>;
        const c = current.metrics as Record<string, number>;
        const bestScore = b['accuracy'] || b['r2'] || 0;
        const currentScore = c['accuracy'] || c['r2'] || 0;
        return currentScore > bestScore ? current : best;
      }, null as ModelResult | null)
    : null;

  // Prepare comparison data for chart
  const availableMetrics = modelResults.length > 0 ? Object.keys(modelResults[0]?.metrics || {}) : [];
  const comparisonData = availableMetrics.map(metric => {
    const entry: any = { metric: metric.charAt(0).toUpperCase() + metric.slice(1) };
    modelResults.forEach(r => {
      const val = r.metrics?.[metric] ?? 0;
      if (val <= 1 && val >= -1) {
        entry[r.modelName] = val * 100;
      } else {
        entry[r.modelName] = val;
      }
    });
    return entry;
  });

  const COLORS = ['#3B82F6', '#EC4899'];

  if (!state.datasetId) {
    return (
      <div className="p-10 text-center bg-white rounded-xl border border-gray-200">
        <Play className="mx-auto text-gray-300 mb-4" size={48} />
        <h3 className="text-gray-900 text-xl text-gray-800 -slate-200 mb-2">Entraînement non disponible</h3>
        <p className="text-gray-900 text-gray-600 mb-6">Importez un dataset pour commencer l'entraînement des modèles.</p>
        <button
          onClick={() => navigate('/import')}
          className="px-6 py-2 btn-primary transition-colors"
        >
          Aller à l'importation
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-center">
        <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
        <h3 className="text-gray-900 text-xl text-gray-800 -slate-200 mb-2">{error}</h3>
        <p className="text-gray-900 text-gray-600 mb-6">L'entraînement n'a pas pu être lancé ou a échoué.</p>
        <div className="text-gray-900 flex justify-center gap-4">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Réessayer
          </button>
          <button
            onClick={() => navigate('/model-recommendation')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Retour aux recommandations
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="text-gray-900 mb-8">
        <h2 className="text-gray-900 text-3xl font-bold text-gray-900 -white mb-2">
          {isComplete ? 'Comparaison des modèles' : 'Entraînement en cours'}
        </h2>
        <p className="text-gray-900 text-gray-600">
          {isComplete
            ? 'Résultats de la comparaison des 2 meilleurs algorithmes'
            : 'Entraînement et comparaison des 2 meilleurs algorithmes recommandés'}
        </p>
      </div>

      {!isComplete && (
        <div className="bg-white rounded-lg p-8 border border-gray-200 mb-6">
          <div className="text-gray-900 text-center mb-8">
            <div className="w-24 h-24 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
              <Loader size={48} className="text-gray-900 text-blue-600 animate-spin" />
            </div>
            <h3 className="text-gray-900 section-title mb-2">Analyse en cours...</h3>
            <p className="text-gray-900 text-gray-400 text-sm animate-pulse">
              Cette étape peut prendre quelques minutes selon la taille du dataset
            </p>
          </div>

          <div className="text-gray-900 mb-6 max-w-md mx-auto">
            <div className="text-gray-900 flex justify-between text-xs font-bold mb-2 uppercase tracking-wider opacity-60">
              <span>Progression</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden border border-gray-200 shadow-inner">
              <div
                className="bg-blue-600 h-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {isComplete && !winner && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-10 text-center mb-8 shadow-sm">
          <AlertCircle className="mx-auto text-amber-500 mb-4" size={56} />
          <h3 className="text-gray-900 text-2xl font-bold text-amber-800 mb-3">Résultats non concluants</h3>
          <p className="text-gray-900 text-amber-700 max-w-md mx-auto mb-6">
            Les modèles n'ont pas pu extraire de corrélations significatives de votre dataset.
            Cela peut être dû à un manque de données ou à une variable cible incompatible.
          </p>
          <div className="text-gray-900 flex justify-center gap-4">
            <button
              onClick={() => navigate('/import')}
              className="px-6 py-3 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition-all shadow-lg shadow-amber-100"
            >
              Changer de dataset
            </button>
            <button
              onClick={() => navigate('/model-recommendation')}
              className="px-6 py-3 border border-amber-300 text-amber-800 rounded-xl font-bold hover:bg-amber-100 transition-all"
            >
              Réessayer
            </button>
          </div>
        </div>
      )}

      {isComplete && winner && (
        <>
          {/* Winner Banner */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 rounded-xl p-6 mb-8 group hover:shadow-md transition-shadow">
            <div className="text-gray-900 flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-green-100">
                <Trophy className="text-gray-900 text-white" size={32} />
              </div>
              <div className="flex-1">
                <h3 className="text-gray-900 text-2xl font-bold text-gray-900 mb-1">
                  Modèle Champion : {winner.modelName}
                </h3>
                <div className="flex items-center gap-3">
                  <span className="text-emerald-700 font-medium px-3 py-1 bg-white/50 rounded-full text-sm border border-green-100">
                    Score : {Object.entries(winner.metrics).map(([k, v]) => `${k.toUpperCase()} ${(v as number <= 1 ? (v as number * 100).toFixed(2) + '%' : (v as number).toFixed(4))}`).slice(0, 1)}
                  </span>
                  <span className="text-emerald-600 text-sm font-medium opacity-70">
                    Temps : {winner.trainingTime.toFixed(2)}s
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Side-by-side Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {modelResults.map((result, idx) => (
              <div
                key={idx}
                className={`bg-white rounded-xl p-6 border-2 shadow-sm ${winner.modelName === result.modelName
                  ? 'border-green-400 bg-green-50'
                  : 'border-gray-200'
                  }`}
              >
                <div className="text-gray-900 flex items-center justify-between mb-6">
                  <h3 className="text-gray-900 text-xl font-bold text-gray-900 -white">{result.modelName}</h3>
                  {winner.modelName === result.modelName && (
                    <Trophy className="text-gray-900 text-green-500" size={24} />
                  )}
                </div>

                <div className="space-y-3">
                  {result.status === 'error' ? (
                    <div className="flex flex-col items-center justify-center p-4 bg-red-50 rounded-lg border border-red-100">
                      <AlertCircle className="text-red-500 mb-2" size={20} />
                      <span className="text-red-800 text-xs font-bold uppercase">Échec de l'entraînement</span>
                      <span className="text-red-600 text-[10px] text-center mt-1">Vérifiez la compatibilité des données</span>
                    </div>
                  ) : (
                    Object.entries(result.metrics).map(([key, value], mIdx) => {
                      const isPercentage = ['accuracy', 'precision', 'recall', 'f1', 'r2'].includes(key.toLowerCase());
                      const displayValue = isPercentage ? (value * 100).toFixed(2) + '%' : value.toFixed(4);

                      return (
                        <div key={mIdx} className="text-gray-900 flex items-center justify-between">
                          <span className="text-gray-900 text-sm text-gray-600 capitalize">{key}</span>
                          <div className="text-gray-900 flex items-center gap-2">
                            {isPercentage ? (
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-500 h-2 rounded-full"
                                  style={{ width: `${Math.min(100, Math.max(0, value * 100))}%` }}
                                />
                              </div>
                            ) : null}
                            <span className="text-gray-900 text-sm font-bold text-gray-900 w-20 text-right">
                              {displayValue}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="text-gray-900 mt-4 pt-4 border-t border-gray-200">
                  <div className="text-gray-900 flex justify-between text-sm">
                    <span className="text-gray-900 text-gray-600">Temps d'entraînement</span>
                    <span className="font-bold text-gray-900 -white">{(typeof result.trainingTime === 'number' ? result.trainingTime.toFixed(2) : '0.00')}s</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Comparison Chart */}
          <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm mb-8">
            <h3 className="text-gray-900 text-xl font-bold text-gray-900 -white mb-6">Comparaison des métriques</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="metric" stroke="#64748B" />
                {/* Remove domain assumption since MSE can be large */}
                <YAxis stroke="#64748B" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px' }}
                  formatter={(value: any) => typeof value === 'number' ? value.toFixed(4) : value}
                />
                <Legend />
                {modelResults.map((result, idx) => (
                  <Bar
                    key={idx}
                    dataKey={result.modelName}
                    fill={COLORS[idx]}
                    radius={[8, 8, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Action Button */}
          <div className="text-gray-900 flex justify-end">
            <button
              onClick={() => navigate('/results')}
              className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95 group"
            >
              Voir les résultats détaillés
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
