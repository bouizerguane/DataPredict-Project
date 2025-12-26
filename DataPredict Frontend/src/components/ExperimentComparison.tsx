import { GitCompare, TrendingUp, TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// No props needed
export function ExperimentComparison() {
  const navigate = useNavigate();
  const experiments = [
    {
      id: 1,
      name: 'Random Forest v1',
      date: '6 déc 2025',
      accuracy: 92.0,
      precision: 90.4,
      recall: 94.0,
      f1: 92.1,
      time: '8.2s'
    },
    {
      id: 2,
      name: 'XGBoost v1',
      date: '5 déc 2025',
      accuracy: 89.5,
      precision: 88.2,
      recall: 91.3,
      f1: 89.7,
      time: '12.5s'
    },
    {
      id: 3,
      name: 'Logistic Regression',
      date: '5 déc 2025',
      accuracy: 78.3,
      precision: 76.8,
      recall: 80.2,
      f1: 78.5,
      time: '2.1s'
    },
    {
      id: 4,
      name: 'Random Forest v2',
      date: '4 déc 2025',
      accuracy: 90.8,
      precision: 89.1,
      recall: 92.5,
      f1: 90.8,
      time: '9.8s'
    }
  ];

  const bestAccuracy = Math.max(...experiments.map(e => e.accuracy));

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl text-[#1E293B] mb-1">Comparaison des expériences</h2>
        <p className="text-gray-600">Comparez les performances de vos différents modèles</p>
      </div>

      <div className="bg-white rounded-lg p-6 border border-[#E2E8F0] mb-6">
        <h3 className="text-lg text-[#1E293B] mb-4 flex items-center gap-2">
          <GitCompare size={20} />
          Tableau comparatif
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-[#E2E8F0]">
                <th className="text-left p-3 text-sm text-gray-600">Expérience</th>
                <th className="text-left p-3 text-sm text-gray-600">Date</th>
                <th className="text-left p-3 text-sm text-gray-600">Accuracy</th>
                <th className="text-left p-3 text-sm text-gray-600">Précision</th>
                <th className="text-left p-3 text-sm text-gray-600">Rappel</th>
                <th className="text-left p-3 text-sm text-gray-600">F1-Score</th>
                <th className="text-left p-3 text-sm text-gray-600">Temps</th>
              </tr>
            </thead>
            <tbody>
              {experiments.map((exp) => (
                <tr
                  key={exp.id}
                  className={`border-b border-[#E2E8F0] hover:bg-[#F8FAFC] ${exp.accuracy === bestAccuracy ? 'bg-green-50' : ''
                    }`}
                >
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[#1E293B]">{exp.name}</span>
                      {exp.accuracy === bestAccuracy && (
                        <span className="px-2 py-0.5 bg-green-600 text-white text-xs rounded">
                          Meilleur
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-gray-600">{exp.date}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[#1E293B]">{exp.accuracy.toFixed(1)}%</span>
                      {exp.accuracy >= 90 ? (
                        <TrendingUp size={16} className="text-green-600" />
                      ) : (
                        <TrendingDown size={16} className="text-red-600" />
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-[#1E293B]">{exp.precision.toFixed(1)}%</td>
                  <td className="p-3 text-[#1E293B]">{exp.recall.toFixed(1)}%</td>
                  <td className="p-3 text-[#1E293B]">{exp.f1.toFixed(1)}%</td>
                  <td className="p-3 text-gray-600">{exp.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg p-6 border border-[#E2E8F0]">
          <h3 className="text-lg text-[#1E293B] mb-4">Comparaison Accuracy</h3>
          <div className="space-y-4">
            {experiments.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{exp.name}</span>
                  <span className="text-[#1E293B]">{exp.accuracy.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-[#E2E8F0] rounded-full h-2">
                  <div
                    className={`h-full rounded-full transition-all ${exp.accuracy === bestAccuracy
                        ? 'bg-gradient-to-r from-green-500 to-green-600'
                        : 'bg-gradient-to-r from-blue-500 to-blue-600'
                      }`}
                    style={{ width: `${exp.accuracy}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-[#E2E8F0]">
          <h3 className="text-lg text-[#1E293B] mb-4">Comparaison F1-Score</h3>
          <div className="space-y-4">
            {experiments.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{exp.name}</span>
                  <span className="text-[#1E293B]">{exp.f1.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-[#E2E8F0] rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-full rounded-full transition-all"
                    style={{ width: `${exp.f1}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 border border-[#E2E8F0]">
        <h3 className="text-lg text-[#1E293B] mb-4">Insights et recommandations</h3>
        <div className="space-y-3">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-sm text-green-900">
              ✓ Random Forest v1 affiche les meilleures performances globales avec 92.0% d&apos;accuracy
            </div>
          </div>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm text-blue-900">
              ℹ XGBoost pourrait être optimisé avec un meilleur réglage des hyperparamètres
            </div>
          </div>
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="text-sm text-yellow-900">
              ⚠ La régression logistique est plus rapide mais moins précise pour ce cas d&apos;usage
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="px-6 py-3 border border-[#E2E8F0] rounded-lg hover:bg-[#F8FAFC] transition-colors"
        >
          Tableau de bord
        </button>
        <button
          onClick={() => navigate('/results')}
          className="px-6 py-3 bg-[#1E293B] text-white rounded-lg hover:bg-[#334155] transition-colors"
        >
          Voir détails
        </button>
      </div>
    </div>
  );
}
