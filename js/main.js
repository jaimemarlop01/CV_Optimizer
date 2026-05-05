const JAIME_DATA = {
  name: "Jaime Martínez López",
  role: "Desarrollador Web & Multiplataforma",
  email: "jaimemarlop01@gmail.com",
  phone: "+34 644 55 01 68",
  location: "Madrid, España",
  bio: "Profesional responsable, proactivo y orientado a resultados, con alta capacidad de aprendizaje y adaptación. Experiencia en distintos entornos de trabajo, aportando siempre compromiso y constancia.",
  skills: ["HTML", "CSS", "JavaScript", "PHP", "Java", "SQL", "C#", ".NET", "Front End", "Back End", "Multiplataforma", "Git", "REST APIs", "BBDD Relacionales"],
  experience: [{
    role: "Consultor Junior",
    company: "Desarrollo Web & Multiplataforma",
    period: "Enero 2023 — Actualidad",
    duration: "3 años, 4 meses",
    bullets: [
      "Mantengo y desarrollo proyectos de aplicaciones web y de escritorio, incorporando mejoras continuas en las soluciones existentes.",
      "Proporciono soporte técnico a los usuarios, gestionando y resolviendo incidencias de forma eficiente.",
      "Elaboro documentación técnica actualizada, garantizando su accesibilidad y alineación con los desarrollos realizados."
    ]
  }],
  education: [
    { year: "2021 — 2022", title: "Grado en Desarrollo de Aplicaciones Web", school: "IMF Smart Education" },
    { year: "2019 — 2020", title: "Grado en Desarrollo de Aplicaciones Multiplataforma", school: "IMF Smart Education" }
  ],
  languages: [
    { lang: "Español", level: "Nativo" },
    { lang: "Inglés", level: "Profesional" }
  ]
};

const GROQ_API_KEY = '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';

const LABELS = {
  es: {
    profile: "Perfil profesional", skills: "Habilidades técnicas",
    skillsNote: "↳ Skills destacadas en naranja coinciden con los requisitos de la oferta",
    experience: "Experiencia profesional", education: "Formación académica", languages: "Idiomas",
    expRole: "Consultor Junior",
    expCompany: "Desarrollo Web & Multiplataforma · Enero 2023 — Actualidad · 3 años, 4 meses",
    edu: [
      { year: "2021 — 2022", title: "Grado en Desarrollo de Aplicaciones Web", school: "IMF Smart Education" },
      { year: "2019 — 2020", title: "Grado en Desarrollo de Aplicaciones Multiplataforma", school: "IMF Smart Education" }
    ],
    langItems: [{ lang: "Español", level: "Nativo" }, { lang: "Inglés", level: "Profesional" }],
    skillsSec: "Habilidades relevantes", langSec: "Idioma", contactSec: "Contacto",
    expSec: "Experiencia de trabajo", eduSec: "Formación"
  },
  en: {
    profile: "Professional Profile", skills: "Technical Skills",
    skillsNote: "↳ Orange-highlighted skills match the job requirements",
    experience: "Work Experience", education: "Education", languages: "Languages",
    expRole: "Junior Consultant",
    expCompany: "Web & Cross-platform Development · January 2023 — Present · 3 years, 4 months",
    edu: [
      { year: "2021 — 2022", title: "Degree in Web Application Development", school: "IMF Smart Education" },
      { year: "2019 — 2020", title: "Degree in Cross-platform Application Development", school: "IMF Smart Education" }
    ],
    langItems: [{ lang: "Spanish", level: "Native" }, { lang: "English", level: "Professional" }],
    skillsSec: "Relevant Skills", langSec: "Languages", contactSec: "Contact",
    expSec: "Work Experience", eduSec: "Education"
  }
};

let currentMode = 'url';
let cvTextContent = '';
let lastCVData = null;

function switchTab(mode) {
  currentMode = mode;
  document.querySelectorAll('.tab').forEach((t, i) => {
    t.classList.toggle('active', (i === 0 && mode === 'url') || (i === 1 && mode === 'text'));
  });
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('panel-' + mode).classList.add('active');
}

