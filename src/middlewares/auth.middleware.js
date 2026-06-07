import jwt from 'jsonwebtoken';
import AuthenticationModel from '#/models/authentication.model.js';
import mongoose from 'mongoose';
import { LRUCache } from "lru-cache";

const cache = new LRUCache({
    max: 500,                    // সর্বোচ্চ 500 ইউজার ডাটা ক্যাশ হবে
    ttl: 1000 * 60 * 15,        // 15 মিনিট পর ডাটা এক্সপায়ার হবে
    updateAgeOnGet: true,       // ডাটা পড়ার সময় TTL রিফ্রেশ হবে
    allowStale: false          // এক্সপায়ার্ড ডাটা রিটার্ন করবে না
});

export const isSignin = async (req, res, next) => {
    try {
        const token = req.headers.authorization && req.headers.authorization.startsWith('Bearer') ? req.headers.authorization.split(' ')[1] : null;
        if (!token) { return res.status(401).json({ success: false, message: 'Access Denied. Please Send Your Token' }) }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.auth = { _id: decoded._id };
        next();

    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ success: false, message: 'Session expired. Please log in again' });
        }

        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ success: false, message: 'Invalid token. Please log in again' });
        }

        return res.status(500).json({
            success: false,
            message: "Internal Server Error in authentication middleware"
        });
    }
};

export const authorizeRoles = (...roles) => {
    return async (req, res, next) => {
        try {

            if (!req.auth || !req.auth._id) { return res.status(401).json({ success: false, message: 'Authentication Required' }) }
            if (!mongoose.Types.ObjectId.isValid(req.auth._id)) { return res.status(400).json({ success: false, message: 'Invalid User ID' }) }

            const cache_key = `signin:_id:${req.auth._id}`
            let is_signin = cache.get(cache_key);

            if (!is_signin) {
                is_signin = await AuthenticationModel.findById(req.auth._id).select('role status').lean();
                if (is_signin) { cache.set(cache_key, is_signin) }
            }

            // const is_signin = await AuthenticationModel.findById(req.auth._id).select('role status');
            if (!is_signin) { return res.status(404).json({ success: false, message: 'User Not Found' }) }

            if (is_signin.status !== 'active') { return res.status(403).json({ success: false, message: 'Account Suspended' }) }
            if (!roles.includes(is_signin.role)) { return res.status(403).json({ success: false, message: 'Access Forbidden' }) }

            req.authentication = is_signin;
            next();

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Internal Server Error'
            });
        }
    };
};