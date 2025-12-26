import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkflow } from '../context/WorkflowContext';
import { BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Trophy, TrendingUp, Zap, Target, CheckCircle, Loader2, AlertCircle, ArrowRight, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

interface ModelMetrics {
    accuracy: number;
    precision: number;
    recall: number;
    f1: number;
    [key: string]: number;
}

interface ComparisonResult {
    modelName: string;
    metrics: ModelMetrics;
    trainingTime: number;
    status: 'training' | 'completed' | 'error';
}

export function Comparison() {
    const navigate = useNavigate();
    const { state } = useWorkflow();
    const { trainingResults } = state;

    const getMetricLabel = (key: string) => {
        const labels: Record<string, string | { label: string; gradient: string; icon: any }> = {
            accuracy: 'Accuracy',
            precision: { label: 'Précision', gradient: 'from-purple-500 to-pink-500', icon: Target },
            recall: 'Rappel',
            f1: 'F1-Score',
            r2: 'R² Score',
            mse: 'MSE',
            mae: 'MAE'
        };
        const labelEntry = labels[key.toLowerCase()];
        if (typeof labelEntry === 'object' && labelEntry !== null && 'label' in labelEntry) {
            return labelEntry.label;
        }
        return (labelEntry as string) || key.charAt(0).toUpperCase() + key.slice(1);
    };

    if (!trainingResults || !trainingResults.comparison) {
        return (
            <div className="text-gray-900 flex flex-col items-center justify-center p-20 h-96 bg-white rounded-xl border border-gray-200">
                <Target size={48} className="text-gray-900 text-gray-300 mb-4" />
                <h3 className="text-gray-900 text-xl font-medium text-gray-700">Aucune comparaison disponible</h3>
                <p className="text-gray-900 text-gray-500 mt-2 text-center max-w-sm">
                    Entraînez d'abord vos modèles pour comparer leurs performances.
                </p>
                <button
                    onClick={() => navigate('/training')}
                    className="text-gray-900 mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Lancer l'entraînement
                </button>
            </div>
        );
    }

    const { bestModel, comparison } = trainingResults;
    const modelNames = Object.keys(comparison);

    // Get all unique metric keys across all models
    const allMetrics = Array.from(new Set(
        modelNames.flatMap(name => Object.keys(comparison[name] || {}))
    )).filter(m => modelNames[0] && comparison[modelNames[0]] && typeof (comparison[modelNames[0]] as any)[m] === 'number');

    // Prepare data for charts
    const metricsComparisonData = allMetrics.map(metric => {
        const entry: any = { metric: getMetricLabel(metric) };
        modelNames.forEach(name => {
            const val = comparison[name][metric];
            // Scale if it looks like a ratio (0-1), otherwise keep raw
            entry[name] = (val <= 1 && val >= -1) ? val * 100 : val;
        });
        return entry;
    });

    const COLORS = ['#3B82F6', '#EC4899', '#10B981', '#F59E0B'];

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="text-gray-900 mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-gray-900 text-3xl font-bold text-gray-900 mb-2">Comparaison des modèles</h1>
                    <p className="text-gray-900 text-gray-600">Vue comparative des performances des algorithmes entraînés</p>
                </div>
                <div className="text-gray-900 bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
                    <span className="text-gray-900 text-sm text-blue-700 font-medium">Modèles comparés : </span>
                    <span className="text-gray-900 text-sm font-bold text-blue-900">{modelNames.join(' vs ')}</span>
                </div>
            </div>

            {/* Winner Banner */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 rounded-xl p-6 mb-8">
                <div className="text-gray-900 flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                        <Trophy className="text-gray-900 text-white" size={32} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-teal-900 text-2xl font-bold mb-1">
                            🏆 Meilleur modèle : {bestModel}
                        </h3>
                        <p className="text-teal-700 font-medium">
                            Ce modèle offre les meilleures performances globales sur votre dataset.
                        </p>
                    </div>
                </div>
            </div>

            {/* Side-by-side Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {modelNames.map((name, idx) => {
                    const metrics = comparison[name];
                    return (
                        <div key={idx} className={`bg-white rounded-xl p-6 border-2 shadow-sm transition-all hover:shadow-md ${name === bestModel ? 'border-blue-500 ring-2 ring-blue-50' : 'border-gray-100 hover:border-gray-200'}`}>
                            <div className="text-gray-900 flex items-center justify-between mb-6">
                                <h3 className="text-gray-900 text-xl font-bold text-gray-900">{name}</h3>
                                {name === bestModel && <div className="text-gray-900 flex items-center gap-1.5 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                    <CheckCircle size={14} /> Winner
                                </div>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {Object.entries(metrics || {}).filter(([k, v]) => typeof v === 'number' && k !== 'trainingTime').map(([key, val], mIdx) => (
                                    <div key={mIdx} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                        <div className="text-gray-900 text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">{getMetricLabel(key)}</div>
                                        <div className="text-gray-900 text-2xl font-bold text-gray-900">
                                            {typeof val === 'number' ?
                                                ((val <= 1 && val >= -1 && key !== 'mae' && key !== 'mse') ? `${(val * 100).toFixed(1)}%` : (val as number).toFixed(4))
                                                : String(val)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {typeof metrics.trainingTime === 'number' && (
                                <div className="text-gray-900 mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
                                    <span className="text-gray-900 text-gray-500 flex items-center gap-1.5 underline decoration-gray-200 underline-offset-4">
                                        Temps d'exécution
                                    </span>
                                    <span className="font-bold text-gray-700">{metrics.trainingTime.toFixed(2)}s</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Metrics Chart */}
            <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm mb-8">
                <h3 className="text-gray-900 text-xl font-bold text-gray-900 mb-6">Visualisation comparative</h3>
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={metricsComparisonData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                            <XAxis
                                dataKey="metric"
                                stroke="#64748B"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#64748B"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                cursor={{ fill: '#F8FAFC' }}
                                contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                formatter={(value: any) => typeof value === 'number' ? value.toFixed(2) : value}
                            />
                            <Legend />
                            {modelNames.map((name, idx) => (
                                <Bar
                                    key={idx}
                                    dataKey={name}
                                    fill={COLORS[idx % COLORS.length]}
                                    radius={[6, 6, 0, 0]}
                                    barSize={40}
                                />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="text-gray-900 flex justify-end gap-4">
                <button
                    onClick={() => navigate('/results')}
                    className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
                >
                    Voir les rapports détaillés
                    <ArrowRight size={20} />
                </button>
            </div>
        </div>
    );
}