async function generateCV() {
  const btn = document.getElementById('gen-btn');
  const spinner = document.getElementById('spinner');
  const btnText = document.getElementById('btn-text');
  const errorBox = document.getElementById('error-box');

  errorBox.style.display = 'none';

  let jobInput = '';
  if (currentMode === 'url') {
    jobInput = document.getElementById('job-url').value.trim();
    if (!jobInput) { showError('Por favor, introduce una URL de oferta de trabajo.'); return; }
    if (!jobInput.startsWith('http')) { showError('La URL debe comenzar con http:// o https://'); return; }
  } else {
    jobInput = document.getElementById('job-text').value.trim();
    if (!jobInput || jobInput.length < 50) { showError('Por favor, pega una descripción de oferta más completa (mínimo 50 caracteres).'); return; }
  }

  btn.disabled = true;
  spinner.style.display = 'block';
  btnText.textContent = 'Analizando oferta...';
  document.getElementById('output-wrap').style.display = 'none';

  const systemPrompt = `You are an expert HR consultant and CV optimizer. Your task is to analyze a job offer and generate a personalized CV for Jaime Martínez López, adapting his real profile to the specific requirements of the offer.

JAIME'S REAL DATA:
${JSON.stringify(JAIME_DATA, null, 2)}

INSTRUCTIONS:
1. Detect the language of the job offer (Spanish or English).
2. Generate ALL text fields in that same language.
3. Identify from the offer: required technologies, key responsibilities, company type, seniority level, important keywords.
4. Adapt Jaime's CV highlighting the most relevant skills and experiences for that specific offer.
5. Rewrite the profile/bio to directly connect with what the company is looking for.
6. Reorder or highlight skills by relevance to the offer.
7. Rewrite experience bullets using keywords from the offer where honestly applicable. Write bullets in present tense (first person: "I develop...", "Desarrollo...").
8. Do NOT invent experiences or skills Jaime does not have. Only adapt the presentation of what he already has.
9. If the offer asks for something Jaime does not have (e.g. React, Node.js), do not include it in the CV but mention it in the tip.

Respond ONLY with valid JSON, no markdown, no backticks, no explanations outside the JSON:
{
  "lang": "es" or "en" depending on the language of the job offer,
  "matchScore": number from 0 to 100 indicating how well Jaime's profile fits the offer,
  "matchingSkills": number of Jaime's skills that match the requirements,
  "keywordsIntegrated": number of keywords from the offer integrated into the CV,
  "adaptedBio": "professional profile paragraph adapted specifically for this offer (3-4 sentences, in the detected language)",
  "highlightedSkills": ["Jaime's skills ordered by relevance for this offer — use EXACTLY the same names as in his skills list: HTML, CSS, JavaScript, PHP, Java, SQL, C#, .NET, Front End, Back End, Multiplataforma, Git, REST APIs, BBDD Relacionales"],
  "keySkillsFromOffer": ["subset of highlightedSkills explicitly required by the offer — use EXACTLY the same names from the list above, no paraphrasing"],
  "adaptedBullets": ["bullet 1 rewritten in present tense", "bullet 2", "bullet 3"],
  "jobTitle": "job title detected in the offer",
  "company": "company name if present, otherwise 'Tech Company'",
  "tip": "specific advice of 2-3 sentences about what Jaime could add or improve for this offer, and what gaps exist between his profile and the requirements (in the detected language)",
  "adaptedRole": "most suitable job title for Jaime to present himself for this specific offer (in the detected language)",
  "integratedKeywords": ["list of specific keywords from the offer integrated into the adapted CV"]
}`;

  const userMessage = currentMode === 'url'
    ? `Analiza esta oferta de trabajo y genera el CV adaptado: ${jobInput}\n\nSi no puedes acceder a la URL, intenta inferir el tipo de puesto desde la URL e indica en el tip que sería mejor pegar el texto directamente. Aun así genera el mejor CV posible para un puesto de desarrollo web/multiplataforma.`
    : `Analiza esta oferta de trabajo y genera el CV adaptado:\n\n${jobInput}`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + GROQ_API_KEY
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 1500,
        temperature: 0.3,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user",   content: userMessage }
        ]
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || `Error de API: ${response.status}`);
    }

    const data = await response.json();
    let rawText = data.choices?.[0]?.message?.content || '';
    rawText = rawText.replace(/```json|```/g, '').trim();

    let result;
    try {
      result = JSON.parse(rawText);
    } catch(e) {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) result = JSON.parse(jsonMatch[0]);
      else throw new Error('No se pudo parsear la respuesta de la IA');
    }

    renderCV(result);

  } catch (err) {
    showError('Error al generar el CV: ' + err.message + '. Prueba con el modo texto pegando la descripción directamente.');
  } finally {
    btn.disabled = false;
    spinner.style.display = 'none';
    btnText.textContent = '⚡ Generar CV Personalizado';
  }
}

