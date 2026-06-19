import mongoose from "mongoose";
import { v2 as cloudinary } from 'cloudinary';
import { uploadCloudinary, uploadMultipleCloudinary } from "#/multer/upload.cloudinary.js";
import { portfolio_schema } from "#/validations/joi.schema.validation.js";
import { createFormattedDate, createPagination, cache } from "#/utils/common.utils.js";
import PortfolioModel from "#/models/portfolio.model.js";
import CategoriesModel from "#/models/categories.model.js";

export const create = async (req, res) => {
    try {
        const { date_and_time, portfolio_name, description, categories_id, drive_link } = req.body;
        const { error } = portfolio_schema.validate(req.body, { errors: { wrap: { label: "" } } });
        if (error) { return res.status(400).json({ success: false, message: error.details[0].message }) }

        const [isExistPortfolio, isCategories] = await Promise.all([
            PortfolioModel.exists({ portfolio_name: { $regex: new RegExp(`^${portfolio_name.trim()}$`, 'i') } }),
            CategoriesModel.findById(categories_id).lean()
        ]);

        if (isExistPortfolio) { return res.status(409).json({ success: false, message: "Portfolio already exists. Try another." }) }
        if (!isCategories) { return res.status(404).json({ success: false, message: "Not Found By ID" }) }

        let attachment = null;
        if (req.file && req.file.path) {
            try {
                const cloudinaryResult = await uploadCloudinary(req.file.path, 'Portfolio');
                if (cloudinaryResult) { attachment = cloudinaryResult }

            } catch (fileError) {
                console.error('File upload error:', fileError);
                return res.status(500).json({ success: false, message: 'Error processing file upload' });
            }
        }

        const result = await new PortfolioModel({
            date_and_time: date_and_time || new Date(),
            date_and_time_format: createFormattedDate(date_and_time || new Date()),
            portfolio_name: portfolio_name,
            description: description,
            categories_id: categories_id,
            drive_link: drive_link,
            attachment: attachment
        }).save();

        if (result) {
            const keys = [...cache.keys()];
            keys.forEach(key => { if (key.includes('portfolio')) { cache.delete(key) } });

            await Promise.all([CategoriesModel.findByIdAndUpdate(categories_id, { $inc: { total_service: 1 } })]);
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
        const offset = (page - 1) * limit;
        const { categories = "" } = req.query;

        const cache_key = `portfolio:_search:${search}_categories:${categories}_limit:${limit}_page:${page}`
        const cache_data = cache.get(cache_key);
        if (cache_data) return res.status(200).json(cache_data);

        // === search filter ===
        const searchQuery = new RegExp('.*' + search + '.*', 'i');
        const dataFilter = { $or: [{ portfolio_name: { $regex: searchQuery } }] }

        // === filter by categories ===
        if (categories && categories !== 'undefined' && categories !== "null" && categories !== "") {
            if (mongoose.Types.ObjectId.isValid(categories)) {
                dataFilter.categories_id = categories;
            } else {
                return res.status(400).json({
                    success: false, message: 'Invalid categories ID format'
                });
            }
        }

        const [portfolio, count] = await Promise.all([
            PortfolioModel.find(dataFilter).populate('categories_id', 'categories_name').sort({ createdAt: -1 }).limit(limit).skip(offset).lean(),
            PortfolioModel.countDocuments(dataFilter)
        ]);

        const result = portfolio.map((port) => {
            return {
                ...port,
                categories_id: port.categories_id._id,
                categories_name: port.categories_id.categories_name
            }
        })

        if (result.length === 0) {
            return res.status(200).json({ success: false, message: "No Data Found" });
        } else {
            cache.set(cache_key, {
                success: true,
                message: 'Item Show Success (from cache)',
                pagination: createPagination(page, limit, count),
                payload: result
            });

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

export const show_data = async (req, res) => {
    try {
        const search = req.query.search || "";
        const limit = Number(req.query.limit);

        const cache_key = `portfolio:_search:${search}_limit:${limit}`
        const cache_data = cache.get(cache_key);
        if (cache_data) return res.status(200).json(cache_data);

        // === search filter ===
        const searchQuery = new RegExp('.*' + search + '.*', 'i');
        const dataFilter = { status: "active", $or: [{ portfolio_name: { $regex: searchQuery } }] }

        const portfolio = await PortfolioModel.find(dataFilter).populate('categories_id', 'categories_name').limit(limit).lean();
        const result = portfolio.map((port) => {
            return {
                ...port,
                categories_id: port.categories_id._id,
                categories_name: port.categories_id.categories_name
            }
        })

        if (result.length === 0) {
            return res.status(200).json({ success: false, message: "No Data Found" });
        } else {
            cache.set(cache_key, {
                success: true,
                message: 'Item Show Success (from cache)',
                payload: result
            });

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

export const indvidual = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) { return res.status(400).json({ success: false, message: "Invalid ID Format" }) }

        const cache_key = `portfolio:_indvidual:${id}`
        const cache_data = cache.get(cache_key);
        if (cache_data) return res.status(200).json(cache_data);

        const result = await PortfolioModel.findById(id).populate('categories_id', 'categories_name').lean()

        if (!result) {
            return res.status(200).json({ success: false, message: "No Data Found" });
        } else {
            cache.set(cache_key, {
                success: true,
                message: 'Item Show Success (from cache)',
                payload: {
                    ...result,
                    categories_id: result.categories_id._id,
                    categories_name: result.categories_id.categories_name
                }
            });

            return res.status(200).json({
                success: true,
                message: 'Item Show Success',
                payload: {
                    ...result,
                    categories_id: result.categories_id._id,
                    categories_name: result.categories_id.categories_name
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
        const { date_and_time, portfolio_name, description, categories_id, drive_link, status } = req.body;

        // === Basic field validation ===
        const { error } = portfolio_schema.validate(req.body, { errors: { wrap: { label: "" } } });
        if (error) { return res.status(400).json({ success: false, message: error.details[0].message }) }

        const [isPortfolio, isExistPortfolio] = await Promise.all([
            PortfolioModel.findById(id).lean(),
            PortfolioModel.exists({ portfolio_name: { $regex: new RegExp(`^${portfolio_name.trim()}$`, "i") }, _id: { $ne: id } })
        ]);

        if (!isPortfolio) { return res.status(404).json({ success: false, message: "Not Found By ID" }) }
        if (isExistPortfolio) { return res.status(409).json({ success: false, message: "Portfolio already exists. Try another." }) }

        let attachment = isPortfolio.attachment;
        if (req.file && req.file.path) {
            try {
                const cloudinaryResult = await uploadCloudinary(req.file.path, 'Portfolio');
                if (cloudinaryResult) {
                    if (attachment && attachment.public_id) { await cloudinary.uploader.destroy(attachment.public_id) } // Delete old images from cloudinary
                    attachment = cloudinaryResult;
                }
            } catch (fileError) {
                console.error('File upload error:', fileError);
                return res.status(500).json({ success: false, message: 'Error processing file upload' });
            }
        }

        const result = await PortfolioModel.findByIdAndUpdate(id, {
            date_and_time: date_and_time || new Date(),
            date_and_time_format: createFormattedDate(date_and_time || new Date()),
            portfolio_name: portfolio_name,
            description: description,
            categories_id: categories_id,
            drive_link: drive_link,
            status: status,
            attachment: attachment
        }, { new: true })

        if (result) {
            const keys = [...cache.keys()];
            keys.forEach(key => { if (key.includes('portfolio')) { cache.delete(key) } });

            if (isPortfolio.categories_id.toString() !== categories_id) {
                await Promise.all([
                    CategoriesModel.findByIdAndUpdate(categories_id, { $inc: { total_service: 1 } }),
                    CategoriesModel.findByIdAndUpdate(isPortfolio.categories_id, { $inc: { total_service: -1 } }),
                ]);
            }
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
        const isPortfolio = await PortfolioModel.findById(id).lean();
        if (!isPortfolio) { return res.status(404).json({ success: false, message: "Item Not Found" }) }
        const result = await PortfolioModel.findByIdAndDelete(id);

        if (!result) {
            return res.status(200).json({ success: false, message: "Data Not Found" });
        } else {
            const keys = [...cache.keys()];
            keys.forEach(key => { if (key.includes('portfolio')) { cache.delete(key) } });

            if (isPortfolio.attachment && isPortfolio.attachment.public_id) {
                await cloudinary.uploader.destroy(isPortfolio.attachment.public_id);
            }
            await Promise.all([CategoriesModel.findByIdAndUpdate(isPortfolio.categories_id, { $inc: { total_service: -1 } })]);
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