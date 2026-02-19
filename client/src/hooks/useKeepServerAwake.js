/**
 * Custom React hook to keep the Render server awake
 * Automatically pings the /health endpoint periodically
 * Call this from your main App component
 */

import { useEffect } from 'react';

const PING_INTERVAL = 25 * 60 * 1000; // 25 minutes (Render sleeps after 30 min)
const API_BASE_URL = process.env.REACT_APP_API_URL || 
                     (process.env.NODE_ENV === 'production' 
                        ? 'https://eirs-technology2-2.onrender.com'
                        : 'http://localhost:5000');

/**
 * Hook to keep Render server awake by pinging it periodically
 * Usage: useKeepServerAwake('/health')
 */
export const useKeepServerAwake = (endpoint = '/health') => {
    useEffect(() => {
        // Function to ping the server
        const pingServer = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    signal: AbortSignal.timeout(10000) // 10 second timeout
                });
                
                if (response.ok) {
                    const data = await response.json();
                    console.log('🟢 Server keep-alive successful:', data);
                }
            } catch (error) {
                console.warn('⚠️ Keep-alive ping failed (this is normal):', error.message);
            }
        };

        // Ping immediately on component mount
        pingServer();

        // Set up interval to ping every 25 minutes
        const intervalId = setInterval(pingServer, PING_INTERVAL);

        // Cleanup interval on unmount
        return () => clearInterval(intervalId);
    }, []);
};

export default useKeepServerAwake;
