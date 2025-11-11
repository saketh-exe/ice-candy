import mongoose from 'mongoose';

const internshipSchema = new mongoose.Schema(
    {
        company: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Company',
            required: true,
        },
        postedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        title: {
            type: String,
            required: [true, 'Internship title is required'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            maxlength: 3000,
        },
        requirements: {
            type: String,
            maxlength: 2000,
        },
        responsibilities: {
            type: String,
            maxlength: 2000,
        },
        skills: [String],
        location: {
            type: String,
            required: true,
        },
        locationType: {
            type: String,
            enum: ['onsite', 'remote', 'hybrid'],
            default: 'onsite',
        },
        duration: {
            value: Number, // in months
            type: {
                type: String,
                enum: ['months', 'weeks'],
                default: 'months',
            },
        },
        stipend: {
            amount: {
                type: Number,
                default: 0,
            },
            currency: {
                type: String,
                default: 'USD',
            },
            period: {
                type: String,
                enum: ['monthly', 'weekly', 'total'],
                default: 'monthly',
            },
        },
        isPaid: {
            type: Boolean,
            default: true,
        },
        positions: {
            type: Number,
            default: 1,
            min: 1,
        },
        applicationDeadline: {
            type: Date,
        },
        startDate: {
            type: Date,
        },
        endDate: {
            type: Date,
        },
        status: {
            type: String,
            enum: ['draft', 'active', 'closed', 'filled'],
            default: 'active',
        },
        applicationsCount: {
            type: Number,
            default: 0,
        },
        viewsCount: {
            type: Number,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for efficient querying
internshipSchema.index({ company: 1, status: 1 });
internshipSchema.index({ status: 1, isActive: 1, applicationDeadline: 1 });
internshipSchema.index({ title: 'text', description: 'text', skills: 'text' });

// Virtual for applications
internshipSchema.virtual('applications', {
    ref: 'Application',
    localField: '_id',
    foreignField: 'internship',
});

const Internship = mongoose.model('Internship', internshipSchema);

export default Internship;
