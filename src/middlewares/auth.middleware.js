import jwt from 'jsonwebtoken';
import AuthenticationModel from '#/models/authentication.model.js';
import mongoose from 'mongoose';

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

            const isExistUsers = await AuthenticationModel.findById(req.auth._id).select('role status');
            if (!isExistUsers) { return res.status(404).json({ success: false, message: 'User Not Found' }) }

            if (isExistUsers.status !== 'active') { return res.status(403).json({ success: false, message: 'Account Suspended' }) }
            if (!roles.includes(isExistUsers.role)) { return res.status(403).json({ success: false, message: 'Access Forbidden' }) }

            req.authentication = isExistUsers;
            next();

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    };
};