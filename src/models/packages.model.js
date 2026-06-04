import mongoose from "mongoose";

const PackagesSchema = new mongoose.Schema({
    service_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Services",
        required: [true, "Service is required"]
    },
    package_name: {
        type: String,
        trim: true,
        required: [true, "Package name is required"],
        minlength: [3, "Package name must be at least 3 characters"],
        maxlength: [30, "Package name cannot exceed 30 characters"]
    },
    price: {
        type: Number,
        required: [true, "Price is required"],
        min: [0, "Price must be greater than 0"]
    },
    features: {
        type: [String],
        required: [true, "Features are required"],
        validate: { validator: function (v) { return v.length > 0 }, message: "At least one feature is required" }
    },
    status: {
        type: String,
        required: [true, "Status is required"],
        enum: ["active", "inactive"],
        default: "active"
    }
}, { timestamps: true });

const PackagesModel = mongoose.model("Packages", PackagesSchema);
export default PackagesModel;
