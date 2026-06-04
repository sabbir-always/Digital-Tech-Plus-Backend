import mongoose from "mongoose";
import { review_schema } from "#/validations/joi.schema.validation.js";
import { createFormattedDate, createPagination } from "#/utils/common.utils.js";
import ServiceModel from "#/models/services.model.js";
import AuthenticationModel from "#/models/authentication.model.js";
import ReviewsModel from "#/models/reviews.model.js";

export const create = async (req, res) => {
    try {
        const authentication_id = req.auth._id;
        const { date_and_time, service_id, rating, comments } = req.body;
        const { error } = review_schema.validate(req.body, { errors: { wrap: { label: "" } } });
        if (error) { return res.status(400).json({ success: false, message: error.details[0].message }) }
        if (!mongoose.Types.ObjectId.isValid(authentication_id)) { return res.status(400).json({ success: false, message: "Invalid Authentication ID format" }) }
        if (!mongoose.Types.ObjectId.isValid(service_id)) { return res.status(400).json({ success: false, message: "Invalid Service ID format" }) }

        const [isAuthentication, isServices] = await Promise.all([
            AuthenticationModel.findById(authentication_id).lean(),
            ServiceModel.findById(service_id).lean()
        ]);

        if (!isAuthentication) { return res.status(409).json({ success: false, message: "Not Found By ID" }) }
        if (!isServices) { return res.status(404).json({ success: false, message: "Not Found By ID" }) }

        const result = await new ReviewsModel({
            date_and_time: date_and_time || new Date(),
            date_and_time_format: createFormattedDate(date_and_time || new Date()),
            authentication_id: authentication_id,
            service_id: service_id,
            rating: rating,
            comments: comments
        }).save();

        if (result) {
            return res.status(201).json({
                success: true,
                message: 'Item Create Success',
                payload: result
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal Server Error'
        });
    }
}

export const show = async (req, res) => {
    try {
        const search = req.query.search || "";
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const searchQuery = new RegExp('.*' + search + '.*', 'i');
        const { from_date = "", to_date = "", authentication = "", services = "" } = req.query;
        // === search filter ===
        const dataFilter = {}

        if (from_date || to_date) {
            dataFilter.date_and_time = {};
            if (from_date) { dataFilter.date_and_time.$gte = new Date(from_date) }
            if (to_date) { dataFilter.date_and_time.$lte = new Date(to_date) }
        }

        // === filter by authentication ===
        if (authentication && authentication !== 'undefined' && authentication !== "null" && authentication !== "") {
            if (mongoose.Types.ObjectId.isValid(authentication)) {
                dataFilter.authentication_id = authentication;
            } else {
                return res.status(400).json({
                    success: false, message: 'Invalid authentication ID format'
                });
            }
        }

        // === filter by services ===
        if (services && services !== 'undefined' && services !== "null" && services !== "") {
            if (mongoose.Types.ObjectId.isValid(services)) {
                dataFilter.service_id = services;
            } else {
                return res.status(400).json({
                    success: false, message: 'Invalid services ID format'
                });
            }
        }

        const [reviews, count] = await Promise.all([
            ReviewsModel.find(dataFilter)
                .populate('authentication_id', 'full_name email phone role status')
                .populate('service_id', 'service_name')
                .sort({ createdAt: -1 }).limit(limit).skip((page - 1) * limit).lean(),
            ReviewsModel.countDocuments(dataFilter)
        ]);

        const result = reviews.map((review) => {
            return {
                ...review,
                authentication_id: review.authentication_id._id,
                authentication: {
                    name: review.authentication_id.full_name,
                    email: review.authentication_id.email,
                    phone: review.authentication_id.phone,
                    role: review.authentication_id.role,
                    status: review.authentication_id.status
                },
                service_id: review.service_id._id,
                service_name: review.service_id.service_name
            }
        })

        if (result.length === 0) {
            return res.status(200).json({ success: false, message: "No Data Found" });
        } else {
            return res.status(200).json({
                success: true,
                message: 'Item Show Success',
                pagination: createPagination(page, limit, count),
                payload: result,
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal Server Error'
        });
    }
}

export const indvidual = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) { return res.status(400).json({ success: false, message: "Invalid ID Format" }) }
        const result = await ReviewsModel.findById(id)
            .populate('authentication_id', 'full_name email phone role status')
            .populate('service_id', 'service_name').lean();

        if (!result) {
            return res.status(200).json({ success: false, message: "No Data Found" });
        } else {
            return res.status(200).json({
                success: true,
                message: 'Item Show Success',
                payload: {
                    ...result,
                    authentication_id: result.authentication_id._id,
                    authentication: {
                        name: result.authentication_id.full_name,
                        email: result.authentication_id.email,
                        phone: result.authentication_id.phone,
                        role: result.authentication_id.role,
                        status: result.authentication_id.status
                    },
                    service_id: result.service_id._id,
                    service_name: result.service_id.service_name
                }
            });
        }

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal Server Error'
        });
    }
}

export const update = async (req, res) => {
    try {
        const { id } = req.params
        const authentication_id = req.auth._id;
        const { date_and_time, service_id, rating, comments, status } = req.body;

        // === Basic field validation ===
        const { error } = review_schema.validate(req.body, { errors: { wrap: { label: "" } } });
        if (error) { return res.status(400).json({ success: false, message: error.details[0].message }) }
        if (!mongoose.Types.ObjectId.isValid(id)) { return res.status(400).json({ success: false, message: "Invalid ID Format" }) }
        if (!mongoose.Types.ObjectId.isValid(authentication_id)) { return res.status(400).json({ success: false, message: "Invalid ID format" }) }
        if (!mongoose.Types.ObjectId.isValid(service_id)) { return res.status(400).json({ success: false, message: "Invalid ID format" }) }

        const [isReviews, isAuthentication, isServices] = await Promise.all([
            ReviewsModel.findById(id).lean(),
            AuthenticationModel.findById(authentication_id).lean(),
            ServiceModel.findById(service_id).lean()
        ]);

        if (!isReviews) { return res.status(404).json({ success: false, message: "Not Found By ID" }) }
        if (!isAuthentication) { return res.status(404).json({ success: false, message: "Authentication Not Found" }) }
        if (!isServices) { return res.status(404).json({ success: false, message: "Services Not Found" }) }

        const result = await ReviewsModel.findByIdAndUpdate(id, {
            date_and_time: date_and_time || new Date(),
            date_and_time_format: createFormattedDate(date_and_time || new Date()),
            authentication_id: authentication_id,
            service_id: service_id,
            rating: rating,
            comments: comments,
            status: status
        }, { new: true })

        if (result) {
            return res.status(200).json({
                success: true,
                message: 'Item Update Success',
                payload: result
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal Server Error'
        });
    }
}

export const destroy = async (req, res) => {
    try {

        const { id } = req.params
        if (!mongoose.Types.ObjectId.isValid(id)) { return res.status(400).json({ success: false, message: "Invalid ID Format" }) }
        const isReviews = await ReviewsModel.findById(id).lean();
        if (!isReviews) { return res.status(404).json({ success: false, message: "Item Not Found" }) }
        const result = await ReviewsModel.findByIdAndDelete(id);

        if (!result) {
            return res.status(200).json({ success: false, message: "Data Not Found" });
        } else {
            return res.status(200).json({
                success: true,
                message: 'Item Destroy Success',
            });
        }

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal Server Error'
        });
    }
}