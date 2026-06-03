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
    image: Joi.any().optional().empty("").allow(null),
    status: Joi.string().valid("active", "inactive").optional().empty("").allow(null)
})

export const section_schema = Joi.object({
    section_name: Joi.string().trim().min(3).max(50).required(),
    class_time: Joi.string().trim().required(),
    created_by: Joi.string().trim().optional().empty("").allow(null)
})

export const subject_schema = Joi.object({
    subject_name: Joi.string().trim().min(3).max(50).required(),
    subject_code: Joi.string().trim().min(3).max(10).required(),
    created_by: Joi.string().trim().optional().empty("").allow(null)
})

export const teacher_appointed_schema = Joi.object({
    teacher_id: Joi.string().trim().required(),
    semester_id: Joi.string().trim().required(),
    department_id: Joi.string().trim().required(),
    section_id: Joi.string().trim().required(),
    subject_id: Joi.string().trim().required(),
    class_day: Joi.string().valid("Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday").required(),
    class_period: Joi.string().valid("1st_Period", "2nd_Period", "3rd_Period", "4th_Period", "5th_Period", "6th_Period").required(),
    class_time: Joi.string().trim().required(),
    class_room: Joi.string().trim().required(),
    class_type: Joi.string().valid("Theory", "Practical", "Lab").required(),
    status: Joi.string().valid("active", "inactive", "cancelled").optional().empty("").allow(null),
    notes: Joi.string().trim().min(10).max(100).optional().empty("").allow(null),
    created_by: Joi.string().trim().optional().empty("").allow(null)
})

export const teacher_schema = Joi.object({
    date_and_time: Joi.date().required(),
    first_name: Joi.string().trim().min(3).max(15).required(),
    last_name: Joi.string().trim().min(3).max(15).required(),
    phone: Joi.string().trim().min(11).max(11).required(),
    email: Joi.string().email().trim().min(8).lowercase().optional().empty("").allow(null),
    department_id: Joi.string().trim().required(),
    designation: Joi.string().trim().min(3).max(30).required(),
    qualification: Joi.string().trim().min(3).max(30).optional().empty("").allow(null),
    gender: Joi.string().valid("Male", "Female", "Other").required(),
    blood_group: Joi.string().valid("A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-").optional().empty("").allow(null),
    religion: Joi.string().valid("Islam", "Hindu", "Christian", "Buddhism", "Other").optional().empty("").allow(null),
    address: Joi.string().trim().min(10).max(150).optional().empty("").allow(null),
    status: Joi.string().valid("active", "inactive", "suspended").optional().empty("").allow(null)
})

export const teacher_salary_schema = Joi.object({
    date_and_time: Joi.date().required(),
    teacher_id: Joi.string().trim().required(),
    salary: Joi.number().min(0).required(),
    bonus: Joi.number().min(0).optional().empty("").allow(null),
    salary_payment: Joi.number().min(0).required(),
    salary_type: Joi.string().valid("daily", "weekly", "monthly", "yearly").required(),
    payment_method: Joi.string().valid("cash", "bank_transfer", "mobile_banking", "cheque", "others").required(),
    payment_status: Joi.string().valid("pending", "confirmed", "refunded", "cancelled").optional().empty("").allow(null),
    notes: Joi.string().trim().min(10).max(100).optional().empty("").allow(null),
    created_by: Joi.string().trim().optional().empty("").allow(null)
})

export const teacher_class_note_schema = Joi.object({
    date_and_time: Joi.date().required(),
    class_id: Joi.string().trim().required(),
    chapter_name: Joi.string().trim().min(3).max(50).required(),
    chapter_notes: Joi.string().trim().min(10).max(1000).optional().empty("").allow(null),
    created_by: Joi.string().trim().optional().empty("").allow(null)
})

export const teacher_attendance_schema = Joi.object({
    date_and_time: Joi.date().required(),
    teacher_id: Joi.string().trim().required(),
    check_in_time: Joi.date().optional().empty("").allow(null),
    check_out_time: Joi.date().optional().empty("").allow(null),
    status: Joi.string().valid("present", "absent", "late", "half_day", "holiday").required(),
    notes: Joi.string().trim().min(10).max(100).optional().empty("").allow(null),
    created_by: Joi.string().trim().optional().empty("").allow(null)
})






