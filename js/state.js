/**
 * HIERO BRIDGE - Central State Management & Persistence Engine
 * Handles College Data, Final-Year Student Pool, Opportunities, Applications & Mock Interviews
 */

const STORAGE_KEY = 'HIERO_BRIDGE_DATA_V1';

// Initial Seed Data
const DEFAULT_STATE = {
  college: {
    name: 'National Institute of Technology, Warangal',
    code: 'NITW-IN',
    location: 'Warangal, Telangana, India',
    tier: 'Tier-1 Premier Autonomous Institution',
    currentBatch: '2022-2026',
    departments: [
      { id: 'CSE', name: 'Computer Science & Engineering', code: 'CSE', totalStudents: 140 },
      { id: 'AIML', name: 'Artificial Intelligence & Machine Learning', code: 'AIML', totalStudents: 75 },
      { id: 'IT', name: 'Information Technology', code: 'IT', totalStudents: 80 },
      { id: 'ECE', name: 'Electronics & Communication Engineering', code: 'ECE', totalStudents: 120 },
      { id: 'MECH', name: 'Mechanical Engineering', code: 'MECH', totalStudents: 90 }
    ],
    academicYears: ['2022-2026 (Final Year)', '2023-2027', '2024-2028'],
    coordinators: [
      { id: 'COORD-01', name: 'Dr. Ramesh Kulkarni', email: 'ramesh.tpo@college.edu', dept: 'Head of Placement' },
      { id: 'COORD-02', name: 'Prof. Sandhya Mehra', email: 'sandhya.cse@college.edu', dept: 'CSE & AIML Placement Cell' }
    ]
  },

  students: [
    {
      id: 'STU-001',
      regNo: '2022CSE045',
      name: 'Aarav Sharma',
      department: 'CSE',
      academicYear: '2022-2026',
      cgpa: 8.85,
      email: 'aarav.sharma@college.edu',
      phone: '+91-9876543210',
      skills: ['Python', 'Django', 'PostgreSQL', 'Docker', 'REST API', 'Redis'],
      projectCount: 3,
      projects: [
        { title: 'E-Commerce Microservices Engine', tech: 'Python, FastAPI, Docker, RabbitMQ', link: 'https://github.com/aarav/microservices' },
        { title: 'AI Resume Parser & Ranker', tech: 'Python, NLP, spaCy, React', link: 'https://github.com/aarav/resume-parser' },
        { title: 'Cloud Distributed Key-Value Store', tech: 'Go, Raft Consensus, Docker', link: 'https://github.com/aarav/kv-store' }
      ],
      certifications: ['AWS Certified Solutions Architect Associate', 'PostgreSQL Professional'],
      resumeUrl: 'https://hiero.io/resumes/aarav-sharma-2026.pdf',
      placementStatus: 'Active',
      verificationStatus: 'Verified',
      avatar: 'AS'
    },
    {
      id: 'STU-002',
      regNo: '2022AIML012',
      name: 'Diya Patel',
      department: 'AIML',
      academicYear: '2022-2026',
      cgpa: 9.20,
      email: 'diya.patel@college.edu',
      phone: '+91-9876543211',
      skills: ['Python', 'PyTorch', 'Scikit-Learn', 'FastAPI', 'SQL', 'Computer Vision'],
      projectCount: 4,
      projects: [
        { title: 'Brain MRI Tumor Segmentation with 3D U-Net', tech: 'PyTorch, CUDA, MONAI', link: 'https://github.com/diya/mri-segmentation' },
        { title: 'Conversational Code Assistant LLM', tech: 'HuggingFace, LoRA, LangChain', link: 'https://github.com/diya/code-assistant' },
        { title: 'Realtime Credit Fraud Detection Stream', tech: 'Python, Kafka, XGBoost', link: 'https://github.com/diya/fraud-stream' },
        { title: 'Edge Vision Autonomous Obstacle Avoidance', tech: 'OpenCV, TensorRT, ROS', link: 'https://github.com/diya/edge-vision' }
      ],
      certifications: ['Deep Learning Specialization - DeepLearning.AI', 'TensorFlow Developer Certificate'],
      resumeUrl: 'https://hiero.io/resumes/diya-patel-2026.pdf',
      placementStatus: 'Active',
      verificationStatus: 'Verified',
      avatar: 'DP'
    },
    {
      id: 'STU-003',
      regNo: '2022CSE108',
      name: 'Rohan Verma',
      department: 'CSE',
      academicYear: '2022-2026',
      cgpa: 8.10,
      email: 'rohan.verma@college.edu',
      phone: '+91-9876543212',
      skills: ['Java', 'Spring Boot', 'React', 'MySQL', 'Kafka', 'TypeScript'],
      projectCount: 2,
      projects: [
        { title: 'Smart Hospital Patient Queue Management', tech: 'Java, Spring Boot, React, MySQL', link: 'https://github.com/rohan/hospital-mgmt' },
        { title: 'Payment Gateway Integration Sandbox', tech: 'Node.js, Express, Stripe SDK', link: 'https://github.com/rohan/pay-sandbox' }
      ],
      certifications: ['Oracle Certified Professional: Java SE 17 Developer'],
      resumeUrl: 'https://hiero.io/resumes/rohan-verma-2026.pdf',
      placementStatus: 'Active',
      verificationStatus: 'Verified',
      avatar: 'RV'
    },
    {
      id: 'STU-004',
      regNo: '2022IT033',
      name: 'Sneha Reddy',
      department: 'IT',
      academicYear: '2022-2026',
      cgpa: 7.75,
      email: 'sneha.reddy@college.edu',
      phone: '+91-9876543213',
      skills: ['React', 'Node.js', 'MongoDB', 'TypeScript', 'Express', 'TailwindCSS'],
      projectCount: 2,
      projects: [
        { title: 'Collaborative Agile Kanban Workspace', tech: 'React, Socket.io, MongoDB', link: 'https://github.com/sneha/kanban-collab' },
        { title: 'SaaS Analytics Metrics Dashboard', tech: 'Next.js, Tailwind, Chart.js', link: 'https://github.com/sneha/saas-dash' }
      ],
      certifications: ['Meta Certified Front-End Developer'],
      resumeUrl: 'https://hiero.io/resumes/sneha-reddy-2026.pdf',
      placementStatus: 'Active',
      verificationStatus: 'Verified',
      avatar: 'SR'
    },
    {
      id: 'STU-005',
      regNo: '2022ECE054',
      name: 'Vikram Singh',
      department: 'ECE',
      academicYear: '2022-2026',
      cgpa: 8.45,
      email: 'vikram.singh@college.edu',
      phone: '+91-9876543214',
      skills: ['Embedded C', 'Python', 'IoT', 'MQTT', 'Computer Vision', 'Raspberry Pi'],
      projectCount: 3,
      projects: [
        { title: 'Smart Precision Agriculture IoT Gateway', tech: 'Embedded C, ESP32, MQTT, AWS IoT', link: 'https://github.com/vikram/smart-agri' },
        { title: 'Autonomous LiDAR Line Follower Bot', tech: 'C++, ROS2, LiDAR', link: 'https://github.com/vikram/lidar-bot' },
        { title: 'Edge AI Thermal Surveillance Camera', tech: 'Python, OpenCV, Raspberry Pi 4', link: 'https://github.com/vikram/thermal-cam' }
      ],
      certifications: ['Arm Certified MCU Engineer'],
      resumeUrl: 'https://hiero.io/resumes/vikram-singh-2026.pdf',
      placementStatus: 'Active',
      verificationStatus: 'Verified',
      avatar: 'VS'
    },
    {
      id: 'STU-006',
      regNo: '2022CSE021',
      name: 'Ananya Iyer',
      department: 'CSE',
      academicYear: '2022-2026',
      cgpa: 9.40,
      email: 'ananya.iyer@college.edu',
      phone: '+91-9876543215',
      skills: ['Python', 'Go', 'Kubernetes', 'Kafka', 'Distributed Systems', 'SQL'],
      projectCount: 4,
      projects: [
        { title: 'High-Throughput Distributed Event Log', tech: 'Go, Kafka, gRPC, Prometheus', link: 'https://github.com/ananya/event-log' },
        { title: 'Raft Consensus Cluster Implementation', tech: 'Go, TCP Sockets, Docker', link: 'https://github.com/ananya/raft-engine' },
        { title: 'Distributed Video Transcoder Queue', tech: 'Python, Celery, Redis, FFmpeg', link: 'https://github.com/ananya/transcoder' },
        { title: 'Kubernetes Custom Autoscaler Operator', tech: 'Go, K8s Client-go, Helm', link: 'https://github.com/ananya/k8s-scaler' }
      ],
      certifications: ['Google Cloud Associate Cloud Engineer', 'CKA: Certified Kubernetes Administrator'],
      resumeUrl: 'https://hiero.io/resumes/ananya-iyer-2026.pdf',
      placementStatus: 'Active',
      verificationStatus: 'Verified',
      avatar: 'AI'
    },
    {
      id: 'STU-007',
      regNo: '2022AIML044',
      name: 'Karan Malhotra',
      department: 'AIML',
      academicYear: '2022-2026',
      cgpa: 8.30,
      email: 'karan.malhotra@college.edu',
      phone: '+91-9876543216',
      skills: ['Python', 'TensorFlow', 'NLP', 'BERT', 'Flask', 'SQL'],
      projectCount: 3,
      projects: [
        { title: 'Automated Clinical Record Summarizer', tech: 'Python, BERT, HuggingFace, Flask', link: 'https://github.com/karan/clinical-nlp' },
        { title: 'Live Twitter Sentiment Stream Analysis', tech: 'Python, Kafka, NLTK, Streamlit', link: 'https://github.com/karan/sentiment-stream' },
        { title: 'Semantic Vector Search Knowledgebase', tech: 'Python, Qdrant, OpenAI API', link: 'https://github.com/karan/vector-search' }
      ],
      certifications: ['TensorFlow Developer Certificate'],
      resumeUrl: 'https://hiero.io/resumes/karan-malhotra-2026.pdf',
      placementStatus: 'Active',
      verificationStatus: 'Verified',
      avatar: 'KM'
    },
    {
      id: 'STU-008',
      regNo: '2022IT018',
      name: 'Pooja Nair',
      department: 'IT',
      academicYear: '2022-2026',
      cgpa: 6.90,
      email: 'pooja.nair@college.edu',
      phone: '+91-9876543217',
      skills: ['HTML/CSS', 'JavaScript', 'PHP', 'MySQL'],
      projectCount: 1,
      projects: [
        { title: 'College Technical Fest Event Portal', tech: 'PHP, JavaScript, Bootstrap, MySQL', link: 'https://github.com/pooja/fest-portal' }
      ],
      certifications: ['Web Development Fundamentals - Coursera'],
      resumeUrl: 'https://hiero.io/resumes/pooja-nair-2026.pdf',
      placementStatus: 'Active',
      verificationStatus: 'Verified',
      avatar: 'PN'
    }
  ],

  opportunities: [
    {
      id: 'OPP-HC-2026-01',
      origin: 'HIERO Connect',
      company: 'Databricks',
      companyLogo: 'DB',
      industry: 'Data & AI Cloud Infrastructure',
      title: 'Associate Software Engineer - Distributed Systems',
      description: 'Join Databricks engineering to build core query engine microservices, distributed caching, and large scale data processing pipelines.',
      location: 'Bengaluru / Hyderabad (Hybrid)',
      workMode: 'Hybrid',
      ctc: '₹28,00,000 - ₹34,00,000 PA',
      stipend: '₹90,000/month (6-mo internship)',
      minCGPA: 8.50,
      eligibleDepts: ['CSE', 'AIML', 'IT'],
      academicYear: '2022-2026',
      requiredSkills: ['Python', 'SQL', 'Distributed Systems'],
      preferredSkills: ['Go', 'Docker', 'Kubernetes', 'PostgreSQL'],
      minProjects: 2,
      openings: 8,
      deadline: '2026-09-15',
      state: 'SHORTLISTING', // NEW, REVIEWED, SHARED_WITH_STUDENTS, APPLICATIONS_OPEN, SHORTLISTING, SENT_TO_RECRUITER, INTERVIEW, SELECTION, CLOSED
      recruiter: {
        name: 'Sarah Jenkins',
        email: 'sarah.jenkins@databricks.com',
        phone: '+91-9988776655'
      },
      createdAt: '2026-08-20'
    },
    {
      id: 'OPP-HC-2026-02',
      origin: 'HIERO Connect',
      company: 'Microsoft',
      companyLogo: 'MS',
      industry: 'Enterprise Software & Cloud',
      title: 'Cloud & AI Solutions Engineer',
      description: 'Build enterprise-scale Azure AI integrations, backend APIs, and developer workflows using modern cloud frameworks and deep learning services.',
      location: 'Hyderabad / Noida (On-site)',
      workMode: 'On-site',
      ctc: '₹24,00,000 - ₹28,00,000 PA',
      stipend: '₹80,000/month',
      minCGPA: 8.00,
      eligibleDepts: ['CSE', 'AIML', 'IT', 'ECE'],
      academicYear: '2022-2026',
      requiredSkills: ['Python', 'PyTorch', 'SQL'],
      preferredSkills: ['FastAPI', 'Computer Vision', 'Docker'],
      minProjects: 2,
      openings: 12,
      deadline: '2026-09-10',
      state: 'APPLICATIONS_OPEN',
      recruiter: {
        name: 'Arjun Mathur',
        email: 'arjun.mathur@microsoft.com',
        phone: '+91-9123456789'
      },
      createdAt: '2026-08-22'
    },
    {
      id: 'OPP-HC-2026-03',
      origin: 'HIERO Connect',
      company: 'Amazon Web Services (AWS)',
      companyLogo: 'AWS',
      industry: 'Cloud Computing & Services',
      title: 'Software Development Engineer (SDE-1)',
      description: 'Architect resilient backend microservices for AWS compute infrastructure. Emphasis on robust data structures, system design, and concurrency.',
      location: 'Bengaluru / Pune (Hybrid)',
      workMode: 'Hybrid',
      ctc: '₹26,00,000 PA',
      stipend: '₹85,000/month',
      minCGPA: 8.00,
      eligibleDepts: ['CSE', 'IT', 'ECE'],
      academicYear: '2022-2026',
      requiredSkills: ['Java', 'Spring Boot', 'SQL'],
      preferredSkills: ['Kafka', 'TypeScript', 'MySQL'],
      minProjects: 2,
      openings: 15,
      deadline: '2026-09-18',
      state: 'NEW',
      recruiter: {
        name: 'David Chen',
        email: 'dchen@amazon.com',
        phone: '+91-9000112233'
      },
      createdAt: '2026-08-25'
    }
  ],

  applications: [
    {
      id: 'APP-2026-001',
      oppId: 'OPP-HC-2026-01',
      studentId: 'STU-001',
      appliedAt: '2026-08-21T10:30:00Z',
      resumeUrl: 'https://hiero.io/resumes/aarav-sharma-2026.pdf',
      status: 'Shortlisted', // Applied, Under Review, Shortlisted, Sent to Recruiter, Interview, Selected, Rejected
      coordinatorNotes: 'High project match, strong distributed systems and Docker knowledge.',
      recruiterFeedback: null,
      interviewResult: null
    },
    {
      id: 'APP-2026-002',
      oppId: 'OPP-HC-2026-01',
      studentId: 'STU-006',
      appliedAt: '2026-08-21T11:15:00Z',
      resumeUrl: 'https://hiero.io/resumes/ananya-iyer-2026.pdf',
      status: 'Sent to Recruiter',
      coordinatorNotes: 'Outstanding CGPA (9.40), CKA certified, built Raft consensus engine.',
      recruiterFeedback: 'Interview Scheduled',
      interviewResult: {
        overallScore: 84,
        technicalScore: 88,
        communicationScore: 80,
        problemSolvingScore: 86,
        confidenceScore: 82,
        roleKnowledgeScore: 85,
        summary: 'Exceptional deep dive into distributed systems concurrency and Raft consensus.',
        explanation: 'Candidate demonstrated authoritative grasp of consensus protocols, RPC serialization tradeoffs, and live debugging under network partitions.',
        weakAreas: ['Could elaborate more succinctly on production observability metrics under Kubernetes.'],
        practicePlan: 'Focus on Grafana/Prometheus alerting architecture drills on HIERO Practice Hub.',
        interviewDate: '2026-08-24'
      }
    },
    {
      id: 'APP-2026-003',
      oppId: 'OPP-HC-2026-02',
      studentId: 'STU-002',
      appliedAt: '2026-08-23T09:00:00Z',
      resumeUrl: 'https://hiero.io/resumes/diya-patel-2026.pdf',
      status: 'Applied',
      coordinatorNotes: 'Top ranker in AIML (9.20 CGPA), published 3D U-Net project.',
      recruiterFeedback: null,
      interviewResult: null
    },
    {
      id: 'APP-2026-004',
      oppId: 'OPP-HC-2026-02',
      studentId: 'STU-007',
      appliedAt: '2026-08-23T14:45:00Z',
      resumeUrl: 'https://hiero.io/resumes/karan-malhotra-2026.pdf',
      status: 'Applied',
      coordinatorNotes: 'TensorFlow certified, 3 NLP projects.',
      recruiterFeedback: null,
      interviewResult: null
    }
  ],

  // AI Interview Questions Bank tailored to opportunity domains
  interviewBank: {
    'OPP-HC-2026-01': [
      {
        id: 'Q1',
        title: 'Distributed State & Concurrency',
        question: 'Explain how you would handle race conditions and consistency in a distributed key-value store when network partitions occur.',
        rubric: 'Expects discussion of CAP theorem, consensus protocols (Raft/Paxos), optimistic concurrency vs 2PC.',
        category: 'Technical Knowledge'
      },
      {
        id: 'Q2',
        title: 'Database Query Optimization',
        question: 'Given an analytical query spanning millions of time-series records, how would you optimize PostgreSQL indexing and partition pruning?',
        rubric: 'Expects BRIN indexes, range partitioning, memory tuning (work_mem), EXPLAIN ANALYZE interpretation.',
        category: 'Problem Solving'
      },
      {
        id: 'Q3',
        title: 'System Trade-offs & Communication',
        question: 'Describe a project where you had to compromise latency for fault tolerance. How did you convey the trade-off to your team?',
        rubric: 'Expects clear STAR framework, clarity in communication, quantified trade-offs.',
        category: 'Communication'
      }
    ],
    'OPP-HC-2026-02': [
      {
        id: 'Q1',
        title: 'Deep Learning Model Latency',
        question: 'How do you optimize a PyTorch vision model for real-time edge inference with strict latency bounds (<15ms)?',
        rubric: 'Expects TensorRT quantization (INT8/FP16), operator fusion, pruning, asynchronous batching.',
        category: 'Technical Knowledge'
      },
      {
        id: 'Q2',
        title: 'Handling Data Drift in Production ML',
        question: 'How do you monitor and automatically remediate concept drift in a streaming fraud detection system?',
        rubric: 'Expects KS tests, PSI metrics, shadow model deployment, automated retraining pipelines.',
        category: 'Problem Solving'
      },
      {
        id: 'Q3',
        title: 'Engineering Resilience & Growth',
        question: 'Tell me about a complex model training failure you debugged. What was the root cause and learning?',
        rubric: 'Expects structured debugging mindset, gradient explosion/vanishing checks, humility & growth.',
        category: 'Confidence'
      }
    ]
  }
};

