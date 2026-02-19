/**
 * Keep-alive service for Render free plan
 * Prevents server from sleeping by pinging it periodically
 * This should be called from your frontend or a cron job
 */

const axios = require('axios');

const RENDER_URL = process.env.RENDER_URL || 'https://eirs-technology2-2.onrender.com';
const HEALTH_ENDPOINT = `${RENDER_URL}/health`;
const PING_INTERVAL = 25 * 60 * 1000; // 25 minutes (Render sleeps after 30 min of inactivity)

/**
 * Ping the server to keep it awake on Render free plan
 * Call this from your frontend on a timer
 */
async function pingServer() {
    try {
        const response = await axios.get(HEALTH_ENDPOINT, {
            timeout: 10000,
            headers: {
                'User-Agent': 'EIRS-KeepAlive/1.0'
            }
        });
        
        if (response.status === 200) {
            console.log('✅ Keep-alive ping successful:', response.data);
            return true;
        }
    } catch (error) {
        console.error('⚠️ Keep-alive ping failed:', error.message);
        return false;
    }
}

/**
 * Start a keep-alive interval (optional, for backend-only services)
 */
function startKeepAliveInterval() {
    console.log(`🔄 Starting keep-alive service. Will ping every 25 minutes.`);
    
    // Ping immediately on start
    pingServer();
    
    // Then ping every 25 minutes
    setInterval(pingServer, PING_INTERVAL);
}

module.exports = {
    pingServer,
    startKeepAliveInterval,
    HEALTH_ENDPOINT,
    PING_INTERVAL
};
