import mongoose from "mongoose";

const PortfolioSchema = new mongoose.Schema({
    date_and_time: {
        type: Date,
        required: [true, "Date and Time is required"],
        default: Date.now
    },
    date_and_time_format: {
        type: String,
        default: null
    },
    portfolio_name: {
        type: String,
        trim: true,
        unique: true,
        required: [true, "Service name is required"],
        minlength: [20, "Service name must be at least 20 characters"],
        maxlength: [40, "Service name cannot exceed 40 characters"]
    },
    description: {
        type: String,
        trim: true,
        required: [true, "Description is required"],
        minlength: [50, "Short description must be at least 50 characters"],
        maxlength: [160, "Short description cannot exceed 160 characters"]
    },
    categories_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Categories",
        required: [true, "Categories is required"]
    },
    attachment: {
        type: String,
        default: null
    },
    status: {
        type: String,
        required: [true, "Status is required"],
        enum: ["active", "inactive"],
        default: "active"
    }
}, { timestamps: true });

const PortfolioModel = mongoose.model("Portfolio", PortfolioSchema);
export default PortfolioModel;
