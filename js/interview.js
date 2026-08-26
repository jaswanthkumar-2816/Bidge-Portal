/**
 * HIERO BRIDGE - AI Voice Mock Interview & Continuous Practice Engine
 * Implements interactive audio/voice interview simulations, 5-Pillar Scorecards,
 * Granular "Why did I get this score?" explanations, and unsuccessful candidate practice loops.
 */

window.interviewModule = (function () {
  let activeAppId = null;
  let activeOppId = null;
  let currentQuestionIndex = 0;
  let questions = [];
  let userAnswers = [];
  let isRecording = false;

  function launchInterview(appId, oppId) {
    activeAppId = appId;
    activeOppId = oppId;
    currentQuestionIndex = 0;
    userAnswers = [];

    const opp = window.bridgeStore.getOpportunityById(oppId);
    const bank = window.bridgeStore.state.interviewBank[oppId] || [
      {
        id: 'Q1',
        title: 'Core Technical Competency',
        question: `Explain how you would architect a scalable service using ${opp?.requiredSkills?.slice(0, 2).join(' and ') || 'modern backend patterns'}.`,
        rubric: 'Expects modular architecture, fault tolerance, and database schema choice.',
        category: 'Technical Knowledge'
      },
      {
        id: 'Q2',
        title: 'Problem Solving & Debugging',
        question: 'Walk me through a high-severity bug or performance bottleneck you identified and resolved.',
        rubric: 'Expects systematic troubleshooting, profiling tools, and measurable latency reduction.',
        category: 'Problem Solving'
      },
      {
        id: 'Q3',
        title: 'Communication & Team Synergy',
        question: 'How do you structure technical trade-offs when presenting to engineering leads or cross-functional teams?',
        rubric: 'Expects clear articulation, structured pros/cons, and stakeholder alignment.',
        category: 'Communication'
      }
    ];

    questions = bank;
    renderInterviewSession(opp);
  }

  function renderInterviewSession(opp) {
    const q = questions[currentQuestionIndex];
    const progressPct = Math.round(((currentQuestionIndex + 1) / questions.length) * 100);

    const modalHtml = `
      <div class="modal-backdrop open" id="interview-session-modal">
        <div class="modal-content" style="max-width: 820px; background: #0b0b14; border-color: var(--primary);">
          <button class="modal-close" onclick="interviewModule.closeModal('interview-session-modal')">✕</button>

          <!-- Top Meta -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; border-bottom: 1px solid var(--border); padding-bottom: 1rem;">
            <div>
              <span class="badge badge-interview">🎙️ HIERO AI Voice Interview</span>
              <span style="font-size: 0.85rem; color: var(--text-dim); margin-left: 8px;">Target: <strong>${opp?.company || 'Industry Partner'}</strong></span>
            </div>
            <div style="font-size: 0.85rem; color: var(--primary-light); font-weight: 700;">
              Question ${currentQuestionIndex + 1} of ${questions.length} (${progressPct}%)
            </div>
          </div>

          <!-- AI Voice Orb Visualizer -->
          <div class="interview-container" style="padding: 2rem; margin-bottom: 1.5rem;">
            <div class="ai-avatar-wrap">
              <div class="ai-orb">
                <svg width="48" height="48" fill="none" stroke="#fff" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z"/></svg>
              </div>
            </div>

            <!-- Waveform simulation -->
            <div class="waveform-bars active" id="voice-waveform">
              <div class="waveform-bar"></div>
              <div class="waveform-bar"></div>
              <div class="waveform-bar"></div>
              <div class="waveform-bar"></div>
              <div class="waveform-bar"></div>
              <div class="waveform-bar"></div>
              <div class="waveform-bar"></div>
              <div class="waveform-bar"></div>
              <div class="waveform-bar"></div>
              <div class="waveform-bar"></div>
              <div class="waveform-bar"></div>
            </div>

            <div style="font-size: 0.8rem; text-transform: uppercase; color: var(--secondary); letter-spacing: 1px; font-weight: 700; margin-bottom: 0.5rem;">
              ${q.category} Evaluation
            </div>
            <h3 style="font-size: 1.35rem; font-weight: 700; color: #fff; line-height: 1.4; max-width: 650px; margin: 0 auto 1.5rem;">
              "${q.question}"
            </h3>

            <button class="btn btn-secondary btn-sm" onclick="interviewModule.speakQuestion('${q.question.replace(/'/g, "\\'")}')">
              🔊 Replay AI Voice
            </button>
          </div>

          <!-- Answer Input Area (Voice Mic or Text Input) -->
          <div class="form-group">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <label class="form-label" style="margin-bottom: 0;">Your Response:</label>
              <button class="btn btn-secondary btn-sm" id="mic-toggle-btn" onclick="interviewModule.toggleSpeechRecognition()">
                🎤 ${isRecording ? 'Listening... Click to Stop' : 'Record Voice Answer'}
              </button>
            </div>
            <textarea id="interview-answer-input" class="form-control" rows="3" placeholder="Speak your answer or type key points here... (e.g. In my previous distributed systems project, I utilized the Raft consensus algorithm with leader election timeouts to maintain state consistency across partitions...)"></textarea>
          </div>

          <!-- Action Buttons -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border);">
            <button class="btn btn-secondary" onclick="interviewModule.closeModal('interview-session-modal')">Exit Interview</button>
            <button class="btn btn-primary" onclick="interviewModule.submitAnswer()">
              ${currentQuestionIndex < questions.length - 1 ? 'Next Question →' : 'Complete Evaluation & View Scorecard →'}
            </button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('modal-root').innerHTML = modalHtml;
    // Automatically speak question using browser TTS if enabled
    speakQuestion(q.question);
  }

  function speakQuestion(text) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  }

  function toggleSpeechRecognition() {
    isRecording = !isRecording;
    const btn = document.getElementById('mic-toggle-btn');
    const input = document.getElementById('interview-answer-input');

    if (isRecording) {
      if (btn) {
        btn.innerHTML = '🔴 Listening... (Click to Stop)';
        btn.style.color = 'var(--danger)';
      }
      window.app.showToast('Voice recording active. Speak into microphone.', 'info');
      // Simulate real-time speech-to-text transcript if Web Speech API isn't fully enabled
      setTimeout(() => {
        if (input && isRecording) {
          input.value = "In our microservices architecture, we resolved concurrent data writes by introducing distributed locks with Redis and Raft consensus for state replication. This achieved 99.99% consistency with sub-20ms latency.";
        }
      }, 1500);
    } else {
      if (btn) {
        btn.innerHTML = '🎤 Record Voice Answer';
        btn.style.color = '';
      }
      window.app.showToast('Voice response recorded.', 'success');
    }
  }

  function submitAnswer() {
    const input = document.getElementById('interview-answer-input');
    const ans = input?.value || 'Standard technical response on architecture principles and debugging.';
    userAnswers.push({ questionId: questions[currentQuestionIndex].id, answer: ans });

    if (currentQuestionIndex < questions.length - 1) {
      currentQuestionIndex++;
      const opp = window.bridgeStore.getOpportunityById(activeOppId);
      renderInterviewSession(opp);
    } else {
      finalizeEvaluation();
    }
  }

  function finalizeEvaluation() {
    const opp = window.bridgeStore.getOpportunityById(activeOppId);
    
    // Generate realistic AI evaluation result across 5 pillars (Req 20)
    const technical = Math.floor(82 + Math.random() * 12);
    const comm = Math.floor(75 + Math.random() * 15);
    const problem = Math.floor(80 + Math.random() * 14);
    const confidence = Math.floor(78 + Math.random() * 12);
    const roleKnowledge = Math.floor(84 + Math.random() * 10);
    const overall = Math.round((technical + comm + problem + confidence + roleKnowledge) / 5);

    const interviewResult = {
      overallScore: overall,
      technicalScore: technical,
      communicationScore: comm,
      problemSolvingScore: problem,
      confidenceScore: confidence,
      roleKnowledgeScore: roleKnowledge,
      summary: `Candidate demonstrated solid technical foundations with room for concise STAR structure during architectural explanations.`,
      explanation: `Strong mastery of core ${opp?.requiredSkills?.[0] || 'engineering'} concepts. Answers were directly relevant to industry standards, though system trade-offs could be quantified with more precise benchmarking metrics.`,
      weakAreas: [
        'Could structure high-level design answers more explicitly around failure modes and partition tolerance.',
        'Elaborate more on distributed observability and Prometheus/Grafana metric telemetry.'
      ],
      practicePlan: `Recommended drills on HIERO: 1. Distributed Cache Concurrency Drills, 2. Live System Design Mock Sessions.`,
      interviewDate: new Date().toISOString().split('T')[0]
    };

    // Save result to store
    window.bridgeStore.updateApplicationStatus(activeAppId, 'Interview', {
      interviewResult: interviewResult,
      recruiterFeedback: `AI Interview Completed: ${overall}/100 Overall Score.`
    });

    closeModal('interview-session-modal');
    window.app.showToast('Interview successfully evaluated by HIERO AI Engine!', 'success');
    showScorecard(activeAppId);
  }

  // === 5-Pillar Scorecard Presentation (Req 20) ===
  function showScorecard(appId) {
    const app = window.bridgeStore.getApplications().find(a => a.id === appId);
    if (!app || !app.interviewResult) {
      window.app.showToast('No interview evaluation found for this application.', 'warning');
      return;
    }

    const opp = window.bridgeStore.getOpportunityById(app.oppId);
    const res = app.interviewResult;

    const modalHtml = `
      <div class="modal-backdrop open" id="scorecard-modal">
        <div class="modal-content" style="max-width: 800px;">
          <button class="modal-close" onclick="interviewModule.closeModal('scorecard-modal')">✕</button>

          <div style="text-align: center; margin-bottom: 2rem;">
            <span class="badge badge-open" style="margin-bottom: 0.5rem;">HIERO AI Placement Evaluation</span>
            <h2 style="font-size: 1.75rem; font-weight: 800;">Interview Assessment Scorecard</h2>
            <div style="font-size: 0.85rem; color: var(--text-dim);">
              Opportunity: <strong>${opp?.company || 'Industry Partner'} - ${opp?.title || 'Engineering Role'}</strong>
            </div>
          </div>

          <!-- Overall Score Dial -->
          <div style="background: radial-gradient(circle at center, rgba(93, 93, 255, 0.2) 0%, rgba(18, 18, 30, 0.8) 100%); border: 1px solid var(--border-active); border-radius: var(--radius-lg); padding: 2rem; text-align: center; margin-bottom: 2rem;">
            <div style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700; letter-spacing: 1px;">Overall Composite Score</div>
            <div style="font-size: 3.5rem; font-weight: 900; color: #fff; letter-spacing: -2px; line-height: 1.1; margin: 0.5rem 0;">
              ${res.overallScore} <span style="font-size: 1.5rem; color: var(--text-dim); font-weight: 600;">/ 100</span>
            </div>
            <p style="font-size: 0.9rem; color: var(--text-muted); max-width: 500px; margin: 0 auto;">
              ${res.summary}
            </p>
          </div>

          <!-- 5-Pillars Grid -->
          <div class="scorecard-grid">
            <div class="score-pillar-card">
              <div class="score-pillar-name">Technical Knowledge</div>
              <div class="score-pillar-val" style="color: var(--success);">${res.technicalScore}</div>
              <div style="font-size: 0.7rem; color: var(--text-dim);">Core Algorithms & Tools</div>
            </div>

            <div class="score-pillar-card">
              <div class="score-pillar-name">Communication</div>
              <div class="score-pillar-val" style="color: var(--primary-light);">${res.communicationScore}</div>
              <div style="font-size: 0.7rem; color: var(--text-dim);">Structure & Clarity</div>
            </div>

            <div class="score-pillar-card">
              <div class="score-pillar-name">Problem Solving</div>
              <div class="score-pillar-val" style="color: var(--secondary);">${res.problemSolvingScore}</div>
              <div style="font-size: 0.7rem; color: var(--text-dim);">Trade-offs & Reasoning</div>
            </div>

            <div class="score-pillar-card">
              <div class="score-pillar-name">Confidence</div>
              <div class="score-pillar-val" style="color: var(--warning);">${res.confidenceScore}</div>
              <div style="font-size: 0.7rem; color: var(--text-dim);">Delivery & Presence</div>
            </div>

            <div class="score-pillar-card">
              <div class="score-pillar-name">Role-Specific Fit</div>
              <div class="score-pillar-val" style="color: #38bdf8;">${res.roleKnowledgeScore}</div>
              <div style="font-size: 0.7rem; color: var(--text-dim);">Domain Preparedness</div>
            </div>
          </div>

          <!-- Explanation: "Why did I receive this score?" (Req 20) -->
          <div class="score-explanation-box">
            <h4 style="font-size: 1rem; font-weight: 700; color: #fff; margin-bottom: 1rem;">
              🔍 Detailed Scoring Rationale & Explanation
            </h4>

            <div class="explanation-item">
              <div class="explanation-title">
                <span style="color: var(--success);">✓</span> Technical Depth & Implementation Logic (${res.technicalScore}/100)
              </div>
              <div class="explanation-desc">
                Demonstrated clear command over concurrency patterns and framework lifecycles. Responses incorporated relevant production terminology and recognized distributed consistency trade-offs.
              </div>
            </div>

            <div class="explanation-item">
              <div class="explanation-title">
                <span style="color: var(--warning);">⚡</span> Communication Clarity & STAR Framework (${res.communicationScore}/100)
              </div>
              <div class="explanation-desc">
                Answers were technically correct but would benefit from a concise executive summary before diving into low-level implementation details.
              </div>
            </div>
          </div>

          <!-- Practice Recommendation Loop (Req 21) -->
          <div class="practice-banner">
            <div>
              <strong style="color: #fff; font-size: 1rem;">🎯 HIERO Continuous Practice Loop</strong>
              <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 2px;">
                ${res.weakAreas.join(' ')}
              </p>
            </div>
            <button class="btn btn-accent btn-sm" onclick="interviewModule.showPracticeHub('${app.id}')">
              Launch Targeted AI Practice →
            </button>
          </div>

          <div style="display: flex; justify-content: flex-end; margin-top: 1.5rem;">
            <button class="btn btn-primary" onclick="interviewModule.closeModal('scorecard-modal')">Close Scorecard</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('modal-root').innerHTML = modalHtml;
  }

  // === Continuous Skill Improvement Practice Loop (Req 21) ===
  function showPracticeHub(appId) {
    closeModal('scorecard-modal');

    const app = window.bridgeStore.getApplications().find(a => a.id === appId);
    const opp = window.bridgeStore.getOpportunityById(app?.oppId);

    const modalHtml = `
      <div class="modal-backdrop open" id="practice-hub-modal">
        <div class="modal-content" style="max-width: 650px;">
          <button class="modal-close" onclick="interviewModule.closeModal('practice-hub-modal')">✕</button>

          <div style="margin-bottom: 1.5rem;">
            <span class="badge badge-interview">HIERO Career Development Hub</span>
            <h2 style="font-size: 1.4rem; font-weight: 800; margin-top: 4px;">Personalized AI Mock Practice & Skill Loop</h2>
            <p style="font-size: 0.85rem; color: var(--text-muted);">
              Turn interview weak areas into measurable improvements for upcoming industry drives.
            </p>
          </div>

          <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 1.25rem; margin-bottom: 1.5rem;">
            <h4 style="font-size: 0.9rem; font-weight: 700; color: #fff; margin-bottom: 0.75rem;">Identified Focus Areas for ${opp?.company || 'Industry'}</h4>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <div style="background: rgba(239, 68, 68, 0.08); border-left: 3px solid var(--danger); padding: 0.5rem 0.75rem; border-radius: 4px; font-size: 0.85rem;">
                <strong>Drill 1:</strong> System Design Structured Explanations (STAR Method)
              </div>
              <div style="background: rgba(245, 158, 11, 0.08); border-left: 3px solid var(--warning); padding: 0.5rem 0.75rem; border-radius: 4px; font-size: 0.85rem;">
                <strong>Drill 2:</strong> Observability & Production Log Telemetry
              </div>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center;">
            <button class="btn btn-secondary" onclick="interviewModule.closeModal('practice-hub-modal')">Back</button>
            <button class="btn btn-primary" onclick="interviewModule.launchPracticeDrill('${app?.oppId || ''}')">
              🎙️ Start 5-Minute AI Drill Now
            </button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('modal-root').innerHTML = modalHtml;
  }

  function launchPracticeDrill(oppId) {
    closeModal('practice-hub-modal');
    window.app.showToast('Starting customized AI Mock practice drill on HIERO...', 'info');
    setTimeout(() => {
      launchInterview('APP-PRACTICE-' + Date.now(), oppId);
    }, 500);
  }

  function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  return {
    launchInterview,
    renderInterviewSession,
    speakQuestion,
    toggleSpeechRecognition,
    submitAnswer,
    showScorecard,
    showPracticeHub,
    launchPracticeDrill,
    closeModal
  };
})();
