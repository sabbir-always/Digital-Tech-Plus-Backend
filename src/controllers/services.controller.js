import mongoose from "mongoose";
import { v2 as cloudinary } from 'cloudinary';
import { uploadCloudinary, uploadMultipleCloudinary } from "#/multer/upload.cloudinary.js";
import { services_schema } from "#/validations/joi.schema.validation.js";
import { createPagination, cache } from "#/utils/common.utils.js";
import ServiceModel from "#/models/services.model.js";
import CategoriesModel from "#/models/categories.model.js";
import ReviewsModel from "#/models/reviews.model.js";
import PackagesModel from "#/models/packages.model.js";

export const create = async (req, res) => {
    try {
        const { service_name, short_description, long_description, categories_id, basic_price } = req.body;
        const { error } = services_schema.validate(req.body, { errors: { wrap: { label: "" } } });
        if (error) { return res.status(400).json({ success: false, message: error.details[0].message }) }
        if (!mongoose.Types.ObjectId.isValid(categories_id)) { return res.status(400).json({ success: false, message: "Invalid ID format" }) }

        const [isExistedService, isCategories] = await Promise.all([
            ServiceModel.exists({ service_name: { $regex: new RegExp(`^${service_name.trim()}$`, 'i') } }),
            CategoriesModel.findById(categories_id).lean()
        ]);

        if (isExistedService) { return res.status(409).json({ success: false, message: "Service already exists. Try another." }) }
        if (!isCategories) { return res.status(404).json({ success: false, message: "Not Found By ID" }) }

        // let attachment = null;
        // if (req.file && req.file.path) {
        //     try {
        //         const cloudinaryResult = await uploadCloudinary(req.file.path, 'Services');
        //         if (cloudinaryResult) { attachment = cloudinaryResult }

        //     } catch (fileError) {
        //         console.error('File upload error:', fileError);
        //         return res.status(500).json({ success: false, message: 'Error processing file upload' });
        //     }
        // }

        let attachment = [];
        if (req.files && req.files.length > 0) {
            try {
                const filePaths = req.files.map(file => file.path);
                const cloudinaryResults = await uploadMultipleCloudinary(filePaths, 'Services');
                if (cloudinaryResults && cloudinaryResults.length > 0) { attachment = cloudinaryResults }

            } catch (fileError) {
                console.error('File upload error:', fileError);
                return res.status(500).json({ success: false, message: 'Error processing file upload' });
            }
        }

        const result = await new ServiceModel({
            service_name: service_name,
            short_description: short_description,
            long_description: long_description,
            categories_id: categories_id,
            basic_price: basic_price,
            attachment: attachment
        }).save();

        if (result) {
            const keys = [...cache.keys()];
            keys.forEach(key => { if (key.includes('services')) { cache.delete(key) } });

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

        const cache_key = `services:_search:${search}_categories:${categories}_limit:${limit}_page:${page}`
        const cache_data = cache.get(cache_key);
        if (cache_data) return res.status(200).json(cache_data);

        // === search filter ===
        const searchQuery = new RegExp('.*' + search + '.*', 'i');
        const dataFilter = { $or: [{ service_name: { $regex: searchQuery } }] }

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

        const [services, count] = await Promise.all([
            ServiceModel.find(dataFilter).populate('categories_id', 'categories_name').sort({ createdAt: -1 }).limit(limit).skip(offset).lean(),
            ServiceModel.countDocuments(dataFilter)
        ]);

        const result = services.map((service) => {
            return {
                ...service,
                categories_id: service.categories_id._id,
                categories_name: service.categories_id.categories_name
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

        const cache_key = `services:_search:${search}_limit:${limit}`
        const cache_data = cache.get(cache_key);
        if (cache_data) return res.status(200).json(cache_data);

        // === search filter ===
        const searchQuery = new RegExp('.*' + search + '.*', 'i');
        const dataFilter = { status: "active", $or: [{ service_name: { $regex: searchQuery } }] }

        const services = await ServiceModel.find(dataFilter).populate('categories_id', 'categories_name').limit(limit).lean();
        const result = services.map((service) => {
            return {
                ...service,
                categories_id: service.categories_id._id,
                categories_name: service.categories_id.categories_name
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
                message: 'Items Show Success',
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

        const cache_key = `services:_indvidual:${id}`
        const cache_data = cache.get(cache_key);
        if (cache_data) return res.status(200).json(cache_data);

        const [result, reviews, packages] = await Promise.all([
            ServiceModel.findById(id).populate('categories_id', 'categories_name').lean(),
            ReviewsModel.find({ service_id: id }).lean(),
            PackagesModel.find({ service_id: id }).lean(),
        ]);

        if (!result) {
            return res.status(200).json({ success: false, message: "No Data Found" });
        } else {
            cache.set(cache_key, {
                success: true,
                message: 'Item Show Success (from cache)',
                payload: {
                    ...result,
                    categories_id: result.categories_id._id,
                    categories_name: result.categories_id.categories_name,
                    reviews: reviews,
                    packages: packages
                }
            });

            return res.status(200).json({
                success: true,
                message: 'Item Show Success',
                payload: {
                    ...result,
                    categories_id: result.categories_id._id,
                    categories_name: result.categories_id.categories_name,
                    reviews: reviews,
                    packages: packages
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
        const { service_name, short_description, long_description, categories_id, basic_price, status } = req.body;

        // === Basic field validation ===
        const { error } = services_schema.validate(req.body, { errors: { wrap: { label: "" } } });
        if (error) { return res.status(400).json({ success: false, message: error.details[0].message }) }
        if (!mongoose.Types.ObjectId.isValid(id)) { return res.status(400).json({ success: false, message: "Invalid ID Format" }) }
        if (!mongoose.Types.ObjectId.isValid(categories_id)) { return res.status(400).json({ success: false, message: "Invalid ID format" }) }

        const [isServices, isExistedService, isCategories] = await Promise.all([
            ServiceModel.findById(id).lean(),
            ServiceModel.exists({ service_name: { $regex: new RegExp(`^${service_name.trim()}$`, "i") }, _id: { $ne: id } }),
            CategoriesModel.findById(categories_id).lean()
        ]);

        if (!isServices) { return res.status(404).json({ success: false, message: "Not Found By ID" }) }
        if (isExistedService) { return res.status(409).json({ success: false, message: "Service already exists. Try another." }) }
        if (!isCategories) { return res.status(404).json({ success: false, message: "Categories Not Found" }) }

        // let attachment = isServices.attachment;
        // if (req.file && req.file.path) {
        //     try {
        //         const cloudinaryResult = await uploadCloudinary(req.file.path, 'Services');
        //         if (cloudinaryResult) {
        //             if (attachment && attachment.public_id) { await cloudinary.uploader.destroy(attachment.public_id) } // Delete old images from cloudinary
        //             attachment = cloudinaryResult;
        //         }
        //     } catch (fileError) {
        //         console.error('File upload error:', fileError);
        //         return res.status(500).json({ success: false, message: 'Error processing file upload' });
        //     }
        // }

        let attachment = isServices.attachment || [];
        if (req.files && req.files.length > 0) {
            try {
                const filePaths = req.files.map(file => file.path);
                const cloudinaryResults = await uploadMultipleCloudinary(filePaths, 'Services');
                if (cloudinaryResults && cloudinaryResults.length > 0) {
                    if (attachment && attachment.length > 0) {
                        for (const img of attachment) {
                            if (img.public_id) { await cloudinary.uploader.destroy(img.public_id) } // Delete old images from cloudinary
                        }
                    }
                    attachment = cloudinaryResults;
                }
            } catch (fileError) {
                console.error('File upload error:', fileError);
                return res.status(500).json({ success: false, message: 'Error processing file upload' });
            }
        }

        const result = await ServiceModel.findByIdAndUpdate(id, {
            service_name: service_name,
            short_description: short_description,
            long_description: long_description,
            categories_id: categories_id,
            basic_price: basic_price,
            status: status,
            attachment: attachment
        }, { new: true })

        if (result) {
            const keys = [...cache.keys()];
            keys.forEach(key => { if (key.includes('services')) { cache.delete(key) } });

            if (isServices.categories_id.toString() !== categories_id) {
                await Promise.all([
                    CategoriesModel.findByIdAndUpdate(categories_id, { $inc: { total_service: 1 } }),
                    CategoriesModel.findByIdAndUpdate(isServices.categories_id, { $inc: { total_service: -1 } }),
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
        const isServices = await ServiceModel.findById(id).lean();
        if (!isServices) { return res.status(404).json({ success: false, message: "Item Not Found" }) }
        const result = await ServiceModel.findByIdAndDelete(id);

        if (!result) {
            return res.status(200).json({ success: false, message: "Data Not Found" });
        } else {

            const keys = [...cache.keys()];
            keys.forEach(key => { if (key.includes('services')) { cache.delete(key) } });

            // if (isServices.attachment && isServices.attachment.public_id) {
            //     await cloudinary.uploader.destroy(isServices.attachment.public_id);
            // }

            if (isServices.attachment && isServices.attachment.length > 0) {
                for (const image of isServices.attachment) {
                    if (image.public_id) { await cloudinary.uploader.destroy(image.public_id) }
                }
            }

            await Promise.all([CategoriesModel.findByIdAndUpdate(isServices.categories_id, { $inc: { total_service: -1 } })]);
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