function renderCV(data) {
  lastCVData = data;

  const L = LABELS[data.lang === 'en' ? 'en' : 'es'];

  document.getElementById('score-match').textContent = (data.matchScore || 0) + '%';

  const matchingSkills = data.keySkillsFromOffer || [];
  document.getElementById('score-skills').textContent = matchingSkills.length || data.matchingSkills || '—';
  document.getElementById('skills-detail').textContent = matchingSkills.join(' · ');

  const integratedKeywords = data.integratedKeywords || [];
  document.getElementById('score-keywords').textContent = integratedKeywords.length || data.keywordsIntegrated || '—';
  document.getElementById('keywords-detail').textContent = integratedKeywords.join(' · ');

  const keySkillsSet = new Set(matchingSkills.map(s => s.toLowerCase()));

  const skillTags = (data.highlightedSkills || JAIME_DATA.skills).map(skill => {
    const isHighlight = keySkillsSet.has(skill.toLowerCase());
    return `<span class="cv-skill-tag ${isHighlight ? 'highlight' : ''}">${skill}</span>`;
  }).join('');

  const bulletItems = (data.adaptedBullets || JAIME_DATA.experience[0].bullets)
    .map(b => `<li>${b}</li>`).join('');

  const eduRows = L.edu.map(e => `
    <div class="cv-edu-row">
      <div class="cv-edu-year">${e.year}</div>
      <div>
        <div class="cv-edu-title">${e.title}</div>
        <div class="cv-edu-school">${e.school}</div>
      </div>
    </div>
  `).join('');

  const langText = L.langItems.map(l => `${l.lang} (${l.level})`).join(' · ');

  cvTextContent = `JAIME MARTÍNEZ LÓPEZ\n${data.adaptedRole || JAIME_DATA.role}\n${JAIME_DATA.email} · ${JAIME_DATA.phone} · ${JAIME_DATA.location}\n\n${L.profile.toUpperCase()}\n${data.adaptedBio || JAIME_DATA.bio}\n\n${L.experience.toUpperCase()}\n${L.expRole} — ${L.expCompany}\n${(data.adaptedBullets || []).map(b => '· ' + b).join('\n')}\n\n${L.education.toUpperCase()}\n${L.edu.map(e => `${e.year} — ${e.title} — ${e.school}`).join('\n')}\n\n${L.languages.toUpperCase()}\n${langText}`;

  document.getElementById('cv-output').innerHTML = `
    <div class="cv-name">Jaime<br><em>Martínez</em> López</div>
    <div class="cv-role-line">// ${data.adaptedRole || JAIME_DATA.role}</div>
    <div class="cv-contact">
      <div><span>✉</span>${JAIME_DATA.email}</div>
      <div><span>📞</span>${JAIME_DATA.phone}</div>
      <div><span>📍</span>${JAIME_DATA.location}</div>
    </div>

    <div class="cv-section-title">${L.profile}</div>
    <div class="cv-summary">${data.adaptedBio || JAIME_DATA.bio}</div>

    <div class="cv-section-title">${L.skills}</div>
    <div class="cv-skill-grid">${skillTags}</div>
    ${keySkillsSet.size > 0 ? `<div class="cv-skills-note" style="margin-top:10px;font-family:'DM Mono',monospace;font-size:11px;color:var(--muted);">${L.skillsNote}</div>` : ''}

    <div class="cv-section-title">${L.experience}</div>
    <div class="cv-exp-role">${L.expRole}</div>
    <div class="cv-exp-company">${L.expCompany}</div>
    <ul class="cv-bullets">${bulletItems}</ul>

    <div class="cv-section-title">${L.education}</div>
    ${eduRows}

    <div class="cv-section-title">${L.languages}</div>
    <div style="font-size:14px;color:#9a9aa8;">${langText}</div>
  `;

  if (data.tip) {
    document.getElementById('tip-text').textContent = data.tip;
    document.getElementById('tip-box').style.display = 'block';
  }

  document.getElementById('output-wrap').style.display = 'block';
  document.getElementById('output-wrap').scrollIntoView({ behavior: 'smooth' });
}

