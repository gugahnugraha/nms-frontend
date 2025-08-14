import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../config/api';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useDashboardData = (timeRange = '24h') => {
  const [data, setData] = useState({
    networkSummary: null,
    alertsSummary: { total: 0, critical: 0, warning: 0, recent: [] },
    uptimeSeries: [],
    trafficSeries: [],
    lastUpdate: null
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const cacheRef = useRef(new Map());
  const abortControllerRef = useRef(null);

  const getCacheKey = useCallback((endpoint, params) => {
    return `${endpoint}_${JSON.stringify(params)}`;
  }, []);

  const isCacheValid = useCallback((timestamp) => {
    return Date.now() - timestamp < CACHE_DURATION;
  }, []);

  const fetchWithCache = useCallback(async (endpoint, params = {}) => {
    const cacheKey = getCacheKey(endpoint, params);
    const cached = cacheRef.current.get(cacheKey);
    
    if (cached && isCacheValid(cached.timestamp)) {
      return cached.data;
    }

    try {
      const response = await api.get(endpoint, { params });
      const result = response.data?.data || null;
      
      cacheRef.current.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
      
      return result;
    } catch (err) {
      throw err;
    }
  }, [getCacheKey, isCacheValid]);

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (loading && !forceRefresh) return;
    
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    setLoading(true);
    setError(null);
    
    try {
      const [summaryRes, alertsRes, uptimeRes, trafficRes] = await Promise.all([
        fetchWithCache('/reports/network/summary', { timeRange }),
        fetchWithCache('/alerts', { 
          startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), 
          acknowledged: 'false' 
        }),
        fetchWithCache('/reports/network/uptime_timeseries', { range: timeRange, step: '5m' }),
        fetchWithCache('/reports/network/traffic_timeseries', { range: timeRange, step: '5m' })
      ]);

      // Process alerts data
      const alertsData = alertsRes || [];
      const critical = alertsData.filter(a => (a.severity || '').toLowerCase() === 'critical').length;
      const warning = alertsData.filter(a => (a.severity || '').toLowerCase() === 'warning').length;
      
      setData({
        networkSummary: summaryRes,
        alertsSummary: { 
          total: alertsData.length, 
          critical, 
          warning, 
          recent: alertsData.slice(0, 5) 
        },
        uptimeSeries: uptimeRes || [],
        trafficSeries: trafficRes || [],
        lastUpdate: new Date()
      });
      
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Failed to fetch dashboard data');
        console.error('Error fetching dashboard data:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [timeRange, loading, fetchWithCache]);

  const refreshData = useCallback(() => {
    // Clear cache for current time range
    const keysToDelete = [];
    cacheRef.current.forEach((value, key) => {
      if (key.includes(timeRange)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => cacheRef.current.delete(key));
    
    fetchData(true);
  }, [timeRange, fetchData]);

  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  useEffect(() => {
    fetchData();
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  // Auto-refresh every minute
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 60000);
    
    return () => clearInterval(interval);
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refreshData,
    clearCache,
    refetch: fetchData
  };
};

export const useDeviceTraffic = () => {
  const [devicesTraffic, setDevicesTraffic] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDeviceTraffic = useCallback(async (limit = 0) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/reports/network/devices_traffic', { params: { limit } });
      const items = (response.data?.data || []).map((d) => ({
        name: d.name || d.instance,
        instance: d.instance,
        mbps: Number(d.bps || 0) / 1e6,
        status: d.status || 'unknown'
      }));
      setDevicesTraffic(items);
    } catch (err) {
      setError(err.message || 'Failed to fetch device traffic data');
      console.error('Error fetching device traffic:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    devicesTraffic,
    loading,
    error,
    fetchDeviceTraffic
  };
};

export const useRealTimeUpdates = (enabled = true, interval = 30000) => {
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const intervalRef = useRef(null);

  useEffect(() => {
    if (enabled) {
      intervalRef.current = setInterval(() => {
        setLastUpdate(new Date());
      }, interval);
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [enabled, interval]);

  const forceUpdate = useCallback(() => {
    setLastUpdate(new Date());
  }, []);

  return {
    lastUpdate,
    forceUpdate
  };
};
