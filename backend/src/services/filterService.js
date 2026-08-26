/**
 * HIERO Bridge Backend - Candidate Screening & Recruiter-Expectation Matching Service
 * Calculates match percentage score (0-100%) to answer "Who actually fits this opportunity?"
 */

const db = require('../config/database');

class FilterService {
  screenCandidates(oppId, filters = {}) {
    const opp = db.getOpportunityById(oppId);
    if (!opp) throw new Error('Opportunity not found');

    const allStudents = db.getStudents();
    const apps = db.getApplications().filter(a => a.oppId === oppId);

    const minCGPA = filters.minCGPA !== undefined ? parseFloat(filters.minCGPA) : opp.minCGPA;
    const depts = filters.depts && filters.depts.length > 0 ? filters.depts : opp.eligibleDepts;
    const reqSkills = filters.requiredSkills || opp.requiredSkills || [];
    const minProjects = filters.minProjects !== undefined ? parseInt(filters.minProjects) : (opp.minProjects || 0);

    const results = allStudents.map(student => {
      const app = apps.find(a => a.studentId === student.id);
      const isApplied = !!app;

      // Fit score computation
      let score = 0;
      // 1. CGPA score (30%)
      if (student.cgpa >= opp.minCGPA) score += 30;
      else if (student.cgpa >= opp.minCGPA - 0.5) score += 15;

      // 2. Department eligibility (15%)
      if (opp.eligibleDepts.includes(student.department)) score += 15;

      // 3. Required skills match (40%)
      const reqSkillsMatch = reqSkills.filter(req => 
        student.skills.some(sk => sk.toLowerCase().includes(req.toLowerCase()))
      );
      score += Math.round((reqSkillsMatch.length / (reqSkills.length || 1)) * 40);

      // 4. Project depth (15%)
      if ((student.projectCount || student.projects?.length || 0) >= (opp.minProjects || 1)) score += 15;

      const fitScore = Math.min(100, score);

      // Filter compliance
      const matchesFilter = 
        student.cgpa >= minCGPA &&
        (depts.length === 0 || depts.includes(student.department)) &&
        (student.projectCount || student.projects?.length || 0) >= minProjects;

      return {
        student,
        app,
        isApplied,
        fitScore,
        reqSkillsMatch,
        missingSkills: reqSkills.filter(req => !student.skills.some(sk => sk.toLowerCase().includes(req.toLowerCase()))),
        matchesFilter
      };
    });

    return {
      opportunity: opp,
      totalStudents: allStudents.length,
      applicantCount: apps.length,
      candidates: results
    };
  }
}

module.exports = new FilterService();
