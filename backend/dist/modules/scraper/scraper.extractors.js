"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractUniversityName = extractUniversityName;
exports.extractCourseName = extractCourseName;
exports.extractDescription = extractDescription;
exports.extractDegree = extractDegree;
exports.extractLanguage = extractLanguage;
exports.extractDuration = extractDuration;
exports.extractFees = extractFees;
exports.extractFeesPerSemester = extractFeesPerSemester;
exports.extractDeadline = extractDeadline;
exports.extractStartDate = extractStartDate;
exports.extractECTS = extractECTS;
exports.extractCity = extractCity;
exports.extractApplicationUrl = extractApplicationUrl;
exports.extractLogo = extractLogo;
exports.extractSocialLinks = extractSocialLinks;
exports.detectApplicationVia = detectApplicationVia;
exports.extractUniAssistInfo = extractUniAssistInfo;
exports.extractAddress = extractAddress;
exports.extractRequirements = extractRequirements;
exports.getCityCoordinates = getCityCoordinates;
const scraper_constants_1 = require("./scraper.constants");
const scraper_utils_1 = require("./scraper.utils");
function extractUniversityName($, text, hostname, sd, kv) {
    const candidates = [];
    for (const [domain, info] of Object.entries(scraper_constants_1.KNOWN_UNIVERSITIES)) {
        if (hostname.endsWith(domain) && info.name) {
            candidates.push((0, scraper_utils_1.ext)(info.name, 1.0, 'known-mapping'));
            break;
        }
    }
    const courseLD = (0, scraper_utils_1.findJsonLdByType)(sd, 'Course', 'EducationalOccupationalProgram');
    if (courseLD?.provider?.name) {
        candidates.push((0, scraper_utils_1.ext)((0, scraper_utils_1.cleanUniversityName)(courseLD.provider.name), 0.95, 'jsonld-provider'));
    }
    const orgLD = (0, scraper_utils_1.findJsonLdByType)(sd, 'CollegeOrUniversity', 'EducationalOrganization', 'Organization');
    if (orgLD?.name) {
        candidates.push((0, scraper_utils_1.ext)((0, scraper_utils_1.cleanUniversityName)(orgLD.name), 0.93, 'jsonld-org'));
    }
    if (sd.microdata['legalName']) {
        candidates.push((0, scraper_utils_1.ext)((0, scraper_utils_1.cleanUniversityName)(sd.microdata['legalName']), 0.90, 'microdata-legalName'));
    }
    if (sd.og['site_name'] && sd.og['site_name'].length > 3 && sd.og['site_name'].length < 100) {
        candidates.push((0, scraper_utils_1.ext)((0, scraper_utils_1.cleanUniversityName)(sd.og['site_name']), 0.85, 'og-site_name'));
    }
    if (sd.meta['application-name'] && sd.meta['application-name'].length > 3) {
        candidates.push((0, scraper_utils_1.ext)((0, scraper_utils_1.cleanUniversityName)(sd.meta['application-name']), 0.83, 'meta-app-name'));
    }
    const uniPatterns = [
        /(?:Technische\s+Universit[äa]t|TU)\s+[^.,|]{3,40}/i,
        /(?:Ludwig[- ]Maximilians[- ]Universit[äa]t)\s*[^.,|]{1,30}/i,
        /(?:Universit[äa]t|University)\s+(?:of\s+)?[A-Za-zÄÖÜäöüß\s-]{3,40}/i,
        /[A-Za-zÄÖÜäöüß\s-]{3,40}\s+(?:Universit[äa]t|University|Hochschule|Institute\s+of\s+Technology)/i,
        /(?:Hochschule|Fachhochschule)\s+[^.,|]{3,40}/i,
        /RWTH\s+Aachen(?:\s+University)?/i,
        /Karlsruhe\s+Institute\s+of\s+Technology|KIT\b/i,
    ];
    for (const p of uniPatterns) {
        const m = text.match(p);
        if (m && m[0].trim().length > 5 && m[0].trim().length < 100) {
            candidates.push((0, scraper_utils_1.ext)((0, scraper_utils_1.cleanUniversityName)(m[0]), 0.60, 'text-regex'));
            break;
        }
    }
    try {
        const parts = hostname.split('.');
        const main = parts.find((p) => p.startsWith('uni-') || p.startsWith('tu-') || p.startsWith('hs-'));
        if (main) {
            const slug = main.replace(/^(uni|tu|hs)-/, '');
            const prefix = main.startsWith('tu-') ? 'TU ' : main.startsWith('hs-') ? 'Hochschule ' : 'Universität ';
            candidates.push((0, scraper_utils_1.ext)(prefix + slug.charAt(0).toUpperCase() + slug.slice(1), 0.40, 'hostname'));
        }
        else {
            const domain = parts[parts.length - 2];
            if (domain && domain.length > 2) {
                candidates.push((0, scraper_utils_1.ext)(domain.charAt(0).toUpperCase() + domain.slice(1) + ' University', 0.25, 'hostname-fallback'));
            }
        }
    }
    catch { }
    return (0, scraper_utils_1.pickBestStr)(candidates, 'Unknown University');
}
function extractCourseName($, text, sd, kv) {
    const candidates = [];
    const courseLD = (0, scraper_utils_1.findJsonLdByType)(sd, 'Course', 'EducationalOccupationalProgram');
    if (courseLD?.name) {
        const name = (0, scraper_utils_1.cleanCourseName)(courseLD.name);
        if (name.length > 3)
            candidates.push((0, scraper_utils_1.ext)(name, 0.95, 'jsonld-name'));
    }
    if (sd.microdata['name']) {
        const name = (0, scraper_utils_1.cleanCourseName)(sd.microdata['name']);
        if (name.length > 3 && name.length < 120)
            candidates.push((0, scraper_utils_1.ext)(name, 0.88, 'microdata-name'));
    }
    const kvName = (0, scraper_utils_1.kvLookup)(kv, scraper_constants_1.KV_KEY_PATTERNS.courseName);
    if (kvName && kvName.length > 3) {
        candidates.push((0, scraper_utils_1.ext)((0, scraper_utils_1.cleanCourseName)(kvName), 0.90, 'kv-pairs'));
    }
    const h1 = $('h1').first().text().replace(/\s+/g, ' ').trim();
    if (h1 && h1.length > 3) {
        const name = (0, scraper_utils_1.cleanCourseName)(h1);
        if (name.length > 3 && name.length < 160) {
            candidates.push((0, scraper_utils_1.ext)(name, 0.80, 'h1'));
        }
    }
    if (sd.og['title'] && sd.og['title'].length > 3) {
        const cleaned = sd.og['title'].replace(/\s*[|\-–—]\s*.*$/, '').trim();
        if (cleaned.length > 3)
            candidates.push((0, scraper_utils_1.ext)((0, scraper_utils_1.cleanCourseName)(cleaned), 0.70, 'og-title'));
    }
    const title = $('title').text().trim();
    if (title) {
        const cleaned = title.split(/[|\-–—]/)[0].trim();
        if (cleaned.length > 3)
            candidates.push((0, scraper_utils_1.ext)((0, scraper_utils_1.cleanCourseName)(cleaned), 0.60, 'title-tag'));
    }
    if (sd.twitter['title'] && sd.twitter['title'].length > 3) {
        const cleaned = sd.twitter['title'].replace(/\s*[|\-–—]\s*.*$/, '').trim();
        if (cleaned.length > 3)
            candidates.push((0, scraper_utils_1.ext)((0, scraper_utils_1.cleanCourseName)(cleaned), 0.55, 'twitter-title'));
    }
    return (0, scraper_utils_1.pickBestStr)(candidates, 'Unknown Course');
}
function extractDescription($, sd) {
    const candidates = [];
    const cap = (s) => s.substring(0, 1000);
    const courseLD = (0, scraper_utils_1.findJsonLdByType)(sd, 'Course', 'EducationalOccupationalProgram');
    if (courseLD?.description)
        candidates.push((0, scraper_utils_1.ext)(cap(courseLD.description), 0.95, 'jsonld'));
    if (sd.og['description'] && sd.og['description'].length > 20) {
        candidates.push((0, scraper_utils_1.ext)(cap(sd.og['description']), 0.85, 'og-desc'));
    }
    if (sd.meta['description'] && sd.meta['description'].length > 20) {
        candidates.push((0, scraper_utils_1.ext)(cap(sd.meta['description']), 0.80, 'meta-desc'));
    }
    if (sd.twitter['description'] && sd.twitter['description'].length > 20) {
        candidates.push((0, scraper_utils_1.ext)(cap(sd.twitter['description']), 0.75, 'twitter-desc'));
    }
    const firstP = $('main p, article p, .content p, #content p, [role="main"] p').first().text().replace(/\s+/g, ' ').trim();
    if (firstP && firstP.length > 50) {
        candidates.push((0, scraper_utils_1.ext)(cap(firstP), 0.50, 'first-paragraph'));
    }
    return (0, scraper_utils_1.pickBestStr)(candidates, '');
}
function extractDegree(text, sd, kv) {
    const candidates = [];
    const kvDegree = (0, scraper_utils_1.kvLookup)(kv, scraper_constants_1.KV_KEY_PATTERNS.degree);
    if (kvDegree && kvDegree.length < 60) {
        candidates.push((0, scraper_utils_1.ext)((0, scraper_utils_1.normalizeDegree)(kvDegree), 0.95, 'kv-pairs'));
    }
    const courseLD = (0, scraper_utils_1.findJsonLdByType)(sd, 'Course', 'EducationalOccupationalProgram');
    if (courseLD?.educationalCredentialAwarded) {
        candidates.push((0, scraper_utils_1.ext)((0, scraper_utils_1.normalizeDegree)(courseLD.educationalCredentialAwarded), 0.90, 'jsonld-credential'));
    }
    if (sd.microdata['educationalCredentialAwarded']) {
        candidates.push((0, scraper_utils_1.ext)((0, scraper_utils_1.normalizeDegree)(sd.microdata['educationalCredentialAwarded']), 0.88, 'microdata'));
    }
    const patterns = [
        [/\b(Master\s+of\s+(?:Science|Arts|Engineering|Business\s+Administration|Laws|Education))\b/i, 0.75],
        [/\b(Bachelor\s+of\s+(?:Science|Arts|Engineering|Education))\b/i, 0.75],
        [/\b(M\.?\s*Sc\.?)\b/, 0.70],
        [/\b(M\.?\s*A\.?)\b/, 0.70],
        [/\b(M\.?\s*Eng\.?)\b/, 0.70],
        [/\b(M\.?\s*B\.?\s*A\.?)\b/, 0.70],
        [/\b(B\.?\s*Sc\.?)\b/, 0.70],
        [/\b(B\.?\s*A\.?)\b/, 0.65],
        [/\b(B\.?\s*Eng\.?)\b/, 0.70],
        [/\b(Master|Bachelor|PhD|Doctorate|Diplom|Staatsexamen|Magister)\b/i, 0.50],
    ];
    for (const [p, conf] of patterns) {
        const m = text.match(p);
        if (m) {
            candidates.push((0, scraper_utils_1.ext)((0, scraper_utils_1.normalizeDegree)(m[1].trim()), conf, 'text-regex'));
            break;
        }
    }
    return (0, scraper_utils_1.pickBestStr)(candidates, '');
}
function extractLanguage(text, kv) {
    const candidates = [];
    const kvLang = (0, scraper_utils_1.kvLookup)(kv, scraper_constants_1.KV_KEY_PATTERNS.language);
    if (kvLang) {
        const result = classifyLanguage(kvLang);
        if (result)
            candidates.push((0, scraper_utils_1.ext)(result, 0.95, 'kv-pairs'));
    }
    const langPatterns = [
        [/taught\s+(?:entirely\s+)?in\s+english\s+(?:and|&|\/)?\s*german/i, 'German & English', 0.85],
        [/taught\s+(?:entirely\s+)?in\s+german\s+(?:and|&|\/)?\s*english/i, 'German & English', 0.85],
        [/(?:language|taught)[:\s]*english\s+(?:and|&|\/)\s*german/i, 'German & English', 0.82],
        [/(?:language|taught)[:\s]*german\s+(?:and|&|\/)\s*english/i, 'German & English', 0.82],
        [/bilingual|zweisprachig/i, 'German & English', 0.75],
        [/taught\s+(?:entirely\s+)?in\s+english/i, 'English', 0.85],
        [/english[- ]taught\s+(?:programme|program|course)/i, 'English', 0.83],
        [/(?:all|fully)\s+in\s+english/i, 'English', 0.80],
        [/english\s+only|only\s+(?:in\s+)?english/i, 'English', 0.85],
        [/taught\s+(?:entirely\s+)?in\s+german/i, 'German', 0.85],
        [/german\s+only|only\s+(?:in\s+)?german|deutschsprachig|ausschließlich.*deutsch/i, 'German', 0.85],
        [/(?:language\s+of\s+instruction|teaching\s+language|unterrichtssprache)[:\s]+(?:is\s+)?english/i, 'English', 0.88],
        [/(?:language\s+of\s+instruction|teaching\s+language|unterrichtssprache)[:\s]+(?:is\s+)?(?:german|deutsch)/i, 'German', 0.88],
    ];
    for (const [p, val, conf] of langPatterns) {
        if (p.test(text)) {
            if (val) {
                candidates.push((0, scraper_utils_1.ext)(val, conf, 'text-pattern'));
                break;
            }
        }
    }
    return (0, scraper_utils_1.pickBestStr)(candidates, '');
}
function classifyLanguage(text) {
    const lower = text.toLowerCase();
    const hasEng = /\benglis[ch]?\b/i.test(text);
    const hasDe = /\bdeutsch\b|\bgerma[n]?\b/i.test(text);
    if (hasEng && hasDe)
        return 'German & English';
    if (hasEng)
        return 'English';
    if (hasDe)
        return 'German';
    if (text.length < 40)
        return text.trim();
    return null;
}
function extractDuration(text, kv, sd) {
    const candidates = [];
    const kvDur = (0, scraper_utils_1.kvLookup)(kv, scraper_constants_1.KV_KEY_PATTERNS.duration);
    if (kvDur) {
        candidates.push((0, scraper_utils_1.ext)((0, scraper_utils_1.normalizeDuration)(kvDur), 0.95, 'kv-pairs'));
    }
    const courseLD = (0, scraper_utils_1.findJsonLdByType)(sd, 'Course', 'EducationalOccupationalProgram');
    if (courseLD?.timeToComplete) {
        const isoDur = courseLD.timeToComplete;
        const m = typeof isoDur === 'string' && isoDur.match(/P(\d+)([YM])/);
        if (m) {
            const num = parseInt(m[1]);
            if (m[2] === 'Y')
                candidates.push((0, scraper_utils_1.ext)(`${num * 2} semesters`, 0.92, 'jsonld-duration'));
            else
                candidates.push((0, scraper_utils_1.ext)(`${num} months`, 0.92, 'jsonld-duration'));
        }
        else if (typeof isoDur === 'string') {
            candidates.push((0, scraper_utils_1.ext)((0, scraper_utils_1.normalizeDuration)(isoDur), 0.90, 'jsonld-duration'));
        }
    }
    const patterns = [
        [/(?:duration|dauer|regelstudienzeit|standard\s+period\s+of\s+study|study\s+duration)[:\s]+(\d+\s*(?:semesters?|years?|Semester|Jahre?))/i, 0.80],
        [/(\d+)\s*(?:-|\s+to\s+)\s*(\d+)\s*semesters?/i, 0.70],
        [/(\d+)\s*semesters?\s*\((\d+)\s*years?\)/i, 0.75],
        [/(\d+)\s*semesters?/i, 0.60],
        [/(\d+)\s*years?/i, 0.55],
    ];
    for (const [p, conf] of patterns) {
        const m = text.match(p);
        if (m) {
            const raw = m[0].replace(/.*?(\d)/, '$1').trim();
            candidates.push((0, scraper_utils_1.ext)((0, scraper_utils_1.normalizeDuration)(raw), conf, 'text-regex'));
            break;
        }
    }
    return (0, scraper_utils_1.pickBestStr)(candidates, '');
}
function extractFees(text, kv, sd) {
    const candidates = [];
    const courseLD = (0, scraper_utils_1.findJsonLdByType)(sd, 'Course', 'EducationalOccupationalProgram');
    if (courseLD?.offers?.price) {
        const n = (0, scraper_utils_1.parseNumber)(String(courseLD.offers.price));
        if (n !== null && n >= 0 && n < 100000)
            candidates.push((0, scraper_utils_1.ext)(n, 0.95, 'jsonld-price'));
    }
    const kvFees = (0, scraper_utils_1.kvLookup)(kv, scraper_constants_1.KV_KEY_PATTERNS.fees);
    if (kvFees) {
        if (/(?:no|none|keine|tuition[\s-]*free|gebührenfrei)\b/i.test(kvFees)) {
            candidates.push((0, scraper_utils_1.ext)(0, 0.95, 'kv-no-fee'));
        }
        else {
            const n = (0, scraper_utils_1.parseNumber)(kvFees);
            if (n !== null && n >= 0 && n < 100000)
                candidates.push((0, scraper_utils_1.ext)(n, 0.92, 'kv-pairs'));
        }
    }
    const feePatterns = [
        [/(?:no|none|keine)\s*tuition\s*fees?/i, 0.80],
        [/tuition[\s-]*free|gebührenfrei/i, 0.80],
        [/tuition\s*fees?\s*[:=]?\s*(?:€|EUR)?\s*([\d.,]+)\s*(?:€|EUR)?/i, 0.75],
        [/(?:€|EUR)\s*([\d.,]+)\s*(?:per\s+(?:year|annum|semester))/i, 0.70],
        [/([\d.,]+)\s*(?:€|EUR)\s*(?:per\s+(?:year|annum))?/i, 0.60],
        [/fees?\s*[:=]?\s*(?:approx\.?\s*)?(?:€|EUR)?\s*([\d.,]+)/i, 0.55],
    ];
    for (const [p, conf] of feePatterns) {
        const m = text.match(p);
        if (m) {
            if (/(?:no|none|keine|free|frei)/i.test(m[0])) {
                candidates.push((0, scraper_utils_1.ext)(0, conf, 'text-no-fee'));
            }
            else if (m[1]) {
                const n = (0, scraper_utils_1.parseNumber)(m[1]);
                if (n !== null && n >= 0 && n < 100000)
                    candidates.push((0, scraper_utils_1.ext)(n, conf, 'text-regex'));
            }
            break;
        }
    }
    return (0, scraper_utils_1.pickBestNum)(candidates);
}
function extractFeesPerSemester(text, kv) {
    const candidates = [];
    const kvSem = (0, scraper_utils_1.kvLookup)(kv, scraper_constants_1.KV_KEY_PATTERNS.semesterFees);
    if (kvSem) {
        const n = (0, scraper_utils_1.parseNumber)(kvSem);
        if (n !== null && n > 0 && n < 2000)
            candidates.push((0, scraper_utils_1.ext)(n, 0.95, 'kv-semester-fee'));
    }
    const patterns = [
        [/([\d.,]+)\s*(?:€|EUR)\s*(?:per|\/|each)\s*semester/i, 0.80],
        [/semester\s*(?:fee|beitrag|contribution)\s*[:=]?\s*(?:€|EUR)?\s*([\d.,]+)/i, 0.80],
        [/semesterbeitrag\s*[:=]?\s*(?:€|EUR)?\s*([\d.,]+)/i, 0.85],
    ];
    for (const [p, conf] of patterns) {
        const m = text.match(p);
        if (m) {
            const n = (0, scraper_utils_1.parseNumber)(m[1] || m[2]);
            if (n !== null && n > 0 && n < 2000)
                candidates.push((0, scraper_utils_1.ext)(n, conf, 'text-regex'));
            break;
        }
    }
    return (0, scraper_utils_1.pickBestNum)(candidates);
}
function extractDeadline(text, kv, sd) {
    const result = { date: null, internationalDate: null, label: null };
    const courseLD = (0, scraper_utils_1.findJsonLdByType)(sd, 'Course', 'EducationalOccupationalProgram');
    if (courseLD?.applicationDeadline) {
        const d = (0, scraper_utils_1.parseDateString)(courseLD.applicationDeadline);
        if (d) {
            result.date = d;
        }
    }
    if (!result.date) {
        for (const [k, v] of kv) {
            if (scraper_constants_1.KV_KEY_PATTERNS.deadline.test(k)) {
                const parsed = (0, scraper_utils_1.parseDateString)(v);
                if (parsed) {
                    if (/international|non[-\s]?eu|ausländ/i.test(k)) {
                        result.internationalDate = result.internationalDate || parsed;
                        result.label = 'International Students';
                    }
                    else {
                        result.date = result.date || parsed;
                    }
                }
            }
        }
    }
    if (!result.date) {
        const datePatterns = [
            /(?:application\s+deadline|bewerbungsfrist|apply\s+(?:by|before|until)|deadline\s+(?:for\s+)?(?:application|admission))[:\s]+(.{5,40}?)(?:\.|$|\n|<)/gim,
            /(?:deadline|frist)[:\s]+(\d{1,2}[.\/-]\d{1,2}[.\/-]\d{2,4})/gi,
            /(?:deadline|frist)[:\s]+(\d{1,2}\s+\w+\s+\d{4})/gi,
        ];
        for (const p of datePatterns) {
            const matches = [...text.matchAll(p)];
            for (const m of matches) {
                const parsed = (0, scraper_utils_1.parseDateString)(m[1]);
                if (parsed && !result.date) {
                    result.date = parsed;
                    break;
                }
            }
            if (result.date)
                break;
        }
    }
    if (!result.internationalDate) {
        const intlPatterns = [
            /(?:international|non[-\s]?eu|foreign|ausländ)\s*(?:students?|applicants?|bewerber)?\s*(?:deadline|frist)?[:\s]+(.{5,40}?)(?:\.|$|\n)/gim,
        ];
        for (const p of intlPatterns) {
            const matches = [...text.matchAll(p)];
            for (const m of matches) {
                const parsed = (0, scraper_utils_1.parseDateString)(m[1]);
                if (parsed) {
                    result.internationalDate = parsed;
                    result.label = 'International Students';
                    break;
                }
            }
        }
    }
    if (!result.date) {
        if (/winter\s*semester.*?15\s*(?:\.?\s*)?(?:juli?y?|07)/i.test(text))
            result.date = (0, scraper_utils_1.nextDeadline)(7, 15);
        else if (/summer\s*semester.*?15\s*(?:\.?\s*)?(?:januar?y?|01)/i.test(text))
            result.date = (0, scraper_utils_1.nextDeadline)(1, 15);
    }
    return result;
}
function extractStartDate(text, kv, sd) {
    const courseLD = (0, scraper_utils_1.findJsonLdByType)(sd, 'Course', 'EducationalOccupationalProgram');
    if (courseLD?.startDate) {
        const d = (0, scraper_utils_1.parseDateString)(courseLD.startDate);
        if (d)
            return d;
    }
    const kvStart = (0, scraper_utils_1.kvLookup)(kv, scraper_constants_1.KV_KEY_PATTERNS.startDate);
    if (kvStart) {
        if (/winter/i.test(kvStart))
            return 'Winter';
        if (/summer|sommer/i.test(kvStart))
            return 'Summer';
        if (kvStart.length < 30)
            return kvStart;
    }
    if (/winter\s*semester|wintersemester/i.test(text))
        return 'Winter';
    if (/summer\s*semester|sommersemester/i.test(text))
        return 'Summer';
    return null;
}
function extractECTS(text, kv, sd) {
    const candidates = [];
    const courseLD = (0, scraper_utils_1.findJsonLdByType)(sd, 'Course', 'EducationalOccupationalProgram');
    if (courseLD?.numberOfCredits) {
        const n = typeof courseLD.numberOfCredits === 'number' ? courseLD.numberOfCredits : parseInt(courseLD.numberOfCredits);
        if (!isNaN(n) && n > 0)
            candidates.push((0, scraper_utils_1.ext)(n, 0.95, 'jsonld-credits'));
    }
    if (sd.microdata['numberOfCredits']) {
        const n = parseInt(sd.microdata['numberOfCredits']);
        if (!isNaN(n) && n > 0)
            candidates.push((0, scraper_utils_1.ext)(n, 0.90, 'microdata-credits'));
    }
    const kvEcts = (0, scraper_utils_1.kvLookup)(kv, scraper_constants_1.KV_KEY_PATTERNS.ects);
    if (kvEcts) {
        const m = kvEcts.match(/(\d{2,3})/);
        if (m)
            candidates.push((0, scraper_utils_1.ext)(parseInt(m[1], 10), 0.92, 'kv-pairs'));
    }
    const m = text.match(/(\d{2,3})\s*(?:ECTS|credit\s*points?|CP|LP|Leistungspunkte)/i);
    if (m)
        candidates.push((0, scraper_utils_1.ext)(parseInt(m[1], 10), 0.70, 'text-regex'));
    return (0, scraper_utils_1.pickBestNum)(candidates);
}
function extractCity(text, hostname, kv, sd) {
    const candidates = [];
    for (const [domain, info] of Object.entries(scraper_constants_1.KNOWN_UNIVERSITIES)) {
        if (hostname.endsWith(domain) && info.city) {
            candidates.push((0, scraper_utils_1.ext)(info.city, 1.0, 'known-mapping'));
            break;
        }
    }
    const orgLD = (0, scraper_utils_1.findJsonLdByType)(sd, 'CollegeOrUniversity', 'EducationalOrganization', 'Organization');
    if (orgLD?.address?.addressLocality) {
        candidates.push((0, scraper_utils_1.ext)(orgLD.address.addressLocality, 0.92, 'jsonld-address'));
    }
    const kvCity = (0, scraper_utils_1.kvLookup)(kv, scraper_constants_1.KV_KEY_PATTERNS.location);
    if (kvCity && kvCity.length < 40) {
        const found = scraper_constants_1.GERMAN_CITIES.find((c) => kvCity.includes(c));
        candidates.push((0, scraper_utils_1.ext)(found || kvCity, 0.85, 'kv-pairs'));
    }
    for (const city of scraper_constants_1.GERMAN_CITIES) {
        if (text.includes(city)) {
            candidates.push((0, scraper_utils_1.ext)(city, 0.50, 'text-match'));
            break;
        }
    }
    try {
        const m = hostname.match(/(?:^|\.)([\\w-]+)\.(?:de|uni|edu)/);
        if (m) {
            const slug = m[1].replace(/^(uni|tu|hs|fh)-/, '');
            const found = scraper_constants_1.GERMAN_CITIES.find((c) => c.toLowerCase() === slug);
            if (found)
                candidates.push((0, scraper_utils_1.ext)(found, 0.40, 'hostname'));
            else
                candidates.push((0, scraper_utils_1.ext)(slug.charAt(0).toUpperCase() + slug.slice(1), 0.25, 'hostname-fallback'));
        }
    }
    catch { }
    return (0, scraper_utils_1.pickBestStr)(candidates, '');
}
function extractApplicationUrl($, baseUrl, sourceUrl) {
    const selectors = [
        'a[href*="apply"]', 'a[href*="bewerbung"]', 'a[href*="application"]',
        'a[href*="admission"]', 'a[href*="zulassung"]', 'a[href*="enrol"]',
        'a[href*="bewerben"]', 'a[href*="online-bewerbung"]',
    ];
    for (const sel of selectors) {
        const href = $(sel).first().attr('href');
        if (href)
            return (0, scraper_utils_1.resolveUrl)(href, baseUrl);
    }
    const applyBtn = $('a, button').filter((_, el) => /apply|bewerben|application/i.test($(el).text())).first();
    const href = applyBtn.attr('href');
    if (href)
        return (0, scraper_utils_1.resolveUrl)(href, baseUrl);
    return sourceUrl;
}
function extractLogo($, baseUrl) {
    const logoSelectors = [
        'img[class*="logo"]', 'img[id*="logo"]',
        'img[alt*="logo" i]', 'img[alt*="Logo"]', 'img[alt*="Universit"]',
        '.logo img', '#logo img', '.site-logo img',
        '[class*="brand"] img', '.navbar-brand img', 'a[class*="logo"] img',
        'header img', '.header img', '#header img',
        'img[class*="header"]', 'img[id*="header"]',
    ];
    for (const sel of logoSelectors) {
        const el = $(sel).first();
        const src = el.attr('src') || el.attr('data-src');
        if (src && !src.includes('pixel') && !src.includes('spacer') && !src.includes('1x1') && !src.includes('tracking')) {
            const resolved = (0, scraper_utils_1.resolveUrl)(src, baseUrl);
            if (!resolved.startsWith('data:')) {
                const width = parseInt(el.attr('width') || '0');
                if (width === 0 || width > 20)
                    return resolved;
            }
        }
    }
    const jsonLdScripts = [];
    $('script[type="application/ld+json"]').each((_, el) => {
        const text = $(el).html();
        if (text)
            jsonLdScripts.push(text);
    });
    for (const text of jsonLdScripts) {
        try {
            const data = JSON.parse(text);
            const items = Array.isArray(data) ? data : [data];
            for (const item of items) {
                if (item.logo?.url)
                    return (0, scraper_utils_1.resolveUrl)(item.logo.url, baseUrl);
                if (typeof item.logo === 'string')
                    return (0, scraper_utils_1.resolveUrl)(item.logo, baseUrl);
            }
        }
        catch { }
    }
    const ogImage = $('meta[property="og:image"]').attr('content');
    if (ogImage && !ogImage.includes('placeholder') && !ogImage.includes('default')) {
        const resolved = (0, scraper_utils_1.resolveUrl)(ogImage, baseUrl);
        if (resolved.startsWith('http'))
            return resolved;
    }
    const faviconSelectors = [
        'link[rel="icon"][type="image/png"]',
        'link[rel="icon"][type="image/svg+xml"]',
        'link[rel="apple-touch-icon"]',
        'link[rel="apple-touch-icon-precomposed"]',
        'link[rel="icon"]',
    ];
    for (const sel of faviconSelectors) {
        const icon = $(sel).first().attr('href');
        if (icon && !icon.endsWith('.ico') && icon.length > 1) {
            return (0, scraper_utils_1.resolveUrl)(icon, baseUrl);
        }
    }
    for (const sel of faviconSelectors) {
        const icon = $(sel).first().attr('href');
        if (icon && icon.length > 1)
            return (0, scraper_utils_1.resolveUrl)(icon, baseUrl);
    }
    return baseUrl + '/favicon.ico';
}
function extractSocialLinks($) {
    let linkedin = null;
    let instagram = null;
    $('a[href]').each((_, el) => {
        const href = $(el).attr('href') || '';
        if (!linkedin && /linkedin\.com\/(?:school|company|in)\//i.test(href)) {
            linkedin = href.startsWith('http') ? href : 'https://' + href.replace(/^\/\//, '');
        }
        if (!instagram && /instagram\.com\/[\w.]+/i.test(href)) {
            instagram = href.startsWith('http') ? href : 'https://' + href.replace(/^\/\//, '');
        }
    });
    return { linkedin, instagram };
}
function detectApplicationVia(text) {
    const uniAssist = /uni[- ]?assist/i.test(text);
    const direct = /apply\s+directly|online[- ]?bewerbung|bewerbungsportal|apply\s+online\s+portal|direct\s+application/i.test(text);
    if (uniAssist && direct)
        return 'BOTH';
    if (uniAssist)
        return 'UNI_ASSIST';
    return 'DIRECT';
}
function extractUniAssistInfo(text) {
    if (!/uni[- ]?assist/i.test(text))
        return '';
    const m = text.match(/(?:uni[- ]?assist)[^.!?\n]{0,200}[.!?]/i);
    return m ? m[0].trim().substring(0, 300) : 'Application via uni-assist required';
}
function extractAddress(text, sd) {
    const orgLD = (0, scraper_utils_1.findJsonLdByType)(sd, 'CollegeOrUniversity', 'EducationalOrganization', 'Organization');
    if (orgLD?.address) {
        const a = orgLD.address;
        if (typeof a === 'string')
            return a.substring(0, 200);
        const parts = [a.streetAddress, a.postalCode, a.addressLocality, a.addressCountry].filter(Boolean);
        if (parts.length > 0)
            return parts.join(', ').substring(0, 200);
    }
    const patterns = [
        /(?:address|anschrift|standort)[:\s]+([^\n]{10,150})/i,
        /\d{4,5}\s+[A-Za-zÄÖÜäöüß\s-]+,?\s+(?:Germany|Deutschland)/i,
    ];
    for (const p of patterns) {
        const m = text.match(p);
        if (m)
            return (m[1] || m[0]).trim().substring(0, 200);
    }
    return '';
}
function extractRequirements($, text, kv) {
    const kvReq = (0, scraper_utils_1.kvLookup)(kv, scraper_constants_1.KV_KEY_PATTERNS.requirements);
    if (kvReq && kvReq.length > 20)
        return kvReq.substring(0, 500);
    const headings = $('h1, h2, h3, h4, h5');
    for (let i = 0; i < headings.length; i++) {
        const heading = $(headings[i]).text().trim();
        if (/requirement|prerequisite|eligibility|admission|zugangsvoraussetzung|voraussetzung/i.test(heading)) {
            const next = $(headings[i]).nextAll('p, ul, ol, div').slice(0, 3);
            const content = next.map((_, el) => $(el).text().replace(/\s+/g, ' ').trim()).get().join(' ');
            if (content.length > 30)
                return content.substring(0, 500);
        }
    }
    const patterns = [
        /(?:entry\s*requirements?|admission\s*requirements?|prerequisites?|eligibility)[:\s]+(.{40,500})/i,
        /(?:toefl|ielts|dsh|testdaf|language\s*(?:certificate|requirement|proficiency))[:\s]+(.{20,300})/i,
    ];
    for (const p of patterns) {
        const m = text.match(p);
        if (m?.[1]) {
            const cleaned = m[1].replace(/\s+/g, ' ').trim().substring(0, 500);
            if (cleaned.length > 30)
                return cleaned;
        }
    }
    return '';
}
function getCityCoordinates(city) {
    const coords = scraper_constants_1.CITY_COORDINATES[city];
    return coords
        ? { latitude: coords.lat, longitude: coords.lng }
        : { latitude: null, longitude: null };
}
//# sourceMappingURL=scraper.extractors.js.map