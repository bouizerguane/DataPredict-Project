import { Settings, ChevronRight, Loader2, Trash2, Info, BarChart as BarChartIcon, Database } from 'lucide-react';
import ReactWordcloud from 'react-wordcloud';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useWorkflow } from '../context/WorkflowContext';

interface PreprocessingConfig {
  fillna: {
    method: string;
  };
  drop_columns: string[];
}

interface NLPColumnStats {
  total_texts: number;
  non_empty_texts: string;
  unique_texts: number;
  avg_word_count: number;
  top_words: Record<string, string>;
  top_bigrams: Record<string, string>;
  sentiment_analysis: {
    positive_count: number;
    negative_count: number;
    neutral_count: number;
    avg_sentiment: number;
  };
}

type NLPStats = Record<string, NLPColumnStats>;

const wordCloudOptions = {
  colors: ['#0D9488', '#0891B2', '#4F46E5', '#7C3AED', '#DB2777', '#E11D48', '#EA580C'],
  enableTooltip: true,
  deterministic: false,
  fontFamily: 'Inter',
  fontSizes: [20, 60] as [number, number],
  fontStyle: 'normal',
  fontWeight: 'bold',
  padding: 3,
  rotations: 2,
  rotationAngles: [0, 90] as [number, number],
  scale: 'sqrt' as 'sqrt',
  spiral: 'rectangular' as 'rectangular',
  transitionDuration: 1000,
};

