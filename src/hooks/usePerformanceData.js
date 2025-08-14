import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import api from '../config/api';

// Cache configuration
const CACHE_CONFIG = {
  default: { ttl: 5 * 60 * 1000, maxSize: 100 }, // 5 minutes, 100 items
  realtime: { ttl: 30 * 1000, maxSize: 50 },     // 30 seconds, 50 items
  historical: { ttl: 60 * 60 * 1000, maxSize: 200 }, // 1 hour, 200 items
  alerts: { ttl: 2 * 60 * 1000, maxSize: 30 }    // 2 minutes, 30 items
};

// Simple LRU Cache implementation
class LRUCache {
  constructor(maxSize = 100) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }

  get(key) {
    if (this.cache.has(key)) {
      const value = this.cache.get(key);
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return null;
  }

  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  clear() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }
}

// Cache manager
class CacheManager {
  constructor() {
    this.caches = new Map();
    this.cleanupInterval = null;
    this.startCleanup();
  }

  getCache(type = 'default') {
    if (!this.caches.has(type)) {
      const config = CACHE_CONFIG[type] || CACHE_CONFIG.default;
      this.caches.set(type, {
        cache: new LRUCache(config.maxSize),
        ttl: config.ttl
      });
    }
    return this.caches.get(type);
  }

  get(key, type = 'default') {
    const cacheData = this.getCache(type);
    const cached = cacheData.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < cacheData.ttl) {
      return cached.data;
    }
    
    if (cached) {
      cacheData.cache.delete(key);
    }
    
    return null;
  }

  set(key, data, type = 'default') {
    const cacheData = this.getCache(type);
    cacheData.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clear(type = 'default') {
    if (type) {
      const cacheData = this.getCache(type);
      cacheData.cache.clear();
    } else {
      this.caches.forEach(cacheData => cacheData.cache.clear());
    }
  }

  startCleanup() {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      this.caches.forEach((cacheData, type) => {
        const keysToDelete = [];
        cacheData.cache.cache.forEach((value, key) => {
          if (now - value.timestamp > cacheData.ttl) {
            keysToDelete.push(key);
          }
        });
        keysToDelete.forEach(key => cacheData.cache.delete(key));
      });
    }, 60000); // Cleanup every minute
  }

  stopCleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

// Global cache instance
const cacheManager = new CacheManager();

// Data fetching utilities
const fetchWithCache = async (url, options = {}, cacheType = 'default') => {
  const cacheKey = `${url}${JSON.stringify(options)}`;
  
  // Try to get from cache first
  const cached = cacheManager.get(cacheKey, cacheType);
  if (cached) {
    return cached;
  }

  try {
    const response = await api.get(url, options);
    const data = response.data;
    
    // Cache the response
    cacheManager.set(cacheKey, data, cacheType);
    
    return data;
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    throw error;
  }
};

