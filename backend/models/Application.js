import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
    {
        internship: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Internship',
            required: true,
        },
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        company: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Company',
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted', 'withdrawn'],
            default: 'pending',
        },
        coverLetter: {
            type: String,
            maxlength: 1500,
        },
        resume: {
            filename: String,
            path: String,
        },
        answers: [
            {
                question: String,
                answer: String,
            },
        ],
        statusHistory: [
            {
                status: String,
                changedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                },
                changedAt: {
                    type: Date,
                    default: Date.now,
                },
                note: String,
            },
        ],
        reviewedAt: {
            type: Date,
        },
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

// Compound index to prevent duplicate applications
applicationSchema.index({ internship: 1, student: 1 }, { unique: true });

// Indexes for querying
applicationSchema.index({ student: 1, status: 1 });
applicationSchema.index({ company: 1, status: 1 });
applicationSchema.index({ internship: 1, status: 1 });

// Middleware to update application count on internship
applicationSchema.post('save', async function () {
    const Internship = mongoose.model('Internship');
    const count = await mongoose.model('Application').countDocuments({
        internship: this.internship,
    });
    await Internship.findByIdAndUpdate(this.internship, {
        applicationsCount: count,
    });
});

applicationSchema.post('remove', async function () {
    const Internship = mongoose.model('Internship');
    const count = await mongoose.model('Application').countDocuments({
        internship: this.internship,
    });
    await Internship.findByIdAndUpdate(this.internship, {
        applicationsCount: count,
    });
});

const Application = mongoose.model('Application', applicationSchema);

export default Application;
