import type { Category } from '@/types';
import { categories } from '@/lib/categories';
import { districts, type District } from '@/lib/districts';

// Where and in what Needer is open for requests right now (owner + board, 2026-11).
// The single switch for expanding: add a district or category key here and it shows
// up everywhere (request form, filters, homepage, server validation). Use 'all' to
// open everything. Nothing is deleted when something is left out — it is only hidden,
// and existing requests keep working.
export const LAUNCH_DISTRICTS: string[] | 'all' = ['porto'];
export const LAUNCH_CATEGORIES: string[] | 'all' = ['home-repairs', 'renovation', 'cleaning', 'moving', 'garden'];

export const isLaunchDistrict = (key: string) => LAUNCH_DISTRICTS === 'all' || LAUNCH_DISTRICTS.includes(key);
export const isLaunchCategory = (key: string) => LAUNCH_CATEGORIES === 'all' || LAUNCH_CATEGORIES.includes(key);

export const launchCategories: Category[] = categories.filter((c) => isLaunchCategory(c.key));
export const launchDistricts: District[] = districts.filter((d) => isLaunchDistrict(d.key));

// "Porto" / "Porto e Braga" — for copy such as "for now we are only in …".
export function launchDistrictNames(pt: boolean) {
    const names = launchDistricts.map((d) => (pt ? d.labelPT : d.labelEN));
    if (names.length <= 1) return names[0] ?? '';
    return `${names.slice(0, -1).join(', ')} ${pt ? 'e' : 'and'} ${names[names.length - 1]}`;
}
