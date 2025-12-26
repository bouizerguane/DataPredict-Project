import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, XCircle, TrendingUp, Target, ArrowRight, BarChart2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { useWorkflow } from '../context/WorkflowContext';

interface FeatureScore {
  featureName: string;
  miScore: number;
  pearsonScore: number;
  anovaScore: number;
  rfImportance: number;
  finalScore: number;
  selected: boolean;
  explanation: string;
}

interface FeatureSelectionResult {
  selectedFeatures: string[];
  rejectedFeatures: string[];
  featureScores: FeatureScore[];
  mode: string;
}

export function VariableSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, updateState } = useWorkflow();

  const {
    datasetId: locId,
    preprocessingResult: locPrep,
    featureSelectionResult: initialResult,
    droppedColumns: locDropped,
    targetVariable: locTarget
  } = location.state || {};

  const datasetId = locId || state.datasetId;
  const preprocessingResult = locPrep || state.preprocessingResult;
  const droppedColumns = locDropped || state.droppedColumns;

  // State
  const [targetVariable, setTargetVariable] = useState<string>(locTarget || state.targetVariable || '');
  const [featureSelectionResult, setFeatureSelectionResult] = useState<FeatureSelectionResult | undefined>(initialResult || state.featureSelectionResult || undefined);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const [loadingColumns, setLoadingColumns] = useState(false);

  // Removed redundant state synchronization Effect

  // Fix: Aggressive cleanup for stuck tooltips/popovers from previous steps
  useEffect(() => {
    const cleanup = () => {
      // Remove Tippy.js roots (used by react-wordcloud)
      document.querySelectorAll('[data-tippy-root]').forEach(el => el.remove());
      // Remove generic fixed/absolute divs that look like tooltips
      document.querySelectorAll('body > div').forEach(el => {
        const style = window.getComputedStyle(el);
        if ((style.position === 'fixed' || style.position === 'absolute') && style.zIndex !== 'auto') {
          if (el.textContent && (
            el.textContent.toLowerCase().includes('count:') ||
            el.textContent.toLowerCase().includes('word:') ||
            el.className.includes('tooltip')
          )) {
            el.remove();
          }
        }
      });
    };
    // Run immediately and after a short delay to catch mounting animations
    cleanup();
    setTimeout(cleanup, 100);
    setTimeout(cleanup, 500);
  }, []);

  // If we don't have results yet, we need to fetch columns for selection
  useEffect(() => {
    if (!featureSelectionResult && datasetId) {
      const fetchColumns = async () => {
        setLoadingColumns(true);
        console.log("Fetching columns for dataset:", datasetId);
        try {
          const statsResponse = await fetch(`/api/datasets/${datasetId}/stats`);

          const contentType = statsResponse.headers.get("content-type");
          if (contentType && contentType.includes("text/html")) {
            console.error("Received HTML instead of JSON. Backend might be unreachable or Proxy not working. Restart 'npm run dev'.");
            throw new Error("Received HTML response. Please restart the dev server.");
          }

          if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            const cols = statsData.info.columns;
            // Filter out dropped columns
            const activeColumns = cols.filter((col: string) => !droppedColumns?.includes(col));
            setAvailableColumns(activeColumns);
          } else {
            console.error("Stats response not OK:", statsResponse.status);
            toast.error(`Erreur serveur: ${statsResponse.status}`);
          }
        } catch (error) {
          console.error("Failed to fetch columns", error);
          toast.error("Erreur lors du chargement des colonnes (Vérifiez la console)");
        } finally {
          setLoadingColumns(false);
        }
      };

      fetchColumns();
    }
  }, [datasetId, featureSelectionResult, droppedColumns]);

  const handleAnalyze = async () => {
    if (!targetVariable) {
      toast.error("Veuillez sélectionner une variable cible");
      return;
    }

    setIsAnalyzing(true);

    // Validate file path
    const filePath = preprocessingResult?.exportedFilePath;
    if (!filePath) {
      console.error("Missing exportedFilePath in preprocessingResult:", preprocessingResult);
      toast.error("Chemin du fichier manquant. Veuillez refaire le prétraitement.");
      setIsAnalyzing(false);
      return;
    }

    try {
      // 1. Construct the file URL
      // Use proxy URL (relative) to avoid CORS issues from browser to localhost:8080 directly
      const fileUrl = filePath.startsWith('http')
        ? filePath
        : `/${filePath.startsWith('/') ? filePath.slice(1) : filePath}`;

      console.log("Downloading file from:", fileUrl);

      // 2. Download the file as a Blob
      const fileResponse = await fetch(fileUrl);
      if (!fileResponse.ok) {
        throw new Error(`Failed to download processed file from ${fileUrl}`);
      }
      const blob = await fileResponse.blob();

      // 3. Prepare FormData for upload
      const formData = new FormData();
      formData.append('file', blob, 'dataset.csv');
      formData.append('targetFeature', targetVariable);

      console.log(`Uploading file (${blob.size} bytes) to Feature Selection Service...`);

      // 4. Send to Feature Selection Service (via Proxy to avoid CORS)
      const response = await fetch('/api/feature-selection/analyze', {
        method: 'POST',
        // Do NOT set Content-Type header, browser detects it for FormData
        body: formData
      });

      if (!response.ok) {
        let errorMessage = 'Analysis failed';
        try {
          const errorText = await response.text();
          console.error("Backend Error Response:", errorText);
          errorMessage = `Analysis failed: ${errorText}`;
        } catch (e) {
          console.error("Could not read error text", e);
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      setFeatureSelectionResult(result);
      // Update global state immediately so the stepper reflects the completion
      updateState({
        featureSelectionResult: result,
        targetVariable: targetVariable
      });
      toast.success("Analyse terminée avec succès");

    } catch (error) {
      console.error("Feature selection analysis error", error);
      toast.error("Erreur lors de l'analyse des features. Vérifiez que le service tourne sur le port 8083.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleFeature = (name: string) => {
    if (!featureSelectionResult) return;

    const newFeatureScores = featureSelectionResult.featureScores.map(fs => {
      if (fs.featureName === name) {
        const newSelected = !fs.selected;
        return {
          ...fs,
          selected: newSelected,
          explanation: newSelected ? 'Manually Selected' : 'Manually Rejected'
        };
      }
      return fs;
    });

    const newSelectedFeatures = newFeatureScores.filter(fs => fs.selected).map(fs => fs.featureName);
    const newRejectedFeatures = newFeatureScores.filter(fs => !fs.selected).map(fs => fs.featureName);

    const newResult = {
      ...featureSelectionResult,
      featureScores: newFeatureScores,
      selectedFeatures: newSelectedFeatures,
      rejectedFeatures: newRejectedFeatures
    };

    setFeatureSelectionResult(newResult);
    updateState({ featureSelectionResult: newResult });
  };

  const handleContinue = () => {
    updateState({
      featureSelectionResult,
      targetVariable
    });
    navigate('/model-recommendation', {
      state: {
        datasetId,
        preprocessingResult,
        featureSelectionResult,
        targetVariable
      }
    });
  };

  if (!datasetId) {
    return (
      <div className=" flex flex-col items-center justify-center p-20 h-96">
        <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
        <h3 className=" text-xl font-medium text-gray-700 -slate-300">Chargement...</h3>
        <p className=" text-gray-500 mt-2">Redirection vers l'importation de données.</p>
      </div>
    );
  }

  // --- VIEW 1: Target Selection ---
  if (!featureSelectionResult) {
    return (
      <div className="p-6 max-w-4xl mx-auto bg-white -slate-800 min-h-screen">
        <div className=" mb-6">
          <h2 className=" page-title mb-1">Sélection de la variable cible</h2>
          <p className=" text-gray-600">Choisissez la variable que vous souhaitez prédire ou classifier.</p>
        </div>

        <div className="card mb-8">
          <h3 className=" subsection-title mb-4 flex items-center gap-2">
            <Target size={20} />
            Variable Cible :
          </h3>

          {loadingColumns ? (
            <div className=" flex justify-center p-8">
              <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
          ) : availableColumns.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-2">
              {availableColumns.map((col) => (
                <label
                  key={col}
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${targetVariable === col
                    ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                    : 'border-gray-200 hover:bg-gray-50'
                    }`}
                >
                  <input
                    type="radio"
                    name="targetVariable"
                    value={col}
                    checked={targetVariable === col}
                    onChange={(e) => setTargetVariable(e.target.value)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className=" -white font-medium truncate" title={col}>
                    {col}
                  </span>
                </label>
              ))}
            </div>
          ) : (
            <div className=" text-center py-8 text-gray-500">
              Aucune variable disponible.
            </div>
          )}
        </div>

        <div className=" flex justify-end gap-4">
          <button
            onClick={() => navigate('/task-selection')}
            className="px-6 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Retour
          </button>
          <button
            onClick={handleAnalyze}
            disabled={!targetVariable || isAnalyzing}
            className="px-6 py-3 btn-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isAnalyzing && <Loader2 size={18} className="animate-spin" />}
            {isAnalyzing ? 'Analyse en cours...' : "Lancer l'analyse AI"}
          </button>
        </div>
      </div>
    );
  }

  // --- VIEW 2: Results Display ---
  const sortedScores = [...featureSelectionResult.featureScores].sort((a, b) => b.finalScore - a.finalScore);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className=" mb-6 flex items-center justify-between">
        <div>
          <h2 className=" page-title mb-1">Résultats de la sélection des features</h2>
          <p className=" text-gray-600">
            Analyse effectuée pour la cible : <span className="font-semibold  text-blue-600 -blue-400">{targetVariable}</span>
          </p>
        </div>
        <div className={`px-4 py-2 rounded-full border flex items-center gap-2 ${featureSelectionResult.mode === 'CLASSIFICATION' ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-green-50 border-green-200 text-green-700'
          }`}>
          {featureSelectionResult.mode === 'CLASSIFICATION' ? <Target size={18} /> : <TrendingUp size={18} />}
          <span className="font-semibold ">Mode détecté : {featureSelectionResult.mode}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Selected Features Card */}
        <div className="lg:col-span-2 bg-white -slate-800 rounded-lg border border-green-200 shadow-sm overflow-hidden">
          <div className="bg-green-50 p-4 border-b border-green-100 flex items-center gap-2">
            <CheckCircle className=" text-green-600 -green-400" size={20} />
            <h3 className=" font-semibold text-green-900">Features Sélectionnées ({featureSelectionResult.selectedFeatures.length})</h3>
          </div>
          <div className="p-4 flex flex-wrap gap-2">
            {featureSelectionResult.selectedFeatures.map((feature, idx) => (
              <span key={idx} className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-sm">
                {feature}
              </span>
            ))}
          </div>
        </div>

        {/* Rejected Features Card */}
        <div className="bg-white -slate-800 rounded-lg border border-red-200 shadow-sm overflow-hidden">
          <div className="bg-red-50 p-4 border-b border-red-100 flex items-center gap-2">
            <XCircle className=" text-red-600 -red-400" size={20} />
            <h3 className=" font-semibold text-red-900">Features Rejetées ({featureSelectionResult.rejectedFeatures.length})</h3>
          </div>
          <div className="p-4 flex flex-wrap gap-2">
            {featureSelectionResult.rejectedFeatures.length > 0 ? (
              featureSelectionResult.rejectedFeatures.map((feature, idx) => (
                <span key={idx} className="px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full text-sm">
                  {feature}
                </span>
              ))
            ) : (
              <span className=" text-gray-500 italic text-sm">Aucune feature rejetée</span>
            )}
          </div>
        </div>
      </div>

      {/* Scores Table */}
      <div className="bg-white -slate-800 rounded-lg border border-gray-200 shadow-sm mb-8">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
          <BarChart2 size={20} className=" text-gray-600" />
          <h3 className=" font-semibold text-gray-800 -slate-200 -slate-200">Détail des Scores par Feature</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className=" text-xs text-gray-700 uppercase bg-gray-50 border-b">
              <tr>
                <th className=" text-gray-700 px-6 py-3">Feature</th>
                <th className=" text-gray-700 px-6 py-3">Score Final</th>
                <th className=" text-gray-700 px-6 py-3">Importance RF</th>
                <th className=" text-gray-700 px-6 py-3">Corrélation (Pearson/Anova)</th>
                <th className=" text-gray-700 px-6 py-3">Information Mutuelle</th>
                <th className=" text-gray-700 px-6 py-3 w-1/4">Explication</th>
              </tr>
            </thead>
            <tbody>
              {sortedScores.map((score, idx) => (
                <tr
                  key={idx}
                  className={`border-b hover:bg-gray-50 transition-colors cursor-pointer ${!score.selected ? 'opacity-60 bg-gray-50' : 'bg-white -slate-800'}`}
                  onClick={() => toggleFeature(score.featureName)}
                >
                  <td className=" px-6 py-4 font-medium  -white">
                    <div className=" flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={score.selected}
                        onChange={() => { }} // Handled by tr onClick
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className=" flex items-center gap-2">
                        {score.selected ? <CheckCircle size={14} className=" text-green-500" /> : <XCircle size={14} className=" text-red-400" />}
                        {score.featureName}
                      </span>
                    </div>
                  </td>
                  <td className=" px-6 py-4 font-bold text-blue-600 -blue-400">
                    {((score.finalScore ?? 0) * 100).toFixed(1)}%
                  </td>
                  <td className=" px-6 py-4 text-gray-700 -slate-300">
                    {((score.rfImportance ?? 0) * 100).toFixed(1)}%
                  </td>
                  <td className=" px-6 py-4 text-gray-700 -slate-300">
                    <div className=" flex flex-col text-xs">
                      <span>P: {((score.pearsonScore ?? 0) * 100).toFixed(1)}%</span>
                      <span>A: {((score.anovaScore ?? 0) * 100).toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className=" px-6 py-4 text-gray-700 -slate-300">
                    {(score.miScore ?? 0).toFixed(4)}
                  </td>
                  <td className=" px-6 py-4 text-gray-500 italic text-xs">
                    {score.explanation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className=" flex justify-end gap-4">
        <button
          onClick={() => setFeatureSelectionResult(undefined)}
          className="px-6 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Retour à la sélection
        </button>
        <button
          onClick={handleContinue}
          className="px-6 py-3 btn-primary transition-colors flex items-center gap-2"
        >
          Continuer vers la recommandation
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
