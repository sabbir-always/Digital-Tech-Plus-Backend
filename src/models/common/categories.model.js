import mongoose from "mongoose";

const CategoriesSchema = new mongoose.Schema({
    categories_name: {
        type: String,
        trim: true,
        unique: true,
        required: [true, "Categories name is required"],
        minlength: [3, "Categories name must be at least 3 characters"],
        maxlength: [30, "Categories name cannot exceed 30 characters"]
    },
    total_items: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

const CategoriesModel = mongoose.model("Categories", CategoriesSchema);
export default CategoriesModel;
