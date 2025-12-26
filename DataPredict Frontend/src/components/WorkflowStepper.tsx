import { useNavigate, useLocation } from 'react-router-dom';
import { useWorkflow } from '../context/WorkflowContext';
import { Check, ChevronRight, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const steps = [
    { id: 'import', label: 'Import', path: '/import' },
    { id: 'exploration', label: 'Exploration', path: '/exploration' },
    { id: 'preprocessing', label: 'Prétraitement', path: '/preprocessing' },
    { id: 'task-selection', label: 'Tâche', path: '/task-selection' },
    { id: 'variable-selection', label: 'Variables', path: '/variable-selection' },
    { id: 'model-recommendation', label: 'Recommandation', path: '/model-recommendation' },
    { id: 'training', label: 'Entraînement', path: '/training' },
    { id: 'results', label: 'Résultats', path: '/results' },
    { id: 'export', label: 'Exportation', path: '/export' },
];

export function WorkflowStepper() {
    const navigate = useNavigate();
    const location = useLocation();
    const { state, clearState } = useWorkflow();

    const currentStepIndex = steps.findIndex(s => s.path === location.pathname);

    const isStepCompleted = (index: number) => {
        const step = steps[index];
        if (!step) return false;
        switch (step.id) {
            case 'import': return !!state.datasetId;
            case 'exploration': return !!state.datasetId;
            case 'preprocessing': return !!state.preprocessingResult;
            case 'task-selection': return !!state.preprocessingResult;
            case 'variable-selection': return !!state.featureSelectionResult;
            case 'model-recommendation': return !!state.recommendations;
            case 'training': return !!state.trainingResults;
            case 'results': return !!state.trainingResults;
            case 'export': return !!state.trainingResults; // Enabled if results are there
            default: return false;
        }
    };

    const isStepDisabled = (index: number) => {
        const step = steps[index];
        if (!step || index === 0) return false;

        // Strict sequential dependency
        const prevStep = steps[index - 1];
        if (prevStep && !isStepCompleted(index - 1)) return true;

        // Domain specific overrides
        if (step.id === 'exploration' || step.id === 'preprocessing') return !state.datasetId;
        if (step.id === 'task-selection' || step.id === 'variable-selection') return !state.preprocessingResult;
        if (step.id === 'model-recommendation') return !state.preprocessingResult;
        if (step.id === 'training') return !state.recommendations;
        if (['results', 'comparison', 'visualization', 'export'].includes(step.id)) return !state.trainingResults;

        return false;
    };

    const handleReset = () => {
        if (window.confirm("Voulez-vous vraiment annuler le modèle actuel ? Toutes les données de ce workflow seront effacées.")) {
            clearState();
            navigate('/dashboard');
            toast.success("Modèle annulé et données réinitialisées");
        }
    };

    if (currentStepIndex === -1 && location.pathname !== '/dashboard' && location.pathname !== '/history') return null;
    // Don't show stepper on dashboard or history
    if (['/dashboard', '/history', '/login', '/register'].includes(location.pathname)) return null;

    return (
        <div className="bg-white border-b border-gray-200 px-6 py-4 mb-6 sticky top-0 z-20">
            <div className="max-w-6xl mx-auto flex items-center justify-between overflow-x-auto no-scrollbar gap-4 py-1">
                {steps.map((step, index) => {
                    const isActive = index === currentStepIndex;
                    const isCompleted = isStepCompleted(index);
                    const isDisabled = isStepDisabled(index);

                    return (
                        <div key={step.id} className="flex items-center gap-2 flex-shrink-0">
                            <button
                                disabled={isDisabled}
                                onClick={() => !isDisabled && navigate(step.path)}
                                className={`
                  flex items-center gap-2 group transition-all
                  ${isDisabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer hover:scale-105'}
                `}
                            >
                                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                  ${isActive
                                        ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] ring-2 ring-blue-100 ring-offset-2'
                                        : isCompleted
                                            ? 'bg-green-500 text-white shadow-sm'
                                            : 'bg-gray-100 text-gray-500 border border-gray-200 group-hover:bg-gray-200'
                                    }
                `}>
                                    {isCompleted && !isActive ? <Check size={16} strokeWidth={3} /> : index + 1}
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className={`
                    text-[11px] uppercase tracking-wider font-bold
                    ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'}
                  `}>
                                        Étape {index + 1}
                                    </span>
                                    <span className={`
                    text-sm font-semibold whitespace-nowrap
                    ${isActive ? 'text-gray-900' : isCompleted ? 'text-gray-700' : 'text-gray-500'}
                  `}>
                                        {step.label}
                                    </span>
                                </div>
                            </button>
                            {index < steps.length - 1 && (
                                <div className="flex items-center mx-1">
                                    <div className={`h-[2px] w-4 ${isCompleted ? 'bg-green-200' : 'bg-gray-100'}`}></div>
                                    <ChevronRight size={14} className={isCompleted ? 'text-green-300' : 'text-gray-300'} />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="max-w-6xl mx-auto flex justify-end mt-4 pt-4 border-t border-gray-100">
                <button
                    onClick={handleReset}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                    <Trash2 size={16} />
                    Annuler le modèle actuel
                </button>
            </div>
        </div>
    );
}
