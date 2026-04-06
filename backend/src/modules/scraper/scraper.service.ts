import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import * as cheerio from 'cheerio';

export interface ScrapedCourseData {
  universityName: string;
  universityShortName: string | null;
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


// ─── Known German university mappings by hostname ──────────────
export interface KnownUniversityInfo {
  name: string;
  city: string;
  shortName?: string;
  website?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

export const KNOWN_UNIVERSITIES: Record<string, KnownUniversityInfo> = {
  'tum.de': {
    name: 'Technical University of Munich', city: 'Munich', shortName: 'TUM',
    website: 'https://www.tum.de',
    linkedinUrl: 'https://www.linkedin.com/school/technische-universitat-munchen/',
    instagramUrl: 'https://www.instagram.com/tum.munich/',
    address: 'Arcisstraße 21, 80333 Munich, Germany',
    latitude: 48.1496, longitude: 11.5677,
  },
  'lmu.de': {
    name: 'Ludwig-Maximilians-Universität München', city: 'Munich', shortName: 'LMU',
    website: 'https://www.lmu.de',
    linkedinUrl: 'https://www.linkedin.com/school/lmu-munich/',
    instagramUrl: 'https://www.instagram.com/lmu.munich/',
    address: 'Geschwister-Scholl-Platz 1, 80539 Munich, Germany',
    latitude: 48.1504, longitude: 11.5798,
  },
  'uni-muenchen.de': {
    name: 'Ludwig-Maximilians-Universität München', city: 'Munich', shortName: 'LMU',
    website: 'https://www.lmu.de',
    linkedinUrl: 'https://www.linkedin.com/school/lmu-munich/',
    instagramUrl: 'https://www.instagram.com/lmu.munich/',
    address: 'Geschwister-Scholl-Platz 1, 80539 Munich, Germany',
    latitude: 48.1504, longitude: 11.5798,
  },
  'rwth-aachen.de': {
    name: 'RWTH Aachen University', city: 'Aachen', shortName: 'RWTH',
    website: 'https://www.rwth-aachen.de',
    linkedinUrl: 'https://www.linkedin.com/school/rwth-aachen-university/',
    instagramUrl: 'https://www.instagram.com/rwth.aachen/',
    address: 'Templergraben 55, 52062 Aachen, Germany',
    latitude: 50.7792, longitude: 6.0593,
  },
  'kit.edu': {
    name: 'Karlsruhe Institute of Technology', city: 'Karlsruhe', shortName: 'KIT',
    website: 'https://www.kit.edu',
    linkedinUrl: 'https://www.linkedin.com/school/karlsruhe-institute-of-technology/',
    instagramUrl: 'https://www.instagram.com/kit.karlsruhe/',
    address: 'Kaiserstraße 12, 76131 Karlsruhe, Germany',
    latitude: 49.0069, longitude: 8.4037,
  },
  'tu-berlin.de': {
    name: 'Technische Universität Berlin', city: 'Berlin', shortName: 'TU Berlin',
    website: 'https://www.tu.berlin',
    linkedinUrl: 'https://www.linkedin.com/school/tu-berlin/',
    instagramUrl: 'https://www.instagram.com/tu.berlin/',
    address: 'Straße des 17. Juni 135, 10623 Berlin, Germany',
    latitude: 52.5121, longitude: 13.3268,
  },
  'fu-berlin.de': {
    name: 'Freie Universität Berlin', city: 'Berlin', shortName: 'FU Berlin',
    website: 'https://www.fu-berlin.de',
    linkedinUrl: 'https://www.linkedin.com/school/freie-universitat-berlin/',
    instagramUrl: 'https://www.instagram.com/fu.berlin/',
    address: 'Kaiserswerther Str. 16-18, 14195 Berlin, Germany',
    latitude: 52.4573, longitude: 13.2963,
  },
  'hu-berlin.de': {
    name: 'Humboldt-Universität zu Berlin', city: 'Berlin', shortName: 'HU Berlin',
    website: 'https://www.hu-berlin.de',
    linkedinUrl: 'https://www.linkedin.com/school/humboldt-universitat-zu-berlin/',
    instagramUrl: 'https://www.instagram.com/hu.berlin/',
    address: 'Unter den Linden 6, 10099 Berlin, Germany',
    latitude: 52.5186, longitude: 13.3932,
  },
  'fau.de': {
    name: 'Friedrich-Alexander-Universität Erlangen-Nürnberg', city: 'Erlangen', shortName: 'FAU',
    website: 'https://www.fau.de',
    linkedinUrl: 'https://www.linkedin.com/school/fau-erlangen-nurnberg/',
    instagramUrl: 'https://www.instagram.com/fau.erlangen/',
    address: 'Schlossplatz 4, 91054 Erlangen, Germany',
    latitude: 49.5968, longitude: 11.0042,
  },
  'uni-erlangen.de': {
    name: 'Friedrich-Alexander-Universität Erlangen-Nürnberg', city: 'Erlangen', shortName: 'FAU',
    website: 'https://www.fau.de',
    linkedinUrl: 'https://www.linkedin.com/school/fau-erlangen-nurnberg/',
    instagramUrl: 'https://www.instagram.com/fau.erlangen/',
    address: 'Schlossplatz 4, 91054 Erlangen, Germany',
    latitude: 49.5968, longitude: 11.0042,
  },
  'tu-darmstadt.de': {
    name: 'Technische Universität Darmstadt', city: 'Darmstadt', shortName: 'TU Darmstadt',
    website: 'https://www.tu-darmstadt.de',
    linkedinUrl: 'https://www.linkedin.com/school/technische-universitat-darmstadt/',
    instagramUrl: 'https://www.instagram.com/tu.darmstadt/',
    address: 'Karolinenplatz 5, 64289 Darmstadt, Germany',
    latitude: 49.8769, longitude: 8.6541,
  },
  'tu-dresden.de': {
    name: 'Technische Universität Dresden', city: 'Dresden', shortName: 'TU Dresden',
    website: 'https://tu-dresden.de',
    linkedinUrl: 'https://www.linkedin.com/school/tu-dresden/',
    instagramUrl: 'https://www.instagram.com/tu.dresden/',
    address: 'Helmholtzstraße 10, 01069 Dresden, Germany',
    latitude: 51.0258, longitude: 13.7229,
  },
  'tu-braunschweig.de': {
    name: 'Technische Universität Braunschweig', city: 'Braunschweig', shortName: 'TU Braunschweig',
    website: 'https://www.tu-braunschweig.de',
    linkedinUrl: 'https://www.linkedin.com/school/tu-braunschweig/',
    instagramUrl: 'https://www.instagram.com/tu.braunschweig/',
    address: 'Universitätsplatz 2, 38106 Braunschweig, Germany',
    latitude: 52.2739, longitude: 10.5267,
  },
  'uni-heidelberg.de': {
    name: 'Universität Heidelberg', city: 'Heidelberg', shortName: 'Uni Heidelberg',
    website: 'https://www.uni-heidelberg.de',
    linkedinUrl: 'https://www.linkedin.com/school/universitat-heidelberg/',
    instagramUrl: 'https://www.instagram.com/uni.heidelberg/',
    address: 'Grabengasse 1, 69117 Heidelberg, Germany',
    latitude: 49.4094, longitude: 8.7083,
  },
  'uni-freiburg.de': {
    name: 'Universität Freiburg', city: 'Freiburg',
    website: 'https://uni-freiburg.de',
    linkedinUrl: 'https://www.linkedin.com/school/albert-ludwigs-universitat-freiburg/',
    instagramUrl: 'https://www.instagram.com/uni.freiburg/',
    address: 'Fahnenbergplatz, 79085 Freiburg im Breisgau, Germany',
    latitude: 47.9957, longitude: 7.8482,
  },
  'uni-bonn.de': {
    name: 'Universität Bonn', city: 'Bonn',
    website: 'https://www.uni-bonn.de',
    linkedinUrl: 'https://www.linkedin.com/school/university-of-bonn/',
    instagramUrl: 'https://www.instagram.com/uni.bonn/',
    address: 'Regina-Pacis-Weg 3, 53113 Bonn, Germany',
    latitude: 50.7354, longitude: 7.0994,
  },
  'uni-koeln.de': {
    name: 'Universität zu Köln', city: 'Cologne',
    website: 'https://www.uni-koeln.de',
    linkedinUrl: 'https://www.linkedin.com/school/university-of-cologne/',
    instagramUrl: 'https://www.instagram.com/uni.koeln/',
    address: 'Albertus-Magnus-Platz, 50923 Cologne, Germany',
    latitude: 50.9281, longitude: 6.9286,
  },
  'uni-hamburg.de': {
    name: 'Universität Hamburg', city: 'Hamburg',
    website: 'https://www.uni-hamburg.de',
    linkedinUrl: 'https://www.linkedin.com/school/universitat-hamburg/',
    instagramUrl: 'https://www.instagram.com/uni.hamburg/',
    address: 'Mittelweg 177, 20148 Hamburg, Germany',
    latitude: 53.5683, longitude: 9.9868,
  },
  'uni-goettingen.de': {
    name: 'Georg-August-Universität Göttingen', city: 'Göttingen',
    website: 'https://www.uni-goettingen.de',
    linkedinUrl: 'https://www.linkedin.com/school/universitatgoettingen/',
    instagramUrl: 'https://www.instagram.com/uni.goettingen/',
    address: 'Wilhelmsplatz 1, 37073 Göttingen, Germany',
    latitude: 51.5339, longitude: 9.9356,
  },
  'uni-tuebingen.de': {
    name: 'Universität Tübingen', city: 'Tübingen',
    website: 'https://uni-tuebingen.de',
    linkedinUrl: 'https://www.linkedin.com/school/eberhard-karls-universitat-tubingen/',
    instagramUrl: 'https://www.instagram.com/uni.tuebingen/',
    address: 'Geschwister-Scholl-Platz, 72074 Tübingen, Germany',
    latitude: 48.5227, longitude: 9.0566,
  },
  'uni-mannheim.de': {
    name: 'Universität Mannheim', city: 'Mannheim',
    website: 'https://www.uni-mannheim.de',
    linkedinUrl: 'https://www.linkedin.com/school/university-of-mannheim/',
    instagramUrl: 'https://www.instagram.com/uni.mannheim/',
    address: 'Schloss, 68131 Mannheim, Germany',
    latitude: 49.4836, longitude: 8.4628,
  },
  'uni-muenster.de': {
    name: 'Universität Münster', city: 'Münster',
    website: 'https://www.uni-muenster.de',
    linkedinUrl: 'https://www.linkedin.com/school/westfalische-wilhelms-universitat-munster/',
    instagramUrl: 'https://www.instagram.com/uni.muenster/',
    address: 'Schlossplatz 2, 48149 Münster, Germany',
    latitude: 51.9631, longitude: 7.6156,
  },
  'uni-stuttgart.de': {
    name: 'Universität Stuttgart', city: 'Stuttgart',
    website: 'https://www.uni-stuttgart.de',
    linkedinUrl: 'https://www.linkedin.com/school/university-of-stuttgart/',
    instagramUrl: 'https://www.instagram.com/uni.stuttgart/',
    address: 'Keplerstraße 7, 70174 Stuttgart, Germany',
    latitude: 48.7783, longitude: 9.1798,
  },
  'uni-frankfurt.de': {
    name: 'Goethe-Universität Frankfurt', city: 'Frankfurt', shortName: 'Goethe Uni',
    website: 'https://www.goethe-university-frankfurt.de',
    linkedinUrl: 'https://www.linkedin.com/school/goethe-universitat-frankfurt-am-main/',
    instagramUrl: 'https://www.instagram.com/goetheuniversity/',
    address: 'Theodor-W.-Adorno-Platz 1, 60629 Frankfurt am Main, Germany',
    latitude: 50.1231, longitude: 8.6512,
  },
  'uni-jena.de': {
    name: 'Friedrich-Schiller-Universität Jena', city: 'Jena', shortName: 'FSU Jena',
    website: 'https://www.uni-jena.de',
    linkedinUrl: 'https://www.linkedin.com/school/friedrich-schiller-universitat-jena/',
    instagramUrl: 'https://www.instagram.com/uni.jena/',
    address: 'Fürstengraben 1, 07743 Jena, Germany',
    latitude: 50.9281, longitude: 11.5882,
  },
  'uni-wuerzburg.de': {
    name: 'Julius-Maximilians-Universität Würzburg', city: 'Würzburg', shortName: 'JMU',
    website: 'https://www.uni-wuerzburg.de',
    linkedinUrl: 'https://www.linkedin.com/school/julius-maximilians-universitat-wurzburg/',
    instagramUrl: 'https://www.instagram.com/uni.wuerzburg/',
    address: 'Sanderring 2, 97070 Würzburg, Germany',
    latitude: 49.7958, longitude: 9.9318,
  },
  'uni-potsdam.de': {
    name: 'Universität Potsdam', city: 'Potsdam',
    website: 'https://www.uni-potsdam.de',
    linkedinUrl: 'https://www.linkedin.com/school/universitat-potsdam/',
    instagramUrl: 'https://www.instagram.com/uni.potsdam/',
    address: 'Am Neuen Palais 10, 14469 Potsdam, Germany',
    latitude: 52.4007, longitude: 13.0150,
  },
  'uni-augsburg.de': {
    name: 'Universität Augsburg', city: 'Augsburg',
    website: 'https://www.uni-augsburg.de',
    linkedinUrl: 'https://www.linkedin.com/school/universitat-augsburg/',
    instagramUrl: 'https://www.instagram.com/uni.augsburg/',
    address: 'Universitätsstraße 2, 86159 Augsburg, Germany',
    latitude: 48.3341, longitude: 10.9002,
  },
  'uni-bayreuth.de': {
    name: 'Universität Bayreuth', city: 'Bayreuth',
    website: 'https://www.uni-bayreuth.de',
    linkedinUrl: 'https://www.linkedin.com/school/universitat-bayreuth/',
    instagramUrl: 'https://www.instagram.com/uni.bayreuth/',
    address: 'Universitätsstraße 30, 95447 Bayreuth, Germany',
    latitude: 49.9285, longitude: 11.5861,
  },
  'uni-leipzig.de': {
    name: 'Universität Leipzig', city: 'Leipzig',
    website: 'https://www.uni-leipzig.de',
    linkedinUrl: 'https://www.linkedin.com/school/universitat-leipzig/',
    instagramUrl: 'https://www.instagram.com/uni.leipzig/',
    address: 'Ritterstraße 26, 04109 Leipzig, Germany',
    latitude: 51.3397, longitude: 12.3802,
  },
  'uni-konstanz.de': {
    name: 'Universität Konstanz', city: 'Constance',
    website: 'https://www.uni-konstanz.de',
    linkedinUrl: 'https://www.linkedin.com/school/university-of-konstanz/',
    instagramUrl: 'https://www.instagram.com/uni.konstanz/',
    address: 'Universitätsstraße 10, 78457 Constance, Germany',
    latitude: 47.6944, longitude: 9.1873,
  },
  'uni-saarland.de': {
    name: 'Universität des Saarlandes', city: 'Saarbrücken', shortName: 'UdS',
    website: 'https://www.uni-saarland.de',
    linkedinUrl: 'https://www.linkedin.com/school/saarland-university/',
    instagramUrl: 'https://www.instagram.com/uni.saarland/',
    address: 'Campus, 66123 Saarbrücken, Germany',
    latitude: 49.2545, longitude: 7.0437,
  },
  'uni-hannover.de': {
    name: 'Leibniz Universität Hannover', city: 'Hannover', shortName: 'LUH',
    website: 'https://www.uni-hannover.de',
    linkedinUrl: 'https://www.linkedin.com/school/leibniz-universitat-hannover/',
    instagramUrl: 'https://www.instagram.com/uni.hannover/',
    address: 'Welfengarten 1, 30167 Hannover, Germany',
    latitude: 52.3824, longitude: 9.7202,
  },
  'tu-clausthal.de': {
    name: 'TU Clausthal', city: 'Clausthal-Zellerfeld',
    website: 'https://www.tu-clausthal.de',
    linkedinUrl: 'https://www.linkedin.com/school/tu-clausthal/',
    address: 'Adolph-Roemer-Straße 2A, 38678 Clausthal-Zellerfeld, Germany',
    latitude: 51.8033, longitude: 10.3390,
  },
  'tu-chemnitz.de': {
    name: 'Technische Universität Chemnitz', city: 'Chemnitz', shortName: 'TU Chemnitz',
    website: 'https://www.tu-chemnitz.de',
    linkedinUrl: 'https://www.linkedin.com/school/tu-chemnitz/',
    instagramUrl: 'https://www.instagram.com/tu.chemnitz/',
    address: 'Straße der Nationen 62, 09111 Chemnitz, Germany',
    latitude: 50.8350, longitude: 12.9228,
  },
  'tu-ilmenau.de': {
    name: 'Technische Universität Ilmenau', city: 'Ilmenau', shortName: 'TU Ilmenau',
    website: 'https://www.tu-ilmenau.de',
    linkedinUrl: 'https://www.linkedin.com/school/technische-universitat-ilmenau/',
    instagramUrl: 'https://www.instagram.com/tu.ilmenau/',
    address: 'Ehrenbergstraße 29, 98693 Ilmenau, Germany',
    latitude: 50.6849, longitude: 10.9261,
  },
  'tu-kaiserslautern.de': {
    name: 'TU Kaiserslautern', city: 'Kaiserslautern',
    website: 'https://www.uni-kl.de',
    linkedinUrl: 'https://www.linkedin.com/school/rptu/',
    address: 'Gottlieb-Daimler-Straße, 67663 Kaiserslautern, Germany',
    latitude: 49.4271, longitude: 7.7532,
  },
  'rptu.de': {
    name: 'RPTU Kaiserslautern-Landau', city: 'Kaiserslautern', shortName: 'RPTU',
    website: 'https://rptu.de',
    linkedinUrl: 'https://www.linkedin.com/school/rptu/',
    instagramUrl: 'https://www.instagram.com/rptu.de/',
    address: 'Gottlieb-Daimler-Straße, 67663 Kaiserslautern, Germany',
    latitude: 49.4271, longitude: 7.7532,
  },
  'hs-mannheim.de': {
    name: 'Hochschule Mannheim', city: 'Mannheim',
    website: 'https://www.hs-mannheim.de',
    linkedinUrl: 'https://www.linkedin.com/school/hochschule-mannheim/',
    address: 'Paul-Wittsack-Straße 10, 68163 Mannheim, Germany',
    latitude: 49.4679, longitude: 8.4753,
  },
  'daad.de':      { name: 'DAAD', city: '', website: 'https://www.daad.de' },
  'studieren.de': { name: '', city: '' },
};

/**
 * Look up the short name / abbreviation for a canonical university name.
 * Returns the abbreviation string if one exists, or null if none is defined.
 */
export function getUniversityShortName(canonicalName: string): string | null {
  for (const info of Object.values(KNOWN_UNIVERSITIES)) {
    if (info.name && info.shortName && info.name.toLowerCase() === canonicalName.toLowerCase()) {
      return info.shortName;
    }
  }
  return null;
}

/**
 * Normalize a scraped university name against the KNOWN_UNIVERSITIES list.
 * Returns the canonical name if a confident match is found, otherwise returns
 * the input name unchanged.
 *
 * Matching strategies (in order of confidence):
 *  1. Exact case-insensitive match
 *  2. One string fully contains the other (for long names)
 *  3. Token-set overlap: ≥70% of tokens in the shorter name appear in the longer
 */
export function normalizeUniversityName(name: string): string {
  if (!name || name === 'Unknown University') return name;

  const lowerInput = name.toLowerCase().trim();
  const knownNames = Object.values(KNOWN_UNIVERSITIES)
    .map((v) => v.name)
    .filter(Boolean);

  // 1. Exact match (case-insensitive)
  for (const canonical of knownNames) {
    if (canonical.toLowerCase() === lowerInput) return canonical;
  }

  // 2. Full containment — one name fully contains the other
  for (const canonical of knownNames) {
    const lowerCanonical = canonical.toLowerCase();
    if (lowerInput.includes(lowerCanonical) || lowerCanonical.includes(lowerInput)) {
      // Guard: reject if the overlap is too short to be meaningful
      const shorter = lowerInput.length < lowerCanonical.length ? lowerInput : lowerCanonical;
      if (shorter.length >= 8) return canonical;
    }
  }

  // 3. Token-set overlap — split on spaces/punctuation and check coverage
  const inputTokens = lowerInput.split(/[\s,.-]+/).filter((t) => t.length > 2);
  for (const canonical of knownNames) {
    const canonicalTokens = canonical.toLowerCase().split(/[\s,.-]+/).filter((t) => t.length > 2);
    const shorter = inputTokens.length <= canonicalTokens.length ? inputTokens : canonicalTokens;
    const longer = inputTokens.length <= canonicalTokens.length ? canonicalTokens : inputTokens;
    if (shorter.length === 0) continue;
    const matchCount = shorter.filter((t) => longer.some((lt) => lt.includes(t) || t.includes(lt))).length;
    if (matchCount / shorter.length >= 0.7 && matchCount >= 2) {
      return canonical;
    }
  }

  return name;
}

const GERMAN_CITIES = [
  'Berlin', 'Munich', 'München', 'Hamburg', 'Frankfurt', 'Cologne', 'Köln',
  'Stuttgart', 'Düsseldorf', 'Leipzig', 'Dresden', 'Heidelberg', 'Freiburg',
  'Münster', 'Hannover', 'Nuremberg', 'Nürnberg', 'Bremen', 'Bochum',
  'Dortmund', 'Karlsruhe', 'Mannheim', 'Augsburg', 'Wiesbaden', 'Bielefeld',
  'Bonn', 'Aachen', 'Constance', 'Konstanz', 'Jena', 'Erfurt', 'Potsdam',
  'Kassel', 'Regensburg', 'Tübingen', 'Würzburg', 'Saarbrücken', 'Braunschweig',
  'Darmstadt', 'Göttingen', 'Marburg', 'Passau', 'Rostock', 'Magdeburg',
  'Kaiserslautern', 'Chemnitz', 'Ilmenau', 'Bayreuth', 'Erlangen',
  'Clausthal-Zellerfeld', 'Siegen', 'Paderborn', 'Osnabrück', 'Oldenburg',
  'Greifswald', 'Kiel', 'Lübeck', 'Giessen', 'Gießen', 'Mainz', 'Trier',
  'Wuppertal', 'Duisburg', 'Essen', 'Halle', 'Cottbus', 'Weimar', 'Fulda',
];

const MONTH_MAP: Record<string, number> = {
  january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
  july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
  jan: 0, feb: 1, mar: 2, apr: 3, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
  januar: 0, februar: 1, märz: 2, april_de: 3, mai: 4, juni: 5,
  juli: 6, august_de: 7, september_de: 8, oktober: 9, november_de: 10, dezember: 11,
};

@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);

