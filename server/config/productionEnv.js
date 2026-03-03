/**
 * Production environment defaults.
 *
 * On platforms like Render, environment variables should be set in the
 * dashboard. This file acts as a FALLBACK so the app doesn't break if
 * those dashboard env-vars are accidentally missing.
 *
 * dotenv / platform env vars always take priority because we only set
 * a variable here when it is NOT already present in process.env.
 */

const productionDefaults = {
    NODE_ENV: 'production',
    MONGO_URL: 'mongodb+srv://technologyeirs_db_user:CLk9PmUACa5nFbnR@cluster0.blilxfo.mongodb.net/?appName=Cluster0',
    JWT_SECRET: 'your_jwt_secret_key_change_this_in_production',
    EMAIL_USER: 'technologyeirs@gmail.com',
    EMAIL_PASSWORD: 'alvkfppkptaptzta',
    FRONTEND_URL: 'https://eirs-technology.vercel.app',
    RAZORPAY_KEY_ID: 'rzp_live_SK2al1KdtZ4MA3',
    RAZORPAY_KEY_SECRET: '2lyRlnz8Erd6EkbOUIvHTONp',
    CLOUDINARY_CLOUD_NAME: 'dfitjwwws',
    CLOUDINARY_API_KEY: '979673362888243',
    CLOUDINARY_API_SECRET: 'XhNRBaU0EPy_FWx6XI2pDt1-zo0',
};

function applyProductionDefaults() {
    for (const [key, value] of Object.entries(productionDefaults)) {
        if (!process.env[key]) {
            process.env[key] = value;
        }
    }
    console.log(`✅ Production env defaults applied. EMAIL_USER=${process.env.EMAIL_USER ? 'SET' : 'MISSING'}, EMAIL_PASSWORD=${process.env.EMAIL_PASSWORD ? 'SET' : 'MISSING'}`);
}

module.exports = { applyProductionDefaults };
