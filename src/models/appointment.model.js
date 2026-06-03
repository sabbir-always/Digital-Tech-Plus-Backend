import mongoose from "mongoose";

const AppointmentSchema = new mongoose.Schema({
    date_and_time: {
        type: Date,
        required: [true, "Date and Time is required"]
    },
    date_and_time_format: {
        type: String,
        default: null
    },
    frist_name: {
        type: String,
        trim: true,
        required: [true, "First Name is required"],
        minlength: [3, "First Name must be at least 3 characters"],
        maxlength: [15, "First Name cannot exceed 15 characters"]
    },
    last_name: {
        type: String,
        trim: true,
        required: [true, "Last Name is required"],
        minlength: [3, "Last Name must be at least 3 characters"],
        maxlength: [15, "Last Name cannot exceed 15 characters"]
    },
    full_name: {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        trim: true,
        unique: true,
        required: [true, "Phone is required"]
    },
    email: {
        type: String,
        trim: true,
        unique: true,
        lowercase: true,
        required: [true, "Email is required"],
        minlength: [8, "Email must be at least 8 characters"],
        maxlength: [50, "Email cannot exceed 50 characters"],
        match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"]
    },
    country: {
        type: String,
        trim: true,
        required: [true, "Country is required"]
    },
    address: {
        type: String,
        trim: true,
        required: [true, "Address is required"],
        minlength: [10, "Address must be at least 10 characters"],
        maxlength: [100, "Address cannot exceed 100 characters"]
    },
    message: {
        type: String,
        trim: true,
        default: null
    },
    gmt_and_utc_timezone: {
        type: String,
        required: [true, "GMT/UTC Timezone is required"],
        enum: ["GMT+00:00 (UTC)", "GMT+01:00 (UTC+1)", "GMT+02:00 (UTC+2)", "GMT+03:00 (UTC+3)", "GMT+04:00 (UTC+4)", "GMT+05:00 (UTC+5)", "GMT+06:00 (UTC+6)", "GMT+06:30 (UTC+6:30)", "GMT+07:00 (UTC+7)", "GMT+08:00 (UTC+8)", "GMT+09:00 (UTC+9)", "GMT+10:00 (UTC+10)", "GMT+11:00 (UTC+11)", "GMT+12:00 (UTC+12)", "GMT-01:00 (UTC-1)", "GMT-02:00 (UTC-2)", "GMT-03:00 (UTC-3)", "GMT-04:00 (UTC-4)", "GMT-05:00 (UTC-5)", "GMT-06:00 (UTC-6)", "GMT-07:00 (UTC-7)", "GMT-08:00 (UTC-8)", "GMT-09:00 (UTC-9)", "GMT-10:00 (UTC-10)", "GMT-11:00 (UTC-11)", "GMT-12:00 (UTC-12)"]
    },
    meeting_time: {
        type: String,
        required: [true, "Meeting Time is required"],
        enum: ["01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00"]
    },
    meeting_period: {
        type: String,
        required: [true, "Meeting Period is required"],
        enum: ["AM", "PM"]
    },
    meeting_with: {
        type: String,
        required: [true, "Meeting With is required"],
        enum: ["meeting_with_owner", "digital_marketer", "project_manager"]
    },
    status: {
        type: String,
        required: [true, "Status is required"],
        enum: ["pending", "cancelled", "completed"],
        default: "pending"
    }
}, { timestamps: true });

const AppointmentModel = mongoose.model("Appointment", AppointmentSchema);
export default AppointmentModel;