class BridgeStore {
  constructor() {
    this.listeners = [];
    this.state = this.loadState();
  }

  loadState() {
    try {
      const serialized = localStorage.getItem(STORAGE_KEY);
      if (serialized) {
        return JSON.parse(serialized);
      }
    } catch (e) {
      console.warn('Could not read state from localStorage, initializing defaults:', e);
    }
    this.saveState(DEFAULT_STATE);
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }

  saveState(newState) {
    this.state = newState || this.state;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Failed to persist state to localStorage:', e);
    }
    this.notify();
  }

  resetState() {
    this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    this.saveState();
  }

  notify() {
    if (this.listeners && Array.isArray(this.listeners)) {
      this.listeners.forEach(fn => fn(this.state));
    }
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => fn(this.state));
  }

  // === Student Helpers ===
  getStudents() {
    return this.state.students || [];
  }

  getStudentById(id) {
    return (this.state.students || []).find(s => s.id === id || s.regNo === id);
  }

  addStudent(studentData) {
    const newStudent = {
      id: 'STU-' + String(Date.now()).slice(-4),
      verificationStatus: 'Verified',
      placementStatus: 'Active',
      avatar: (studentData.name || 'ST').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
      ...studentData
    };
    this.state.students.push(newStudent);
    this.saveState();
    return newStudent;
  }

  bulkAddStudents(studentsList) {
    studentsList.forEach(s => {
      this.state.students.push({
        id: 'STU-' + Math.floor(1000 + Math.random() * 9000),
        verificationStatus: 'Verified',
        placementStatus: s.placementStatus || 'Active',
        avatar: (s.name || 'ST').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
        ...s
      });
    });
    this.saveState();
  }

  updateStudent(id, updates) {
    const index = this.state.students.findIndex(s => s.id === id);
    if (index !== -1) {
      this.state.students[index] = { ...this.state.students[index], ...updates };
      this.saveState();
      return this.state.students[index];
    }
    return null;
  }

  // === Opportunity Helpers ===
  getOpportunities() {
    return this.state.opportunities || [];
  }

  getOpportunityById(id) {
    return (this.state.opportunities || []).find(o => o.id === id);
  }

  addOpportunity(oppData) {
    const newOpp = {
      id: 'OPP-HC-' + new Date().getFullYear() + '-' + String(Date.now()).slice(-3),
      origin: 'HIERO Connect',
      state: 'NEW',
      createdAt: new Date().toISOString().split('T')[0],
      ...oppData
    };
    this.state.opportunities.unshift(newOpp);
    this.saveState();
    return newOpp;
  }

  updateOpportunityState(id, newState) {
    const opp = this.getOpportunityById(id);
    if (opp) {
      opp.state = newState;
      this.saveState();
      return opp;
    }
    return null;
  }

  // === Application Helpers ===
  getApplications() {
    return this.state.applications || [];
  }

  getApplicationsByOpportunity(oppId) {
    return (this.state.applications || []).filter(a => a.oppId === oppId);
  }

  getApplicationsByStudent(studentId) {
    return (this.state.applications || []).filter(a => a.studentId === studentId);
  }

  submitApplication(data) {
    // Check if already applied
    const existing = (this.state.applications || []).find(
      a => a.oppId === data.oppId && a.studentId === data.studentId
    );
    if (existing) {
      return { success: false, message: 'Student has already applied for this opportunity.' };
    }

    const newApp = {
      id: 'APP-' + new Date().getFullYear() + '-' + String(Date.now()).slice(-4),
      oppId: data.oppId,
      studentId: data.studentId,
      appliedAt: new Date().toISOString(),
      resumeUrl: data.resumeUrl || 'https://hiero.io/resumes/custom-upload.pdf',
      status: 'Applied',
      coordinatorNotes: data.notes || 'Direct student application via Bridge portal.',
      recruiterFeedback: null,
      interviewResult: null
    };

    this.state.applications.push(newApp);
    this.saveState();
    return { success: true, application: newApp };
  }

  updateApplicationStatus(appId, status, extra = {}) {
    const app = (this.state.applications || []).find(a => a.id === appId);
    if (app) {
      app.status = status;
      if (extra.coordinatorNotes) app.coordinatorNotes = extra.coordinatorNotes;
      if (extra.recruiterFeedback) app.recruiterFeedback = extra.recruiterFeedback;
      if (extra.interviewResult) app.interviewResult = extra.interviewResult;
      
      // If student is selected, update their placement status in student pool
      if (status === 'Selected') {
        const student = this.getStudentById(app.studentId);
        if (student) {
          student.placementStatus = 'Placed';
        }
      }
      this.saveState();
      return app;
    }
    return null;
  }

  // === College Settings ===
  updateCollegeProfile(updates) {
    this.state.college = { ...this.state.college, ...updates };
    this.saveState();
  }

  addDepartment(dept) {
    this.state.college.departments.push(dept);
    this.saveState();
  }

  deleteDepartment(deptId) {
    this.state.college.departments = this.state.college.departments.filter(d => d.id !== deptId);
    this.saveState();
  }
}

// Instantiate global store
window.bridgeStore = new BridgeStore();
