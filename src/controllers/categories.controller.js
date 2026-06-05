import mongoose from "mongoose";
import { categories_schema } from "#/validations/joi.schema.validation.js";
import { createPagination } from "#/utils/common.utils.js";
import CategoriesModel from "#/models/categories.model.js";

export const create = async (req, res) => {
    try {
        const { categories_name } = req.body;
        const { error } = categories_schema.validate(req.body, { errors: { wrap: { label: "" } } });
        if (error) { return res.status(400).json({ success: false, message: error.details[0].message }) }

        const isExisted = await CategoriesModel.exists({ categories_name: { $regex: new RegExp(`^${categories_name.trim()}$`, 'i') } })
        if (isExisted) { return res.status(409).json({ success: false, message: "Category already exists. Try another." }) };
        const result = await new CategoriesModel({ categories_name: categories_name }).save();

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
        const dataFilter = { $or: [{ categories_name: { $regex: searchQuery } }] }
        const [result, count] = await Promise.all([
            CategoriesModel.find(dataFilter).sort({ createdAt: -1 }).limit(limit).skip((page - 1) * limit).lean(),
            CategoriesModel.countDocuments(dataFilter)
        ]);

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
        const result = await CategoriesModel.findById(id).lean();

        if (!result) {
            return res.status(200).json({ success: false, message: "No Data Found" });
        } else {
            return res.status(200).json({
                success: true,
                message: 'Item Show Success',
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

export const update = async (req, res) => {
    try {
        const { id } = req.params
        const { categories_name } = req.body;

        const { error } = categories_schema.validate(req.body, { errors: { wrap: { label: "" } } });
        if (error) { return res.status(400).json({ success: false, message: error.details[0].message }) }

        if (!mongoose.Types.ObjectId.isValid(id)) { return res.status(400).json({ success: false, message: "Invalid ID Format" }) }
        const [isCategories, isExisted] = await Promise.all([
            CategoriesModel.findById(id).lean(),
            CategoriesModel.exists({ categories_name: { $regex: new RegExp(`^${categories_name.trim()}$`, "i") }, _id: { $ne: id } })
        ]);

        if (!isCategories) { return res.status(404).json({ success: false, message: "Not Found By ID" }) }
        if (isExisted) { return res.status(409).json({ success: false, message: "Category already exists. Try another." }) };
        const result = await CategoriesModel.findByIdAndUpdate(id, { categories_name: categories_name }, { new: true })

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

        const isCategories = await CategoriesModel.findById(id).lean();
        if (!isCategories) { return res.status(404).json({ success: false, message: "Item Not Found" }) }

        if (isCategories.total_service > 0) {
            return res.status(400).json({ success: false, message: "The Category cannot be deleted because it contains service." });
        }

        const result = await CategoriesModel.findByIdAndDelete(id);
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