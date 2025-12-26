import { LineChart, Line, BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, Target, Layers, Activity, Download, ArrowLeft, BarChart3 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useWorkflow } from '../context/WorkflowContext';
import { useState } from 'react';

export function Visualization() {
  const navigate = useNavigate();
  const { state: workflowState } = useWorkflow();
  const location = useLocation();
  const trainingResults = workflowState.trainingResults || location.state?.trainingResults;

  const isRegression = workflowState.featureSelectionResult?.mode?.toLowerCase() === 'regression' ||
    workflowState.recommendations?.[0]?.task?.toLowerCase() === 'regression' ||
    (trainingResults?.comparison && trainingResults?.bestModel && !!trainingResults.comparison[trainingResults.bestModel]?.mse);

  const [activeTab, setActiveTab] = useState<'confusion' | 'roc' | 'importance' | 'learning' | 'regression'>(
    isRegression ? 'regression' : 'confusion'
  );

  if (!workflowState.datasetId || !trainingResults || !trainingResults.comparison) {
    return (
      <div className="text-gray-900 flex flex-col items-center justify-center p-20 h-96 bg-white rounded-xl border border-gray-200">
        <TrendingUp size={48} className="text-gray-900 text-gray-300 mb-4" />
        <h3 className="text-gray-900 text-xl font-medium text-gray-700">Visualisations non disponibles</h3>
        <p className="text-gray-900 text-gray-500 mt-2 text-center max-w-sm">
          L'accès aux graphiques nécessite un modèle préalablement entraîné.
        </p>
        <button
          onClick={() => navigate('/training')}
          className="text-gray-900 mt-6 px-6 py-3 bg-[#1E293B] text-white rounded-lg shadow-lg hover:bg-slate-800 transition-colors"
        >
          Lancer l'entraînement
        </button>
      </div>
    );
  }

  const { bestModel, comparison } = trainingResults;
  const metrics = comparison[bestModel] || {};

  // Extract data for visualizations from training results
  const confusionMatrixData = metrics.confusion_matrix ? [
    { predicted: 'Négatif', actual: 'Négatif', value: metrics.confusion_matrix?.[0]?.[0] || 0, color: '#10B981' },
    { predicted: 'Positif', actual: 'Négatif', value: metrics.confusion_matrix?.[0]?.[1] || 0, color: '#EF4444' },
    { predicted: 'Négatif', actual: 'Positif', value: metrics.confusion_matrix?.[1]?.[0] || 0, color: '#EF4444' },
    { predicted: 'Positif', actual: 'Positif', value: metrics.confusion_matrix?.[1]?.[1] || 0, color: '#10B981' },
  ] : [];

  const rocCurveData = metrics.roc_curve || [];

  // For regression: Scatter plot of Predicted vs Actual
  const regressionData = metrics.predictions?.map((p: number, i: number) => ({
    actual: metrics.y_test ? metrics.y_test[i] : i,
    predicted: p
  })) || [];

  const featureImportanceData = (metrics.feature_importance || []).map((f: any) => ({
    feature: f.feature,
    importance: f.importance
  })).sort((a: any, b: any) => b.importance - a.importance);

  const learningCurveData = metrics.learning_curve || [];

  const COLORS = ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'];

  const tabs = [
    { id: 'confusion', label: 'Matrice de confusion', icon: Target, hidden: isRegression || !metrics.confusion_matrix },
    { id: 'regression', label: 'Prédictions vs Réel', icon: TrendingUp, hidden: !isRegression || !metrics.predictions },
    { id: 'roc', label: 'Courbe ROC', icon: Activity, hidden: isRegression || !metrics.roc_curve },
    { id: 'importance', label: 'Importance features', icon: Layers, hidden: !metrics.feature_importance },
    { id: 'learning', label: 'Apprentissage', icon: BarChart3, hidden: !metrics.learning_curve },
  ].filter(t => !t.hidden);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-gray-900 mb-8 flex items-center justify-between p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-gray-900 text-3xl font-bold text-gray-900 mb-2">Visualisation des résultats</h1>
          <p className="text-gray-900 text-gray-500">Analyse approfondie pour : <span className="font-bold text-blue-600 underline decoration-blue-100 underline-offset-4">{bestModel}</span></p>
        </div>
        <button
          onClick={() => navigate('/results')}
          className="text-gray-900 flex items-center gap-2 px-5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl hover:bg-white hover:shadow-md transition-all font-semibold text-gray-600"
        >
          <ArrowLeft size={18} />
          Retour
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="text-gray-900 flex gap-3 mb-6 overflow-x-auto pb-2 no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap border-2 ${isActive
                ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100'
                : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200 hover:text-gray-700'
                }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Visualization Content */}
      <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm min-h-[500px]">
        {/* Confusion Matrix */}
        {activeTab === 'confusion' && confusionMatrixData.length > 0 && (
          <div className="animation-slide-up">
            <h3 className="text-gray-900 text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Target className="text-blue-600" />
              Matrice de confusion
            </h3>
            <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto mb-12">
              {confusionMatrixData.map((cell, idx) => (
                <div
                  key={idx}
                  className="relative p-10 rounded-2xl border-2 transition-all hover:shadow-lg"
                  style={{
                    borderColor: cell.color,
                    backgroundColor: `${cell.color}05`
                  }}
                >
                  <div className="text-gray-900 text-center">
                    <div className="text-gray-900 text-6xl font-black mb-2" style={{ color: cell.color }}>
                      {cell.value}
                    </div>
                    <div className="text-gray-900 text-sm font-bold opacity-60 uppercase tracking-widest mb-1">
                      Prédit: {cell.predicted}
                    </div>
                    <div className="text-gray-900 text-xs font-medium text-gray-400">
                      Réel: {cell.actual}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Regression Scatter */}
        {activeTab === 'regression' && regressionData.length > 0 && (
          <div className="animation-slide-up">
            <h3 className="text-gray-900 text-xl font-bold text-gray-900 mb-6">Analyse des prédictions (Régression)</h3>
            <div className="h-[450px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" dataKey="actual" name="Valeur Réelle" stroke="#64748B" />
                  <YAxis type="number" dataKey="predicted" name="Prédiction" stroke="#64748B" />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Legend />
                  <Scatter name="Points de données" data={regressionData} fill="#3B82F6" opacity={0.6} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ROC Curve */}
        {activeTab === 'roc' && (
          <div className="animation-slide-up">
            <h3 className="text-gray-900 text-xl font-bold text-gray-900 mb-6">Courbe ROC</h3>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={rocCurveData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="fpr" stroke="#64748B" />
                  <YAxis stroke="#64748B" />
                  <Tooltip />
                  <Line type="monotone" dataKey="tpr" stroke="#3B82F6" strokeWidth={4} dot={false} />
                  <Line type="monotone" dataKey="fpr" stroke="#cbd5e1" strokeDasharray="5 5" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Feature Importance */}
        {activeTab === 'importance' && (
          <div className="animation-slide-up">
            <h3 className="text-gray-900 text-xl font-bold text-gray-900 mb-6">Importance des variables</h3>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={featureImportanceData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="feature" type="category" width={150} stroke="#64748B" fontSize={11} fontWeight="bold" />
                  <Tooltip />
                  <Bar dataKey="importance" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Learning Curve */}
        {activeTab === 'learning' && (
          <div className="animation-slide-up">
            <h3 className="text-gray-900 text-xl font-bold text-gray-900 mb-6">Évolution de l'apprentissage</h3>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={learningCurveData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="epoch" stroke="#64748B" />
                  <YAxis stroke="#64748B" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="trainLoss" name="Train Loss" stroke="#3B82F6" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="valLoss" name="Val Loss" stroke="#EC4899" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {tabs.length === 0 && (
          <div className="text-gray-900 flex flex-col items-center justify-center p-20 opacity-40">
            <Activity size={64} className="text-gray-900 mb-4" />
            <p className="text-gray-900 text-xl font-bold">Données visuelles limitées</p>
            <p className="text-gray-900 text-sm">Le modèle sélectionné ne fournit pas de graphiques détaillés.</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="text-gray-900 flex justify-end gap-4 mt-8">
        <button
          onClick={() => navigate('/export')}
          className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95"
        >
          Exporter le modèle gagnant
        </button>
      </div>
    </div>
  );
}
