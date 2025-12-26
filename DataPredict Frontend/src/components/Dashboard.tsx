import { Upload, Rocket, History, TrendingUp, Database, Zap, Activity as ActivityIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDashboardData } from '../hooks/useDashboardData';

export function Dashboard() {
  const { stats, recentActivities, loading, error } = useDashboardData();

  if (loading) {
    return <div className="p-10 text-center text-gray-500 -slate-400">Chargement du tableau de bord...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="page-title">Tableau de bord</h2>
          <p className="text-gray-600 -slate-400">Bienvenue sur DataPredict</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${stats.systemStatus === 'healthy' ? 'bg-green-100 -green-900/30 text-green-700 -green-400' :
          stats.systemStatus === 'degraded' ? 'bg-yellow-100 -yellow-900/30 text-yellow-700 -yellow-400' : 'bg-red-100 -red-900/30 text-red-700 -red-400'
          }`}>
          <div className={`w-2 h-2 rounded-full ${stats.systemStatus === 'healthy' ? 'bg-green-500' :
            stats.systemStatus === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
          Système: {stats.systemStatus === 'healthy' ? 'En ligne' : stats.systemStatus === 'degraded' ? 'Dégradé' : 'Hors ligne'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 -blue-900/30 rounded-lg flex items-center justify-center">
              <Database size={24} className="text-blue-600 -blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 -white">{stats.totalDatasets}</div>
              <div className="text-sm text-gray-600 -slate-400">Datasets importés</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 -green-900/30 rounded-lg flex items-center justify-center">
              <Zap size={24} className="text-green-600 -green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 -white">{stats.modelsTrained}</div>
              <div className="text-sm text-gray-600 -slate-400">Modèles entraînés</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-100 -purple-900/30 rounded-lg flex items-center justify-center">
              <TrendingUp size={24} className="text-purple-600 -purple-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 -white">{stats.bestAccuracy}%</div>
              <div className="text-sm text-gray-600 -slate-400">Meilleure précision</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/import"
          className="card hover:border-teal-500 -teal-600 transition-all hover:shadow-lg group block text-left"
        >
          <div className="w-14 h-14 bg-teal-50 -teal-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:bg-teal-100 -hover:bg-teal-900/50 transition-colors">
            <Upload size={28} className="text-teal-600 -teal-400" />
          </div>
          <h3 className="subsection-title">Importer un dataset</h3>
          <p className="text-sm text-gray-600 -slate-400">
            Téléchargez vos fichiers CSV ou Excel pour commencer une nouvelle analyse
          </p>
        </Link>
        <Link
          to="/task-selection"
          className="card hover:border-teal-500 -teal-600 transition-all hover:shadow-lg group block text-left"
        >
          <div className="w-14 h-14 bg-teal-50 -teal-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:bg-teal-100 -hover:bg-teal-900/50 transition-colors">
            <Rocket size={28} className="text-teal-600 -teal-400" />
          </div>
          <h3 className="subsection-title">Nouvelle expérience</h3>
          <p className="text-sm text-gray-600 -slate-400">
            Créez et entraînez un nouveau modèle de machine learning
          </p>
        </Link>

        <Link
          to="/history"
          className="card hover:border-purple-500 -purple-600 transition-all hover:shadow-lg group block text-left"
        >
          <div className="w-14 h-14 bg-purple-50 -purple-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-100 -hover:bg-purple-900/50 transition-colors">
            <History size={28} className="text-purple-600 -purple-400" />
          </div>
          <h3 className="subsection-title">Historique</h3>
          <p className="text-sm text-gray-600 -slate-400">
            Consultez vos expériences précédentes et leurs résultats
          </p>
        </Link>
      </div>

      <div className="card">
        <h3 className="subsection-title">Expériences récentes</h3>
        {recentActivities.length === 0 ? (
          <div className="text-gray-500 -slate-400 text-sm py-4 italic">Aucune activité récente.</div>
        ) : (
          <div className="space-y-3">
            {recentActivities.map((exp, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 -slate-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white -slate-700 rounded border border-gray-200 -slate-600">
                    <ActivityIcon size={16} className="text-gray-500 -slate-400" />
                  </div>
                  <div>
                    <div className="text-gray-900 -white font-medium">{exp.name}</div>
                    <div className="text-sm text-gray-600 -slate-400">{exp.date}</div>
                  </div>
                </div>
                {exp.accuracy && <div className="text-green-600 -green-400 font-semibold">{exp.accuracy}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