function showError(msg) {
  const box = document.getElementById('error-box');
  box.textContent = '⚠ ' + msg;
  box.style.display = 'block';
}

function copyCV() {
  navigator.clipboard.writeText(cvTextContent).then(() => {
    const btn = event.target;
    btn.textContent = '✓ Copiado';
    setTimeout(() => btn.textContent = '📋 Copiar CV', 2000);
  });
}

async function imgToBase64(url) {
  try {
    const resp = await fetch(url);
    if (!resp.ok) return null;
    const blob = await resp.blob();
    return await new Promise(resolve => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

async function printCV() {
  const photoBase64 = await imgToBase64('img/photo.png');
  const data = lastCVData || {};
  const L = LABELS[data.lang === 'en' ? 'en' : 'es'];

  const role    = data.adaptedRole  || JAIME_DATA.role;
  const bio     = data.adaptedBio   || JAIME_DATA.bio;
  const bullets = data.adaptedBullets || JAIME_DATA.experience[0].bullets;
  const skills  = (data.keySkillsFromOffer && data.keySkillsFromOffer.length > 0)
    ? data.keySkillsFromOffer
    : (data.highlightedSkills || JAIME_DATA.skills);

  const skillsHtml  = skills.map(s =>
    `<div class="item"><span class="bullet">•</span>${s}</div>`).join('');

  const langsHtml   = L.langItems.map(l =>
    `<div class="item"><span class="bullet">•</span>${l.lang} — ${l.level}</div>`).join('');

  const bulletsHtml = bullets.map(b =>
    `<div class="item"><span class="bullet">•</span>${b}</div>`).join('');

  const eduHtml = L.edu.map(e => `
    <div class="edu-block">
      <div class="edu-title">${e.title}</div>
      <div class="edu-school">${e.school}</div>
      <div class="edu-year">${e.year}</div>
    </div>`).join('');

  const photoTag = photoBase64
    ? `<img class="photo" src="${photoBase64}" alt="Foto">`
    : '';

  const win = window.open('', '_blank');
  win.document.write(`<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
<title>CV — Jaime Martínez López</title>
<style>
  @page { margin: 0; size: A4; }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'DM Sans', sans-serif;
    background: #0b0c0f;
    color: #e8e6e0;
    width: 210mm;
    min-height: 297mm;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* ── Cabecera ── */
  .header {
    background: #13151a;
    text-align: center;
    padding: 28px 40px 22px;
    border-top: 4px solid #f5a623;
  }
  .photo-wrap {
    display: inline-block;
    padding: 3px;
    background: linear-gradient(135deg, #f5a623, #e8522a);
    border-radius: 14px;
    margin-bottom: 14px;
  }
  .photo {
    width: 106px; height: 106px;
    border-radius: 11px;
    object-fit: cover;
    object-position: top center;
    display: block;
    background: #0b0c0f;
  }
  .name {
    font-family: 'DM Serif Display', serif;
    font-size: 26px;
    font-weight: 400;
    letter-spacing: .06em;
    text-transform: uppercase;
    color: #e8e6e0;
    margin-bottom: 4px;
    position: relative; z-index: 1;
  }
  .role-line {
    font-family: 'DM Mono', monospace;
    font-size: 11.5px;
    color: #9a9aa8;
    letter-spacing: .08em;
    margin-bottom: 14px;
    position: relative; z-index: 1;
  }
  .bio {
    font-size: 12px;
    color: #9a9aa8;
    line-height: 1.65;
    max-width: 500px;
    margin: 0 auto;
    position: relative; z-index: 1;
  }

  /* ── Cuerpo dos columnas ── */
  .body { display: flex; min-height: calc(297mm - 230px); }

  .col-left {
    width: 38%;
    background: #13151a;
    padding: 24px 22px;
    border-right: 1px solid #1e2129;
  }
  .col-right {
    width: 62%;
    background: #0b0c0f;
    padding: 24px 26px;
  }

  /* ── Secciones ── */
  .section { margin-bottom: 22px; }
  .sec-title {
    font-family: 'DM Mono', monospace;
    font-size: 9px;
    letter-spacing: .2em;
    text-transform: uppercase;
    color: #f5a623;
    border-bottom: 1px solid #1e2129;
    padding-bottom: 5px;
    margin-bottom: 11px;
  }

  /* ── Items lista ── */
  .item {
    font-size: 12px;
    color: #c8c6c0;
    line-height: 1.55;
    margin-bottom: 5px;
    display: flex;
    gap: 7px;
    align-items: flex-start;
  }
  .bullet { color: #f5a623; flex-shrink: 0; margin-top: 1px; }

  /* ── Contacto ── */
  .contact-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: 'DM Mono', monospace;
    font-size: 10.5px;
    color: #9a9aa8;
    margin-bottom: 6px;
  }
  .contact-icon { color: #f5a623; font-size: 13px; }

  /* ── Experiencia ── */
  .exp-role {
    font-family: 'DM Serif Display', serif;
    font-size: 15px;
    color: #e8e6e0;
    margin-bottom: 2px;
  }
  .exp-period {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    color: #e8522a;
    font-weight: 600;
    margin-bottom: 10px;
  }

  /* ── Formación ── */
  .edu-block { margin-bottom: 13px; }
  .edu-title {
    font-size: 12.5px;
    font-weight: 600;
    color: #e8e6e0;
    margin-bottom: 1px;
  }
  .edu-school {
    font-family: 'DM Mono', monospace;
    font-size: 10.5px;
    color: #9a9aa8;
  }
  .edu-year {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    color: #6b6f7a;
    margin-top: 1px;
  }
</style>
</head>
<body>

<div class="header">
  ${photoBase64 ? `<div class="photo-wrap">${photoTag}</div>` : ''}
  <div class="name">Jaime Martínez López</div>
  <div class="role-line">${role}</div>
  <p class="bio">${bio}</p>
</div>

<div class="body">
  <div class="col-left">
    <div class="section">
      <div class="sec-title">${L.skillsSec}</div>
      ${skillsHtml}
    </div>
    <div class="section">
      <div class="sec-title">${L.langSec}</div>
      ${langsHtml}
    </div>
    <div class="section">
      <div class="sec-title">${L.contactSec}</div>
      <div class="contact-item"><span class="contact-icon">✆</span>${JAIME_DATA.phone}</div>
      <div class="contact-item"><span class="contact-icon">✉</span>${JAIME_DATA.email}</div>
      <div class="contact-item"><span class="contact-icon">◎</span>${JAIME_DATA.location}</div>
    </div>
  </div>

  <div class="col-right">
    <div class="section">
      <div class="sec-title">${L.expSec}</div>
      <div class="exp-role">${L.expRole}</div>
      <div class="exp-period">${data.lang === 'en' ? 'January 2023 — Present (3 years, 4 months)' : 'Enero 2023 — Actualidad (3 años, 4 meses)'}</div>
      ${bulletsHtml}
    </div>
    <div class="section">
      <div class="sec-title">${L.eduSec}</div>
      ${eduHtml}
    </div>
  </div>
</div>

</body>
</html>`);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); }, 600);
}

function resetAll() {
  document.getElementById('job-url').value = '';
  document.getElementById('job-text').value = '';
  document.getElementById('output-wrap').style.display = 'none';
  document.getElementById('error-box').style.display = 'none';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
