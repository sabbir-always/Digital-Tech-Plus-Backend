import Joi from 'joi';

export const auth_create_schema = Joi.object({
    first_name: Joi.string().trim().min(3).max(15).required(),
    last_name: Joi.string().trim().min(3).max(15).required(),
    phone: Joi.string().trim().min(11).max(11).required(),
    email: Joi.string().email({ tlds: { allow: true } }).trim().min(8).max(50).lowercase().required(),
    password: Joi.string().min(8).max(15).required(),
    confirm_password: Joi.string().valid(Joi.ref('password')).required()
})

export const auth_update_schema = Joi.object({
    first_name: Joi.string().trim().min(3).max(15).required(),
    last_name: Joi.string().trim().min(3).max(15).required(),
    phone: Joi.string().trim().min(11).max(11).required(),
    email: Joi.string().email({ tlds: { allow: true } }).trim().min(8).max(50).lowercase().required(),
    role: Joi.string().valid("superadmin", "admin", "teacher", "student", "anonymous").optional().empty("").allow(null),
    status: Joi.string().valid("active", "inactive").optional().empty("").allow(null)
})

export const auth_change_password_schema = Joi.object({
    old_password: Joi.string().required(),
    new_password: Joi.string().min(8).max(15).required(),
    confirm_password: Joi.string().valid(Joi.ref('new_password')).required()
});

export const auth_signin_schema = Joi.object({
    users: Joi.string().trim().required(),
    password: Joi.string().trim().required(),
})

export const categories_schema = Joi.object({
    categories_name: Joi.string().trim().min(3).max(30).required()
})

export const services_schema = Joi.object({
    service_name: Joi.string().trim().min(20).max(40).required(),
    short_description: Joi.string().trim().min(50).max(100).required(),
    long_description: Joi.string().trim().min(200).max(500).required(),
    categories_id: Joi.string().trim().required(),
    basic_price: Joi.number().min(0).required(),
    attachment: Joi.any().optional().empty("").allow(null),
    status: Joi.string().valid("active", "inactive").optional().empty("").allow(null)
})

export const teams_schema = Joi.object({
    date_and_time: Joi.date().required(),
    first_name: Joi.string().trim().min(3).max(15).required(),
    last_name: Joi.string().trim().min(3).max(15).required(),
    phone: Joi.string().trim().min(11).max(11).required(),
    email: Joi.string().email({ tlds: { allow: true } }).trim().min(8).max(50).lowercase().required(),
    role: Joi.string().trim().min(3).max(30).required(),
    attachment: Joi.any().optional().empty("").allow(null)
})

export const appointment_schema = Joi.object({
    date_and_time: Joi.date().required(),
    meeting_date_and_time: Joi.date().required(),
    first_name: Joi.string().trim().min(3).max(15).required(),
    last_name: Joi.string().trim().min(3).max(15).required(),
    phone: Joi.string().trim().min(8).required(),
    email: Joi.string().email({ tlds: { allow: true } }).trim().min(8).max(50).lowercase().required(),
    country: Joi.string().trim().min(3).max(30).required(),
    address: Joi.string().trim().min(10).max(100).optional().empty("").allow(null),
    message: Joi.string().trim().min(10).optional().empty("").allow(null),
    gmt_and_utc_timezone: Joi.string().valid("GMT+00:00 (UTC)", "GMT+01:00 (UTC+1)", "GMT+02:00 (UTC+2)", "GMT+03:00 (UTC+3)", "GMT+04:00 (UTC+4)", "GMT+05:00 (UTC+5)", "GMT+06:00 (UTC+6)", "GMT+06:30 (UTC+6:30)", "GMT+07:00 (UTC+7)", "GMT+08:00 (UTC+8)", "GMT+09:00 (UTC+9)", "GMT+10:00 (UTC+10)", "GMT+11:00 (UTC+11)", "GMT+12:00 (UTC+12)", "GMT-01:00 (UTC-1)", "GMT-02:00 (UTC-2)", "GMT-03:00 (UTC-3)", "GMT-04:00 (UTC-4)", "GMT-05:00 (UTC-5)", "GMT-06:00 (UTC-6)", "GMT-07:00 (UTC-7)", "GMT-08:00 (UTC-8)", "GMT-09:00 (UTC-9)", "GMT-10:00 (UTC-10)", "GMT-11:00 (UTC-11)", "GMT-12:00 (UTC-12)").required(),
    meeting_time: Joi.string().valid("01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00").required(),
    meeting_period: Joi.string().valid("AM", "PM").required(),
    meeting_with: Joi.string().valid("meeting_with_owner", "digital_marketer", "project_manager").required(),
    status: Joi.string().valid("pending", "cancelled", "postponed", "completed").optional().empty("").allow(null),
})

export const packages_schema = Joi.object({
    service_id: Joi.string().trim().required(),
    package_name: Joi.string().trim().min(3).max(30).required(),
    price: Joi.number().min(0).required(),
    features: Joi.array().items(Joi.string().trim().min(3).max(30)).min(1).required(),
    status: Joi.string().valid("active", "inactive").optional().empty("").allow(null)
})

export const review_schema = Joi.object({
    date_and_time: Joi.date().required(),
    service_id: Joi.string().trim().required(),
    rating: Joi.number().min(1).max(5).required(),
    comments: Joi.string().trim().min(10).max(100).optional().empty("").allow(null),
    status: Joi.string().valid("active", "inactive").optional().empty("").allow(null)
})

export const orders_schema = Joi.object({
    date_and_time: Joi.date().required(),
    authentication_id: Joi.string().trim().required(),
    service_id: Joi.string().trim().required(),
    package_id: Joi.string().trim().required(),
    paid_amount: Joi.number().min(0).optional().empty("").allow(null),
    payment_status: Joi.string().valid("pending", "paid", "refunded").optional().empty("").allow(null),
    payment_method: Joi.string().valid("Cash", "Bkash", "Nagad", "Binance", "Bank_Transfer").optional().empty("").allow(null),
    message: Joi.string().trim().min(10).max(100).optional().empty("").allow(null),
    status: Joi.string().valid("pending", "cancelled", "postponed", "completed").optional().empty("").allow(null)
})