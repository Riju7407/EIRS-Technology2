/**
 * Fast2SMS OTP Service
 * Uses Fast2SMS Quick SMS API to send OTP messages.
 * API Docs: https://docs.fast2sms.com/reference/quick-sms
 *
 * Quick SMS POST endpoint: https://www.fast2sms.com/dev/bulkV2
 * Header: authorization: YOUR_API_KEY
 * Body:   { message, route: "q", numbers, flash: "0" }
 */
const axios = require('axios');

const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY;
const FAST2SMS_URL = 'https://www.fast2sms.com/dev/bulkV2';

/**
 * Generate a random 6-digit OTP
 */
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send OTP via Fast2SMS Quick SMS API
 * @param {string} phoneNumber – 10-digit Indian mobile number (no country code)
 * @param {string} otp – the OTP code to send
 * @returns {object} Fast2SMS API response
 */
async function sendOTPviaSMS(phoneNumber, otp) {
    if (!FAST2SMS_API_KEY) {
        throw new Error('FAST2SMS_API_KEY is not configured in environment variables');
    }

    // Ensure we have a clean 10-digit number
    const digits = phoneNumber.replace(/\D/g, '').slice(-10);
    if (digits.length !== 10) {
        throw new Error('Invalid phone number. Must be a 10-digit Indian mobile number.');
    }

    const message = `Your EIRS Technology login OTP is ${otp}. It is valid for 5 minutes. Do not share it with anyone.`;

    try {
        const response = await axios.post(
            FAST2SMS_URL,
            {
                message,
                route: 'q',          // Quick SMS route (no DLT needed)
                numbers: digits,
                flash: '0'
            },
            {
                headers: {
                    'authorization': FAST2SMS_API_KEY,
                    'Content-Type': 'application/json',
                    'accept': 'application/json'
                }
            }
        );

        console.log('[Fast2SMS] OTP sent successfully to', digits, '| response:', response.data);
        return response.data;
    } catch (err) {
        const errMsg = err.response?.data?.message || err.message || 'Failed to send OTP via Fast2SMS';
        console.error('[Fast2SMS] Error sending OTP:', errMsg);
        throw new Error(errMsg);
    }
}

module.exports = { generateOTP, sendOTPviaSMS };
