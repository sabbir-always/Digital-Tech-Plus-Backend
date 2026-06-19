import mongoose from "mongoose";
import bcrypt from "bcryptjs"
import dotenv from 'dotenv';
dotenv.config();
import { createJSONWebToken, createPagination, createFormattedDate, cache } from "#/utils/common.utils.js";
import { auth_change_password_schema, auth_create_schema, auth_signin_schema, auth_update_schema } from "#/validations/joi.schema.validation.js";
import AuthenticationModel from "#/models/authentication.model.js";

export const create = async (req, res) => {
    try {
        const { first_name, last_name, phone, email, password } = req.body;
        const { error } = auth_create_schema.validate(req.body, { errors: { wrap: { label: "" } } });
        if (error) { return res.status(400).json({ success: false, message: error.details[0].message }) }

        const [isExistedPhone, isExistedEmail, isSuperAdmin] = await Promise.all([
            AuthenticationModel.exists({ phone: { $regex: new RegExp(`^${phone.trim()}$`, 'i') } }),
            AuthenticationModel.exists({ email: { $regex: new RegExp(`^${email.trim()}$`, 'i') } }),
            AuthenticationModel.exists({ role: "superadmin" })
        ])

        if (isExistedPhone) { return res.status(409).json({ success: false, message: "Phone already exists. try another." }) };
        if (isExistedEmail) { return res.status(409).json({ success: false, message: "Email already exists. try another." }) };

        const result = await new AuthenticationModel({
            date_and_time_format: createFormattedDate(Date.now()),
            first_name: first_name,
            last_name: last_name,
            full_name: first_name + ' ' + last_name,
            phone: phone,
            email: email,
            password: password,
            role: !isSuperAdmin ? "superadmin" : "anonymous",
            status: !isSuperAdmin ? "active" : "inactive"
        }).save();

        if (result) {
            const keys = [...cache.keys()];
            keys.forEach(key => { if (key.includes('authentication')) { cache.delete(key) } });

            return res.status(201).json({
                success: true,
                message: !isSuperAdmin ? "Superadmin Create Success" : "Register Success",
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
        const { from_date = "", to_date = "", status = "" } = req.query;

        const cache_key = `authentication:_search:${search}_from_date:${from_date}_to_date:${to_date}_status:${status}_limit:${limit}_page:${page}`
        const cache_data = cache.get(cache_key);
        if (cache_data) return res.status(200).json(cache_data);

        // Add search filter
        const searchQuery = new RegExp('.*' + search + '.*', 'i');
        const dataFilter = { $or: [{ full_name: { $regex: searchQuery } }, { email: { $regex: searchQuery } }, { phone: { $regex: searchQuery } }], role: { $ne: "superadmin" } }
        if (status && ["active", "inactive"].includes(status)) { dataFilter.status = status };

        // Date and time filter
        if (from_date || to_date) {
            dataFilter.date_and_time = {};
            if (from_date) { dataFilter.date_and_time.$gte = new Date(from_date) }

            const endDate = to_date ? new Date(new Date(to_date).setHours(23, 59, 59, 999)) : null;
            if (endDate) { dataFilter.date_and_time.$lte = endDate }

        }

        const [result, count] = await Promise.all([
            AuthenticationModel.find(dataFilter).select("-password").sort({ createdAt: -1 }).limit(limit).skip((page - 1) * limit).lean(),
            AuthenticationModel.countDocuments(dataFilter)
        ]);

        // Check not found
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
            error: error.message || 'Internal Server Error'
        });
    }
}

export const single = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) { return res.status(400).json({ success: false, message: "Invalid ID Format" }) }

        const cache_key = `authentication:_indvidual:${id}`
        const cache_data = cache.get(cache_key);
        if (cache_data) return res.status(200).json(cache_data);

        const result = await AuthenticationModel.findById(id).select("-password").lean();

        if (!result) {
            return res.status(200).json({ success: false, message: "No Data Found" });

        } else {
            cache.set(cache_key, {
                success: true,
                message: 'Item Show Success (from cache)',
                payload: result
            });

            return res.status(200).json({
                success: true,
                message: 'Show Success',
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
        const { first_name, last_name, phone, email, role, status } = req.body;

        // === Basic field validation ===
        const { error } = auth_update_schema.validate(req.body, { errors: { wrap: { label: "" } } });
        if (error) { return res.status(400).json({ success: false, message: error.details[0].message }) }
        if (!mongoose.Types.ObjectId.isValid(id)) { return res.status(400).json({ success: false, message: "Invalid ID Format" }) }

        const [isUsers, isExistedPhone, isExistedEmail] = await Promise.all([
            AuthenticationModel.findById(id).lean(),
            AuthenticationModel.exists({ phone: { $regex: new RegExp(`^${phone.trim()}$`, "i") }, _id: { $ne: id } }),
            AuthenticationModel.exists({ email: { $regex: new RegExp(`^${email.trim()}$`, "i") }, _id: { $ne: id } })
        ]);

        if (!isUsers) { return res.status(404).json({ success: false, message: "Not Found By ID" }) }
        if (isExistedPhone) { return res.status(400).json({ success: false, message: "Phone already exists. Try another." }) }
        if (isExistedEmail) { return res.status(400).json({ success: false, message: "Email already exists. Try another." }) }

        const result = await AuthenticationModel.findByIdAndUpdate(id, {
            first_name: first_name,
            last_name: last_name,
            full_name: first_name + ' ' + last_name,
            phone: phone,
            email: email,
            role: role,
            status: status
        }, { new: true })

        if (result) {
            const keys = [...cache.keys()];
            keys.forEach(key => { if (key.includes('authentication') || key.includes('signin')) { cache.delete(key) } });

            return res.status(200).json({
                success: true,
                message: 'Update Success',
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
        const isUsers = await AuthenticationModel.findById(id).lean();
        if (!isUsers) { return res.status(404).json({ success: false, message: "Item Not Found" }) }

        if (isUsers.role === "superadmin") { return res.status(403).json({ success: false, message: "Cannot delete superadmin account. This is protected." }) }
        if (isUsers.status === "active") { return res.status(403).json({ success: false, message: "Cannot delete active admin. Please deactivate first." }) }
        const result = await AuthenticationModel.findByIdAndDelete(id);

        if (!result) {
            return res.status(200).json({ success: false, message: "Data Not Found" });
        } else {
            const keys = [...cache.keys()];
            keys.forEach(key => { if (key.includes('authentication') || key.includes('signin')) { cache.delete(key) } });

            return res.status(200).json({
                success: true,
                message: 'Supperadmin Destroy Success',
            });
        }

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal Server Error'
        });
    }
}

export const signin = async (req, res) => {
    try {
        const { users, password } = req.body
        const { error } = auth_signin_schema.validate(req.body, { errors: { wrap: { label: "" } } });
        if (error) { return res.status(400).json({ success: false, message: error.details[0].message }) }

        const isExistedUsers = await AuthenticationModel.findOne({ $or: [{ email: { $regex: new RegExp(`^${users.trim()}$`, "i") } }, { phone: { $regex: new RegExp(`^${users.trim()}$`, "i") } }] }).lean();
        if (!isExistedUsers) { return res.status(401).json({ success: false, message: "Invalid credentials. Try again." }) }

        if (isExistedUsers.status !== "active") {
            return res.status(403).json({ success: false, message: "Your account is inactive. Please contact support." });
        }

        if (isExistedUsers.role === "anonymous") {
            return res.status(403).json({ success: false, message: "Anonymous users cannot sign in. Please complete your registration." });
        }

        // === password check ===
        const isMatchPassword = await bcrypt.compare(password, isExistedUsers.password);
        if (!isMatchPassword) { return res.status(401).json({ success: false, message: "Invalid credentials. Try again." }) }

        // === create token ===
        const createToken = createJSONWebToken({ _id: isExistedUsers._id }, process.env.JWT_SECRET_KEY, "1h");
        return res.status(200).json({ success: true, message: `${isExistedUsers.role} signin success`, payload: { token: createToken } });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal Server Error'
        });
    }
}

export const change_password = async (req, res) => {
    try {
        const id = req.auth._id;
        const { old_password, new_password } = req.body;

        // === Validate input ===
        const { error } = auth_change_password_schema.validate(req.body, { errors: { wrap: { label: "" } } });
        if (error) return res.status(400).json({ success: false, message: error.details[0].message });

        // === Check if user exists ===
        if (!mongoose.Types.ObjectId.isValid(id)) { return res.status(400).json({ success: false, message: "Invalid ID Format" }) }
        const isUsers = await AuthenticationModel.findById(id).lean();
        if (!isUsers) return res.status(404).json({ success: false, message: "User not found" });

        // === Verify old password ===
        const isPasswordMatch = await bcrypt.compare(old_password, isUsers.password);
        if (!isPasswordMatch) return res.status(401).json({ success: false, message: "Old password is incorrect" });
        const result = await AuthenticationModel.findByIdAndUpdate(id, { password: new_password }, { new: true })

        if (result) {
            const keys = [...cache.keys()];
            keys.forEach(key => { if (key.includes('authentication') || key.includes('signin')) { cache.delete(key) } });

            return res.status(200).json({
                success: true,
                message: 'Password Change Success',
                payload: result
            });
        }

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal Server Error'
        });
    }
};