// Performance data hook
export const usePerformanceData = (config = {}) => {
  const {
    endpoints = [],
    refreshInterval = 60000,
    autoRefresh = true,
    cacheType = 'default',
    enableCache = true,
    retryAttempts = 3,
    retryDelay = 1000
  } = config;

  const [data, setData] = useState({});
  const [loading, setLoading] = useState({});
  const [error, setError] = useState({});
  const [lastUpdate, setLastUpdate] = useState({});
  const [isInitialized, setIsInitialized] = useState(false);
  
  const refreshTimeoutRef = useRef(null);
  const retryCountRef = useRef({});

  // Memoized endpoint keys
  const endpointKeys = useMemo(() => 
    endpoints.map(endpoint => endpoint.key || endpoint.url), 
    [endpoints]
  );

  // Fetch data for a specific endpoint
  const fetchEndpointData = useCallback(async (endpoint, retryCount = 0) => {
    const key = endpoint.key || endpoint.url;
    
    if (loading[key]) return; // Prevent duplicate requests
    
    setLoading(prev => ({ ...prev, [key]: true }));
    setError(prev => ({ ...prev, [key]: null }));

    try {
      let response;
      
      if (enableCache && endpoint.cache !== false) {
        response = await fetchWithCache(
          endpoint.url, 
          endpoint.options || {}, 
          endpoint.cacheType || cacheType
        );
      } else {
        response = await api.get(endpoint.url, endpoint.options || {});
        response = response.data;
      }

      setData(prev => ({ ...prev, [key]: response }));
      setLastUpdate(prev => ({ ...prev, [key]: new Date() }));
      retryCountRef.current[key] = 0; // Reset retry count on success
      
    } catch (err) {
      console.error(`Error fetching ${key}:`, err);
      
      // Handle retries
      if (retryCount < retryAttempts) {
        retryCountRef.current[key] = (retryCountRef.current[key] || 0) + 1;
        setTimeout(() => {
          fetchEndpointData(endpoint, retryCount + 1);
        }, retryDelay * Math.pow(2, retryCount)); // Exponential backoff
        return;
      }
      
      setError(prev => ({ ...prev, [key]: err.message }));
      retryCountRef.current[key] = 0;
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  }, [loading, enableCache, cacheType, retryAttempts, retryDelay]);

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    const promises = endpoints.map(endpoint => fetchEndpointData(endpoint));
    await Promise.allSettled(promises);
  }, [endpoints, fetchEndpointData]);

  // Refresh specific endpoint
  const refreshEndpoint = useCallback(async (key) => {
    const endpoint = endpoints.find(ep => (ep.key || ep.url) === key);
    if (endpoint) {
      await fetchEndpointData(endpoint);
    }
  }, [endpoints, fetchEndpointData]);

  // Refresh all data
  const refreshAll = useCallback(async () => {
    await fetchAllData();
  }, [fetchAllData]);

  // Clear cache for specific endpoint or all
  const clearCache = useCallback((type = null) => {
    if (type) {
      cacheManager.clear(type);
    } else {
      cacheManager.clear();
    }
  }, []);

  // Get loading state for specific endpoint
  const getLoading = useCallback((key) => {
    return loading[key] || false;
  }, [loading]);

  // Get error state for specific endpoint
  const getError = useCallback((key) => {
    return error[key] || null;
  }, [error]);

  // Get last update time for specific endpoint
  const getLastUpdate = useCallback((key) => {
    return lastUpdate[key] || null;
  }, [lastUpdate]);

  // Check if any endpoint is loading
  const isLoading = useMemo(() => 
    Object.values(loading).some(Boolean), 
    [loading]
  );

  // Check if any endpoint has errors
  const hasErrors = useMemo(() => 
    Object.values(error).some(Boolean), 
    [error]
  );

  // Get overall status
  const getStatus = useCallback((key) => {
    if (loading[key]) return 'loading';
    if (error[key]) return 'error';
    if (data[key]) return 'success';
    return 'idle';
  }, [loading, error, data]);

  // Initialize data fetching
  useEffect(() => {
    if (endpoints.length > 0 && !isInitialized) {
      fetchAllData();
      setIsInitialized(true);
    }
  }, [endpoints, isInitialized, fetchAllData]);

  // Set up auto-refresh
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0 && isInitialized) {
      refreshTimeoutRef.current = setTimeout(() => {
        fetchAllData();
      }, refreshInterval);

      return () => {
        if (refreshTimeoutRef.current) {
          clearTimeout(refreshTimeoutRef.current);
        }
      };
    }
  }, [autoRefresh, refreshInterval, isInitialized, fetchAllData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  return {
    // Data
    data,
    loading,
    error,
    lastUpdate,
    
    // Computed states
    isLoading,
    hasErrors,
    isInitialized,
    
    // Actions
    fetchAllData,
    refreshAll,
    refreshEndpoint,
    clearCache,
    
    // Utilities
    getLoading,
    getError,
    getLastUpdate,
    getStatus,
    
    // Cache info
    cacheStats: {
      size: cacheManager.getCache(cacheType).cache.size(),
      type: cacheType
    }
  };
};

// Specialized hooks for common use cases
export const useNetworkSummary = (timeRange = '24h') => {
  return usePerformanceData({
    endpoints: [{
      key: 'networkSummary',
      url: '/reports/network/summary',
      options: { params: { timeRange } },
      cacheType: 'realtime'
    }],
    refreshInterval: 30000, // 30 seconds
    autoRefresh: true
  });
};

export const useAlerts = (acknowledged = 'false') => {
  return usePerformanceData({
    endpoints: [{
      key: 'alerts',
      url: '/alerts',
      options: { 
        params: { 
          startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          acknowledged 
        } 
      },
      cacheType: 'alerts'
    }],
    refreshInterval: 60000, // 1 minute
    autoRefresh: true
  });
};

export const useTrafficData = (timeRange = '24h', step = '5m') => {
  return usePerformanceData({
    endpoints: [{
      key: 'trafficData',
      url: '/reports/network/traffic_timeseries',
      options: { params: { range: timeRange, step } },
      cacheType: 'historical'
    }],
    refreshInterval: 300000, // 5 minutes
    autoRefresh: true
  });
};

export const useUptimeData = (timeRange = '24h', step = '5m') => {
  return usePerformanceData({
    endpoints: [{
      key: 'uptimeData',
      url: '/reports/network/uptime_timeseries',
      options: { params: { range: timeRange, step } },
      cacheType: 'historical'
    }],
    refreshInterval: 300000, // 5 minutes
    autoRefresh: true
  });
};

export default usePerformanceData;
