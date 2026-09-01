import type { Availability, Review, Service, TechnicianProfile } from "./types";

export const CERTIFIED_EDUCATION_ADVISORS: TechnicianProfile[] = [
  {
    id: "advisor-1",
    userId: "u-advisor-1",
    bio: "Former Oxford admissions committee officer & Senior Academic Counsellor specializing in Russell Group and Ivy League university admissions. Guided 300+ international students.",
    skills: ["UK Admissions", "Russell Group", "Oxbridge Strategy", "Chevening Scholarships"],
    experienceYears: 8,
    pricePerHour: 45,
    location: "London, UK",
    timezone: "Europe/London",
    rating: 4.95,
    totalReviews: 34,
    createdAt: "2025-01-15T09:00:00.000Z",
    updatedAt: "2026-08-10T12:00:00.000Z",
    user: {
      id: "u-advisor-1",
      name: "Dr. Sarah Jenkins",
      email: "sarah.jenkins@nexted.app",
      phone: "+44 20 7946 0912",
      location: "London, UK",
      role: "TECHNICIAN",
      activeStatus: "ACTIVE",
      createdAt: "2025-01-15T09:00:00.000Z",
      updatedAt: "2026-08-10T12:00:00.000Z"
    },
    services: [
      {
        id: "srv-adv-1",
        title: "1-on-1 Oxbridge & Russell Group Strategy Consultation",
        description: "60-minute intensive application roadmap, course selection, and college targeting.",
        price: 75,
        location: "London, UK / Online",
        isActive: true,
        categoryId: "1",
        technicianId: "advisor-1",
        createdAt: "",
        updatedAt: "",
        category: { id: "1", name: "University Admissions", description: null, createdAt: "", updatedAt: "" },
        technician: null as any
      },
      {
        id: "srv-adv-2",
        title: "Personal Statement & SOP Line-by-Line Polish",
        description: "Comprehensive editing and structure refinement for top UK university applications.",
        price: 150,
        location: "Global Online",
        isActive: true,
        categoryId: "1",
        technicianId: "advisor-1",
        createdAt: "",
        updatedAt: "",
        category: { id: "1", name: "SOP & Essays", description: null, createdAt: "", updatedAt: "" },
        technician: null as any
      }
    ],
    availability: [
      { id: "av-1", technicianId: "advisor-1", dayOfWeek: "MONDAY", startTime: "09:00", endTime: "17:00", isAvailable: true, createdAt: "", updatedAt: "" },
      { id: "av-2", technicianId: "advisor-1", dayOfWeek: "TUESDAY", startTime: "09:00", endTime: "17:00", isAvailable: true, createdAt: "", updatedAt: "" },
      { id: "av-3", technicianId: "advisor-1", dayOfWeek: "WEDNESDAY", startTime: "09:00", endTime: "17:00", isAvailable: true, createdAt: "", updatedAt: "" },
      { id: "av-4", technicianId: "advisor-1", dayOfWeek: "THURSDAY", startTime: "09:00", endTime: "17:00", isAvailable: true, createdAt: "", updatedAt: "" },
      { id: "av-5", technicianId: "advisor-1", dayOfWeek: "FRIDAY", startTime: "09:00", endTime: "16:00", isAvailable: true, createdAt: "", updatedAt: "" }
    ],
    reviews: [
      {
        id: "rev-1",
        bookingId: "b-1",
        customerId: "c-1",
        technicianId: "advisor-1",
        rating: 5,
        comment: "Dr. Sarah's feedback transformed my Oxford MSc personal statement. Received my unconditional offer within 4 weeks!",
        createdAt: "2026-07-20T14:00:00.000Z",
        updatedAt: "",
        customer: { id: "c-1", name: "David K." }
      }
    ]
  },
  {
    id: "advisor-2",
    userId: "u-advisor-2",
    bio: "Former US Admissions Committee Member & Visa Specialist for North American STEM and MBA programs. Expert in PGWP and STEM OPT pathways.",
    skills: ["Canada PGWP", "USA STEM Programs", "MBA Applications", "Student Visa"],
    experienceYears: 10,
    pricePerHour: 50,
    location: "Toronto, Canada",
    timezone: "America/Toronto",
    rating: 4.88,
    totalReviews: 48,
    createdAt: "2025-02-10T10:00:00.000Z",
    updatedAt: "2026-08-11T14:00:00.000Z",
    user: {
      id: "u-advisor-2",
      name: "Michael Chang",
      email: "michael.chang@nexted.app",
      phone: "+1 416 555 0194",
      location: "Toronto, Canada",
      role: "TECHNICIAN",
      activeStatus: "ACTIVE",
      createdAt: "2025-02-10T10:00:00.000Z",
      updatedAt: "2026-08-11T14:00:00.000Z"
    },
    services: [
      {
        id: "srv-adv-3",
        title: "Canada Study Permit & PGWP Planning Session",
        description: "Full audit of financial proof, SDS eligibility, and university selection in Ontario & BC.",
        price: 90,
        location: "Toronto, Canada",
        isActive: true,
        categoryId: "2",
        technicianId: "advisor-2",
        createdAt: "",
        updatedAt: "",
        category: { id: "2", name: "Visa & Immigration", description: null, createdAt: "", updatedAt: "" },
        technician: null as any
      }
    ],
    availability: [
      { id: "av-6", technicianId: "advisor-2", dayOfWeek: "MONDAY", startTime: "10:00", endTime: "18:00", isAvailable: true, createdAt: "", updatedAt: "" },
      { id: "av-7", technicianId: "advisor-2", dayOfWeek: "TUESDAY", startTime: "10:00", endTime: "18:00", isAvailable: true, createdAt: "", updatedAt: "" },
      { id: "av-8", technicianId: "advisor-2", dayOfWeek: "WEDNESDAY", startTime: "10:00", endTime: "18:00", isAvailable: true, createdAt: "", updatedAt: "" },
      { id: "av-9", technicianId: "advisor-2", dayOfWeek: "THURSDAY", startTime: "10:00", endTime: "18:00", isAvailable: true, createdAt: "", updatedAt: "" }
    ],
    reviews: [
      {
        id: "rev-2",
        bookingId: "b-2",
        customerId: "c-2",
        technicianId: "advisor-2",
        rating: 5,
        comment: "Michael made the Canadian study permit process smooth and stress-free. My visa was approved in 12 days!",
        createdAt: "2026-08-01T10:00:00.000Z",
        updatedAt: "",
        customer: { id: "c-2", name: "Anita S." }
      }
    ]
  },
  {
    id: "advisor-3",
    userId: "u-advisor-3",
    bio: "European Higher Education Consultant specializing in tuition-free public universities in Germany, Austria, and Scandinavia. DAAD scholarship advisor.",
    skills: ["Germany Tuition-Free", "DAAD Scholarships", "European Union", "Master's Prep"],
    experienceYears: 6,
    pricePerHour: 35,
    location: "Berlin, Germany",
    timezone: "Europe/Berlin",
    rating: 4.92,
    totalReviews: 29,
    createdAt: "2025-03-01T11:00:00.000Z",
    updatedAt: "2026-08-12T16:00:00.000Z",
    user: {
      id: "u-advisor-3",
      name: "Elena Rostova",
      email: "elena.rostova@nexted.app",
      phone: "+49 30 123456",
      location: "Berlin, Germany",
      role: "TECHNICIAN",
      activeStatus: "ACTIVE",
      createdAt: "2025-03-01T11:00:00.000Z",
      updatedAt: "2026-08-12T16:00:00.000Z"
    },
    services: [
      {
        id: "srv-adv-4",
        title: "German Public University & Blocked Account Setup",
        description: "Step-by-step application guidance via uni-assist and student visa financial proof preparation.",
        price: 80,
        location: "Berlin, Germany",
        isActive: true,
        categoryId: "3",
        technicianId: "advisor-3",
        createdAt: "",
        updatedAt: "",
        category: { id: "3", name: "Europe Studies", description: null, createdAt: "", updatedAt: "" },
        technician: null as any
      }
    ]
  },
  {
    id: "advisor-4",
    userId: "u-advisor-4",
    bio: "Global Study Abroad & Financial Aid Counselor with focus on UK, Australia, and GKS Scholarships. Helped students secure over $2M in merit grants.",
    skills: ["Australia Subclass 500", "Full Scholarships", "Financial Proof", "CAS Verification"],
    experienceYears: 7,
    pricePerHour: 32,
    location: "Melbourne, Australia",
    timezone: "Australia/Melbourne",
    rating: 4.79,
    totalReviews: 22,
    createdAt: "2025-04-12T08:00:00.000Z",
    updatedAt: "2026-08-05T11:00:00.000Z",
    user: {
      id: "u-advisor-4",
      name: "Rajesh Sharma",
      email: "rajesh.sharma@nexted.app",
      phone: "+61 3 9000 1111",
      location: "Melbourne, Australia",
      role: "TECHNICIAN",
      activeStatus: "ACTIVE",
      createdAt: "2025-04-12T08:00:00.000Z",
      updatedAt: "2026-08-05T11:00:00.000Z"
    }
  },
  {
    id: "advisor-5",
    userId: "u-advisor-5",
    bio: "Ivy League Statement of Purpose & Interview Preparation Coach. Ex-Harvard admissions reader helping high-achieving applicants craft standout essays.",
    skills: ["SOP Editing", "Ivy League Strategy", "Mock Interviews", "Harvard & MIT Prep"],
    experienceYears: 9,
    pricePerHour: 60,
    location: "Boston, USA",
    timezone: "America/New_York",
    rating: 5.0,
    totalReviews: 56,
    createdAt: "2025-01-20T12:00:00.000Z",
    updatedAt: "2026-08-15T09:00:00.000Z",
    user: {
      id: "u-advisor-5",
      name: "Sophia Martinez",
      email: "sophia.martinez@nexted.app",
      phone: "+1 617 555 0188",
      location: "Boston, USA",
      role: "TECHNICIAN",
      activeStatus: "ACTIVE",
      createdAt: "2025-01-20T12:00:00.000Z",
      updatedAt: "2026-08-15T09:00:00.000Z"
    }
  },
  {
    id: "advisor-6",
    userId: "u-advisor-6",
    bio: "PhD Admissions Specialist & Research Proposal Consultant for European & UK Universities. Assists with supervisor outreach and research grant applications.",
    skills: ["PhD Proposal", "Research Fellowships", "Supervisor Outreach", "Journal Publications"],
    experienceYears: 12,
    pricePerHour: 55,
    location: "Cambridge, UK",
    timezone: "Europe/London",
    rating: 4.96,
    totalReviews: 41,
    createdAt: "2024-11-10T14:00:00.000Z",
    updatedAt: "2026-08-02T10:00:00.000Z",
    user: {
      id: "u-advisor-6",
      name: "Dr. Aris Thorne",
      email: "aris.thorne@nexted.app",
      phone: "+44 1223 555 999",
      location: "Cambridge, UK",
      role: "TECHNICIAN",
      activeStatus: "ACTIVE",
      createdAt: "2024-11-10T14:00:00.000Z",
      updatedAt: "2026-08-02T10:00:00.000Z"
    }
  },
  {
    id: "advisor-7",
    userId: "u-advisor-7",
    bio: "Certified Student Visa & Post-Arrival Guidance Consultant for UK, Ireland, and Canada. Specializing in bank statement audits and pre-departure briefings.",
    skills: ["UKVI Student Visa", "Bank Statement Audit", "Pre-Departure", "Airport & Accommodation"],
    experienceYears: 5,
    pricePerHour: 25,
    location: "Dhaka, Bangladesh",
    timezone: "Asia/Dhaka",
    rating: 4.85,
    totalReviews: 31,
    createdAt: "2025-05-18T10:00:00.000Z",
    updatedAt: "2026-08-14T11:00:00.000Z",
    user: {
      id: "u-advisor-7",
      name: "Aisha Rahman",
      email: "aisha.rahman@nexted.app",
      phone: "+880 1711 888999",
      location: "Dhaka, Bangladesh",
      role: "TECHNICIAN",
      activeStatus: "ACTIVE",
      createdAt: "2025-05-18T10:00:00.000Z",
      updatedAt: "2026-08-14T11:00:00.000Z"
    }
  },
  {
    id: "advisor-8",
    userId: "u-advisor-8",
    bio: "International undergraduate admissions counselor with deep expertise in Australian Group of Eight and US university placement.",
    skills: ["Undergraduate Prep", "SAT/IELTS Coaching", "Scholarship Essay", "Visa Lodgement"],
    experienceYears: 6,
    pricePerHour: 38,
    location: "Sydney, Australia",
    timezone: "Australia/Sydney",
    rating: 4.9,
    totalReviews: 25,
    createdAt: "2025-06-01T09:00:00.000Z",
    updatedAt: "2026-08-08T15:00:00.000Z",
    user: {
      id: "u-advisor-8",
      name: "David Miller",
      email: "david.miller@nexted.app",
      phone: "+61 2 9000 8888",
      location: "Sydney, Australia",
      role: "TECHNICIAN",
      activeStatus: "ACTIVE",
      createdAt: "2025-06-01T09:00:00.000Z",
      updatedAt: "2026-08-08T15:00:00.000Z"
    }
  },
  {
    id: "d858aef0-5293-4440-a557-633b21003e28",
    userId: "188ce427-37f8-48ef-839f-23ca91d5dccf",
    bio: "Senior Study Abroad & University Admissions Consultant specializing in UK, Europe, and Asian international student admissions.",
    skills: ["UK University Admissions", "IELTS Strategy", "Visa Documentation", "Student Counseling"],
    experienceYears: 5,
    pricePerHour: 30,
    location: "Dhaka, Bangladesh",
    timezone: "Asia/Dhaka",
    rating: 4.85,
    totalReviews: 18,
    createdAt: "2026-07-11T16:42:41.837Z",
    updatedAt: "2026-08-03T15:50:59.929Z",
    user: {
      id: "188ce427-37f8-48ef-839f-23ca91d5dccf",
      name: "Rahim Ahmed",
      email: "rahim.advisor@nexted.app",
      phone: "+880 1800 000000",
      location: "Dhaka, Bangladesh",
      role: "TECHNICIAN",
      activeStatus: "ACTIVE",
      createdAt: "2026-07-11T16:42:41.837Z",
      updatedAt: "2026-08-03T15:50:59.929Z"
    }
  }
];

export function sanitizeAdvisor(advisor: TechnicianProfile): TechnicianProfile {
  // If the advisor contains legacy plumbing/home-repair skills or bio, convert to education advisor
  const isHandyman =
    advisor.skills?.some((s) => /pipe|leakage|bathroom|plumbing|repair/i.test(s)) ||
    /technician|repair|plumber/i.test(advisor.bio || "");

  if (isHandyman) {
    return {
      ...advisor,
      bio: "Senior Study Abroad & University Admissions Consultant specializing in UK, Europe, and Asian international student admissions.",
      skills: ["UK University Admissions", "IELTS Strategy", "Visa Documentation", "Student Counseling"],
      experienceYears: advisor.experienceYears || 5,
      pricePerHour: advisor.pricePerHour || 30,
      user: advisor.user
        ? {
            ...advisor.user,
            name: advisor.user.name.includes("Service Expert") ? "Rahim Ahmed" : advisor.user.name
          }
        : undefined
    };
  }
  return advisor;
}
