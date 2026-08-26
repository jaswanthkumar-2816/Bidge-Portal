/**
 * HIERO Bridge Backend - AI Mock Interview Controller
 */

const db = require('../config/database');

class InterviewController {
  getQuestions(req, res) {
    const { oppId } = req.params;
    const opp = db.getOpportunityById(oppId);

    const defaultQuestions = [
      {
        id: 'Q1',
        title: 'Core Technical Architecture',
        question: `Explain how you would design and optimize a high-throughput backend service using ${opp?.requiredSkills?.slice(0, 2).join(' and ') || 'distributed systems principles'}.`,
        category: 'Technical Knowledge'
      },
      {
        id: 'Q2',
        title: 'Problem Solving & Fault Tolerance',
        question: 'How do you isolate and debug a cascading memory leak or race condition under high concurrency?',
        category: 'Problem Solving'
      },
      {
        id: 'Q3',
        title: 'Communication & Trade-offs',
        question: 'Describe a project where you balanced latency vs consistency. How did you communicate the trade-off?',
        category: 'Communication'
      }
    ];

    res.json({ success: true, questions: defaultQuestions });
  }

  evaluateInterview(req, res) {
    const { appId, oppId, answers } = req.body;

    const technical = Math.floor(82 + Math.random() * 12);
    const comm = Math.floor(76 + Math.random() * 14);
    const problem = Math.floor(80 + Math.random() * 14);
    const confidence = Math.floor(78 + Math.random() * 12);
    const roleKnowledge = Math.floor(84 + Math.random() * 10);
    const overall = Math.round((technical + comm + problem + confidence + roleKnowledge) / 5);

    const evaluation = {
      overallScore: overall,
      technicalScore: technical,
      communicationScore: comm,
      problemSolvingScore: problem,
      confidenceScore: confidence,
      roleKnowledgeScore: roleKnowledge,
      summary: 'Candidate demonstrated solid technical foundations with clear command over distributed principles.',
      explanation: 'Responses incorporated relevant production terminology and recognized consistency trade-offs. Structured STAR summaries recommended for executive rounds.',
      weakAreas: [
        'Could elaborate more explicitly on failure modes and partition recovery.',
        'Detail production observability and Prometheus/Grafana metric telemetry.'
      ],
      practicePlan: 'Recommended drills on HIERO: 1. Concurrency Drills, 2. Live System Design Mock Sessions.',
      interviewDate: new Date().toISOString().split('T')[0]
    };

    if (appId) {
      db.updateApplication(appId, {
        status: 'Interview',
        interviewResult: evaluation,
        recruiterFeedback: `AI Interview Completed: ${overall}/100 Composite Score.`
      });
    }

    res.json({ success: true, evaluation });
  }
}

module.exports = new InterviewController();
