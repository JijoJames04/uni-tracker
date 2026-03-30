export interface Extraction<T = string> {
    value: T;
    confidence: number;
    source: string;
}
export interface ScrapedCourseData {
    universityName: string;
    courseName: string;
    description: string;
    degree: string;
    language: string;
    duration: string;
    fees: number | null;
    feesPerSemester: number | null;
    currency: string;
    deadline: string | null;
    deadlineInternational: string | null;
    deadlineLabel: string | null;
    startDate: string | null;
    applicationUrl: string;
    sourceUrl: string;
    logoUrl: string | null;
    address: string;
    city: string;
    ects: number | null;
    applicationVia: 'DIRECT' | 'UNI_ASSIST' | 'BOTH';
    uniAssistInfo: string;
    requirements: string;
    linkedinUrl: string | null;
    instagramUrl: string | null;
    websiteUrl: string;
    latitude: number | null;
    longitude: number | null;
}
export interface StructuredData {
    jsonLd: any[];
    og: Record<string, string>;
    twitter: Record<string, string>;
    microdata: Record<string, string>;
    meta: Record<string, string>;
}
export type KVPairs = Map<string, string>;
export interface DeadlineResult {
    date: string | null;
    internationalDate: string | null;
    label: string | null;
}
