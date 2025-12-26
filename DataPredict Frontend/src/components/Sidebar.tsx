import { Link, useLocation } from 'react-router-dom';
import { Home, Upload, Database, Settings, Sliders, Target, GitBranch, Play, BarChart3, GitCompare, LineChart, Download, History, Lock, Menu, X, Check } from 'lucide-react';
import { useWorkflow } from '../context/WorkflowContext';
import { useState } from 'react';

export function Sidebar() {
  const location = useLocation();
  const { state } = useWorkflow();
  const hasDataset = !!state.datasetId;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: Home, requiresDataset: false },
    { id: 'import', label: 'Importer dataset', icon: Upload, requiresDataset: false },
    { id: 'exploration', label: 'Explorer les données', icon: Database, requiresDataset: true },
    { id: 'preprocessing', label: 'Prétraitement', icon: Settings, requiresDataset: true },
    { id: 'task-selection', label: 'Sélection de tâche', icon: Target, requiresDataset: true },
    { id: 'variable-selection', label: 'Sélection variables', icon: Sliders, requiresDataset: true },
    { id: 'model-recommendation', label: 'Recommandation IA', icon: GitBranch, requiresDataset: true },

    { id: 'training', label: 'Entraînement', icon: Play, requiresDataset: true },
    { id: 'results', label: 'Résultats', icon: BarChart3, requiresDataset: true },
    { id: 'comparison', label: 'Comparaison', icon: GitCompare, requiresDataset: true },
    { id: 'visualization', label: 'Visualisation', icon: LineChart, requiresDataset: true },
    { id: 'export', label: 'Exportation', icon: Download, requiresDataset: true },
    { id: 'history', label: 'Historique', icon: History, requiresDataset: false },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900 text-white rounded-lg shadow-lg hover:bg-slate-800 transition-colors"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64
          bg-white
          border-r border-gray-200
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          shadow-xl lg:shadow-none
        `}
      >
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-transparent">
            DataPredict
          </h1>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const path = `/${item.id}`;
            const isActive = location.pathname === path;

            // Sequential disabling logic
            const isCompleted = (id: string) => {
              switch (id) {
                case 'import': return !!state.datasetId;
                case 'exploration': return !!state.datasetId;
                case 'preprocessing': return !!state.preprocessingResult;
                case 'task-selection': return !!state.preprocessingResult;
                case 'variable-selection': return !!state.featureSelectionResult;
                case 'model-recommendation': return !!state.recommendations;

                case 'training': return !!state.trainingResults;
                default: return false;
              }
            };

            let isDisabled = false;
            if (item.requiresDataset) {
              if (index > 0) {
                const prevItem = menuItems[index - 1];
                if (prevItem && prevItem.requiresDataset) {
                  isDisabled = !isCompleted(prevItem.id);
                } else if (!hasDataset) {
                  isDisabled = true;
                }
              }
            }

            // Custom strict overrides
            if (item.id === 'exploration' || item.id === 'preprocessing') isDisabled = !state.datasetId;
            if (item.id === 'task-selection' || item.id === 'variable-selection') isDisabled = !state.preprocessingResult;
            if (item.id === 'model-recommendation') isDisabled = !state.preprocessingResult; // Needs prep at least

            if (item.id === 'training') isDisabled = !state.recommendations;
            if (['results', 'comparison', 'visualization', 'export'].includes(item.id)) isDisabled = !state.trainingResults;

            if (isDisabled) {
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 cursor-not-allowed"
                  title="Cette étape n'est pas encore disponible"
                >
                  <Icon size={20} className="flex-shrink-0" />
                  <span className="text-sm font-medium">{item.label}</span>
                  <Lock size={14} className="ml-auto opacity-50" />
                </div>
              );
            }

            const isStepDone = isCompleted(item.id);

            return (
              <Link
                key={item.id}
                to={path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-all duration-200
                  ${isActive
                    ? 'bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-md'
                    : isStepDone
                      ? 'text-emerald-600 hover:bg-emerald-50'
                      : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <Icon size={20} className="flex-shrink-0" />
                <span>{item.label}</span>
                {isStepDone && !isActive && <Check size={16} className="ml-auto text-emerald-500" />}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
