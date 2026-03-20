-- CreateEnum
CREATE TYPE "ApplicationVia" AS ENUM ('DIRECT', 'UNI_ASSIST', 'BOTH');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('DRAFT', 'SOP_WRITING', 'DOCUMENTS_PREPARING', 'DOCUMENTS_READY', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'WAITLISTED');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('SOP', 'CV', 'TRANSCRIPT', 'BACHELOR_CERTIFICATE', 'LANGUAGE_CERT_IELTS', 'LANGUAGE_CERT_TOEFL', 'LANGUAGE_CERT_TESTDAF', 'LANGUAGE_CERT_GOETHE', 'RECOMMENDATION_LETTER', 'PASSPORT', 'MOTIVATION_LETTER', 'PORTFOLIO', 'RESEARCH_PROPOSAL', 'OTHER');

-- CreateEnum
CREATE TYPE "TimelineType" AS ENUM ('STATUS_CHANGE', 'DOCUMENT_UPLOAD', 'NOTE', 'DEADLINE', 'EMAIL', 'PAYMENT');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('DEADLINE', 'INTERVIEW', 'PAYMENT', 'REMINDER', 'MILESTONE');

-- CreateTable
CREATE TABLE "universities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT,
    "address" TEXT,
    "city" TEXT,
    "country" TEXT NOT NULL DEFAULT 'Germany',
    "website" TEXT,
    "description" TEXT,
    "ranking" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "universities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "degree" TEXT,
    "language" TEXT,
    "duration" TEXT,
    "fees" DOUBLE PRECISION,
    "feesPerSemester" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "deadline" TIMESTAMP(3),
    "startDate" TIMESTAMP(3),
    "applicationUrl" TEXT,
    "sourceUrl" TEXT,
    "ects" INTEGER,
    "applicationVia" "ApplicationVia" NOT NULL DEFAULT 'DIRECT',
    "uniAssistInfo" TEXT,
    "requirements" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'DRAFT',
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "notes" TEXT,
    "appliedAt" TIMESTAMP(3),
    "decisionAt" TIMESTAMP(3),
    "submissionFee" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "name" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "notes" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timeline_entries" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT,
    "type" "TimelineType" NOT NULL DEFAULT 'NOTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "timeline_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklist_items" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "checklist_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL DEFAULT '',
    "lastName" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "phone" TEXT,
    "nationality" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "currentAddress" TEXT,
    "homeAddress" TEXT,
    "bachelorDegree" TEXT,
    "bachelorUniversity" TEXT,
    "bachelorGrade" DOUBLE PRECISION,
    "bachelorYear" INTEGER,
    "masterDegree" TEXT,
    "masterUniversity" TEXT,
    "masterGrade" DOUBLE PRECISION,
    "masterYear" INTEGER,
    "ieltsScore" DOUBLE PRECISION,
    "ieltsDate" TIMESTAMP(3),
    "toeflScore" INTEGER,
    "toeflDate" TIMESTAMP(3),
    "testDafScore" INTEGER,
    "testDafDate" TIMESTAMP(3),
    "goetheLevel" TEXT,
    "germanLevel" TEXT,
    "greVerbal" INTEGER,
    "greQuant" INTEGER,
    "greAnalytical" DOUBLE PRECISION,
    "gmatScore" INTEGER,
    "workExperience" TEXT,
    "skills" TEXT[],
    "researchInterests" TEXT,
    "publications" TEXT,
    "targetDegree" TEXT,
    "targetField" TEXT,
    "targetSemester" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calendar_events" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "type" "EventType" NOT NULL DEFAULT 'REMINDER',
    "color" TEXT,
    "courseId" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "calendar_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "applications_courseId_key" ON "applications"("courseId");

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "universities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timeline_entries" ADD CONSTRAINT "timeline_entries_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_items" ADD CONSTRAINT "checklist_items_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
