import mongoose from "mongoose";

const ReviewsSchema = new mongoose.Schema({
    service_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Services",
        required: [true, "Service is required"]
    },
    authentication_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Authentication",
        required: [true, "User is required"]
    },
    rating: {
        type: Number,
        required: [true, "Rating is required"],
        min: [1, "Rating must be at least 1"],
        max: [5, "Rating cannot exceed 5"]
    },
    comments: {
        type: String,
        trim: true,
        minlength: [10, "Comments must be at least 10 characters"],
        maxlength: [100, "Comments cannot exceed 100 characters"],
        default: null
    },
    status: {
        type: String,
        required: [true, "Status is required"],
        enum: ["active", "inactive"],
        default: "active"
    }
}, { timestamps: true });

const ReviewsModel = mongoose.model("Reviews", ReviewsSchema);
export default ReviewsModel;
