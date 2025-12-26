import { Sliders, Info, Play } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useWorkflow } from '../context/WorkflowContext';

// No props needed
export function HyperparameterConfig() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, updateState } = useWorkflow();

  const {
    datasetId: locId,
    preprocessingResult: locPrep,
    featureSelectionResult: locFeat,
    targetVariable: locTarget,
    selectedModel: locModel
  } = location.state || {};

  const datasetId = locId || state.datasetId;
  const preprocessingResult = locPrep || state.preprocessingResult;
  const featureSelectionResult = locFeat || state.featureSelectionResult;
  const targetVariable = locTarget || state.targetVariable;
  const selectedModel = locModel || state.selectedModel;
  if (!datasetId) {
    return (
      <div className="flex flex-col items-center justify-center p-20 h-96 bg-white rounded-xl border border-[#E2E8F0]">
        <Sliders size={48} className="text-gray-300 mb-4" />
        <h3 className="text-xl font-medium text-gray-700">Configuration bloquée</h3>
        <p className="text-gray-500 mt-2 text-center max-w-sm">
          Vous devez avoir un dataset actif et un modèle sélectionné pour configurer les hyperparamètres.
        </p>
        <button
          onClick={() => navigate('/import')}
          className="mt-6 px-6 py-3 bg-[#1E293B] text-white rounded-lg hover:bg-[#334155] transition-colors"
        >
          Aller à l'importation
        </button>
      </div>
    );
  }

  const [nEstimators, setNEstimators] = useState(100);
  const [maxDepth, setMaxDepth] = useState(10);
  const [learningRate, setLearningRate] = useState(0.1);
  const [minSamplesSplit, setMinSamplesSplit] = useState(2);

  useEffect(() => {
    if (locId || locPrep || locFeat || locTarget || locModel) {
      updateState({
        datasetId: datasetId,
        preprocessingResult: preprocessingResult,
        featureSelectionResult: featureSelectionResult,
        targetVariable: targetVariable,
        selectedModel: selectedModel
      });
    }

    // Pre-fill with suggested parameters if available
    const recommendation = state.recommendations?.find(r => r.id === selectedModel);
    if (recommendation?.suggestedParameters) {
      const params = recommendation.suggestedParameters;
      if (params.n_estimators) setNEstimators(params.n_estimators);
      if (params.max_depth) setMaxDepth(params.max_depth);
      if (params.learning_rate) setLearningRate(params.learning_rate);
      if (params.min_samples_split) setMinSamplesSplit(params.min_samples_split);
    }
  }, [selectedModel, state.recommendations]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl text-[#1E293B] mb-1">Configuration des hyperparamètres</h2>
        <p className="text-gray-600">Ajustez les paramètres du modèle Random Forest</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <Info size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-900">
            Les valeurs par défaut sont optimisées pour la plupart des cas d&apos;usage.
            Vous pouvez les ajuster pour améliorer les performances sur votre dataset spécifique.
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-lg p-6 border border-[#E2E8F0]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg text-[#1E293B] flex items-center gap-2">
                n_estimators
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Nombre d&apos;arbres dans la forêt
              </p>
            </div>
            <div className="text-2xl text-[#1E293B]">{nEstimators}</div>
          </div>
          <input
            type="range"
            min="10"
            max="500"
            step="10"
            value={nEstimators}
            onChange={(e) => setNEstimators(Number(e.target.value))}
            className="w-full h-2 bg-[#E2E8F0] rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>10</span>
            <span>500</span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-[#E2E8F0]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg text-[#1E293B] flex items-center gap-2">
                max_depth
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Profondeur maximale de chaque arbre
              </p>
            </div>
            <div className="text-2xl text-[#1E293B]">{maxDepth}</div>
          </div>
          <input
            type="range"
            min="3"
            max="50"
            step="1"
            value={maxDepth}
            onChange={(e) => setMaxDepth(Number(e.target.value))}
            className="w-full h-2 bg-[#E2E8F0] rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>3</span>
            <span>50</span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-[#E2E8F0]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg text-[#1E293B] flex items-center gap-2">
                learning_rate
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Taux d&apos;apprentissage (pour les modèles boostés)
              </p>
            </div>
            <div className="text-2xl text-[#1E293B]">{(typeof learningRate === 'number' ? learningRate.toFixed(3) : '0.100')}</div>
          </div>
          <input
            type="range"
            min="0.001"
            max="1"
            step="0.001"
            value={learningRate}
            onChange={(e) => setLearningRate(Number(e.target.value))}
            className="w-full h-2 bg-[#E2E8F0] rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>0.001</span>
            <span>1.000</span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-[#E2E8F0]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg text-[#1E293B] flex items-center gap-2">
                min_samples_split
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Nombre minimum d&apos;échantillons pour diviser un nœud
              </p>
            </div>
            <div className="text-2xl text-[#1E293B]">{minSamplesSplit}</div>
          </div>
          <input
            type="range"
            min="2"
            max="20"
            step="1"
            value={minSamplesSplit}
            onChange={(e) => setMinSamplesSplit(Number(e.target.value))}
            className="w-full h-2 bg-[#E2E8F0] rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>2</span>
            <span>20</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 border border-[#E2E8F0] mt-6">
        <h3 className="text-lg text-[#1E293B] mb-4 flex items-center gap-2">
          <Sliders size={20} />
          Résumé de la configuration
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-[#F8FAFC] rounded">
            <div className="text-sm text-gray-600">n_estimators</div>
            <div className="text-[#1E293B]">{nEstimators}</div>
          </div>
          <div className="p-3 bg-[#F8FAFC] rounded">
            <div className="text-sm text-gray-600">max_depth</div>
            <div className="text-[#1E293B]">{maxDepth}</div>
          </div>
          <div className="p-3 bg-[#F8FAFC] rounded">
            <div className="text-sm text-gray-600">learning_rate</div>
            <div className="text-[#1E293B]">{(typeof learningRate === 'number' ? learningRate.toFixed(3) : '0.100')}</div>
          </div>
          <div className="p-3 bg-[#F8FAFC] rounded">
            <div className="text-sm text-gray-600">min_samples_split</div>
            <div className="text-[#1E293B]">{minSamplesSplit}</div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-6">
        <button
          onClick={() => navigate('/model-recommendation')}
          className="px-6 py-3 border border-[#E2E8F0] rounded-lg hover:bg-[#F8FAFC] transition-colors"
        >
          Retour
        </button>
        <button
          onClick={() => navigate('/training', {
            state: {
              ...location.state,
              trainTop2: true,
              customParameters: {
                n_estimators: nEstimators,
                max_depth: maxDepth,
                learning_rate: learningRate,
                min_samples_split: minSamplesSplit
              }
            }
          })}
          className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors shadow-lg flex items-center gap-2 font-medium"
        >
          <Play size={18} />
          Entraîner les 2 meilleurs modèles
        </button>
      </div>
    </div >
  );
}
