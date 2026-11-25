import mongoose, { Schema, models } from 'mongoose';
import { DISTRICT_KEYS } from '@/lib/districts';

// People outside the launch area (src/lib/launch.ts) who asked to be told when
// Needer opens in their district. Also the demand signal for choosing where to
// expand. Used only for that one notice (see the Privacy page); delete the
// entries of a district once it has been notified.
const WaitlistSchema = new Schema(
    {
        email: { type: String, required: true, lowercase: true, trim: true },
        district: { type: String, enum: DISTRICT_KEYS, required: true },
        category: { type: String, default: '' },
        locale: { type: String, enum: ['pt', 'en'], default: 'pt' },
    },
    { timestamps: true }
);

WaitlistSchema.index({ email: 1, district: 1 }, { unique: true });
WaitlistSchema.index({ district: 1 });

const Waitlist = models.Waitlist || mongoose.model('Waitlist', WaitlistSchema);
export default Waitlist;
