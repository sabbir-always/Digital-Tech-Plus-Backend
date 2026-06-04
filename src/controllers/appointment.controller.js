import mongoose from "mongoose";
import { appointment_schema } from "#/validations/joi.schema.validation.js";
import { createPagination, createFormattedDate } from "#/utils/common.utils.js";
import AppointmentModel from "#/models/appointment.model.js";

export const create = async (req, res) => {
    try {
        const { date_and_time, meeting_date_and_time, first_name, last_name, phone, email, country, address, message, gmt_and_utc_timezone, meeting_time, meeting_period, meeting_with } = req.body;
        const { error } = appointment_schema.validate(req.body, { errors: { wrap: { label: "" } } });
        if (error) { return res.status(400).json({ success: false, message: error.details[0].message }) }

        const [isExistPhone, isExistEmail] = await Promise.all([
            AppointmentModel.exists({ phone: { $regex: new RegExp(`^${phone.trim()}$`, 'i') } }),
            AppointmentModel.exists({ email: { $regex: new RegExp(`^${email.trim()}$`, 'i') } })
        ]);

        if (isExistPhone) { return res.status(409).json({ success: false, message: "Phone already exists. Try another." }) }
        if (isExistEmail) { return res.status(409).json({ success: false, message: "Email already exists. Try another." }) }

        const result = await new AppointmentModel({
            date_and_time: date_and_time || new Date(),
            date_and_time_format: createFormattedDate(date_and_time || new Date()),
            meeting_date_and_time: meeting_date_and_time,
            meeting_date_and_time_format: createFormattedDate(meeting_date_and_time),
            first_name: first_name,
            last_name: last_name,
            full_name: first_name + ' ' + last_name,
            phone: phone,
            email: email,
            country: country,
            address: address,
            message: message,
            gmt_and_utc_timezone: gmt_and_utc_timezone,
            meeting_time: meeting_time,
            meeting_period: meeting_period,
            meeting_with: meeting_with
        }).save();

        if (result) {
            return res.status(201).json({
                success: true,
                message: 'Appointment Create Success',
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
        const dataFilter = { $or: [{ full_name: { $regex: searchQuery } }, { email: { $regex: searchQuery } }, { phone: { $regex: searchQuery } }] }

        const [result, count] = await Promise.all([
            AppointmentModel.find(dataFilter).limit(limit).skip((page - 1) * limit).lean(),
            AppointmentModel.countDocuments(dataFilter)
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
        const result = await AppointmentModel.findById(id).lean();

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
        const { date_and_time, meeting_date_and_time, first_name, last_name, phone, email, country, address, message, gmt_and_utc_timezone, meeting_time, meeting_period, meeting_with, status } = req.body;

        // === Basic field validation ===
        const { error } = appointment_schema.validate(req.body, { errors: { wrap: { label: "" } } });
        if (error) { return res.status(400).json({ success: false, message: error.details[0].message }) }

        const [isAppointment, isExistPhone, isExistEmail] = await Promise.all([
            AppointmentModel.findById(id).lean(),
            AppointmentModel.exists({ phone: { $regex: new RegExp(`^${phone.trim()}$`, "i") }, _id: { $ne: id } }),
            AppointmentModel.exists({ email: { $regex: new RegExp(`^${email.trim()}$`, "i") }, _id: { $ne: id } })
        ]);

        if (!isAppointment) { return res.status(404).json({ success: false, message: "Not Found By ID" }) }
        if (isExistPhone) { return res.status(409).json({ success: false, message: "Phone already exists. Try another." }) }
        if (isExistEmail) { return res.status(409).json({ success: false, message: "Email already exists. Try another." }) }

        const result = await AppointmentModel.findByIdAndUpdate(id, {
            date_and_time: date_and_time || new Date(),
            date_and_time_format: createFormattedDate(date_and_time || new Date()),
            meeting_date_and_time: meeting_date_and_time,
            meeting_date_and_time_format: createFormattedDate(meeting_date_and_time),
            first_name: first_name,
            last_name: last_name,
            full_name: first_name + ' ' + last_name,
            phone: phone,
            email: email,
            country: country,
            address: address,
            message: message,
            gmt_and_utc_timezone: gmt_and_utc_timezone,
            meeting_time: meeting_time,
            meeting_period: meeting_period,
            meeting_with: meeting_with,
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

        // === find items ===
        const isAppointment = await AppointmentModel.findById(id).lean();
        if (!isAppointment) { return res.status(404).json({ success: false, message: "Item Not Found" }) }
        const result = await AppointmentModel.findByIdAndDelete(id);

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