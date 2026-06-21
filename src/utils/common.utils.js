import JWT from "jsonwebtoken"
import { LRUCache } from "lru-cache";

export const createJSONWebToken = (payload, secretKey, expiresIn) => {
    if (typeof payload !== 'object' || !payload) {
        throw new Error("Payload must be a non-empty object");
    }
    if (typeof secretKey !== 'string' || secretKey === '') {
        throw new Error("Secret key must be a non-empty string");
    }
    if (typeof expiresIn !== 'string' && typeof expiresIn !== 'number') {
        throw new Error("expiresIn must be a non-empty string or a number");
    }
    try {
        return JWT.sign(payload, secretKey, { expiresIn })
    } catch (error) {
        throw new Error(error.message || 'JWT Internal Server Error');
    }
}

export const corsConfiguration = {
    origin: (origin, callback) => {
        const allowedOrigins = ['http://localhost:5173', 'https://verifiedb2blead.com', 'https://digitaltechplus.vercel.app', 'https://digital-tech-plus-dashboard.vercel.app'];
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Content-Range', 'X-Content-Range']
};

export const compressionConfig = {
    threshold: '1kb', level: 6,
    filter: (req, res) => {
        if (req.headers['x-no-compression']) { return false };
        const contentType = res.getHeader('Content-Type');
        if (!contentType) return false;

        const compressibleTypes = ['application/json', 'application/javascript', 'application/xml', 'text/html', 'text/css', 'text/plain', 'text/xml'];
        return compressibleTypes.some(type => contentType.includes(type));
    }
}

export const createPagination = (page, limit, count) => {
    return {
        per_page: limit,
        current_page: page,
        total_data: count,
        total_page: Math.ceil(count / limit),
        previous: page - 1 > 0 ? page - 1 : null,
        next: page + 1 <= Math.ceil(count / limit) ? page + 1 : null
    };
};

export const createFormattedDate = (date) => {
    const now = date ? new Date(date) : new Date();
    return date ? now.toLocaleString("en-GB", { timeZone: "Asia/Dhaka", day: "2-digit", month: "2-digit", year: "numeric" }) : null;
};

export const cache = new LRUCache({
    max: 500,               // Cache এ সর্বোচ্চ ৫০০টি entry রাখা হবে
    ttl: 1000 * 60 * 30,     // প্রতিটি cache entry 30 মিনিট পর্যন্ত বৈধ থাকবে
    allowStale: false,      // মেয়াদোত্তীর্ণ (expired) data return করবে না
    updateAgeOnGet: false,  // data read করলে cache এর মেয়াদ পুনরায় বৃদ্ধি পাবে না
    updateAgeOnHas: false,  // has() check করলে cache এর মেয়াদ পুনরায় বৃদ্ধি পাবে না
    ttlAutopurge: true,     // মেয়াদোত্তীর্ণ data স্বয়ংক্রিয়ভাবে cache থেকে মুছে ফেলবে
});