import { useEffect, useState, useCallback } from 'react';
import api, { API_ENDPOINTS } from '../config/api';

export default function useInterfaceData(deviceId) {
  const [interfaces, setInterfaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchInterfaces = useCallback(async () => {
    if (!deviceId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(API_ENDPOINTS.SNMP_DEVICE_INTERFACES(deviceId));
      setInterfaces(res.data?.data || []);
      setLastUpdate(new Date());
    } catch (e) {
      setError(e.message || 'Failed to load interfaces');
    } finally {
      setLoading(false);
    }
  }, [deviceId]);

  useEffect(() => {
    fetchInterfaces();
  }, [fetchInterfaces]);

  return { interfaces, loading, error, lastUpdate, refresh: fetchInterfaces };
}


