import mongoose from "mongoose";

const OrdersSchema = new mongoose.Schema({
    date_and_time: {
        type: Date,
        required: [true, "Date and Time is required"],
        default: Date.now
    },
    date_and_time_format: {
        type: String,
        default: null
    },
    authentication_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Authentication",
        required: [true, "User is required"]
    },
    service_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Services",
        required: [true, "Service is required"]
    },
    package_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Packages",
        required: [true, "Package is required"]
    },
    paid_amount: {
        type: Number,
        required: [true, "Paid amount is required"],
        min: [0, "Paid amount must be greater than 0"],
        defrault: 0
    },
    payment_status: {
        type: String,
        enum: ["pending", "paid", "refunded"],
        default: "pending"
    },
    payment_method: {
        type: String,
        enum: ["Cash", "Bkash", "Nagad", "Binance", "Bank_Transfer"],
        default: null
    },
    message: {
        type: String,
        trim: true,
        minlength: [10, "Message must be at least 10 characters"],
        maxlength: [100, "Message cannot exceed 50 characters"],
        default: null
    },
    status: {
        type: String,
        required: [true, "Status is required"],
        enum: ["pending", "cancelled", "postponed", "completed"],
        default: "pending"
    }
}, { timestamps: true });

const OrdersModel = mongoose.model("Orders", OrdersSchema);
export default OrdersModel;
