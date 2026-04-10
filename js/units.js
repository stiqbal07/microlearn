/* units.js — Subject unit definitions and question filtering
   ─────────────────────────────────────────────────────────
   Units are defined per subject. Questions are mapped to units
   by topic name, so new questions added with the same topic
   automatically fall into the right unit.

   Units with no matching questions show as "Coming soon" (locked).
*/

'use strict';

const SUBJECT_UNITS = {

  algebra2: [
    { id:'alg_u1', name:'Quadratic Functions',         icon:'📐', topics:['Quadratic Functions'] },
    { id:'alg_u2', name:'Polynomials',                 icon:'🔢', topics:['Polynomials'] },
    { id:'alg_u3', name:'Exponential & Logarithmic',   icon:'📈', topics:['Exponential Functions','Logarithms'] },
    { id:'alg_u4', name:'Sequences & Series',          icon:'🔄', topics:['Sequences & Series'] },
    { id:'alg_u5', name:'Conic Sections',              icon:'⭕', topics:['Conic Sections'] },
    { id:'alg_u6', name:'Functions & Rational Exprs',  icon:'⚙️', topics:['Functions','Rational Expressions','Radical Functions','Absolute Value'] },
    { id:'alg_u7', name:'Statistics & Probability',    icon:'📊', topics:['Statistics','Probability'] },
    { id:'alg_u8', name:'Systems of Equations',        icon:'🔀', topics:['Systems of Equations','Systems of Inequalities'] },
    { id:'alg_u9', name:'Complex Numbers',             icon:'🔮', topics:['Complex Numbers'] },
    { id:'alg_u10', name:'Trigonometry',               icon:'📏', topics:['Trigonometry'] },
  ],

  biology: [
    { id:'bio_u1', name:'Cell Structure & Function',   icon:'🔬', topics:['Cell Structure'] },
    { id:'bio_u2', name:'Biochemistry & Energy',       icon:'⚡', topics:['Photosynthesis','Cellular Respiration','Biochemistry'] },
    { id:'bio_u3', name:'Homeostasis',                 icon:'⚖️', topics:['Cellular Transport','Feedback Loops','Ecosystem Homeostasis','Climate & Carbon Cycle'] },
    { id:'bio_u3g', name:'Genetics & DNA',             icon:'🧬', topics:['Genetics','DNA & Proteins'] },
    { id:'bio_u4', name:'Cell Division & Cancer',      icon:'🦠', topics:['Cell Division','Cell Division & Cancer','Cancer Biology','The Cell Cycle','Mitosis','Meiosis','DNA Damage & Repair','Tumor Suppressors & Oncogenes','Apoptosis'] },
    { id:'bio_u5', name:'Evolution & Ecology',         icon:'🌿', topics:['Evolution','Ecology','Human Systems'] },
    { id:'bio_u6', name:'Human Body Systems',          icon:'🫀', topics:['Nervous System','Circulatory System','Immune System','Respiratory System'], locked:true },
  ],

  english: [
    { id:'eng_u1', name:'Literary Devices',            icon:'✍️', topics:['Literary Devices'] },
    { id:'eng_u2', name:'Literary Analysis',           icon:'📖', topics:['Literary Analysis','Literary Signposts'] },
    { id:'eng_u3', name:'Shakespeare & Poetry',        icon:'🎭', topics:['Shakespeare','Poetry'] },
    { id:'eng_u4', name:'Grammar & Vocabulary',        icon:'📝', topics:['Grammar','Vocabulary'] },
    { id:'eng_u5', name:'Argument & Rhetoric',         icon:'💬', topics:['Argument & Rhetoric'] },
    { id:'eng_u6', name:'Script Writing & Signposts',  icon:'🎬', topics:['Script Writing','Literary Signposts'] },
  ],

  apCSP: [
    { id:'csp_u1', name:'Binary & Data',               icon:'💾', topics:['Binary & Data'] },
    { id:'csp_u2', name:'Algorithms & Programming',    icon:'⌨️', topics:['Algorithms','Programming'] },
    { id:'csp_u3', name:'Abstraction & Development',   icon:'🧩', topics:['Abstraction','Creative Development'] },
    { id:'csp_u4', name:'Data & Analysis',             icon:'📊', topics:['Data & Analysis'] },
    { id:'csp_u5', name:'Internet, Networks & Impact', icon:'🌐', topics:['Internet & Networks','Cybersecurity','Global Impact'] },
  ],

  spanish2: [
    { id:'esp_u1', name:'Present Tense & Ser/Estar',   icon:'🗣️', topics:['Present Tense','Ser vs. Estar'] },
    { id:'esp_u2', name:'Preterite Tense',             icon:'⏪', topics:['Preterite Tense'] },
    { id:'esp_u3', name:'Imperfect & Subjunctive',     icon:'📚', topics:['Imperfect Tense','Subjunctive Intro'] },
    { id:'esp_u4', name:'Pronouns & Reflexive Verbs',  icon:'🔤', topics:['Object Pronouns','Reflexive Verbs','Daily Routines'] },
    { id:'esp_u5', name:'Vocabulary & Culture',        icon:'🌎', topics:['Vocabulary','Culture','Daily Routines'] },
    { id:'esp_u6', name:'Daily Routines (2.1)',        icon:'🌅', topics:['Daily Routines'] },
  ],
};

/* Returns all questions for a specific unit */
function getUnitQuestions(subjectKey, unitId) {
  const units = SUBJECT_UNITS[subjectKey] || [];
  const unit  = units.find(u => u.id === unitId);
  if (!unit || !unit.topics || unit.topics.length === 0) return [];
  const qs = (QUESTION_BANK && QUESTION_BANK[subjectKey]) || [];
  return qs.filter(q => unit.topics.includes(q.topic));
}

/* Returns question count for a unit (0 = will display as locked) */
function getUnitQuestionCount(subjectKey, unitId) {
  return getUnitQuestions(subjectKey, unitId).length;
}
