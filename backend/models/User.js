import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters'],
            select: false, // Don't return password by default
        },
        role: {
            type: String,
            enum: ['student', 'company', 'admin'],
            required: [true, 'Role is required'],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        isApproved: {
            type: Boolean,
            default: function () {
                // Auto-approve students, require approval for companies
                return this.role === 'student';
            },
        },
        // Student-specific fields
        studentProfile: {
            name: {
                type: String,
                trim: true,
            },
            firstName: {
                type: String,
                trim: true,
            },
            lastName: {
                type: String,
                trim: true,
            },
            phone: {
                type: String,
                trim: true,
            },
            dateOfBirth: {
                type: Date,
            },
            university: {
                type: String,
                trim: true,
            },
            major: {
                type: String,
                trim: true,
            },
            graduationYear: {
                type: Number,
            },
            education: [
                {
                    institution: String,
                    degree: String,
                    fieldOfStudy: String,
                    startDate: Date,
                    endDate: Date,
                    cgpa: Number,
                    current: Boolean,
                },
            ],
            skills: [String],
            interests: [String],
            resume: {
                filename: String,
                path: String,
                uploadedAt: Date,
            },
            bio: {
                type: String,
                maxlength: 500,
            },
            location: {
                city: String,
                state: String,
                country: String,
            },
        },
        // Company-specific fields (reference to Company model)
        company: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Company',
        },
        refreshToken: {
            type: String,
            select: false,
        },
    },
    {
        timestamps: true,
    }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Remove sensitive data when converting to JSON
userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    delete obj.refreshToken;
    return obj;
};

const User = mongoose.model('User', userSchema);

export default User;
