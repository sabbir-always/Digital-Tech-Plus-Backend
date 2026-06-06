import mongoose from "mongoose";
import { packages_schema } from "#/validations/joi.schema.validation.js";
import { createPagination } from "#/utils/common.utils.js";
import PackagesModel from "#/models/packages.model.js";
import ServiceModel from "#/models/services.model.js";

export const create = async (req, res) => {
    try {
        const { service_id, package_name, price, features } = req.body;
        const { error } = packages_schema.validate(req.body, { errors: { wrap: { label: "" } } });
        if (error) { return res.status(400).json({ success: false, message: error.details[0].message }) }
        if (!mongoose.Types.ObjectId.isValid(service_id)) { return res.status(400).json({ success: false, message: "Invalid ID format" }) }

        const [isExistedPackage, isServices] = await Promise.all([
            PackagesModel.exists({ service_id: service_id, package_name: { $regex: new RegExp(`^${package_name.trim()}$`, 'i') } }),
            ServiceModel.findById(service_id).lean()
        ]);

        if (isExistedPackage) { return res.status(409).json({ success: false, message: "This package name already exists under the same service. Try another." }) }
        if (!isServices) { return res.status(404).json({ success: false, message: "Not Found By ID" }) }

        const result = await new PackagesModel({
            service_id: service_id,
            package_name: package_name,
            price: price,
            features: features
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

        // === search filter ===
        const dataFilter = { $or: [{ package_name: { $regex: searchQuery } }] }

        const [packages, count] = await Promise.all([
            PackagesModel.find(dataFilter).populate('service_id', 'service_name').sort({ createdAt: -1 }).limit(limit).skip((page - 1) * limit).lean(),
            PackagesModel.countDocuments(dataFilter)
        ]);

        const result = packages.map((pack) => {
            return {
                ...pack,
                service_id: pack.service_id._id,
                service_name: pack.service_id.service_name
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
        const result = await PackagesModel.findById(id).populate('service_id', 'service_name').lean();

        if (!result) {
            return res.status(200).json({ success: false, message: "No Data Found" });
        } else {
            return res.status(200).json({
                success: true,
                message: 'Item Show Success',
                payload: {
                    ...result,
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
        const { service_id, package_name, price, features } = req.body;

        // === Basic field validation ===
        const { error } = packages_schema.validate(req.body, { errors: { wrap: { label: "" } } });
        if (error) { return res.status(400).json({ success: false, message: error.details[0].message }) }
        if (!mongoose.Types.ObjectId.isValid(id)) { return res.status(400).json({ success: false, message: "Invalid ID Format" }) }
        if (!mongoose.Types.ObjectId.isValid(service_id)) { return res.status(400).json({ success: false, message: "Invalid ID format" }) }

        const [isPackages, isExistedPackage, isServices] = await Promise.all([
            PackagesModel.findById(id).lean(),
            PackagesModel.exists({ service_id: service_id, package_name: { $regex: new RegExp(`^${package_name.trim()}$`, "i") }, _id: { $ne: id } }),
            ServiceModel.findById(service_id).lean()
        ]);

        if (!isPackages) { return res.status(404).json({ success: false, message: "Not Found By ID" }) }
        if (isExistedPackage) { return res.status(409).json({ success: false, message: "This package name already exists under the same service. Try another." }) }
        if (!isServices) { return res.status(404).json({ success: false, message: "Services Not Found" }) }

        const result = await PackagesModel.findByIdAndUpdate(id, {
            service_id: service_id,
            package_name: package_name,
            price: price,
            features: features
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

        // === find items ===
        const isPackages = await PackagesModel.findById(id).lean();
        if (!isPackages) { return res.status(404).json({ success: false, message: "Item Not Found" }) }
        const result = await PackagesModel.findByIdAndDelete(id);

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