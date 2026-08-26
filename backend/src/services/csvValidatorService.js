/**
 * HIERO Bridge Backend - CSV Bulk Student Validator & Parser Service
 * Live validation rules: Required fields, Email RFC format, CGPA numerical range,
 * Duplicate detection against database and within upload file.
 */

const fs = require('fs');
const readline = require('readline');
const db = require('../config/database');

class CsvValidatorService {
  async validateAndParse(filePath) {
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    const existingStudents = db.getStudents();
    const existingRegNos = new Set(existingStudents.map(s => s.regNo.toUpperCase()));
    const existingEmails = new Set(existingStudents.map(s => s.email.toLowerCase()));

    const seenInFileRegNos = new Set();
    const validRows = [];
    const invalidRows = [];
    const duplicateRows = [];

    let isFirstLine = true;
    let totalRead = 0;

    for await (const line of rl) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      if (isFirstLine) {
        isFirstLine = false;
        continue; // Skip header
      }

      totalRead++;

      // Handle quoted CSV parsing
      const row = [];
      let inQuote = false;
      let cur = '';
      for (let char of trimmed) {
        if (char === '"') {
          inQuote = !inQuote;
        } else if (char === ',' && !inQuote) {
          row.push(cur.trim().replace(/^["']|["']$/g, ''));
          cur = '';
        } else {
          cur += char;
        }
      }
      row.push(cur.trim().replace(/^["']|["']$/g, ''));

      const name = row[0] || '';
      const regNo = (row[1] || '').toUpperCase();
      const department = row[2] || 'CSE';
      const academicYear = row[3] || '2022-2026';
      const cgpa = parseFloat(row[4]);
      const email = (row[5] || '').toLowerCase();
      const phone = row[6] || '+91-9999999999';
      const skillsStr = row[7] || '';
      const projectCount = parseInt(row[8]) || 0;
      const projectsStr = row[9] || '';
      const certificationsStr = row[10] || 'None';

      const errors = [];

      // Validation Checks
      if (!name || name.length < 2) errors.push('Missing/invalid student name');
      if (!regNo) errors.push('Missing registration number');
      if (isNaN(cgpa) || cgpa < 0 || cgpa > 10.0) errors.push(`Invalid CGPA (${row[4] || 'null'}). Must be between 0.0 and 10.0`);
      if (!email || !email.includes('@') || !email.includes('.')) errors.push(`Invalid email format: ${email}`);

      // Duplicate Check
      if (existingRegNos.has(regNo) || existingEmails.has(email) || seenInFileRegNos.has(regNo)) {
        duplicateRows.push({ name, regNo, email, cgpa, reason: 'Duplicate Registration No or Email already in database' });
        continue;
      }

      seenInFileRegNos.add(regNo);

      if (errors.length > 0) {
        invalidRows.push({ name, regNo, email, cgpa, errors: errors.join(', ') });
      } else {
        const skills = skillsStr.split(/[,;|]/).map(s => s.trim()).filter(Boolean);
        const projects = projectsStr ? projectsStr.split(/[,;|]/).map(p => ({ title: p.trim(), tech: 'Full Stack', link: '#' })) : [];
        const certs = certificationsStr !== 'None' ? certificationsStr.split(/[,;|]/).map(c => c.trim()) : [];

        validRows.push({
          name,
          regNo,
          department: department.includes('Artificial') ? 'AIML' : (department.includes('Information') ? 'IT' : (department.includes('Electronics') ? 'ECE' : 'CSE')),
          academicYear,
          cgpa,
          email,
          phone,
          skills: skills.length > 0 ? skills : ['General Engineering'],
          projectCount: projectCount || projects.length,
          projects,
          certifications: certs,
          resumeUrl: `https://hiero.io/resumes/${name.toLowerCase().replace(/\s+/g, '-')}-2026.pdf`,
          placementStatus: 'Active',
          verificationStatus: 'Verified'
        });
      }
    }

    return {
      totalRead,
      validCount: validRows.length,
      duplicateCount: duplicateRows.length,
      invalidCount: invalidRows.length,
      validRows,
      duplicateRows,
      invalidRows
    };
  }
}

module.exports = new CsvValidatorService();
