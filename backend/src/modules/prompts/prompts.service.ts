import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PromptsService {
  constructor(private prisma: PrismaService) {}

  async generateSopPrompt(applicationId: string): Promise<{ prompt: string; wordCount: number }> {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { course: { include: { university: true } } },
    });

    if (!application) throw new NotFoundException('Application not found');

    const profile = await this.prisma.profile.findFirst();
    const course = application.course;
    const university = course.university;

    const studentSection = profile
      ? `
**STUDENT PROFILE:**
- Name: ${profile.firstName} ${profile.lastName}
- Nationality: ${profile.nationality || 'Not specified'}
- Bachelor's Degree: ${profile.bachelorDegree || 'Not specified'} from ${profile.bachelorUniversity || 'Not specified'} (Grade: ${profile.bachelorGrade || 'Not specified'})
- Bachelor's Graduation Year: ${profile.bachelorYear || 'Not specified'}
${profile.masterDegree ? `- Master's Degree: ${profile.masterDegree} from ${profile.masterUniversity} (Grade: ${profile.masterGrade})` : ''}
- Language Scores:
  ${profile.ieltsScore ? `• IELTS: ${profile.ieltsScore}` : ''}
  ${profile.toeflScore ? `• TOEFL: ${profile.toeflScore}` : ''}
  ${profile.testDafScore ? `• TestDaF: ${profile.testDafScore}` : ''}
  ${profile.germanLevel ? `• German Level: ${profile.germanLevel}` : ''}
- Work Experience: ${profile.workExperience || 'None specified'}
- Skills: ${profile.skills?.join(', ') || 'Not specified'}
- Research Interests: ${profile.researchInterests || 'Not specified'}
- Target Degree: ${profile.targetDegree || 'Master\'s'}
- Target Semester: ${profile.targetSemester || 'Not specified'}`
      : `
**STUDENT PROFILE:** (Complete your profile for personalized prompts)
- Name: [Your Full Name]
- Nationality: [Your Nationality]
- Academic Background: [Your degree and grades]
- Language Scores: [IELTS/TOEFL/TestDaF scores]
- Work Experience: [Relevant work experience]
- Research Interests: [Your academic interests]`;

    const courseSection = `
**TARGET PROGRAM:**
- University: ${university.name}
- City: ${university.city || 'Germany'}
- Course/Program: ${course.name}
- Degree: ${course.degree || 'Master\'s'}
- Language: ${course.language || 'English'}
- Duration: ${course.duration || '2 years'}
- ECTS: ${course.ects || '120'} credits
${course.description ? `- Program Description: ${course.description.substring(0, 300)}` : ''}
${course.requirements ? `- Admission Requirements: ${course.requirements.substring(0, 300)}` : ''}
- Application Via: ${course.applicationVia === 'UNI_ASSIST' ? 'uni-assist portal' : 'University direct portal'}
${course.deadline ? `- Application Deadline: ${new Date(course.deadline).toLocaleDateString('en-DE', { day: 'numeric', month: 'long', year: 'numeric' })}` : ''}`;

    const prompt = `You are an expert academic writer specializing in German university Statement of Purpose (SOP) / Motivation Letter writing. Write a compelling, authentic, and professional Statement of Purpose based on the following details.

═══════════════════════════════════════════════════
${studentSection}

${courseSection}

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
Connect your undergraduate studies directly to this program. Mention specific courses, thesis, or projects relevant to ${course.name}. Include your academic achievements with actual grades/scores.

**Paragraph 3 — Professional Experience & Skills (100–130 words)**
Describe relevant internships, research, or work that prepared you for this program. Be specific about skills gained and impact made.

**Paragraph 4 — Why This Program (130–160 words)**
Explain specifically WHY ${course.name} at ${university.name}:
- Mention specific modules, professors, or research groups
- Reference ${university.name}'s specific strengths
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
    };
  }

  async generateEmailPrompt(applicationId: string, emailType: string): Promise<{ prompt: string }> {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { course: { include: { university: true } } },
    });

    if (!application) throw new NotFoundException('Application not found');

    const profile = await this.prisma.profile.findFirst();
    const course = application.course;
    const university = course.university;

    const emailTemplates: Record<string, string> = {
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
}
