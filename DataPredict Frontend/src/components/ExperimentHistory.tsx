import { History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// No props needed
export function ExperimentHistory() {
    const navigate = useNavigate();
    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-6">
                <h2 className="text-2xl text-[#1E293B] mb-1 flex items-center gap-2">
                    <History size={24} />
                    Experiment History
                </h2>
                <p className="text-gray-600">View your past experiments here.</p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-[#E2E8F0]">
                <p className="text-gray-500 text-center py-10">No history available yet.</p>
            </div>

            <div className="flex justify-end gap-4 mt-6">
                <button
                    onClick={() => navigate('dashboard')}
                    className="px-6 py-3 border border-[#E2E8F0] rounded-lg hover:bg-[#F8FAFC] transition-colors"
                >
                    Back to Dashboard
                </button>
            </div>
        </div>
    );
}
