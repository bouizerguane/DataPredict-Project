import { Target, Loader2, Database } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useWorkflow } from '../context/WorkflowContext';

export function TaskSelection() {
  const [processedHead, setProcessedHead] = useState<any[]>([]);
  const [processedColumns, setProcessedColumns] = useState<string[]>([]);

  const navigate = useNavigate();
  const location = useLocation();
  const { state, updateState } = useWorkflow();

  const { datasetId: locDatasetId, preprocessingResult: locResult, droppedColumns: locDropped } = location.state || {};
  const datasetId = locDatasetId || state.datasetId;
  const preprocessingResult = locResult || state.preprocessingResult;
  const droppedColumns = locDropped || state.droppedColumns;

  // No need for useEffect here as state is already updated by DataPreprocessing.tsx
  // Redundant updates can cause navigation issues.

  useEffect(() => {
    if (preprocessingResult?.exportedFilePath) {
      const fetchProcessedPreview = async () => {
        try {
          const response = await fetch(`/${preprocessingResult.exportedFilePath}`);
          if (response.ok) {
            const text = await response.text();
            const lines = text.split('\n').filter(line => line.trim() !== '').slice(0, 6);
            if (lines.length > 0) {
              const headers = lines[0]!.split(',').map(h => h.trim());
              setProcessedColumns(headers);
              const rows = lines.slice(1).map(line => {
                const values = line.split(',');
                return headers.reduce((obj, header, index) => {
                  obj[header] = values[index]?.trim() || '';
                  return obj;
                }, {} as any);
              });
              setProcessedHead(rows);
            }
          }
        } catch (error) {
          console.error("Failed to fetch processed preview", error);
        }
      };
      fetchProcessedPreview();
    }
  }, [datasetId, preprocessingResult, droppedColumns]);

  if (!datasetId) {
    return (
      <div className="flex flex-col items-center justify-center p-20 h-96 bg-white rounded-xl border border-gray-200">
        <Target size={48} className="text-gray-300 mb-4" />
        <h3 className="text-xl font-medium text-gray-700">Sélection de tâche impossible</h3>
        <p className="text-gray-500 mt-2 text-center max-w-sm">
          Aucun dataset n'est actuellement chargé. Veuillez importer vos données pour configurer vos tâches de prédiction.
        </p>
        <button
          onClick={() => navigate('/import')}
          className="mt-6 px-6 py-3 btn-primary transition-colors"
        >
          Aller à l'importation
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="page-title mb-1 text-teal-700">Revue des données</h2>
        <p className="text-gray-600 font-medium italic">Vérifiez les données prétraitées avant de passer à la sélection de la cible.</p>
      </div>

      <div className="space-y-6 mb-8">
        {processedHead.length > 0 && (
          <div className="card mb-8 shadow-lg border-teal-100">
            <h3 className="subsection-title mb-4 flex items-center gap-2 text-teal-600">
              <Database size={20} />
              Aperçu des données prétraitées
            </h3>
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full">
                <thead>
                  <tr className="bg-teal-50 border-b border-teal-100">
                    {processedColumns.map((col) => (
                      <th key={col} className="text-left p-4 text-xs font-bold text-teal-700 uppercase tracking-wider whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {processedHead.map((row, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-teal-50/30 transition-colors">
                      {processedColumns.map((col) => (
                        <td key={`${index}-${col}`} className="p-4 text-sm text-gray-700 whitespace-nowrap">
                          {row[col]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-4 mt-12 bg-gray-50/50 p-6 rounded-2xl border border-dashed border-gray-200">
          <button
            onClick={() => navigate('/preprocessing')}
            className="px-8 py-3 bg-white border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-all shadow-sm"
          >
            Retour
          </button>
          <button
            onClick={() => {
              console.log("Navigating to /variable-selection with state:", { datasetId, preprocessingResult, droppedColumns });
              navigate('/variable-selection', { state: { datasetId, preprocessingResult, droppedColumns } });
            }}
            className="px-10 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-all shadow-md hover:shadow-teal-200"
          >
            Continuer vers la cible
          </button>
        </div>
      </div>
    </div>
  );
}