export const students_schema = Joi.object({
    date_and_time: Joi.date().required(),
    first_name: Joi.string().trim().min(3).max(15).required(),
    last_name: Joi.string().trim().min(3).max(15).required(),
    phone: Joi.string().trim().min(11).max(11).required(),
    semester_id: Joi.string().trim().required(),
    section_id: Joi.string().trim().required(),
    department_id: Joi.string().trim().required(),
    semester_fee: Joi.number().min(0).required(),
    institute_name: Joi.string().trim().min(3).max(50).optional().empty("").allow(null),
    blood_group: Joi.string().valid("A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-").optional().empty("").allow(null),
    gender: Joi.string().valid("Male", "Female", "Other").optional().empty("").allow(null),
    religion: Joi.string().valid("Islam", "Hindu", "Christian", "Buddhism", "Other").optional().empty("").allow(null),
    guardian_name: Joi.string().trim().min(3).max(15).optional().empty("").allow(null),
    guardian_phone: Joi.string().trim().min(11).max(11).optional().empty("").allow(null),
    guardian_relation_ship: Joi.string().valid("Father", "Mother", "Brother", "Sister", "Uncle", "Others").optional().empty("").allow(null),
    address: Joi.string().trim().min(10).max(100).optional().empty("").allow(null),
    notes: Joi.string().trim().min(0).max(100).optional().empty("").allow(null),
})

export const payment_schema = Joi.object({
    date_and_time: Joi.date().required(),
    student_id: Joi.string().required(),
    payment: Joi.number().required().min(0),
    payment_method: Joi.string().valid("Cash", "Bkash", "Nagad", "Bank", "Other").required()
});

export const routine_schema = Joi.object({
    routine_name: Joi.string().trim().min(3).max(30).required(),
    semester_id: Joi.string().trim().required(),
    section_id: Joi.string().trim().required(),
})

export const create_class_in_routine_schema = Joi.object({
    routine_id: Joi.string().trim().required(),
    class_days: Joi.string().valid("saturday", "sunday", "monday", "tuesday", "wednesday", "thursday", "friday").required(),
    class_period: Joi.string().valid("1st_period", "2nd_period", "3rd_period", "4th_period").required(),
    subject_name: Joi.string().trim().min(3).max(30).required(),
    class_time: Joi.string().trim().min(3).max(30).required(),
    teacher_id: Joi.string().trim().required()
})

export const expense_schema = Joi.object({
    date_and_time: Joi.date().required(),
    expense_name: Joi.string().trim().min(3).max(100).required(),
    expense_type: Joi.string().valid("personal_expense", "give_loan", "take_loan", "shop_due", "others").required(),
    amount: Joi.number().min(0).required(),
    notes: Joi.string().trim().max(200).optional().empty("").allow(null)
});

export const tournament_schema = Joi.object({
    date_and_time: Joi.date().optional().empty("").allow(null),
    name: Joi.string().trim().min(3).max(30).required(),
    phone: Joi.string().trim().min(11).max(11).required(),
    institute_name: Joi.string().trim().min(3).max(50).required(),
    semester_name: Joi.string().valid("1st_Semester", "2nd_Semester", "3rd_Semester", "4th_Semester", "5th_Semester", "6th_Semester", "7th_Semester", "8th_Semester").required(),
    department_name: Joi.string().trim().min(3).max(20).required(),
    gender: Joi.string().valid("Male", "Female", "Other").required(),
    jersey_name: Joi.string().trim().min(3).max(20).required(),
    jersey_number: Joi.string().trim().min(1).max(3).required(),
    jersey_size: Joi.string().valid("S", "M", "L", "XL", "XXL", "XXXL").required(),
    payment_amount: Joi.number().min(0).optional().empty("").allow(null),
    payment_method: Joi.string().valid("Cash", "Bkash", "Nagad", "Bank", "Other").optional().empty("").allow(null),
    notes: Joi.string().trim().min(10).max(200).optional().empty("").allow(null)
});