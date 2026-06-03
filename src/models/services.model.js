import mongoose from "mongoose";

const ServiceSchema = new mongoose.Schema({
    service_name: {
        type: String,
        trim: true,
        unique: true,
        required: [true, "Service name is required"],
        minlength: [20, "Service name must be at least 20 characters"],
        maxlength: [40, "Service name cannot exceed 40 characters"]
    },
    short_description: {
        type: String,
        trim: true,
        required: [true, "Description is required"],
        minlength: [50, "Short description must be at least 50 characters"],
        maxlength: [100, "Short description cannot exceed 100 characters"]
    },
    long_description: {
        type: String,
        trim: true,
        required: [true, "Description is required"],
        minlength: [200, "Long description must be at least 200 characters"],
        maxlength: [500, "Long description cannot exceed 500 characters"]
    },
    categories_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Categories",
        required: [true, "Categories is required"]
    },
    basic_price: {
        type: Number,
        required: [true, "Basic Price is required"],
        default: 0
    },
    attachment: {
        type: Array,
        default: []
    },
    status: {
        type: String,
        required: [true, "Status is required"],
        enum: ["active", "inactive"],
        default: "active"
    }
}, { timestamps: true });

const ServiceModel = mongoose.model("Service", ServiceSchema);
export default ServiceModel;
