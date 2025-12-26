import { useState, useEffect } from 'react';

interface DashboardStats {
    totalDatasets: number;
    totalProcessed: number;
    bestAccuracy: number;
    modelsTrained: number;
    systemStatus: 'healthy' | 'degraded' | 'down';
    lastUpdated: Date;
}

interface Activity {
    name: string;
    accuracy?: string;
    date: string;
    type: 'classification' | 'regression' | 'upload';
}

export function useDashboardData() {
    const [stats, setStats] = useState<DashboardStats>({
        totalDatasets: 0,
        totalProcessed: 0,
        bestAccuracy: 0,
        modelsTrained: 0,
        systemStatus: 'healthy',
        lastUpdated: new Date()
    });

    const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/training/stats');
            if (response.ok) {
                const data = await response.json();
                setStats({
                    totalDatasets: data.totalDatasets || 0,
                    totalProcessed: data.totalProcessed || 0,
                    bestAccuracy: data.bestAccuracy || 0,
                    modelsTrained: data.modelsTrained || 0,
                    systemStatus: data.systemStatus || 'healthy',
                    lastUpdated: new Date()
                });

                if (data.recentActivities) {
                    setRecentActivities(data.recentActivities);
                    sessionStorage.setItem('recentActivities', JSON.stringify(data.recentActivities));
                }

                setError(null);
            } else {
                setStats(prev => ({ ...prev, systemStatus: 'degraded' }));
                console.error("Failed to fetch dashboard stats");
            }
        } catch (e) {
            setStats(prev => ({ ...prev, systemStatus: 'down' }));
            console.error("Error fetching dashboard stats", e);
            setError("Service indisponible");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();

        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Load recent activities from localStorage/sessionStorage
        const storedActivities = sessionStorage.getItem('recentActivities');
        const storedHistory = localStorage.getItem('trainingHistory');

        if (storedActivities) {
            try {
                setRecentActivities(JSON.parse(storedActivities));
            } catch (e) {
                console.error("Failed to parse recent activities", e);
            }
        } else if (storedHistory) {
            try {
                const history = JSON.parse(storedHistory);
                const activities: Activity[] = history.map((h: any) => ({
                    name: h.modelName,
                    accuracy: `${(h.accuracy * 100).toFixed(1)}%`,
                    date: h.date.split(' ')[0],
                    type: 'classification'
                }));
                setRecentActivities(activities.slice(0, 5));
            } catch (e) {
                console.error("Failed to parse history for dashboard", e);
            }
        } else {
            // Fallback/Demo data if nothing stored
            setRecentActivities([
                { name: 'Classification clients', accuracy: '92.5%', date: '2 déc 2025', type: 'classification' },
                { name: 'Prédiction prix immobilier', accuracy: '88.3%', date: '1 déc 2025', type: 'regression' },
                { name: 'Détection fraude', accuracy: '94.7%', date: '30 nov 2025', type: 'classification' },
            ]);
        }
    }, []);

    return { stats, recentActivities, loading, error, refresh: fetchStats };
}
