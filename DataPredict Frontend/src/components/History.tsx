import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, TrendingUp, Clock, Database, Filter, Search, Download, Trash2, Eye, GitCompare } from 'lucide-react';
import { toast } from 'sonner';

interface TrainingRecord {
    id: string;
    date: string;
    datasetName: string;
    modelName: string;
    accuracy: number;
    precision: number;
    recall: number;
    f1: number;
    trainingTime: number;
    status: 'success' | 'failed';
    description?: string;
}

export function History() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterModel, setFilterModel] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'date' | 'accuracy'>('date');
    const [selectedRecords, setSelectedRecords] = useState<string[]>([]);

    const [trainingHistory, setTrainingHistory] = useState<TrainingRecord[]>([]);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await fetch('/api/training/history');
                if (response.ok) {
                    const data = await response.json();
                    setTrainingHistory(data.map((h: any) => ({
                        id: h.id.toString(),
                        date: h.date.replace('T', ' ').substring(0, 16),
                        datasetName: h.datasetName,
                        modelName: h.modelName,
                        accuracy: h.accuracy,
                        precision: h.precisionMetric,
                        recall: h.recall,
                        f1: h.f1Score,
                        trainingTime: h.trainingTime,
                        status: h.status === 'success' ? 'success' : 'failed',
                        description: h.description
                    })));
                }
            } catch (e) {
                console.error("Failed to fetch history", e);
                toast.error("Impossible de charger l'historique");
            }
        };
        fetchHistory();
    }, []);

    const uniqueModels = Array.from(new Set(trainingHistory.map(r => r.modelName)));

    const filteredRecords = trainingHistory
        .filter(record => {
            const matchesSearch = record.datasetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                record.modelName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilter = filterModel === 'all' || record.modelName === filterModel;
            return matchesSearch && matchesFilter;
        })
        .sort((a, b) => {
            if (sortBy === 'date') {
                return new Date(b.date).getTime() - new Date(a.date).getTime();
            }
            return b.accuracy - a.accuracy;
        });

    const handleSelectRecord = (id: string) => {
        setSelectedRecords(prev =>
            prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
        );
    };

    const handleCompareSelected = () => {
        if (selectedRecords.length < 2) {
            toast.error("Sélectionnez au moins 2 entraînements à comparer");
            return;
        }
        if (selectedRecords.length > 4) {
            toast.error("Vous ne pouvez comparer que 4 entraînements maximum");
            return;
        }
        toast.success(`Comparaison de ${selectedRecords.length} entraînements...`);
        // Navigate to comparison view with selected IDs
    };

    const handleDeleteRecord = (id: string) => {
        toast.success("Entraînement supprimé");
        // In production: API call to delete
    };

    const handleExportHistory = () => {
        const dataStr = JSON.stringify(filteredRecords, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `training-history-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        toast.success("Historique exporté");
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 -white mb-2">Historique des entraînements</h1>
                <p className="text-gray-600">Consultez et comparez vos expériences passées</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <Database className="text-blue-600 -blue-400" size={24} />
                        <span className="text-xs text-gray-500">Total</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{trainingHistory.length}</div>
                    <div className="text-sm text-gray-600 mt-1">Entraînements</div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <TrendingUp className="text-green-600 -green-400" size={24} />
                        <span className="text-xs text-gray-500">Meilleur</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">
                        {(Math.max(...trainingHistory.map(r => r.accuracy)) * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Accuracy</div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <Clock className="text-purple-600 -purple-400" size={24} />
                        <span className="text-xs text-gray-500">Moyen</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">
                        {(trainingHistory.reduce((sum, r) => sum + r.trainingTime, 0) / trainingHistory.length).toFixed(1)}s
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Temps d'entraînement</div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <Calendar className="text-orange-600 -orange-400" size={24} />
                        <span className="text-xs text-gray-500">Dernier</span>
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                        {trainingHistory[0] ? new Date(trainingHistory[0].date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                        {trainingHistory[0] ? new Date(trainingHistory[0].date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''}
                    </div>
                </div>
            </div>

            {/* Filters and Actions */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Rechercher par dataset ou modèle..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 -teal-600 text-gray-900 placeholder-gray-400 -slate-500"
                        />
                    </div>

                    {/* Filter by Model */}
                    <div className="flex items-center gap-2">
                        <Filter size={20} className="text-gray-400" />
                        <select
                            value={filterModel}
                            onChange={(e) => setFilterModel(e.target.value)}
                            className="px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                        >
                            <option value="all">Tous les modèles</option>
                            {uniqueModels.map(model => (
                                <option key={model} value={model}>{model}</option>
                            ))}
                        </select>
                    </div>

                    {/* Sort */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'date' | 'accuracy')}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                    >
                        <option value="date">Trier par date</option>
                        <option value="accuracy">Trier par performance</option>
                    </select>

                    {/* Export */}
                    <button
                        onClick={handleExportHistory}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 -slate-700 transition-colors text-gray-900"
                    >
                        <Download size={18} />
                        Exporter
                    </button>
                </div>

                {/* Bulk Actions */}
                {selectedRecords.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                            {selectedRecords.length} entraînement(s) sélectionné(s)
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={handleCompareSelected}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                            >
                                <GitCompare size={16} />
                                Comparer
                            </button>
                            <button
                                onClick={() => setSelectedRecords([])}
                                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Training Records Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left">
                                    <input
                                        type="checkbox"
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedRecords(filteredRecords.map(r => r.id));
                                            } else {
                                                setSelectedRecords([]);
                                            }
                                        }}
                                        checked={selectedRecords.length === filteredRecords.length && filteredRecords.length > 0}
                                        className="rounded"
                                    />
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 -slate-300">Date</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 -slate-300">Dataset</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 -slate-300">Modèle</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 -slate-300">Accuracy</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 -slate-300">F1-Score</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 -slate-300">Temps</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 -slate-300">Description</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E2E8F0]">
                            {filteredRecords.map((record) => (
                                <tr
                                    key={record.id}
                                    className={`hover:bg-gray-50 transition-colors ${selectedRecords.includes(record.id) ? 'bg-blue-50' : ''
                                        }`}
                                >
                                    <td className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedRecords.includes(record.id)}
                                            onChange={() => handleSelectRecord(record.id)}
                                            className="rounded"
                                        />
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {new Date(record.date).toLocaleString('fr-FR', {
                                            day: '2-digit',
                                            month: 'short',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Database size={16} className="text-gray-400" />
                                            <span className="text-sm font-medium text-gray-900 -white">{record.datasetName}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {record.modelName}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[80px]">
                                                <div
                                                    className="bg-green-500 h-2 rounded-full"
                                                    style={{ width: `${record.accuracy * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-bold text-gray-900 -white">
                                                {(record.accuracy * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {(record.f1 * 100).toFixed(1)}%
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {record.trainingTime !== null && record.trainingTime !== undefined ? record.trainingTime.toFixed(1) : '0.0'}s
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 italic max-w-xs truncate" title={record.description}>
                                        {record.description || "Aucune description"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredRecords.length === 0 && (
                    <div className="text-center py-12">
                        <Database className="mx-auto text-gray-300 mb-4" size={48} />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun entraînement trouvé</h3>
                        <p className="text-gray-500">Essayez de modifier vos filtres de recherche</p>
                    </div>
                )}
            </div>

            {/* Action Button */}
            <div className="flex justify-end mt-6">
                <button
                    onClick={() => navigate('/import')}
                    className="btn-primary"
                >
                    Nouvel entraînement
                </button>
            </div>
        </div>
    );
}
