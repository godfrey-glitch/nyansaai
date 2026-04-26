<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Nyansa AI — Welcome</title>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
  :root {
    --gold: #fcd116;
    --gold-dim: rgba(252,209,22,0.15);
    --gold-border: rgba(252,209,22,0.25);
    --green: #006b3f;
    --green-dim: rgba(0,107,63,0.2);
    --green-accent: #4caf82;
    --red: #ce1126;
    --bg: #080c10;
    --bg2: #0d1117;
    --bg3: #111827;
    --surface: rgba(255,255,255,0.04);
    --border: rgba(255,255,255,0.08);
    --text: #ffffff;
    --text-dim: rgba(255,255,255,0.55);
    --text-faint: rgba(255,255,255,0.3);
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
    overflow: hidden;
    position: relative;
  }

  /* Ambient background */
  .ambient {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;
  }
  .ambient-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.12;
  }
  .orb-1 { width: 500px; height: 500px; background: var(--gold); top: -200px; right: -100px; }
  .orb-2 { width: 400px; height: 400px; background: var(--green); bottom: -150px; left: -100px; }
  .orb-3 { width: 300px; height: 300px; background: var(--red); top: 50%; left: 50%; transform: translate(-50%,-50%); opacity: 0.06; }

  /* Ghana flag bar */
  .flag-bar {
    position: fixed;
    top: 0; left: 0; right: 0;
    height: 4px;
    display: flex;
    z-index: 100;
  }
  .flag-bar div { flex: 1; }
  .flag-r { background: var(--red); }
  .flag-y { background: var(--gold); }
  .flag-g { background: var(--green); }

  /* Main container */
  .onboarding {
    position: relative;
    z-index: 10;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px 40px;
  }

  /* Logo */
  .logo {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 48px;
    animation: fadeDown 0.6s ease both;
  }
  .logo-shield {
    width: 44px;
    height: 44px;
    background: var(--gold);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 20px;
    color: var(--bg);
    box-shadow: 0 0 20px rgba(252,209,22,0.4);
  }
  .logo-text { font-family: 'Syne', sans-serif; }
  .logo-name { font-size: 18px; font-weight: 800; color: var(--text); }
  .logo-name span { color: var(--gold); }
  .logo-sub { font-size: 11px; color: var(--text-faint); margin-top: 2px; }

  /* Step container */
  .step {
    display: none;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 520px;
    animation: fadeUp 0.5s ease both;
  }
  .step.active { display: flex; }

  /* Progress dots */
  .progress {
    display: flex;
    gap: 8px;
    margin-bottom: 40px;
  }
  .dot {
    width: 8px;
    height: 8px;
    border-radius: 4px;
    background: var(--border);
    transition: all 0.3s ease;
  }
  .dot.active {
    width: 28px;
    background: var(--gold);
    box-shadow: 0 0 10px rgba(252,209,22,0.4);
  }
  .dot.done { background: var(--green-accent); }

  /* Step headline */
  .step-emoji {
    font-size: 48px;
    margin-bottom: 16px;
    filter: drop-shadow(0 0 20px rgba(252,209,22,0.3));
  }
  .step-title {
    font-family: 'Syne', sans-serif;
    font-size: 28px;
    font-weight: 800;
    text-align: center;
    line-height: 1.2;
    margin-bottom: 10px;
  }
  .step-title span { color: var(--gold); }
  .step-sub {
    font-size: 14px;
    color: var(--text-dim);
    text-align: center;
    line-height: 1.7;
    margin-bottom: 36px;
    max-width: 380px;
  }

  /* Grid options */
  .options-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    width: 100%;
    margin-bottom: 32px;
  }
  .options-grid.three-col { grid-template-columns: repeat(3, 1fr); }
  .options-grid.single { grid-template-columns: 1fr; }

  .option-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 18px 14px;
    cursor: pointer;
    transition: all 0.25s ease;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .option-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, var(--gold-dim), transparent);
    opacity: 0;
    transition: opacity 0.25s ease;
    border-radius: 16px;
  }
  .option-card:hover { border-color: var(--gold-border); transform: translateY(-2px); }
  .option-card:hover::before { opacity: 1; }
  .option-card.selected {
    border-color: var(--gold);
    background: var(--gold-dim);
    box-shadow: 0 0 20px rgba(252,209,22,0.15);
  }
  .option-card.selected::before { opacity: 1; }
  .option-card.selected .check {
    opacity: 1;
    transform: scale(1);
  }

  .check {
    position: absolute;
    top: 10px; right: 10px;
    width: 20px; height: 20px;
    background: var(--gold);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    color: var(--bg);
    font-weight: 800;
    opacity: 0;
    transform: scale(0.5);
    transition: all 0.2s ease;
  }

  .opt-icon { font-size: 28px; margin-bottom: 8px; display: block; }
  .opt-label { font-size: 13px; font-weight: 600; color: var(--text); display: block; margin-bottom: 3px; }
  .opt-desc { font-size: 11px; color: var(--text-faint); display: block; line-height: 1.4; }

  /* Class level selector - scrollable */
  .class-scroll {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: 320px;
    overflow-y: auto;
    padding-right: 6px;
    margin-bottom: 32px;
    scrollbar-width: thin;
    scrollbar-color: var(--gold-border) transparent;
  }
  .class-group-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1.5px;
    color: var(--text-faint);
    text-transform: uppercase;
    padding: 8px 0 4px;
  }
  .class-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }
  .class-pill {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 10px 8px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 12px;
    font-weight: 500;
    color: var(--text-dim);
  }
  .class-pill:hover { border-color: var(--gold-border); color: var(--text); }
  .class-pill.selected {
    background: var(--gold-dim);
    border-color: var(--gold);
    color: var(--gold);
    font-weight: 700;
  }

  /* Goal tags */
  .goal-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: center;
    margin-bottom: 32px;
    width: 100%;
  }
  .goal-tag {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 24px;
    padding: 10px 18px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    color: var(--text-dim);
    transition: all 0.2s ease;
  }
  .goal-tag:hover { border-color: var(--gold-border); color: var(--text); }
  .goal-tag.selected {
    background: var(--gold-dim);
    border-color: var(--gold);
    color: var(--gold);
    font-weight: 600;
  }

  /* CTA Button */
  .btn-primary {
    background: var(--gold);
    color: var(--bg);
    border: none;
    border-radius: 14px;
    padding: 16px 40px;
    font-family: 'Syne', sans-serif;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.25s ease;
    width: 100%;
    max-width: 360px;
    box-shadow: 0 4px 30px rgba(252,209,22,0.3);
    letter-spacing: 0.3px;
  }
  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 40px rgba(252,209,22,0.4);
  }
  .btn-primary:active { transform: translateY(0); }
  .btn-primary:disabled {
    opacity: 0.35;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  /* Skip link */
  .skip-link {
    margin-top: 16px;
    font-size: 12px;
    color: var(--text-faint);
    cursor: pointer;
    transition: color 0.2s;
  }
  .skip-link:hover { color: var(--text-dim); }

  /* Step 3 — personalised dashboard preview */
  .dashboard-preview {
    width: 100%;
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: 20px;
    overflow: hidden;
    margin-bottom: 28px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.4);
  }
  .dash-header {
    background: var(--bg3);
    padding: 14px 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--border);
  }
  .dash-greeting { font-size: 13px; font-weight: 600; color: var(--text); }
  .dash-greeting span { color: var(--gold); }
  .dash-xp { font-size: 11px; color: var(--gold); font-weight: 700; background: var(--gold-dim); padding: 3px 10px; border-radius: 20px; }
  .dash-body { padding: 16px 18px; }
  .dash-suggestion {
    background: linear-gradient(135deg, rgba(0,107,63,0.3), rgba(0,107,63,0.1));
    border: 1px solid rgba(0,107,63,0.4);
    border-radius: 12px;
    padding: 14px;
    margin-bottom: 14px;
  }
  .dash-sug-label { font-size: 10px; font-weight: 700; color: var(--green-accent); letter-spacing: 1px; margin-bottom: 4px; }
  .dash-sug-text { font-size: 13px; font-weight: 600; color: var(--text); }
  .dash-sug-sub { font-size: 11px; color: var(--text-dim); margin-top: 2px; }
  .dash-features {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }
  .dash-feat {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 10px 8px;
    text-align: center;
  }
  .dash-feat-icon { font-size: 18px; display: block; margin-bottom: 4px; }
  .dash-feat-label { font-size: 10px; color: var(--text-dim); font-weight: 500; }

  /* Confetti / success step */
  .success-ring {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: var(--gold-dim);
    border: 2px solid var(--gold);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36px;
    margin-bottom: 20px;
    box-shadow: 0 0 40px rgba(252,209,22,0.2);
    animation: pulse 2s ease infinite;
  }

  @keyframes pulse {
    0%, 100% { box-shadow: 0 0 40px rgba(252,209,22,0.2); }
    50% { box-shadow: 0 0 60px rgba(252,209,22,0.4); }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeDown {
    from { opacity: 0; transform: translateY(-16px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* Responsive */
  @media (max-width: 480px) {
    .step-title { font-size: 22px; }
    .options-grid { grid-template-columns: 1fr 1fr; }
    .class-row { grid-template-columns: repeat(2, 1fr); }
  }
</style>
</head>
<body>

<div class="flag-bar">
  <div class="flag-r"></div>
  <div class="flag-y"></div>
  <div class="flag-g"></div>
</div>

<div class="ambient">
  <div class="ambient-orb orb-1"></div>
  <div class="ambient-orb orb-2"></div>
  <div class="ambient-orb orb-3"></div>
</div>

<div class="onboarding">

  <!-- Logo -->
  <div class="logo">
    <div class="logo-shield">N</div>
    <div class="logo-text">
      <div class="logo-name">NYANSA <span>AI</span></div>
      <div class="logo-sub">Powered by Wisdom 🇬🇭</div>
    </div>
  </div>

  <!-- Progress -->
  <div class="progress">
    <div class="dot active" id="dot-1"></div>
    <div class="dot" id="dot-2"></div>
    <div class="dot" id="dot-3"></div>
  </div>

  <!-- ───── STEP 1: Who are you? ───── -->
  <div class="step active" id="step-1">
    <div class="step-emoji">👋</div>
    <div class="step-title">Welcome to <span>Nyansa AI</span></div>
    <div class="step-sub">Ghana's free AI learning platform. Let's personalise your experience. Who are you?</div>

    <div class="options-grid">
      <div class="option-card" onclick="selectRole(this, 'student')">
        <div class="check">✓</div>
        <span class="opt-icon">🎓</span>
        <span class="opt-label">Student</span>
        <span class="opt-desc">Basic, JHS, or SHS learner</span>
      </div>
      <div class="option-card" onclick="selectRole(this, 'parent')">
        <div class="check">✓</div>
        <span class="opt-icon">👨‍👩‍👧</span>
        <span class="opt-label">Parent</span>
        <span class="opt-desc">Monitor my child's progress</span>
      </div>
      <div class="option-card" onclick="selectRole(this, 'teacher')">
        <div class="check">✓</div>
        <span class="opt-icon">👩‍🏫</span>
        <span class="opt-label">Teacher</span>
        <span class="opt-desc">Manage students & quizzes</span>
      </div>
      <div class="option-card" onclick="selectRole(this, 'university')">
        <div class="check">✓</div>
        <span class="opt-icon">🏛️</span>
        <span class="opt-label">University Student</span>
        <span class="opt-desc">Tertiary level learner</span>
      </div>
    </div>

    <button class="btn-primary" id="btn-1" onclick="goStep(2)" disabled>Continue →</button>
    <div class="skip-link" onclick="goStep(2)">Skip personalisation</div>
  </div>

  <!-- ───── STEP 2: Class level ───── -->
  <div class="step" id="step-2">
    <div class="step-emoji">📚</div>
    <div class="step-title">What <span>level</span> are you?</div>
    <div class="step-sub">We'll tailor your quizzes, AI tutor, and study plan to match your class.</div>

    <div class="class-scroll" id="class-scroll">
      <div class="class-group-label">🌱 Primary School</div>
      <div class="class-row">
        <div class="class-pill" onclick="selectClass(this, 'Basic 1')">Basic 1</div>
        <div class="class-pill" onclick="selectClass(this, 'Basic 2')">Basic 2</div>
        <div class="class-pill" onclick="selectClass(this, 'Basic 3')">Basic 3</div>
        <div class="class-pill" onclick="selectClass(this, 'Basic 4')">Basic 4</div>
        <div class="class-pill" onclick="selectClass(this, 'Basic 5')">Basic 5</div>
        <div class="class-pill" onclick="selectClass(this, 'Basic 6')">Basic 6</div>
      </div>
      <div class="class-group-label">📖 Junior High School</div>
      <div class="class-row">
        <div class="class-pill" onclick="selectClass(this, 'JHS 1')">JHS 1</div>
        <div class="class-pill" onclick="selectClass(this, 'JHS 2')">JHS 2</div>
        <div class="class-pill" onclick="selectClass(this, 'JHS 3 (BECE)')">JHS 3 · BECE</div>
      </div>
      <div class="class-group-label">🎓 Senior High School</div>
      <div class="class-row">
        <div class="class-pill" onclick="selectClass(this, 'SHS 1')">SHS 1</div>
        <div class="class-pill" onclick="selectClass(this, 'SHS 2')">SHS 2</div>
        <div class="class-pill" onclick="selectClass(this, 'SHS 3 (WASSCE)')">SHS 3 · WASSCE</div>
      </div>
      <div class="class-group-label">🏛️ University</div>
      <div class="class-row">
        <div class="class-pill" onclick="selectClass(this, 'University')">University</div>
        <div class="class-pill" onclick="selectClass(this, 'Nursery / KG')">Nursery / KG</div>
      </div>
    </div>

    <button class="btn-primary" id="btn-2" onclick="goStep(3)" disabled>Continue →</button>
    <div class="skip-link" onclick="goStep(3)">Skip for now</div>
  </div>

  <!-- ───── STEP 3: Goal ───── -->
  <div class="step" id="step-3">
    <div class="step-emoji">🎯</div>
    <div class="step-title">What's your <span>main goal?</span></div>
    <div class="step-sub">Pick one — we'll build your personalised home dashboard around it.</div>

    <div class="goal-tags">
      <div class="goal-tag" onclick="selectGoal(this, 'wassce')">🏆 Prepare for WASSCE</div>
      <div class="goal-tag" onclick="selectGoal(this, 'bece')">📝 Prepare for BECE</div>
      <div class="goal-tag" onclick="selectGoal(this, 'general')">📚 General Learning</div>
      <div class="goal-tag" onclick="selectGoal(this, 'university')">🏛️ University Studies</div>
      <div class="goal-tag" onclick="selectGoal(this, 'kids')">⭐ Kids Learning (Nursery/Basic)</div>
      <div class="goal-tag" onclick="selectGoal(this, 'teacher')">👩‍🏫 Manage My Students</div>
      <div class="goal-tag" onclick="selectGoal(this, 'parent')">👨‍👩‍👧 Monitor My Child</div>
    </div>

    <!-- Live dashboard preview -->
    <div class="dashboard-preview" id="dash-preview">
      <div class="dash-header">
        <div class="dash-greeting">Good morning, <span id="dash-name">Learner</span> 👋</div>
        <div class="dash-xp">0 XP</div>
      </div>
      <div class="dash-body">
        <div class="dash-suggestion">
          <div class="dash-sug-label" id="dash-label">YOUR PLAN</div>
          <div class="dash-sug-text" id="dash-title">Start your first quiz to earn XP!</div>
          <div class="dash-sug-sub" id="dash-sub">Personalised for your level</div>
        </div>
        <div class="dash-features" id="dash-feats">
          <div class="dash-feat"><span class="dash-feat-icon">🎯</span><span class="dash-feat-label">Quiz</span></div>
          <div class="dash-feat"><span class="dash-feat-icon">🤖</span><span class="dash-feat-label">AI Tutor</span></div>
          <div class="dash-feat"><span class="dash-feat-icon">📅</span><span class="dash-feat-label">Study Plan</span></div>
        </div>
      </div>
    </div>

    <button class="btn-primary" id="btn-3" onclick="finish()" disabled>🚀 Start Learning</button>
    <div class="skip-link" onclick="finish()">Go to dashboard</div>
  </div>

  <!-- ───── STEP 4: Done! ───── -->
  <div class="step" id="step-4">
    <div class="success-ring">🎉</div>
    <div class="step-title">You're all set, <span id="final-name">Learner</span>!</div>
    <div class="step-sub">Your personalised Nyansa AI dashboard is ready. Let's start learning! 🇬🇭</div>

    <div class="dashboard-preview" style="margin-bottom:28px">
      <div class="dash-header">
        <div class="dash-greeting">Welcome to <span>Nyansa AI</span> 🎓</div>
        <div class="dash-xp" id="final-level">SHS Student</div>
      </div>
      <div class="dash-body">
        <div class="dash-suggestion">
          <div class="dash-sug-label" id="final-label">YOUR GOAL</div>
          <div class="dash-sug-text" id="final-title">WASSCE Prep — Core Maths</div>
          <div class="dash-sug-sub" id="final-sub">Start with a diagnostic quiz</div>
        </div>
        <div class="dash-features">
          <div class="dash-feat"><span class="dash-feat-icon">📝</span><span class="dash-feat-label">WASSCE Prep</span></div>
          <div class="dash-feat"><span class="dash-feat-icon">🤖</span><span class="dash-feat-label">AI Tutor</span></div>
          <div class="dash-feat"><span class="dash-feat-icon">✍️</span><span class="dash-feat-label">Essay Grader</span></div>
        </div>
      </div>
    </div>

    <button class="btn-primary" onclick="alert('🚀 Launching Nyansa AI dashboard!\n\n(In production this redirects to the main app)')">Enter Nyansa AI →</button>
  </div>

</div>

<script>
  let selectedRole = null;
  let selectedClass = null;
  let selectedGoal = null;
  let currentStep = 1;

  const goalData = {
    wassce: {
      label: 'WASSCE PREP',
      title: 'Ace your WASSCE — let\'s start with Core Maths',
      sub: 'Exam-style questions with full marking schemes',
      feats: [['📝','WASSCE Prep'],['🤖','AI Tutor'],['✍️','Essay Grader']]
    },
    bece: {
      label: 'BECE PREP',
      title: 'Crush your BECE — start with Integrated Science',
      sub: 'Real past-paper style questions for JHS students',
      feats: [['📝','BECE Prep'],['🎯','Quiz'],['📅','Study Plan']]
    },
    general: {
      label: 'GENERAL LEARNING',
      title: 'Explore all subjects at your own pace',
      sub: 'AI-powered quizzes, flashcards & tutor support',
      feats: [['🎯','Quiz'],['🃏','Flashcards'],['🗺️','Mastery Map']]
    },
    university: {
      label: 'UNIVERSITY LEVEL',
      title: 'AI tutor for tertiary-level studies',
      sub: 'Essay grading, subject tutor & research support',
      feats: [['🤖','AI Tutor'],['✍️','Essay Grader'],['📊','Analytics']]
    },
    kids: {
      label: 'KIDS MODE ⭐',
      title: 'Nyansa Kids — fun learning for little ones',
      sub: 'ABC, numbers, read-aloud & star badges',
      feats: [['🔤','Alphabet'],['🔢','Numbers'],['⭐','Badges']]
    },
    teacher: {
      label: 'TEACHER DASHBOARD',
      title: 'Manage students, assign quizzes & track progress',
      sub: 'Full classroom management tools',
      feats: [['👩‍🏫','Students'],['🎯','Assign Quiz'],['📊','Analytics']]
    },
    parent: {
      label: 'PARENT PORTAL',
      title: 'Monitor your child\'s progress on Nyansa AI',
      sub: 'XP, accuracy, and weekly activity at a glance',
      feats: [['👨‍👩‍👧','My Children'],['📊','Progress'],['📅','Activity']]
    }
  };

  function selectRole(el, role) {
    document.querySelectorAll('#step-1 .option-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    selectedRole = role;
    document.getElementById('btn-1').disabled = false;

    // Auto-skip class step for parent/teacher
    if (role === 'parent' || role === 'teacher') {
      selectedClass = role === 'parent' ? 'Parent' : 'Teacher';
    }
  }

  function selectClass(el, cls) {
    document.querySelectorAll('.class-pill').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    selectedClass = cls;
    document.getElementById('btn-2').disabled = false;
  }

  function selectGoal(el, goal) {
    document.querySelectorAll('.goal-tag').forEach(t => t.classList.remove('selected'));
    el.classList.add('selected');
    selectedGoal = goal;
    document.getElementById('btn-3').disabled = false;

    // Update live preview
    const d = goalData[goal];
    document.getElementById('dash-label').textContent = d.label;
    document.getElementById('dash-title').textContent = d.title;
    document.getElementById('dash-sub').textContent = d.sub;

    const feats = document.getElementById('dash-feats');
    feats.innerHTML = d.feats.map(f =>
      `<div class="dash-feat"><span class="dash-feat-icon">${f[0]}</span><span class="dash-feat-label">${f[1]}</span></div>`
    ).join('');
  }

  function goStep(n) {
    document.getElementById(`step-${currentStep}`).classList.remove('active');
    currentStep = n;
    document.getElementById(`step-${n}`).classList.add('active');

    // Update dots
    for (let i = 1; i <= 3; i++) {
      const dot = document.getElementById(`dot-${i}`);
      dot.className = 'dot';
      if (i < n) dot.classList.add('done');
      else if (i === n) dot.classList.add('active');
    }

    // Skip class step for teacher/parent roles
    if (n === 2 && (selectedRole === 'parent' || selectedRole === 'teacher')) {
      goStep(3);
    }
  }

  function finish() {
    // Update final step
    const d = selectedGoal ? goalData[selectedGoal] : goalData.general;
    document.getElementById('final-label').textContent = d.label;
    document.getElementById('final-title').textContent = d.title;
    document.getElementById('final-sub').textContent = d.sub;
    if (selectedClass) document.getElementById('final-level').textContent = selectedClass;

    document.getElementById(`step-3`).classList.remove('active');
    document.getElementById(`step-4`).classList.add('active');

    // Hide progress dots on final step
    document.querySelector('.progress').style.display = 'none';
  }
</script>
</body>
</html>
