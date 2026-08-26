# HIERO Bridge — Academia–Industry Placement Portal

HIERO Bridge is the academia-facing gateway within the unified **HIERO Ecosystem**:

$$\text{Industry Recruiters (HIERO Connect)} \longrightarrow \text{HIERO Bridge} \longrightarrow \text{Final-Year Students} \longrightarrow \text{Placement Coordinator} \longrightarrow \text{HIERO Connect}$$

---

## 🌟 Key Functional Pillars (Implemented 30/30 Requirements)

1. **College Administrator Console (Req 3.1, 4, 5, 6)**
   - **Institution Profile & Department Management**: Manage institution details, tier, accreditation, departments, and active final-year batches.
   - **Bulk Student CSV/JSON Import Engine**: Robust validation engine detecting duplicates, malformed emails, and invalid CGPA ranges with a real-time summary report.
   - **Verified Final-Year Student Database**: Institutional verification tags, student status tracking (`Active`, `Placed`, `Ineligible`).

2. **Placement Operations Hub (Req 3.2, 8, 9, 10, 13, 14, 15, 16, 17, 23)**
   - **Opportunity Lifecycle Kanban**: Tracks states (`NEW` → `REVIEWED` → `SHARED_WITH_STUDENTS` → `APPLICATIONS_OPEN` → `SHORTLISTING` → `SENT_TO_RECRUITER` → `INTERVIEW` → `SELECTION` → `CLOSED`).
   - **Student Application Link Generator**: Generates shareable, parameter-bound application links with QR code preview.
   - **Multi-Criteria & Recruiter-Expectation Candidate Filtering**: Filters candidate pool by CGPA slider, departments, required skills, project count, and match percentage to move from *"Who applied?"* to *"Who actually fits?"*.
   - **Candidate Shortlist & Recruiter Dispatch**: Review candidate packages and transmit them directly to HIERO Connect.

3. **Final-Year Student Gateway (Req 3.3, 11, 12, 22, 26)**
   - **Pre-filled 5-Step Application Wizard**: Auto-populates locked collegiate records, enables resume attachment, and submits applications with verification receipts.
   - **Eligibility Verification Rule Engine**: Automatically evaluates eligibility before permitting student applications.
   - **Live Application Timeline Tracker**: 6-stage tracker showing real-time feedback from college coordinators and industry recruiters.

4. **AI Voice Mock Interview & Continuous Practice Loop (Req 19, 20, 21)**
   - **Interactive AI Voice Interview Simulator**: Animated audio waveforms, speech synthesis, and real-time transcription.
   - **5-Pillar Scorecard & Explanation**: Granular scoring across Technical Knowledge, Communication, Problem Solving, Confidence, and Role-specific fit with explicit scoring rationales.
   - **Continuous Practice Loop**: For candidates needing improvement, provides weak-area diagnosis and targeted AI mock practice drills.

5. **HIERO Connect Ecosystem Sync Simulator (Req 7, 18, 27, 28, 29, 30)**
   - Simulates recruiters publishing opportunities, reviewing shortlists, and updating candidate status (`Interview`, `Offer/Selected`, `Rejected`).

---

## 🚀 How to Run Locally

You can open `index.html` directly in any modern browser, or serve it via local HTTP server on port **2410**:

```bash
# Using Node.js npx serve on port 2410
npx -y serve . -p 2410
```

Open `http://localhost:2410` in your web browser.

---

## 📁 File Structure

```
Bidge-Portal/
├── index.html                   # Main application entry & semantic layout
├── css/
│   └── style.css                # Dark glassmorphic design system
├── js/
│   ├── state.js                 # Central state store & LocalStorage persistence
│   ├── admin.js                 # College admin & student import validation
│   ├── coordinator.js           # Placement coordinator & candidate screening
│   ├── student.js               # Student portal & application wizard
│   ├── interview.js             # AI Voice mock interview & 5-pillar scorecard
│   ├── connect-sync.js          # HIERO Connect simulator & recruiter feedback
│   └── app.js                   # Application coordinator & routing
├── sample-students.csv          # Ready-to-use CSV file for import testing
└── README.md                    # System documentation
```