  async scrapeUniversityCourse(url: string): Promise<ScrapedCourseData> {
    this.logger.log(`Scraping URL: ${url}`);
    try {
      const html = await this.fetchWithTimeout(url);
      const result = this.parseHTML(html, url);
      this.logger.log(`Scraped: uni="${result.universityName}" course="${result.courseName}" degree="${result.degree}" lang="${result.language}" dur="${result.duration}" fees=${result.fees} deadline="${result.deadline}" ects=${result.ects} city="${result.city}"`);
      return result;
    } catch (error) {
      this.logger.error(`Scraping failed: ${error.message}`);
      throw new HttpException(`Failed to scrape URL: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  private async fetchWithTimeout(url: string, timeoutMs = 20000): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9,de;q=0.8',
        },
        redirect: 'follow',
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      return await response.text();
    } finally {
      clearTimeout(timeout);
    }
  }

  // ─── Main parser ────────────────────────────────────────────────
  private parseHTML(html: string, url: string): ScrapedCourseData {
    const $ = cheerio.load(html);
    const $full = cheerio.load(html); // Keep full HTML for social link extraction (they're in footer)
    const baseUrl = new URL(url).origin;
    const hostname = new URL(url).hostname.replace(/^www\./, '');

    // Extract social links BEFORE removing nav/footer (they live there)
    const socialLinks = this.extractSocialLinks($full, baseUrl);

    // Remove nav, footer, sidebar, scripts, styles to get clean content text
    $('nav, footer, header, script, style, noscript, [role="navigation"], [role="banner"], .nav, .footer, .header, .sidebar, #nav, #footer, #header, #sidebar, .cookie, .breadcrumb').remove();
    const cleanText = $('body').text().replace(/\s+/g, ' ').trim();
    // Also keep structured text with newlines for pattern matching
    const fullText = $('body').text();

    // Try to extract JSON-LD structured data first
    const jsonLd = this.extractJsonLd($);

    // Extract key-value pairs from tables and definition lists
    const kvPairs = this.extractKeyValuePairs($);

    const city = this.extractCity(cleanText, url, hostname, kvPairs);

    const universityName = this.extractUniversityName($, cleanText, url, hostname, jsonLd);

    return {
      universityName,
      universityShortName: getUniversityShortName(universityName),
      courseName: this.extractCourseName($, cleanText, jsonLd, kvPairs),
      description: this.extractDescription($, jsonLd),
      degree: this.extractDegree(cleanText, kvPairs, jsonLd),
      language: this.extractLanguage(cleanText, kvPairs),
      duration: this.extractDuration(cleanText, kvPairs),
      fees: this.extractFees(cleanText, kvPairs),
      feesPerSemester: this.extractFeesPerSemester(cleanText, kvPairs),
      currency: 'EUR',
      deadline: this.extractDeadline(cleanText, kvPairs).date,
      deadlineInternational: this.extractDeadline(cleanText, kvPairs).internationalDate,
      deadlineLabel: this.extractDeadline(cleanText, kvPairs).label,
      startDate: this.extractStartDate(cleanText, kvPairs),
      applicationUrl: this.extractApplicationUrl($, baseUrl, url),
      sourceUrl: url,
      logoUrl: this.extractLogo($full, baseUrl),
      address: this.extractAddress(cleanText),
      city,
      ects: this.extractECTS(cleanText, kvPairs),
      applicationVia: this.detectApplicationVia(cleanText),
      uniAssistInfo: this.extractUniAssistInfo(cleanText),
      requirements: this.extractRequirements($, cleanText, kvPairs),
      linkedinUrl: socialLinks.linkedin,
      instagramUrl: socialLinks.instagram,
      websiteUrl: baseUrl,
      ...this.getCityCoordinates(city),
    };
  }


  // ─── JSON-LD structured data ──────────────────────────────────
  private extractJsonLd($: cheerio.CheerioAPI): any {
    try {
      const scripts = $('script[type="application/ld+json"]');
      for (let i = 0; i < scripts.length; i++) {
        const text = $(scripts[i]).html();
        if (!text) continue;
        const data = JSON.parse(text);
        // Could be an array or single object
        const items = Array.isArray(data) ? data : [data];
        for (const item of items) {
          if (item['@type'] === 'Course' || item['@type'] === 'EducationalOccupationalProgram' || item['@type'] === 'CollegeOrUniversity') {
            return item;
          }
        }
      }
    } catch (e) {
      this.logger.debug(`JSON-LD parse error: ${e.message}`);
    }
    return null;
  }

  // ─── Key-Value pair extraction from tables & dl ───────────────
  private extractKeyValuePairs($: cheerio.CheerioAPI): Map<string, string> {
    const kv = new Map<string, string>();

    // From definition lists (<dl><dt>...<dd>...)
    $('dl').each((_, dl) => {
      const dts = $(dl).find('dt');
      dts.each((i, dt) => {
        const key = $(dt).text().replace(/\s+/g, ' ').trim().toLowerCase().replace(/:$/, '');
        const dd = $(dt).nextAll('dd').first();
        const val = dd.text().replace(/\s+/g, ' ').trim();
        if (key && val && key.length < 80 && val.length < 500) kv.set(key, val);
      });
    });

    // From tables with 2 columns (label | value)
    $('table').each((_, table) => {
      $(table).find('tr').each((_, tr) => {
        const cells = $(tr).find('td, th');
        if (cells.length === 2) {
          const key = $(cells[0]).text().replace(/\s+/g, ' ').trim().toLowerCase().replace(/:$/, '');
          const val = $(cells[1]).text().replace(/\s+/g, ' ').trim();
          if (key && val && key.length < 80 && val.length < 500) kv.set(key, val);
        }
      });
    });

    // From labeled paragraphs / divs that look like "Label: Value"
    $('li, p, div, span').each((_, el) => {
      const text = $(el).clone().children().remove().end().text().trim();
      // Match "Label: Value" patterns but avoid full paragraphs
      const m = text.match(/^([A-Za-zÄÖÜäöüß\s/&-]{3,40}):\s*(.{2,200})$/);
      if (m) {
        const key = m[1].trim().toLowerCase();
        const val = m[2].trim();
        if (!kv.has(key)) kv.set(key, val);
      }
    });

    return kv;
  }

  // ─── University Name ──────────────────────────────────────────
  private extractUniversityName($: cheerio.CheerioAPI, text: string, url: string, hostname: string, jsonLd: any): string {
    const cleanUniversity = (name: string): string => {
      if (!name || typeof name !== 'string') return '';
      // Remove trailing breadcrumbs separated by pipes, dashes, slashes, colons, newlines
      let clean = name.split(/[|\n\/]| - | – | — | \| /)[0].trim();
      // Remove common page suffix junk like "Study Programs", "Faculty of...", "Department of..."
      clean = clean.replace(/\s*[-–—]?\s*(study\s*programs?|studiengang|faculty\s*of|department\s*of|courses?|programs?|page|home|website|official|portal|degrees?|master|bachelor).*$/i, '').trim();
      // Remove trailing commas, colons, dots
      clean = clean.replace(/[,;:.]+$/, '').trim();
      // Collapse whitespace
      clean = clean.replace(/\s+/g, ' ');
      // If still uncharacteristically long, take only the part up to the first comma or dot
      if (clean.length > 60) {
        const shorter = clean.split(/[,.]\s/)[0].trim();
        if (shorter.length > 5 && shorter.length <= 80) return shorter;
        return clean.substring(0, 60).trim();
      }
      return clean;
    };

    const verifyAgainstKnown = (name: string): string => {
      return normalizeUniversityName(name);
    };

    let foundName = '';

    // 1. Known university mapping
    for (const [domain, info] of Object.entries(KNOWN_UNIVERSITIES)) {
      if (hostname.endsWith(domain) && info.name) return info.name;
    }

    // 2. JSON-LD
    if (jsonLd?.provider?.name && typeof jsonLd.provider.name === 'string') foundName = jsonLd.provider.name;
    else if (jsonLd?.['@type'] === 'CollegeOrUniversity' && typeof jsonLd.name === 'string') foundName = jsonLd.name;

    // 3. OG site name
    if (!foundName) {
      const ogSiteName = $('meta[property="og:site_name"]').attr('content')?.trim();
      if (ogSiteName && ogSiteName.length > 3 && ogSiteName.length < 100) foundName = ogSiteName;
    }

    // 4. Regex patterns on text
    if (!foundName) {
      const patterns = [
        /(?:Technische\s+Universit[äa]t|TU)\s+[^.,|]{3,40}/i,
        /(?:Ludwig[- ]Maximilians[- ]Universit[äa]t)\s*[^.,|]{1,30}/i,
        /(?:Universit[äa]t|University)\s+(?:of\s+)?[A-Za-zÄÖÜäöüß\s-]{3,40}/i,
        /[A-Za-zÄÖÜäöüß\s-]{3,40}\s+(?:Universit[äa]t|University|Hochschule|Institute\s+of\s+Technology)/i,
        /(?:Hochschule|Fachhochschule)\s+[^.,|]{3,40}/i,
        /RWTH\s+Aachen(?:\s+University)?/i,
        /KIT\b/i,
      ];
      for (const p of patterns) {
        const m = text.match(p);
        if (m) {
          const name = m[0].trim();
          if (name.length > 5 && name.length < 100) {
            foundName = name;
            break;
          }
        }
      }
    }

    if (foundName) {
      const cleaned = cleanUniversity(foundName);
      if (cleaned.length > 3) return verifyAgainstKnown(cleaned);
    }

    // 5. Hostname fallback
    try {
      const parts = hostname.split('.');
      const main = parts.find(p => p.startsWith('uni-') || p.startsWith('tu-') || p.startsWith('hs-'));
      if (main) {
        const clean = main.replace(/^(uni|tu|hs)-/, '');
        return verifyAgainstKnown((main.startsWith('tu-') ? 'TU ' : main.startsWith('hs-') ? 'Hochschule ' : 'Universität ') + clean.charAt(0).toUpperCase() + clean.slice(1));
      }
      return verifyAgainstKnown(parts[parts.length - 2].charAt(0).toUpperCase() + parts[parts.length - 2].slice(1) + ' University');
    } catch {}
    
    return 'Unknown University';
  }

  // ─── Course Name ──────────────────────────────────────────────
  private extractCourseName($: cheerio.CheerioAPI, text: string, jsonLd: any, kv: Map<string, string>): string {
    /** Strip trailing prose sentences that leak into page headings.
     *  e.g.  "Biotechnology (B.Sc.) If you have a passion for..."
     *        → "Biotechnology (B.Sc.)"
     */
    const clean = (raw: string): string => {
      if (!raw) return '';
      let name = raw.replace(/\s+/g, ' ').trim();
      // Cut at first pipe / en-dash / em-dash separator
      name = name.split(/\s+[|–—]\s+/)[0].trim();
      // Cut just before common prose intro words that follow a degree title
      name = name.replace(
        /\s+(?:if|with|for|to|in|is|are|we|you|our|this|that|it|by|from|about|on|at|learn|discover|find|join|become|get|start|study|build|make|create|develop|explore|apply|lead|shape|design|be|do|let|have|take|use)\b.*/i,
        '',
      ).trim();
      // Remove trailing punctuation
      name = name.replace(/[,;:.!?]+$/, '').trim();
      // Hard cap
      if (name.length > 120) name = name.substring(0, 120).trim();
      return name;
    };

    // 1. JSON-LD (most reliable — structured data is intention)
    if (jsonLd?.name) {
      const name = clean(jsonLd.name);
      if (name.length > 3) return name;
    }

    // 2. KV pairs
    for (const [k, v] of kv) {
      if (/^(programme?|course|studiengang|study\s*programme?|degree\s*programme?)$/.test(k) && v.length > 3) {
        const name = clean(v);
        if (name.length > 3) return name;
      }
    }

    // 3. H1 — aggressively cleaned because pages often append marketing copy
    const h1 = $('h1').first().text().replace(/\s+/g, ' ').trim();
    if (h1 && h1.length > 3) {
      const name = clean(h1);
      if (name.length > 3 && name.length < 160) return name;
    }

    // 4. og:title — strip everything after first pipe/dash
    const ogTitle = $('meta[property="og:title"]').attr('content')?.trim();
    if (ogTitle && ogTitle.length > 3) {
      // Clean common suffixes
      return ogTitle.replace(/\s*[|\-–—]\s*.*$/, '').trim() || ogTitle;
    }

    // 5. <title> tag
    const title = $('title').text().trim();
    if (title) {
      const cleaned = title.split(/[|\-–—]/)[0].trim();
      if (cleaned.length > 3) return cleaned;
    }

    return 'Unknown Course';
  }

  // ─── Description ──────────────────────────────────────────────
  private extractDescription($: cheerio.CheerioAPI, jsonLd: any): string {
    if (jsonLd?.description) return jsonLd.description.substring(0, 1000);

    const ogDesc = $('meta[property="og:description"]').attr('content')?.trim();
    if (ogDesc && ogDesc.length > 20) return ogDesc.substring(0, 1000);

    const metaDesc = $('meta[name="description"]').attr('content')?.trim();
    if (metaDesc && metaDesc.length > 20) return metaDesc.substring(0, 1000);

    // Try first meaningful paragraph
    const firstP = $('main p, article p, .content p, #content p, [role="main"] p').first().text().replace(/\s+/g, ' ').trim();
    if (firstP && firstP.length > 50) return firstP.substring(0, 1000);

    return '';
  }

  // ─── Degree ───────────────────────────────────────────────────
  private extractDegree(text: string, kv: Map<string, string>, jsonLd: any): string {
    // 1. KV pairs
    for (const [k, v] of kv) {
      if (/^(degree|abschluss|academic\s*degree|award|qualification)$/.test(k) && v.length < 60) return v;
    }

    // 2. JSON-LD
    if (jsonLd?.educationalCredentialAwarded) return jsonLd.educationalCredentialAwarded;

    // 3. Compound degree patterns — match "Master of Science", "M.Sc.", etc.
    const patterns = [
      /\b(Master\s+of\s+(?:Science|Arts|Engineering|Business\s+Administration|Laws|Education))\b/i,
      /\b(Bachelor\s+of\s+(?:Science|Arts|Engineering|Education))\b/i,
      /\b(M\.?\s*Sc\.?|M\.?\s*A\.?|M\.?\s*Eng\.?|M\.?\s*B\.?\s*A\.?)\b/,
      /\b(B\.?\s*Sc\.?|B\.?\s*A\.?|B\.?\s*Eng\.?)\b/,
      /\b(Master|Bachelor|PhD|Doctorate|Diplom|Staatsexamen|Magister)\b/i,
    ];
    for (const p of patterns) {
      const m = text.match(p);
      if (m) return m[1].trim();
    }
    return '';
  }

  // ─── Language ─────────────────────────────────────────────────
  private extractLanguage(text: string, kv: Map<string, string>): string {
    // 1. KV pairs — most reliable
    for (const [k, v] of kv) {
      if (/^(language|language\s*of\s*instruction|unterrichtssprache|sprache|teaching\s*language|medium\s*of\s*instruction)$/.test(k)) {
        const lower = v.toLowerCase();
        if (/\benglis[ch]?\b/i.test(v) && /\bgerma[n]?\b|deutsch/i.test(v)) return 'German & English';
        if (/\benglis[ch]?\b/i.test(v)) return 'English';
        if (/\bdeutsch\b|\bgerma[n]?\b/i.test(v)) return 'German';
        if (v.length < 40) return v;
      }
    }

    // 2. Explicit patterns in text
    const langPatterns: [RegExp, string][] = [
      [/(?:language\s+of\s+instruction|teaching\s+language|taught\s+in|unterrichtssprache)[:\s]*(?:is\s+)?english(?:\s+and\s+german)?/i, ''],
      [/taught\s+(?:entirely\s+)?in\s+english/i, 'English'],
      [/taught\s+(?:entirely\s+)?in\s+german/i, 'German'],
      [/(?:language|taught)[:\s]*english\s+(?:and|&|\/)\s*german/i, 'German & English'],
      [/(?:language|taught)[:\s]*german\s+(?:and|&|\/)\s*english/i, 'German & English'],
      [/english[- ]taught\s+(?:programme|program|course)/i, 'English'],
      [/(?:all|fully)\s+in\s+english/i, 'English'],
      [/german\s+only|only\s+(?:in\s+)?german|deutschsprachig|ausschließlich.*deutsch/i, 'German'],
      [/english\s+only|only\s+(?:in\s+)?english/i, 'English'],
      [/bilingual|zweisprachig/i, 'German & English'],
    ];

    for (const [p, val] of langPatterns) {
      const m = text.match(p);
      if (m) {
        if (val) return val;
        // Parse from match context
        const ctx = m[0].toLowerCase();
        if (ctx.includes('english') && (ctx.includes('german') || ctx.includes('deutsch'))) return 'German & English';
        if (ctx.includes('english')) return 'English';
        if (ctx.includes('german') || ctx.includes('deutsch')) return 'German';
      }
    }

    return '';
  }

  // ─── Duration ─────────────────────────────────────────────────
  private extractDuration(text: string, kv: Map<string, string>): string {
    // 1. KV pairs
    for (const [k, v] of kv) {
      if (/^(duration|dauer|regelstudienzeit|standard\s*period|study\s*duration|period\s*of\s*study|length)$/.test(k)) {
        const m = v.match(/(\d+)\s*(semester|year|jahr|term)/i);
        if (m) return m[0];
        if (v.length < 30) return v;
      }
    }

    // 2. Text patterns
    const patterns = [
      /(?:duration|dauer|regelstudienzeit|standard\s+period\s+of\s+study|study\s+duration)[:\s]+(\d+\s*(?:semesters?|years?|Semester|Jahre?))/i,
      /(\d+)\s*(?:-|\s+to\s+)\s*(\d+)\s*semesters?/i,
      /(\d+)\s*semesters?\s*\((\d+)\s*years?\)/i,
      /(\d+)\s*semesters?/i,
      /(\d+)\s*years?/i,
    ];
    for (const p of patterns) {
      const m = text.match(p);
      if (m) return m[0].replace(/.*?(\d)/, '$1').trim();
    }
    return '';
  }

  // ─── Fees ─────────────────────────────────────────────────────
  private extractFees(text: string, kv: Map<string, string>): number | null {
    // 1. KV pairs
    for (const [k, v] of kv) {
      if (/^(tuition\s*fee|fees?|studiengebühr|gebühr|kosten|cost|tuition)s?$/.test(k)) {
        const num = this.parseGermanNumber(v);
        if (num !== null && num > 0) return num;
      }
    }

    // 2. Text patterns (handle both 1,500.00 and 1.500,00 formats)
    const patterns = [
      /tuition\s*fees?\s*[:=]?\s*(?:€|EUR)?\s*([\d.,]+)\s*(?:€|EUR)?/i,
      /(?:€|EUR)\s*([\d.,]+)\s*(?:per\s+(?:year|annum|semester))/i,
      /([\d.,]+)\s*(?:€|EUR)\s*(?:per\s+(?:year|annum))?/i,
      /fees?\s*[:=]?\s*(?:approx\.?\s*)?(?:€|EUR)?\s*([\d.,]+)/i,
      /(?:semester\s*(?:fee|beitrag|contribution))\s*[:=]?\s*(?:€|EUR)?\s*([\d.,]+)/i,
      /(?:no|none|keine)\s*tuition\s*fees?/i,
    ];

    for (const p of patterns) {
      const m = text.match(p);
      if (m) {
        if (/(?:no|none|keine)/i.test(m[0])) return 0;
        if (m[1]) {
          const num = this.parseGermanNumber(m[1]);
          if (num !== null && num >= 0 && num < 100000) return num;
        }
      }
    }
    return null;
  }

  private extractFeesPerSemester(text: string, kv: Map<string, string>): number | null {
    for (const [k, v] of kv) {
      if (/semester\s*(?:fee|beitrag|contribution|gebühr)/i.test(k)) {
        const num = this.parseGermanNumber(v);
        if (num !== null && num > 0 && num < 2000) return num;
      }
    }

    const patterns = [
      /([\d.,]+)\s*(?:€|EUR)\s*(?:per|\/|each)\s*semester/i,
      /semester\s*(?:fee|beitrag|contribution)\s*[:=]?\s*(?:€|EUR)?\s*([\d.,]+)/i,
    ];
    for (const p of patterns) {
      const m = text.match(p);
      if (m) {
        const num = this.parseGermanNumber(m[1] || m[2]);
        if (num !== null && num > 0 && num < 2000) return num;
      }
    }
    return null;
  }

  // Parse numbers like "1,500.00" or "1.500,00" or "300"
  private parseGermanNumber(str: string): number | null {
    if (!str) return null;
    let cleaned = str.replace(/\s/g, '');

    // Detect German format: "1.500,00" → period as thousands, comma as decimal
    if (/^\d{1,3}(\.\d{3})+(,\d{1,2})?$/.test(cleaned)) {
      cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    }
    // Detect US format: "1,500.00" → comma as thousands, period as decimal
    else if (/^\d{1,3}(,\d{3})+(\.\d{1,2})?$/.test(cleaned)) {
      cleaned = cleaned.replace(/,/g, '');
    }
    // Simple comma decimal: "300,50"
    else if (/^\d+,\d{1,2}$/.test(cleaned)) {
      cleaned = cleaned.replace(',', '.');
    }

    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  }

  // ─── Deadline ─────────────────────────────────────────────────
  private extractDeadline(text: string, kv: Map<string, string>): { date: string | null; internationalDate: string | null; label: string | null } {
    const result = { date: null as string | null, internationalDate: null as string | null, label: null as string | null };

    // 1. KV pairs
    for (const [k, v] of kv) {
      if (/(?:application\s*)?deadline|bewerbungsfrist|application\s*period/i.test(k)) {
        const parsed = this.parseDateString(v);
        if (parsed && !result.date) {
          result.date = parsed;
          if (/international|non[- ]?eu|ausländ/i.test(k)) result.label = 'International Students';
        }
      }
    }

    // 2. Text patterns
    const datePatterns = [
      /(?:application\s+deadline|bewerbungsfrist|apply\s+(?:by|before|until)|deadline\s+(?:for\s+)?(?:application|admission))[:\s]+(.{5,40}?)(?:\.|$|\n|<)/gim,
      /(?:deadline|frist)[:\s]+(\d{1,2}[\.\/-]\d{1,2}[\.\/-]\d{2,4})/gi,
      /(?:deadline|frist)[:\s]+(\d{1,2}\s+\w+\s+\d{4})/gi,
    ];

    if (!result.date) {
      for (const p of datePatterns) {
        const matches = [...text.matchAll(p)];
        for (const m of matches) {
          const parsed = this.parseDateString(m[1]);
          if (parsed && !result.date) {
            result.date = parsed;
            break;
          }
        }
        if (result.date) break;
      }
    }

    // 3. International-specific
    const intlPatterns = [
      /(?:international|non[- ]?eu|foreign|ausländ)\s*(?:students?|applicants?|bewerber)?\s*(?:deadline|frist)?[:\s]+(.{5,40}?)(?:\.|$|\n)/gim,
    ];
    for (const p of intlPatterns) {
      const matches = [...text.matchAll(p)];
      for (const m of matches) {
        const parsed = this.parseDateString(m[1]);
        if (parsed && !result.internationalDate) {
          result.internationalDate = parsed;
          result.label = 'International Students';
          break;
        }
      }
    }

    // 4. Common fixed deadlines for German universities (winter semester)
    if (!result.date) {
      if (/winter\s*semester.*?15\s*(?:\.?\s*)?(?:juli?y?|07)/i.test(text)) result.date = this.nextDeadline(7, 15);
      else if (/summer\s*semester.*?15\s*(?:\.?\s*)?(?:januar?y?|01)/i.test(text)) result.date = this.nextDeadline(1, 15);
    }

    return result;
  }

  private parseDateString(str: string): string | null {
    if (!str) return null;
    const s = str.trim().replace(/,/g, '');

    // ISO: 2026-07-15
    let m = s.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;

    // DD.MM.YYYY / DD/MM/YYYY
    m = s.match(/(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4})/);
    if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;

    // DD.MM.YY
    m = s.match(/(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{2})(?!\d)/);
    if (m) {
      const year = parseInt(m[3]) < 50 ? 2000 + parseInt(m[3]) : 1900 + parseInt(m[3]);
      return `${year}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
    }

    // "15 July 2026" / "July 15, 2026" / "15. Juli 2026"
    m = s.match(/(\d{1,2})\.?\s+(\w+)\s+(\d{4})/);
    if (m) {
      const month = MONTH_MAP[m[2].toLowerCase()];
      if (month !== undefined) return `${m[3]}-${String(month + 1).padStart(2, '0')}-${m[1].padStart(2, '0')}`;
    }
    m = s.match(/(\w+)\s+(\d{1,2})\s+(\d{4})/);
    if (m) {
      const month = MONTH_MAP[m[1].toLowerCase()];
      if (month !== undefined) return `${m[3]}-${String(month + 1).padStart(2, '0')}-${m[2].padStart(2, '0')}`;
    }

    return null;
  }

  private nextDeadline(month: number, day: number): string {
    const now = new Date();
    let year = now.getFullYear();
    const dl = new Date(year, month - 1, day);
    if (dl < now) year++;
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  // ─── Start Date ───────────────────────────────────────────────
  private extractStartDate(text: string, kv: Map<string, string>): string | null {
    for (const [k, v] of kv) {
      if (/^(start|begin|start\s*date|beginn|studienbeginn|commencement)$/.test(k)) {
        if (/winter/i.test(v)) return 'Winter';
        if (/summer|sommer/i.test(v)) return 'Summer';
        if (v.length < 30) return v;
      }
    }
    if (/winter\s*semester|wintersemester/i.test(text)) return 'Winter';
    if (/summer\s*semester|sommersemester/i.test(text)) return 'Summer';
    return null;
  }

  // ─── Application URL ─────────────────────────────────────────
  private extractApplicationUrl($: cheerio.CheerioAPI, baseUrl: string, sourceUrl: string): string {
    const selectors = [
      'a[href*="apply"]', 'a[href*="bewerbung"]', 'a[href*="application"]',
      'a[href*="admission"]', 'a[href*="zulassung"]', 'a[href*="enrol"]',
    ];
    for (const sel of selectors) {
      const href = $(sel).first().attr('href');
      if (href) return this.resolveUrl(href, baseUrl);
    }
    // Try buttons with apply text
    const applyBtn = $('a, button').filter((_, el) => /apply|bewerben|application/i.test($(el).text())).first();
    const href = applyBtn.attr('href');
    if (href) return this.resolveUrl(href, baseUrl);
    return sourceUrl;
  }

  private resolveUrl(href: string, baseUrl: string): string {
    if (href.startsWith('http')) return href;
    if (href.startsWith('//')) return 'https:' + href;
    if (href.startsWith('/')) return baseUrl + href;
    return baseUrl + '/' + href;
  }

  // ─── Logo (enhanced: prefers actual logos over favicons, og:image fallback) ───
  private extractLogo($: cheerio.CheerioAPI, baseUrl: string): string | null {
    // 1. Try to find actual university logo images by priority selectors
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
        const resolved = this.resolveUrl(src, baseUrl);
        if (!resolved.startsWith('data:')) {
          const width = parseInt(el.attr('width') || '0');
          if (width === 0 || width > 20) return resolved;
        }
      }
    }

    // 2. og:image as a reasonable logo fallback (universities often set this to their logo)
    const ogImage = $('meta[property="og:image"]').attr('content');
    if (ogImage && !ogImage.includes('placeholder') && !ogImage.includes('default')) {
      const resolved = this.resolveUrl(ogImage, baseUrl);
      if (resolved.startsWith('http')) return resolved;
    }

    // 3. Fallback to favicon — prefer PNG/SVG over ICO
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
        return this.resolveUrl(icon, baseUrl);
      }
    }
    for (const sel of faviconSelectors) {
      const icon = $(sel).first().attr('href');
      if (icon && icon.length > 1) return this.resolveUrl(icon, baseUrl);
    }
    return baseUrl + '/favicon.ico';
  }

  // ─── Social Media Links ───────────────────────────────────────
  private extractSocialLinks($: cheerio.CheerioAPI, baseUrl: string): { linkedin: string | null; instagram: string | null } {
    let linkedin: string | null = null;
    let instagram: string | null = null;

    // Search all links on the page
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

  // ─── City Coordinates (for map feature) ───────────────────────
  private getCityCoordinates(city: string): { latitude: number | null; longitude: number | null } {
    const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
      'Berlin': { lat: 52.520, lng: 13.405 },
      'Munich': { lat: 48.137, lng: 11.576 },
      'München': { lat: 48.137, lng: 11.576 },
      'Hamburg': { lat: 53.551, lng: 9.994 },
      'Frankfurt': { lat: 50.110, lng: 8.682 },
      'Cologne': { lat: 50.938, lng: 6.960 },
      'Köln': { lat: 50.938, lng: 6.960 },
      'Stuttgart': { lat: 48.776, lng: 9.183 },
      'Düsseldorf': { lat: 51.228, lng: 6.773 },
      'Leipzig': { lat: 51.340, lng: 12.375 },
      'Dresden': { lat: 51.051, lng: 13.738 },
      'Heidelberg': { lat: 49.399, lng: 8.672 },
      'Freiburg': { lat: 47.999, lng: 7.842 },
      'Münster': { lat: 51.962, lng: 7.626 },
      'Hannover': { lat: 52.376, lng: 9.739 },
      'Nuremberg': { lat: 49.452, lng: 11.077 },
      'Nürnberg': { lat: 49.452, lng: 11.077 },
      'Bremen': { lat: 53.075, lng: 8.807 },
      'Bochum': { lat: 51.483, lng: 7.216 },
      'Dortmund': { lat: 51.514, lng: 7.468 },
      'Karlsruhe': { lat: 49.007, lng: 8.404 },
      'Mannheim': { lat: 49.489, lng: 8.467 },
      'Augsburg': { lat: 48.366, lng: 10.898 },
      'Bonn': { lat: 50.735, lng: 7.100 },
      'Aachen': { lat: 50.776, lng: 6.084 },
      'Constance': { lat: 47.660, lng: 9.176 },
      'Konstanz': { lat: 47.660, lng: 9.176 },
      'Jena': { lat: 50.927, lng: 11.586 },
      'Erfurt': { lat: 50.985, lng: 11.030 },
      'Potsdam': { lat: 52.400, lng: 13.066 },
      'Tübingen': { lat: 48.521, lng: 9.058 },
      'Würzburg': { lat: 49.791, lng: 9.953 },
      'Saarbrücken': { lat: 49.240, lng: 6.997 },
      'Braunschweig': { lat: 52.269, lng: 10.522 },
      'Darmstadt': { lat: 49.873, lng: 8.651 },
      'Göttingen': { lat: 51.533, lng: 9.935 },
      'Erlangen': { lat: 49.590, lng: 11.006 },
      'Kaiserslautern': { lat: 49.443, lng: 7.769 },
      'Chemnitz': { lat: 50.833, lng: 12.925 },
      'Ilmenau': { lat: 50.684, lng: 10.914 },
      'Bayreuth': { lat: 49.947, lng: 11.578 },
      'Clausthal-Zellerfeld': { lat: 51.803, lng: 10.339 },
      'Marburg': { lat: 50.812, lng: 8.771 },
      'Rostock': { lat: 54.092, lng: 12.099 },
      'Magdeburg': { lat: 52.121, lng: 11.628 },
      'Kiel': { lat: 54.323, lng: 10.123 },
      'Mainz': { lat: 49.993, lng: 8.247 },
      'Trier': { lat: 49.750, lng: 6.637 },
      'Passau': { lat: 48.574, lng: 13.461 },
      'Regensburg': { lat: 49.013, lng: 12.102 },
      'Giessen': { lat: 50.583, lng: 8.678 },
      'Gießen': { lat: 50.583, lng: 8.678 },
      'Siegen': { lat: 50.874, lng: 8.024 },
      'Paderborn': { lat: 51.719, lng: 8.757 },
      'Osnabrück': { lat: 52.279, lng: 8.043 },
      'Oldenburg': { lat: 53.144, lng: 8.214 },
      'Wuppertal': { lat: 51.256, lng: 7.150 },
      'Duisburg': { lat: 51.435, lng: 6.763 },
      'Essen': { lat: 51.455, lng: 7.012 },
      'Weimar': { lat: 50.980, lng: 11.330 },
      'Cottbus': { lat: 51.756, lng: 14.332 },
    };

    const coords = CITY_COORDS[city];
    return coords
      ? { latitude: coords.lat, longitude: coords.lng }
      : { latitude: null, longitude: null };
  }

  // ─── Address ──────────────────────────────────────────────────
  private extractAddress(text: string): string {
    const patterns = [
      /(?:address|anschrift|standort)[:\s]+([^\n]{10,150})/i,
      /\d{4,5}\s+[A-Za-zÄÖÜäöüß\s-]+,?\s+(?:Germany|Deutschland)/i,
    ];
    for (const p of patterns) {
      const m = text.match(p);
      if (m) return (m[1] || m[0]).trim().substring(0, 200);
    }
    return '';
  }

  // ─── City ─────────────────────────────────────────────────────
  private extractCity(text: string, url: string, hostname: string, kv: Map<string, string>): string {
    // 1. Known universities
    for (const [domain, info] of Object.entries(KNOWN_UNIVERSITIES)) {
      if (hostname.endsWith(domain) && info.city) return info.city;
    }

    // 2. KV pairs
    for (const [k, v] of kv) {
      if (/^(city|stadt|ort|location|standort)$/.test(k) && v.length < 40) {
        const found = GERMAN_CITIES.find(c => v.includes(c));
        if (found) return found;
        return v;
      }
    }

    // 3. Text matching
    for (const city of GERMAN_CITIES) {
      if (text.includes(city)) return city;
    }

    // 4. Hostname
    try {
      const parts = hostname.split('.');
      const m = hostname.match(/(?:^|\.)([\w-]+)\.(?:de|uni|edu)/);
      if (m) {
        const slug = m[1].replace(/^(uni|tu|hs|fh)-/, '');
        const found = GERMAN_CITIES.find(c => c.toLowerCase() === slug);
        if (found) return found;
        return slug.charAt(0).toUpperCase() + slug.slice(1);
      }
    } catch {}
    return '';
  }

  // ─── ECTS ─────────────────────────────────────────────────────
  private extractECTS(text: string, kv: Map<string, string>): number | null {
    for (const [k, v] of kv) {
      if (/^(ects|credits?|credit\s*points?|leistungspunkte)$/.test(k)) {
        const m = v.match(/(\d{2,3})/);
        if (m) return parseInt(m[1], 10);
      }
    }
    const m = text.match(/(\d{2,3})\s*(?:ECTS|credit\s*points?|CP|LP|Leistungspunkte)/i);
    if (m) return parseInt(m[1], 10);
    return null;
  }

  // ─── Application Via ──────────────────────────────────────────
  private detectApplicationVia(text: string): 'DIRECT' | 'UNI_ASSIST' | 'BOTH' {
    const uniAssist = /uni[- ]?assist/i.test(text);
    const direct = /apply\s+directly|online[- ]?bewerbung|bewerbungsportal|apply\s+online\s+portal|direct\s+application/i.test(text);
    if (uniAssist && direct) return 'BOTH';
    if (uniAssist) return 'UNI_ASSIST';
    return 'DIRECT';
  }

  private extractUniAssistInfo(text: string): string {
    if (!/uni[- ]?assist/i.test(text)) return '';
    const m = text.match(/(?:uni[- ]?assist)[^.!?\n]{0,200}[.!?]/i);
    return m ? m[0].trim().substring(0, 300) : 'Application via uni-assist required';
  }

  // ─── Requirements ─────────────────────────────────────────────
  private extractRequirements($: cheerio.CheerioAPI, text: string, kv: Map<string, string>): string {
    // 1. KV pairs
    for (const [k, v] of kv) {
      if (/^(requirements?|admission\s*requirements?|entry\s*requirements?|prerequisites?|zugangsvoraussetzungen?|voraussetzungen?|eligibility)$/.test(k)) {
        if (v.length > 20) return v.substring(0, 500);
      }
    }

    // 2. Section headings containing "requirement" — grab the following text
    const headings = $('h1, h2, h3, h4, h5');
    for (let i = 0; i < headings.length; i++) {
      const heading = $(headings[i]).text().trim();
      if (/requirement|prerequisite|eligibility|admission|zugangsvoraussetzung|voraussetzung/i.test(heading)) {
        const next = $(headings[i]).nextAll('p, ul, ol, div').slice(0, 3);
        const content = next.map((_, el) => $(el).text().replace(/\s+/g, ' ').trim()).get().join(' ');
        if (content.length > 30) return content.substring(0, 500);
      }
    }

    // 3. Regex fallback
    const patterns = [
      /(?:entry\s*requirements?|admission\s*requirements?|prerequisites?|eligibility)[:\s]+(.{40,500})/i,
      /(?:toefl|ielts|dsh|testdaf|language\s*(?:certificate|requirement|proficiency))[:\s]+(.{20,300})/i,
    ];
    for (const p of patterns) {
      const m = text.match(p);
      if (m?.[1]) {
        const cleaned = m[1].replace(/\s+/g, ' ').trim().substring(0, 500);
        if (cleaned.length > 30) return cleaned;
      }
    }
    return '';
  }
}
