/**
 * twilioService.js
 * Wraps Twilio Verify v2 – sends and checks phone OTPs.
 */
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken  = process.env.TWILIO_AUTH_TOKEN;
const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

// Human-readable messages for common Twilio error codes
const TWILIO_ERRORS = {
    20003: 'Twilio authentication failed. Check TWILIO_AUTH_TOKEN in your .env file.',
    20404: 'Twilio Verify Service SID not found. Check TWILIO_VERIFY_SERVICE_SID in your .env file.',
    60200: 'Invalid phone number format.',
    60203: 'Max send attempts reached. Please wait before requesting another OTP.',
    21211: 'Invalid phone number.',
    21614: 'This phone number cannot receive SMS messages.',
};

/**
 * Converts a raw Twilio error into a clean Error with a user-friendly message.
 */
function mapTwilioError(err) {
    console.error('[Twilio] code=%s status=%s message=%s moreInfo=%s',
        err.code, err.status, err.message, err.moreInfo);
    const friendly = TWILIO_ERRORS[err.code];
    const out = new Error(friendly || `Twilio error ${err.code}: ${err.message}`);
    out.twilioCode = err.code;
    out.httpStatus = err.status >= 400 && err.status < 500 ? 400 : 500;
    return out;
}

// Lazy-init so missing env vars only blow up at call time, not at module load
let _client = null;
function getClient() {
    if (!_client) {
        if (!accountSid || !authToken) {
            throw new Error('Twilio credentials not configured (TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN)');
        }
        _client = twilio(accountSid, authToken);
    }
    return _client;
}

/**
 * Send an OTP to the given phone number via Twilio Verify (SMS channel).
 * @param {string} phoneNumber  E.164 format e.g. "+918707095798"
 * @returns {Promise<{success:boolean, sid:string}>}
 */
const sendPhoneOTP = async (phoneNumber) => {
    const client = getClient();
    try {
        const verification = await client.verify.v2
            .services(serviceSid)
            .verifications
            .create({ to: phoneNumber, channel: 'sms' });
        return { success: true, sid: verification.sid, status: verification.status };
    } catch (err) {
        throw mapTwilioError(err);
    }
};

/**
 * Verify the OTP code entered by the user.
 * @param {string} phoneNumber  E.164 format
 * @param {string} code         6-digit OTP entered by the user
 * @returns {Promise<{success:boolean, valid:boolean, status:string}>}
 */
const verifyPhoneOTP = async (phoneNumber, code) => {
    const client = getClient();
    try {
        const check = await client.verify.v2
            .services(serviceSid)
            .verificationChecks
            .create({ to: phoneNumber, code });
        return {
            success: true,
            valid:   check.status === 'approved',
            status:  check.status,
        };
    } catch (err) {
        throw mapTwilioError(err);
    }
};

module.exports = { sendPhoneOTP, verifyPhoneOTP };
