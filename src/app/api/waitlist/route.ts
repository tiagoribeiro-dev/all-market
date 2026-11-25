import { NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/db';
import Waitlist from '@/lib/models/Waitlist';
import { DISTRICT_KEYS } from '@/lib/districts';
import { isLaunchDistrict } from '@/lib/launch';
import { categories } from '@/lib/categories';
import { email, parseBody } from '@/lib/validation';
import { clientIp, HOUR, rateLimit, tooManyRequests } from '@/lib/rateLimit';

const waitlistSchema = z.object({
    email,
    district: z.enum(DISTRICT_KEYS),
    category: z.string().max(40).optional(),
    locale: z.enum(['pt', 'en']).default('pt'),
});

// POST /api/waitlist — "tell me when Needer opens in my district". No account needed.
// Same answer whether or not the address was already on the list.
export async function POST(request: Request) {
    try {
        if (!(await rateLimit(`waitlist:${clientIp(request.headers)}`, 10, HOUR))) {
            return NextResponse.json(tooManyRequests, { status: 429 });
        }
        const { data, error } = await parseBody(request, waitlistSchema);
        if (error) return error;
        if (isLaunchDistrict(data.district)) {
            return NextResponse.json({ error: 'Needer is already open in this district' }, { status: 400 });
        }
        const category = categories.some((c) => c.key === data.category) ? data.category : '';

        await dbConnect();
        await Waitlist.updateOne(
            { email: data.email.toLowerCase(), district: data.district },
            { $set: { category, locale: data.locale } },
            { upsert: true },
        );
        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error('Waitlist error:', err);
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
    }
}
