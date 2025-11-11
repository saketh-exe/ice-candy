import mongoose from 'mongoose';

const companySchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        companyName: {
            type: String,
            required: [true, 'Company name is required'],
            trim: true,
        },
        industry: {
            type: String,
            trim: true,
        },
        companySize: {
            type: String,
            enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
        },
        description: {
            type: String,
            maxlength: 2000,
        },
        website: {
            type: String,
            trim: true,
        },
        logo: {
            filename: String,
            path: String,
            uploadedAt: Date,
        },
        location: {
            address: String,
            city: String,
            state: String,
            country: String,
            zipCode: String,
        },
        contactInfo: {
            phone: String,
            email: String,
            linkedin: String,
        },
        founded: {
            type: Number,
        },
        verified: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Index for searching
companySchema.index({ companyName: 'text', industry: 'text', description: 'text' });

const Company = mongoose.model('Company', companySchema);

export default Company;
