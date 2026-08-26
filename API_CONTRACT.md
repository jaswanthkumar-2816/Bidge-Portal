# HIERO Bridge — REST API Contract & Integration Specification

**Backend Base URL**: `http://localhost:5050/api`  
**Frontend URL**: `http://localhost:2410/academic-portal.html`

---

## 1. Authentication & Session

### `POST /api/auth/login`
- **Body**: `{ "role": "admin" | "coordinator" | "student", "email": "string" }`
- **Response**:
```json
{
  "success": true,
  "token": "jwt_token_string",
  "user": {
    "role": "coordinator",
    "name": "Dr. Ramesh Kulkarni (TPO)",
    "email": "ramesh.tpo@college.edu",
    "institution": "National Institute of Technology, Warangal"
  }
}
```

---

## 2. College Administration (`/api/admin`)

### `GET /api/admin/college`
- **Description**: Returns college profile, departments, and active batches.

### `PUT /api/admin/college`
- **Body**: `{ "name": "string", "code": "string", "location": "string", "tier": "string", "currentBatch": "string" }`

### `POST /api/admin/departments`
- **Body**: `{ "id": "AIML", "name": "Artificial Intelligence & Machine Learning" }`

### `GET /api/admin/students`
- **Query Params**: `?dept=CSE&status=Active&search=Rahul`
- **Response**: `{ "success": true, "count": 20, "students": [...] }`

### `POST /api/admin/students/bulk-import`
- **Content-Type**: `multipart/form-data` (`file`: CSV file)
- **Response**:
```json
{
  "success": true,
  "report": {
    "totalRead": 10,
    "validCount": 8,
    "duplicateCount": 1,
    "invalidCount": 1,
    "validRows": [...],
    "duplicateRows": [...],
    "invalidRows": [...]
  }
}
```

### `POST /api/admin/students/confirm-import`
- **Body**: `{ "students": [ { "name": "...", "regNo": "...", "cgpa": 8.5, ... } ] }`

---

## 3. Placement Operations Hub (`/api/coordinator`)

### `GET /api/coordinator/metrics`
- **Response**:
```json
{
  "success": true,
  "metrics": {
    "totalStudents": 20,
    "activeJobs": 3,
    "totalApplicants": 4,
    "shortlisted": 2,
    "interviews": 1,
    "selected": 0
  }
}
```

### `GET /api/coordinator/opportunities`
- **Query Params**: `?state=SHORTLISTING&search=Databricks`

### `POST /api/coordinator/opportunities/:id/screen`
- **Body**: `{ "minCGPA": 8.0, "depts": ["CSE", "AIML"], "requiredSkills": ["Python", "SQL"], "minProjects": 2 }`
- **Response**: Returns ranked candidate list with `fitScore` (0-100%), matched skills, and application status.

### `POST /api/coordinator/opportunities/:id/shortlist`
- **Body**: `{ "studentIds": ["STU-001", "STU-006"], "notes": "Coordinator endorsement" }`

---

## 4. Final-Year Student Gateway (`/api/student`)

### `GET /api/student/profile/:id`
- **Response**: Returns student profile, locked verified credentials, and submitted applications.

### `GET /api/student/drives?studentId=STU-001`
- **Response**: Returns campus drives with real-time computed `isEligible` and `eligibilityReason`.

### `POST /api/student/apply`
- **Content-Type**: `multipart/form-data`
- **Fields**: `oppId`, `studentId`, `notes`, `resume` (PDF file)

### `GET /api/student/applications/:studentId`
- **Response**: 6-stage application timeline progress.

---

## 5. AI Voice Mock Interview (`/api/interview`)

### `GET /api/interview/questions/:oppId`
- **Response**: 3 domain-tailored technical & situational questions.

### `POST /api/interview/evaluate`
- **Body**: `{ "appId": "APP-2026-001", "oppId": "OPP-HC-2026-01", "answers": [...] }`
- **Response**: 5-pillar scorecard (`overallScore`, `technicalScore`, `communicationScore`, `problemSolvingScore`, `confidenceScore`, `roleKnowledgeScore`, `weakAreas`, `practicePlan`).

---

## 6. HIERO Connect Cross-Portal Sync (`/api/connect`)

### `POST /api/connect/opportunities/publish`
- **Body**: `{ "company": "Nvidia", "title": "CUDA Systems Engineer", "ctc": "₹32,00,000 PA", "minCGPA": 8.5, "requiredSkills": ["C++", "CUDA", "Linux"] }`

### `GET /api/connect/shortlists`
- **Response**: Recruiter candidate inbox transmitted from college placement coordinators.

### `PATCH /api/connect/applications/:id/status`
- **Body**: `{ "status": "Interview" | "Selected" | "Rejected", "notes": "..." }`
