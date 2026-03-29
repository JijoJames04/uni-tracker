"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let PromptsService = class PromptsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generateSopPrompt(applicationId) {
        const application = await this.prisma.application.findUnique({
            where: { id: applicationId },
            include: { course: { include: { university: true } } },
        });
        if (!application)
            throw new common_1.NotFoundException('Application not found');
        const profile = await this.prisma.profile.findFirst();
        const course = application.course;
        const university = course.university;
        const fields = {
            name: profile ? `${profile.firstName} ${profile.lastName}`.trim() : '',
            studies: profile?.bachelorDegree || '',
            courseToApply: course.name,
            university: university.name,
            intakeDetails: profile?.targetSemester || '',
            motivation: '',
            toeflScore: profile?.toeflScore ?? undefined,
            ieltsScore: profile?.ieltsScore ?? undefined,
            germanLevel: profile?.germanLevel ?? undefined,
            testDafScore: profile?.testDafScore ?? undefined,
            greVerbal: profile?.greVerbal ?? undefined,
            greQuant: profile?.greQuant ?? undefined,
            gmatScore: profile?.gmatScore ?? undefined,
            workExperience: profile?.workExperience ?? undefined,
            researchInterests: profile?.researchInterests ?? undefined,
            publications: profile?.publications ?? undefined,
            skills: profile?.skills?.length ? profile.skills : undefined,
            bachelorGrade: profile?.bachelorGrade ?? undefined,
            masterGrade: profile?.masterGrade ?? undefined,
            nationality: profile?.nationality ?? undefined,
        };
        const mandatoryFields = ['name', 'studies', 'courseToApply', 'university', 'intakeDetails'];
        const optionalFields = ['toeflScore', 'ieltsScore', 'germanLevel', 'testDafScore', 'greVerbal', 'greQuant', 'gmatScore', 'workExperience', 'researchInterests', 'publications', 'skills', 'bachelorGrade', 'masterGrade', 'nationality'];
        const missingMandatory = mandatoryFields.filter(f => !fields[f]);
        const studentSection = this.buildStudentSection(profile, fields);
        const courseSection = this.buildCourseSection(course, university);
        const languageSection = this.buildLanguageSection(profile);
        const experienceSection = this.buildExperienceSection(profile);
        const prompt = `You are an expert academic writer specializing in German university Statement of Purpose (SOP) / Motivation Letter writing. Write a compelling, authentic, and professional Statement of Purpose based on the following details.

═══════════════════════════════════════════════════
${studentSection}

${courseSection}
${languageSection}
${experienceSection}
═══════════════════════════════════════════════════

**WRITING INSTRUCTIONS:**

1. **Length**: 600–800 words (approximately 1.5 pages)
2. **Format**: Formal academic prose, no bullet points
3. **Tone**: Professional, passionate, and specific — avoid generic statements
4. **Language**: ${course.language === 'German' ? 'Write in formal German (Deutsch)' : 'Write in formal English'}

**STRUCTURE TO FOLLOW:**

**Paragraph 1 — Opening Hook (50–80 words)**
Start with a specific experience, moment, or observation that sparked your interest in this field. Avoid clichés like "Since childhood..." Make it vivid and unique.

**Paragraph 2 — Academic Background (120–150 words)**
Connect your undergraduate studies directly to this program. ${fields.bachelorGrade ? `Mention your grade of ${fields.bachelorGrade} and` : ''} reference specific courses, thesis, or projects relevant to ${course.name}. Include your academic achievements.

**Paragraph 3 — Professional Experience & Skills (100–130 words)**
${fields.workExperience ? 'Describe your relevant work experience and internships.' : 'Since no work experience is provided, focus on academic projects, volunteering, or extracurricular activities that demonstrate relevant skills.'}
${fields.skills?.length ? `Highlight skills: ${fields.skills.join(', ')}` : ''}

**Paragraph 4 — Why This Program (130–160 words)**
Explain specifically WHY ${course.name} at ${university.name}:
- Mention specific modules, professors, or research groups
- Reference ${university.name}'s specific strengths${university.city ? ` in ${university.city}` : ''}
- Show you've researched the program deeply (not a generic paragraph)

**Paragraph 5 — Career Goals (100–130 words)**
Clear, realistic post-graduation goals. How does this degree enable your specific vision? Connect it to Germany's job market or global opportunities.

**Paragraph 6 — Closing (50–70 words)**
Confident, forward-looking close. Express enthusiasm without being sycophantic. End memorably.

**AVOID:**
- Generic phrases: "I have always been passionate about..."
- Repetition of information already in CV
- Vague future goals without specifics
- Mentioning other universities
- Exceeding word count significantly

Now write the complete Statement of Purpose:`;
        return {
            prompt,
            wordCount: prompt.split(/\s+/).length,
            mandatoryFields,
            optionalFields: optionalFields.filter(f => fields[f] !== undefined),
            missingMandatory,
        };
    }
    async generateLorPrompt(applicationId, recommenderName, recommenderTitle, relationship) {
        const application = await this.prisma.application.findUnique({
            where: { id: applicationId },
            include: { course: { include: { university: true } } },
        });
        if (!application)
            throw new common_1.NotFoundException('Application not found');
        const profile = await this.prisma.profile.findFirst();
        const course = application.course;
        const university = course.university;
        const prompt = `You are an expert academic letter writer. Write a compelling Letter of Recommendation (LOR) for a student applying to a German university.

═══════════════════════════════════════════════════
**RECOMMENDER DETAILS:**
- Name: ${recommenderName || '[Recommender Full Name]'}
- Title/Position: ${recommenderTitle || '[Professor/Manager/Supervisor Title]'}
- Relationship to Student: ${relationship || '[e.g., Thesis Supervisor, Course Instructor, Direct Manager]'}

**STUDENT DETAILS:**
- Name: ${profile ? `${profile.firstName} ${profile.lastName}` : '[Student Name]'}
- Current Degree: ${profile?.bachelorDegree || '[Current Degree]'} from ${profile?.bachelorUniversity || '[Current University]'}
${profile?.bachelorGrade ? `- GPA/Grade: ${profile.bachelorGrade}` : ''}
${profile?.workExperience ? `- Relevant Experience: ${profile.workExperience}` : ''}
${profile?.skills?.length ? `- Key Skills: ${profile.skills.join(', ')}` : ''}
${profile?.researchInterests ? `- Research Interests: ${profile.researchInterests}` : ''}

**TARGET PROGRAM:**
- University: ${university.name}
- Program: ${course.name}
- Degree: ${course.degree || "Master's"}
- Country: Germany
═══════════════════════════════════════════════════

**WRITING INSTRUCTIONS:**

1. **Length**: 400–600 words (approximately 1 page)
2. **Format**: Formal letter format with proper salutation and closing
3. **Tone**: Authoritative, specific, and enthusiastic
4. **Perspective**: Write from the recommender's perspective (first person)

**STRUCTURE:**

**Opening Paragraph (60–80 words)**
- State who you are and your relationship with the student
- How long have you known them
- In what capacity (course, research, work)

**Academic/Professional Assessment (150–200 words)**
- Specific examples of the student's exceptional work
- Concrete achievements, grades, or projects
- How they compared to peers
- Intellectual qualities demonstrated

**Personal Qualities (100–130 words)**
- Character traits: leadership, initiative, teamwork
- Specific anecdotes demonstrating these qualities
- Ability to handle challenges

**Closing Recommendation (60–80 words)**
- Clear, unequivocal recommendation
- Why they are suitable for ${course.name} at ${university.name}
- Willingness to provide further information
- Professional sign-off

**AVOID:**
- Vague or generic praise
- Exaggeration without evidence
- Mentioning weaknesses
- Being too brief or superficial

Now write the complete Letter of Recommendation:`;
        return {
            prompt,
            wordCount: prompt.split(/\s+/).length,
        };
    }
    async generateEmailPrompt(applicationId, emailType) {
        const application = await this.prisma.application.findUnique({
            where: { id: applicationId },
            include: { course: { include: { university: true } } },
        });
        if (!application)
            throw new common_1.NotFoundException('Application not found');
        const profile = await this.prisma.profile.findFirst();
        const course = application.course;
        const university = course.university;
        const emailTemplates = {
            inquiry: `Write a professional email to the admissions office of ${university.name} inquiring about the ${course.name} program. 

Student: ${profile?.firstName || '[Name]'} ${profile?.lastName || ''}
From: ${profile?.nationality || '[Country]'}
Purpose: General program inquiry / admission requirements

The email should:
- Be formal and concise (150-200 words)
- Ask specific questions about admission requirements, language requirements, and application deadlines
- Request information about any upcoming information sessions or open days
- Express genuine interest in the program`,
            status: `Write a professional follow-up email to ${university.name} asking about the application status for ${course.name}.

Student: ${profile?.firstName || '[Name]'} ${profile?.lastName || ''}
Application submitted: [Date submitted]

The email should:
- Be polite and professional
- Reference the submitted application
- Ask for an update timeline
- Be brief (100-150 words)`,
            acceptance: `Write a professional acceptance confirmation email to ${university.name} for the ${course.name} program.

Student: ${profile?.firstName || '[Name]'} ${profile?.lastName || ''}

The email should:
- Formally confirm acceptance of the offer
- Express gratitude
- Ask about next steps (enrollment, housing, visa letter)
- Be enthusiastic but professional (150-200 words)`,
        };
        return { prompt: emailTemplates[emailType] || emailTemplates.inquiry };
    }
    buildStudentSection(profile, fields) {
        if (!profile || !fields.name) {
            return `**STUDENT PROFILE:** (Complete your profile for personalized prompts)
- Name: [Your Full Name] ⚠️ MANDATORY
- Academic Background: [Your degree and grades] ⚠️ MANDATORY
- Target Semester: [e.g., Winter 2026] ⚠️ MANDATORY`;
        }
        let section = `**STUDENT PROFILE:**
- Name: ${fields.name}
- Nationality: ${fields.nationality || 'Not specified'}`;
        section += `\n- Bachelor's Degree: ${profile.bachelorDegree || '⚠️ NOT PROVIDED'} from ${profile.bachelorUniversity || 'Not specified'}`;
        if (fields.bachelorGrade)
            section += ` (Grade: ${fields.bachelorGrade})`;
        if (profile.bachelorYear)
            section += `\n- Graduation Year: ${profile.bachelorYear}`;
        if (profile.masterDegree) {
            section += `\n- Master's Degree: ${profile.masterDegree} from ${profile.masterUniversity || 'Not specified'}`;
            if (fields.masterGrade)
                section += ` (Grade: ${fields.masterGrade})`;
        }
        section += `\n- Target Semester: ${fields.intakeDetails || '⚠️ NOT PROVIDED'}`;
        return section;
    }
    buildCourseSection(course, university) {
        let section = `**TARGET PROGRAM:**
- University: ${university.name}`;
        if (university.city)
            section += `\n- City: ${university.city}, Germany`;
        section += `\n- Course/Program: ${course.name}`;
        section += `\n- Degree: ${course.degree || "Master's"}`;
        section += `\n- Language: ${course.language || 'English'}`;
        if (course.duration)
            section += `\n- Duration: ${course.duration}`;
        if (course.ects)
            section += `\n- ECTS: ${course.ects} credits`;
        if (course.description)
            section += `\n- Program Description: ${course.description.substring(0, 300)}`;
        if (course.requirements)
            section += `\n- Admission Requirements: ${course.requirements.substring(0, 300)}`;
        section += `\n- Application Via: ${course.applicationVia === 'UNI_ASSIST' ? 'uni-assist portal' : 'University direct portal'}`;
        if (course.deadline) {
            section += `\n- Application Deadline: ${new Date(course.deadline).toLocaleDateString('en-DE', { day: 'numeric', month: 'long', year: 'numeric' })}`;
        }
        return section;
    }
    buildLanguageSection(profile) {
        if (!profile)
            return '';
        const scores = [];
        if (profile.ieltsScore)
            scores.push(`• IELTS: ${profile.ieltsScore}${profile.ieltsDate ? ` (${new Date(profile.ieltsDate).toLocaleDateString()})` : ''}`);
        if (profile.toeflScore)
            scores.push(`• TOEFL: ${profile.toeflScore}${profile.toeflDate ? ` (${new Date(profile.toeflDate).toLocaleDateString()})` : ''}`);
        if (profile.testDafScore)
            scores.push(`• TestDaF: ${profile.testDafScore}${profile.testDafDate ? ` (${new Date(profile.testDafDate).toLocaleDateString()})` : ''}`);
        if (profile.germanLevel)
            scores.push(`• German Level: ${profile.germanLevel}`);
        if (profile.goetheLevel)
            scores.push(`• Goethe Certificate: ${profile.goetheLevel}`);
        if (scores.length === 0)
            return '';
        return `\n**LANGUAGE QUALIFICATIONS:**\n${scores.join('\n')}`;
    }
    buildExperienceSection(profile) {
        if (!profile)
            return '';
        const parts = [];
        if (profile.workExperience)
            parts.push(`- Work Experience: ${profile.workExperience}`);
        if (profile.skills?.length)
            parts.push(`- Skills: ${profile.skills.join(', ')}`);
        if (profile.researchInterests)
            parts.push(`- Research Interests: ${profile.researchInterests}`);
        if (profile.publications)
            parts.push(`- Publications: ${profile.publications}`);
        if (profile.greVerbal || profile.greQuant) {
            let gre = '- GRE:';
            if (profile.greVerbal)
                gre += ` Verbal ${profile.greVerbal}`;
            if (profile.greQuant)
                gre += ` Quant ${profile.greQuant}`;
            if (profile.greAnalytical)
                gre += ` Analytical ${profile.greAnalytical}`;
            parts.push(gre);
        }
        if (profile.gmatScore)
            parts.push(`- GMAT: ${profile.gmatScore}`);
        if (parts.length === 0)
            return '';
        return `\n**EXPERIENCE & QUALIFICATIONS:**\n${parts.join('\n')}`;
    }
};
exports.PromptsService = PromptsService;
exports.PromptsService = PromptsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PromptsService);
//# sourceMappingURL=prompts.service.js.map