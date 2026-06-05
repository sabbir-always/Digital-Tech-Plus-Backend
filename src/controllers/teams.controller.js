import mongoose from "mongoose";
import { v2 as cloudinary } from 'cloudinary';
import { uploadCloudinary, uploadMultipleCloudinary } from "#/multer/upload.cloudinary.js";
import { teams_schema } from "#/validations/joi.schema.validation.js";
import { createFormattedDate, createPagination } from "#/utils/common.utils.js";
import TeamsModel from "#/models/teams.model.js";

export const create = async (req, res) => {
    try {
        const { date_and_time, first_name, last_name, phone, email, role, facebook_id, linkedin_id } = req.body;
        const { error } = teams_schema.validate(req.body, { errors: { wrap: { label: "" } } });
        if (error) { return res.status(400).json({ success: false, message: error.details[0].message }) }

        const [isExistPhone, isExistEmail] = await Promise.all([
            TeamsModel.exists({ phone: { $regex: new RegExp(`^${phone.trim()}$`, 'i') } }),
            TeamsModel.exists({ email: { $regex: new RegExp(`^${email.trim()}$`, 'i') } }),
        ]);

        if (isExistPhone) { return res.status(409).json({ success: false, message: "Phone already exists. Try another." }) }
        if (isExistEmail) { return res.status(409).json({ success: false, message: "Email already exists. Try another." }) }

        let attachment = null;
        if (req.file && req.file.path) {
            try {
                const cloudinaryResult = await uploadCloudinary(req.file.path, 'Teams');
                if (cloudinaryResult) { attachment = cloudinaryResult }

            } catch (fileError) {
                console.error('File upload error:', fileError);
                return res.status(500).json({ success: false, message: 'Error processing file upload' });
            }
        }

        const result = await new TeamsModel({
            date_and_time: date_and_time || new Date(),
            date_and_time_format: createFormattedDate(date_and_time || new Date()),
            first_name: first_name,
            last_name: last_name,
            full_name: first_name + ' ' + last_name,
            phone: phone,
            email: email,
            role: role,
            facebook_id: facebook_id,
            linkedin_id: linkedin_id,
            attachment: attachment
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
        const dataFilter = { $or: [{ full_name: { $regex: searchQuery } }] }

        const [result, count] = await Promise.all([
            TeamsModel.find(dataFilter).limit(limit).skip((page - 1) * limit).lean(),
            TeamsModel.countDocuments(dataFilter)
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
        const result = await TeamsModel.findById(id).lean();

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
        const { date_and_time, first_name, last_name, phone, email, role, facebook_id, linkedin_id, status } = req.body;

        // === Basic field validation ===
        const { error } = teams_schema.validate(req.body, { errors: { wrap: { label: "" } } });
        if (error) { return res.status(400).json({ success: false, message: error.details[0].message }) }

        const [isTeams, isExistPhone, isExistEmail] = await Promise.all([
            TeamsModel.findById(id).lean(),
            TeamsModel.exists({ phone: { $regex: new RegExp(`^${phone.trim()}$`, "i") }, _id: { $ne: id } }),
            TeamsModel.exists({ email: { $regex: new RegExp(`^${email.trim()}$`, "i") }, _id: { $ne: id } })
        ]);

        if (!isTeams) { return res.status(404).json({ success: false, message: "Not Found By ID" }) }
        if (isExistPhone) { return res.status(409).json({ success: false, message: "Service already exists. Try another." }) }
        if (isExistEmail) { return res.status(409).json({ success: false, message: "Service already exists. Try another." }) }

        let attachment = isTeams.attachment;
        if (req.file && req.file.path) {
            try {
                const cloudinaryResult = await uploadCloudinary(req.file.path, 'Teams');
                if (cloudinaryResult) {
                    if (attachment && attachment.public_id) { await cloudinary.uploader.destroy(attachment.public_id) } // Delete old images from cloudinary
                    attachment = cloudinaryResult;
                }
            } catch (fileError) {
                console.error('File upload error:', fileError);
                return res.status(500).json({ success: false, message: 'Error processing file upload' });
            }
        }

        const result = await TeamsModel.findByIdAndUpdate(id, {
            date_and_time: date_and_time || new Date(),
            date_and_time_format: createFormattedDate(date_and_time || new Date()),
            first_name: first_name,
            last_name: last_name,
            full_name: first_name + ' ' + last_name,
            phone: phone,
            email: email,
            role: role,
            facebook_id: facebook_id,
            linkedin_id: linkedin_id,
            status: status,
            attachment: attachment
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
        const isTeams = await TeamsModel.findById(id).lean();
        if (!isTeams) { return res.status(404).json({ success: false, message: "Item Not Found" }) }
        const result = await TeamsModel.findByIdAndDelete(id);

        if (!result) {
            return res.status(200).json({ success: false, message: "Data Not Found" });
        } else {

            if (isTeams.attachment && isTeams.attachment.public_id) {
                await cloudinary.uploader.destroy(isTeams.attachment.public_id);
            }

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