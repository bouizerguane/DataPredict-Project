import { Upload, File, CheckCircle, Loader2, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useWorkflow } from "../context/WorkflowContext";

export function DatasetImport() {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { state: workflowState, updateState } = useWorkflow();
  const [metadata, setMetadata] = useState<{
    rowCount: number | null;
    columnCount: number | null;
    contentType: string | null;
    targetVariable: string | null;
  } | null>(null);

  const [localMetadata, setLocalMetadata] = useState<{
    rowCount: number | null;
    columnCount: number | null;
  } | null>(null);
  const [isAnalyzed, setIsAnalyzed] = useState(false);

  // Client-side preview for CSV
  useEffect(() => {
    if (file && file.name.endsWith(".csv")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = (e.target?.result as string) || "";
        const lines = text.split(/\r?\n/).filter(l => l.trim() !== "");
        if (lines.length > 0 && lines[0]) {
          const colCount = lines[0].split(",").length;
          const rCount = Math.max(0, lines.length - 1);
          setLocalMetadata({ rowCount: rCount, columnCount: colCount });
        }
      };
      // Read up to 2MB for a quick preview
      reader.readAsText(file.slice(0, 2 * 1024 * 1024));
    } else {
      setLocalMetadata(null);
    }
    setIsAnalyzed(false);
    setMetadata(null);
  }, [file]);

  const handleUpload = async () => {
    if (!file) return;

    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Vous devez être connecté pour importer un dataset");
      }

      // Fetch user profile to get userId
      const userResponse = await fetch(
        `/auth/profile?token=${token}`
      );
      if (!userResponse.ok) {
        throw new Error("Impossible de récupérer les informations utilisateur");
      }

      const userData = await userResponse.json();
      const userId = userData.id;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", userId);
      formData.append("description", description);

      const response = await fetch("/api/datasets/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      const finalMetadata = {
        rowCount: data.rowCount,
        columnCount: data.columnCount,
        contentType: data.contentType,
        targetVariable: data.targetVariable
      };

      setMetadata(finalMetadata);
      setIsAnalyzed(true);
      toast.success("Analyse terminée avec succès");

      updateState({
        datasetId: data.id,
        rowCount: data.rowCount,
        columnCount: data.columnCount,
        contentType: data.contentType,
        datasetDescription: description,
        targetVariable: data.targetVariable,
        preprocessingResult: null,
        featureSelectionResult: null,
        selectedModel: null,
        recommendations: null,
        trainingResults: null,
        droppedColumns: null
      });

    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Erreur lors de l'importation du dataset");
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    if (workflowState.datasetId) {
      navigate("/exploration", {
        state: {
          datasetId: workflowState.datasetId,
          targetVariable: workflowState.targetVariable
        }
      });
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-10">
        <h2 className="text-4xl font-extrabold text-[#9333ea] mb-2">Importation de dataset</h2>
        <p className="text-purple-700/70 text-lg font-medium">Préparons vos données pour l'analyse prédictive</p>
      </div>

      <div className="bg-white rounded-3xl p-10 border border-purple-100 mb-8">
        <div className="border-2 border-dashed border-purple-200 rounded-3xl p-16 text-center hover:bg-purple-50 transition-all duration-300 cursor-pointer relative group">
          <div className="w-20 h-20 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-transform duration-300">
            <Upload size={40} className="text-[#9333ea]" />
          </div>
          <h3 className="text-2xl font-bold text-purple-900 mb-2">Uploadez votre fichier CSV</h3>
          <p className="text-purple-600/60 mb-6 font-medium">Glissez-déposez ou cliquez ici pour parcourir vos dossiers</p>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            id="file-upload"
          />
          <button className="px-8 py-3 bg-[#9333ea] text-white rounded-xl font-bold hover:bg-purple-600 transition-all pointer-events-none">
            Choisir un fichier
          </button>
        </div>

        {file && (
          <div className="mt-8 p-6 bg-purple-50 rounded-2xl border border-purple-100 flex items-center gap-6">
            <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center border border-purple-100">
              <File size={32} className="text-[#9333ea]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-xl font-bold text-purple-950 truncate max-w-md">{file.name}</span>
                <div className="px-2 py-0.5 bg-[#9333ea] rounded-full">
                  <CheckCircle size={14} className="text-white" />
                </div>
              </div>
              <div className="text-sm text-purple-600/60 font-bold uppercase tracking-widest">
                {file.size > 1024 * 1024
                  ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
                  : `${(file.size / 1024).toFixed(2)} KB`}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
        <div className="lg:col-span-5 bg-white p-8 rounded-3xl border border-purple-100">
          <h3 className="text-xl font-bold text-purple-900 mb-2">Description locale</h3>
          <p className="text-purple-600/60 text-sm mb-4 font-medium">Légendez votre dataset pour le retrouver plus tard.</p>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Analyse churn clients Q4..."
            className="w-full p-4 bg-purple-50/30 border border-purple-100 rounded-2xl focus:ring-4 focus:ring-purple-100 focus:border-purple-300 outline-none min-h-[140px] text-purple-900 font-medium placeholder:text-purple-200"
          />
        </div>

        <div className="lg:col-span-7 bg-white p-8 rounded-3xl border border-purple-100">
          <h3 className="text-xl font-bold text-purple-900 mb-4">Aperçu & Analyse</h3>
          {!file ? (
            <div className="h-44 flex flex-col items-center justify-center border-2 border-dashed border-purple-50 rounded-2xl">
              <Loader2 className="text-purple-200 mb-2" size={32} />
              <p className="text-purple-300 font-bold uppercase tracking-widest text-xs">En attente d'un fichier</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-purple-50/30 rounded-2xl border border-purple-50">
                <p className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] mb-1">Type de Données</p>
                <p className="text-purple-900 font-extrabold text-lg">{metadata?.contentType || (file?.name?.endsWith(".csv") ? "Tabulaire CSV" : "Inconnu")}</p>
              </div>
              <div className="p-4 bg-purple-50/30 rounded-2xl border border-purple-50">
                <p className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] mb-1">Total Lignes</p>
                <p className="text-purple-900 font-extrabold text-lg">
                  {metadata?.rowCount !== null && metadata?.rowCount !== undefined
                    ? metadata.rowCount.toLocaleString()
                    : localMetadata?.rowCount !== null && localMetadata?.rowCount !== undefined
                      ? localMetadata.rowCount.toLocaleString()
                      : isLoading ? "..." : "---"}
                </p>
              </div>
              <div className="p-4 bg-purple-50/30 rounded-2xl border border-purple-50">
                <p className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] mb-1">Total Colonnes</p>
                <p className="text-purple-900 font-extrabold text-lg">
                  {metadata?.columnCount || localMetadata?.columnCount || (isLoading ? "..." : "---")}
                </p>
              </div>
              <div className="p-4 bg-purple-50/30 rounded-2xl border border-purple-50">
                <p className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] mb-1">Cible Suggestion</p>
                <p className="text-purple-900 font-extrabold text-lg truncate">
                  {metadata?.targetVariable || (isLoading ? "Calcul IA..." : isAnalyzed ? "Aucune" : "Action requise")}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-6 pb-20">
        <button
          onClick={() => navigate("/dashboard")}
          className="px-8 py-4 text-[#9333ea] font-bold hover:bg-purple-50 rounded-2xl transition-all duration-300"
        >
          Abandonner
        </button>
        {isAnalyzed ? (
          <button
            onClick={handleContinue}
            className="px-12 py-4 bg-[#9333ea] text-white rounded-2xl font-black hover:bg-purple-600 transition-all flex items-center gap-3"
          >
            Continuer vers l'exploration
            <ArrowRight size={24} />
          </button>
        ) : (
          <button
            onClick={handleUpload}
            disabled={!file || isLoading}
            className="px-12 py-4 bg-[#9333ea] text-white rounded-2xl font-black hover:bg-purple-600 transition-all disabled:bg-purple-100 flex items-center gap-3 active:scale-95"
          >
            {isLoading && <Loader2 size={24} className="animate-spin" />}
            {isLoading ? "Synchronisation..." : "Lancer l'analyse AI"}
          </button>
        )}
      </div>
    </div>
  );
}
