import { Database, Info, Loader2, TrendingUp } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useWorkflow } from "../context/WorkflowContext";

interface DatasetStats {
  description: Record<string, any>;
  info: {
    columns: string[];
    shape: [number, number];
    dtypes: Record<string, string>;
    missing_values: Record<string, number>;
  };
  head: Record<string, any>[];
  rowCount?: number;
  colCount?: number;
}

interface ColumnData {
  name: string;
  type: string;
  missing: string;
  details: string;
}

export function DataExploration() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state: workflowState, updateState } = useWorkflow();
  const datasetId = location.state?.datasetId || workflowState.datasetId;

  const [stats, setStats] = useState<DatasetStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!datasetId) return;
    if (datasetId !== workflowState.datasetId) {
      updateState({ datasetId });
    }

    const fetchStats = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/datasets/${datasetId}/stats`);
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Failed to fetch statistics");
        }
        const data = await response.json();
        setStats(data);
      } catch (err: any) {
        setError("Impossible de charger les statistiques du dataset");
        toast.error("Impossible de charger les statistiques");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [datasetId]);

  if (!datasetId) {
    return (
      <div className=" flex flex-col items-center justify-center p-20 h-96 bg-white rounded-xl border border-gray-200">
        <Database size={48} className=" text-gray-300 mb-4" />
        <h3 className=" text-xl font-medium text-gray-700">Aucun dataset exploré</h3>
        <p className=" text-gray-500 mt-2 text-center max-w-sm">
          Importez un fichier CSV pour voir les statistiques détaillées et l'aperçu des données.
        </p>
        <button
          onClick={() => navigate('/import')}
          className=" mt-6 px-6 py-3 btn-primary transition-colors"
        >
          Importer un dataset
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className=" flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="animate-spin text-teal-600" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto text-center">
        <h2 className=" text-xl text-red-600">{error}</h2>
      </div>
    );
  }

  if (!stats) return null;

  // Process stats for display
  const totalRows = stats.rowCount || stats.info.shape[0];
  const totalCols = stats.colCount || stats.info.shape[1];
  const qualityScore = (stats as any).qualityScore;

  // Calculate total missing percentage
  const totalCells = totalRows * totalCols;
  const totalMissingCount = Object.values(stats.info.missing_values).reduce(
    (a, b) => a + b,
    0
  );
  const totalMissingPercentage =
    ((totalMissingCount / totalCells) * 100).toFixed(2) + "%";

  const columnsList: ColumnData[] = stats.info.columns.map((colName) => {
    const type = stats.info.dtypes[colName] || "unknown";
    const missingCount = stats.info.missing_values[colName] || 0;
    const missing = ((missingCount / totalRows) * 100).toFixed(1) + "%";

    // Determine friendly type name
    let friendlyType = "Autre";
    const isAllMissing = missingCount === totalRows && totalRows > 0;

    if (type.includes("int") || type.includes("float")) friendlyType = "Numérique";
    else if (type.includes("object") || type.includes("string")) friendlyType = "Texte";
    else if (type.includes("bool")) friendlyType = "Booléen";
    else if (type.includes("datetime")) friendlyType = "Temporel";

    // Get stats details if available
    let details = "";
    const colStats = stats.description[colName];

    if (isAllMissing) {
      details = "Aucune donnée détectée dans cette colonne.";
    } else if (friendlyType === "Numérique" && colStats) {
      details = `Min: ${colStats.min !== undefined ? Number(colStats.min).toFixed(1) : 'N/A'}, Max: ${colStats.max !== undefined ? Number(colStats.max).toFixed(1) : 'N/A'}, Moy: ${colStats.mean !== undefined ? Number(colStats.mean).toFixed(1) : 'N/A'}`;
    } else if (friendlyType === "Texte") {
      details = "Texte libre / NLP";
    } else {
      details = type || "";
    }

    return {
      name: colName,
      type: isAllMissing ? "Vide" : friendlyType,
      missing,
      details,
    };
  });

  // Check for suspicious parsing (e.g. delimiters in values)
  const isSuspiciousParse = stats.head && stats.head.length > 0 &&
    stats.info.columns.length > 1 &&
    stats.head.every(row => {
      const colName = stats.info.columns[0];
      if (!colName) return false;
      const firstVal = String(row[colName]);
      return firstVal.includes(',') || firstVal.includes(';') || firstVal.includes('\t');
    }) &&
    columnsList.slice(1).every(col => col.missing === "100.0%");

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className=" mb-6 flex justify-between items-end">
        <div>
          <h2 className=" page-title mb-1">
            Exploration des données
          </h2>
          <p className=" text-gray-600">Aperçu et statistiques de votre dataset</p>
        </div>
        {qualityScore !== undefined && (
          <div className="text-right">
            <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Score de qualité AI</div>
            <div className={`text-2xl font-bold ${qualityScore > 80 ? 'text-teal-600' : qualityScore > 50 ? 'text-amber-500' : 'text-rose-500'}`}>
              {qualityScore}%
            </div>
          </div>
        )}
      </div>

      {isSuspiciousParse && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <Info className="text-amber-600 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="text-amber-900 font-bold text-sm">Problème de délimiteur suspecté</h4>
            <p className="text-amber-700 text-sm">
              Il semble que les données n'ont pas été séparées correctement. Vérifiez que le délimiteur (virgule, point-virgule) de votre fichier est cohérent entre l'en-tête et les lignes de données.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="card">
          <div className=" text-sm  text-gray-600 mb-1">Lignes</div>
          <div className="page-title text-xl font-bold">
            {totalRows.toLocaleString()}
          </div>
        </div>
        <div className="card">
          <div className=" text-sm  text-gray-600 mb-1">Colonnes</div>
          <div className="page-title text-xl font-bold">{totalCols}</div>
        </div>
        <div className="card">
          <div className=" text-sm  text-gray-600 mb-1">Manquantes</div>
          <div className="page-title text-xl font-bold">
            {totalMissingPercentage}
          </div>
        </div>
        <div className="card">
          <div className=" text-sm  text-gray-600 mb-1 font-semibold">Cible suggérée</div>
          <div className=" text-xl  text-teal-600 font-bold truncate">
            {workflowState.targetVariable || stats.info.columns[stats.info.columns.length - 1]}
          </div>
        </div>
        <div className="card bg-teal-50 border-teal-100">
          <div className=" text-sm  text-teal-700 mb-1 font-semibold">Type de contenu</div>
          <div className=" text-xl  text-teal-900 font-bold capitalize">
            {(stats as any).contentType || "Tabulaire"}
          </div>
        </div>
      </div>

      {/* Correlation Section if available */}
      {(stats as any).correlations && Object.keys((stats as any).correlations).length > 0 && (
        <div className="card mb-6 overflow-hidden">
          <h3 className="subsection-title mb-4 flex items-center gap-2 px-1">
            <TrendingUp size={20} className="text-teal-600" />
            Corrélations Linéaires (Pearson)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-[10px] md:text-xs">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="p-2 border border-gray-100 text-left">Feature</th>
                  {Object.keys((stats as any).correlations).map(col => (
                    <th key={col} className="p-2 border border-gray-100 text-center font-bold">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries((stats as any).correlations).map(([rowCol, values]: [string, any]) => (
                  <tr key={rowCol} className="hover:bg-gray-50/30">
                    <td className="p-2 border border-gray-100 font-semibold bg-gray-50/50">{rowCol}</td>
                    {Object.keys((stats as any).correlations).map(col => {
                      const val = values[col] as number;
                      const isSelf = rowCol === col;
                      const bgColor = isSelf ? 'bg-gray-100/50' :
                        val > 0.7 ? 'bg-teal-100/50' :
                          val < -0.7 ? 'bg-rose-100/50' :
                            Math.abs(val) > 0.3 ? 'bg-amber-50/50' : 'bg-white';
                      return (
                        <td key={col} className={`p-2 border border-gray-100 text-center ${bgColor} font-medium`}>
                          {val !== null && val !== undefined ? val.toFixed(2) : "0.00"}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-[10px] text-gray-500 italic px-1">
            * Les valeurs proches de 1 ou -1 indiquent une forte corrélation.
          </p>
        </div>
      )}

      <div className="card mb-6">
        <h3 className=" subsection-title mb-4 flex items-center gap-2">
          <Database size={20} />
          Aperçu du tableau
        </h3>
        {stats.head && stats.head.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  {stats.info.columns.map((col) => (
                    <th
                      key={col}
                      className=" text-left p-3 text-sm text-gray-600 whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.head.map((row, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-200 hover:bg-teal-50/10 transition-colors"
                  >
                    {stats.info.columns.map((col) => (
                      <td
                        key={`${index}-${col}`}
                        className="p-3 text-sm whitespace-nowrap text-gray-700"
                      >
                        {row[col] !== null && row[col] !== undefined
                          ? String(row[col])
                          : ""}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
            L'aperçu des données brutes n'est pas disponible.
          </div>
        )}
      </div>

      <div className="card mb-6">
        <h3 className=" subsection-title mb-4 flex items-center gap-2">
          <Info size={20} />
          Analyse détaillée des colonnes
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 font-bold">
                <th className="text-left p-3 text-sm text-gray-700">Colonne</th>
                <th className="text-left p-3 text-sm text-gray-700">Type</th>
                <th className="text-left p-3 text-sm text-gray-700">Manquantes</th>
                <th className="text-left p-3 text-sm text-gray-700">Insights / Stats</th>
              </tr>
            </thead>
            <tbody>
              {columnsList.map((col, idx) => (
                <tr
                  key={idx}
                  className="border-b border-gray-200 hover:bg-teal-50/30 transition-colors"
                >
                  <td className=" p-3 font-medium text-gray-800">{col.name}</td>
                  <td className=" p-3">
                    <span
                      className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${col.type === "Numérique"
                        ? "bg-blue-100 text-blue-700 border border-blue-200"
                        : col.type === "Texte"
                          ? "bg-purple-100 text-purple-700 border border-purple-200"
                          : col.type === "Temporel"
                            ? "bg-amber-100 text-amber-700 border border-amber-200"
                            : "bg-teal-100 text-teal-700 border border-teal-200"
                        }`}
                    >
                      {col.type}
                    </span>
                  </td>
                  <td className=" p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${parseFloat(col.missing) > 10 ? 'bg-rose-500' : 'bg-teal-500'}`}
                          style={{ width: col.missing }}
                        ></div>
                      </div>
                      <span className="text-xs font-semibold text-gray-600">{col.missing}</span>
                    </div>
                  </td>
                  <td className=" p-3 text-xs text-gray-600 italic leading-relaxed">{col.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className=" flex justify-end gap-4">
        <button
          onClick={() => navigate("/import")}
          className="px-6 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Retour
        </button>
        <button
          onClick={() => navigate("/preprocessing", { state: { datasetId } })}
          className="px-6 py-3 btn-primary transition-colors"
        >
          Continuer vers le Prétraitement
        </button>
      </div>
    </div>
  );
}
