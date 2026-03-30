"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pickBest = pickBest;
exports.pickBestStr = pickBestStr;
exports.pickBestNum = pickBestNum;
exports.ext = ext;
exports.extractStructuredData = extractStructuredData;
exports.findJsonLdByType = findJsonLdByType;
exports.extractKeyValuePairs = extractKeyValuePairs;
exports.kvLookup = kvLookup;
exports.parseNumber = parseNumber;
exports.extractNumber = extractNumber;
exports.parseDateString = parseDateString;
exports.nextDeadline = nextDeadline;
exports.cleanUniversityName = cleanUniversityName;
exports.cleanCourseName = cleanCourseName;
exports.normalizeDegree = normalizeDegree;
exports.normalizeDuration = normalizeDuration;
exports.resolveUrl = resolveUrl;
const scraper_constants_1 = require("./scraper.constants");
function pickBest(extractions) {
    const valid = extractions
        .filter((e) => e.value !== null && e.value !== undefined && e.value !== '' && e.confidence > 0)
        .sort((a, b) => b.confidence - a.confidence);
    return valid.length > 0 ? valid[0].value : undefined;
}
function pickBestStr(extractions, fallback = '') {
    return pickBest(extractions) ?? fallback;
}
function pickBestNum(extractions) {
    return pickBest(extractions) ?? null;
}
function ext(value, confidence, source) {
    return { value, confidence, source };
}
function extractStructuredData($) {
    const result = {
        jsonLd: [],
        og: {},
        twitter: {},
        microdata: {},
        meta: {},
    };
    try {
        $('script[type="application/ld+json"]').each((_, el) => {
            try {
                const text = $(el).html();
                if (!text)
                    return;
                const data = JSON.parse(text);
                const items = Array.isArray(data) ? data : [data];
                for (const item of items) {
                    if (item['@graph'] && Array.isArray(item['@graph'])) {
                        result.jsonLd.push(...item['@graph']);
                    }
                    else {
                        result.jsonLd.push(item);
                    }
                }
            }
            catch { }
        });
    }
    catch { }
    $('meta[property^="og:"]').each((_, el) => {
        const prop = $(el).attr('property')?.replace('og:', '') || '';
        const content = $(el).attr('content')?.trim() || '';
        if (prop && content)
            result.og[prop] = content;
    });
    $('meta[name^="twitter:"]').each((_, el) => {
        const name = $(el).attr('name')?.replace('twitter:', '') || '';
        const content = $(el).attr('content')?.trim() || '';
        if (name && content)
            result.twitter[name] = content;
    });
    $('meta[name]').each((_, el) => {
        const name = $(el).attr('name')?.trim().toLowerCase() || '';
        const content = $(el).attr('content')?.trim() || '';
        if (name && content && !name.startsWith('twitter:')) {
            result.meta[name] = content;
        }
    });
    $('[itemprop]').each((_, el) => {
        const prop = $(el).attr('itemprop')?.trim() || '';
        const content = $(el).attr('content')?.trim() || $(el).text().replace(/\s+/g, ' ').trim();
        if (prop && content && content.length < 500) {
            result.microdata[prop] = content;
        }
    });
    return result;
}
function findJsonLdByType(sd, ...types) {
    for (const type of types) {
        const found = sd.jsonLd.find((item) => {
            const itemType = item['@type'];
            if (Array.isArray(itemType))
                return itemType.includes(type);
            return itemType === type;
        });
        if (found)
            return found;
    }
    return null;
}
function extractKeyValuePairs($) {
    const kv = new Map();
    $('dl').each((_, dl) => {
        $(dl).find('dt').each((_, dt) => {
            const key = $(dt).text().replace(/\s+/g, ' ').trim().toLowerCase().replace(/:$/, '');
            const dd = $(dt).nextAll('dd').first();
            const val = dd.text().replace(/\s+/g, ' ').trim();
            if (key && val && key.length < 80 && val.length < 500)
                kv.set(key, val);
        });
    });
    $('table').each((_, table) => {
        $(table).find('tr').each((_, tr) => {
            const cells = $(tr).find('td, th');
            if (cells.length === 2) {
                const key = $(cells[0]).text().replace(/\s+/g, ' ').trim().toLowerCase().replace(/:$/, '');
                const val = $(cells[1]).text().replace(/\s+/g, ' ').trim();
                if (key && val && key.length < 80 && val.length < 500)
                    kv.set(key, val);
            }
        });
    });
    $('li, p, div, span').each((_, el) => {
        const text = $(el).clone().children().remove().end().text().trim();
        const m = text.match(/^([A-Za-zÄÖÜäöüß\s/&-]{3,40}):\s*(.{2,200})$/);
        if (m) {
            const key = m[1].trim().toLowerCase();
            const val = m[2].trim();
            if (!kv.has(key))
                kv.set(key, val);
        }
    });
    $('[data-label], [aria-label]').each((_, el) => {
        const key = ($(el).attr('data-label') || $(el).attr('aria-label') || '').trim().toLowerCase();
        const val = $(el).text().replace(/\s+/g, ' ').trim();
        if (key && val && key.length < 80 && val.length < 500 && !kv.has(key)) {
            kv.set(key, val);
        }
    });
    return kv;
}
function kvLookup(kv, keyPattern) {
    for (const [k, v] of kv) {
        if (keyPattern.test(k))
            return v;
    }
    return undefined;
}
function parseNumber(str) {
    if (!str)
        return null;
    let cleaned = str.replace(/\s/g, '').replace(/[€$£]/g, '');
    if (/^\d{1,3}(\.\d{3})+(,\d{1,2})?$/.test(cleaned)) {
        cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    }
    else if (/^\d{1,3}(,\d{3})+(\.\d{1,2})?$/.test(cleaned)) {
        cleaned = cleaned.replace(/,/g, '');
    }
    else if (/^\d+,\d{1,2}$/.test(cleaned)) {
        cleaned = cleaned.replace(',', '.');
    }
    cleaned = cleaned.replace(/[^0-9.]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
}
function extractNumber(text, pattern) {
    const m = text.match(pattern);
    if (!m)
        return null;
    const raw = m[1] || m[0];
    return parseNumber(raw);
}
function parseDateString(str) {
    if (!str)
        return null;
    const s = str.trim().replace(/,/g, '');
    let m = s.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (m)
        return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
    m = s.match(/(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4})/);
    if (m)
        return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
    m = s.match(/(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{2})(?!\d)/);
    if (m) {
        const year = parseInt(m[3]) < 50 ? 2000 + parseInt(m[3]) : 1900 + parseInt(m[3]);
        return `${year}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
    }
    m = s.match(/(\d{1,2})\.?\s+(\w+)\s+(\d{4})/);
    if (m) {
        const month = scraper_constants_1.MONTH_MAP[m[2].toLowerCase()];
        if (month !== undefined)
            return `${m[3]}-${String(month + 1).padStart(2, '0')}-${m[1].padStart(2, '0')}`;
    }
    m = s.match(/(\w+)\s+(\d{1,2})\s+(\d{4})/);
    if (m) {
        const month = scraper_constants_1.MONTH_MAP[m[1].toLowerCase()];
        if (month !== undefined)
            return `${m[3]}-${String(month + 1).padStart(2, '0')}-${m[2].padStart(2, '0')}`;
    }
    m = s.match(/(\d{1,2})(?:st|nd|rd|th)?\s+(\w+)\s+(\d{4})/);
    if (m) {
        const month = scraper_constants_1.MONTH_MAP[m[2].toLowerCase()];
        if (month !== undefined)
            return `${m[3]}-${String(month + 1).padStart(2, '0')}-${m[1].padStart(2, '0')}`;
    }
    return null;
}
function nextDeadline(month, day) {
    const now = new Date();
    let year = now.getFullYear();
    const dl = new Date(year, month - 1, day);
    if (dl < now)
        year++;
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}
function cleanUniversityName(raw) {
    if (!raw || typeof raw !== 'string')
        return '';
    let clean = raw.split(/[|\n\/]| - | – | — | \| /)[0].trim();
    clean = clean.replace(/\s*[-–—]?\s*(study\s*programs?|studiengang|studienangebot|faculty\s*of|department\s*of|courses?|programs?|page|home|website|official|portal|degrees?|master|bachelor|startseite|willkommen|welcome).*$/i, '').trim();
    clean = clean.replace(/[,;:.]+$/, '').trim();
    clean = clean.replace(/\s+/g, ' ');
    if (clean.length > 80) {
        const shorter = clean.split(/[,.]\s/)[0].trim();
        if (shorter.length > 5 && shorter.length <= 80)
            return shorter;
        return clean.substring(0, 80).trim();
    }
    return clean;
}
function cleanCourseName(raw) {
    if (!raw)
        return '';
    let name = raw.replace(/\s+/g, ' ').trim();
    name = name.split(/\s+[|–—]\s+/)[0].trim();
    name = name.replace(/\s+(?:if|with|for|to|in|is|are|we|you|our|this|that|it|by|from|about|on|at|learn|discover|find|join|become|get|start|study|build|make|create|develop|explore|apply|lead|shape|design|be|do|let|have|take|use|the\s+programme)\b.*/i, '').trim();
    name = name.replace(/[,;:.!?]+$/, '').trim();
    if (name.length > 120)
        name = name.substring(0, 120).trim();
    return name;
}
function normalizeDegree(raw) {
    if (!raw)
        return '';
    const key = raw.trim().toLowerCase().replace(/\s+/g, ' ').replace(/\./g, '').replace(/\s/g, ' ');
    if (scraper_constants_1.DEGREE_CANONICAL[key])
        return scraper_constants_1.DEGREE_CANONICAL[key];
    const withDots = raw.trim().toLowerCase();
    if (scraper_constants_1.DEGREE_CANONICAL[withDots])
        return scraper_constants_1.DEGREE_CANONICAL[withDots];
    return raw.trim();
}
function normalizeDuration(raw) {
    if (!raw)
        return '';
    const m = raw.match(/(\d+)\s*(semester|year|jahr|term)/i);
    if (!m)
        return raw.trim();
    const num = parseInt(m[1]);
    const unit = m[2].toLowerCase();
    if (unit === 'year' || unit === 'jahr')
        return `${num * 2} semesters`;
    if (unit === 'semester')
        return `${num} semester${num > 1 ? 's' : ''}`;
    return raw.trim();
}
function resolveUrl(href, baseUrl) {
    if (!href)
        return '';
    if (href.startsWith('http'))
        return href;
    if (href.startsWith('//'))
        return 'https:' + href;
    if (href.startsWith('/'))
        return baseUrl + href;
    return baseUrl + '/' + href;
}
//# sourceMappingURL=scraper.utils.js.map