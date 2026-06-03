import mongoose from "mongoose";

const ServiceSchema = new mongoose.Schema({
    service_name: {
        type: String,
        trim: true,
        unique: true,
        required: [true, "Service name is required"],
        minlength: [3, "Service name must be at least 3 characters"],
        maxlength: [30, "Service name cannot exceed 30 characters"]
    },
    description: {
        type: String,
        trim: true,
        required: [true, "Description is required"],
        minlength: [3, "Description must be at least 3 characters"],
        maxlength: [200, "Description cannot exceed 200 characters"]
    },
    service_icon: {
        type: String,
        trim: true,
        required: [true, "Service icon is required"]
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
