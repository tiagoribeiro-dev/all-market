import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import Waitlist from '@/lib/models/Waitlist';
import ProApplication from '@/lib/models/ProApplication';
import { districts } from '@/lib/districts';
import { isLaunchDistrict } from '@/lib/launch';

type Row = { _id: string; n: number };

// GET: supply and demand per district (admin only) — where to open next.
// Pros are counted by the district on their approved application.
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        if ((session.user as { role: string }).role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await dbConnect();
        const [waiting, pros, pending] = await Promise.all([
            Waitlist.aggregate<Row>([{ $group: { _id: '$district', n: { $sum: 1 } } }]),
            ProApplication.aggregate<Row>([{ $match: { status: 'approved' } }, { $group: { _id: '$district', n: { $sum: 1 } } }]),
            ProApplication.aggregate<Row>([{ $match: { status: { $in: ['pending', 'needs_info'] } } }, { $group: { _id: '$district', n: { $sum: 1 } } }]),
        ]);
        const count = (rows: Row[], key: string) => rows.find((r) => r._id === key)?.n ?? 0;

        const rows = districts.map((d) => ({
            key: d.key,
            labelPT: d.labelPT,
            labelEN: d.labelEN,
            open: isLaunchDistrict(d.key),
            waitlist: count(waiting, d.key),
            pros: count(pros, d.key),
            pendingPros: count(pending, d.key),
        }));
        return NextResponse.json({ rows });
    } catch (error) {
        console.error('Error building coverage:', error);
        return NextResponse.json({ error: 'Failed to load coverage' }, { status: 500 });
    }
}