export function DataPreprocessing() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state: workflowState, updateState } = useWorkflow();
  const datasetId = location.state?.datasetId || workflowState.datasetId;

  const [loading, setLoading] = useState(false);
  const [columns, setColumns] = useState<string[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [missingStrategy, setMissingStrategy] = useState('mean');
  const [availableTextColumns, setAvailableTextColumns] = useState<string[]>([]);
  const [nlpStats, setNlpStats] = useState<NLPStats | null>(null);
  const [analyzedColumn, setAnalyzedColumn] = useState<string | null>(null);
  const [loadingNlp, setLoadingNlp] = useState(false);
  const [processedHead, setProcessedHead] = useState<any[]>([]);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  useEffect(() => {
    if (!datasetId) return;

    const fetchColumns = async () => {
      try {
        const response = await fetch(`/api/datasets/${datasetId}/stats`);
        if (response.ok) {
          const data = await response.json();
          const allCols = data.info.columns || [];
          setColumns(allCols);

          const dtypes = data.info.dtypes || {};
          const textCols = allCols.filter((col: string) =>
            dtypes[col] === 'object' || dtypes[col] === 'string'
          );
          setAvailableTextColumns(textCols);
        }
      } catch (error) {
        console.error("Failed to fetch columns", error);
        toast.error("Erreur lors du chargement des colonnes");
      }
    };

    const fetchPreview = async () => {
      setIsLoadingPreview(true);
      try {
        const response = await fetch(`/api/datasets/${datasetId}/preview?rows=5`);
        if (response.ok) {
          const data = await response.json();
          setProcessedHead(data);
        }
      } catch (error) {
        console.error("Failed to fetch preview", error);
      } finally {
        setIsLoadingPreview(false);
      }
    };

    fetchColumns();
    fetchPreview();
  }, [datasetId, navigate]);
  const analyzeColumn = async (columnName: string) => {
    setLoadingNlp(true);
    setAnalyzedColumn(columnName);
    try {
      const nlpResponse = await fetch(`/api/datasets/${datasetId}/nlp-analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text_columns: [columnName] })
      });
      if (nlpResponse.ok) {
        const data = await nlpResponse.json();
        setNlpStats(data);
      }
    } catch (error) {
      console.error("Analysis failed", error);
      toast.error("Échec de l'analyse NLP");
    } finally {
      setLoadingNlp(false);
    }
  };

  const currentStats = (nlpStats && analyzedColumn) ? nlpStats[analyzedColumn] : null;
  const topWordsData = currentStats ? Object.entries(currentStats.top_words)
    .sort(([, a], [, b]) => Number(b) - Number(a))
    .slice(0, 20)
    .map(([word, count]) => ({ text: word, value: Number(count) })) : [];

  const handleApplyPreprocessing = async () => {
    if (columns.length - selectedColumns.length < 2) {
      toast.error("Le dataset doit contenir au moins 2 colonnes pour l'analyse.");
      return;
    }

    setLoading(true);
    const payload = {
      fillna: {
        method: missingStrategy
      },
      "drop_columns": selectedColumns
    };

    try {
      const response = await fetch(`/api/datasets/${datasetId}/preprocess`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Preprocessing failed');
      }

      const result = await response.json();
      toast.success('Prétraitement terminé avec succès');

      updateState({
        preprocessingResult: result,
        datasetId: datasetId,
        droppedColumns: selectedColumns
      });

      navigate('/task-selection', {
        state: {
          datasetId,
          preprocessingResult: result,
          droppedColumns: selectedColumns
        }
      });

    } catch (error) {
      console.error('Preprocessing error:', error);
      toast.error("Erreur lors du prétraitement");
    } finally {
      setLoading(false);
    }
  };

  const toggleColumn = (col: string) => {
    if (selectedColumns.includes(col)) {
      setSelectedColumns(selectedColumns.filter(c => c !== col));
    } else {
      setSelectedColumns([...selectedColumns, col]);
    }
  };

  if (!datasetId) {
    return (
      <div className="text-gray-900 flex flex-col items-center justify-center p-20 h-96 bg-white rounded-xl border border-gray-200">
        <Settings size={48} className="text-gray-900 text-gray-300 mb-4" />
        <h3 className="text-gray-900 text-xl font-medium text-gray-700 -slate-300">Prétraitement indisponible</h3>
        <p className="text-gray-900 text-gray-500 mt-2 text-center max-w-sm">
          Vous devez d'abord importer un dataset avant de pouvoir le préparer pour l'entraînement.
        </p>
        <button
          onClick={() => navigate('/import')}
          className="text-gray-900 mt-6 px-6 py-3 btn-primary transition-colors"
        >
          Aller à l'importation
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="text-gray-900 mb-6">
        <h2 className="text-gray-900 page-title mb-1">Prétraitement des données</h2>
        <p className="text-gray-900 text-gray-600">Configurez les étapes de préparation de vos données</p>
      </div>

      <div className="card mb-6">
        <h3 className="subsection-title mb-4 flex items-center gap-2">
          <BarChartIcon size={20} />
          Analyse NLP (Nuage de mots)
        </h3>

        {availableTextColumns.length > 0 ? (
          <>
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 block mb-2">Choisir une colonne texte :</label>
              <select
                value={analyzedColumn || ''}
                onChange={(e) => analyzeColumn(e.target.value)}
                className="w-full md:w-64 px-3 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm cursor-pointer shadow-sm"
              >
                <option value="" disabled>Sélectionner...</option>
                {availableTextColumns.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>

            {loadingNlp && (
              <div className="flex justify-center p-12">
                <Loader2 className="animate-spin text-teal-600" size={32} />
              </div>
            )}

            {currentStats && !loadingNlp && (
              <div className="flex flex-col gap-8">
                <div className="bg-gray-50 rounded-xl p-8 border border-gray-100 min-h-[400px]">
                  <h4 className="text-lg font-medium text-gray-700 mb-2 text-center">Top 20 Mots ({analyzedColumn})</h4>
                  <div className="h-[350px] w-full flex items-center justify-center">
                    <ReactWordcloud words={topWordsData} options={wordCloudOptions} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="text-sm text-gray-500">Mots uniques</div>
                    <div className="text-xl font-semibold text-gray-800">{currentStats.unique_texts.toLocaleString()}</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="text-sm text-gray-500">Moy. mots/texte</div>
                    <div className="text-xl font-semibold text-gray-800">{currentStats.avg_word_count.toFixed(1)}</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                    <div className="text-sm text-green-700">Sentiments Positifs</div>
                    <div className="text-xl font-semibold text-green-800">{currentStats.sentiment_analysis.positive_count}</div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                    <div className="text-sm text-red-700">Sentiments Négatifs</div>
                    <div className="text-xl font-semibold text-red-800">{currentStats.sentiment_analysis.negative_count}</div>
                  </div>
                </div>
              </div>
            )}

            {!currentStats && !loadingNlp && (
              <div className="text-center py-8 text-gray-500 italic">
                Séléctionnez une colonne pour générer le nuage de mots.
              </div>
            )}
          </>
        ) : (
          <div className="p-6 bg-gray-50 border border-dashed border-gray-300 rounded-lg text-center text-gray-500">
            <Info size={24} className="mx-auto mb-2 opacity-30" />
            <p>Aucune colonne textuelle n'a été détectée dans ce dataset pour l'analyse NLP.</p>
          </div>
        )}
      </div>

      <div className="card mb-6">
        <h3 className="subsection-title mb-4 flex items-center gap-2">
          <Database size={20} />
          Aperçu des données brutes
        </h3>
        {isLoadingPreview ? (
          <div className="flex justify-center p-8"><Loader2 className="animate-spin text-teal-600" /></div>
        ) : processedHead.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  {columns.filter(c => !selectedColumns.includes(c)).map(col => (
                    <th key={col} className="p-3 text-left font-semibold text-gray-700">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {processedHead.map((row, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                    {columns.filter(c => !selectedColumns.includes(c)).map(col => (
                      <td key={col} className="p-3 text-gray-600 truncate max-w-[150px]">{row[col]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-400">Aucun aperçu disponible</div>
        )}
      </div>

      <div className="card mb-6">
        <h3 className="text-gray-900 subsection-title mb-4 flex items-center gap-2">
          <Settings size={20} />
          Gestion des valeurs manquantes (fillna)
        </h3>
        <p className="text-gray-900 text-sm text-gray-500 mb-4">Choisissez comment remplacer les valeurs manquantes dans votre dataset.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { value: 'mean', label: 'Moyenne (Mean)', desc: 'Pour les variables numériques (ex: Age)' },
            { value: 'median', label: 'Médiane', desc: 'Robuste aux valeurs aberrantes' },
            { value: 'mode', label: 'Mode', desc: 'Valeur la plus fréquente' },
            { value: 'zero', label: 'Zéro / Inconnu', desc: '0 pour nombres, "Unknown" pour texte' },
            { value: 'drop', label: 'Suppression (Drop)', desc: 'Supprimer les lignes incomplètes' }
          ].map((option) => (
            <label key={option.value} className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${missingStrategy === option.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
              <input
                type="radio"
                name="missing"
                value={option.value}
                checked={missingStrategy === option.value}
                onChange={(e) => setMissingStrategy(e.target.value)}
                className="text-gray-900 mt-1 w-4 h-4 text-blue-600 -blue-400"
              />
              <div>
                <div className="font-medium text-gray-900 -white">{option.label}</div>
                <div className="text-gray-900 text-sm text-gray-900 text-gray-600">{option.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="card mb-6">
        <h3 className="text-gray-900 subsection-title mb-4 flex items-center gap-2">
          <Trash2 size={20} />
          Suppression de colonnes (drop_columns)
        </h3>
        <p className="text-gray-900 text-sm text-gray-500 mb-4">Sélectionnez les colonnes à retirer du dataset final (ex: ID, dates inutiles).</p>

        {columns.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-60 overflow-y-auto p-2 border border-gray-100 rounded-lg">
            {columns.map(col => (
              <label key={col} className={`flex items-center gap-2 p-2 rounded text-sm cursor-pointer border ${selectedColumns.includes(col) ? 'bg-red-50 border-red-200 text-red-700' : 'bg-white border-transparent hover:bg-gray-50'}`}>
                <input
                  type="checkbox"
                  checked={selectedColumns.includes(col)}
                  onChange={() => toggleColumn(col)}
                  className="rounded text-red-600 focus:ring-red-500"
                />
                <span className="truncate" title={col}>{col}</span>
              </label>
            ))}
          </div>
        ) : (
          <div className="text-gray-900 text-center py-4 text-gray-500">Chargement des colonnes...</div>
        )}

        {selectedColumns.length > 0 && (
          <div className="text-gray-900 mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-start gap-2">
            <Info size={16} className="text-gray-900 mt-0.5 shrink-0" />
            <span>{selectedColumns.length} colonne(s) seront supprimée(s) : {selectedColumns.join(', ')}</span>
          </div>
        )}
      </div>

      <div className="card mb-6">
        <h3 className="text-gray-900 subsection-title mb-4">Résumé de la configuration</h3>
        <div className="text-gray-900 flex items-center gap-4 flex-wrap text-sm">
          <div className="px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="font-semibold text-gray-900 text-blue-900 block mb-1">Stratégie manquantes</span>
            <span className="text-gray-900 text-blue-700">{missingStrategy.charAt(0).toUpperCase() + missingStrategy.slice(1)}</span>
          </div>
          <ChevronRight className="text-gray-900 text-gray-400" />
          <div className={`px-4 py-3 border rounded-lg ${selectedColumns.length > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
            <span className={`font-semibold block mb-1 ${selectedColumns.length > 0 ? 'text-red-900' : 'text-gray-900'}`}>Colonnes à supprimer</span>
            <span className={`${selectedColumns.length > 0 ? 'text-red-700' : 'text-gray-600'}`}>
              {selectedColumns.length > 0 ? `${selectedColumns.length} colonne(s)` : 'Aucune'}
            </span>
          </div>
        </div>
      </div>

      <div className="text-gray-900 flex justify-end gap-4">
        <button
          onClick={() => navigate('/exploration')}
          className="px-6 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Retour
        </button>
        <button
          onClick={handleApplyPreprocessing}
          disabled={loading}
          className="px-6 py-3 btn-primary transition-colors flex items-center gap-2"
        >
          {loading && <Loader2 size={18} className="animate-spin" />}
          Appliquer et Continuer
        </button>
      </div>
    </div>
  );
}
