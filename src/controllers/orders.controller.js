import mongoose from "mongoose";
import { orders_schema } from "#/validations/joi.schema.validation.js";
import { createFormattedDate, createPagination } from "#/utils/common.utils.js";
import AuthenticationModel from "#/models/authentication.model.js";
import PackagesModel from "#/models/packages.model.js";
import ServiceModel from "#/models/services.model.js";
import OrdersModel from "#/models/orders.model.js";

export const create = async (req, res) => {
    try {
        const authentication_id = req.auth._id;
        const service_id = req.params.service_id;
        const { date_and_time, package_id } = req.body;
        const { error } = orders_schema.validate(req.body, { errors: { wrap: { label: "" } } });
        if (error) { return res.status(400).json({ success: false, message: error.details[0].message }) }
        if (!mongoose.Types.ObjectId.isValid(authentication_id)) { return res.status(400).json({ success: false, message: "Invalid Authentication ID format" }) }
        if (!mongoose.Types.ObjectId.isValid(service_id)) { return res.status(400).json({ success: false, message: "Invalid Service ID format" }) }
        if (!mongoose.Types.ObjectId.isValid(package_id)) { return res.status(400).json({ success: false, message: "Invalid Package ID format" }) }

        const [isAuthentication, isServices, isPackages, isMatchPackage] = await Promise.all([
            AuthenticationModel.findById(authentication_id).lean(),
            ServiceModel.findById(service_id).lean(),
            PackagesModel.findById(package_id).lean(),
            PackagesModel.findOne({ _id: package_id, service_id: service_id }).lean()
        ]);

        if (!isAuthentication) { return res.status(409).json({ success: false, message: "Not Found By ID" }) }
        if (!isServices) { return res.status(404).json({ success: false, message: "Not Found By ID" }) }
        if (!isPackages) { return res.status(404).json({ success: false, message: "Not Found By ID" }) }
        if (!isMatchPackage) { return res.status(400).json({ success: false, message: "Package does not belong to this service" }) }

        const result = await new OrdersModel({
            date_and_time: date_and_time || new Date(),
            date_and_time_format: createFormattedDate(date_and_time || new Date()),
            authentication_id: authentication_id,
            service_id: service_id,
            package_id: package_id
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
        const { from_date = "", to_date = "", authentication = "", services = "", packages = "" } = req.query;
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

        // === filter by services ===
        if (packages && packages !== 'undefined' && packages !== "null" && packages !== "") {
            if (mongoose.Types.ObjectId.isValid(packages)) {
                dataFilter.package_id = packages;
            } else {
                return res.status(400).json({
                    success: false, message: 'Invalid packages ID format'
                });
            }
        }

        const [orders, count] = await Promise.all([
            OrdersModel.find(dataFilter)
                .populate('authentication_id', 'full_name email phone role status')
                .populate('service_id', 'service_name')
                .populate('package_id', 'package_name')
                .sort({ createdAt: -1 }).limit(limit).skip((page - 1) * limit).lean(),
            OrdersModel.countDocuments(dataFilter)
        ]);

        const result = orders.map((order) => {
            return {
                ...order,
                authentication_id: order.authentication_id._id,
                authentication: {
                    name: order.authentication_id.full_name,
                    email: order.authentication_id.email,
                    phone: order.authentication_id.phone,
                    role: order.authentication_id.role,
                    status: order.authentication_id.status
                },
                service_id: order.service_id._id,
                service_name: order.service_id.service_name,
                package_id: order.package_id._id,
                package_name: order.package_id.package_name
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
        const result = await OrdersModel.findById(id)
            .populate('authentication_id', 'full_name')
            .populate('service_id', 'service_name')
            .populate('package_id', 'package_name').lean();

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
                    service_name: result.service_id.service_name,
                    package_id: result.package_id._id,
                    package_name: result.package_id.package_name
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
        const { service_id, id } = req.params;
        const authentication_id = req.auth._id;
        const { date_and_time, package_id, paid_amount, payment_status, payment_method, message, status } = req.body;

        // === Basic field validation ===
        const { error } = orders_schema.validate(req.body, { errors: { wrap: { label: "" } } });
        if (error) { return res.status(400).json({ success: false, message: error.details[0].message }) }
        if (!mongoose.Types.ObjectId.isValid(id)) { return res.status(400).json({ success: false, message: "Invalid ID Format" }) }
        if (!mongoose.Types.ObjectId.isValid(service_id)) { return res.status(400).json({ success: false, message: "Invalid ID format" }) }
        if (!mongoose.Types.ObjectId.isValid(authentication_id)) { return res.status(400).json({ success: false, message: "Invalid ID format" }) }
        if (!mongoose.Types.ObjectId.isValid(package_id)) { return res.status(400).json({ success: false, message: "Invalid ID format" }) }

        const [isOrders, isAuthentication, isServices, isPackages, isMatchPackage] = await Promise.all([
            OrdersModel.findById(id).lean(),
            AuthenticationModel.findById(authentication_id).lean(),
            ServiceModel.findById(service_id).lean(),
            PackagesModel.findById(package_id).lean(),
            PackagesModel.findOne({ _id: package_id, service_id: service_id }).lean()
        ]);

        if (!isOrders) { return res.status(404).json({ success: false, message: "Not Found By ID" }) }
        if (!isAuthentication) { return res.status(404).json({ success: false, message: "Authentication Not Found" }) }
        if (!isServices) { return res.status(404).json({ success: false, message: "Services Not Found" }) }
        if (!isPackages) { return res.status(404).json({ success: false, message: "Packages Not Found" }) }
        if (!isMatchPackage) { return res.status(400).json({ success: false, message: "Package does not belong to this service" }) }

        const result = await ReviewsModel.findByIdAndUpdate(id, {
            date_and_time: date_and_time || new Date(),
            date_and_time_format: createFormattedDate(date_and_time || new Date()),
            authentication_id: authentication_id,
            service_id: service_id,
            package_id: package_id,
            paid_amount: paid_amount,
            payment_status: payment_status,
            payment_method: payment_method,
            message: message,
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
        const isOrders = await OrdersModel.findById(id).lean();
        if (!isOrders) { return res.status(404).json({ success: false, message: "Item Not Found" }) }
        const result = await OrdersModel.findByIdAndDelete(id);

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