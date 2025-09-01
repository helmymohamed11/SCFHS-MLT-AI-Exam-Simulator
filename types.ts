export enum Difficulty {
  Easy = 'Easy',
  Medium = 'Medium',
  Hard = 'Hard',
}

export enum Language {
  English = 'English',
  Arabic = 'Arabic',
}

export const DOMAINS = [
  'Clinical Chemistry',
  'Urinalysis & Other Body Fluids',
  'Immunology',
  'Blood Bank (Transfusion Medicine)',
  'Hematology',
  'Microbiology',
  'Lab Operations',
  'Patient Safety & Professionalism',
  'Histo/Cyto-Techniques',
] as const;

export type Domain = typeof DOMAINS[number];

export const SUBTOPICS_MAP: Record<Domain, string[]> = {
  'Clinical Chemistry': ['Electrolytes & Blood Gases', 'Enzymology', 'Endocrinology', 'Toxicology & TDM', 'Carbohydrates & Lipids', 'Proteins & Tumor Markers', 'Liver & Renal Function'],
  'Urinalysis & Other Body Fluids': ['Routine Urinalysis', 'Microscopic Examination', 'Cerebrospinal Fluid (CSF)', 'Synovial & Serous Fluids', 'Amniotic Fluid'],
  'Immunology': ['Cellular Immunity', 'Humoral Immunity', 'Autoimmune Diseases', 'Hypersensitivity Reactions', 'Immunodeficiency Disorders', 'Serology & Infectious Diseases'],
  'Blood Bank (Transfusion Medicine)': ['ABO/Rh Grouping', 'Antibody Screening & ID', 'Crossmatching', 'Transfusion Reactions', 'Blood Components & Therapy', 'Donor Processing'],
  'Hematology': ['Complete Blood Count (CBC)', 'WBC Differential', 'RBC Morphology & Anemias', 'Hemostasis & Coagulation', 'Hematologic Malignancies', 'Bone Marrow Examination'],
  'Microbiology': ['Bacteriology', 'Mycology', 'Parasitology', 'Virology', 'Antimicrobial Susceptibility', 'Specimen Processing & Culture'],
  'Lab Operations': ['Quality Control & Assurance', 'Laboratory Safety', 'Instrumentation', 'Laboratory Information Systems (LIS)', 'Phlebotomy & Specimen Collection'],
  'Patient Safety & Professionalism': ['Patient Identification', 'Critical Value Reporting', 'Professional Ethics', 'Communication', 'Continuing Education'],
  'Histo/Cyto-Techniques': ['Tissue Fixation & Processing', 'Staining Techniques', 'Immunohistochemistry (IHC)', 'Cytology Specimen Preparation', 'Microtomy'],
};


export interface Question {
  id?: number; // Optional ID for IndexedDB
  stem: string;
  options: string[];
  correct_index: number;
  explanation: string;
  domain: Domain;
  subtopic: string;
  difficulty: Difficulty;
  tags: string[];
  refs: string[];
}

export interface User {
  id: number;
  name: string;
  age: number;
  phone: string;
  email: string;
  password?: string; // Should not be sent to client, but needed for simulation
  role: 'user' | 'admin';
}


export const EXAM_SPEC = {
  totalQuestions: 150,
  durationMinutes: 180,
  passPercentage: 60,
  weights: {
    'Clinical Chemistry': 0.20,
    'Hematology': 0.20,
    'Microbiology': 0.20,
    'Blood Bank (Transfusion Medicine)': 0.20,
    'Immunology': 0.10,
    'Urinalysis & Other Body Fluids': 0.05,
    'Lab Operations': 0.05,
    'Patient Safety & Professionalism': 0.00, // Will be distributed among others
    'Histo/Cyto-Techniques': 0.00, // Will be distributed among others
  },
};

// Distribute remaining percentages for 0% domains
const zeroWeightDomains = Object.keys(EXAM_SPEC.weights).filter(d => EXAM_SPEC.weights[d as Domain] === 0);
const nonZeroWeightDomains = Object.keys(EXAM_SPEC.weights).filter(d => EXAM_SPEC.weights[d as Domain] > 0);
const totalWeight = Object.values(EXAM_SPEC.weights).reduce((sum, w) => sum + w, 0);

if (totalWeight < 1 && nonZeroWeightDomains.length > 0) {
    const remainingWeight = 1 - totalWeight;
    const distribution = remainingWeight / nonZeroWeightDomains.length;
    nonZeroWeightDomains.forEach(d => {
        EXAM_SPEC.weights[d as Domain] += distribution;
    });
}


export type AppMode = 'single-question' | 'exam' | 'question-bank' | 'review-incorrect';
export type ExamStatus = 'not-started' | 'generating' | 'ready' | 'in-progress' | 'finished';