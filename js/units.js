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

  chemHonors: [
    { id:'chem_u1', name:'Matter & Measurement',      icon:'⚗️',  topics:['Matter & Properties'] },
    { id:'chem_u2', name:'Atomic Structure',           icon:'⚛️',  topics:['Atomic Structure'] },
    { id:'chem_u3', name:'The Periodic Table',         icon:'🧪',  topics:['Periodic Table'] },
    { id:'chem_u4', name:'Chemical Reactions',         icon:'🔥',  topics:['Chemical Reactions'] },
  ],

  apPhysics: [
    { id:'phys_u1', name:'Measurement & Vectors',      icon:'📏',  topics:['Measurement & Vectors'] },
    { id:'phys_u2', name:'Kinematics',                 icon:'🏃',  topics:['Kinematics'] },
    { id:'phys_u3', name:"Newton's Laws",              icon:'🍎',  topics:["Newton's Laws"] },
    { id:'phys_u4', name:'Energy & Work',              icon:'⚡',  topics:['Energy & Work'] },
  ],

  apPrecalc: [
    { id:'pc_u1', name:'Functions',                    icon:'📊',  topics:['Functions'] },
    { id:'pc_u2', name:'Transformations',              icon:'🔀',  topics:['Transformations'] },
    { id:'pc_u3', name:'Trigonometry',                 icon:'📐',  topics:['Trigonometry'] },
    { id:'pc_u4', name:'Exponential & Logarithmic',    icon:'📈',  topics:['Exponential & Log Review'] },
    { id:'pc_u5', name:'Polynomials & Rational',       icon:'〰️',  topics:['Polynomial & Rational'] },
  ],

  apWorldHist: [
    { id:'wh_u1', name:'Historical Thinking',          icon:'🧠',  topics:['Historical Thinking'] },
    { id:'wh_u2', name:'Ancient Civilizations',        icon:'🏛️',  topics:['Ancient Civilizations'] },
    { id:'wh_u3', name:'World Religions',              icon:'🕊️',  topics:['World Religions'] },
    { id:'wh_u4', name:'Trade & Exchange',             icon:'🗺️',  topics:['Trade & Exchange'] },
  ],

  algebra1: [
    { id:'alg1_u1', name:'Linear Equations',           icon:'⚖️',  topics:['Linear Equations','Linear Inequalities'] },
    { id:'alg1_u2', name:'Slope & Linear Functions',   icon:'📉',  topics:['Slope & Linear Functions'] },
    { id:'alg1_u3', name:'Systems of Equations',       icon:'🔀',  topics:['Systems of Equations'] },
    { id:'alg1_u4', name:'Polynomials & Factoring',    icon:'🔢',  topics:['Polynomials','Factoring'] },
    { id:'alg1_u5', name:'Quadratics',                 icon:'∩',   topics:['Quadratics'] },
    { id:'alg1_u6', name:'Exponents & Radicals',       icon:'⚡',  topics:['Exponents & Radicals'] },
  ],

  geometry: [
    { id:'geo_u1', name:'Angles & Lines',              icon:'📏',  topics:['Angles & Lines'] },
    { id:'geo_u2', name:'Triangles',                   icon:'🔺',  topics:['Triangles'] },
    { id:'geo_u3', name:'Right Triangles & Trig',      icon:'📐',  topics:['Right Triangles'] },
    { id:'geo_u4', name:'Quadrilaterals & Polygons',   icon:'🔷',  topics:['Quadrilaterals'] },
    { id:'geo_u5', name:'Circles',                     icon:'⭕',  topics:['Circles'] },
    { id:'geo_u6', name:'Area & Volume',               icon:'📦',  topics:['Area & Volume'] },
    { id:'geo_u7', name:'Transformations',             icon:'🔄',  topics:['Transformations'] },
    { id:'geo_u8', name:'Logic & Proofs',              icon:'🧩',  topics:['Logic & Proofs'] },
  ],

  spanish1: [
    { id:'sp1_u1', name:'Greetings & Expressions',     icon:'👋',  topics:['Greetings'] },
    { id:'sp1_u2', name:'Numbers & Time',              icon:'🕐',  topics:['Numbers & Time'] },
    { id:'sp1_u3', name:'Nouns, Articles & Adjectives',icon:'📝',  topics:['Nouns & Articles','Adjective Agreement'] },
    { id:'sp1_u4', name:'Present Tense',               icon:'🗣️', topics:['Present Tense -ar','Present Tense -er/-ir'] },
    { id:'sp1_u5', name:'Ser vs. Estar',               icon:'⚖️',  topics:['Ser vs. Estar Basics'] },
    { id:'sp1_u6', name:'Tener, Ir & Gustar',          icon:'🎯',  topics:['Common Irregular Verbs','Gustar'] },
    { id:'sp1_u7', name:'Question Words',              icon:'❓',  topics:['Question Words'] },
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
