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
      "Mantenimiento y desarrollo de proyectos de aplicaciones web y de escritorio, incorporando mejoras continuas en las soluciones existentes.",
      "Provisión de soporte técnico a los usuarios, gestionando y resolviendo incidencias relacionadas con los distintos proyectos.",
      "Elaboración de documentación técnica alineada con los desarrollos realizados, garantizando su correcta actualización y accesibilidad."
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

  const systemPrompt = `Eres un experto en recursos humanos y optimización de CVs para el mercado español de tecnología.
Tu tarea es analizar una oferta de trabajo y generar un CV personalizado para Jaime Martínez López, adaptando su perfil real a los requisitos específicos de la oferta.

DATOS REALES DE JAIME:
${JSON.stringify(JAIME_DATA, null, 2)}

INSTRUCCIONES:
1. Analiza la oferta para identificar: tecnologías requeridas, responsabilidades clave, tipo de empresa, nivel de seniority, keywords importantes.
2. Adapta el CV de Jaime destacando las habilidades y experiencias más relevantes para esa oferta específica.
3. Reescribe el perfil/bio para conectar directamente con lo que busca la empresa.
4. Reordena o resalta las skills según la relevancia para la oferta.
5. Reformula los bullets de experiencia usando keywords de la oferta cuando sea honestamente aplicable.
6. NO inventes experiencias o habilidades que Jaime no tiene. Solo adapta la presentación de lo que ya tiene.
7. Si la oferta pide algo que Jaime no tiene (ej: React, Node.js), no lo incluyas en el CV pero sí menciónalo en el consejo.

Responde SOLO con JSON válido, sin markdown, sin backticks, sin explicaciones fuera del JSON:
{
  "matchScore": número del 0 al 100 indicando qué tan bien encaja el perfil de Jaime con la oferta,
  "matchingSkills": número de skills de Jaime que coinciden con los requisitos,
  "keywordsIntegrated": número de keywords de la oferta que se han integrado en el CV,
  "adaptedBio": "párrafo de perfil profesional adaptado específicamente para esta oferta (3-4 frases)",
  "highlightedSkills": ["lista de skills de Jaime más relevantes para esta oferta, en orden de relevancia"],
  "keySkillsFromOffer": ["skills que pide la oferta y Jaime tiene"],
  "adaptedBullets": ["bullet 1 reformulado", "bullet 2 reformulado", "bullet 3 reformulado"],
  "jobTitle": "título del puesto detectado en la oferta",
  "company": "nombre de la empresa si aparece, si no 'Empresa Tecnológica'",
  "tip": "consejo específico de 2-3 frases sobre qué podría añadir o mejorar Jaime para esta oferta, y qué gaps hay entre su perfil y los requisitos",
  "adaptedRole": "título de puesto más adecuado para presentarse a esta oferta específica",
  "integratedKeywords": ["lista de keywords concretas de la oferta que se han integrado en el CV adaptado"]
}`;

  const userMessage = currentMode === 'url'
    ? `Analiza esta oferta de trabajo y genera el CV adaptado: ${jobInput}\n\nSi no puedes acceder a la URL, intenta inferir el tipo de puesto desde la URL e indica en el tip que sería mejor pegar el texto directamente. Aun así genera el mejor CV posible para un puesto de desarrollo web/multiplataforma.`
    : `Analiza esta oferta de trabajo y genera el CV adaptado:\n\n${jobInput}`;

  try {
    const response = await fetch("php/proxy.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        max_tokens: 1500,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }]
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Error de API: ${response.status}`);
    }

    const data = await response.json();
    let rawText = data.content.map(b => b.text || '').join('');
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

  document.getElementById('score-match').textContent = (data.matchScore || 0) + '%';

  const matchingSkills = data.keySkillsFromOffer || [];
  document.getElementById('score-skills').textContent = matchingSkills.length || data.matchingSkills || '—';
  document.getElementById('skills-detail').textContent = matchingSkills.join(' · ');

  const integratedKeywords = data.integratedKeywords || [];
  document.getElementById('score-keywords').textContent = integratedKeywords.length || data.keywordsIntegrated || '—';
  document.getElementById('keywords-detail').textContent = integratedKeywords.join(' · ');

  // Destacar skills que coinciden con la oferta — coincidencia parcial para mayor robustez
  const keySkillsSet = matchingSkills.map(s => s.toLowerCase());
  const skillMatches = (skill) => keySkillsSet.some(ks =>
    ks.includes(skill.toLowerCase()) || skill.toLowerCase().includes(ks)
  );

  const skillTags = (data.highlightedSkills || JAIME_DATA.skills).map(skill => {
    const isHighlight = skillMatches(skill);
    return `<span class="cv-skill-tag ${isHighlight ? 'highlight' : ''}">${skill}</span>`;
  }).join('');

  const bulletItems = (data.adaptedBullets || JAIME_DATA.experience[0].bullets)
    .map(b => `<li>${b}</li>`).join('');

  const eduRows = JAIME_DATA.education.map(e => `
    <div class="cv-edu-row">
      <div class="cv-edu-year">${e.year}</div>
      <div>
        <div class="cv-edu-title">${e.title}</div>
        <div class="cv-edu-school">${e.school}</div>
      </div>
    </div>
  `).join('');

  const langText = JAIME_DATA.languages.map(l => `${l.lang} (${l.level})`).join(' · ');

  cvTextContent = `JAIME MARTÍNEZ LÓPEZ\n${data.adaptedRole || JAIME_DATA.role}\n${JAIME_DATA.email} · ${JAIME_DATA.phone} · ${JAIME_DATA.location}\n\nPERFIL PROFESIONAL\n${data.adaptedBio || JAIME_DATA.bio}\n\nEXPERIENCIA\nConsultor Junior — Desarrollo Web & Multiplataforma\nEnero 2023 — Actualidad\n${(data.adaptedBullets || []).map(b => '· ' + b).join('\n')}\n\nFORMACIÓN\n2021-2022 — Grado en Desarrollo de Aplicaciones Web — IMF Smart Education\n2019-2020 — Grado en Desarrollo de Aplicaciones Multiplataforma — IMF Smart Education\n\nIDIOMAS\n${langText}`;

  document.getElementById('cv-output').innerHTML = `
    <div class="cv-name">Jaime<br><em>Martínez</em> López</div>
    <div class="cv-role-line">// ${data.adaptedRole || JAIME_DATA.role}</div>
    <div class="cv-contact">
      <div><span>✉</span>${JAIME_DATA.email}</div>
      <div><span>📞</span>${JAIME_DATA.phone}</div>
      <div><span>📍</span>${JAIME_DATA.location}</div>
    </div>

    <div class="cv-section-title">Perfil profesional</div>
    <div class="cv-summary">${data.adaptedBio || JAIME_DATA.bio}</div>

    <div class="cv-section-title">Habilidades técnicas</div>
    <div class="cv-skill-grid">${skillTags}</div>
    ${keySkillsSet.length > 0 ? `<div class="cv-skills-note" style="margin-top:10px;font-family:'DM Mono',monospace;font-size:11px;color:var(--muted);">↳ Skills destacadas en naranja coinciden con los requisitos de la oferta</div>` : ''}

    <div class="cv-section-title">Experiencia profesional</div>
    <div class="cv-exp-role">Consultor Junior</div>
    <div class="cv-exp-company">Desarrollo Web & Multiplataforma · Enero 2023 — Actualidad · 3 años, 4 meses</div>
    <ul class="cv-bullets">${bulletItems}</ul>

    <div class="cv-section-title">Formación académica</div>
    ${eduRows}

    <div class="cv-section-title">Idiomas</div>
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

  const role    = data.adaptedRole  || JAIME_DATA.role;
  const bio     = data.adaptedBio   || JAIME_DATA.bio;
  const bullets = data.adaptedBullets || JAIME_DATA.experience[0].bullets;
  const skills  = (data.keySkillsFromOffer && data.keySkillsFromOffer.length > 0)
    ? data.keySkillsFromOffer
    : (data.highlightedSkills || JAIME_DATA.skills);

  const skillsHtml  = skills.map(s =>
    `<div class="item"><span class="bullet">•</span>${s}</div>`).join('');

  const langsHtml   = JAIME_DATA.languages.map(l =>
    `<div class="item"><span class="bullet">•</span>${l.lang} — ${l.level}</div>`).join('');

  const bulletsHtml = bullets.map(b =>
    `<div class="item"><span class="bullet">•</span>${b}</div>`).join('');

  const eduHtml = JAIME_DATA.education.map(e => `
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
    position: relative;
    background: #13151a;
    text-align: center;
    padding: 32px 40px 24px;
    overflow: hidden;
  }
  .deco {
    position: absolute;
    width: 110px; height: 110px;
    background: #f5a623;
    border-radius: 18px;
  }
  .deco-tl { top: -44px; left: -44px; }
  .deco-tr { top: -44px; right: -44px; }
  .deco-bl { bottom: -52px; left: -52px; }
  .deco-br { bottom: -52px; right: -52px; }

  .photo {
    width: 112px; height: 112px;
    border-radius: 50%;
    object-fit: cover;
    object-position: top center;
    border: 3px solid #f5a623;
    display: block;
    margin: 0 auto 14px;
    position: relative;
    z-index: 1;
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
  <div class="deco deco-tl"></div>
  <div class="deco deco-tr"></div>
  ${photoTag}
  <div class="name">Jaime Martínez López</div>
  <div class="role-line">${role}</div>
  <p class="bio">${bio}</p>
  <div class="deco deco-bl"></div>
  <div class="deco deco-br"></div>
</div>

<div class="body">
  <div class="col-left">
    <div class="section">
      <div class="sec-title">Habilidades relevantes</div>
      ${skillsHtml}
    </div>
    <div class="section">
      <div class="sec-title">Lenguaje</div>
      ${langsHtml}
    </div>
    <div class="section">
      <div class="sec-title">Contacto</div>
      <div class="contact-item"><span class="contact-icon">✆</span>${JAIME_DATA.phone}</div>
      <div class="contact-item"><span class="contact-icon">✉</span>${JAIME_DATA.email}</div>
      <div class="contact-item"><span class="contact-icon">◎</span>${JAIME_DATA.location}</div>
    </div>
  </div>

  <div class="col-right">
    <div class="section">
      <div class="sec-title">Experiencia de trabajo</div>
      <div class="exp-role">${JAIME_DATA.experience[0].role}</div>
      <div class="exp-period">${JAIME_DATA.experience[0].period} (${JAIME_DATA.experience[0].duration})</div>
      ${bulletsHtml}
    </div>
    <div class="section">
      <div class="sec-title">Formación</div>
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
