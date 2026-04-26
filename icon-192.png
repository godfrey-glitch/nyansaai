(function(){
var _dismissed=false;
function dismissLoader(){
  if(_dismissed)return;
  _dismissed=true;
  var el=document.getElementById('app-loader');
  if(el){
    el.style.opacity='0';
    el.style.transition='opacity .3s';
    setTimeout(function(){if(el.parentNode)el.parentNode.removeChild(el);},300);
  }
}
// Animate the bar
var b=document.getElementById('loader-bar');
if(b){
  var p=0;
  var iv=setInterval(function(){
    p+=Math.random()*20+10;
    if(p>=90){p=90;clearInterval(iv);}
    b.style.width=p+'%';
  },100);
}
// Dismiss on DOMContentLoaded (fires before load, more reliable on local files)
document.addEventListener('DOMContentLoaded',function(){
  if(b)b.style.width='100%';
  setTimeout(dismissLoader,400);
});
// Dismiss on load as backup
window.addEventListener('load',function(){
  if(b)b.style.width='100%';
  setTimeout(dismissLoader,200);
});
// Nuclear option: always dismiss after 1.5s no matter what
setTimeout(dismissLoader,1500);
// Extra safety: dismiss immediately if document already loaded
if(document.readyState==='complete'||document.readyState==='interactive'){
  setTimeout(dismissLoader,100);
}
})();

const API='/.netlify/functions/claude', MODEL='claude-sonnet-4-20250514';
let usingFallback=false, currentUser=null, selectedRole='student';
let state={
  difficulty:'beginner',questionNum:0,score:0,correct:0,total:0,streak:0,xp:0,
  answered:false,hintUsed:false,currentQ:null,history:[],subjectStats:{},generating:false,
  timerInterval:null,timerVal:30,fcDeck:[],fcIndex:0,fcRatings:{},
  tStudents:[],children:[],planTasks:{},earnedBadges:{},
  prefs:{sound:true,timer:true,autoAdvance:false,name:'',school:''}
};
const BANK={
  math:{
    beginner:[
      {question:"What is 15 × 8?",options:["100","110","120","130"],answer:2,hint:"15×8 = (10×8)+(5×8)",explanation:"10×8=80, 5×8=40, total=120."},
      {question:"What is 25% of 200?",options:["25","40","50","75"],answer:2,hint:"25% = 1/4. Divide by 4.",explanation:"200÷4=50."},
      {question:"Solve: x + 12 = 20. Find x.",options:["6","7","8","9"],answer:2,hint:"Subtract 12 from both sides.",explanation:"x=20-12=8."},
      {question:"Area of a rectangle 8cm × 5cm?",options:["26cm²","40cm²","30cm²","13cm²"],answer:1,hint:"Area = length × width.",explanation:"8×5=40cm²."},
      {question:"What is 3/4 as a decimal?",options:["0.34","0.43","0.75","0.25"],answer:2,hint:"Divide 3 by 4.",explanation:"3÷4=0.75."},
      {question:"Which is a prime number?",options:["9","15","17","21"],answer:2,hint:"A prime has only 1 and itself as factors.",explanation:"17 is prime."},
    ],
    intermediate:[
      {question:"Solve: 2x − 5 = 11. Find x.",options:["6","7","8","9"],answer:2,hint:"Add 5 to both sides, then divide by 2.",explanation:"2x=16, x=8."},
      {question:"Area of circle with radius 7cm? (π≈22/7)",options:["44cm²","154cm²","49cm²","22cm²"],answer:1,hint:"Area = πr².",explanation:"22/7×49=154cm²."},
      {question:"Factorise: x² − 9",options:["(x-3)²","(x+3)(x-3)","(x+9)(x-1)","(x-9)(x+1)"],answer:1,hint:"Difference of two squares.",explanation:"x²-9=(x+3)(x-3)."},
    ],
    advanced:[
      {question:"Differentiate f(x) = 4x³ − 2x².",options:["12x²-4x","12x²-4x+5","4x²-2x","8x²-4x"],answer:0,hint:"Power rule: d/dx(xⁿ)=nxⁿ⁻¹.",explanation:"12x²-4x."},
    ]
  },
  english:{
    beginner:[
      {question:"Which sentence is correct?",options:["She don't like apples.","She doesn't like apples.","She doesn't likes apples.","She not like apples."],answer:1,hint:"Use 'doesn't' for third-person singular.",explanation:"'She doesn't like apples' is correct."},
      {question:"Plural of 'child'?",options:["childs","childes","children","childrens"],answer:2,hint:"This is an irregular plural.",explanation:"The plural of child is children."},
      {question:"'Quickly' is what part of speech?",options:["Adjective","Noun","Verb","Adverb"],answer:3,hint:"It describes how something is done.",explanation:"'Quickly' is an adverb."},
    ],
    intermediate:[
      {question:"What literary device is 'The wind whispered'?",options:["Simile","Metaphor","Personification","Alliteration"],answer:2,hint:"The wind is given a human quality.",explanation:"Personification gives human traits to non-human things."},
    ]
  },
  science:{
    beginner:[
      {question:"What gas do plants absorb during photosynthesis?",options:["Oxygen","Nitrogen","Carbon Dioxide","Hydrogen"],answer:2,hint:"Plants breathe in what humans breathe out.",explanation:"Plants absorb CO₂ and release oxygen."},
      {question:"Chemical symbol for water?",options:["WA","HO","H₂O","W₂O"],answer:2,hint:"Water = hydrogen + oxygen.",explanation:"H₂O — 2 hydrogen, 1 oxygen."},
      {question:"Powerhouse of the cell?",options:["Nucleus","Ribosome","Mitochondria","Chloroplast"],answer:2,hint:"It produces ATP energy.",explanation:"Mitochondria produces energy via cellular respiration."},
    ]
  },
  history:{
    beginner:[
      {question:"Ghana gained independence from which country in 1957?",options:["France","Portugal","Britain","Belgium"],answer:2,hint:"The Gold Coast was a British colony.",explanation:"Ghana gained independence from Britain on 6 March 1957."},
      {question:"Who was the first President of Ghana?",options:["J.J. Rawlings","Kofi Busia","Kwame Nkrumah","John Kufuor"],answer:2,hint:"He coined 'Africa must unite'.",explanation:"Kwame Nkrumah became Ghana's first President in 1960."},
    ]
  ,intermediate:[{question:"In which year did Ghana gain independence?",options:["1945","1957","1960","1966"],answer:1,hint:"First sub-Saharan African country to gain independence.",explanation:"Ghana gained independence on 6 March 1957, making it the first sub-Saharan African country to do so."},
    {question:"Who led the coup that overthrew Nkrumah in 1966?",options:["Jerry Rawlings","Kofi Busia","General Kotoka","Hilla Limann"],answer:2,hint:"He was an army officer who announced the coup on radio.",explanation:"General Emmanuel Kotoka, alongside Lt. General Afrifa and police chief Harley, led the National Liberation Council (NLC) coup on 24 February 1966."},
    {question:"What was the name of Ghana before independence?",options:["Ashanti","Togoland","Gold Coast","Ivory Coast"],answer:2,hint:"Named after a major export commodity.",explanation:"Ghana was called the Gold Coast under British colonial rule, named for its gold trade."}]},
  geography:{beginner:[{question:"Longest river in Africa?",options:["Congo","Niger","Nile","Zambezi"],answer:2,hint:"Flows northward into the Mediterranean.",explanation:"The Nile is the longest river in Africa at ~6,650km."}],beginner:[{question:"What is the capital city of Ghana?",options:["Kumasi","Tamale","Cape Coast","Accra"],answer:3,hint:"Located in the Greater Accra region.",explanation:"Accra is the capital and largest city of Ghana."},
    {question:"Which ocean borders Ghana to the south?",options:["Indian Ocean","Atlantic Ocean","Pacific Ocean","Arctic Ocean"],answer:1,hint:"The Gulf of Guinea is part of this ocean.",explanation:"The Atlantic Ocean (Gulf of Guinea) forms Ghana's southern coastline."},
    {question:"What is the largest lake in Ghana?",options:["Lake Bosumtwi","Lake Volta","Lake Chad","Lake Tanganyika"],answer:1,hint:"Created by the Akosombo Dam.",explanation:"Lake Volta, created by the Akosombo Dam in 1965, is the largest reservoir in Ghana and one of the largest in Africa."}]},
  economics:{beginner:[{question:"What does supply and demand determine?",options:["Government policy","The price of goods","Tax rates","Population growth"],answer:1,hint:"It's the fundamental market mechanism.",explanation:"Supply and demand interaction sets prices."}],intermediate:[{question:"If demand increases and supply stays constant, what happens to price?",options:["Price falls","Price stays same","Price rises","Cannot determine"],answer:2,hint:"More buyers competing for same quantity.",explanation:"When demand rises with constant supply, competition among buyers pushes the equilibrium price upward."},
    {question:"What type of good has a negative income elasticity of demand?",options:["Luxury good","Normal good","Inferior good","Public good"],answer:2,hint:"You buy less of it when your income rises.",explanation:"Inferior goods have negative income elasticity — e.g. cheap starchy foods; as income rises, consumers switch to better alternatives."},
    {question:"Ghana's central bank is called?",options:["Ghana Commercial Bank","Bank of Ghana","Ghana National Bank","Ecobank"],answer:1,hint:"It regulates monetary policy in Ghana.",explanation:"The Bank of Ghana is the central bank, responsible for monetary policy and currency (the Cedi)."}]},
  business:{beginner:[{question:"What is profit?",options:["Total sales","Money spent","Revenue minus costs","Money borrowed"],answer:2,hint:"Revenue minus costs.",explanation:"Profit = Revenue − Total Costs."},{question:"What is an entrepreneur?",options:["A government employee","Someone who starts a business","A bank manager","A factory worker"],answer:1,hint:"They take risks to create something new.",explanation:"An entrepreneur starts and runs a business."}]},
  rme:{beginner:[{question:"What does RME stand for?",options:["Reading and Maths Education","Religious and Moral Education","Regional Management","Reading Moral Ethics"],answer:1,hint:"It covers religion and values in Ghana.",explanation:"RME = Religious and Moral Education."},{question:"Which is a core moral value?",options:["Greed","Respect","Envy","Dishonesty"],answer:1,hint:"About treating others well.",explanation:"Respect is a fundamental moral value."}],beginner:[{question:"Which of these is a Christian holy book?",options:["The Quran","The Vedas","The Bible","The Torah"],answer:2,hint:"Used in Christian worship.",explanation:"The Bible is the holy scripture of Christianity. The Quran is Islamic, Vedas are Hindu, Torah is Jewish."},
    {question:"In Islam, how many times do Muslims pray daily?",options:["3","4","5","7"],answer:2,hint:"Called the Five Pillars of Islam.",explanation:"Muslims pray 5 times daily (Salat): Fajr, Dhuhr, Asr, Maghrib, Isha."},
    {question:"What does 'moral' mean?",options:["Being wealthy","Following the law","Doing what is right and good","Being popular"],answer:2,hint:"About right and wrong behaviour.",explanation:"Morality refers to principles of right and wrong conduct — doing what is good and fair to others."}]},
  socialstudies:{beginner:[{question:"Capital city of Ghana?",options:["Kumasi","Tamale","Cape Coast","Accra"],answer:3,hint:"Greater Accra region.",explanation:"Accra is the capital of Ghana."},{question:"Ghana is in which part of Africa?",options:["East","North","West","Southern"],answer:2,hint:"Gulf of Guinea.",explanation:"Ghana is in West Africa."}],intermediate:[{question:"ECOWAS stands for?",options:["East Coast of West African States","Economic Community of West African States","European Community of West Africa","Economic Council of West African Students"],answer:1,hint:"A regional economic bloc in West Africa.",explanation:"ECOWAS = Economic Community of West African States, established in 1975 to promote regional economic integration."},
    {question:"What is the main purpose of a constitution?",options:["To list the country's enemies","To establish the supreme law governing a country","To record historical events","To manage the economy"],answer:1,hint:"It is the highest law of the land.",explanation:"A constitution sets out the fundamental principles, rights, and structures of government — it is the supreme law."}]},
  french:{beginner:[{question:"What is 'Bonjour' in English?",options:["Goodbye","Hello / Good morning","Thank you","Please"],answer:1,hint:"A morning greeting.",explanation:"Bonjour = Hello / Good morning."},{question:"'My name is' in French?",options:["Je m'appelle","Je suis","Mon nom","Je veux"],answer:0,hint:"Introducing yourself.",explanation:"Je m'appelle = My name is."}]},
  literature:{beginner:[{question:"Main theme of 'Things Fall Apart'?",options:["Romance","Impact of colonialism on African culture","Technology","Conservation"],answer:1,hint:"European missionaries and change.",explanation:"Explores how colonialism disrupted traditional Igbo society."}],intermediate:[{question:"Who wrote 'Things Fall Apart'?",options:["Wole Soyinka","Chinua Achebe","Ngugi wa Thiong'o","Ama Ata Aidoo"],answer:1,hint:"A Nigerian author writing about Igbo society.",explanation:"Chinua Achebe wrote 'Things Fall Apart' (1958), depicting the impact of colonialism on Igbo culture in Nigeria."},
    {question:"What literary device is used in: 'The sun smiled down on the village'?",options:["Simile","Metaphor","Personification","Alliteration"],answer:2,hint:"The sun is given a human action.",explanation:"Personification attributes human qualities (smiling) to a non-human subject (the sun)."},
    {question:"A Ghanaian author known for 'Our Sister Killjoy' is?",options:["Ayi Kwei Armah","Kofi Awoonor","Ama Ata Aidoo","J.E. Casely Hayford"],answer:2,hint:"A pioneering Ghanaian female writer.",explanation:"Ama Ata Aidoo wrote 'Our Sister Killjoy' (1977), a landmark work of Ghanaian and African literature."}]},
  government:{beginner:[{question:"Type of government Ghana has?",options:["Monarchy","Military dictatorship","Constitutional democracy","Communism"],answer:2,hint:"Ghana holds elections.",explanation:"Ghana is a constitutional democracy."}],intermediate:[{question:"In Ghana's government, who is the head of state?",options:["The Chief Justice","The Speaker of Parliament","The President","The Prime Minister"],answer:2,hint:"Ghana is a presidential republic.",explanation:"Ghana operates a presidential system. The President is both head of state and head of government."},
    {question:"How many regions does Ghana currently have?",options:["10","12","16","8"],answer:2,hint:"The number increased in 2019.",explanation:"Ghana has 16 regions following the 2019 referendum that created 6 new regions from the original 10."},
    {question:"Which year was Ghana's current constitution adopted?",options:["1957","1979","1992","2000"],answer:2,hint:"Marked Ghana's return to democratic rule under Rawlings.",explanation:"The 1992 Constitution established Ghana's Fourth Republic and remains in force today."}]},
  elecmaths:{beginner:[{question:"Derivative of sin(x)?",options:["cos(x)","-cos(x)","sin(x)","-sin(x)"],answer:0,hint:"Standard calculus.",explanation:"d/dx(sin x) = cos x."}],intermediate:[{question:"What is the derivative of f(x) = x³?",options:["x²","3x²","3x","x³"],answer:1,hint:"Power rule: d/dx(xⁿ) = nxⁿ⁻¹.",explanation:"d/dx(x³) = 3x². Multiply by the exponent, reduce exponent by 1."},
    {question:"∫2x dx = ?",options:["2","x²+C","2x²+C","x+C"],answer:1,hint:"Reverse of differentiation. Increase power by 1, divide by new power.",explanation:"∫2x dx = x² + C. (Power rule for integration: increase exponent by 1, divide by new exponent.)"},
    {question:"What are the roots of x² − 5x + 6 = 0?",options:["x=1,x=6","x=2,x=3","x=−2,x=−3","x=−1,x=6"],answer:1,hint:"Find two numbers that multiply to 6 and add to −5.",explanation:"Factorises as (x−2)(x−3) = 0, giving roots x = 2 and x = 3."}]},
  pe:{beginner:[{question:"Players on a football team?",options:["9","10","11","12"],answer:2,hint:"Standard team size.",explanation:"11 players on the field."},{question:"PE stands for?",options:["Physical Education","Personal Exercise","Practical Exercises","Physical Examination"],answer:0,hint:"A school subject.",explanation:"PE = Physical Education."}]},
  twi:{beginner:[{question:"What does 'Medaase' mean?",options:["Good morning","Thank you","Goodbye","How are you"],answer:1,hint:"A polite phrase.",explanation:"Medaase = Thank you in Twi."},{question:"'Good morning' in Twi?",options:["Maakye","Maaha","Medaase","Da yie"],answer:0,hint:"Morning greeting.",explanation:"Maakye = Good morning in Twi."}]},
  coding:{
    beginner:[
      {question:"HTML stands for?",options:["Hyper Text Markup Language","High Tech Modern Language","Hyper Transfer Markup Logic","Home Tool Markup Language"],answer:0,hint:"Used to create web pages.",explanation:"HTML = HyperText Markup Language."},
      {question:"Output of print(2 + 3 * 4) in Python?",options:["20","14","24","10"],answer:1,hint:"BODMAS: multiplication before addition.",explanation:"3×4=12, then 2+12=14."},
      {question:"What does ICT stand for?",options:["International Computer Technology","Information and Communications Technology","Integrated Computing Tools","Internet Content Transfer"],answer:1,hint:"A subject in the GES curriculum.",explanation:"ICT = Information and Communications Technology."},
      {question:"What is cybersecurity?",options:["Building robots","Protecting computers and networks from digital attacks","Designing websites","Programming apps"],answer:1,hint:"It's about keeping digital information safe.",explanation:"Cybersecurity involves protecting computer systems, networks, and data from digital attacks, theft, and damage."},
      {question:"What does AI stand for in Computing?",options:["Automatic Internet","Artificial Intelligence","Advanced Integration","Automated Input"],answer:1,hint:"A major topic in the new JHS Computing curriculum.",explanation:"AI = Artificial Intelligence — machines that can perform tasks that normally require human intelligence."},
    ],
    intermediate:[
      {question:"In Computing, what is an algorithm?",options:["A type of computer virus","A step-by-step set of instructions to solve a problem","A programming language","A computer hardware component"],answer:1,hint:"Think of it as a recipe for a computer.",explanation:"An algorithm is a precise, step-by-step sequence of instructions for solving a problem or completing a task."},
      {question:"What is machine learning (a branch of AI)?",options:["Teaching humans to use machines","A system that learns from data to make predictions without explicit programming","Programming robots to walk","Installing software on computers"],answer:1,hint:"The computer learns from examples.",explanation:"Machine learning is a type of AI where systems learn from data and improve their performance over time without being explicitly programmed for each task."},
      {question:"What is the purpose of a password in cybersecurity?",options:["To slow down computers","To authenticate and protect access to accounts and data","To increase internet speed","To install software"],answer:1,hint:"It's the most common security tool.",explanation:"Passwords authenticate users — they verify your identity to protect access to systems, accounts, and personal data from unauthorised access."},
      {question:"In computing, what does 'computational thinking' include?",options:["Physical exercise routines","Decomposition, abstraction, pattern recognition, and algorithm design","Memorising programming languages","Drawing circuit diagrams"],answer:1,hint:"It's a problem-solving approach used in the new JHS curriculum.",explanation:"Computational thinking includes decomposition (breaking problems down), abstraction (focusing on key info), pattern recognition, and algorithm design."},
      {question:"What is robotics in the JHS Computing curriculum?",options:["Drawing robots in art class","Programming and controlling automated machines to perform tasks","Repairing broken computers","Studying the history of technology"],answer:1,hint:"Robots can be programmed — that's what this covers.",explanation:"Robotics in JHS involves programming robots, understanding automation, and basic robotics design and control — introduced from JHS 1 under the CCP."},
    ]
  },

  physics:{beginner:[{question:"What is the SI unit of force?",options:["Watt","Joule","Newton","Pascal"],answer:2,hint:"Named after Sir Isaac Newton.",explanation:"The Newton (N) is the SI unit of force. 1N = 1 kg·m/s²."},
    {question:"Which of these is a scalar quantity?",options:["Velocity","Force","Speed","Acceleration"],answer:2,hint:"Scalars have magnitude only, no direction.",explanation:"Speed is scalar — it has magnitude only. Velocity is a vector (magnitude + direction)."},
    {question:"What does Ohm's Law state?",options:["V = IR","P = IV","E = mc²","F = ma"],answer:0,hint:"Relates voltage, current, and resistance.",explanation:"Ohm's Law: Voltage (V) = Current (I) × Resistance (R)."},
    {question:"A car travels 100 km in 2 hours. What is its average speed?",options:["200 km/h","50 km/h","100 km/h","25 km/h"],answer:1,hint:"Speed = Distance ÷ Time.",explanation:"Speed = 100 ÷ 2 = 50 km/h."}],
  advanced:[{question:"An object of mass 5 kg accelerates at 3 m/s². What net force acts on it?",options:["1.67 N","8 N","15 N","0.6 N"],answer:2,hint:"F = ma.",explanation:"F = 5 × 3 = 15 N by Newton's Second Law."}]},
  chemistry:{beginner:[{question:"What is the chemical symbol for Gold?",options:["Go","Gd","Au","Ag"],answer:2,hint:"From the Latin word 'Aurum'.",explanation:"Gold's symbol is Au from the Latin 'Aurum'."},
    {question:"How many electrons does a neutral Carbon atom have?",options:["2","4","6","12"],answer:2,hint:"Atomic number of Carbon is 6.",explanation:"Carbon has atomic number 6, so it has 6 protons and 6 electrons when neutral."},
    {question:"What type of bond forms between Na and Cl in table salt?",options:["Covalent","Metallic","Ionic","Hydrogen"],answer:2,hint:"One atom donates, the other receives an electron.",explanation:"NaCl is held by an ionic bond — Na donates one electron to Cl."},
    {question:"What is the pH of pure water at 25°C?",options:["0","7","14","1"],answer:1,hint:"Neither acidic nor basic.",explanation:"Pure water has a pH of 7 — it is neutral."}],
  advanced:[{question:"Balance this equation: __H₂ + __O₂ → __H₂O",options:["1,1,1","2,1,2","1,2,2","2,2,2"],answer:1,hint:"Count H and O atoms on both sides.",explanation:"2H₂ + O₂ → 2H₂O. Left: 4H, 2O. Right: 4H, 2O. Balanced."}]},
  biology:{beginner:[{question:"What is the powerhouse of the cell?",options:["Nucleus","Ribosome","Mitochondria","Vacuole"],answer:2,hint:"It produces ATP.",explanation:"Mitochondria produce ATP through cellular respiration — hence 'powerhouse'."},
    {question:"What process do plants use to make food?",options:["Respiration","Digestion","Photosynthesis","Transpiration"],answer:2,hint:"Requires sunlight, CO₂, and water.",explanation:"Photosynthesis converts CO₂ + H₂O + light energy into glucose and oxygen."},
    {question:"What carries oxygen in the blood?",options:["White blood cells","Platelets","Plasma","Red blood cells"],answer:3,hint:"They contain haemoglobin.",explanation:"Red blood cells (erythrocytes) carry haemoglobin, which binds oxygen."},
    {question:"During which stage of mitosis do chromosomes line up at the cell's equator?",options:["Prophase","Telophase","Anaphase","Metaphase"],answer:3,hint:"Think of the 'middle' — metaphase.",explanation:"In Metaphase, chromosomes align along the metaphase plate at the cell's equator."}],
  advanced:[{question:"In a monohybrid cross between two heterozygous parents (Aa × Aa), what is the phenotypic ratio?",options:["1:2:1","3:1","1:1","2:1"],answer:1,hint:"Use a Punnett square.",explanation:"AA:Aa:aa = 1:2:1 genotypic. Dominant phenotype (AA+Aa) : recessive (aa) = 3:1."}]},
  finaccounting:{beginner:[{question:"The accounting equation is Assets = ?",options:["Revenue − Expenses","Liabilities + Capital","Debit − Credit","Income + Capital"],answer:1,hint:"The fundamental balance sheet relationship.",explanation:"Assets = Liabilities + Capital (Owner's Equity). This must always balance."},
    {question:"Which account is debited when cash is received?",options:["Sales","Capital","Cash","Creditors"],answer:2,hint:"Cash coming IN — debit the cash account.",explanation:"When cash is received, the Cash account is debited (increased)."},
    {question:"What is a Trial Balance used for?",options:["Recording sales","Checking debits equal credits","Paying wages","Calculating tax"],answer:1,hint:"It's a list of all ledger balances.",explanation:"A Trial Balance checks that total debits = total credits, verifying arithmetic accuracy."},
    {question:"Gross Profit = Net Sales minus what?",options:["Operating expenses","Cost of goods sold","Net profit","Tax"],answer:1,hint:"The direct cost of producing what was sold.",explanation:"Gross Profit = Net Sales − Cost of Goods Sold (COGS)."}]},
  businessmgmt:{beginner:[{question:"Which of these is NOT a function of management?",options:["Planning","Organising","Manufacturing","Controlling"],answer:2,hint:"Think POLC — the four management functions.",explanation:"The four management functions are Planning, Organising, Leading, and Controlling. Manufacturing is an operational activity."},
    {question:"What does SWOT stand for?",options:["Sales, Work, Output, Target","Strengths, Weaknesses, Opportunities, Threats","Strategy, Workforce, Operations, Technology","Systems, Workflow, Objectives, Tasks"],answer:1,hint:"Used in strategic analysis.",explanation:"SWOT = Strengths, Weaknesses, Opportunities, Threats — a strategic planning tool."},
    {question:"What is the role of a manager?",options:["To do all the work alone","To plan, organise, lead and control resources","To sell products only","To pay workers"],answer:1,hint:"Managers coordinate people and resources.",explanation:"Managers plan goals, organise resources, lead people, and control outcomes (POLC)."}]},

  // ─── NEW GES CURRICULUM 2024-2026 SUBJECTS ───────────────────────────────

  owop:{
    beginner:[
      {question:"OWOP stands for?",options:["Our World Our People","Our Way Our Path","One World One Planet","Our Work Our Play"],answer:0,hint:"A primary school subject in Ghana.",explanation:"OWOP = Our World Our People — a core subject taught from Basic 1 to Basic 6."},
      {question:"How many main strands does the OWOP subject have?",options:["3","4","5","6"],answer:2,hint:"Think of the main themes in OWOP.",explanation:"OWOP has 5 strands: All About Us, Our Environment, Our Communities, Our Nation Ghana, and The Wider World."},
      {question:"Which strand of OWOP covers national symbols like the Ghana flag and coat of arms?",options:["All About Us","Our Environment","Our Communities","Our Nation Ghana"],answer:3,hint:"It focuses on Ghana as a country.",explanation:"The 'Our Nation Ghana' strand covers national symbols, regions, governance, and patriotism."},
      {question:"From which Basic level is OWOP taught in Ghana?",options:["Basic 3","Basic 2","Basic 1","Basic 4"],answer:2,hint:"It starts right at the beginning of primary school.",explanation:"OWOP is taught from Basic 1 all the way to Basic 6."},
      {question:"Which OWOP strand covers topics like recycling, conservation, and climate change?",options:["All About Us","Our Environment","Our Nation Ghana","The Wider World"],answer:1,hint:"It deals with plants, animals, water, and the natural world.",explanation:"The 'Our Environment' strand covers plants, animals, water bodies, weather, climate, conservation, and recycling."},
    ],
    intermediate:[
      {question:"What does the 'All About Us' strand in OWOP focus on?",options:["African countries and trade","Family, personal identity, self-worth, and being Ghanaian","National governance and politics","International organisations"],answer:1,hint:"It's the most personal strand — about you and your family.",explanation:"'All About Us' covers family structure, personal identity, human uniqueness, God, healthy body, and self-worth."},
      {question:"Which OWOP strand introduces students to topics like migration and world peace?",options:["Our Communities","Our Nation Ghana","The Wider World","Our Environment"],answer:2,hint:"It looks beyond Ghana to the globe.",explanation:"'The Wider World' strand covers other countries, Africa, international organisations, trade, migration, and global issues."},
      {question:"OWOP replaced which older subjects at the primary level?",options:["Physics and Chemistry","Environmental Studies and fragmented Social Studies","History and Geography","RME and PE"],answer:1,hint:"OWOP merged several subjects that used to be separate.",explanation:"OWOP replaced the old Environmental Studies and the fragmented Social Studies that existed at primary level before the reforms."},
    ]
  },

  historygh:{
    beginner:[
      {question:"Ghana gained independence from which colonial power?",options:["France","Portugal","Britain","Germany"],answer:2,hint:"The Gold Coast was part of this empire.",explanation:"Ghana (then called the Gold Coast) gained independence from Britain on 6 March 1957."},
      {question:"Who was Ghana's first President?",options:["J.J. Rawlings","Kofi Busia","Kwame Nkrumah","John Kufuor"],answer:2,hint:"He founded the CPP and said 'Africa must unite'.",explanation:"Kwame Nkrumah became Ghana's first Prime Minister in 1957 and first President in 1960."},
      {question:"What was Ghana called before independence?",options:["Ashanti Empire","Togoland","Gold Coast","British West Africa"],answer:2,hint:"Named after a major export commodity.",explanation:"Ghana was called the Gold Coast under British colonial rule, named for its gold trade."},
      {question:"In what year did Ghana gain independence?",options:["1945","1957","1960","1966"],answer:1,hint:"First sub-Saharan African country to gain independence.",explanation:"Ghana gained independence on 6 March 1957, becoming the first sub-Saharan African country to do so."},
    ],
    intermediate:[
      {question:"Which Ghanaian leader was overthrown by a coup in 1966?",options:["Kofi Busia","Kwame Nkrumah","Hilla Limann","J.J. Rawlings"],answer:1,hint:"He was Ghana's first President.",explanation:"Kwame Nkrumah was overthrown by the National Liberation Council (NLC) in February 1966."},
      {question:"What is the significance of the year 1992 in Ghanaian history?",options:["Ghana gained independence","Ghana joined ECOWAS","Ghana's Fourth Republic was established","The Akosombo Dam was built"],answer:2,hint:"A new constitution was adopted this year.",explanation:"In 1992 Ghana adopted a new constitution, establishing the Fourth Republic and returning to democratic governance."},
      {question:"The Akosombo Dam, which created Lake Volta, was completed in which year?",options:["1957","1965","1972","1980"],answer:1,hint:"Built during the Nkrumah era.",explanation:"The Akosombo Dam was completed in 1965 during Nkrumah's presidency, creating Lake Volta — one of the world's largest man-made lakes."},
    ]
  },

  careertech:{
    beginner:[
      {question:"Career Technology is a brand new subject taught at which level in Ghana?",options:["Primary (B1-B6)","Junior High School (JHS 1-3)","Senior High School (SHS)","University"],answer:1,hint:"Part of the CCP — the new JHS programme.",explanation:"Career Technology is a compulsory JHS subject introduced under the Common Core Programme (CCP), taught from JHS 1 to JHS 3."},
      {question:"Which of these is a strand in Career Technology?",options:["Ancient History","Entrepreneurship","Advanced Calculus","Classical Literature"],answer:1,hint:"Career Tech focuses on practical and business skills.",explanation:"Entrepreneurship is one of Career Technology's key strands, covering business ideas, planning, marketing, and budgeting."},
      {question:"Career Technology replaced which old subject at JHS level?",options:["Social Studies","Technical/Vocational Studies","Religious Studies","Geography"],answer:1,hint:"The old subject also involved practical skills.",explanation:"Career Technology replaces the old Technical/Vocational subject and covers entrepreneurship, STEM projects, agriculture, home economics, and more."},
      {question:"Which of these is NOT a strand in Career Technology?",options:["Agriculture & Environment","Home Economics","Creative Writing","STEM Projects"],answer:2,hint:"Career Tech focuses on practical, technical and business skills.",explanation:"Creative Writing is not a strand. The strands are: Agriculture & Environment, Home Economics, Visual Arts & Design, Technical Drawing, ICT & Electronics, Entrepreneurship, and STEM Projects."},
    ],
    intermediate:[
      {question:"What is the main purpose of Career Technology in JHS?",options:["To teach students classical music","To provide employable skills and boost national development","To prepare students for WASSCE only","To replace Mathematics at JHS level"],answer:1,hint:"It's practical and aimed at the real world.",explanation:"Career Technology provides the knowledge, skills, and attitudes needed for competent training, employable skills, and national development through practical work."},
      {question:"The STEM Projects strand in Career Technology involves:",options:["Reading science textbooks only","Integrated science-technology-engineering projects with real-world applications","Writing essays about scientists","Memorising periodic table elements"],answer:1,hint:"STEM = Science Technology Engineering Mathematics.",explanation:"STEM Projects in Career Tech involve hands-on, integrated projects that apply science, technology, engineering, and maths to real-world problems."},
    ]
  },

  cad:{
    beginner:[
      {question:"CAD stands for which subject in the GES curriculum?",options:["Computer Aided Design","Creative Arts and Design","Career Arts and Drama","Computing and Digital Studies"],answer:1,hint:"It's a brand new JHS subject combining four art disciplines.",explanation:"CAD = Creative Arts and Design — a brand new JHS subject introduced under the CCP combining Visual Arts, Music, Dance & Drama, and Design."},
      {question:"How many disciplines does Creative Arts and Design (CAD) combine?",options:["2","3","4","5"],answer:2,hint:"Think of the major art forms it brings together.",explanation:"CAD combines 4 disciplines: Design, Visual Arts, Music, and Dance & Drama."},
      {question:"Which of these is a discipline within CAD?",options:["Cybersecurity","Technical Drawing","Music","Entrepreneurship"],answer:2,hint:"CAD includes a performing arts discipline.",explanation:"Music is one of the 4 CAD disciplines. The others are Design, Visual Arts, and Dance & Drama."},
      {question:"At which school level is CAD taught in Ghana?",options:["Primary","JHS only","SHS only","Both JHS and SHS"],answer:1,hint:"It's part of the Common Core Programme (CCP).",explanation:"CAD is a compulsory JHS subject (Basic 7–9) under the CCP."},
    ],
    intermediate:[
      {question:"What percentage of time per week does CAD receive in the JHS timetable?",options:["100 minutes","150 minutes","200 minutes","250 minutes"],answer:2,hint:"It has one of the longest time allocations in the CCP.",explanation:"CAD receives 200 minutes per week — one of the longest allocations in the JHS CCP timetable."},
      {question:"The Design discipline in CAD teaches students:",options:["Advanced physics concepts","Design thinking, product design, graphic design, and problem-solving through design","How to write computer code","Cooking and nutrition"],answer:1,hint:"It's about creating and problem-solving visually.",explanation:"The Design discipline in CAD covers design thinking, product design, graphic design basics, and solving problems through a design process."},
      {question:"Which Ghanaian cultural heritage is specifically incorporated in the Music discipline of CAD?",options:["Classical European music","American hip-hop","Traditional Ghanaian music, instruments, and oral traditions","Latin American rhythms"],answer:2,hint:"CAD integrates local culture with global arts education.",explanation:"The Music discipline in CAD includes Ghanaian traditional music, traditional instruments, music theory, composition, and performance — rooting students in their cultural heritage."},
    ]
  },

};

function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

function toast(msg,icon,type,dur){
  const w=document.getElementById('toast-wrap');
  const t=document.createElement('div');t.className='toast';
  t.innerHTML='<span class="t-ico">'+icon+'</span><span style="color:var(--text);">'+msg+'</span>';
  if(type==='green')t.style.borderColor='rgba(0,107,63,.3)';
  if(type==='gold')t.style.borderColor='rgba(212,150,10,.3)';
  w.appendChild(t);
  requestAnimationFrame(()=>requestAnimationFrame(()=>t.classList.add('show')));
  setTimeout(()=>{t.classList.remove('show');setTimeout(()=>t.remove(),400);},dur||3500);
}

function confetti(){
  const cols=['#ffd200','#ce1126','#006b3f','#fff','#ffd200'];
  for(let i=0;i<55;i++){
    const p=document.createElement('div');p.className='conf';
    p.style.cssText='left:'+Math.random()*100+'vw;top:-10px;background:'+cols[i%5]+';animation-delay:'+Math.random()*.8+'s;animation-duration:'+(2+Math.random()*1.5)+'s;border-radius:'+(Math.random()>.5?'50%':'2px')+';width:'+(6+Math.random()*6)+'px;height:'+(6+Math.random()*6)+'px;';
    document.body.appendChild(p);setTimeout(()=>p.remove(),4000);
  }
}

function sound(t){
  if(!state.prefs.sound)return;
  try{const c=new(window.AudioContext||window.webkitAudioContext)(),o=c.createOscillator(),g=c.createGain();
  o.connect(g);g.connect(c.destination);
  if(t==='ok'){o.frequency.value=880;g.gain.setValueAtTime(.25,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.4);}
  else if(t==='no'){o.frequency.value=220;g.gain.setValueAtTime(.2,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.3);}
  else{o.frequency.value=600;g.gain.setValueAtTime(.04,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.05);}
  o.start();o.stop(c.currentTime+.5);}catch(e){}
}
let quizStarted=false, challLoaded=false;
function goPage(name){
  document.querySelectorAll('.page,[id^="pg-"]').forEach(p=>{
    if(p.id!=='pg-auth')p.style.display='none';
  });
  document.getElementById('pg-auth').style.display='none';
  const pg=document.getElementById('pg-'+name);
  if(pg){pg.style.display='flex';window.scrollTo(0,0);}
  if(name==='quiz'&&!quizStarted){quizStarted=true;_sessionStart={score:0,total:0,correct:0,xp:0};generateQuestion();}
  if(name==='challenge'&&!challLoaded){challLoaded=true;loadChallenge();}
  if(name==='history')renderHistory();
  if(name==='leaderboard')loadLeaderboard();
  if(name==='badges')renderBadges();
  if(name==='teacher')renderTRoster();
  if(name==='parent')renderChildren();
  if(name==='settings'){
    document.getElementById('pref-name').value=state.prefs.name||'';
    document.getElementById('pref-school').value=state.prefs.school||'';
    document.getElementById('pref-sound').checked=state.prefs.sound;
    document.getElementById('pref-timer').checked=state.prefs.timer;
    document.getElementById('pref-auto').checked=state.prefs.autoAdvance;
    document.getElementById('pref-dark').checked=document.body.classList.contains('dark');
    const dxCb=document.getElementById('pref-dyslexic');if(dxCb)dxCb.checked=document.body.classList.contains('dyslexic');
    const ltCb=document.getElementById('pref-largetext');if(ltCb)ltCb.checked=document.body.style.fontSize==='17px';
    const ageSelEl=document.getElementById('pref-age');
    if(ageSelEl&&state.prefs.age)ageSelEl.value=String(state.prefs.age);
  }
}
function getUsers(){try{return JSON.parse(localStorage.getItem('em_u')||'{}')}catch(e){return{}}}
function saveSession(u){localStorage.setItem('em_s',JSON.stringify(u));}
function loadSession(){try{return JSON.parse(localStorage.getItem('em_s'))}catch(e){return null}}

function showAuthMode(m){
  const isL=m==='login';
  document.getElementById('login-form').style.display=isL?'':'none';
  document.getElementById('signup-form').style.display=isL?'none':'';
  document.getElementById('atab-login').className='auth-tab'+(isL?' active':'');
  document.getElementById('atab-signup').className='auth-tab'+(isL?'':' active');
  ['auth-err','auth-ok'].forEach(id=>{document.getElementById(id).style.display='none';});
}
function showErr(m){const e=document.getElementById('auth-err');e.textContent=m;e.style.display='';}
function showOk(m){const e=document.getElementById('auth-ok');e.textContent=m;e.style.display='';}
function selectRole(r,btn){selectedRole=r;document.querySelectorAll('.role-btn').forEach(b=>b.classList.remove('sel'));btn.classList.add('sel');}
function checkPw(pw){let s=0;if(pw.length>=6)s++;if(pw.length>=10)s++;if(/[A-Z0-9]/.test(pw))s++;if(/[^A-Za-z0-9]/.test(pw))s++;const c=['#ce1126','#e6a800','#ffd200','#006b3f'];['pb1','pb2','pb3','pb4'].forEach((id,i)=>{document.getElementById(id).style.background=i<s?c[s-1]:'';});}
function handleSignup(){
  const name=document.getElementById('su-name').value.trim();
  const email=document.getElementById('su-email').value.trim().toLowerCase();
  const pw=document.getElementById('su-pw').value;
  const confirm=document.getElementById('su-confirm').value;
  const school=document.getElementById('su-school').value.trim();
  if(!name){showErr('Please enter your full name.');return;}
  if(!email.includes('@')){showErr('Please enter a valid email.');return;}
  if(pw.length<6){showErr('Password must be at least 6 characters.');return;}
  if(pw!==confirm){showErr('Passwords do not match.');return;}

  // Use Firebase Auth if available, fallback to localStorage
  if(typeof firebase!=='undefined'&&firebase.auth){
    const btn=document.querySelector('#signup-form .btn.bp');
    if(btn){btn.disabled=true;btn.textContent='Creating account...';}
    firebase.auth().createUserWithEmailAndPassword(email,pw)
      .then(function(cred){
        const user={name,email,school,role:selectedRole,avatar:name.slice(0,2).toUpperCase(),uid:cred.user.uid};
        // Save to Firestore
        return firebase.firestore().collection('users').doc(cred.user.uid).set({
          displayName:name,email,school,role:selectedRole,
          uid:cred.user.uid,createdAt:firebase.firestore.FieldValue.serverTimestamp(),
          lastActive:firebase.firestore.FieldValue.serverTimestamp(),
          quizzesTaken:0,totalScore:0,streakDays:0,ageGroup:''
        }).then(function(){return user;});
      })
      .then(function(user){
        currentUser=user;saveSession(user);
        showOk('Account created! 🎉');
        setTimeout(()=>{applySession();goPage('home');confetti();toast('Welcome, '+name.split(' ')[0]+'! 🇬🇭','🎓','green',4000);},900);
      })
      .catch(function(err){
        if(btn){btn.disabled=false;btn.textContent='Create My Account';}
        const msg=err.code==='auth/email-already-in-use'?'Email already registered.':
                   err.code==='auth/weak-password'?'Password too weak.':err.message;
        showErr(msg);
      });
  } else {
    // Fallback: localStorage
    const users=getUsers();if(users[email]){showErr('Email already registered.');return;}
    const user={name,email,school,role:selectedRole,avatar:name.slice(0,2).toUpperCase()};
    users[email]={...user,pw:btoa(pw)};localStorage.setItem('em_u',JSON.stringify(users));
    saveSession(user);currentUser=user;showOk('Account created! 🎉');
    setTimeout(()=>{applySession();goPage('home');confetti();toast('Welcome, '+name.split(' ')[0]+'! 🇬🇭','🎓','green',4000);},900);
  }
}
function handleLogin(){
  const email=document.getElementById('li-email').value.trim().toLowerCase();
  const pw=document.getElementById('li-pw').value;
  if(!email||!pw){showErr('Please fill in both fields.');return;}

  if(typeof firebase!=='undefined'&&firebase.auth){
    const btn=document.querySelector('#login-form .btn.bp');
    if(btn){btn.disabled=true;btn.textContent='Signing in...';}
    firebase.auth().signInWithEmailAndPassword(email,pw)
      .then(function(cred){
        return firebase.firestore().collection('users').doc(cred.user.uid).get()
          .then(function(doc){
            const data=doc.exists?doc.data():{};
            const user={
              name:data.displayName||email.split('@')[0],
              email,school:data.school||'',
              role:data.role||'student',
              avatar:(data.displayName||email).slice(0,2).toUpperCase(),
              uid:cred.user.uid
            };
            // Update last active
            firebase.firestore().collection('users').doc(cred.user.uid).update({
              lastActive:firebase.firestore.FieldValue.serverTimestamp()
            }).catch(function(){});
            return user;
          });
      })
      .then(function(user){
        currentUser=user;saveSession(user);applySession();goPage('home');
        toast('Welcome back, '+user.name.split(' ')[0]+'! 🇬🇭','👋','gold',3000);
      })
      .catch(function(err){
        if(btn){btn.disabled=false;btn.textContent='Sign In';}
        const msg=err.code==='auth/user-not-found'||err.code==='auth/wrong-password'?'Incorrect email or password.':
                   err.code==='auth/too-many-requests'?'Too many attempts. Please try again later.':err.message;
        showErr(msg);
      });
  } else {
    const users=getUsers();const user=users[email];
    if(!user||user.pw!==btoa(pw)){showErr('Incorrect email or password.');return;}
    const {pw:_,...safe}=user;currentUser=safe;saveSession(safe);applySession();goPage('home');
    toast('Welcome back, '+safe.name.split(' ')[0]+'! 🇬🇭','👋','gold',3000);
  }
}
function demoLogin(role){
  const names={student:'Kwame Asante',teacher:'Ms. Abena Boateng'};
  const u={name:names[role],email:role+'@demo',school:'Nyansa Demo School',role,avatar:names[role].slice(0,2).toUpperCase(),isDemo:true};
  currentUser=u;saveSession(u);applySession();goPage('home');toast('Demo: signed in as '+role,'👤','gold',2500);
}
function applySession(){
  if(!currentUser)return;
  const n=currentUser.name.split(' ')[0];
  const dot=document.getElementById('home-udot');
  const nm=document.getElementById('home-uname');
  if(dot)dot.textContent=currentUser.avatar||n.slice(0,2).toUpperCase();
  if(nm)nm.textContent=n;
  state.prefs.name=currentUser.name;
  state.prefs.school=currentUser.school||'';
}
function handleLogout(){
  if(!confirm('Sign out of Nyansa AI?'))return;
  if(typeof firebase!=='undefined'&&firebase.auth){
    firebase.auth().signOut().catch(function(){});
  }
  localStorage.removeItem('em_s');currentUser=null;
  document.querySelectorAll('.page').forEach(p=>p.style.display='none');
  document.getElementById('pg-auth').style.display='flex';
  toast('Signed out','👋','gold',2000);
}
function savePrefs(){
  state.prefs.name=document.getElementById('pref-name').value.trim();
  state.prefs.school=document.getElementById('pref-school').value.trim();
  state.prefs.sound=document.getElementById('pref-sound').checked;
  state.prefs.timer=document.getElementById('pref-timer').checked;
  state.prefs.autoAdvance=document.getElementById('pref-auto').checked;
  const ageEl=document.getElementById('pref-age');
  if(ageEl){
    state.prefs.age=parseInt(ageEl.value);
    try{
      const ld=JSON.parse(localStorage.getItem('em_learner')||'{}');
      ld.age=state.prefs.age;
      localStorage.setItem('em_learner',JSON.stringify(ld));
    }catch(e){}
  }
  toast('Settings saved! ✓','✓','green',2000);
}
(function(){const s=loadSession();if(s){currentUser=s;applySession();goPage('home');}else{document.getElementById('pg-auth').style.display='flex';}})();
// Restore dark mode preference across sessions
(function(){try{if(localStorage.getItem('nyansa_dark')==='1'){document.body.classList.add('dark');const cb=document.getElementById('pref-dark');if(cb)cb.checked=true;}if(localStorage.getItem('nyansa_dyslexic')==='1'){document.body.classList.add('dyslexic');const cb=document.getElementById('pref-dyslexic');if(cb)cb.checked=true;}if(localStorage.getItem('nyansa_largetext')==='1'){document.body.style.fontSize='17px';const cb=document.getElementById('pref-largetext');if(cb)cb.checked=true;}}catch(e){}})();
function parseJSON(r){return JSON.parse(r.replace(/```json|```/g,'').trim());}
async function ai(prompt,maxT,fallback){
  try{
    const res=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:MODEL,max_tokens:maxT||800,messages:[{role:'user',content:prompt}]})});
    if(!res.ok)throw new Error('HTTP '+res.status);
    const d=await res.json();if(d.error)throw new Error(d.error.message);
    usingFallback=false;
    return d.content.map(c=>c.text||'').join('');
  }catch(e){usingFallback=true;if(fallback)return fallback();throw e;}
}

// Seen-question tracker — ensures no repeat until all questions exhausted
var _seenQs = {};
function getFQ(sub,lvl){
  const bank=BANK[sub];
  const pool=(bank&&bank[lvl])?bank[lvl]:bank?Object.values(bank)[0]:BANK.math.beginner;
  const key=sub+'_'+lvl;
  
  // Build or restore shuffle for this subject+level
  if(!_seenQs[key]||_seenQs[key].remaining.length===0){
    // Shuffle a fresh copy of the pool
    var indices=[...Array(pool.length).keys()];
    for(var i=indices.length-1;i>0;i--){
      var j=Math.floor(Math.random()*(i+1));
      var tmp=indices[i];indices[i]=indices[j];indices[j]=tmp;
    }
    _seenQs[key]={remaining:indices, seen:[]};
  }
  
  // Pop next unseen question
  var idx=_seenQs[key].remaining.pop();
  _seenQs[key].seen.push(idx);
  var q=pool[idx];
  
  // Randomise option order so same question feels different if it does repeat
  var optsCopy=[...q.options];
  var correctText=optsCopy[q.answer];
  for(var i=optsCopy.length-1;i>0;i--){
    var j=Math.floor(Math.random()*(i+1));
    var tmp=optsCopy[i];optsCopy[i]=optsCopy[j];optsCopy[j]=tmp;
  }
  var newAnswer=optsCopy.indexOf(correctText);
  
  return JSON.stringify({question:q.question,options:optsCopy,answer:newAnswer,hint:q.hint,explanation:q.explanation});
}
function getFCards(sub,lvl){
  const bank=BANK[sub];const pool=(bank&&bank[lvl])?bank[lvl]:bank?Object.values(bank)[0]:BANK.math.beginner;
  return JSON.stringify([...pool].sort(()=>Math.random()-.5).slice(0,Math.min(10,pool.length)).map(q=>({front:q.question,back:q.options[q.answer]+' — '+q.explanation})));
}
function startTimer(){
  clearInterval(state.timerInterval);
  const ring=document.getElementById('t-ring');
  if(!state.prefs.timer){if(ring)ring.style.display='none';return;}
  if(ring)ring.style.display='';
  state.timerVal=30;updateTimerUI();
  state.timerInterval=setInterval(()=>{
    state.timerVal--;updateTimerUI();
    if(state.timerVal<=5)sound('tick');
    if(state.timerVal<=0){
      clearInterval(state.timerInterval);
      if(!state.answered){
        state.answered=true;
        document.getElementById('q-feedback').innerHTML='<div class="ebox">Time is up!</div>';
        document.getElementById('q-hint-btn').style.display='none';
        document.getElementById('q-next-btn').style.display='';
        document.querySelectorAll('.opt').forEach(b=>b.disabled=true);
        if(state.currentQ&&state.currentQ.options)document.querySelectorAll('.opt')[state.currentQ.answer].className='opt correct';
        state.streak=0;state.total++;state.questionNum++;updateQUI();
      }
    }
  },1000);
}
function stopTimer(){clearInterval(state.timerInterval);}
function updateTimerUI(){
  const c=document.getElementById('t-circle'),n=document.getElementById('t-num');if(!c||!n)return;
  const t=state.timerVal;c.style.strokeDashoffset=113*(1-t/30);
  const col=t>10?'var(--gold)':t>5?'#e6a800':'#ce1126';c.style.stroke=col;
  n.textContent=t;n.style.color=t>10?'var(--text)':col;
}
function getQSub(){const s=document.getElementById('q-sub').value;if(s==='auto'){const a=['math','english','science','history','economics','rme','socialstudies','government'];return a[state.questionNum%a.length];}return s;}
function getQLvl(){const o=document.getElementById('q-lvl').value;return o==='auto'?state.difficulty:o;}
function getQMode(){const m=document.getElementById('q-mode').value;if(m==='mixed')return state.questionNum%3===2?'written':'mcq';return m;}

var _aiQ=[];var _pfBusy=false;
async function _prefetch(sub,lvl,mode){
  if(_pfBusy||usingFallback)return;_pfBusy=true;
  var isW=mode==='written';
  // GES 2024-2026 curriculum context for new subjects
  var subjectContext = {
    owop: 'Our World Our People (OWOP) — Ghana GES primary subject (Basic 1-6) with 5 strands: All About Us, Our Environment, Our Communities, Our Nation Ghana, The Wider World. Covers family, environment, communities, national symbols, Ghana regions, Africa, and global issues.',
    careertech: 'Career Technology — new Ghana GES JHS (CCP) subject covering: Entrepreneurship, Agriculture & Environment, Home Economics, Visual Arts & Design, Technical Drawing, ICT & Electronics, and STEM Projects. Replaces old Technical/Vocational studies.',
    cad: 'Creative Arts and Design (CAD) — new Ghana GES JHS (CCP) subject combining 4 disciplines: Design, Visual Arts, Music, and Dance & Drama. 200 minutes/week. Integrates Ghanaian cultural heritage.',
    historygh: 'History of Ghana — GES standalone subject covering pre-colonial kingdoms, colonialism, independence (1957), Nkrumah era, political transitions, 1992 constitution, and modern Ghana.',
    coding: 'Computing/ICT — Ghana GES CCP subject covering digital literacy, computational thinking, programming basics, robotics (JHS), cybersecurity, and data management.',
  };
  var ctx = subjectContext[sub] ? ' Context: '+subjectContext[sub] : '';
  var subLabel = {owop:'Our World Our People (OWOP)',careertech:'Career Technology',cad:'Creative Arts and Design (CAD)',historygh:'History of Ghana'}[sub] || sub;
  var p=isW?'Generate a '+lvl+'-level '+subLabel+' short-answer question for a Ghanaian student.'+ctx+' Return ONLY JSON: {"question":"...","sampleAnswer":"...","hint":"...","explanation":"..."}'
    :'Generate a unique '+lvl+'-level '+subLabel+' multiple choice question for a Ghanaian student.'+ctx+' Return ONLY JSON: {"question":"...","options":["a","b","c","d"],"answer":0,"hint":"...","explanation":"..."}. answer is 0-3.';
  try{var r=await ai(p,600);var q=parseJSON(r);q.subject=sub;q.mode=isW?'written':'mcq';q.difficulty=lvl;if(_aiQ.length<3)_aiQ.push(q);}catch(e){usingFallback=true;}
  _pfBusy=false;
}
function generateQuestion(){
  if(state.generating)return;
  state.generating=true;state.answered=false;state.hintUsed=false;
  stopTimer();
  ['q-hint','q-feedback','q-trans'].forEach(id=>{const el=document.getElementById(id);if(el)el.innerHTML='';});
  document.getElementById('q-next-btn').style.display='none';
  document.getElementById('q-hint-btn').style.display='';
  document.getElementById('q-trans-btn').style.display='none';
  document.getElementById('q-options').innerHTML='';
  document.getElementById('q-written').style.display='none';
  document.getElementById('q-written-input').value='';
  document.getElementById('q-sub-written').disabled=false;
  const sub=getQSub(),mode=getQMode(),lvl=getQLvl();
  document.getElementById('q-sub-chip').textContent=sub.charAt(0).toUpperCase()+sub.slice(1);
  document.getElementById('q-diff-lbl').textContent=lvl.charAt(0).toUpperCase()+lvl.slice(1);
  document.getElementById('q-num-lbl').textContent='Q'+(state.questionNum+1);
  document.getElementById('q-pbar').style.width=Math.min(100,((state.questionNum%20)/20)*100)+'%';
  var bq=null;
  var ai_idx=_aiQ.findIndex(function(x){return x.subject===sub&&x.difficulty===lvl;});
  if(ai_idx>=0){bq=_aiQ.splice(ai_idx,1)[0];}
  else{try{bq=parseJSON(getFQ(sub,lvl));bq.subject=sub;bq.mode=mode==='written'?'written':'mcq';bq.difficulty=lvl;}catch(e){}}
  if(bq){
    state.currentQ=bq;
    document.getElementById('q-question').innerHTML='<div class="q-text">'+esc(bq.question)+'</div>';
    if(bq.mode==='written'){document.getElementById('q-written').style.display='';}
    else{var ba=document.getElementById('q-options');ba.innerHTML='';bq.options.forEach(function(opt,i){var btn=document.createElement('button');btn.type='button';btn.className='opt';btn.textContent=opt;btn.onclick=(function(ii){return function(){answerMCQ(ii);};})(i);ba.appendChild(btn);});}
    startTimer();
    var lp=document.getElementById('q-translang')&&document.getElementById('q-translang').value;
    if(lp&&lp!=='none')translateAns(lp);
  } else {
    document.getElementById('q-question').innerHTML='<div class="ebox">Could not load. Try again.</div>';
    document.getElementById('q-next-btn').style.display='';
  }
  state.generating=false;
  setTimeout(function(){_prefetch(sub,lvl,mode);},400);
}

function answerMCQ(idx){
  if(state.answered||!state.currentQ)return;
  state.answered=true;const q=state.currentQ;
  const btns=document.querySelectorAll('.opt');btns.forEach(b=>b.disabled=true);
  const correct=idx===q.answer;
  btns[idx].className='opt '+(correct?'correct':'wrong');
  if(!correct)btns[q.answer].className='opt correct';
  recordAnswer(correct,q);
}
async function submitWritten(){
  if(state.answered||!state.currentQ)return;
  const ans=document.getElementById('q-written-input').value.trim();if(!ans)return;
  document.getElementById('q-sub-written').disabled=true;
  document.getElementById('q-feedback').innerHTML='<div class="lr"><div class="sp"></div>Marking...</div>';
  state.answered=true;const q=state.currentQ;
  const prompt='You are a teacher. Q: "'+q.question+'" Sample: "'+q.sampleAnswer+'" Student: "'+ans+'" Return ONLY JSON: {"correct":true/false,"score":0-10,"feedback":"2 sentences"}';
  try{
    const raw=await ai(prompt,400,()=>JSON.stringify({correct:ans.length>20,score:ans.length>20?7:4,feedback:ans.length>20?'Good effort! Your answer covers key points.':'Try a more detailed answer next time.'}));
    const r=parseJSON(raw);recordAnswer(r.score>=6,q,r.feedback);
  }catch(e){document.getElementById('q-feedback').innerHTML='<div class="ebox">Could not mark. Try again.</div>';state.answered=false;document.getElementById('q-sub-written').disabled=false;}
}
function recordAnswer(correct,q,customFb){
  stopTimer();
  if(correct){state.score++;state.correct++;state.streak++;sound('ok');}else{state.streak=0;sound('no');}
  state.total++;state.questionNum++;
  const xpGain=correct?(state.hintUsed?5:10)*(q.difficulty==='advanced'?3:q.difficulty==='intermediate'?2:1):2;
  state.xp+=xpGain;
  if(!state.subjectStats[q.subject])state.subjectStats[q.subject]={correct:0,total:0};
  state.subjectStats[q.subject].total++;if(correct)state.subjectStats[q.subject].correct++;
  updateQUI();adaptDiff();checkMilestones();checkBadges();
  const fb=document.getElementById('q-feedback');
  if(customFb){fb.innerHTML='<div class="fbox">'+esc(customFb)+(q.sampleAnswer?'<br><span style="opacity:.7;font-size:12px;">Sample: '+esc(q.sampleAnswer)+'</span>':'')+'</div>';}
  else{fb.innerHTML='<div class="'+(correct?'fbox':'ebox')+'">'+(correct?'Correct! +'+xpGain+' XP':'Wrong. Answer: <strong>'+esc(q.options[q.answer])+'</strong>')+(q.explanation?'<br><span style="opacity:.75;font-size:12px;">'+esc(q.explanation)+'</span>':'')+'</div>';}
  document.getElementById('q-hint-btn').style.display='none';
  document.getElementById('q-next-btn').style.display='';
  document.getElementById('q-next-btn').textContent='Next →';
  document.getElementById('q-trans-btn').style.display='';
  setTimeout(function(){if(state.answered)generateQuestion();},1500);
  state.history.unshift({q:q.question.slice(0,65)+(q.question.length>65?'...':''),subject:q.subject,correct,xp:xpGain});
  if(state.history.length>100)state.history.pop();
  updateHomeStats();
  if(typeof _checkScoreMilestone==="function")_checkScoreMilestone();
}
function showHint(){if(state.answered||state.hintUsed||!state.currentQ)return;state.hintUsed=true;document.getElementById('q-hint').innerHTML='<div class="hbox">💡 '+esc(state.currentQ.hint)+'</div>';document.getElementById('q-hint-btn').style.display='none';}
function skipQ(){state.questionNum++;state.streak=0;generateQuestion();}
function nextQ(){generateQuestion();}
function adaptDiff(){
  if(state.total<5||document.getElementById('q-lvl').value!=='auto')return;
  const acc=state.correct/state.total;
  if(acc>=0.78&&state.difficulty!=='advanced')state.difficulty=state.difficulty==='beginner'?'intermediate':'advanced';
  else if(acc<=0.42&&state.difficulty!=='beginner')state.difficulty=state.difficulty==='advanced'?'intermediate':'beginner';
}
function updateQUI(){
  [['q-sc',state.score],['q-tot',state.total],['q-acc',state.total?Math.round(state.correct/state.total*100)+'%':'—'],['q-xp',state.xp]].forEach(([id,v])=>{const el=document.getElementById(id);if(el)el.textContent=v;});
  const chip=document.getElementById('qlvl-chip');if(chip){if(state.xp>=500){chip.textContent='Master';chip.className='chip cgr';}else if(state.xp>=200){chip.textContent='Advanced';chip.className='chip cgr';}else if(state.xp>=80){chip.textContent='Intermediate';chip.className='chip cg';}else{chip.textContent='Beginner';chip.className='chip cg';}}
}
function updateHomeStats(){
  [['h-xp',state.xp],['h-qs',state.total],['h-acc',state.total?Math.round(state.correct/state.total*100)+'%':'—'],['h-str',state.streak]].forEach(([id,v])=>{const el=document.getElementById(id);if(el)el.textContent=v;});
}
async function translateAns(langOverride){
  if(!state.currentQ)return;
  const answer=state.currentQ.options?state.currentQ.options[state.currentQ.answer]:(state.currentQ.sampleAnswer||'');
  const text=answer+(state.currentQ.explanation?' — '+state.currentQ.explanation:'');
  document.getElementById('q-trans').innerHTML='<div class="lr"><div class="sp"></div>Translating into Ghanaian languages...</div>';
  const prompt='Translate this educational answer into 6 Ghanaian languages for a student. Keep it simple.\nAnswer: "'+text.slice(0,280)+'"\nReturn ONLY JSON: {"Twi":"...","Fante":"...","Ewe":"...","Ga":"...","Hausa":"...","Dagbani":"..."}';
  try{
    const raw=await ai(prompt,600,()=>JSON.stringify({Twi:'(Download the file for full Twi translation)',Fante:'(Download file for Fante translation)',Ewe:'(Download file for Ewe translation)',Ga:'(Download file for Ga translation)',Hausa:'(Download file for Hausa translation)',Dagbani:'(Download file for Dagbani translation)'}));
    const r=parseJSON(raw);
    const items=Object.entries(r).map(([l,t])=>'<div class="t-item"><div class="t-lang">'+l+'</div><div class="t-text">'+esc(t)+'</div></div>').join('');
    document.getElementById('q-trans').innerHTML='<div class="tbox"><div class="tbox-h">🌍 In Ghanaian Languages</div><div class="tbox-grid">'+items+'</div></div>';
  }catch(e){document.getElementById('q-trans').innerHTML='<div class="ebox">Could not translate.</div>';}
}
async function sendChat(){
  // Delegates to the full learning engine sendChat (defined below, wins via hoisting)
  // This stub exists only because the HTML calls sendChat() before scripts finish loading
}
function quickAsk(q){const i=document.getElementById('chat-input');if(i){i.value=q;sendChat();}}
async function gradeEssay(){
  const text=document.getElementById('essay-txt').value.trim();if(!text)return;
  const subject=document.getElementById('essay-sub').value;
  const level=document.getElementById('essay-lvl').value;
  const promptQ=document.getElementById('essay-prompt').value.trim();
  document.getElementById('essay-loading').style.display='flex';
  document.getElementById('essay-result').innerHTML='';
  document.getElementById('essay-btn').disabled=true;
  const prompt='You are an expert '+subject+' teacher assessing a '+level+'-level Ghanaian student.'+(promptQ?'\nEssay prompt: "'+promptQ+'"':'')+(typeof V5Lang!=='undefined'&&V5Lang.get()!=='English'?'\nThe student\'s language preference is '+V5Lang.get()+'. Write your feedback summary and suggestions in '+V5Lang.get()+' if possible.':'')+'\nAssess this response. Return ONLY JSON:\n{"score":1-10,"grade":"A/B/C/D/F","summary":"2 sentence verdict","strengths":["s1","s2","s3"],"improvements":["i1","i2","i3"],"structure":1-10,"content":1-10,"language":1-10,"rewriteSuggestion":"rewrite the weakest sentence"}\n\nStudent response: "'+text.slice(0,2000)+'"';
  try{
    const raw=await ai(prompt,900,()=>JSON.stringify({score:7,grade:'B',summary:'The response shows reasonable understanding. There is room to improve structure and depth.',strengths:['Clear main idea','Appropriate vocabulary','Relevant content'],improvements:['Develop paragraphs further','Add stronger conclusion','Check grammar'],structure:7,content:7,language:6,rewriteSuggestion:'Consider opening with a clear thesis statement.'}));
    const r=parseJSON(raw);
    const gcol=r.score>=8?'#006b3f':r.score>=5?'#d4960a':'#ce1126';
    const gbg=r.score>=8?'rgba(0,107,63,.08)':r.score>=5?'rgba(212,150,10,.08)':'rgba(206,17,38,.07)';
    const gc=r.score>=8?'cgr':r.score>=5?'cg':'cr';
    document.getElementById('essay-result').innerHTML='<div class="card cp"><div class="grade-big"><div class="grade-circle" style="background:'+gbg+';color:'+gcol+';border:2px solid '+gcol+';">'+r.grade+'</div><div><div style="font-family:var(--fh);font-size:1.2rem;font-weight:800;">'+r.score+'/10</div><div style="font-size:12px;color:var(--muted);">Overall Score</div></div><span class="chip '+gc+'" style="margin-left:auto;">'+r.grade+' Grade</span></div><p style="font-size:13px;color:var(--muted);line-height:1.7;margin-bottom:1rem;">'+esc(r.summary)+'</p><div class="g2" style="margin-bottom:1rem;gap:8px;"><div class="met"><div class="mv">'+r.structure+'/10</div><div class="ml">Structure</div></div><div class="met"><div class="mv">'+r.content+'/10</div><div class="ml">Content</div></div><div class="met"><div class="mv">'+r.language+'/10</div><div class="ml">Language</div></div><div></div></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:1rem;"><div class="str-box"><div class="sh">Strengths</div>'+r.strengths.map(s=>'<li>'+esc(s)+'</li>').join('')+'</div><div class="imp-box"><div class="sh">Improve</div>'+r.improvements.map(s=>'<li>'+esc(s)+'</li>').join('')+'</div></div><div class="rw-box"><div class="rh">Suggested rewrite</div><div class="rt">'+esc(r.rewriteSuggestion)+'</div></div></div>';
  }catch(e){document.getElementById('essay-result').innerHTML='<div class="ebox">Could not grade. Please try again.</div>';}
  document.getElementById('essay-loading').style.display='none';
  document.getElementById('essay-btn').disabled=false;
}
async function generateFlashcards(){
  const sub=document.getElementById('fc-sub').value,lvl=document.getElementById('fc-lvl').value;
  document.getElementById('fc-loading').style.display='flex';
  document.getElementById('fc-area').style.display='none';
  document.getElementById('fc-empty').style.display='none';
  document.getElementById('fc-btn').disabled=true;
  try{
    const fcLang=(typeof V5Lang!=='undefined'&&V5Lang.get()!=='English')?' Respond in '+V5Lang.get()+' where possible, with English terms in brackets.':'';
    const raw=await ai('Generate 10 '+lvl+' level '+sub+' flashcards for a Ghanaian student.'+fcLang+' Return ONLY a JSON array: [{"front":"...","back":"..."},...]',900,()=>getFCards(sub,lvl));
    state.fcDeck=parseJSON(raw);state.fcIndex=0;state.fcRatings={};
    document.getElementById('fc-loading').style.display='none';
    document.getElementById('fc-area').style.display='';
    document.getElementById('flashcard').classList.remove('flipped');
    renderFC();toast('Deck ready! '+state.fcDeck.length+' cards','📚','gold');
  }catch(e){document.getElementById('fc-loading').style.display='none';document.getElementById('fc-empty').innerHTML='<div class="ebox">Could not generate. Try again.</div>';document.getElementById('fc-empty').style.display='';}
  document.getElementById('fc-btn').disabled=false;
}
function renderFC(){
  if(!state.fcDeck.length)return;
  const c=state.fcDeck[state.fcIndex];
  document.getElementById('fc-front-txt').textContent=c.front;
  document.getElementById('fc-back-txt').textContent=c.back;
  document.getElementById('fc-counter').textContent=(state.fcIndex+1)+' / '+state.fcDeck.length;
  document.getElementById('fc-badge').textContent=(state.fcIndex+1)+' / '+state.fcDeck.length;
  document.getElementById('flashcard').classList.remove('flipped');
  if(Object.keys(state.fcRatings).length===state.fcDeck.length){
    const e=Object.values(state.fcRatings).filter(r=>r==='easy').length;
    const ok=Object.values(state.fcRatings).filter(r=>r==='ok').length;
    state.xp+=(e*5+ok*2);updateQUI();updateHomeStats();
    document.getElementById('fc-summary').innerHTML='<div class="fbox">Deck complete! Easy: '+e+' · Got it: '+ok+' · +'+((e*5+ok*2))+' XP earned</div>';
    if(e>=7)confetti();
  }else document.getElementById('fc-summary').innerHTML='';
}
function flipCard(){document.getElementById('flashcard').classList.toggle('flipped');}
function rateCard(r){state.fcRatings[state.fcIndex]=r;if(state.fcIndex<state.fcDeck.length-1){state.fcIndex++;renderFC();}else renderFC();}
function nextCard(){if(state.fcIndex<state.fcDeck.length-1){state.fcIndex++;renderFC();}}
function prevCard(){if(state.fcIndex>0){state.fcIndex--;renderFC();}}
async function loadChallenge(){
  document.getElementById('chall-content').innerHTML='<div class="lr"><div class="sp"></div>Generating challenge...</div>';
  document.getElementById('chall-ans-area').style.display='none';
  document.getElementById('chall-result').innerHTML='';
  document.getElementById('chall-new').disabled=true;
  const subs=['math','english','science','history','economics'];
  const sub=subs[Math.floor(Math.random()*subs.length)];
  try{
    const raw=await ai('Generate a challenging multi-step '+sub+' problem for a Ghanaian secondary student. Return ONLY JSON: {"subject":"'+sub+'","title":"short title","problem":"2-4 sentence problem","parts":["part a","part b"],"hint":"helpful nudge","sampleAnswer":"full model answer"}',800,()=>JSON.stringify({subject:sub,title:'Mixed Problem',problem:'A student scores 72, 85, 63, 90, and 78 in five subjects. Calculate the mean score and determine if they qualify for merit award (mean ≥ 80). Also find the range.',parts:['Calculate the mean score.','Does the student qualify? Show reasoning and find the range.'],hint:'Mean = sum ÷ count. Range = highest − lowest.',sampleAnswer:'Sum=388. Mean=77.6. NOT qualify. Range=90-63=27.'}));
    const ch=parseJSON(raw);
    document.getElementById('chall-content').innerHTML='<span class="chip cg" style="margin-bottom:10px;display:inline-block;">'+esc(ch.subject)+'</span><div style="font-family:var(--fh);font-size:1rem;font-weight:700;margin-bottom:.6rem;">'+esc(ch.title)+'</div><div style="font-size:14px;line-height:1.75;margin-bottom:.8rem;">'+esc(ch.problem)+'</div>'+ch.parts.map((p,i)=>'<div style="font-size:13px;font-weight:700;color:var(--gold);margin:.4rem 0 .2rem;">Part '+String.fromCharCode(65+i)+':</div><div style="font-size:13px;color:var(--muted);margin-bottom:.4rem;">'+esc(p)+'</div>').join('')+'<div id="chall-hint-area"></div><button class="btn bs bsm" onclick="showChallHint(\''+esc(ch.hint).replace(/'/g,"&#39;")+'\')" style="margin-top:.8rem;">Show Hint (−5 XP)</button>';
    document.getElementById('chall-ans-area').style.display='';
    document.getElementById('chall-input').dataset.sample=ch.sampleAnswer;
  }catch(e){document.getElementById('chall-content').innerHTML='<div class="ebox">Could not generate challenge. Try again.</div>';}
  document.getElementById('chall-new').disabled=false;
}
function showChallHint(h){state.xp=Math.max(0,state.xp-5);updateQUI();updateHomeStats();document.getElementById('chall-hint-area').innerHTML='<div class="hbox">💡 '+esc(h)+'</div>';}
async function submitChallenge(){
  const ans=document.getElementById('chall-input').value.trim();const sample=document.getElementById('chall-input').dataset.sample||'';
  if(!ans)return;document.getElementById('chall-btn').disabled=true;
  document.getElementById('chall-result').innerHTML='<div class="lr"><div class="sp"></div>AI is marking...</div>';
  const prompt='Grade this challenge response.\nSample: "'+sample+'"\nStudent: "'+ans.slice(0,1500)+'"\nReturn ONLY JSON: {"score":0-10,"grade":"A-F","feedback":"3 sentences","bonusXP":0-50}';
  try{
    const raw=await ai(prompt,400,()=>JSON.stringify({score:ans.length>50?8:5,grade:ans.length>50?'B':'C',feedback:ans.length>50?'Good attempt! You showed clear working.':'Try to show more detailed working.',bonusXP:ans.length>50?25:10}));
    const r=parseJSON(raw);const bonus=r.score>=7?(r.bonusXP||30):5;
    state.xp+=bonus;updateQUI();updateHomeStats();checkBadges();
    document.getElementById('chall-result').innerHTML='<div class="fbox"><div style="display:flex;gap:8px;align-items:center;margin-bottom:8px;"><span class="chip '+(r.score>=8?'cgr':r.score>=5?'cg':'cr')+'">'+r.grade+' · '+r.score+'/10</span><span style="font-size:12px;color:var(--muted);">+'+bonus+' bonus XP</span></div>'+esc(r.feedback)+'</div>';
  }catch(e){document.getElementById('chall-result').innerHTML='<div class="ebox">Could not mark. Try again.</div>';}
  document.getElementById('chall-btn').disabled=false;
}
async function generateStudyPlan(){
  const goal=document.getElementById('sp-goal').value;
  const weeks=document.getElementById('sp-weeks').value;
  const weak=document.getElementById('sp-weak').value;
  const hrs=document.getElementById('sp-hrs').value;
  document.getElementById('sp-loading').style.display='flex';
  document.getElementById('sp-result').innerHTML='';
  document.getElementById('sp-btn').disabled=true;
  const spLang=(typeof V5Lang!=='undefined'&&V5Lang.get()!=='English')?' Write the plan titles and task descriptions in '+V5Lang.get()+'.':'';
  const prompt='Create a '+weeks+'-week study plan for a Ghanaian student preparing for '+goal+'. Weakest in '+weak+', can study '+hrs+' hours/day.'+spLang+' Return ONLY a JSON array of 7 days: [{"day":1,"title":"Day title","tasks":["task 1 (30 min)","task 2 (45 min)"]},...]. Max 3 tasks per day. Be specific and actionable.';
  const subs=['Math','English','Science','Economics','History'];
  const fbPlan=()=>JSON.stringify(Array.from({length:7},(_,i)=>({day:i+1,title:'Day '+(i+1)+': '+subs[i%5]+' focus',tasks:['Review '+subs[i%5]+' notes ('+Math.round(parseInt(hrs)*20)+' min)','Practice 10 questions (30 min)','Summarise chapter ('+Math.round(parseInt(hrs)*15)+' min)']})));
  try{
    const raw=await ai(prompt,1000,fbPlan);
    const plan=parseJSON(raw);state.planTasks={};
    document.getElementById('sp-result').innerHTML=plan.map(d=>
      '<div class="sp-day"><div style="display:flex;align-items:center;gap:10px;margin-bottom:.8rem;"><div class="sp-num">'+d.day+'</div><div style="font-family:var(--fh);font-size:.9rem;font-weight:700;">'+esc(d.title)+'</div></div>'+
      d.tasks.map((t,ti)=>{const k='d'+d.day+'t'+ti;return '<div class="sp-task"><div class="tck" id="'+k+'" onclick="toggleTask(\''+k+'\')"></div><span style="font-size:13px;color:var(--muted);">'+esc(t)+'</span></div>';}).join('')+'</div>'
    ).join('');
    toast('Study plan ready! '+plan.length+' days planned','📅','gold');
  }catch(e){document.getElementById('sp-result').innerHTML='<div class="ebox">Could not generate plan. Try again.</div>';}
  document.getElementById('sp-loading').style.display='none';
  document.getElementById('sp-btn').disabled=false;
}
function toggleTask(k){const el=document.getElementById(k);if(!el)return;state.planTasks[k]=!state.planTasks[k];el.className='tck'+(state.planTasks[k]?' done':'');el.textContent=state.planTasks[k]?'✓':'';const done=Object.values(state.planTasks).filter(Boolean).length;const total=document.querySelectorAll('.tck').length;if(done===total&&total>0){toast('All tasks complete! 🎉','🏆','green');confetti();}}
let clsStudents=[];
function launchClassroom(){
  const code=Math.random().toString(36).substr(2,6).toUpperCase();
  document.getElementById('cls-code').textContent=code;
  document.getElementById('cls-session').style.display='';
  document.getElementById('cls-launch').style.display='none';
  document.getElementById('cls-end').style.display='';
  document.getElementById('cls-status').textContent='Active';
  document.getElementById('cls-status').className='chip cgr';
  clsStudents=[];
  const names=['Kwame A.','Ama B.','Kofi C.','Efua D.','Yaw E.','Akua F.','Mansa G.'];
  let i=0;const iv=setInterval(()=>{if(i>=names.length){clearInterval(iv);setTimeout(loadClsQ,600);return;}clsStudents.push({name:names[i],answered:false,score:0});renderClsStudents();i++;},600);
  toast('Session launched! Students joining...','📡','gold');
}
async function loadClsQ(){
  const sub=document.getElementById('cls-sub').value,lvl=document.getElementById('cls-lvl').value;
  document.getElementById('cls-live-q').innerHTML='<div class="lr"><div class="sp"></div>Loading question...</div>';
  try{
    const raw=await ai('Generate a '+lvl+' '+sub+' multiple choice question for a live quiz. Return ONLY JSON: {"question":"...","options":["a","b","c","d"],"answer":0}',400,()=>getFQ(sub,lvl));
    const q=parseJSON(raw);
    document.getElementById('cls-live-q').innerHTML='<div class="qcard"><div class="q-text">'+esc(q.question)+'</div><div class="g2" style="gap:8px;">'+q.options.map((o,i)=>'<div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--r);padding:10px 12px;font-size:13px;"><strong>'+String.fromCharCode(65+i)+'.</strong> '+esc(o)+'</div>').join('')+'</div></div>';
    setTimeout(()=>{clsStudents.forEach(s=>{s.answered=true;s.score=Math.random()>.4?1:0;});renderClsStudents();const c=clsStudents.filter(s=>s.score).length;document.getElementById('cls-results').innerHTML='<div class="fbox">'+c+'/'+clsStudents.length+' correct! ✓ Answer: <strong>'+esc(q.options[q.answer])+'</strong></div>';},3500);
  }catch(e){document.getElementById('cls-live-q').innerHTML='<div class="ebox">Could not load question.</div>';}
}
function renderClsStudents(){
  document.getElementById('cls-count').textContent=clsStudents.length;
  document.getElementById('cls-students').innerHTML=clsStudents.map(s=>'<div class="live-row"><div class="ldot '+(s.answered?'wt':'on')+'"></div><span style="flex:1;font-size:13px;">'+esc(s.name)+'</span><span class="chip '+(s.answered?(s.score?'cgr':'cr'):'cgray')+'" style="font-size:11px;">'+(s.answered?(s.score?'Correct ✓':'Wrong ✗'):'Waiting...')+'</span></div>').join('');
}
function endClassroom(){
  document.getElementById('cls-session').style.display='none';
  document.getElementById('cls-launch').style.display='';
  document.getElementById('cls-end').style.display='none';
  document.getElementById('cls-status').textContent='Inactive';
  document.getElementById('cls-status').className='chip cgray';
  document.getElementById('cls-results').innerHTML='';
  document.getElementById('cls-live-q').innerHTML='';
  toast('Session ended','📡','gold',2500);
}
let children=[];
function addChild(){
  const name=document.getElementById('child-name').value.trim();
  const school=document.getElementById('child-school').value.trim();
  if(!name)return;
  const cols=['rgba(212,150,10,.12)','rgba(0,107,63,.1)','rgba(206,17,38,.08)'];
  const tc=['#8a6000','#006b3f','#ce1126'];
  const idx=children.length%3;
  children.push({name,school,xp:Math.floor(Math.random()*300+50),acc:Math.floor(Math.random()*30+55),total:Math.floor(Math.random()*40+10),color:cols[idx],textColor:tc[idx]});
  document.getElementById('child-name').value='';
  document.getElementById('child-school').value='';
  renderChildren();
}
function renderChildren(){
  const el=document.getElementById('children-list');
  if(!children.length){el.innerHTML='<p style="font-size:13px;color:var(--muted);text-align:center;padding:2rem;">No children added yet.</p>';return;}
  el.innerHTML=children.map(c=>'<div class="pcard"><div style="display:flex;align-items:center;gap:12px;margin-bottom:.8rem;"><div class="avatar" style="background:'+c.color+';color:'+c.textColor+';">'+c.name.slice(0,2).toUpperCase()+'</div><div style="flex:1;"><div style="font-weight:600;font-size:14px;">'+esc(c.name)+'</div><div style="font-size:12px;color:var(--muted);">'+esc(c.school||'School not set')+' · Active today</div></div><span class="chip cg">'+c.xp+' XP</span></div><div class="g4" style="margin-bottom:.8rem;"><div class="met"><div class="mv">'+c.acc+'%</div><div class="ml">Accuracy</div></div><div class="met"><div class="mv">'+c.total+'</div><div class="ml">Questions</div></div><div class="met"><div class="mv">'+c.xp+'</div><div class="ml">XP</div></div><div></div></div><div class="prog"><div class="prog-fill" style="width:'+c.acc+'%;"></div></div></div>').join('');
}
let tStudents=[];
function addTStudent(){
  const name=document.getElementById('t-name').value.trim();const level=document.getElementById('t-lvl').value;if(!name)return;
  const cols=['rgba(212,150,10,.12)','rgba(0,107,63,.1)','rgba(206,17,38,.08)'];const tc=['#8a6000','#006b3f','#ce1126'];const idx=tStudents.length%3;
  tStudents.push({name,level,xp:0,score:0,total:0,color:cols[idx],textColor:tc[idx]});
  document.getElementById('t-name').value='';renderTRoster();
}
function renderTRoster(){
  const sel=document.getElementById('t-cq-stu');const prev=sel.value;
  sel.innerHTML='<option value="">Select student</option>'+tStudents.map((s,i)=>'<option value="'+i+'">'+esc(s.name)+'</option>').join('');
  if(prev)sel.value=prev;
  document.getElementById('t-count').textContent=tStudents.length;
  const avg=tStudents.length?Math.round(tStudents.reduce((a,s)=>a+s.xp,0)/tStudents.length):0;
  document.getElementById('t-avg').textContent=avg||'—';
  const el=document.getElementById('t-roster');
  if(!tStudents.length){el.innerHTML='<p style="font-size:13px;color:var(--muted);">No students added yet.</p>';return;}
  el.innerHTML=tStudents.map((s,i)=>'<div class="stu-row"><div class="avatar" style="background:'+s.color+';color:'+s.textColor+';">'+s.name.slice(0,2).toUpperCase()+'</div><div style="flex:1;min-width:0;"><div style="font-size:13px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+esc(s.name)+'</div><div style="font-size:11px;color:var(--muted);">'+s.level+' · '+s.xp+' XP'+(s.total?' · '+Math.round(s.score/s.total*100)+'% acc':'')+' </div></div><button class="btn bs bsm" onclick="removeTStu('+i+')" style="padding:4px 8px;font-size:11px;">✕</button></div>').join('');
}
function removeTStu(i){tStudents.splice(i,1);renderTRoster();}
async function assignQuiz(){
  const idx=document.getElementById('t-cq-stu').value;
  const sub=document.getElementById('t-cq-sub').value;
  const lvl=document.getElementById('t-cq-lvl').value;
  if(idx===''){document.getElementById('t-assign-result').innerHTML='<div class="ebox">Please select a student.</div>';return;}
  const stu=tStudents[parseInt(idx)];
  document.getElementById('t-assign-result').innerHTML='<div class="lr"><div class="sp"></div>Generating quiz for '+esc(stu.name)+'...</div>';
  try{
    const raw=await ai('Generate 3 '+lvl+' level '+sub+' MCQ questions for a Ghanaian student. Return ONLY a JSON array: [{"question":"...","options":["a","b","c","d"],"answer":0,"explanation":"..."},...]',800,()=>{const bank=BANK[sub];const pool=(bank&&bank[lvl])?bank[lvl]:bank?Object.values(bank)[0]:BANK.math.beginner;return JSON.stringify(pool.slice(0,3).map(q=>({question:q.question,options:q.options,answer:q.answer,explanation:q.explanation})));});
    const qs=parseJSON(raw);const score=Math.floor(Math.random()*qs.length+1);
    stu.total+=qs.length;stu.score+=score;stu.xp+=score*10;renderTRoster();
    document.getElementById('t-assign-result').innerHTML='<div class="fbox"><strong>'+esc(stu.name)+'</strong> completed a '+qs.length+'-question '+sub+' quiz. Score: '+score+'/'+qs.length+' · +'+score*10+' XP</div>';
  }catch(e){document.getElementById('t-assign-result').innerHTML='<div class="ebox">Could not generate quiz. Try again.</div>';}
}
function exportReport(){
  const lines=['Nyansa AI — Progress Report','Generated: '+new Date().toLocaleString(),'','=== SESSION ===','Score: '+state.score,'Questions: '+state.total,'Accuracy: '+(state.total?Math.round(state.correct/state.total*100)+'%':'—'),'XP: '+state.xp,'','=== SUBJECTS ==='];
  Object.entries(state.subjectStats).forEach(([s,v])=>lines.push(s+': '+v.correct+'/'+v.total+' ('+Math.round(v.correct/v.total*100)+'%)'));
  if(tStudents.length){lines.push('','=== STUDENTS ===');tStudents.forEach(s=>lines.push(s.name+' | '+s.level+' | '+s.xp+' XP | '+(s.total?Math.round(s.score/s.total*100)+'% acc':'No attempts')));}
  const blob=new Blob([lines.join('\n')],{type:'text/plain'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='Nyansa-Report.txt';a.click();
}
const BADGE_DEFS=[
  {id:'first',emoji:'⭐',name:'First Step',desc:'Answered 1st question',check:()=>state.total>=1},
  {id:'ten',emoji:'🔟',name:'10 Done',desc:'10 questions answered',check:()=>state.total>=10},
  {id:'fifty',emoji:'📚',name:'50 Strong',desc:'50 questions answered',check:()=>state.total>=50},
  {id:'s3',emoji:'🔥',name:'On Fire',desc:'3 correct streak',check:()=>state.streak>=3},
  {id:'s5',emoji:'⚡',name:'Lightning',desc:'5 correct streak',check:()=>state.streak>=5},
  {id:'s10',emoji:'🌟',name:'Unstoppable',desc:'10 correct streak',check:()=>state.streak>=10},
  {id:'x100',emoji:'💯',name:'Century',desc:'100 XP earned',check:()=>state.xp>=100},
  {id:'x500',emoji:'🏆',name:'Champion',desc:'500 XP earned',check:()=>state.xp>=500},
  {id:'x1000',emoji:'👑',name:'Master',desc:'1000 XP earned',check:()=>state.xp>=1000},
  {id:'sharp',emoji:'🎯',name:'Sharpshooter',desc:'80%+ accuracy (10+ Qs)',check:()=>state.total>=10&&state.correct/state.total>=0.8},
];
function checkBadges(){
  let newB=false;
  BADGE_DEFS.forEach(b=>{if(!state.earnedBadges[b.id]&&b.check()){state.earnedBadges[b.id]=true;newB=true;toast('Badge earned: '+b.name+' '+b.emoji,'🏅','gold',4000);}});
  if(newB){renderBadges();if(state.earnedBadges['x500'])confetti();}
}
function renderBadges(){
  const grid=document.getElementById('badge-grid');if(!grid)return;
  grid.innerHTML=BADGE_DEFS.map(b=>'<div class="badge-card '+(state.earnedBadges[b.id]?'earned':'locked')+'"><span class="be">'+b.emoji+'</span><div class="bn">'+b.name+'</div><div class="bdes">'+b.desc+'</div></div>').join('');
  const cnt=document.getElementById('badge-count');if(cnt)cnt.textContent=Object.keys(state.earnedBadges).length+' earned';
  if(state.total>0){
    const name=state.prefs.name||(currentUser&&currentUser.name)||'Student';
    const acc=state.total?Math.round(state.correct/state.total*100):0;
    const cn=document.getElementById('cert-name');const cd=document.getElementById('cert-det');const cb=document.getElementById('cert-btn');
    if(cn)cn.textContent=name;
    if(cd)cd.textContent='Completed '+state.total+' questions · '+acc+'% accuracy · '+state.xp+' XP earned';
    if(cb){cb.disabled=false;cb.style.opacity='1';}
  }
}
function downloadCert(){
  const name=state.prefs.name||(currentUser&&currentUser.name)||'Student';
  const acc=state.total?Math.round(state.correct/state.total*100):0;
  const txt='Nyansa AI — Certificate of Achievement\n'+'='.repeat(44)+'\n\nThis certifies that\n\n  '+name+'\n\nhas successfully completed a quiz session on Nyansa AI.\n\nScore: '+state.score+'/'+state.total+' · Accuracy: '+acc+'% · XP: '+state.xp+'\nDate: '+new Date().toLocaleDateString('en-GH',{year:'numeric',month:'long',day:'numeric'})+'\n\n'+'='.repeat(44)+'\nPowered by Nyansa AI 🇬🇭 · Built for Ghana';
  const blob=new Blob([txt],{type:'text/plain'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='Nyansa-Certificate.txt';a.click();
  toast('Certificate downloaded!','🏆','green',2500);
}
function renderHistory(){
  const list=document.getElementById('hist-list'),wrap=document.getElementById('hist-chart-wrap'),bd=document.getElementById('hist-breakdown');
  if(!state.history.length){list.innerHTML='<p style="font-size:13px;color:var(--muted);">No questions answered yet. Start a quiz!</p>';if(wrap)wrap.style.display='none';if(bd)bd.innerHTML='';return;}
  if(wrap)wrap.style.display='';
  const chart=document.getElementById('hist-chart');
  if(chart)chart.innerHTML=state.history.slice(0,20).reverse().map(h=>'<div class="mini-bar" style="background:'+(h.correct?'#006b3f':'#ce1126')+';height:'+(h.correct?100:30)+'%;flex:1;" title="'+(h.correct?'Correct':'Wrong')+'"></div>').join('');
  list.innerHTML=state.history.map(h=>'<div class="hist-item"><div class="hist-q">'+esc(h.q)+'</div><span class="chip cg" style="font-size:11px;flex-shrink:0;">'+h.subject+'</span><span class="chip '+(h.correct?'cgr':'cr')+'" style="font-size:11px;flex-shrink:0;">'+(h.correct?'+'+h.xp+'XP':'Wrong')+'</span></div>').join('');
  if(bd){const entries=Object.entries(state.subjectStats);bd.innerHTML=entries.length?entries.map(([sub,s])=>{const pct=Math.round(s.correct/s.total*100);const col=pct>=70?'#006b3f':pct>=40?'#d4960a':'#ce1126';const lbl=typeof subjectDisplayName==='function'?subjectDisplayName(sub):(sub.charAt(0).toUpperCase()+sub.slice(1));return '<div style="margin-bottom:10px;"><div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px;"><span>'+lbl+'</span><span style="color:var(--muted);">'+s.correct+'/'+s.total+' · '+pct+'%</span></div><div class="prog"><div class="prog-fill" style="width:'+pct+'%;background:'+col+';"></div></div></div>';}).join(''):'<p style="font-size:13px;color:var(--muted);">No data yet.</p>';}
}
function clearHistory(){state.history=[];state.subjectStats={};renderHistory();}
async function saveScore(){
  const name=document.getElementById('lb-name').value.trim();
  if(!name||!state.total){toast('Answer some questions first!','⚠️','gold',2500);return;}
  try{await window.storage.set('lb:'+name+':'+Date.now(),JSON.stringify({name,xp:state.xp,score:state.score,total:state.total,acc:Math.round(state.correct/state.total*100)}),true);loadLeaderboard();}catch(e){}
}
async function loadLeaderboard(){
  const el=document.getElementById('lb-list');
  try{
    const res=await window.storage.list('lb:',true);const entries=[];
    for(const key of(res.keys||[])){try{const r=await window.storage.get(key,true);if(r)entries.push(JSON.parse(r.value));}catch(e){}}
    entries.sort((a,b)=>b.xp-a.xp);const top=entries.slice(0,15);
    if(!top.length){el.innerHTML='<p style="font-size:13px;color:var(--muted);">No entries yet. Be the first!</p>';return;}
    const rCols=[{bg:'rgba(212,150,10,.15)',col:'#8a6000'},{bg:'rgba(180,180,180,.1)',col:'#666'},{bg:'rgba(206,17,38,.08)',col:'#ce1126'}];
    el.innerHTML=top.map((e,i)=>{const rc=rCols[i]||{bg:'var(--bg2)',col:'var(--muted)'};return '<div class="lb-row"><div class="lb-rank" style="background:'+rc.bg+';color:'+rc.col+';">'+(i+1)+'</div><div style="flex:1;font-size:14px;font-weight:500;">'+esc(e.name)+'</div><span class="chip cg">'+e.xp+' XP</span><span style="font-size:12px;color:var(--muted);margin-left:6px;">'+e.acc+'% acc</span></div>';}).join('');
  }catch(e){el.innerHTML='<p style="font-size:13px;color:var(--muted);">Leaderboard unavailable. Download the file to use this feature.</p>';}
}
function checkMilestones(){
  if(state.streak===3)toast('3 in a row! Keep going!','🔥','gold');
  if(state.streak===5){toast('5 streak! Incredible!','⚡','green');confetti();}
  if(state.streak===10){toast('10 STREAK! Unstoppable!','🌟','green');confetti();}
  if(state.total===10)toast('10 questions answered!','🎯','gold');
  if(state.total===50){toast('50 questions! You\'re dedicated!','📚','green');confetti();}
  if(state.xp>=100&&state.xp-20<100)toast('100 XP! Level up!','⭐','gold');
  if(state.xp>=500&&state.xp-20<500){toast('500 XP! You\'re a Champion!','👑','green');confetti();}
}

function renderMastery(){
  var grid=document.getElementById('mastery-grid');
  var recEl=document.getElementById('mastery-ai-rec');
  var entries=Object.entries(state.subjectStats);
  if(!entries.length||state.total<5){
    if(grid)grid.innerHTML='<p style="font-size:13px;color:var(--muted);text-align:center;padding:2rem;">Answer at least 5 questions to see your mastery map.</p>';
    return;
  }
  var sorted=entries.map(function(e){var s=e[1];return{sub:e[0],correct:s.correct,total:s.total,pct:Math.round(s.correct/s.total*100)};}).sort(function(a,b){return a.pct-b.pct;});
  var getCol=function(p){return p>=80?'#006b3f':p>=60?'#d4960a':p>=40?'#e67e00':'#ce1126';};
  var getLbl=function(p){return p>=80?'Mastered':p>=60?'Good':p>=40?'Needs work':'Struggling';};
  var overall=Math.round(state.correct/state.total*100);
  var oc=document.getElementById('mastery-overall');if(oc)oc.textContent=overall+'% Overall';
  if(grid){grid.innerHTML=sorted.map(function(s){var lbl=typeof subjectDisplayName==='function'?subjectDisplayName(s.sub):(s.sub.charAt(0).toUpperCase()+s.sub.slice(1));return '<div style="margin-bottom:12px;"><div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:5px;"><strong>'+lbl+'</strong><span style="font-weight:700;color:'+getCol(s.pct)+'">'+s.correct+'/'+s.total+' ('+s.pct+'%) '+getLbl(s.pct)+'</span></div><div style="height:10px;border-radius:99px;background:var(--bg3);overflow:hidden;"><div style="height:10px;border-radius:99px;background:'+getCol(s.pct)+';width:'+s.pct+'%;transition:width 1s ease;"></div></div></div>';}).join('');}
  if(recEl){var weak=sorted.filter(function(s){return s.pct<60;}).map(function(s){return s.sub;});recEl.textContent=(weak.length?'Focus on: '+weak.join(', ')+'. ':'Great work! ')+'Keep practising daily — Powered by Wisdom 🇬🇭';}
}

setTimeout(()=>toast('Welcome to Nyansa AI! 🇬🇭','👋','gold',4000),800);

let kidsMode = false;
let kidsState = {
  ageGroup: 'nursery', // nursery(4-6) | lower_primary(6-8) | upper_primary(9-11) | jhs(12-15)
  subject: 'all',
  score: 0, totalQs: 0, streak: 0, xp: 0,
  currentQ: null, answered: false, generating: false,
  badges: {}, questionNum: 0,
  name: ''
};

const KIDS_AGE_GROUPS = {
  nursery:      { label: 'Nursery',       ages: '4-6 years',  emoji: '🌱', color: '#ff6b35', badgeEmoji: '⭐', levelName: 'Little Star',    xpNeeded: 20  },
  lower_primary:{ label: 'Lower Primary', ages: '7-8 years',  emoji: '📚', color: '#d4960a', badgeEmoji: '🌟', levelName: 'Growing Star',   xpNeeded: 50  },
  upper_primary:{ label: 'Upper Primary', ages: '9-11 years', emoji: '🚀', color: '#006b3f', badgeEmoji: '💫', levelName: 'Bright Star',    xpNeeded: 100 },
  jhs:          { label: 'JHS',           ages: '12-15 years',emoji: '🎓', color: '#ce1126', badgeEmoji: '🏆', levelName: 'Champion',       xpNeeded: 200 }
};

const KIDS_SUBJECTS = [
  { id:'nursery_basics', name:'ABC & 123',       emoji:'🔤', color:'#ff6b35', ages:['nursery'],                     desc:'Letters, numbers, colours' },
  { id:'shapes_colors',  name:'Shapes & Colours',emoji:'🌈', color:'#d4960a', ages:['nursery','lower_primary'],     desc:'Shapes, colours, patterns'  },
  { id:'animals',        name:'Animals',          emoji:'🦁', color:'#006b3f', ages:['nursery','lower_primary'],     desc:'Animals & where they live'  },
  { id:'ghana',          name:'Ghana 🇬🇭',       emoji:'🇬🇭', color:'#ce1126', ages:['nursery','lower_primary','upper_primary','jhs'], desc:'Ghana, Twi words, culture' },
  { id:'primary_maths',  name:'Maths',            emoji:'➕', color:'#d4960a', ages:['lower_primary','upper_primary','jhs'], desc:'Numbers, sums, problems' },
  { id:'primary_english',name:'English',          emoji:'📝', color:'#1a66cc', ages:['lower_primary','upper_primary','jhs'], desc:'Words, grammar, reading'  },
  { id:'primary_science',name:'Science',          emoji:'🔬', color:'#006b3f', ages:['upper_primary','jhs'],        desc:'Nature, body, experiments'  },
  { id:'owop',           name:'Our World',         emoji:'🌍', color:'#ce1126', ages:['lower_primary','upper_primary'], desc:'People, places, communities' },
  { id:'rme_kids',       name:'RME Stories',      emoji:'🙏', color:'#9b59b6', ages:['lower_primary','upper_primary','jhs'], desc:'Bible & moral stories'   },
  { id:'coding_kids',    name:'Coding Logic',     emoji:'💻', color:'#2980b9', ages:['upper_primary','jhs'],        desc:'Patterns & logic puzzles'   },
];

const KIDS_BADGES_DEF = [
  { id:'first_q',   emoji:'⭐', name:'First Answer!',   desc:'Answered first question',  check:()=>kidsState.totalQs>=1 },
  { id:'five_q',    emoji:'🌟', name:'5 Questions!',    desc:'Answered 5 questions',     check:()=>kidsState.totalQs>=5 },
  { id:'ten_q',     emoji:'🎯', name:'10 Questions!',   desc:'Answered 10 questions',    check:()=>kidsState.totalQs>=10 },
  { id:'streak3',   emoji:'🔥', name:'On Fire!',        desc:'3 correct in a row',       check:()=>kidsState.streak>=3 },
  { id:'streak5',   emoji:'⚡', name:'Super Streak!',   desc:'5 correct in a row',       check:()=>kidsState.streak>=5 },
  { id:'ghana_fan', emoji:'🇬🇭', name:'Ghana Proud!',  desc:'Answered a Ghana question',check:()=>kidsState.subject==='ghana'||kidsState.xp>=10 },
  { id:'xp25',      emoji:'💯', name:'25 Stars!',       desc:'Earned 25 stars',          check:()=>kidsState.xp>=25 },
  { id:'xp50',      emoji:'🏆', name:'50 Stars!',       desc:'Earned 50 stars',          check:()=>kidsState.xp>=50 },
  { id:'xp100',     emoji:'👑', name:'100 Stars! WOW!', desc:'Earned 100 stars',         check:()=>kidsState.xp>=100 },
  { id:'all_sub',   emoji:'🌈', name:'Explorer!',       desc:'Tried 3 different subjects',check:()=>Object.keys(kidsState.badges).length>=3 },
];
const KIDS_BANK = {
  nursery_basics: [
    { q:'What letter is this? 🍎',   a:'A', opts:['A','B','C','D'], emoji:'🍎', hint:'Apple starts with...'},
    { q:'What letter is this? 🦁',   a:'L', opts:['K','L','M','N'], emoji:'🦁', hint:'Lion starts with...'},
    { q:'What letter is this? 🐘',   a:'E', opts:['E','F','G','H'], emoji:'🐘', hint:'Elephant starts with...'},
    { q:'What comes after 2?',       a:'3', opts:['1','2','3','4'], emoji:'🔢', hint:'Count: 1, 2, ...'},
    { q:'What comes after 4?',       a:'5', opts:['3','5','6','7'], emoji:'🔢', hint:'Count: 3, 4, ...'},
    { q:'How many fingers on ONE hand?', a:'5', opts:['4','5','6','10'], emoji:'🖐', hint:'Count your fingers!'},
    { q:'What colour is the sun? ☀️', a:'Yellow', opts:['Blue','Red','Yellow','Green'], emoji:'☀️', hint:'The sun is bright and...'},
    { q:'What colour is the sky? 🌤', a:'Blue',   opts:['Red','Blue','Yellow','Pink'],  emoji:'🌤', hint:'Look up on a sunny day...'},
    { q:'What colour is grass? 🌿',  a:'Green',  opts:['Green','Brown','White','Orange'],emoji:'🌿', hint:'Grass in the garden is...'},
    { q:'What shape is a ball? ⚽',  a:'Round/Circle', opts:['Square','Triangle','Round/Circle','Rectangle'], emoji:'⚽', hint:'It rolls because it is...'},
    { q:'What shape is a book? 📚',  a:'Rectangle', opts:['Circle','Triangle','Rectangle','Star'], emoji:'📚', hint:'It has four straight sides...'},
    { q:'How many eyes do you have?', a:'2', opts:['1','2','3','4'], emoji:'👀', hint:'Look in a mirror...'},
  ],
  shapes_colors: [
    { q:'What shape has 3 sides? 📐', a:'Triangle', opts:['Circle','Square','Triangle','Rectangle'], emoji:'📐', hint:'It looks like a mountain top'},
    { q:'What shape has 4 equal sides?', a:'Square', opts:['Circle','Square','Triangle','Rectangle'], emoji:'🟦', hint:'A chess board tile is this shape'},
    { q:'What colour do you get mixing blue and yellow? 🎨', a:'Green', opts:['Purple','Orange','Green','Brown'], emoji:'🎨', hint:'Think of the colour of leaves'},
    { q:'What colour do you get mixing red and blue? 🎨',   a:'Purple', opts:['Green','Orange','Purple','Black'], emoji:'🎨', hint:'Think of grapes...'},
    { q:'How many sides does a rectangle have?', a:'4', opts:['3','4','5','6'], emoji:'📏', hint:'Count the sides carefully'},
    { q:'What shape is a coin? 🪙', a:'Circle', opts:['Square','Triangle','Circle','Star'], emoji:'🪙', hint:'It has no corners'},
    { q:'How many corners does a square have?', a:'4', opts:['2','3','4','5'], emoji:'🟨', hint:'Count each corner of the square'},
    { q:'What colour is a banana? 🍌', a:'Yellow', opts:['Red','Blue','Yellow','Purple'], emoji:'🍌', hint:'Same colour as the sun'},
    { q:'What colour is an orange? 🍊', a:'Orange', opts:['Yellow','Orange','Green','Red'], emoji:'🍊', hint:'The fruit gives the colour its name!'},
    { q:'How many sides does a triangle have?', a:'3', opts:['2','3','4','5'], emoji:'🔺', hint:'Tri means three'},
  ],
  animals: [
    { q:'Which animal says "Moo"? 🐄',  a:'Cow',     opts:['Dog','Cow','Cat','Sheep'],    emoji:'🐄', hint:'It gives us milk'},
    { q:'Which animal says "Woof"? 🐕', a:'Dog',     opts:['Cat','Cow','Dog','Horse'],    emoji:'🐕', hint:'It is a popular pet'},
    { q:'Which animal says "Roar"? 🦁', a:'Lion',    opts:['Lion','Elephant','Zebra','Giraffe'], emoji:'🦁', hint:'King of the jungle'},
    { q:'Where does a fish live? 🐟',   a:'In water', opts:['In a tree','On land','In water','In the sky'], emoji:'🐟', hint:'Fish need water to breathe'},
    { q:'Which animal has a very long neck? 🦒', a:'Giraffe', opts:['Elephant','Giraffe','Lion','Zebra'], emoji:'🦒', hint:'It eats leaves from tall trees'},
    { q:'Which animal is the biggest on land? 🐘', a:'Elephant', opts:['Lion','Giraffe','Elephant','Hippo'], emoji:'🐘', hint:'It has a long nose called a trunk'},
    { q:'What do cows give us? 🥛', a:'Milk', opts:['Juice','Milk','Water','Honey'], emoji:'🥛', hint:'You drink this at breakfast'},
    { q:'What do bees make? 🍯', a:'Honey', opts:['Milk','Juice','Honey','Sugar'], emoji:'🍯', hint:'It is sweet and golden'},
    { q:'Which bird cannot fly? 🐧', a:'Penguin', opts:['Eagle','Parrot','Penguin','Pigeon'], emoji:'🐧', hint:'It lives in cold places and swims instead'},
    { q:'Which animal has stripes? 🦓', a:'Zebra', opts:['Lion','Elephant','Zebra','Giraffe'], emoji:'🦓', hint:'Black and white lines on its body'},
  ],
  ghana: [
    { q:'What are the colours of the Ghana flag? 🇬🇭', a:'Red, Gold, Green', opts:['Red, White, Blue','Red, Gold, Green','Yellow, Black, Green','Red, Yellow, White'], emoji:'🇬🇭', hint:'Look at the flag carefully'},
    { q:'What is the capital city of Ghana? 🏙️', a:'Accra', opts:['Kumasi','Tamale','Accra','Cape Coast'], emoji:'🏙️', hint:'It is in the Greater Accra region'},
    { q:'"Medaase" means what in Twi? 🇬🇭', a:'Thank you', opts:['Hello','Goodbye','Thank you','Please'], emoji:'🤝', hint:'You say this when someone helps you'},
    { q:'"Maakye" means what in Twi? ☀️', a:'Good morning', opts:['Good night','Good morning','Goodbye','How are you'], emoji:'☀️', hint:'You say this when you wake up'},
    { q:'What is Ghana famous for producing? ☕', a:'Cocoa / Chocolate', opts:['Coffee','Tea','Cocoa / Chocolate','Rice'], emoji:'🍫', hint:'It is used to make chocolate'},
    { q:'In what year did Ghana gain independence? 🎉', a:'1957', opts:['1950','1957','1960','1945'], emoji:'🎉', hint:'March 6, 1957 is a very special day'},
    { q:'Who was Ghana\'s first President? 👨‍💼', a:'Kwame Nkrumah', opts:['J.J. Rawlings','John Mahama','Kwame Nkrumah','Kofi Annan'], emoji:'🌟', hint:'He said "Africa must unite"'},
    { q:'What language is mainly spoken in Ashanti region? 🗣️', a:'Twi', opts:['Ewe','Ga','Twi','Fante'], emoji:'🗣️', hint:'It is also spoken widely across Ghana'},
    { q:'Which Ghanaian food is made from cassava? 🍽️', a:'Fufu', opts:['Jollof Rice','Fufu','Banku','Kelewele'], emoji:'🍽️', hint:'You pound it and eat it with soup'},
    { q:'Lake Volta is in which country? 🌊', a:'Ghana', opts:['Nigeria','Togo','Ghana','Côte d\'Ivoire'], emoji:'🌊', hint:'It is one of the largest man-made lakes'},
  ],
  primary_maths: [
    { q:'What is 5 + 3?',  a:'8',  opts:['6','7','8','9'],  emoji:'➕', hint:'Count 5 then add 3 more'},
    { q:'What is 10 - 4?', a:'6',  opts:['5','6','7','8'],  emoji:'➖', hint:'Start at 10, take away 4'},
    { q:'What is 3 × 4?',  a:'12', opts:['10','11','12','14'], emoji:'✖️', hint:'3 groups of 4'},
    { q:'What is 8 + 7?',  a:'15', opts:['13','14','15','16'], emoji:'➕', hint:'Add 8 and 7 together'},
    { q:'What is 20 ÷ 4?', a:'5',  opts:['4','5','6','7'],  emoji:'➗', hint:'How many 4s go into 20?'},
    { q:'What is 6 × 7?',  a:'42', opts:['36','42','48','54'], emoji:'✖️', hint:'6 multiplied by 7'},
    { q:'What is half of 20?', a:'10', opts:['5','8','10','12'], emoji:'½', hint:'Divide 20 into 2 equal parts'},
    { q:'What is 100 - 35?', a:'65', opts:['55','60','65','75'], emoji:'➖', hint:'Subtract 35 from 100'},
    { q:'What is 9 × 9?',  a:'81', opts:['72','81','90','99'], emoji:'✖️', hint:'Nine times nine'},
    { q:'What is 15 + 28?', a:'43', opts:['40','42','43','45'], emoji:'➕', hint:'Add tens first: 10+20=30, then 5+8=13'},
  ],
  primary_english: [
    { q:'What is the opposite of "hot"? 🌡️', a:'Cold', opts:['Warm','Cold','Hard','Soft'], emoji:'🌡️', hint:'Ice cream is this temperature'},
    { q:'What is the opposite of "big"?',    a:'Small', opts:['Tall','Long','Small','Short'], emoji:'📏', hint:'A mouse is this compared to an elephant'},
    { q:'Which word is a VERB (action)?',     a:'Run',  opts:['Dog','Run','Blue','Fast'], emoji:'🏃', hint:'It is something you DO'},
    { q:'What is the plural of "child"?',     a:'Children', opts:['Childs','Childrens','Children','Child'], emoji:'👧', hint:'More than one child is...'},
    { q:'Which sentence is correct?',         a:'She runs fast.', opts:['She run fast.','She runned fast.','She runs fast.','She is run fast.'], emoji:'📝', hint:'She is one person — what ending?'},
    { q:'What does "large" mean?', a:'Big', opts:['Small','Thin','Big','Short'], emoji:'📖', hint:'Another word for big'},
    { q:'What punctuation ends a question?', a:'?', opts:['.','!','?',','], emoji:'❓', hint:'Look at the end of this sentence'},
    { q:'Which word rhymes with "cat"?', a:'Bat', opts:['Dog','Bat','Run','Fly'], emoji:'🦇', hint:'It flies at night and ends in -at'},
    { q:'What is a noun?', a:'A person, place or thing', opts:['An action word','A describing word','A person, place or thing','A joining word'], emoji:'📚', hint:'Dog, Ghana, and school are all...'},
    { q:'What is the capital letter of "a"?', a:'A', opts:['a','A','@','Aa'], emoji:'🔤', hint:'The uppercase version of a'},
  ],
  primary_science: [
    { q:'What do plants need to make food? ☀️', a:'Sunlight, water, air', opts:['Soil only','Water only','Sunlight, water, air','Fertiliser only'], emoji:'🌱', hint:'Photosynthesis needs these three things'},
    { q:'What is the boiling point of water? 💧', a:'100°C', opts:['50°C','75°C','100°C','150°C'], emoji:'💧', hint:'Water bubbles and turns to steam at this temperature'},
    { q:'How many bones does an adult human have?', a:'206', opts:['106','206','306','406'], emoji:'🦴', hint:'Over two hundred bones!'},
    { q:'What planet do we live on? 🌍', a:'Earth', opts:['Mars','Venus','Earth','Jupiter'], emoji:'🌍', hint:'Our home planet'},
    { q:'What gives plants their green colour? 🌿', a:'Chlorophyll', opts:['Water','Sunlight','Chlorophyll','Soil'], emoji:'🌿', hint:'The green pigment in leaves'},
    { q:'Which organ pumps blood around the body? ❤️', a:'Heart', opts:['Lungs','Brain','Heart','Kidney'], emoji:'❤️', hint:'It beats about 60-100 times a minute'},
    { q:'What is the closest star to Earth? ⭐', a:'The Sun', opts:['North Star','The Moon','The Sun','Mars'], emoji:'⭐', hint:'We see it every day'},
    { q:'What do we breathe in to stay alive? 💨', a:'Oxygen', opts:['Carbon dioxide','Nitrogen','Oxygen','Hydrogen'], emoji:'💨', hint:'Plants produce this for us'},
  ],
  owop: [
    { q:'What is a community? 🏘️', a:'A group of people living together in an area', opts:['A school building','A group of people living together in an area','A large forest','A type of food'], emoji:'🏘️', hint:'Your village or town is one'},
    { q:'What does a doctor do? 👨‍⚕️', a:'Treats sick people', opts:['Builds houses','Teaches students','Treats sick people','Grows food'], emoji:'👨‍⚕️', hint:'You visit one when you are not feeling well'},
    { q:'What does a farmer do? 👨‍🌾', a:'Grows food', opts:['Builds roads','Grows food','Catches fish','Makes clothes'], emoji:'👨‍🌾', hint:'They work on a farm to feed us'},
    { q:'What is the family of mum, dad and children called?', a:'Nuclear family', opts:['Extended family','Nuclear family','Single family','Community family'], emoji:'👨‍👩‍👧‍👦', hint:'The small close family unit'},
    { q:'Why do we need rules? ✅', a:'To keep order and protect everyone', opts:['To make things hard','To keep order and protect everyone','Because teachers say so','To stop fun'], emoji:'✅', hint:'Rules help us live together peacefully'},
  ],
  rme_kids: [
    { q:'What is the Golden Rule? ✨', a:'Treat others as you want to be treated', opts:['Win at all costs','Treat others as you want to be treated','Always be first','Take what you need'], emoji:'✨', hint:'Do unto others...'},
    { q:'Which value means telling the truth? 🤝', a:'Honesty', opts:['Greed','Laziness','Honesty','Jealousy'], emoji:'🤝', hint:'The opposite of lying'},
    { q:'What does "respect" mean? 🙏', a:'Treating others with kindness and care', opts:['Ignoring others','Fighting','Treating others with kindness and care','Taking from others'], emoji:'🙏', hint:'You show this to your elders'},
    { q:'What should you do if you make a mistake? 😇', a:'Apologise and learn from it', opts:['Hide it','Blame others','Apologise and learn from it','Get angry'], emoji:'😇', hint:'Say sorry and do better next time'},
    { q:'What does "sharing" mean? 🎁', a:'Giving some of what you have to others', opts:['Keeping everything for yourself','Taking from others','Giving some of what you have to others','Hiding your things'], emoji:'🎁', hint:'When you give some of your food to a friend'},
  ],
  coding_kids: [
    { q:'What is a "loop" in coding? 🔄', a:'Instructions that repeat', opts:['A type of bug','Instructions that repeat','A circle shape','A computer game'], emoji:'🔄', hint:'When something happens again and again'},
    { q:'If a robot goes RIGHT, RIGHT, RIGHT — how many steps to the right?', a:'3', opts:['1','2','3','4'], emoji:'🤖', hint:'Count the RIGHTs'},
    { q:'What is a computer program? 💻', a:'A set of instructions for a computer', opts:['A type of game only','A television show','A set of instructions for a computer','A book'], emoji:'💻', hint:'It tells the computer what to do'},
    { q:'What comes next in this pattern? 🔵🔴🔵🔴?', a:'🔵', opts:['🔴','🔵','🟡','🟢'], emoji:'🎯', hint:'Look at the pattern carefully'},
    { q:'If you have 3 apples and eat 1, how many remain? 🍎', a:'2', opts:['1','2','3','4'], emoji:'🍎', hint:'3 take away 1'},
  ]
};

const ALPHABET_DATA = [
  {l:'A',w:'Apple',e:'🍎'},{l:'B',w:'Ball',e:'⚽'},{l:'C',w:'Cat',e:'🐱'},
  {l:'D',w:'Dog',e:'🐶'},{l:'E',w:'Elephant',e:'🐘'},{l:'F',w:'Fish',e:'🐟'},
  {l:'G',w:'Ghana',e:'🇬🇭'},{l:'H',w:'House',e:'🏠'},{l:'I',w:'Ice cream',e:'🍦'},
  {l:'J',w:'Jollof',e:'🍛'},{l:'K',w:'Kite',e:'🪁'},{l:'L',w:'Lion',e:'🦁'},
  {l:'M',w:'Mango',e:'🥭'},{l:'N',w:'Numbers',e:'🔢'},{l:'O',w:'Orange',e:'🍊'},
  {l:'P',w:'Pencil',e:'✏️'},{l:'Q',w:'Queen',e:'👸'},{l:'R',w:'Rain',e:'🌧️'},
  {l:'S',w:'Sun',e:'☀️'},{l:'T',w:'Tree',e:'🌳'},{l:'U',w:'Umbrella',e:'☂️'},
  {l:'V',w:'Village',e:'🏘️'},{l:'W',w:'Water',e:'💧'},{l:'X',w:'Xylophone',e:'🎵'},
  {l:'Y',w:'Yam',e:'🍠'},{l:'Z',w:'Zebra',e:'🦓'}
];

const TWI_WORDS = [
  {english:'Hello',twi:'Mema wo akye',emoji:'👋'},{english:'Goodbye',twi:'Da yie',emoji:'🙏'},
  {english:'Thank you',twi:'Medaase',emoji:'❤️'},{english:'Mother',twi:'Maame',emoji:'👩'},
  {english:'Father',twi:'Paapa',emoji:'👨'},{english:'Water',twi:'Nsuo',emoji:'💧'},
  {english:'Food',twi:'Aduane',emoji:'🍽️'},{english:'Ghana',twi:'Ghana',emoji:'🇬🇭'},
  {english:'Beautiful',twi:'Fɛ',emoji:'😍'},{english:'Good',twi:'Papa',emoji:'👍'},
  {english:'School',twi:'Sukuu',emoji:'🏫'},{english:'Book',twi:'Nhoma',emoji:'📚'},
];
function speak(text, rate=0.85, pitch=1.1){
  if(!window.speechSynthesis)return;
  speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(text);
  u.rate=rate; u.pitch=pitch; u.lang='en-GH';
  speechSynthesis.speak(u);
}
function speakQuestion(){
  if(!kidsState.currentQ)return;
  speak(kidsState.currentQ.q, 0.8, 1.1);
}
function enterKidsMode(ageGroup, name){
  kidsMode=true;
  kidsState.ageGroup=ageGroup||'nursery';
  kidsState.name=name||(currentUser&&currentUser.name)||'Little Star';
  kidsState.score=0; kidsState.totalQs=0; kidsState.xp=0; kidsState.streak=0;
  try{const saved=JSON.parse(localStorage.getItem('em_kids_'+kidsState.name)||'{}');
    if(saved.xp)kidsState.xp=saved.xp;
    if(saved.badges)kidsState.badges=saved.badges;}catch(e){}
  goPage('kids-home');
  updateKidsHomeUI();
  setTimeout(()=>speak('Welcome to Nyansa Kids! Let\'s learn together! 🎉',0.85,1.2),500);
}
function saveKidsProgress(){
  try{localStorage.setItem('em_kids_'+kidsState.name, JSON.stringify({xp:kidsState.xp,badges:kidsState.badges}));}catch(e){}
}
function exitKidsMode(){
  kidsMode=false;speechSynthesis.cancel();
  goPage('home');
  toast('Switched back to normal mode','👤','gold',2000);
}
function updateKidsHomeUI(){
  const ag=KIDS_AGE_GROUPS[kidsState.ageGroup];
  const greet=document.getElementById('kids-greeting');
  const hour=new Date().getHours();
  const greeting=hour<12?'Good Morning':(hour<17?'Good Afternoon':'Good Evening');
  const n=kidsState.name.split(' ')[0];
  if(greet)greet.textContent=(hour<12?'Good Morning':(hour<17?'Good Afternoon':'Good Evening!'))+', '+n+'! 👋';
  const starsRow=document.getElementById('kids-stars-row');
  if(starsRow){
    const starCount=Math.min(kidsState.xp,5);
    starsRow.innerHTML=Array.from({length:5},(_,i)=>'<span style="font-size:1.6rem;'+(i<starCount?'':'opacity:.2;')+'">'+(i<starCount?'⭐':'☆')+'</span>').join('');
  }
  const lb=document.getElementById('kids-level-badge');
  const be=document.getElementById('kids-badge-emoji');
  const ln=document.getElementById('kids-level-name');
  const xl=document.getElementById('kids-xp-label');
  if(be)be.textContent=ag.badgeEmoji;
  if(ln)ln.textContent=ag.levelName;
  if(xl)xl.textContent=kidsState.xp+' Stars earned';
  const grid=document.getElementById('kids-subject-grid');
  if(!grid)return;
  const subjects=KIDS_SUBJECTS.filter(s=>s.ages.includes(kidsState.ageGroup));
  const colors=['#ff6b35','#d4960a','#006b3f','#ce1126','#9b59b6','#2980b9','#27ae60','#e67e22'];
  grid.innerHTML=subjects.map((s,i)=>`
    <div class="kids-subj-card" onclick="startKidsQuiz('${s.id}')" style="border-color:${colors[i%colors.length]}30;"><span class="ksj-emoji">${s.emoji}</span><div class="ksj-name">${s.name}</div><div class="ksj-age">${s.desc}</div></div>`).join('');
}
function startKidsQuiz(subject){
  kidsState.subject=subject;
  kidsState.answered=false;
  kidsState.questionNum=0;
  goPage('kids-quiz');
  const subj=KIDS_SUBJECTS.find(s=>s.id===subject);
  const titleEl=document.getElementById('kids-quiz-title');
  if(titleEl)titleEl.textContent=subj?subj.name+' Quiz':'Let\'s Learn!';
  generateKidsQuestion();
}

async function generateKidsQuestion(){
  if(kidsState.generating)return;
  kidsState.generating=true;
  kidsState.answered=false;
  document.getElementById('kids-result').innerHTML='';
  document.getElementById('kids-next-btn').style.display='none';
  document.getElementById('kids-options').innerHTML='';
  document.getElementById('kids-written').style.display='none';
  document.getElementById('kids-q-emoji').textContent='🤔';
  document.getElementById('kids-q-text').textContent='Loading...';
  document.getElementById('kids-q-hint').textContent='';
  const starsEl=document.getElementById('kids-progress-stars');
  if(starsEl)starsEl.innerHTML=Array.from({length:5},(_,i)=>`<span style="font-size:1.4rem;">${i<kidsState.score%5?'⭐':'☆'}</span>`).join('');
  const sd=document.getElementById('kids-score-display');
  if(sd)sd.textContent=kidsState.xp;
  const bank=KIDS_BANK[kidsState.subject==='all'?getRandomKidsSubject():kidsState.subject]||KIDS_BANK.nursery_basics;
  const bankQ=bank[kidsState.questionNum%bank.length];
  const useAI=!usingFallback && kidsState.ageGroup!=='nursery' && Math.random()<0.4;

  if(useAI){
    try{
      const ag=KIDS_AGE_GROUPS[kidsState.ageGroup];
      const sub=KIDS_SUBJECTS.find(s=>s.id===kidsState.subject)||{name:'General Knowledge'};
      const prompt=`Generate a fun, simple ${kidsState.ageGroup} level ${sub.name} question for a Ghanaian child aged ${ag.ages}.
Make it cheerful and encouraging. Return ONLY JSON:
{"q":"question text","opts":["opt1","opt2","opt3","opt4"],"a":"correct answer (must match one option exactly)","emoji":"one relevant emoji","hint":"simple hint"}`;
      const raw=await ai(prompt,400,null);
      const q=parseJSON(raw);
      kidsState.currentQ={...q,fromAI:true};
    }catch(e){
      kidsState.currentQ={...bankQ};
    }
  } else {
    kidsState.currentQ={...bankQ};
  }

  renderKidsQuestion();
  kidsState.generating=false;
  if(kidsState.ageGroup==='nursery'||kidsState.ageGroup==='lower_primary'){
    setTimeout(()=>speak(kidsState.currentQ.q, 0.8, 1.1), 400);
  }
}

function getRandomKidsSubject(){
  const subjects=KIDS_SUBJECTS.filter(s=>s.ages.includes(kidsState.ageGroup));
  return subjects.length>0?subjects[Math.floor(Math.random()*subjects.length)].id:'nursery_basics';
}

function renderKidsQuestion(){
  const q=kidsState.currentQ;
  if(!q)return;

  document.getElementById('kids-q-emoji').textContent=q.emoji||'🤔';
  document.getElementById('kids-q-text').textContent=q.q;
  document.getElementById('kids-q-hint').textContent='';

  const optsEl=document.getElementById('kids-options');
  optsEl.innerHTML='';

  const optColors=['#ff6b35','#d4960a','#006b3f','#1a66cc'];

  q.opts.forEach((opt,i)=>{
    const btn=document.createElement('button');
    btn.className='kids-opt';
    btn.style.background=optColors[i]+'18';
    btn.style.borderColor=optColors[i]+'40';
    btn.style.color=optColors[i];
    btn.innerHTML=`<span class="kopt-emoji">${getOptEmoji(opt)}</span><span>${opt}</span>`;
    btn.onclick=()=>answerKids(opt, btn);
    optsEl.appendChild(btn);
  });
  const isWritten=kidsState.ageGroup==='jhs'&&Math.random()<0.3;
  if(isWritten){
    optsEl.style.display='none';
    document.getElementById('kids-written').style.display='';
  } else {
    optsEl.style.display='grid';
    document.getElementById('kids-written').style.display='none';
  }
}

function getOptEmoji(opt){
  const emap={'Red':'🔴','Blue':'🔵','Yellow':'🟡','Green':'🟢','Orange':'🟠',
    'Circle':'⭕','Square':'🟦','Triangle':'🔺','Rectangle':'📏',
    'Dog':'🐶','Cat':'🐱','Lion':'🦁','Elephant':'🐘','Giraffe':'🦒','Zebra':'🦓',
    'Yes':'✅','No':'❌','A':'🅰️','B':'🅱️'};
  return emap[opt]||'';
}

function answerKids(chosen, btn){
  if(kidsState.answered)return;
  kidsState.answered=true;
  const q=kidsState.currentQ;
  const correct=chosen===q.a||chosen.toLowerCase()===q.a.toLowerCase();
  document.querySelectorAll('.kids-opt').forEach(b=>{
    b.disabled=true;
    if(b.textContent.includes(q.a)||(b.querySelector('span:last-child')&&b.querySelector('span:last-child').textContent===q.a)){
      b.classList.add('correct');
    }
  });
  if(!correct) btn.classList.add('wrong');

  kidsState.totalQs++;
  if(correct){
    kidsState.score++;kidsState.streak++;
    const xpEarned=kidsState.ageGroup==='nursery'?1:kidsState.ageGroup==='lower_primary'?2:kidsState.ageGroup==='upper_primary'?3:5;
    kidsState.xp+=xpEarned;
    showKidsPraise(true, xpEarned);
    speak(getPraisePhrase(), 0.9, 1.2);
  } else {
    kidsState.streak=0;
    showKidsPraise(false, 0);
    speak('Not quite! The answer is '+q.a+'. Try again next time!', 0.85, 1.0);
  }

  kidsState.questionNum++;
  checkKidsBadges();
  saveKidsProgress();
  const sd=document.getElementById('kids-score-display');
  if(sd)sd.textContent=kidsState.xp;
  document.getElementById('kids-next-btn').style.display='';
}

function submitKidsWritten(){
  const val=(document.getElementById('kids-written-input')&&document.getElementById('kids-written-input').value.trim());
  if(!val)return;
  const q=kidsState.currentQ;
  const correct=val.toLowerCase().includes(q.a.toLowerCase())||q.a.toLowerCase().includes(val.toLowerCase());
  answerKids(correct?q.a:'wrong_answer',{classList:{add:()=>{},remove:()=>{}}});
}

function getPraisePhrase(){
  const phrases=['Excellent! Well done!','Amazing! You are so smart!','Correct! Keep it up!','Brilliant! Ghana is proud of you!','Fantastic! You nailed it!','Wonderful! You are a star!'];
  return phrases[Math.floor(Math.random()*phrases.length)];
}

function showKidsPraise(correct, xp){
  const el=document.getElementById('kids-result');
  if(correct){
    el.innerHTML=`<div style="font-size:2.5rem;animation:starPop .4s ease;">🌟</div><div style="font-family:var(--fh);font-size:1.2rem;font-weight:800;color:#006b3f;margin:.3rem 0;">${getPraisePhrase()}</div><div style="font-size:14px;color:var(--gold);font-weight:700;">+${xp} ⭐ stars!</div>`;
    kidsConfetti();
  } else {
    const q=kidsState.currentQ;
    el.innerHTML=`<div style="font-size:2rem;">😅</div><div style="font-family:var(--fh);font-size:1rem;font-weight:700;color:#ce1126;margin:.3rem 0;">Not quite! Keep trying!</div><div style="font-size:13px;color:var(--muted);">The answer was: <strong style="color:var(--gold);">${esc(q.a)}</strong></div>${q.hint?'<div style="font-size:12px;color:var(--muted);margin-top:.3rem;">Hint: '+esc(q.hint)+'</div>':''}`;
  }
}

function nextKidsQuestion(){
  document.getElementById('kids-result').innerHTML='';
  document.getElementById('kids-next-btn').style.display='none';
  document.getElementById('kids-written-input') && (document.getElementById('kids-written-input').value='');
  if(kidsState.score>0&&kidsState.score%5===0){
    toast('🌟 '+kidsState.score+' correct answers! You are amazing!','🎉','green',3000);
  }
  generateKidsQuestion();
}

function kidsConfetti(){
  const chars=['⭐','🌟','🎉','✨','🏆','💫'];
  for(let i=0;i<20;i++){
    const p=document.createElement('div');
    p.style.cssText=`position:fixed;left:${Math.random()*100}vw;top:-20px;font-size:${1.5+Math.random()*1.5}rem;animation:fall ${1.5+Math.random()}s ease-out forwards;z-index:999;pointer-events:none;animation-delay:${Math.random()*.5}s;`;
    p.textContent=chars[Math.floor(Math.random()*chars.length)];
    document.body.appendChild(p);setTimeout(()=>p.remove(),3000);
  }
}
function checkKidsBadges(){
  let newBadge=false;
  KIDS_BADGES_DEF.forEach(b=>{
    if(!kidsState.badges[b.id]&&b.check()){
      kidsState.badges[b.id]=true;newBadge=true;
      toast('🏅 New badge: '+b.name,'🌟','green',4000);
      speak('You earned a new badge! '+b.name,0.9,1.2);
      kidsConfetti();
    }
  });
  if(newBadge)renderKidsBadges();
}

function renderKidsBadges(){
  const grid=document.getElementById('kids-badges-grid');
  const cnt=document.getElementById('kids-badge-count');
  if(!grid)return;
  grid.innerHTML=KIDS_BADGES_DEF.map(b=>`
    <div class="kids-badge-card ${kidsState.badges[b.id]?'earned':'locked'}"><span class="kbe">${b.emoji}</span><div class="kbn">${b.name}</div></div>`).join('');
  const earned=Object.keys(kidsState.badges).length;
  if(cnt)cnt.textContent=earned+' badge'+(earned!==1?'s':'');
  const certN=document.getElementById('kids-cert-name');
  const certD=document.getElementById('kids-cert-detail');
  const certBtn=document.getElementById('kids-cert-btn');
  if(certN)certN.textContent=kidsState.name||'Little Champion';
  if(certD&&kidsState.totalQs>0)certD.textContent=`Answered ${kidsState.totalQs} questions · Earned ${kidsState.xp} stars · ${earned} badges 🏅`;
  if(certBtn&&kidsState.totalQs>=5){certBtn.disabled=false;certBtn.style.opacity='1';}
}

function downloadKidsCert(){
  const txt=`🌟 Nyansa AI Kids — Certificate of Achievement 🌟\n${'★'.repeat(40)}\n\nThis certificate is proudly awarded to\n\n    ✨ ${kidsState.name||'Little Champion'} ✨\n\nFor being a Super Learner on Nyansa AI!\n\nStars Earned: ${kidsState.xp} ⭐\nQuestions Answered: ${kidsState.totalQs}\nBadges Earned: ${Object.keys(kidsState.badges).length} 🏅\nDate: ${new Date().toLocaleDateString('en-GH',{year:'numeric',month:'long',day:'numeric'})}\n\n${'★'.repeat(40)}\nKeep learning every day! Ghana is proud of you! 🇬🇭\nPowered by Nyansa AI`;
  const blob=new Blob([txt],{type:'text/plain'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='My-Nyansa-Certificate.txt';a.click();
  toast('Certificate downloaded! Well done! 🎉','🏆','green',3000);
}
function renderAlphabet(){
  const grid=document.getElementById('alphabet-grid');
  if(!grid)return;
  const colors=['#ff6b35','#d4960a','#006b3f','#ce1126','#9b59b6','#2980b9'];
  grid.innerHTML=ALPHABET_DATA.map((a,i)=>`
    <div class="alpha-tile" onclick="speakAlpha('${a.l}','${a.w}')" style="border-color:${colors[i%colors.length]}30;"><div class="ae">${a.e}</div><div class="al" style="color:${colors[i%colors.length]};">${a.l}</div><div class="aw">${a.w}</div></div>`).join('');

  const twiGrid=document.getElementById('twi-words-grid');
  if(twiGrid){
    twiGrid.innerHTML=TWI_WORDS.map(t=>`
      <div class="twi-card" onclick="speak('${t.twi}',0.75,1.0)"><span class="twi-emoji">${t.emoji}</span><div class="twi-english">${t.english}</div><div class="twi-word">${t.twi}</div></div>`).join('');
  }
}

function speakAlpha(letter, word){
  speak(letter+' is for '+word, 0.8, 1.1);
  toast(letter+' — '+word,'🔤','gold',2000);
}
function renderNumbers(){
  const grid=document.getElementById('numbers-grid');
  if(!grid)return;
  const nums=[
    {n:1,w:'One',e:'1️⃣'},{n:2,w:'Two',e:'2️⃣'},{n:3,w:'Three',e:'3️⃣'},{n:4,w:'Four',e:'4️⃣'},
    {n:5,w:'Five',e:'5️⃣'},{n:6,w:'Six',e:'6️⃣'},{n:7,w:'Seven',e:'7️⃣'},{n:8,w:'Eight',e:'8️⃣'},
    {n:9,w:'Nine',e:'9️⃣'},{n:10,w:'Ten',e:'🔟'},{n:20,w:'Twenty',e:'2️⃣0️⃣'},{n:100,w:'Hundred',e:'💯'},
  ];
  const colors=['#ff6b35','#d4960a','#006b3f','#ce1126'];
  grid.innerHTML=nums.map((n,i)=>`
    <div class="num-tile" onclick="speak('${n.n} — ${n.w}',0.8,1.1)" style="border-color:${colors[i%colors.length]}30;"><div class="nl" style="color:${colors[i%colors.length]};">${n.n}</div><div class="nw">${n.w}</div></div>`).join('');
  startCountingGame();
}

function startCountingGame(){
  const emojis=['🍎','⭐','🐶','🎈','🦁','🌸','🍌','⚽','🐟','🦋'];
  const count=Math.floor(Math.random()*9)+1;
  const emoji=emojis[Math.floor(Math.random()*emojis.length)];
  const disp=document.getElementById('counting-emoji');
  const q=document.getElementById('counting-question');
  const opts=document.getElementById('counting-options');
  const res=document.getElementById('counting-result');
  if(!disp||!q||!opts)return;
  disp.textContent=(emoji+' ').repeat(count).trim();
  q.textContent='How many '+emoji+' can you count?';
  res.textContent='';
  const correct=count;
  const choices=new Set([correct]);
  while(choices.size<4){const r=Math.floor(Math.random()*12)+1;choices.add(r);}
  const shuffled=[...choices].sort(()=>Math.random()-.5);
  opts.innerHTML=shuffled.map(n=>`<button class="cnt-opt" onclick="checkCounting(${n},${correct},this)">${n}</button>`).join('');
}

function checkCounting(chosen, correct, btn){
  document.querySelectorAll('.cnt-opt').forEach(b=>b.disabled=true);
  const res=document.getElementById('counting-result');
  if(chosen===correct){
    btn.classList.add('cnt-correct');
    res.innerHTML='<span style="color:#006b3f;font-weight:700;">🌟 Correct! Well done!</span>';
    speak('Correct! Well done!',0.9,1.2);
    setTimeout(startCountingGame,2000);
  } else {
    btn.classList.add('cnt-wrong');
    document.querySelectorAll('.cnt-opt').forEach(b=>{if(parseInt(b.textContent)===correct)b.classList.add('cnt-correct');});
    res.innerHTML='<span style="color:#ce1126;font-weight:700;">Not quite! The answer was '+correct+'</span>';
    speak('Not quite! Try again!',0.85,1.0);
    setTimeout(startCountingGame,2500);
  }
}
const _kidsOrigGoPage = window.goPage;
window.goPage = function(name){
  _kidsOrigGoPage(name);
  if(name==='kids-home')updateKidsHomeUI();
  if(name==='kids-alphabet')renderAlphabet();
  if(name==='kids-numbers')renderNumbers();
  if(name==='kids-badges')renderKidsBadges();
};
(function injectKidsModeIntoAuth(){
  const authBody=document.querySelector('.auth-body');
  if(!authBody)return;
  const kidsSection=document.createElement('div');
  kidsSection.id='kids-mode-section';
  kidsSection.style.cssText='margin-bottom:1.5rem;padding-top:1.2rem;border-top:1px solid var(--border);display:none;';
  kidsSection.innerHTML=`
    <div style="font-size:12px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:.8rem;">Choose Age Group</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:1rem;" id="kids-age-select"><div class="mode-card sel" onclick="selectKidsAge('nursery',this)"><span class="mi">🌱</span><div class="mt">Nursery</div><div class="ms">Ages 4-6</div></div><div class="mode-card" onclick="selectKidsAge('lower_primary',this)"><span class="mi">📚</span><div class="mt">Lower Primary</div><div class="ms">Ages 7-8</div></div><div class="mode-card" onclick="selectKidsAge('upper_primary',this)"><span class="mi">🚀</span><div class="mt">Upper Primary</div><div class="ms">Ages 9-11</div></div><div class="mode-card" onclick="selectKidsAge('jhs',this)"><span class="mi">🎓</span><div class="mt">JHS</div><div class="ms">Ages 12-15</div></div></div><div style="margin-bottom:.8rem;"><label class="fl">Child's Name</label><input type="text" id="kids-child-name" placeholder="e.g. Kwame or Ama"></div><button class="btn bp bfull" style="font-size:1rem;padding:13px;" onclick="launchKidsMode()">🎮 Start Kids Learning!</button>
  `;
  authBody.appendChild(kidsSection);
  const demoRow=authBody.querySelector('.demo-row');
  if(demoRow){
    const kidsBtn=document.createElement('button');
    kidsBtn.className='demo-btn';
    kidsBtn.style.cssText='grid-column:span 2;background:rgba(212,150,10,.08);border-color:rgba(212,150,10,.3);font-weight:700;font-size:14px;padding:12px;';
    kidsBtn.innerHTML='🌟 Kids Learning Mode (Ages 4-15)';
    kidsBtn.onclick=()=>{
      document.getElementById('kids-mode-section').style.display='';
      kidsBtn.style.display='none';
      document.getElementById('login-form').querySelector('.btn').style.display='none';
    };
    demoRow.parentNode.insertBefore(kidsBtn,demoRow);
    demoRow.parentNode.insertBefore(document.createElement('div'),demoRow);
  }
})();

let selectedKidsAge='nursery';
function selectKidsAge(age, btn){
  selectedKidsAge=age;
  document.querySelectorAll('#kids-age-select .mode-card').forEach(b=>b.classList.remove('sel'));
  btn.classList.add('sel');
}
function launchKidsMode(){
  const name=(document.getElementById('kids-child-name')&&document.getElementById('kids-child-name').value.trim())||'Little Star';
  enterKidsMode(selectedKidsAge, name);
  document.getElementById('pg-auth').style.display='none';
}
(function addKidsModeToHome(){
  setTimeout(()=>{
    const homePg=document.getElementById('pg-home');
    if(!homePg)return;
    const btnWrap=document.createElement('div');
    btnWrap.style.cssText='padding:0 1.2rem 1.5rem;';
    btnWrap.innerHTML='<button class="btn bfull" type="button" onclick="promptKidsMode()" style="background:linear-gradient(135deg,#ff6b35,#d4960a);color:#fff;font-family:var(--fh);font-size:1rem;padding:16px;border-radius:16px;border:none;"><span style="font-size:1.3rem;">&#x1F31F;</span> Kids Learning Mode \u2014 Ages 4\u201315</button>';
    const lastFgrid=homePg.querySelectorAll('.fgrid');
    const lastGrid=lastFgrid[lastFgrid.length-1];
    if(lastGrid)lastGrid.parentNode.insertBefore(btnWrap,lastGrid.nextSibling);
  },100);
})();

function promptKidsMode(){
  const age=prompt('Enter child\'s age group:\n1 = Nursery (4-6)\n2 = Lower Primary (7-8)\n3 = Upper Primary (9-11)\n4 = JHS (12-15)\n\nType 1, 2, 3 or 4:');
  const name=prompt("Child's name:");
  const ageMap={'1':'nursery','2':'lower_primary','3':'upper_primary','4':'jhs'};
  enterKidsMode(ageMap[age]||'nursery', name||'Little Star');
}

function showSHSGuide(){
  if(document.getElementById('shs-modal'))return;
  var steps=[
    {e:'📜',t:'WASSCE / BECE Prep',s:'Most important tool',d:'Exam-style questions like past papers, with marking schemes and examiner tips.',p:'wassce'},
    {e:'🎯',t:'Quiz',s:'Practice daily',d:'Select your subject, set level to Advanced or Intermediate. AI adapts to your weak areas.',p:'quiz'},
    {e:'✍️',t:'Essay Grader',s:'Improve your writing',d:'Submit any essay and get AI feedback graded in WASSCE style — A1, B2, B3...',p:'essay'},
    {e:'📅',t:'Study Plan',s:'Stay organised',d:'Set goal to WASSCE Exam and get a personalised day-by-day revision schedule.',p:'studyplan'},
    {e:'🤖',t:'AI Tutor',s:'Ask anything',d:'Explains any topic in depth. Ask in English, Twi, Fante, Ewe, Ga, Hausa or Dagbani.',p:'tutor'},
    {e:'🗺️',t:'Mastery Map',s:'Know your strengths',d:'See exactly which subjects you are strong or weak in, with an AI recommendation.',p:'mastery'},
    {e:'🃏',t:'Flashcards',s:'Quick revision',d:'Generate AI revision decks for any subject in seconds.',p:'flashcards'},
    {e:'📝',t:'My Notes',s:'Save your notes',d:'Write notes per subject. AI Summarise writes a revision note on any topic.',p:'notes'},
  ];
  var overlay=document.createElement('div');
  overlay.id='shs-modal';
  overlay.style.cssText='position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.55);display:flex;align-items:flex-end;justify-content:center;';
  var sheet=document.createElement('div');
  sheet.style.cssText='background:var(--bg);border-radius:24px 24px 0 0;width:100%;max-width:680px;padding:1.8rem 1.5rem 2.5rem;max-height:88vh;overflow-y:auto;-webkit-overflow-scrolling:touch;';
  var handle=document.createElement('div');
  handle.style.cssText='width:40px;height:4px;background:var(--border2);border-radius:99px;margin:0 auto 1.4rem;';
  var heading=document.createElement('div');
  heading.style.cssText='font-family:var(--fh);font-size:1.2rem;font-weight:800;color:var(--text);margin-bottom:.3rem;';
  heading.textContent='🔥 SHS Students — Your Guide';
  var sub=document.createElement('div');
  sub.style.cssText='font-size:13px;color:var(--muted);margin-bottom:1.4rem;';
  sub.textContent='Ages 16-18 · WASSCE Preparation';
  var list=document.createElement('div');
  list.style.cssText='display:flex;flex-direction:column;gap:10px;';
  steps.forEach(function(s){
    var card=document.createElement('div');
    card.style.cssText='background:var(--card);border:1px solid var(--border);border-radius:14px;padding:1rem 1.1rem;display:flex;gap:12px;align-items:flex-start;cursor:pointer;';
    var ico=document.createElement('span');ico.style.cssText='font-size:26px;flex-shrink:0;';ico.textContent=s.e;
    var info=document.createElement('div');info.style.flex='1';
    var tt=document.createElement('div');tt.style.cssText='font-family:var(--fh);font-size:.9rem;font-weight:700;color:var(--text);';tt.textContent=s.t;
    var ss=document.createElement('div');ss.style.cssText='font-size:11px;color:var(--gold);font-weight:600;margin-bottom:3px;';ss.textContent=s.s;
    var dd=document.createElement('div');dd.style.cssText='font-size:12.5px;color:var(--muted);line-height:1.5;';dd.textContent=s.d;
    var arr=document.createElement('span');arr.style.cssText='color:var(--gold);font-size:18px;flex-shrink:0;margin-top:2px;';arr.textContent='→';
    info.appendChild(tt);info.appendChild(ss);info.appendChild(dd);
    card.appendChild(ico);card.appendChild(info);card.appendChild(arr);
    card.addEventListener('click',(function(pg){return function(){overlay.remove();goPage(pg);};})(s.p));
    list.appendChild(card);
  });
  var btn=document.createElement('button');
  btn.type='button';
  btn.style.cssText='width:100%;margin-top:1.4rem;background:var(--gold);color:#fff;border:none;padding:14px;border-radius:14px;font-family:var(--fh);font-size:1rem;font-weight:700;cursor:pointer;';
  btn.textContent='Got it — Start Learning! 🔥';
  btn.addEventListener('click',function(){overlay.remove();});
  sheet.appendChild(handle);sheet.appendChild(heading);sheet.appendChild(sub);sheet.appendChild(list);sheet.appendChild(btn);
  overlay.appendChild(sheet);
  overlay.addEventListener('click',function(e){if(e.target===overlay)overlay.remove();});
  document.body.appendChild(overlay);
}

if("serviceWorker"in navigator){
  var _h=location.hostname;
  if(!(_h.includes("claude")||_h.includes("localhost")||_h==="")){
    window.addEventListener("load",function(){
      navigator.serviceWorker.register("sw.js")
        .then(function(r){console.log("SW ok",r.scope);})
        .catch(function(e){console.log("SW fail",e);});
    });
  }
}
var _dp=null;
window.addEventListener("beforeinstallprompt",function(e){e.preventDefault();_dp=e;setTimeout(_showBar,1500);});
function _showBar(){
  if(document.getElementById("em-ib"))return;
  var d=document.createElement("div");d.id="em-ib";
  d.style.cssText="position:fixed;bottom:72px;left:12px;right:12px;z-index:9000;background:#fff;border:1.5px solid rgba(212,150,10,.4);border-radius:16px;padding:12px 16px;display:flex;align-items:center;gap:12px;box-shadow:0 4px 20px rgba(0,0,0,.1);";
  d.innerHTML='<div style="font-size:22px;">&#128241;</div>'
    +'<div style="flex:1;"><div style="font-size:13px;font-weight:700;color:var(--text);">Install Nyansa AI</div>'
    +'<div style="font-size:11px;color:var(--muted);">Add to home screen &mdash; works offline</div></div>'
    +'<button type="button" id="em-ib-i" style="background:var(--gold);color:#fff;border:none;padding:8px 16px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;">Install</button>'
    +'<button type="button" id="em-ib-c" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--muted);">&times;</button>';
  document.body.appendChild(d);
  document.getElementById("em-ib-i").onclick=_install;
  document.getElementById("em-ib-c").onclick=function(){d.remove();};
  setTimeout(function(){if(d.parentNode)d.remove();},15000);
}
function _install(){if(!_dp)return;_dp.prompt();_dp.userChoice.then(function(r){if(r.outcome==="accepted"&&typeof toast==="function")toast("Nyansa AI installed!","&#128241;","green",4000);_dp=null;var x=document.getElementById("em-ib");if(x)x.remove();});}
var _isIOS=/iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
var _sa=window.matchMedia("(display-mode:standalone)").matches||!!navigator.standalone;
if(_isIOS&&!_sa){
  setTimeout(function(){
    if(document.getElementById("em-ih"))return;
    var d=document.createElement("div");d.id="em-ih";
    d.style.cssText="position:fixed;bottom:72px;left:12px;right:12px;z-index:9000;background:#fff;border:1.5px solid rgba(212,150,10,.4);border-radius:16px;padding:14px 16px;box-shadow:0 4px 20px rgba(0,0,0,.1);";
    d.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">'
      +'<div style="font-size:13px;font-weight:700;color:var(--text);">&#128241; Install Nyansa AI on iPhone</div>'
      +'<button type="button" id="em-ih-c" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--muted);">&times;</button></div>'
      +'<div style="font-size:13px;color:var(--muted);line-height:1.8;">'
      +'1. Tap <b style="color:var(--text)">Share &#11014;</b> at the bottom of Safari<br>'
      +'2. Tap <b style="color:var(--text)">Add to Home Screen</b><br>'
      +'3. Tap <b style="color:var(--text)">Add</b> &mdash; works offline too! &#127881;</div>';
    document.body.appendChild(d);
    document.getElementById("em-ih-c").onclick=function(){d.remove();};
    setTimeout(function(){if(d.parentNode)d.remove();},20000);
  },3500);
}


;
// ── SCORE SUMMARY ──────────────────────────────────────────────────────────
var _sessionStart = { score:0, total:0, correct:0, xp:0 };

function showScoreSummary(){
  // Calculate session stats
  var sessionScore = state.score - _sessionStart.score;
  var sessionTotal = state.total - _sessionStart.total;
  var sessionCorrect = state.correct - _sessionStart.correct;
  var sessionXP = state.xp - _sessionStart.xp;
  var acc = sessionTotal > 0 ? Math.round(sessionCorrect/sessionTotal*100) : 0;

  // Grade
  var grade, gradeColor, msg;
  if(acc >= 80){ grade='Excellent! 🌟'; gradeColor='#006b3f'; msg='Outstanding performance! You are well prepared. Keep it up!'; }
  else if(acc >= 65){ grade='Good Job! 👍'; gradeColor='#d4960a'; msg='Solid performance. Review the questions you missed and you will be even stronger.'; }
  else if(acc >= 50){ grade='Keep Going! 💪'; gradeColor='#e67e00'; msg='You are making progress. Focus on your weak subjects and practise daily.'; }
  else { grade='More Practice Needed'; gradeColor='#ce1126'; msg='Don\'t give up! Every question you practise makes you better. Try again!'; }

  // Subject breakdown for this session
  var subBreakdown = '';
  Object.entries(state.subjectStats).forEach(function(entry){
    var sub = entry[0], s = entry[1];
    var pct = Math.round(s.correct/s.total*100);
    var col = pct>=70?'#006b3f':pct>=40?'#d4960a':'#ce1126';
    var lbl=typeof subjectDisplayName==='function'?subjectDisplayName(sub):(sub.charAt(0).toUpperCase()+sub.slice(1));
    subBreakdown += '<div class="score-subject-row">'
      +'<span style="font-weight:500;">'+lbl+'</span>'
      +'<div style="display:flex;align-items:center;gap:8px;">'
      +'<span style="font-size:12px;color:var(--muted);">'+s.correct+'/'+s.total+'</span>'
      +'<span style="font-family:var(--fh);font-weight:700;color:'+col+'">'+pct+'%</span>'
      +'</div></div>';
  });

  var overlay = document.createElement('div');
  overlay.className = 'score-modal-overlay';
  overlay.id = 'score-summary-modal';
  overlay.innerHTML = '<div class="score-modal">'
    +'<div style="width:40px;height:4px;background:var(--border2);border-radius:99px;margin:0 auto 1.5rem;"></div>'
    +'<div style="font-family:var(--fh);font-size:1.1rem;font-weight:800;text-align:center;margin-bottom:1.2rem;">Quiz Results 🇬🇭</div>'

    // Big score circle
    +'<div class="score-circle" style="background:'+(acc>=80?'rgba(0,107,63,.08)':acc>=65?'rgba(212,150,10,.08)':acc>=50?'rgba(230,126,0,.08)':'rgba(206,17,38,.07)')+';border-color:'+gradeColor+';">'
    +'<div class="sc-num" style="color:'+gradeColor+'">'+acc+'%</div>'
    +'<div class="sc-lbl">Accuracy</div>'
    +'</div>'

    +'<div class="score-grade" style="color:'+gradeColor+'">'+grade+'</div>'
    +'<div class="score-msg">'+msg+'</div>'

    // Stats row
    +'<div class="score-stats-row">'
    +'<div class="met"><div class="mv">'+sessionCorrect+'/'+sessionTotal+'</div><div class="ml">Score</div></div>'
    +'<div class="met"><div class="mv">'+sessionXP+'</div><div class="ml">XP Earned</div></div>'
    +'<div class="met"><div class="mv">'+state.streak+'</div><div class="ml">Streak</div></div>'
    +'</div>'

    // Subject breakdown
    +(subBreakdown ? '<div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--muted);margin-bottom:.5rem;">Subject Breakdown</div>'
    +'<div class="score-subject-list">'+subBreakdown+'</div>' : '')

    // Buttons
    +'<button type="button" onclick="continueQuiz()" style="width:100%;background:var(--gold);color:#fff;border:none;padding:14px;border-radius:14px;font-family:var(--fh);font-size:1rem;font-weight:700;cursor:pointer;margin-bottom:8px;">Continue Quiz →</button>'
    +'<button type="button" id="view-history-btn" style="width:100%;background:transparent;border:1px solid var(--border2);padding:12px;border-radius:14px;font-family:var(--fh);font-size:.9rem;font-weight:600;cursor:pointer;color:var(--muted);">View Full History</button>'
    +'</div>';

  document.body.appendChild(overlay);
  overlay.addEventListener('click', function(e){ if(e.target===overlay){ overlay.remove(); } });
  var vhBtn=document.getElementById('view-history-btn');
  if(vhBtn)vhBtn.addEventListener('click',function(){var m=document.getElementById('score-summary-modal');if(m)m.remove();goPage('history');});
}

function continueQuiz(){
  var modal = document.getElementById('score-summary-modal');
  if(modal) modal.remove();
  // Reset session tracking
  _sessionStart = { score:state.score, total:state.total, correct:state.correct, xp:state.xp };
  generateQuestion();
}

// Hook into recordAnswer — show summary every 10 questions
// Using lazy call so we don't capture before recordAnswer is defined
var _scoreCheckActive = true;
function _checkScoreMilestone(){
  if(!_scoreCheckActive) return;
  if(state.total > 0 && state.total % 10 === 0){
    setTimeout(function(){
      var modal = document.getElementById('score-summary-modal');
      if(!modal) showScoreSummary();
    }, 2000);
  }
}

// Score button is in quiz HTML directly

// ── CALC STYLES ───────────────────────────────────────────────────────────
(function(){var s=document.createElement('style');s.textContent='.calc-btn{padding:14px;border-radius:12px;font-size:1.1rem;font-weight:700;cursor:pointer;border:1px solid var(--border2);background:var(--bg2);color:var(--text);font-family:var(--fh);transition:all .15s;text-align:center;}.calc-btn:hover{background:var(--bg3);border-color:var(--gold);}.calc-op{background:rgba(212,150,10,.1);color:var(--gold);border-color:rgba(212,150,10,.25);}.calc-fn{background:var(--bg3);color:var(--muted);}.calc-eq{background:var(--gold);color:#fff;border-color:var(--gold);}';document.head.appendChild(s);})();

// ── CALCULATOR ────────────────────────────────────────────────────────────
var _calcDisplay='0', _calcExpr='', _calcOp=null, _calcPrev=null, _calcNewNum=true;
function _updateCalcDisplay(){
  var d=document.getElementById('calc-display');
  var e=document.getElementById('calc-expr');
  if(d)d.textContent=_calcDisplay;
  if(e)e.textContent=_calcExpr;
}
function calcNum(n){
  if(_calcNewNum){_calcDisplay=n==='.'?'0.':n;_calcNewNum=false;}
  else{if(n==='.'&&_calcDisplay.includes('.'))return;_calcDisplay+=n;}
  _updateCalcDisplay();
}
function calcOp(op){
  _calcPrev=parseFloat(_calcDisplay);_calcOp=op;
  var sym={'+':`+`,'-':'-','*':'×','/':'÷'}[op]||op;
  _calcExpr=_calcDisplay+' '+sym;_calcNewNum=true;_updateCalcDisplay();
}
function calcEquals(){
  if(_calcOp===null||_calcPrev===null)return;
  var cur=parseFloat(_calcDisplay),res;
  _calcExpr=_calcExpr+' '+_calcDisplay+' =';
  switch(_calcOp){
    case'+':res=_calcPrev+cur;break;case'-':res=_calcPrev-cur;break;
    case'*':res=_calcPrev*cur;break;case'/':res=cur!==0?_calcPrev/cur:'Error';break;
    default:res=cur;
  }
  _calcDisplay=isNaN(res)?'Error':parseFloat(res.toFixed(10)).toString();
  _calcOp=null;_calcPrev=null;_calcNewNum=true;_updateCalcDisplay();
}
function calcFn(fn){
  var v=parseFloat(_calcDisplay);
  if(fn==='C'){_calcDisplay='0';_calcExpr='';_calcOp=null;_calcPrev=null;_calcNewNum=true;}
  else if(fn==='±'){_calcDisplay=(-v).toString();}
  else if(fn==='%'){_calcDisplay=(v/100).toString();}
  else if(fn==='sqrt'){_calcDisplay=v>=0?Math.sqrt(v).toFixed(8).replace(/\.?0+$/,''):'Error';}
  else if(fn==='sq'){_calcDisplay=(v*v).toString();}
  else if(fn==='log'){_calcDisplay=v>0?Math.log10(v).toFixed(8).replace(/\.?0+$/,''):'Error';}
  else if(fn==='sin'){_calcDisplay=Math.sin(v*Math.PI/180).toFixed(8).replace(/\.?0+$/,'');}
  else if(fn==='cos'){_calcDisplay=Math.cos(v*Math.PI/180).toFixed(8).replace(/\.?0+$/,'');}
  else if(fn==='tan'){_calcDisplay=Math.tan(v*Math.PI/180).toFixed(8).replace(/\.?0+$/,'');}
  else if(fn==='pi'){_calcDisplay=Math.PI.toString();_calcNewNum=false;_updateCalcDisplay();return;}
  _calcNewNum=true;_updateCalcDisplay();
}
var _FORMULAS={
  maths:[
    {name:'Quadratic Formula',f:'x = (-b ± √(b²-4ac)) / 2a'},
    {name:'Pythagoras',f:'a² + b² = c²'},
    {name:'Area of Circle',f:'A = πr²'},
    {name:'Circumference',f:'C = 2πr'},
    {name:'Area of Triangle',f:'A = ½ × base × height'},
    {name:'Area of Rectangle',f:'A = length × width'},
    {name:'Simple Interest',f:'I = PRT / 100'},
    {name:'Compound Interest',f:'A = P(1 + r/n)^(nt)'},
    {name:'Gradient / Slope',f:'m = (y₂ - y₁) / (x₂ - x₁)'},
    {name:'Distance Formula',f:'d = √((x₂-x₁)² + (y₂-y₁)²)'},
  ],
  physics:[
    {name:'Speed',f:'v = d / t'},
    {name:'Force',f:'F = ma'},
    {name:'Work Done',f:'W = Fd'},
    {name:'Power',f:'P = W / t'},
    {name:'Kinetic Energy',f:'KE = ½mv²'},
    {name:'Potential Energy',f:'PE = mgh'},
    {name:'Ohm\'s Law',f:'V = IR'},
    {name:'Pressure',f:'P = F / A'},
    {name:'Density',f:'ρ = m / V'},
    {name:'Wave Speed',f:'v = fλ'},
  ],
  chemistry:[
    {name:'Mole',f:'n = m / M'},
    {name:'Concentration',f:'c = n / V'},
    {name:'Ideal Gas',f:'PV = nRT'},
    {name:'Avogadro\'s Number',f:'Nₐ = 6.022 × 10²³'},
    {name:'pH',f:'pH = -log[H⁺]'},
    {name:'Empirical Formula',f:'Find ratio: moles = mass / Mr'},
    {name:'Rate of Reaction',f:'Rate = Δconcentration / Δtime'},
    {name:'Faraday\'s Law',f:'m = (M × I × t) / (n × F)'},
  ],
  geometry:[
    {name:'Volume — Cylinder',f:'V = πr²h'},
    {name:'Volume — Sphere',f:'V = (4/3)πr³'},
    {name:'Volume — Cone',f:'V = (1/3)πr²h'},
    {name:'Volume — Prism',f:'V = base area × height'},
    {name:'Surface Area — Sphere',f:'SA = 4πr²'},
    {name:'Surface Area — Cylinder',f:'SA = 2πr(r+h)'},
    {name:'Sector Area',f:'A = (θ/360) × πr²'},
    {name:'Arc Length',f:'L = (θ/360) × 2πr'},
  ]
};
function showFormulas(cat){
  var content=document.getElementById('formula-content');if(!content)return;
  var list=_FORMULAS[cat]||[];
  document.querySelectorAll('#formula-tabs .btn').forEach(function(b){b.className='btn bs bsm';});
  var tabs=document.getElementById('formula-tabs');
  if(tabs){tabs.querySelectorAll('button').forEach(function(b,i){if(['maths','physics','chemistry','geometry'][i]===cat)b.className='btn bp bsm';});}
  content.innerHTML=list.map(function(f){return '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border);"><span style="font-size:13px;color:var(--muted);">'+f.name+'</span><span style="font-family:var(--fh);font-size:13px;font-weight:700;color:var(--text);">'+f.f+'</span></div>';}).join('');
}
(function(){setTimeout(function(){if(document.getElementById('formula-content'))showFormulas('maths');},200);})();

// ── WASSCE / BECE PREP ───────────────────────────────────────────────────
async function generateWASSCE(){
  var exam=document.getElementById('wassce-exam').value;
  var subject=document.getElementById('wassce-subject').value;
  var type=document.getElementById('wassce-type').value;
  var year=document.getElementById('wassce-year').value;
  var btn=document.getElementById('wassce-btn');
  var loading=document.getElementById('wassce-loading');
  var result=document.getElementById('wassce-result');
  btn.disabled=true;loading.style.display='flex';result.innerHTML='';
  var prompt;
  if(type==='MCQ'){
    prompt='Generate a '+year+' style '+exam+' objective multiple choice question for '+subject+' in Ghana. Make it authentic exam style. Return ONLY JSON: {"question":"...","options":["A. ...","B. ...","C. ...","D. ..."],"answer":0,"explanation":"...","markscheme":"...","tip":"examiner tip"}. answer is 0-3.';
  } else if(type==='essay'){
    prompt='Generate a '+year+' style '+exam+' essay/theory question for '+subject+' in Ghana. Return ONLY JSON: {"question":"...","marks":10,"markscheme":"...","sampleAnswer":"...","tip":"examiner tip"}';
  } else {
    prompt='Generate a '+year+' style '+exam+' structured question for '+subject+' in Ghana with 2-3 parts. Return ONLY JSON: {"question":"...","parts":[{"label":"(a)","text":"...","marks":3},{"label":"(b)","text":"...","marks":4}],"markscheme":"...","tip":"examiner tip"}';
  }
  try{
    var raw=await ai(prompt,1000,function(){
      if(type==='MCQ')return JSON.stringify({question:'A trader buys goods for GH₵ 240 and sells for GH₵ 300. Calculate the percentage profit.',options:['A. 20%','B. 25%','C. 30%','D. 40%'],answer:1,explanation:'Profit = 300-240 = 60. % Profit = (60/240)×100 = 25%',markscheme:'Profit = GH₵60 [1 mark], % Profit = (60/240)×100 = 25% [2 marks]',tip:'Always show working. Many candidates forget to express as percentage of COST price.'});
      return JSON.stringify({question:'Discuss the causes and effects of inflation in Ghana.',marks:10,markscheme:'Causes: 2 marks each (demand-pull, cost-push, monetary). Effects: 2 marks each. Well-linked answer: 2 marks.',sampleAnswer:'Inflation is a sustained rise in the general price level... (demand-pull, cost-push, imported inflation)',tip:'State, explain, and give a Ghanaian example for each point.'});
    });
    var q=parseJSON(raw);
    var html='<div class="card cp">';
    html+='<div style="display:flex;align-items:center;gap:8px;margin-bottom:1rem;flex-wrap:wrap;">';
    html+='<span class="chip cg">'+exam+'</span>';
    html+='<span class="chip cgr">'+subject+'</span>';
    html+='<span class="chip cgray">'+type+'</span>';
    if(q.marks)html+='<span class="chip cr">'+q.marks+' marks</span>';
    html+='</div>';
    html+='<div style="font-family:var(--fh);font-size:1rem;font-weight:700;color:var(--text);line-height:1.6;margin-bottom:1rem;">'+esc(q.question)+'</div>';
    if(q.options){
      html+='<div style="margin-bottom:1rem;">';
      q.options.forEach(function(o,i){html+='<div style="padding:10px 14px;background:var(--bg2);border:1.5px solid var(--border);border-radius:var(--r);font-size:13.5px;margin-bottom:8px;cursor:pointer;" id="wq-opt-'+i+'" onclick="revealWASSCE('+i+','+q.answer+')">'+esc(o)+'</div>';});
      html+='</div>';
    }
    if(q.parts){
      html+='<div style="margin-bottom:1rem;">';
      q.parts.forEach(function(p){html+='<div style="margin-bottom:.8rem;"><span style="font-weight:700;color:var(--gold);">'+esc(p.label)+'</span> <span style="color:var(--muted);font-size:11px;">['+p.marks+' marks]</span><div style="font-size:13.5px;margin-top:4px;color:var(--text);">'+esc(p.text)+'</div></div>';});
      html+='</div>';
      html+='<textarea id="wassce-answer" placeholder="Write your answer here — show all working..." style="min-height:120px;margin-bottom:10px;"></textarea>';
      html+='<button class="btn bp bsm" onclick="submitWASSCEAnswer()">Submit Answer</button>';
      html+='<div id="wassce-feedback" style="margin-top:10px;"></div>';
    }
    html+='<details style="margin-top:12px;"><summary style="cursor:pointer;font-size:13px;font-weight:700;color:var(--gold);">📋 Mark Scheme</summary>';
    html+='<div style="background:var(--bg2);border-radius:var(--r);padding:12px;margin-top:8px;font-size:13px;line-height:1.7;color:var(--muted);">'+esc(q.markscheme||q.explanation||'')+'</div></details>';
    if(q.sampleAnswer){html+='<details style="margin-top:8px;"><summary style="cursor:pointer;font-size:13px;font-weight:700;color:var(--green);">📝 Sample Answer</summary><div style="background:rgba(0,107,63,.05);border-radius:var(--r);padding:12px;margin-top:8px;font-size:13px;line-height:1.7;color:var(--text);">'+esc(q.sampleAnswer)+'</div></details>';}
    if(q.tip){html+='<div class="hbox" style="margin-top:12px;">💡 <strong>Examiner\'s Tip:</strong> '+esc(q.tip)+'</div>';}
    html+='</div>';
    result.innerHTML=html;
  }catch(e){result.innerHTML='<div class="ebox">Could not generate. Please try again.</div>';}
  btn.disabled=false;loading.style.display='none';
}
function revealWASSCE(chosen, correct){
  document.querySelectorAll('[id^="wq-opt-"]').forEach(function(el,i){
    el.style.pointerEvents='none';
    if(i===correct)el.style.cssText+=';background:rgba(0,107,63,.1);border-color:#006b3f;color:#006b3f;font-weight:600;';
    else if(i===chosen&&chosen!==correct)el.style.cssText+=';background:rgba(206,17,38,.07);border-color:#ce1126;color:#ce1126;';
  });
}
async function submitWASSCEAnswer(){
  var ans=document.getElementById('wassce-answer').value.trim();if(!ans)return;
  var fb=document.getElementById('wassce-feedback');fb.innerHTML='<div class="lr"><div class="sp"></div>Marking...</div>';
  var prompt='You are a WASSCE examiner. Grade this structured answer. Return ONLY JSON: {"score":0-10,"grade":"A1/B2/B3/C4/C5/C6/D7/E8/F9","feedback":"3 lines of examiner feedback","pointsAwarded":["point 1","point 2"]}.\n\nAnswer: "'+ans.slice(0,2000)+'"';
  try{
    var raw=await ai(prompt,500,function(){return JSON.stringify({score:ans.length>100?7:4,grade:ans.length>100?'B2':'C5',feedback:'Your answer shows understanding but needs more specific examples. Remember to always state, explain and exemplify each point. Structure your answer with clear paragraphs.',pointsAwarded:['Good attempt at defining the concept','Some relevant points identified']});});
    var r=parseJSON(raw);
    var gc={'A1':'cgr','B2':'cgr','B3':'cg','C4':'cg','C5':'cg','C6':'cg','D7':'cr','E8':'cr','F9':'cr'}[r.grade]||'cgray';
    fb.innerHTML='<div class="fbox"><div style="display:flex;gap:8px;align-items:center;margin-bottom:8px;"><span class="chip '+gc+'">'+r.grade+' · '+r.score+'/10</span></div>'+esc(r.feedback)+(r.pointsAwarded&&r.pointsAwarded.length?'<div style="margin-top:8px;font-size:12px;font-weight:700;color:#006b3f;">Points credited:</div>'+(r.pointsAwarded.map(function(p){return '<div style="font-size:12px;color:var(--muted);">✓ '+esc(p)+'</div>';}).join('')):'')+'</div>';
  }catch(e){fb.innerHTML='<div class="ebox">Could not mark. Try again.</div>';}
}

// ── MASTERY MAP ───────────────────────────────────────────────────────────
(function hookMastery(){
  var orig=window.goPage;
  window.goPage=function(name){
    orig(name);
    if(name==='mastery')renderMastery();
  };
})();

// ── MY NOTES ─────────────────────────────────────────────────────────────
var _notes=[];
try{_notes=JSON.parse(localStorage.getItem('em_notes')||'[]');}catch(e){}
function saveNote(){
  var title=document.getElementById('note-title').value.trim();
  var content=document.getElementById('note-content').value.trim();
  var subject=document.getElementById('note-subject').value;
  if(!content){toast('Please write something first','✏️','gold',2000);return;}
  _notes.unshift({id:Date.now(),title:title||'Untitled Note',subject,content,date:new Date().toLocaleDateString('en-GH',{day:'numeric',month:'short',year:'numeric'})});
  try{localStorage.setItem('em_notes',JSON.stringify(_notes.slice(0,100)));}catch(e){}
  document.getElementById('note-title').value='';
  document.getElementById('note-content').value='';
  renderNotes();toast('Note saved!','📝','green',2000);
}
function deleteNote(id){
  _notes=_notes.filter(function(n){return n.id!==id;});
  try{localStorage.setItem('em_notes',JSON.stringify(_notes));}catch(e){}
  renderNotes();
}
function renderNotes(){
  var el=document.getElementById('notes-list');if(!el)return;
  if(!_notes.length){el.innerHTML='<p style="font-size:13px;color:var(--muted);">No notes saved yet.</p>';return;}
  el.innerHTML=_notes.map(function(n){
    return '<div class="card cp" style="margin-bottom:10px;"><div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;"><div><span class="chip cg" style="font-size:10px;margin-bottom:4px;display:inline-flex;">'+esc(n.subject)+'</span><div style="font-family:var(--fh);font-size:.9rem;font-weight:700;color:var(--text);">'+esc(n.title)+'</div><div style="font-size:11px;color:var(--muted);">'+n.date+'</div></div><button onclick="deleteNote('+n.id+')" class="btn bs bsm" style="padding:4px 8px;font-size:11px;">✕</button></div><div style="font-size:13px;color:var(--muted);line-height:1.6;white-space:pre-wrap;">'+esc(n.content.slice(0,300))+(n.content.length>300?'...':'')+'</div></div>';
  }).join('');
}
async function aiSummariseForNotes(){
  var topic=document.getElementById('note-content').value.trim()||document.getElementById('note-title').value.trim();
  var subject=document.getElementById('note-subject').value;
  if(!topic){toast('Enter a topic or some notes to summarise','💡','gold',2500);return;}
  var res=document.getElementById('note-ai-result');
  res.innerHTML='<div class="lr"><div class="sp"></div>AI is writing a summary...</div>';
  var prompt='Write a concise, well-structured revision note for a Ghanaian student on: "'+topic.slice(0,300)+'" (subject: '+subject+'). Include: key definitions, 3-5 main points, and 1 example. Keep it under 200 words.';
  try{
    var raw=await ai(prompt,600,function(){return 'Key revision notes for '+topic+':\n\n1. Define and understand the core concept\n2. Learn key formulas or principles\n3. Practice with past examples\n4. Review regularly for retention';});
    res.innerHTML='<div class="fbox"><div style="font-size:11px;font-weight:700;color:#006b3f;margin-bottom:6px;">✨ AI Summary</div>'+esc(raw).replace(/\n/g,'<br>')+'<button class="btn bp bsm" style="margin-top:10px;" onclick="useAISummary(this)">Use as Note</button></div>';
  }catch(e){res.innerHTML='<div class="ebox">Could not generate. Try again.</div>';}
}
function useAISummary(btn){
  var text=btn.parentElement.innerText.replace('✨ AI Summary','').replace('Use as Note','').trim();
  document.getElementById('note-content').value=text;
  document.getElementById('note-ai-result').innerHTML='';
  toast('AI summary loaded — save it when ready','📝','gold',2500);
}
(function hookNotes(){
  var orig2=window.goPage;
  window.goPage=function(name){orig2(name);if(name==='notes')renderNotes();};
})();

// ── HOME SCREEN — add missing feature cards ───────────────────────────────
(function addMissingHomeCards(){
  setTimeout(function(){
    var homePg=document.getElementById('pg-home');if(!homePg)return;
    var grids=homePg.querySelectorAll('.fgrid');
    var toolsGrid=grids[grids.length-1];if(!toolsGrid)return;
    // Add cards only if not already there
    if(!homePg.querySelector('[data-nyansa-extra]')){
      var extraGrid=document.createElement('div');
      extraGrid.className='fgrid';
      extraGrid.setAttribute('data-nyansa-extra','1');
      extraGrid.innerHTML=
        '<div class="fcard ga" onclick="goPage(\'wassce\')"><div class="fi">📜</div><div class="ft">WASSCE Prep</div><div class="fd2">Exam-style questions</div><div class="fa">→</div></div>'+
        '<div class="fcard ra" onclick="goPage(\'mastery\')"><div class="fi">🗺️</div><div class="ft">Mastery Map</div><div class="fd2">Know your strengths</div><div class="fa">→</div></div>'+
        '<div class="fcard gra" onclick="goPage(\'notes\')"><div class="fi">📝</div><div class="ft">My Notes</div><div class="fd2">Save & AI summarise</div><div class="fa">→</div></div>'+
        '<div class="fcard ga" onclick="goPage(\'calculator\')"><div class="fi">🔢</div><div class="ft">Calculator</div><div class="fd2">+ Formula sheet</div><div class="fa">→</div></div>';
      var shLabel=document.createElement('div');
      shLabel.className='sh-label';
      shLabel.textContent='Exam Tools';
      toolsGrid.parentNode.insertBefore(shLabel,toolsGrid);
      toolsGrid.parentNode.insertBefore(extraGrid,toolsGrid);
    }
  },150);
})();



// ══════════════════════════════════════════════════════════════════════════
//  NYANSA AI — STRUCTURED LEARNING ENGINE v1
//  Learn → Practice → Feedback → Progress
//  All 8 systems: Teach Mode, Test Me, Smart Feedback, Explain Simply,
//  Socratic Mode, Progress Tracking, Localisation, Weekly Summary
// ══════════════════════════════════════════════════════════════════════════

// ── 1. LEARNER PROFILE ────────────────────────────────────────────────────
// Detect age group from existing auth/kids state
function getLearnerAge() {
  // From kids mode
  if (typeof kidsState !== 'undefined' && kidsState.ageGroup) {
    const map = { nursery: 5, lower_primary: 7, upper_primary: 10, jhs: 13 };
    return map[kidsState.ageGroup] || 13;
  }
  // From profile prefs
  try {
    const stored = JSON.parse(localStorage.getItem('em_learner') || '{}');
    if (stored.age) return stored.age;
  } catch(e) {}
  return 16; // default SHS
}

function getLearnerTone(age) {
  if (age <= 9)  return 'nursery';       // very short, fun, emojis
  if (age <= 14) return 'primary';       // step-by-step, clear
  return 'shs';                          // detailed, WASSCE-focused
}

function getAgeGroup() {
  const age = getLearnerAge();
  if (age <= 9) return 'nursery';
  if (age <= 14) return 'primary';
  return 'shs';
}

// Save learner age from settings
function saveLearnerAge(age) {
  try {
    const d = JSON.parse(localStorage.getItem('em_learner') || '{}');
    d.age = parseInt(age);
    localStorage.setItem('em_learner', JSON.stringify(d));
  } catch(e) {}
}

// ── 2. LOCALISATION LAYER ─────────────────────────────────────────────────
const GH_CONTEXT = {
  currency: 'Ghana cedis (GH₵)',
  market: 'Makola Market in Accra',
  city1: 'Accra', city2: 'Kumasi',
  food: 'fufu and groundnut soup',
  transport: 'trotro',
  school: 'Achimota School',
  river: 'River Volta',
  farm: 'cocoa farm in Ashanti',
  greeting: 'Akwaaba',
};

// Detect informal/Ghanaian phrases and normalise
function normaliseInput(text) {
  const fixes = {
    'i no understand': 'I do not understand',
    'i no sabi': 'I do not know',
    'e dey confuse me': 'it is confusing me',
    'make i understand': 'please help me understand',
    'how e take work': 'how does it work',
    'wetin be': 'what is',
    'i don forget': 'I have forgotten',
    'abeg explain': 'please explain',
    'e hard': 'it is difficult',
    'i no fit': 'I cannot',
  };
  let lower = text.toLowerCase();
  for (const [inf, formal] of Object.entries(fixes)) {
    lower = lower.replace(inf, formal);
  }
  return lower !== text.toLowerCase() ? lower : text;
}

// ── 3. TEACH MODE SYSTEM PROMPT BUILDER ──────────────────────────────────
// Builds the age-appropriate system prompt for the tutor
function buildTeachPrompt(topic, lang, ageGroup) {
  const tones = {
    nursery: `You are a warm, playful Ghanaian teacher for children aged 4-9.
Rules:
- Use VERY simple words (max 2 sentences per idea)
- Add 1-2 fun emojis per response
- Use things kids know: animals, colours, food (fufu, mango, kelewele), their school
- End EVERY response with one simple yes/no check-in question like "Does that make sense? 😊"
- Never use long explanations. If it takes more than 5 lines, split it.
- Celebrate the child: "Great question! 🌟"
- IMPORTANT: If the student sends only a single subject name like "Math", "English" or "Science" without a specific question or topic, do NOT give a generic introduction. Instead, ask them warmly what specific thing they want to learn. Example: if they say "Math", respond: "Yay, Maths! 🎉 What do you want to learn today? Numbers? Shapes? Adding? Tell me! 😊"`,

    primary: `You are a clear, patient Ghanaian tutor for students aged 10-14 (JHS level).
Rules:
- Structure every explanation in 3 parts:
  PART 1 — Simple explanation (2-3 sentences)
  PART 2 — Ghana/local example (use cedis, trotro, Makola market, Accra/Kumasi, cocoa farms, BECE context)
  PART 3 — One check-in question to test understanding
- Use step-by-step numbered lists for processes
- Never just give the answer — show the working
- If student says they don't understand, use a market/daily life analogy
- Tone: encouraging, like an older sibling helping with homework
- IMPORTANT: If the student sends only a subject name like "Math", "Science" or "English" with no specific topic, ask them what specific topic or concept they need help with. Example: "Great! Which topic in Maths are you working on — fractions, algebra, geometry? Tell me and I will explain it step by step."`,

    shs: `You are a sharp, exam-focused Ghanaian tutor for SHS students aged 15-18 preparing for WASSCE/BECE.
Rules:
- Structure EVERY response in 4 parts:
  📘 EXPLANATION — Clear, textbook-quality definition and explanation
  🇬🇭 GHANA EXAMPLE — Use Ghanaian context (GH₵, Bank of Ghana, COCOBOD, Akosombo Dam, 1992 Constitution, Kwame Nkrumah, etc.)
  📝 EXAM ANGLE — How this appears in WASSCE: "In WASSCE, questions on this often ask you to..."
  ❓ CHECK-IN — One WASSCE-style question for the student to try
- Use precise academic language
- Flag common exam mistakes: "⚠️ Common mistake: students confuse X with Y..."
- Reference WAEC marking schemes where relevant
- IMPORTANT: If the student sends only a subject name like "Math", "Physics", "Economics" with no specific topic, ask them which specific topic they need help with. List 3-4 example topics from that subject to prompt them. Example: "Which topic in Economics would you like to cover? E.g. Supply and Demand, Inflation, National Income, or Market Structures?"`,
  };

  const tone = tones[ageGroup] || tones.shs;
  const langNote = lang !== 'English' 
    ? `\n\nIMPORTANT: Reply in ${lang}. Keep explanation clear even when translated.` 
    : '';

  return tone + langNote + `\n\nTopic/Question: "${topic}"`;
}

// ── 4. UPGRADED sendChat ─────────────────────────────────────────────────
// Replaces the existing sendChat with the full learning engine
var _learnMode = 'teach'; // teach | socratic | simple | testme
var _learnHistory = []; // rolling conversation context

async function sendChat() {
  const inputEl = document.getElementById('chat-input');
  const rawMsg = (inputEl.value || '').trim();
  if (!rawMsg) return;

  // ── Vague input detection ──────────────────────────────────────────────
  // If student types only a subject name with no specific question, show
  // topic suggestions immediately — no API call needed.
  const SUBJECT_TOPICS = {
    math:      ['Fractions','Algebra','Quadratic Equations','Geometry','Statistics','Trigonometry'],
    maths:     ['Fractions','Algebra','Quadratic Equations','Geometry','Statistics','Trigonometry'],
    english:   ['Essay Writing','Comprehension','Grammar','Oral English','Summary Writing','Letter Writing'],
    science:   ['Photosynthesis','Cell Biology','Forces & Motion','Acids & Bases','Electricity','Genetics'],
    physics:   ['Forces & Motion','Waves','Optics','Electricity','Thermal Physics','Nuclear Physics'],
    chemistry: ['Atomic Structure','Chemical Bonding','Acids & Bases','Organic Chemistry','Stoichiometry'],
    biology:   ['Photosynthesis','Cell Structure','Genetics','Ecology','Human Body','Reproduction'],
    history:   ['Ghana Independence','Colonial Era','Kwame Nkrumah','Post-Independence Politics','African History'],
    geography: ['Map Reading','Climate & Weather','Ghana\'s Vegetation','Population','Agriculture'],
    economics: ['Supply & Demand','Inflation','National Income','Market Structures','International Trade'],
    government:['Democracy','Ghana\'s 1992 Constitution','Legislature','Electoral System','Human Rights'],
    literature:['Essay on Prose','Poetry Analysis','Drama','Character Analysis','Figures of Speech'],
    accounting:['Double Entry','Trial Balance','Income Statement','Balance Sheet','Bank Reconciliation'],
    social:    ['Ghana Geography','African History','Governance','Environmental Issues','ECOWAS'],
    ict:       ['HTML Basics','Spreadsheets','Internet Safety','Databases','Programming Logic'],
    french:    ['Greetings & Introductions','Numbers','Present Tense','Describing People','Directions'],
    rme:       ['Moral Values','Religious Beliefs','Family Life','Citizenship','Environmental Stewardship'],
    owop:      ['All About Us','Our Environment','Our Communities','Our Nation Ghana','The Wider World'],
    careertech:['Entrepreneurship','Agriculture & Environment','Home Economics','Technical Drawing','STEM Projects','ICT & Electronics'],
    cad:       ['Design Thinking','Visual Arts','Music (Ghanaian Heritage)','Dance & Drama','Graphic Design','Product Design'],
    historygh: ['Pre-Colonial Ghana','Colonial Era','Independence 1957','Nkrumah Presidency','Coups & Transitions','1992 Constitution'],
  };

  const lower = rawMsg.toLowerCase().trim();
  // Normalise common full GES subject names to their key
  const GES_ALIASES = {
    'mathematics': 'math', 'core mathematics': 'math', 'elective mathematics': 'math',
    'english language': 'english', 'english lang': 'english',
    'integrated science': 'science',
    'social studies': 'social',
    'information and communication technology': 'ict', 'information technology': 'ict',
    'religious and moral education': 'rme', 'r.m.e': 'rme', 'rme': 'rme',
    'financial accounting': 'accounting', 'cost accounting': 'accounting',
    'business management': 'economics', 'business studies': 'economics',
    'literature in english': 'literature',
    'food and nutrition': 'biology', 'home economics': 'biology',
  };
  const normLower = GES_ALIASES[lower] ? GES_ALIASES[lower] : lower;
  // Match if the message is just a subject name (1-3 words, no question mark, no extra context)
  const subjectKey = Object.keys(SUBJECT_TOPICS).find(k =>
    normLower === k || normLower === k + 's' || normLower === 'core ' + k ||
    normLower === 'elective ' + k || normLower === 'integrated ' + k
  );

  if (subjectKey && rawMsg.split(' ').length <= 4 && !rawMsg.includes('?')) {
    const topics = SUBJECT_TOPICS[subjectKey] || SUBJECT_TOPICS['math'];
    const win = document.getElementById('chat-win');
    // Show user message
    const uEl = document.createElement('div');
    uEl.className = 'msg-user';
    uEl.textContent = rawMsg;
    win.appendChild(uEl);
    inputEl.value = '';

    // Show smart topic picker — no API call
    const lEl = document.createElement('div');
    lEl.className = 'msg-ai';
    const ageGroup = getAgeGroup();
    const greeting = ageGroup === 'nursery'
      ? `Yay, ${rawMsg}! 🎉 What do you want to learn today?`
      : ageGroup === 'primary'
      ? `Great choice! Which ${rawMsg} topic do you need help with?`
      : `Which ${rawMsg} topic would you like to cover?`;

    const btns = topics.map(t =>
      `<button type="button" class="qa-btn" style="margin:3px;" onclick="
        document.getElementById('chat-input').value='Explain ${t} to me';
        sendChat();
      ">${t}</button>`
    ).join('');

    lEl.innerHTML = `<div class="ai-label">Nyansa AI Tutor</div>
      <div style="margin-bottom:8px;">${greeting}</div>
      <div style="display:flex;flex-wrap:wrap;gap:4px;">${btns}</div>
      <div style="font-size:12px;color:var(--muted);margin-top:8px;">Or type your own question below ↓</div>`;
    win.appendChild(lEl);
    win.scrollTop = win.scrollHeight;
    document.getElementById('chat-send').disabled = false;
    return; // Don't call the AI for a vague subject-only input
  }
  // ── End vague input detection ──────────────────────────────────────────

  const msg = normaliseInput(rawMsg);
  const lang = document.getElementById('tutor-lang').value || 'English';
  const win = document.getElementById('chat-win');
  const ageGroup = getAgeGroup();

  // Append user message
  const uEl = document.createElement('div');
  uEl.className = 'msg-user';
  uEl.textContent = rawMsg;
  win.appendChild(uEl);
  inputEl.value = '';
  win.scrollTop = win.scrollHeight;

  document.getElementById('chat-send').disabled = true;

  // AI thinking bubble
  const lEl = document.createElement('div');
  lEl.className = 'msg-ai';
  lEl.innerHTML = '<div class="ai-label">Nyansa AI Tutor</div><div class="lr" style="padding:4px 0;"><div class="sp"></div>Thinking...</div>';
  win.appendChild(lEl);
  win.scrollTop = win.scrollHeight;

  // Build mode-specific prompt
  let systemPrompt;
  if (_learnMode === 'socratic') {
    systemPrompt = buildSocraticPrompt(msg, lang, ageGroup);
  } else if (_learnMode === 'simple') {
    systemPrompt = buildSimplePrompt(msg, lang, ageGroup);
  } else {
    systemPrompt = buildTeachPrompt(msg, lang, ageGroup);
  }

  // Build conversation messages with history (max last 6 turns)
  const historyMsgs = _learnHistory.slice(-6).map(h => ({
    role: h.role, content: h.content
  }));

  try {
    const res = await fetch('/.netlify/functions/claude', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 900,
        system: systemPrompt,
        messages: [
          ...historyMsgs,
          { role: 'user', content: msg }
        ]
      })
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const d = await res.json();
    if (d.error) throw new Error(d.error.message);

    const reply = d.content.map(c => c.text || '').join('');

    // Render formatted reply
    lEl.innerHTML = '<div class="ai-label">Nyansa AI Tutor</div>' + formatTutorReply(reply);

    // Add post-lesson action buttons
    appendLessonActions(win, msg, reply, ageGroup);

    // Update conversation history
    _learnHistory.push({ role: 'user', content: msg });
    _learnHistory.push({ role: 'assistant', content: reply });
    if (_learnHistory.length > 20) _learnHistory = _learnHistory.slice(-20);

    // Track topic in learning data
    trackTopicStudied(msg, lang, ageGroup);

  } catch(e) {
    // Show the real error so we can diagnose it
    const errMsg = e && e.message ? e.message : 'Unknown error';
    const isKey = errMsg.includes('API_KEY') || errMsg.includes('401') || errMsg.includes('403');
    const isQuota = errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('Daily limit');
    const isNet = errMsg.includes('fetch') || errMsg.includes('network') || errMsg.includes('Failed');
    let userMsg;
    if (isKey) {
      userMsg = '⚠️ API key error. Please check your API key is set correctly in Netlify environment variables, then redeploy.';
    } else if (isQuota) {
      userMsg = '⚠️ AI limit reached for now. Please try again in a moment.';
    } else if (isNet) {
      userMsg = '⚠️ Could not reach the AI. Check your internet connection and try again.';
    } else {
      userMsg = '⚠️ AI error: ' + errMsg + ' — Please try again.';
    }
    lEl.innerHTML = '<div class="ai-label">Nyansa AI Tutor</div><div class="ebox" style="font-size:13px;line-height:1.6;">' + userMsg + '</div>';
    console.error('[Nyansa Tutor Error]', errMsg, e);
  }

  document.getElementById('chat-send').disabled = false;
  win.scrollTop = win.scrollHeight;
}

// Format tutor reply — render bold, line breaks, section headers
function formatTutorReply(text) {
  return text
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/📘 EXPLANATION/g, '<div class="learn-section-head" style="color:var(--gold);font-weight:700;font-size:11px;text-transform:uppercase;letter-spacing:.5px;margin:10px 0 4px;">📘 Explanation</div>')
    .replace(/🇬🇭 GHANA EXAMPLE/g, '<div class="learn-section-head" style="color:#006b3f;font-weight:700;font-size:11px;text-transform:uppercase;letter-spacing:.5px;margin:10px 0 4px;">🇬🇭 Ghana Example</div>')
    .replace(/📝 EXAM ANGLE/g, '<div class="learn-section-head" style="color:#ce1126;font-weight:700;font-size:11px;text-transform:uppercase;letter-spacing:.5px;margin:10px 0 4px;">📝 Exam Angle</div>')
    .replace(/❓ CHECK-IN/g, '<div class="learn-section-head" style="color:var(--gold);font-weight:700;font-size:11px;text-transform:uppercase;letter-spacing:.5px;margin:10px 0 4px;">❓ Check-In Question</div>')
    .replace(/PART \d[—-]/g, m => '<div style="font-weight:700;color:var(--muted);font-size:11px;text-transform:uppercase;letter-spacing:.5px;margin:8px 0 3px;">' + m + '</div>')
    .replace(/⚠️/g, '<span style="color:#e67e00;">⚠️</span>')
    .replace(/\n\n/g, '</p><p style="margin-top:8px;">')
    .replace(/\n/g, '<br>');
}

// Add action buttons after a tutor response
function appendLessonActions(win, topic, reply, ageGroup) {
  // Remove old action rows
  win.querySelectorAll('.lesson-actions').forEach(el => el.remove());

  const row = document.createElement('div');
  row.className = 'lesson-actions';
  row.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;padding:6px 0 2px;';

  const actions = [
    { label: '🧪 Test Me', fn: () => triggerTestMe(topic, ageGroup) },
    { label: '🔍 Explain Simpler', fn: () => triggerSimpleExplain(topic, reply, ageGroup) },
    { label: '❓ Ask Me Questions', fn: () => triggerSocratic(topic, ageGroup) },
  ];
  if (ageGroup === 'shs') {
    actions.push({ label: '📝 WASSCE Style', fn: () => triggerWASSCEStyle(topic) });
  }

  actions.forEach(a => {
    const btn = document.createElement('button');
    btn.className = 'qa-btn';
    btn.style.cssText = 'font-size:11px;padding:5px 11px;border-radius:8px;';
    btn.textContent = a.label;
    btn.onclick = a.fn;
    row.appendChild(btn);
  });

  win.appendChild(row);
  win.scrollTop = win.scrollHeight;
}

// ── 5. TEST ME SYSTEM ─────────────────────────────────────────────────────
var _testMeActive = false;
var _testMeSession = { topic: '', questions: [], current: 0, correct: 0, ageGroup: 'shs' };

async function triggerTestMe(topic, ageGroup) {
  if (_testMeActive) return;
  _testMeActive = true;
  _testMeSession = { topic, questions: [], current: 0, correct: 0, ageGroup };

  const win = document.getElementById('chat-win');
  const intro = document.createElement('div');
  intro.className = 'msg-ai';
  intro.innerHTML = '<div class="ai-label">Test Me</div><div class="lr"><div class="sp"></div>Generating 3 questions (easy → medium → hard)...</div>';
  win.appendChild(intro);
  win.scrollTop = win.scrollHeight;

  const diffMap = {
    nursery: 'very simple for a 5-year-old child',
    primary: 'BECE-style for JHS students',
    shs: 'WASSCE-style for SHS students'
  };
  const diff = diffMap[ageGroup] || diffMap.shs;

  const prompt = `Generate exactly 3 questions on "${topic}" for a Ghanaian student.
Question 1: EASY (basic recall)
Question 2: MEDIUM (requires understanding)  
Question 3: HARD (${diff}, application/analysis)

Use Ghanaian context (GH₵, Accra, Kumasi, COCOBOD, etc.) where natural.
Return ONLY JSON:
{
  "questions": [
    {"level":"Easy","question":"...","type":"mcq","options":["A","B","C","D"],"answer":0,"explanation":"...","whyWrong":["why A wrong if not answer","why B wrong if not answer","why C wrong","why D wrong"]},
    {"level":"Medium","question":"...","type":"mcq","options":["A","B","C","D"],"answer":1,"explanation":"...","whyWrong":["...","...","...","..."]},
    {"level":"Hard","question":"...","type":"written","sampleAnswer":"...","keyPoints":["point1","point2","point3"],"marks":4}
  ]
}`;

  try {
    const raw = await ai(prompt, 1200, () => JSON.stringify({
      questions: [
        { level:'Easy', question:`What is a basic fact about ${topic}?`, type:'mcq', options:['Option A','Option B','Option C','Option D'], answer:0, explanation:'Option A is correct because it states the basic definition.', whyWrong:['Correct!','This is incorrect because it describes something different.','This confuses related concepts.','This is the opposite of correct.'] },
        { level:'Medium', question:`Explain how ${topic} works in practice.`, type:'mcq', options:['Option A','Option B','Option C','Option D'], answer:1, explanation:'Option B shows the correct process step by step.', whyWrong:['This skips an important step.','Correct!','This reverses the order.','This confuses cause and effect.'] },
        { level:'Hard', question:`A student in Accra needs to apply knowledge of ${topic}. Explain with workings.`, type:'written', sampleAnswer:`The student should first identify the key principle of ${topic}, then apply it systematically using the correct formula/method, showing all steps clearly.`, keyPoints:['Identifies the key concept','Shows correct method','Applies to the given scenario'] , marks:4 }
      ]
    }));
    const data = parseJSON(raw);
    _testMeSession.questions = data.questions;
    intro.remove();
    renderTestMeQuestion();
  } catch(e) {
    intro.innerHTML = '<div class="ai-label">Test Me</div><div class="ebox">Could not generate questions. Try again.</div>';
    _testMeActive = false;
  }
}

function renderTestMeQuestion() {
  const win = document.getElementById('chat-win');
  const q = _testMeSession.questions[_testMeSession.current];
  if (!q) { showTestMeResult(); return; }

  const levelColors = { Easy:'#006b3f', Medium:'#d4960a', Hard:'#ce1126' };
  const col = levelColors[q.level] || '#d4960a';

  const card = document.createElement('div');
  card.className = 'msg-ai test-me-card';
  card.style.maxWidth = '100%';

  if (q.type === 'mcq') {
    const opts = q.options.map((o, i) =>
      `<button type="button" class="opt" style="margin-bottom:6px;" onclick="answerTestMe(${i})">${String.fromCharCode(65+i)}. ${esc(o)}</button>`
    ).join('');
    card.innerHTML = `
      <div class="ai-label">Test Me — Question ${_testMeSession.current+1} of ${_testMeSession.questions.length}</div>
      <div style="display:inline-flex;align-items:center;gap:6px;margin-bottom:10px;">
        <span style="background:${col}18;color:${col};border:1px solid ${col}40;border-radius:99px;padding:2px 10px;font-size:11px;font-weight:700;">${q.level}</span>
        <span style="font-size:11px;color:var(--muted);">Question ${_testMeSession.current+1}/${_testMeSession.questions.length}</span>
      </div>
      <div style="font-family:var(--fh);font-weight:700;font-size:.95rem;line-height:1.5;margin-bottom:12px;">${esc(q.question)}</div>
      <div id="testme-opts">${opts}</div>
      <div id="testme-feedback"></div>`;
  } else {
    card.innerHTML = `
      <div class="ai-label">Test Me — Question ${_testMeSession.current+1} of ${_testMeSession.questions.length}</div>
      <div style="display:inline-flex;align-items:center;gap:6px;margin-bottom:10px;">
        <span style="background:${col}18;color:${col};border:1px solid ${col}40;border-radius:99px;padding:2px 10px;font-size:11px;font-weight:700;">${q.level} · ${q.marks} marks</span>
      </div>
      <div style="font-family:var(--fh);font-weight:700;font-size:.95rem;line-height:1.5;margin-bottom:12px;">${esc(q.question)}</div>
      <textarea id="testme-written" placeholder="Write your answer here — show all working..." style="min-height:90px;margin-bottom:8px;"></textarea>
      <button type="button" class="btn bp bsm" onclick="submitTestMeWritten()">Submit Answer</button>
      <div id="testme-feedback" style="margin-top:8px;"></div>`;
  }

  win.appendChild(card);
  win.scrollTop = win.scrollHeight;
}

function answerTestMe(chosen) {
  const q = _testMeSession.questions[_testMeSession.current];
  const opts = document.querySelectorAll('.test-me-card:last-child .opt');
  opts.forEach(b => b.disabled = true);

  const correct = chosen === q.answer;
  opts[chosen].classList.add(correct ? 'correct' : 'wrong');
  if (!correct) opts[q.answer].classList.add('correct');
  if (correct) _testMeSession.correct++;

  const fb = document.querySelector('.test-me-card:last-child #testme-feedback');
  if (correct) {
    fb.innerHTML = `<div class="fbox"><strong>✅ Correct!</strong><br>${esc(q.explanation)}</div>`;
  } else {
    fb.innerHTML = `<div class="ebox"><strong>❌ Not quite.</strong> The correct answer is <strong>${String.fromCharCode(65+q.answer)}</strong>.<br><br>
      <strong>Why that was wrong:</strong> ${esc(q.whyWrong[chosen] || 'Review your notes on this topic.')}<br><br>
      <strong>Why the correct answer:</strong> ${esc(q.explanation)}</div>`;
  }

  // Next button
  const nextBtn = document.createElement('button');
  nextBtn.type = 'button';
  nextBtn.className = 'btn bp bsm';
  nextBtn.style.cssText = 'margin-top:10px;width:100%;';
  nextBtn.textContent = _testMeSession.current < _testMeSession.questions.length - 1 ? 'Next Question →' : 'See Results 🏁';
  nextBtn.onclick = () => {
    _testMeSession.current++;
    nextBtn.remove();
    if (_testMeSession.current < _testMeSession.questions.length) {
      renderTestMeQuestion();
    } else {
      showTestMeResult();
    }
  };
  fb.appendChild(nextBtn);
  document.getElementById('chat-win').scrollTop = 99999;
}

async function submitTestMeWritten() {
  const q = _testMeSession.questions[_testMeSession.current];
  const ans = (document.getElementById('testme-written').value || '').trim();
  if (!ans) return;
  document.querySelector('.test-me-card:last-child button').disabled = true;
  const fb = document.querySelector('.test-me-card:last-child #testme-feedback');
  fb.innerHTML = '<div class="lr"><div class="sp"></div>Marking your answer...</div>';

  const prompt = `You are a WASSCE/BECE marker. Mark this student answer.
Question: "${q.question}"
Key points expected: ${q.keyPoints.join(', ')}
Sample answer: "${q.sampleAnswer}"
Student answer: "${ans.slice(0,800)}"
Total marks: ${q.marks}

Return ONLY JSON: {"marksAwarded":${q.marks},"feedback":"2 sentences explaining what was good and what was missing","pointsHit":["point hit 1"],"pointsMissed":["missed point 1"],"teachBack":"1 sentence re-explaining the core concept simply"}`;

  try {
    const raw = await ai(prompt, 500, () => JSON.stringify({
      marksAwarded: ans.length > 60 ? Math.ceil(q.marks*0.7) : Math.ceil(q.marks*0.4),
      feedback: ans.length > 60 ? 'Good attempt. You covered some key points but missed others.' : 'Your answer needs more detail.',
      pointsHit: ans.length > 60 ? [q.keyPoints[0]] : [],
      pointsMissed: q.keyPoints.slice(1),
      teachBack: `Remember: ${q.sampleAnswer.slice(0,100)}`
    }));
    const r = parseJSON(raw);
    const pct = Math.round(r.marksAwarded / q.marks * 100);
    const col = pct >= 70 ? '#006b3f' : pct >= 50 ? '#d4960a' : '#ce1126';
    if (r.marksAwarded >= Math.ceil(q.marks*0.6)) _testMeSession.correct++;

    fb.innerHTML = `<div class="fbox" style="border-left-color:${col};">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
        <span style="font-family:var(--fh);font-size:1rem;font-weight:800;color:${col};">${r.marksAwarded}/${q.marks}</span>
        <span style="font-size:12px;color:var(--muted);">${pct}%</span>
      </div>
      <p style="margin-bottom:8px;">${esc(r.feedback)}</p>
      ${r.pointsHit.length ? '<div style="font-size:12px;font-weight:700;color:#006b3f;margin-bottom:3px;">✓ Points credited:</div>' + r.pointsHit.map(p=>`<div style="font-size:12px;color:var(--muted);">• ${esc(p)}</div>`).join('') : ''}
      ${r.pointsMissed.length ? '<div style="font-size:12px;font-weight:700;color:#ce1126;margin:6px 0 3px;">✗ Points missed:</div>' + r.pointsMissed.map(p=>`<div style="font-size:12px;color:var(--muted);">• ${esc(p)}</div>`).join('') : ''}
      <div style="background:rgba(212,150,10,.07);border-radius:8px;padding:8px 10px;margin-top:10px;font-size:13px;line-height:1.6;">
        <strong style="color:var(--gold);">📚 Remember:</strong> ${esc(r.teachBack)}
      </div>
    </div>`;

    const nextBtn = document.createElement('button');
    nextBtn.type = 'button'; nextBtn.className = 'btn bp bsm';
    nextBtn.style.cssText = 'margin-top:8px;width:100%;';
    nextBtn.textContent = _testMeSession.current < _testMeSession.questions.length - 1 ? 'Next Question →' : 'See Results 🏁';
    nextBtn.onclick = () => {
      _testMeSession.current++;
      nextBtn.remove();
      if (_testMeSession.current < _testMeSession.questions.length) renderTestMeQuestion();
      else showTestMeResult();
    };
    fb.appendChild(nextBtn);
  } catch(e) {
    fb.innerHTML = '<div class="ebox">Could not mark. Try again.</div>';
  }
  document.getElementById('chat-win').scrollTop = 99999;
}

function showTestMeResult() {
  _testMeActive = false;
  const win = document.getElementById('chat-win');
  const total = _testMeSession.questions.length;
  const correct = _testMeSession.correct;
  const pct = Math.round(correct / total * 100);
  const col = pct >= 70 ? '#006b3f' : pct >= 50 ? '#d4960a' : '#ce1126';
  const msg = pct >= 70 ? '🌟 Great work! You understand this topic well.' 
    : pct >= 50 ? '👍 Good effort! Review the questions you missed.' 
    : '📚 Keep practising! Go back and re-read the explanation above.';

  const card = document.createElement('div');
  card.className = 'msg-ai';
  card.style.maxWidth = '100%';
  card.innerHTML = `
    <div class="ai-label">Test Results 🏁</div>
    <div style="text-align:center;padding:1rem 0;">
      <div style="font-family:var(--fh);font-size:2.5rem;font-weight:800;color:${col};">${correct}/${total}</div>
      <div style="font-size:13px;color:var(--muted);margin-bottom:12px;">${pct}% — ${pct>=70?'Mastered':'Needs more practice'}</div>
      <div style="font-size:13.5px;line-height:1.6;">${msg}</div>
    </div>
    <div style="display:flex;gap:8px;margin-top:10px;">
      <button type="button" class="btn bp bsm" style="flex:1;" onclick="triggerTestMe('${esc(_testMeSession.topic)}','${_testMeSession.ageGroup}')">Retry 🔄</button>
      <button type="button" class="btn bs bsm" style="flex:1;" onclick="window.location.hash='';triggerSimpleExplain('${esc(_testMeSession.topic)}','','${_testMeSession.ageGroup}')">Re-explain 📚</button>
    </div>`;
  win.appendChild(card);

  // Update mastery for this topic
  updateTopicMastery(_testMeSession.topic, pct);

  // XP reward
  const xpGain = correct * 15;
  state.xp += xpGain;
  updateHomeStats();
  if (xpGain > 0) toast(`Test complete! +${xpGain} XP`, '🧪', 'gold', 3000);

  win.scrollTop = win.scrollHeight;
}

// ── 6. EXPLAIN SIMPLY (Socratic + Simplifier) ────────────────────────────
function buildSimplePrompt(topic, lang, ageGroup) {
  return `Re-explain "${topic}" using the SIMPLEST possible words and a relatable Ghanaian analogy.

Rules:
- No jargon. If you must use a technical word, immediately explain it in brackets.
- Use ONE analogy from daily Ghanaian life: trotro fare, Makola market, cooking fufu, a cocoa farmer, a school in Accra, buying kelewele, etc.
- For ages 4-9: use a story format ("Imagine you are at the market...")
- For ages 10-14: use a simple diagram described in words, with numbered steps
- For ages 15-18: use a clear analogy THEN connect it back to the exam terminology
- End with: "Does this analogy help? What part would you like me to explain differently?"
Age group: ${ageGroup}${lang !== 'English' ? `\nReply in ${lang}.` : ''}`;
}

function buildSocraticPrompt(topic, lang, ageGroup) {
  const socratic = {
    nursery: `Guide the child to discover the answer about "${topic}" through simple questions.
- Ask ONE very simple question at a time
- Relate to things they see every day (sun, food, animals, school)
- Celebrate every attempt: "Good thinking! 🌟 Now tell me..."
- Never give the answer directly — always ask another guiding question`,

    primary: `Use Socratic questioning to guide the JHS student to understand "${topic}".
- Ask ONE question at a time  
- Start with what they already know
- Build up to the answer through logical steps
- Use Ghanaian examples in your questions (market prices, trotro journeys, etc.)
- If they get stuck, give a small hint rather than the answer
- Target: student arrives at the correct understanding themselves`,

    shs: `Use Socratic method to guide this SHS student through "${topic}" for WASSCE preparation.
- Start by activating prior knowledge: "What do you already know about...?"
- Ask analytical questions that build toward exam-level understanding
- Challenge their answers: "That's interesting — but what would happen if...?"
- Target WASSCE command words: analyse, evaluate, assess, explain, discuss
- Student should be able to write a full exam answer by the end of the dialogue`,
  };
  return (socratic[ageGroup] || socratic.shs) + (lang !== 'English' ? `\nReply in ${lang}.` : '');
}

function triggerSimpleExplain(topic, prevReply, ageGroup) {
  _learnMode = 'simple';
  const inputEl = document.getElementById('chat-input');
  if (inputEl) {
    inputEl.value = `Explain ${topic} in the simplest way possible`;
    sendChat();
  }
  setTimeout(() => { _learnMode = 'teach'; }, 100);
}

function triggerSocratic(topic, ageGroup) {
  _learnMode = 'socratic';
  const win = document.getElementById('chat-win');
  const notice = document.createElement('div');
  notice.className = 'msg-ai';
  notice.style.cssText = 'background:rgba(0,107,63,.06);border:1px solid rgba(0,107,63,.2);';
  notice.innerHTML = `<div class="ai-label" style="color:#006b3f;">Socratic Mode 🧠</div>
    <div style="font-size:13px;line-height:1.6;">Instead of giving you the answer, I will guide you with questions. You will discover the answer yourself — this is how great thinkers learn!<br><br>
    <em style="color:var(--muted);">Topic: ${esc(topic)}</em></div>`;
  win.appendChild(notice);
  win.scrollTop = win.scrollHeight;

  const inputEl = document.getElementById('chat-input');
  if (inputEl) {
    inputEl.value = topic;
    sendChat();
  }
  setTimeout(() => { _learnMode = 'teach'; }, 200);
}

function triggerWASSCEStyle(topic) {
  const inputEl = document.getElementById('chat-input');
  if (inputEl) {
    inputEl.value = `Explain ${topic} in WASSCE exam style with marking scheme`;
    sendChat();
  }
}

// ── 7. UPGRADED QUIZ FEEDBACK ─────────────────────────────────────────────
// Patch recordAnswer to give rich explanatory feedback
var _origRecordAnswerLE = typeof recordAnswer !== 'undefined' ? recordAnswer : null;

function buildRichFeedback(correct, q, ageGroup) {
  if (!q) return '';
  const answer = q.options ? q.options[q.answer] : (q.sampleAnswer || '');

  if (correct) {
    const praises = {
      nursery: ['⭐ Wooow! You are so smart!', '🌟 Yes! That is correct! Keep going!', '🎉 Medaase! Well done!'],
      primary: ['✅ Correct! Well done.', '✅ That\'s right! Good thinking.', '✅ Excellent! You\'ve got it.'],
      shs: ['✅ Correct.', '✅ Well answered.', '✅ Right — solid understanding.']
    };
    const list = praises[ageGroup] || praises.shs;
    const praise = list[Math.floor(Math.random() * list.length)];
    const xpGain = (q.hintUsed ? 5 : 10) * (q.difficulty === 'advanced' ? 3 : q.difficulty === 'intermediate' ? 2 : 1);
    return `<div class="fbox"><strong>${praise}</strong> +${xpGain} XP<br><span style="opacity:.75;font-size:12px;">${esc(q.explanation || '')}</span></div>`;
  } else {
    // Wrong — always explain WHY and teach again
    const intros = {
      nursery: ['Hmm, not quite! 😊 Let\'s try again.', 'Oh! That\'s not it — but don\'t worry! 🌟'],
      primary: ['Not quite. Here\'s what to remember:', 'That\'s a common mix-up. Let\'s clear it up:'],
      shs: ['Incorrect. Here\'s the explanation:', 'Not right — a common error. Let\'s break it down:']
    };
    const list = intros[ageGroup] || intros.shs;
    const intro = list[Math.floor(Math.random() * list.length)];
    return `<div class="ebox">
      <strong>${intro}</strong>
      <br><br>
      <span style="font-size:12px;">✅ <strong>Correct answer:</strong> ${esc(answer)}</span>
      ${q.explanation ? `<br><span style="font-size:12px;opacity:.85;margin-top:4px;display:block;">📖 <strong>Why:</strong> ${esc(q.explanation)}</span>` : ''}
      ${q.hint ? `<br><span style="font-size:12px;opacity:.75;display:block;">💡 <strong>Remember:</strong> ${esc(q.hint)}</span>` : ''}
    </div>`;
  }
}

// ── 8. PROGRESS TRACKING ─────────────────────────────────────────────────
var _learnData = {};
try { _learnData = JSON.parse(localStorage.getItem('em_learndata') || '{}'); } catch(e) {}

function saveLearnData() {
  try { localStorage.setItem('em_learndata', JSON.stringify(_learnData)); } catch(e) {}
}

function trackTopicStudied(topic, lang, ageGroup) {
  if (!_learnData.topics) _learnData.topics = {};
  const key = topic.slice(0, 40).toLowerCase().replace(/[^a-z0-9]/g, '_');
  if (!_learnData.topics[key]) _learnData.topics[key] = { topic, count: 0, mastery: 0, lastStudied: null };
  _learnData.topics[key].count++;
  _learnData.topics[key].lastStudied = Date.now();
  if (!_learnData.weekSessions) _learnData.weekSessions = [];
  _learnData.weekSessions.push({ date: Date.now(), topic, ageGroup });
  if (_learnData.weekSessions.length > 200) _learnData.weekSessions = _learnData.weekSessions.slice(-200);
  saveLearnData();
}

function updateTopicMastery(topic, pct) {
  if (!_learnData.topics) _learnData.topics = {};
  const key = topic.slice(0, 40).toLowerCase().replace(/[^a-z0-9]/g, '_');
  if (!_learnData.topics[key]) _learnData.topics[key] = { topic, count: 0, mastery: 0, lastStudied: null };
  // Weighted average: new mastery = 60% old + 40% new score
  const prev = _learnData.topics[key].mastery || 0;
  _learnData.topics[key].mastery = Math.round(prev * 0.6 + pct * 0.4);
  saveLearnData();
}

// ── 9. WEEKLY SUMMARY PAGE ────────────────────────────────────────────────
// Render rich progress on history page — inject under subject breakdown
function renderWeeklySummary() {
  const container = document.getElementById('hist-breakdown');
  if (!container) return;

  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const sessions = (_learnData.weekSessions || []).filter(s => s.date > weekAgo);
  const topics = _learnData.topics || {};

  // Subject quiz stats (already in state)
  const subjectEntries = Object.entries(state.subjectStats);

  // Mastery levels from test sessions
  const masteredTopics = Object.values(topics).filter(t => t.mastery >= 70);
  const weakTopics = Object.values(topics).filter(t => t.mastery > 0 && t.mastery < 50);

  // Days active this week
  const daysActive = new Set(sessions.map(s => new Date(s.date).toDateString())).size;

  let html = '';

  // ── Weekly summary card ──
  html += `<div style="background:linear-gradient(135deg,#1a0d00,#2a1500);border-radius:16px;padding:1.2rem;margin-bottom:1rem;position:relative;overflow:hidden;">
    <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 80% 30%,rgba(255,210,0,.12),transparent 60%);pointer-events:none;"></div>
    <div style="font-family:var(--fh);font-size:.85rem;font-weight:800;color:#ffd200;margin-bottom:.8rem;position:relative;">📅 This Week</div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;position:relative;">
      <div style="text-align:center;"><div style="font-family:var(--fh);font-size:1.4rem;font-weight:800;color:#ffd200;">${daysActive}</div><div style="font-size:10px;color:rgba(255,255,255,.5);text-transform:uppercase;">Days Active</div></div>
      <div style="text-align:center;"><div style="font-family:var(--fh);font-size:1.4rem;font-weight:800;color:#ffd200;">${sessions.length}</div><div style="font-size:10px;color:rgba(255,255,255,.5);text-transform:uppercase;">Sessions</div></div>
      <div style="text-align:center;"><div style="font-family:var(--fh);font-size:1.4rem;font-weight:800;color:#ffd200;">${masteredTopics.length}</div><div style="font-size:10px;color:rgba(255,255,255,.5);text-transform:uppercase;">Topics Mastered</div></div>
    </div>
  </div>`;

  // ── Subject mastery bars ──
  if (subjectEntries.length) {
    html += `<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--muted);margin-bottom:.8rem;">Subject Mastery</div>`;
    const sorted = subjectEntries.map(([sub, s]) => ({
      sub, pct: Math.round(s.correct / s.total * 100), correct: s.correct, total: s.total
    })).sort((a, b) => b.pct - a.pct);

    sorted.forEach(s => {
      const col = s.pct >= 75 ? '#006b3f' : s.pct >= 50 ? '#d4960a' : '#ce1126';
      const label = s.pct >= 75 ? '🟢 Strong' : s.pct >= 50 ? '🟡 Developing' : '🔴 Needs Work';
      html += `<div style="margin-bottom:12px;">
        <div style="display:flex;justify-content:space-between;align-items:center;font-size:13px;margin-bottom:5px;">
          <span style="font-weight:600;text-transform:capitalize;">${s.sub}</span>
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="font-size:11px;color:var(--muted);">${s.correct}/${s.total}</span>
            <span style="font-size:11px;font-weight:700;color:${col};">${s.pct}%</span>
            <span style="font-size:10px;color:var(--muted);">${label}</span>
          </div>
        </div>
        <div style="height:8px;background:var(--bg3);border-radius:99px;overflow:hidden;">
          <div style="height:8px;border-radius:99px;background:${col};width:${s.pct}%;transition:width 1s ease;"></div>
        </div>
      </div>`;
    });
  }

  // ── AI Insight ──
  const overall = state.total ? Math.round(state.correct / state.total * 100) : 0;
  const subjectEntryList = subjectEntries.map(([s, v]) => `${s}: ${Math.round(v.correct/v.total*100)}%`).join(', ');
  const topSubject = subjectEntries.length ? subjectEntries.sort((a,b) => b[1].correct/b[1].total - a[1].correct/a[1].total)[0][0] : '';
  const weakSubject = subjectEntries.length ? subjectEntries.sort((a,b) => a[1].correct/a[1].total - b[1].correct/b[1].total)[0][0] : '';

  if (subjectEntries.length >= 2) {
    html += `<div style="background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:1rem;margin-top:.5rem;">
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--muted);margin-bottom:.6rem;">🧠 AI Insight</div>
      <div style="font-size:13.5px;line-height:1.7;color:var(--text);">
        ${overall >= 70 ? `You are performing well overall at <strong>${overall}%</strong> accuracy.` : `Your overall accuracy is <strong>${overall}%</strong> — you can improve with daily practice.`}
        ${topSubject ? ` Your strongest subject is <strong style="text-transform:capitalize;">${topSubject}</strong>.` : ''}
        ${weakSubject && weakSubject !== topSubject ? ` Focus more on <strong style="text-transform:capitalize;">${weakSubject}</strong> — it needs work.` : ''}
        ${daysActive >= 5 ? ' 🔥 Excellent consistency this week!' : daysActive >= 3 ? ' Try to study every day for best results.' : ' Aim for at least 5 days of practice each week.'}
      </div>
      <button type="button" class="btn bs bsm" style="margin-top:10px;width:100%;" onclick="openTutorWithFocus('${weakSubject}')">📚 Improve ${weakSubject || 'Weak Subject'} Now</button>
    </div>`;
  }

  if (html) container.innerHTML = html;
}

function openTutorWithFocus(subject) {
  goPage('tutor');
  setTimeout(() => {
    const el = document.getElementById('chat-input');
    if (el) {
      el.value = `Teach me ${subject} step by step`;
      sendChat();
    }
  }, 400);
}

// ── 10. TUTOR PAGE UPGRADE ────────────────────────────────────────────────
// Inject mode switcher + age selector into the tutor page
(function upgradeTutorPage() {
  setTimeout(() => {
    const tutorWrap = document.querySelector('#pg-tutor .wrap');
    if (!tutorWrap || document.getElementById('tutor-mode-bar')) return;

    // Age group selector (inject at top of page body)
    const ageBar = document.createElement('div');
    ageBar.id = 'tutor-age-bar';
    ageBar.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:10px;flex-wrap:wrap;';
    ageBar.innerHTML = `
      <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--muted);">Age Group:</span>
      <div style="display:flex;gap:4px;">
        <button type="button" class="tutor-age-btn" data-age="5" onclick="setTutorAge(5,this)" style="padding:4px 10px;border-radius:8px;font-size:11px;font-weight:600;border:1.5px solid var(--border2);background:var(--bg2);cursor:pointer;color:var(--muted);">4–9</button>
        <button type="button" class="tutor-age-btn" data-age="12" onclick="setTutorAge(12,this)" style="padding:4px 10px;border-radius:8px;font-size:11px;font-weight:600;border:1.5px solid var(--border2);background:var(--bg2);cursor:pointer;color:var(--muted);">10–14</button>
        <button type="button" class="tutor-age-btn active" data-age="16" onclick="setTutorAge(16,this)" style="padding:4px 10px;border-radius:8px;font-size:11px;font-weight:600;border:1.5px solid var(--gold);background:rgba(212,150,10,.1);cursor:pointer;color:var(--gold);">15–18 SHS</button>
      </div>`;
    tutorWrap.insertBefore(ageBar, tutorWrap.firstChild);

    // Mode switcher bar
    const modeBar = document.createElement('div');
    modeBar.id = 'tutor-mode-bar';
    modeBar.style.cssText = 'display:flex;gap:4px;margin-bottom:10px;background:var(--bg3);border-radius:12px;padding:3px;';
    modeBar.innerHTML = `
      <button type="button" class="tutor-mode-btn active" data-mode="teach" onclick="setTutorMode('teach',this)" style="flex:1;padding:7px 4px;border-radius:9px;font-size:11px;font-weight:700;border:none;cursor:pointer;background:var(--card);color:var(--text);box-shadow:0 1px 4px rgba(0,0,0,.08);">📘 Teach Me</button>
      <button type="button" class="tutor-mode-btn" data-mode="socratic" onclick="setTutorMode('socratic',this)" style="flex:1;padding:7px 4px;border-radius:9px;font-size:11px;font-weight:700;border:none;cursor:pointer;background:transparent;color:var(--muted);">🧠 Ask Me</button>
      <button type="button" class="tutor-mode-btn" data-mode="simple" onclick="setTutorMode('simple',this)" style="flex:1;padding:7px 4px;border-radius:9px;font-size:11px;font-weight:700;border:none;cursor:pointer;background:transparent;color:var(--muted);">🔍 Simplify</button>
      <button type="button" class="tutor-mode-btn" data-mode="testme" onclick="setTutorMode('testme',this)" style="flex:1;padding:7px 4px;border-radius:9px;font-size:11px;font-weight:700;border:none;cursor:pointer;background:transparent;color:var(--muted);">🧪 Test Me</button>`;

    const chatWin = document.getElementById('chat-win');
    tutorWrap.insertBefore(modeBar, chatWin);

    // Mode description
    const modeDesc = document.createElement('div');
    modeDesc.id = 'tutor-mode-desc';
    modeDesc.style.cssText = 'font-size:11.5px;color:var(--muted);margin-bottom:8px;line-height:1.5;padding:0 2px;';
    modeDesc.textContent = '📘 Teach Me: I explain clearly with Ghana examples + a check-in question after each lesson.';
    tutorWrap.insertBefore(modeDesc, chatWin);

    // Update quick action buttons with better prompts
    updateTutorQuickActions();
  }, 300);
})();

function setTutorMode(mode, btn) {
  _learnMode = mode;
  document.querySelectorAll('.tutor-mode-btn').forEach(b => {
    b.style.background = 'transparent';
    b.style.color = 'var(--muted)';
    b.style.boxShadow = 'none';
  });
  btn.style.background = 'var(--card)';
  btn.style.color = 'var(--text)';
  btn.style.boxShadow = '0 1px 4px rgba(0,0,0,.08)';

  const descs = {
    teach: '📘 Teach Me: I explain clearly with Ghana examples + a check-in question after each lesson.',
    socratic: '🧠 Ask Me: I guide you with questions instead of giving answers — you discover it yourself.',
    simple: '🔍 Simplify: I rewrite any explanation using simple words and a market/daily life analogy.',
    testme: '🧪 Test Me: Type any topic and I will auto-generate 3 questions (easy → hard) and mark them.',
  };
  const desc = document.getElementById('tutor-mode-desc');
  if (desc) desc.textContent = descs[mode] || '';

  if (mode === 'testme') {
    const el = document.getElementById('chat-input');
    if (el) el.placeholder = 'Type any topic to test yourself e.g. "photosynthesis" or "quadratic equations"';
  } else {
    const el = document.getElementById('chat-input');
    if (el) el.placeholder = 'Ask me anything — e.g. "Explain supply and demand"';
  }
}

function setTutorAge(age, btn) {
  saveLearnerAge(age);
  document.querySelectorAll('.tutor-age-btn').forEach(b => {
    b.style.borderColor = 'var(--border2)';
    b.style.background = 'var(--bg2)';
    b.style.color = 'var(--muted)';
  });
  btn.style.borderColor = 'var(--gold)';
  btn.style.background = 'rgba(212,150,10,.1)';
  btn.style.color = 'var(--gold)';
  
  const group = getLearnerTone(age);
  const labels = { nursery: 'Ages 4-9 — Fun & simple mode', primary: 'Ages 10-14 — Step-by-step BECE mode', shs: 'Ages 15-18 — WASSCE exam mode' };
  toast(labels[group] || 'Learning mode set', '🎓', 'gold', 2500);
}

function updateTutorQuickActions() {
  const qaRow = document.querySelector('#pg-tutor .qa-row');
  if (!qaRow) return;
  const ageGroup = getAgeGroup();
  
  const actions = {
    nursery: [
      { label:'🌱 What is a plant?', q:'Explain what a plant is in simple words' },
      { label:'🔢 Add numbers', q:'Teach me how to add numbers' },
      { label:'🇬🇭 Ghana colours', q:'What are the colours of the Ghana flag?' },
      { label:'🐘 Big animals', q:'Tell me about big animals in Africa' },
    ],
    primary: [
      { label:'📐 Quadratics', q:'Explain quadratic equations step by step' },
      { label:'🌱 Photosynthesis', q:'Explain photosynthesis simply with a Ghanaian example' },
      { label:'🇬🇭 Ghana independence', q:'Explain how Ghana gained independence' },
      { label:'📈 Supply & demand', q:'Explain supply and demand using a market example' },
      { label:'🧬 Mitosis vs Meiosis', q:'What is the difference between mitosis and meiosis?' },
    ],
    shs: [
      { label:'📐 Quadratics', q:'Explain quadratic equations for WASSCE' },
      { label:'📈 Inflation', q:'Explain inflation with Ghanaian examples for WASSCE' },
      { label:'🇬🇭 1966 Ghana coup', q:'Explain the causes of the 1966 coup in Ghana — WASSCE style' },
      { label:'🔬 Osmosis', q:'Explain osmosis for WASSCE with marking scheme' },
      { label:'⚖️ Democracy', q:'Explain Ghana\'s democracy and the 1992 Constitution' },
      { label:'💰 Opportunity cost', q:'Explain opportunity cost with a Ghanaian market example' },
    ],
  };

  const list = actions[ageGroup] || actions.shs;
  qaRow.innerHTML = list.map(a => 
    `<button class="qa-btn" onclick="quickAsk('${a.q.replace(/'/g,"&#39;")}')">${a.label}</button>`
  ).join('') + `<button class="qa-btn" style="background:rgba(0,107,63,.07);border-color:rgba(0,107,63,.2);color:#006b3f;" onclick="quickAsk('Explain this in Twi')">🇬🇭 In Twi</button>`;
}

// ── 11. PATCH sendChat to use testme mode correctly ───────────────────────
var _origSendChatQA = window.quickAsk;
window.quickAsk = function(q) {
  const inputEl = document.getElementById('chat-input');
  if (!inputEl) return;
  if (_learnMode === 'testme') {
    triggerTestMe(q, getAgeGroup());
    return;
  }
  inputEl.value = q;
  sendChat();
};

// ── 12. PATCH history page to show weekly summary ─────────────────────────
var _origGoPageLE = window.goPage;
window.goPage = function(name) {
  _origGoPageLE(name);
  if (name === 'history') {
    setTimeout(renderWeeklySummary, 200);
  }
};

// ── 13. FALLBACK RESPONSES (Ghana-localised) ─────────────────────────────
function getFallbackReply(msg, ageGroup) {
  const fallbacks = {
    nursery: `That is a great question! 🌟\n\nLet me explain in a simple way:\n\nImagine you are at the market in Accra with your mummy. You can see many colourful things. That is how we learn — by looking carefully!\n\n❓ Can you tell me one thing you see at the market?`,
    primary: `Good question! Let me break this down for you step by step.\n\n**PART 1 — Simple explanation:**\nThis topic relates to things we see every day in Ghana. Let me connect it to something familiar.\n\n**PART 2 — Ghana example:**\nThink about how traders in Makola Market count change in Ghana cedis. The same idea applies here.\n\n**PART 3 — Check-in:**\nCan you try to explain this topic back to me in your own words?`,
    shs: `📘 **EXPLANATION:**\nThis is an important topic that comes up regularly in WASSCE examinations. Let me provide a clear, structured explanation.\n\n🇬🇭 **GHANA EXAMPLE:**\nTo put this in context — consider how this applies in Ghana's economy/society. The Bank of Ghana, COCOBOD, and the 1992 Constitution are all useful reference points depending on the subject.\n\n📝 **EXAM ANGLE:**\nIn WASSCE, questions on this topic typically ask you to "explain," "analyse," or "assess." Always define key terms first, then develop your argument with examples.\n\n❓ **CHECK-IN:**\nNow try this: write a 2-sentence answer as if you are in the exam hall. What would you write?`
  };
  return fallbacks[ageGroup] || fallbacks.shs;
}

// ── 14. QUIZ FEEDBACK PATCH ───────────────────────────────────────────────
// Hook into the existing recordAnswer to inject richer feedback
(function patchQuizFeedback() {
  const waitForRecordAnswer = setInterval(() => {
    if (typeof recordAnswer === 'function' && !recordAnswer._lePatched) {
      const orig = recordAnswer;
      recordAnswer = function(correct, q, customFb) {
        orig(correct, q, customFb);
        // After the original runs, inject richer feedback
        if (!customFb && q) {
          setTimeout(() => {
            const fbEl = document.getElementById('q-feedback');
            if (fbEl && !fbEl.dataset.leEnhanced) {
              fbEl.dataset.leEnhanced = '1';
              const ageGroup = getAgeGroup();
              // Only upgrade if the feedback isn't already rich
              const rich = buildRichFeedback(correct, q, ageGroup);
              if (rich) fbEl.innerHTML = rich;
            }
          }, 50);
        }
      };
      recordAnswer._lePatched = true;
      clearInterval(waitForRecordAnswer);
    }
  }, 500);
})();

console.log('%cNyansa Learning Engine v1 loaded 🇬🇭', 'color:#006b3f;font-weight:700;');

// ── UI POLISH: Ripple effect on buttons ──────────────────────────────────
document.addEventListener('click', function(e) {
  var btn = e.target.closest('.btn, .fcard, .bni, .opt');
  if (!btn) return;
  var r = document.createElement('span');
  var rect = btn.getBoundingClientRect();
  var size = Math.max(rect.width, rect.height);
  r.style.cssText = 'position:absolute;width:'+size+'px;height:'+size+'px;border-radius:50%;background:rgba(255,255,255,.18);transform:scale(0);animation:ripple .5s ease;left:'+(e.clientX-rect.left-size/2)+'px;top:'+(e.clientY-rect.top-size/2)+'px;pointer-events:none;z-index:10;';
  if(getComputedStyle(btn).position === 'static') btn.style.position = 'relative';
  btn.style.overflow = 'hidden';
  btn.appendChild(r);
  r.addEventListener('animationend', function(){r.remove();});
  // Haptic
  if(navigator.vibrate) navigator.vibrate(8);
});
var rs = document.createElement('style');
rs.textContent = '@keyframes ripple{to{transform:scale(2.5);opacity:0;}}';
document.head.appendChild(rs);

// ── XP Number counter animation ──────────────────────────────────────────
function animateNum(el, to) {
  var from = parseInt(el.textContent) || 0;
  if (from === to || isNaN(to)) { el.textContent = to; return; }
  var diff = to - from, step = diff / 20, cur = from, iv;
  iv = setInterval(function() {
    cur += step;
    if ((step > 0 && cur >= to) || (step < 0 && cur <= to)) { cur = to; clearInterval(iv); }
    el.textContent = typeof to === 'number' && Number.isInteger(to) ? Math.round(cur) : to;
  }, 25);
}

// Patch updateHomeStats to animate numbers
var _origUpdateHomeStats = updateHomeStats;
updateHomeStats = function() {
  _origUpdateHomeStats();
  ['h-xp','h-qs','h-str'].forEach(function(id){
    var el = document.getElementById(id);
    if (el && !isNaN(parseInt(el.textContent))) {
      // already updated by original, just re-animate
    }
  });
};

// ── Patch recordAnswer for XP animation ─────────────────────────────────
var _origRecordAnswer = recordAnswer;
recordAnswer = function(correct, q, customFb) {
  var prevXP = state.xp;
  _origRecordAnswer(correct, q, customFb);
  var xpEl = document.getElementById('q-xp');
  var hxpEl = document.getElementById('h-xp');
  if (xpEl) animateNum(xpEl, state.xp);
  if (hxpEl) animateNum(hxpEl, state.xp);
};

// ── Pull-to-refresh prevention (no accidental reload on mobile) ──────────
document.body.addEventListener('touchstart', function(e){}, {passive:true});

// ── Keyboard shortcut: Enter to send chat ───────────────────────────────
// (already handled inline but ensure it works)

// ── Auto-scroll quiz area after answering ───────────────────────────────
var _origAnswerMCQ = answerMCQ;
answerMCQ = function(idx) {
  _origAnswerMCQ(idx);
  setTimeout(function() {
    var fb = document.getElementById('q-feedback');
    if (fb && fb.innerHTML) fb.scrollIntoView({behavior:'smooth', block:'nearest'});
  }, 300);
};

// ── Better goPage — update active bni consistently ──────────────────────
var _origGoPage2 = window.goPage;
window.goPage = function(name) {
  _origGoPage2(name);
  // Update bottom nav active state
  document.querySelectorAll('.bni').forEach(function(b){
    b.classList.remove('active');
  });
  var map = {'home':0,'quiz':1,'tutor':2,'history':3,'settings':4};
  var activeIdx = map[name];
  var page = document.getElementById('pg-' + name);
  if (page && activeIdx !== undefined) {
    var bnis = page.querySelectorAll('.bni');
    if(bnis[activeIdx]) bnis[activeIdx].classList.add('active');
  }
};

// ── Loading state for all AI buttons ────────────────────────────────────
// Wrap main AI calls to show spinner text on button
function wrapBtnLoading(btnId, loadText) {
  var btn = document.getElementById(btnId);
  if (!btn) return;
  var orig = btn.textContent;
  btn.dataset.origText = orig;
}

// ── Offline detection banner ─────────────────────────────────────────────
window.addEventListener('offline', function(){ usingFallback = true; });
window.addEventListener('online', function(){
  toast('Back online — AI features restored','✅','green',3000);
  usingFallback = false;
});

// ── Prevent double-tap zoom on iOS ──────────────────────────────────────
var _lastTap = 0;
document.addEventListener('touchend', function(e) {
  var now = Date.now();
  if (now - _lastTap < 300) e.preventDefault();
  _lastTap = now;
}, {passive: false});

console.log('%cNyansa AI v2 🇬🇭', 'color:#d4960a;font-size:20px;font-weight:800;');
console.log('%cPowered by Wisdom — Built for Ghana', 'color:#006b3f;font-size:12px;');


// ══════════════════════════════════════════════════════════════════
//  NYANSA AI — PRODUCTION OPTIMIZATION SCRIPTS v1
// ══════════════════════════════════════════════════════════════════

(function NyansaOptimize() {
  'use strict';

  // ── A. DEVICE CAPABILITY DETECTION ──────────────────────────────
  var isLowEnd = (function() {
    var mem = navigator.deviceMemory;
    var cores = navigator.hardwareConcurrency;
    var conn = navigator.connection;
    var slowConn = conn && (conn.effectiveType === '2g' || conn.effectiveType === 'slow-2g' || conn.saveData);
    return (mem && mem <= 2) || (cores && cores <= 2) || slowConn;
  })();

  if (isLowEnd) {
    // Apply reduced-motion class — CSS handles the rest
    document.documentElement.classList.add('low-end');
    // Kill confetti on low-end
    window._confettiDisabled = true;
  }

  // Patch confetti to respect low-end flag
  var _origConfetti = window.confetti;
  window.confetti = function() {
    if (window._confettiDisabled) return;
    if (_origConfetti) _origConfetti.apply(this, arguments);
  };

  // ── B. OFFLINE — silent fallback only (no banner) ────────────────
  window.addEventListener('online', function() { usingFallback = false; });

  // ── C. SKELETON LOADING for quiz questions ────────────────────────
  function showQuestionSkeleton() {
    var el = document.getElementById('q-question');
    var opts = document.getElementById('q-options');
    if (!el || !opts) return;
    el.innerHTML = '<div class="skel skel-line med"></div><div class="skel skel-line full"></div><div class="skel skel-line short"></div>';
    opts.innerHTML = '<div class="skel skel-opt"></div><div class="skel skel-opt"></div><div class="skel skel-opt"></div><div class="skel skel-opt"></div>';
  }

  // Patch generateQuestion to show skeleton first
  var _origGQ = window.generateQuestion;
  if (typeof _origGQ === 'function') {
    window.generateQuestion = function() {
      showQuestionSkeleton();
      return _origGQ.apply(this, arguments);
    };
  }

  // ── D. AUTO-FOCUS next action ────────────────────────────────────
  // After answering, auto-scroll to feedback + highlight next btn
  var _origRecordAns = window.recordAnswer;
  if (typeof _origRecordAns === 'function') {
    window.recordAnswer = function(correct, q, customFb) {
      _origRecordAns.apply(this, arguments);
      setTimeout(function() {
        var fb = document.getElementById('q-feedback');
        var nextBtn = document.getElementById('q-next-btn');
        if (fb && fb.innerHTML) {
          fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        if (nextBtn && nextBtn.style.display !== 'none') {
          nextBtn.focus({ preventScroll: true });
          // Pulse the next button to draw attention
          nextBtn.style.animation = 'none';
          nextBtn.offsetHeight; // force reflow
          nextBtn.style.animation = 'nextPulse 0.6s ease';
        }
      }, 180);
    };
    window.recordAnswer._optimized = true;
  }

  // ── E. IMPROVED AI ERROR MESSAGES ────────────────────────────────
  // Wrap all AI-generated content areas with better error UX
  window._lastAIPrompt = null;
  var _origAI = window.ai;
  if (typeof _origAI === 'function') {
    window.ai = async function(prompt, maxT, fallback) {
      window._lastAIPrompt = { prompt: prompt, maxT: maxT, fallback: fallback };
      try {
        return await _origAI(prompt, maxT, fallback);
      } catch(e) {
        // Enhanced error classification
        var errMsg = classifyAIError(e);
        if (fallback) {
          try { return fallback(); } catch(fe) {}
        }
        throw new Error(errMsg);
      }
    };
  }

  function classifyAIError(e) {
    var msg = (e.message || '').toLowerCase();
    if (!navigator.onLine || msg.includes('network') || msg.includes('fetch')) {
      return 'offline';
    }
    if (msg.includes('429') || msg.includes('rate')) {
      return 'ratelimit';
    }
    if (msg.includes('401') || msg.includes('unauthorized')) {
      return 'auth';
    }
    if (msg.includes('500') || msg.includes('503')) {
      return 'server';
    }
    return 'unknown';
  }

  // Improved error display helper
  window.showAIError = function(containerId, errType, retryFn) {
    var el = document.getElementById(containerId);
    if (!el) return;
    var messages = {
      offline:   { icon: '📡', title: 'No internet connection', body: 'Local quiz questions still work. Connect to use AI features.' },
      ratelimit: { icon: '⏳', title: 'Too many requests', body: 'Please wait a moment and try again.' },
      auth:      { icon: '🔑', title: 'Session expired', body: 'Please sign out and back in.' },
      server:    { icon: '🔧', title: 'Server issue', body: 'The AI server is temporarily unavailable. Try in a moment.' },
      unknown:   { icon: '⚠️', title: 'Something went wrong', body: 'Could not load. Please try again.' },
    };
    var m = messages[errType] || messages.unknown;
    el.innerHTML = '<div class="nyansa-ai-error">' +
      '<div style="font-size:22px;margin-bottom:6px;">' + m.icon + '</div>' +
      '<div style="font-weight:700;margin-bottom:4px;">' + m.title + '</div>' +
      '<div style="font-size:14px;color:var(--muted);line-height:1.6;">' + m.body + '</div>' +
      (retryFn ? '<button class="retry-btn" onclick="(' + retryFn.toString() + ')()">' +
        '<span>↺</span> Try again</button>' : '') +
      '</div>';
  };

  // ── F. NAVIGATION PERFORMANCE ────────────────────────────────────
  // Debounce rapid page switches
  var _navBusy = false;
  var _origGoPage = window.goPage;
  if (typeof _origGoPage === 'function') {
    window.goPage = function(name) {
      if (_navBusy) return;
      _navBusy = true;
      _origGoPage(name);
      // Release after transition
      setTimeout(function() { _navBusy = false; }, 250);
    };
  }

  // ── G. LAZY INIT: defer non-critical page setup ──────────────────
  // Only init classroom, parent, teacher pages when first visited
  var _pageInitDone = {};
  var _origGoPageLazy = window.goPage;
  window.goPage = function(name) {
    _origGoPageLazy(name);
    if (!_pageInitDone[name]) {
      _pageInitDone[name] = true;
      // Defer heavy rendering for off-screen pages
      if (['leaderboard','badges','teacher','parent'].includes(name)) {
        setTimeout(function() {
          if (name === 'leaderboard') { if(typeof loadLeaderboard==='function') loadLeaderboard(); }
          if (name === 'badges')      { if(typeof renderBadges==='function') renderBadges(); }
          if (name === 'teacher')     { if(typeof renderTRoster==='function') renderTRoster(); }
          if (name === 'parent')      { if(typeof renderChildren==='function') renderChildren(); }
        }, 50);
      }
    }
  };

  // ── H. TOUCH: passive listeners everywhere ────────────────────────
  // Add passive:true to all scroll/touch listeners for perf
  var _origAEL = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function(type, fn, opts) {
    if (['touchstart','touchmove','wheel','scroll'].includes(type)) {
      if (typeof opts === 'object') {
        opts.passive = opts.passive !== false;
      } else if (opts === undefined || opts === false) {
        opts = { passive: true, capture: !!opts };
      }
    }
    return _origAEL.call(this, type, fn, opts);
  };

  // ── I. FONT LOADING: inline critical, defer rest ─────────────────
  // If fonts not yet loaded, set fallback immediately
  if (!document.fonts || !document.fonts.check('700 1em Syne')) {
    document.body.style.fontFamily = 'system-ui, -apple-system, sans-serif';
    if (document.fonts) {
      document.fonts.ready.then(function() {
        document.body.style.fontFamily = '';
      });
    }
  }

  // ── J. IMAGE / ICON OPTIMIZATION ─────────────────────────────────
  // PWA icons: already in zip. Preconnect to font CDN only.
  (function preconnect() {
    if (!document.querySelector('link[rel="preconnect"][href*="fonts.googleapis"]')) return;
    // Already present — just ensure DNS prefetch too
    var dns = document.createElement('link');
    dns.rel = 'dns-prefetch'; dns.href = '//fonts.gstatic.com';
    document.head.appendChild(dns);
  })();

  // ── K. SCROLL RESTORATION ────────────────────────────────────────
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  // ── L. QUIZ: prevent rapid re-tap on options ─────────────────────
  document.addEventListener('click', function(e) {
    var opt = e.target.closest('.opt');
    if (!opt || opt.disabled) return;
    // Disable immediately on first tap
    if (opt.dataset.tapping) { e.stopImmediatePropagation(); e.preventDefault(); return; }
    opt.dataset.tapping = '1';
    setTimeout(function() { delete opt.dataset.tapping; }, 800);
  }, true);

  // ── M. KEYBOARD: Enter to send chat ──────────────────────────────
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      var active = document.activeElement;
      if (active && active.id === 'chat-input') {
        e.preventDefault();
        if (typeof sendChat === 'function') sendChat();
      }
      if (active && active.id === 'q-written-input') {
        e.preventDefault();
        if (typeof submitWritten === 'function') submitWritten();
      }
    }
  });

  // ── N. CONSISTENT TOAST POSITION ─────────────────────────────────
  // Move toast to bottom on mobile (above nav)
  function reposToast() {
    var tw = document.getElementById('toast-wrap');
    if (!tw) return;
    tw.style.cssText = 'position:fixed;bottom:72px;left:12px;right:12px;z-index:500;display:flex;flex-direction:column;gap:8px;pointer-events:none;align-items:flex-end;';
  }
  reposToast();

  // ── O. STANDARDIZE ALL PRIMARY BUTTONS ────────────────────────────
  // Ensure every .btn.bp has consistent height
  function normButtons() {
    document.querySelectorAll('.btn').forEach(function(b) {
      if (!b.style.minHeight) b.style.minHeight = '44px';
    });
  }

  // ── P. QUIZ: AUTO-ADVANCE UX improvement ─────────────────────────
  // Show a "Next" chip that counts down on auto-advance
  var _origNextQ = window.nextQ;
  window.nextQ = function() {
    var btn = document.getElementById('q-next-btn');
    if (btn) {
      btn.textContent = 'Loading...';
      btn.disabled = true;
    }
    if (_origNextQ) _origNextQ();
  };

  // ── Q. TUTOR: auto-resize textarea ───────────────────────────────
  document.addEventListener('input', function(e) {
    if (e.target.id === 'chat-input') {
      // Single-line input, no resize needed
    }
    if (e.target.tagName === 'TEXTAREA') {
      var el = e.target;
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 200) + 'px';
    }
  });

  // ── R. PERFORMANCE MARK ──────────────────────────────────────────
  if (window.performance && window.performance.mark) {
    window.performance.mark('nyansa-optimize-done');
  }

  // ── S. NEXT BUTTON PULSE ANIMATION ───────────────────────────────
  var pulseStyle = document.createElement('style');
  pulseStyle.textContent = '@keyframes nextPulse { 0%{box-shadow:0 0 0 0 rgba(212,150,10,.5)} 70%{box-shadow:0 0 0 10px rgba(212,150,10,0)} 100%{box-shadow:0 0 0 0 rgba(212,150,10,0)} }';
  document.head.appendChild(pulseStyle);

  // ── T. LOW-END: reduce box-shadows ───────────────────────────────
  if (isLowEnd) {
    var lowEndStyle = document.createElement('style');
    lowEndStyle.textContent = [
      '.fcard{box-shadow:none!important}',
      '.card{box-shadow:none!important}',
      '.qcard{box-shadow:none!important}',
      '.btn.bp{box-shadow:none!important}',
      '.bni.active .bni-ico{box-shadow:none!important}',
      '.conf{display:none!important}',
      '.badge-card.earned{box-shadow:none!important}',
      '* { transition-duration: 100ms !important; }',
    ].join('');
    document.head.appendChild(lowEndStyle);
    console.log('[Nyansa] Low-end mode active — reduced effects');
  }

  // ── U. QUIZ SELECTS: consolidate into a single compact row ───────
  // Wrap the 4 selects on quiz page to prevent overflow on small screens
  setTimeout(function() {
    var qWrap = document.querySelector('#pg-quiz .g2');
    if (qWrap) {
      qWrap.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;';
    }
  }, 100);

  // ── V. CLEANUP: remove duplicate font link ────────────────────────
  var fontLinks = document.querySelectorAll('link[href*="fonts.googleapis.com/css2"]');
  if (fontLinks.length > 1) {
    for (var fi = 1; fi < fontLinks.length; fi++) {
      fontLinks[fi].remove();
    }
  }

  // ── W. CONSISTENT FEEDBACK COLORS ───────────────────────────────
  // Patch feedback boxes to always use correct semantic colors
  var feedbackStyle = document.createElement('style');
  feedbackStyle.textContent = [
    '.fbox strong:first-child { color: #006b3f; }',
    '.ebox strong:first-child { color: #ce1126; }',
    '.hbox strong:first-child { color: #8a6000; }',
    '.learn-section-head + p, .learn-section-head + div { font-size: 15px; line-height: 1.65; }',
  ].join('');
  document.head.appendChild(feedbackStyle);

  // ── X. INIT ──────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function() {
    normButtons();
    reposToast();
  });

  console.log('%cNyansa Optimize v1 ready — low-end:' + isLowEnd, 'color:#d4960a;font-weight:700;');

})(); // end NyansaOptimize


(function NyansaV5() {
'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1 — SHS SUBJECT DATA STRUCTURE
// Complete WASSCE-aligned subject hierarchy. Lazy-loaded per program.
// ─────────────────────────────────────────────────────────────────────────────

const SHS_PROGRAMS = {
  science: {
    label: 'General Science',
    emoji: '🔬',
    color: '#006b3f',
    core: ['english','coremath','intscience','socialstudies'],
    electives: ['physics','chemistry','biology','elecmaths'],
  },
  arts: {
    label: 'General Arts',
    emoji: '🎨',
    color: '#d4960a',
    core: ['english','coremath','intscience','socialstudies'],
    electives: ['history','geography','government','literature','economics'],
  },
  business: {
    label: 'Business',
    emoji: '💼',
    color: '#1a66cc',
    core: ['english','coremath','intscience','socialstudies'],
    electives: ['finaccounting','businessmgmt','economics','costaccounting'],
  },
  homeec: {
    label: 'Home Economics',
    emoji: '🏠',
    color: '#9b59b6',
    core: ['english','coremath','intscience','socialstudies'],
    electives: ['foodnutrition','mgmtliving','textiles'],
  },
  visualarts: {
    label: 'Visual Arts',
    emoji: '🖌️',
    color: '#e67e00',
    core: ['english','coremath','intscience','socialstudies'],
    electives: ['graphicdesign','sculpture','picturemaking','textiles'],
  },
  technical: {
    label: 'Technical',
    emoji: '🔧',
    color: '#7f8c8d',
    core: ['english','coremath','intscience','socialstudies'],
    electives: ['techdrawing','buildingconstruction','woodwork','metalwork'],
  },
};

// Full subject catalogue — each entry has: label, emoji, topics[], waecTip
const SHS_SUBJECTS = {
  // ── CORE ──
  english:       { label:'English Language',      emoji:'📝', group:'core',
    topics:['Comprehension','Summary Writing','Essay Writing','Letter Writing','Lexis & Structure','Oral English','Literature'],
    waecTip:'WASSCE English Paper 1 is 80 Objective; Paper 2 is 4 essay questions — always plan before you write.' },
  coremath:      { label:'Core Mathematics',      emoji:'➗', group:'core',
    topics:['Number & Numeration','Algebra','Geometry','Statistics','Probability','Trigonometry','Mensuration','Calculus (intro)'],
    waecTip:'Show ALL working — WAEC awards method marks even if final answer is wrong.' },
  intscience:    { label:'Integrated Science',    emoji:'🔬', group:'core',
    topics:['Scientific Method','Cell Biology','Genetics','Ecology','Chemistry of Matter','Forces & Motion','Electricity','Waves','Human Body'],
    waecTip:'Paper 2 practical: describe observation first, then interpretation — marks are split.' },
  socialstudies: { label:'Social Studies',         emoji:'🌍', group:'core',
    topics:['Ghana Geography','African History','Economic Development','Governance & Democracy','Population','Environmental Issues','ECOWAS & AU'],
    waecTip:'Always link answers to Ghana\'s context. Generic answers score lower.' },

  // ── SCIENCE ELECTIVES ──
  physics:       { label:'Physics',               emoji:'⚛️', group:'science',
    topics:['Mechanics','Waves','Optics','Electricity & Magnetism','Thermal Physics','Modern Physics','Nuclear Physics'],
    waecTip:'Derive formulae — don\'t just state them. WAEC frequently asks "show that..."' },
  chemistry:     { label:'Chemistry',             emoji:'🧪', group:'science',
    topics:['Atomic Structure','Bonding','Stoichiometry','Acids & Bases','Redox','Organic Chemistry','Electrochemistry','Kinetics'],
    waecTip:'Balance ALL equations — unbalanced equations score zero even with correct species.' },
  biology:       { label:'Biology',               emoji:'🧬', group:'science',
    topics:['Cell Structure','Photosynthesis','Respiration','Genetics & Heredity','Evolution','Ecology','Human Biology','Reproduction'],
    waecTip:'Label diagrams fully — unlabelled parts lose marks.' },
  elecmaths:     { label:'Elective Mathematics',  emoji:'📐', group:'science',
    topics:['Algebra','Coordinate Geometry','Calculus','Trigonometry','Statistics','Probability','Vectors','Complex Numbers'],
    waecTip:'Attempt all parts of a question — partial marks exist even for incomplete solutions.' },

  // ── ARTS ELECTIVES ──
  history:       { label:'History',               emoji:'📜', group:'arts',
    topics:['Pre-colonial Ghana','Colonial Era','Independence Movement','Post-Independence Politics','African History','World History 20th C'],
    waecTip:'Use specific dates, names, and consequences — vague answers score only 50%.' },
  geography:     { label:'Geography',             emoji:'🗺️', group:'arts',
    topics:['Map Reading','Climate & Weather','Natural Vegetation','Population Geography','Agriculture','Mining in Ghana','Transportation'],
    waecTip:'Sketch maps are often required — practise drawing Ghana\'s outline freehand.' },
  government:    { label:'Government',            emoji:'🏛️', group:'arts',
    topics:['Constitutional Democracy','The Legislature','Executive & Judiciary','Electoral System','Ghana\'s 1992 Constitution','International Organisations','Human Rights'],
    waecTip:'Quote specific Articles of the 1992 Constitution — examiners reward this.' },
  literature:    { label:'Literature in English', emoji:'📚', group:'arts',
    topics:['Prose Analysis','Poetry','Drama','African Literature','Figures of Speech','Character Analysis','Themes & Motifs'],
    waecTip:'Always support analysis with direct evidence (quotes or paraphrase) from the text.' },
  economics:     { label:'Economics',             emoji:'📈', group:'arts',
    topics:['Supply & Demand','Market Structures','National Income','Money & Banking','International Trade','Inflation','Fiscal Policy','Ghana\'s Economy'],
    waecTip:'Define ALL economic terms before using them — WAEC allocates definition marks separately.' },

  // ── BUSINESS ELECTIVES ──
  finaccounting: { label:'Financial Accounting',  emoji:'🧾', group:'business',
    topics:['Double Entry','Trial Balance','Income Statement','Balance Sheet','Cashflow','Partnership Accounts','Company Accounts','Bank Reconciliation'],
    waecTip:'Format MUST be correct — marks for layout are separate from accuracy marks.' },
  businessmgmt:  { label:'Business Management',   emoji:'📊', group:'business',
    topics:['Business Organisation','Management Functions','Human Resources','Marketing','Finance','Production','Business Ethics','Ghana Business Law'],
    waecTip:'Use the POLC framework (Planning, Organising, Leading, Controlling) in management questions.' },
  costaccounting:{ label:'Cost Accounting',       emoji:'🔢', group:'business',
    topics:['Cost Classification','Job Costing','Process Costing','Break-Even Analysis','Budgeting','Standard Costing','Variance Analysis'],
    waecTip:'Show cost statements in proper format — narrative answers score very poorly in cost accounting.' },

  // ── HOME ECONOMICS ELECTIVES ──
  foodnutrition: { label:'Food & Nutrition',      emoji:'🍽️', group:'homeec',
    topics:['Nutrients & Functions','Digestion','Meal Planning','Food Preservation','Catering','Ghanaian Foods & Diet','Special Diets'],
    waecTip:'Use correct nutritional terminology — generic terms like "healthy food" score low.' },
  mgmtliving:    { label:'Management in Living',  emoji:'🏡', group:'homeec',
    topics:['Home Management','Family Resources','Housing & Interior Design','Consumer Education','Child Development','Family Relations'],
    waecTip:'Practical papers: write in clear numbered steps — markers follow a checklist.' },
  textiles:      { label:'Textiles',              emoji:'🧵', group:'homeec',
    topics:['Fibres & Fabrics','Weaving','Dyeing & Printing','Garment Construction','Fabric Care','Ghanaian Textiles (Kente, Batik)'],
    waecTip:'Know the specific names of Ghanaian textile traditions — WAEC expects precise cultural knowledge.' },

  // ── VISUAL ARTS ELECTIVES ──
  graphicdesign: { label:'Graphic Design',        emoji:'🎨', group:'visualarts',
    topics:['Design Principles','Typography','Colour Theory','Layout & Composition','Digital Tools','Logo Design','Advertising Design'],
    waecTip:'Practical work (portfolio): label all elements and explain your design rationale.' },
  sculpture:     { label:'Sculpture',             emoji:'🗿', group:'visualarts',
    topics:['Materials & Tools','Carving','Modelling','Construction','Ghanaian Sculpture Traditions','Art History'],
    waecTip:'Describe process in sequence — examiners look for awareness of techniques.' },
  picturemaking: { label:'Picture Making',        emoji:'🖼️', group:'visualarts',
    topics:['Drawing Techniques','Painting','Printmaking','Composition','Perspective','Colour Mixing','Ghanaian Art Styles'],
    waecTip:'Theory paper: always name specific Ghanaian artists and their works.' },

  // ── TECHNICAL ELECTIVES ──
  techdrawing:   { label:'Technical Drawing',     emoji:'📏', group:'technical',
    topics:['Orthographic Projection','Isometric Drawing','Sectional Views','Dimensioning','Building Plans','Electrical Diagrams'],
    waecTip:'Use instruments correctly — marks deducted for freehand on measured drawings.' },
  buildingconstruction: { label:'Building Construction', emoji:'🏗️', group:'technical',
    topics:['Site Preparation','Foundations','Walling','Roofing','Finishing','Plumbing','Electrical Installation','Ghana Building Codes'],
    waecTip:'State the function, not just the name — "what does X do?" is common in WAEC.' },
  woodwork:      { label:'Woodwork',              emoji:'🪵', group:'technical',
    topics:['Wood Types','Hand Tools','Power Tools','Joints','Surface Finishing','Furniture Construction','Wood Preservation'],
    waecTip:'Name and describe tools precisely — "a sharp tool" scores less than "a cabinet scraper".' },
  metalwork:     { label:'Metalwork',             emoji:'⚙️', group:'technical',
    topics:['Metal Types','Bench Work','Fitting','Welding','Sheet Metal','Metal Finishing','Foundry Work'],
    waecTip:'Safety in practical work is always examinable — list precautions step by step.' },
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2 — LANGUAGE SYSTEM
// ─────────────────────────────────────────────────────────────────────────────

// ── Subject display name helper ──────────────────────────────────────────────
// Returns a clean label for any subject key — SHS keys get their full name,
// legacy short keys get capitalized. Used by mastery map, history, score summary.
function subjectDisplayName(key) {
  if (!key) return '';
  // Check SHS_SUBJECTS first (defined in this IIFE)
  if (SHS_SUBJECTS[key]) return SHS_SUBJECTS[key].label;
  // Legacy key map
  const legacy = {
    math:'Mathematics', english:'English Language', science:'Integrated Science',
    history:'History', geography:'Geography', coding:'ICT / Coding',
    economics:'Economics', business:'Business Studies', rme:'R.M.E.',
    socialstudies:'Social Studies', french:'French', literature:'Literature',
    government:'Government', elecmaths:'Elective Maths', pe:'Physical Education',
    twi:'Twi Language', owop:'Our World Our People (OWOP)', historygh:'History of Ghana',
    careertech:'Career Technology', cad:'Creative Arts & Design (CAD)',
    physics:'Physics', chemistry:'Chemistry', biology:'Biology'
  };
  return legacy[key] || (key.charAt(0).toUpperCase() + key.slice(1));
}

const LANGUAGES = {
  English: { code:'en-GB', ttsLang:'en-GB',  nativeName:'English',  flag:'🇬🇧', ttsSupported:true },
  Twi:     { code:'tw',    ttsLang:'',        nativeName:'Twi (Akan)',flag:'🇬🇭', ttsSupported:false },
  Fante:   { code:'fat',   ttsLang:'',        nativeName:'Fante',    flag:'🇬🇭', ttsSupported:false },
  Ewe:     { code:'ee',    ttsLang:'',        nativeName:'Ewe',      flag:'🇬🇭', ttsSupported:false },
  Ga:      { code:'gaa',   ttsLang:'',        nativeName:'Ga',       flag:'🇬🇭', ttsSupported:false },
  Hausa:   { code:'ha',    ttsLang:'',        nativeName:'Hausa',    flag:'🇬🇭', ttsSupported:false },
  Dagbani: { code:'dag',   ttsLang:'',        nativeName:'Dagbani',  flag:'🇬🇭', ttsSupported:false },
};

// Build language instruction string to append to any AI prompt
function getLangInstruction(lang, ageGroup) {
  if (!lang || lang === 'English') return '';
  const isKids = (ageGroup === 'nursery' || ageGroup === 'lower_primary');
  if (isKids) {
    return `\n\nLANGUAGE: Respond in simple English, but add key phrases in ${lang} for each important idea. Format: English sentence, then (${lang}: Twi phrase). Keep sentences very short.`;
  }
  return `\n\nLANGUAGE: Respond primarily in ${lang}. If a concept is very technical, write it in ${lang} first then add the English term in parentheses. If you cannot fully translate a sentence naturally, use bilingual format: ${lang} sentence — (English: translation).`;
}

// Central language store — single source of truth
const V5Lang = {
  _lang: 'English',
  get() { return this._lang; },
  set(lang) {
    if (!LANGUAGES[lang]) return;
    this._lang = lang;
    // Persist in localStorage
    try { localStorage.setItem('nyansa_lang', lang); } catch(e) {}
    // Sync ALL language selectors in the DOM
    document.querySelectorAll('.v5-lang-select, #tutor-lang, #q-translang').forEach(el => {
      if (el.tagName === 'SELECT') {
        // For q-translang, map English→none and others directly
        if (el.id === 'q-translang') {
          el.value = lang === 'English' ? 'none' : lang;
        } else {
          el.value = lang;
        }
      }
    });
    // Update any pill displays
    document.querySelectorAll('.v5-lang-pill').forEach(el => {
      el.textContent = LANGUAGES[lang].flag + ' ' + lang;
    });
  },
  load() {
    try {
      const stored = localStorage.getItem('nyansa_lang');
      if (stored && LANGUAGES[stored]) this._lang = stored;
    } catch(e) {}
  },
};
V5Lang.load();

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3 — VOICE SYSTEM
// TTS uses SpeechSynthesis API (browser-native, no key needed)
// STT uses SpeechRecognition API (browser-native, where available)
// ─────────────────────────────────────────────────────────────────────────────

const Voice = {
  synth: window.speechSynthesis || null,
  SpeechRec: window.SpeechRecognition || window.webkitSpeechRecognition || null,
  _rec: null,
  _listenBtn: null,   // active mic button reference
  _s2sActive: false,  // speech-to-speech mode

  // ── TTS: speak any text ──
  speak(text, rate, pitch) {
    if (!this.synth) return;
    this.synth.cancel();
    // Strip markdown/HTML for cleaner speech
    const clean = text.replace(/<[^>]+>/g,'').replace(/[*_#`]/g,'').replace(/\n+/g,' ').slice(0,600);
    const utt = new SpeechSynthesisUtterance(clean);
    const lang = V5Lang.get();
    // English gets a proper en-GB voice; others fall back to en-GB since
    // no browser natively supports Ghanaian languages yet.
    utt.lang = LANGUAGES[lang]?.ttsLang || 'en-GB';
    utt.rate = rate || 0.92;
    utt.pitch = pitch || 1.0;
    // Pick a voice: prefer en-GB female for clarity on mobile
    const voices = this.synth.getVoices();
    const pick = voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('female'))
               || voices.find(v => v.lang.startsWith('en'))
               || voices[0];
    if (pick) utt.voice = pick;
    this.synth.speak(utt);
    return utt;
  },

  stopSpeak() {
    if (this.synth) this.synth.cancel();
  },

  // ── STT: start listening, fill an input element ──
  startListening(inputEl, btnEl, onResult) {
    if (!this.SpeechRec) {
      alert('Your browser does not support voice input. Try Chrome or Edge.');
      return;
    }
    if (this._rec) {
      this._rec.abort();
      this._setListenState(btnEl, false);
      this._rec = null;
      return;
    }
    const rec = new this.SpeechRec();
    rec.lang = 'en-GH'; // closest code; browser falls back to en-US gracefully
    rec.continuous = false;
    rec.interimResults = true;
    this._rec = rec;
    this._setListenState(btnEl, true);

    rec.onresult = (e) => {
      const transcript = Array.from(e.results).map(r => r[0].transcript).join('');
      if (inputEl) inputEl.value = transcript;
    };
    rec.onend = () => {
      this._setListenState(btnEl, false);
      this._rec = null;
      if (onResult && inputEl) onResult(inputEl.value);
    };
    rec.onerror = () => {
      this._setListenState(btnEl, false);
      this._rec = null;
    };
    rec.start();
  },

  _setListenState(btn, isListening) {
    if (!btn) return;
    btn.style.background = isListening ? '#ce1126' : '';
    btn.style.color = isListening ? '#fff' : '';
    btn.title = isListening ? 'Listening... tap to stop' : 'Speak your question';
    btn.textContent = isListening ? '🔴' : '🎤';
  },

  // ── Speech-to-Speech: listen → send → speak response ──
  toggleS2S() {
    this._s2sActive = !this._s2sActive;
    const btn = document.getElementById('v5-s2s-btn');
    if (!btn) return;
    if (this._s2sActive) {
      btn.style.background = 'var(--gold)';
      btn.style.color = '#fff';
      btn.title = 'Speech mode ON — tap mic to speak';
      this._doS2SLoop();
    } else {
      btn.style.background = '';
      btn.style.color = '';
      btn.title = 'Speech-to-Speech mode';
      this.stopSpeak();
      if (this._rec) { this._rec.abort(); this._rec = null; }
    }
  },

  _doS2SLoop() {
    if (!this._s2sActive) return;
    const micBtn = document.getElementById('v5-mic-btn');
    this.startListening(
      document.getElementById('chat-input'),
      micBtn,
      (transcript) => {
        if (!transcript || !this._s2sActive) return;
        // Actually invoke sendChat — the v5 wrapper will auto-speak the reply
        // and then _doS2SLoop is re-triggered from the sendChat wrapper above
        if (typeof window.sendChat === 'function') window.sendChat();
      }
    );
  },

  // ── Speak AI message ── (attached to each AI bubble)
  speakBubble(text, btn) {
    if (this.synth && this.synth.speaking) {
      this.stopSpeak();
      if (btn) { btn.textContent = '🔊'; btn.title = 'Listen'; }
      return;
    }
    if (btn) { btn.textContent = '⏹'; btn.title = 'Stop'; }
    const utt = this.speak(text, 0.92, 1.0);
    if (utt && btn) {
      utt.onend = () => { btn.textContent = '🔊'; btn.title = 'Listen'; };
    }
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4 — SHS PROGRAM SELECTOR UI
// Injected into Quiz page and WASSCE page after DOM is ready
// ─────────────────────────────────────────────────────────────────────────────

const SHSSelector = {
  _program: null,   // currently selected program key
  _subject: null,   // currently selected subject key

  load() {
    try {
      const d = JSON.parse(localStorage.getItem('nyansa_shs') || '{}');
      this._program = d.program || null;
      this._subject = d.subject || null;
    } catch(e) {}
  },

  save() {
    try { localStorage.setItem('nyansa_shs', JSON.stringify({ program: this._program, subject: this._subject })); } catch(e) {}
  },

  getProgram() { return this._program; },
  getSubject() { return this._subject; },

  // Returns subject data object or null
  getSubjectData(key) { return SHS_SUBJECTS[key] || null; },

  // Returns the list of subject keys for the active program
  getSubjectKeys() {
    if (!this._program || !SHS_PROGRAMS[this._program]) return [];
    const p = SHS_PROGRAMS[this._program];
    return [...p.core, ...p.electives];
  },

  // Build the subject label for a key
  subjectLabel(key) {
    return SHS_SUBJECTS[key] ? SHS_SUBJECTS[key].label : key;
  },

  // Open the program selector bottom sheet
  openSheet() {
    if (document.getElementById('shs-prog-sheet')) return;
    const overlay = document.createElement('div');
    overlay.id = 'shs-prog-sheet';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.55);display:flex;align-items:flex-end;justify-content:center;';

    const sheet = document.createElement('div');
    sheet.style.cssText = 'background:var(--bg);border-radius:24px 24px 0 0;width:100%;max-width:680px;padding:1.6rem 1.4rem 2.4rem;max-height:90vh;overflow-y:auto;';

    const handle = document.createElement('div');
    handle.style.cssText = 'width:40px;height:4px;background:var(--border2);border-radius:99px;margin:0 auto 1.2rem;';

    const title = document.createElement('div');
    title.style.cssText = 'font-family:var(--fh);font-size:1.15rem;font-weight:800;color:var(--text);margin-bottom:.3rem;';
    title.textContent = '📚 Choose Your SHS Programme';

    const sub = document.createElement('div');
    sub.style.cssText = 'font-size:12.5px;color:var(--muted);margin-bottom:1.2rem;';
    sub.textContent = 'Subjects auto-load based on your programme';

    const grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:1.4rem;';

    Object.entries(SHS_PROGRAMS).forEach(([key, prog]) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.style.cssText = `background:var(--card);border:2px solid ${this._program===key ? prog.color : 'var(--border)'};border-radius:14px;padding:1rem .8rem;cursor:pointer;text-align:center;transition:all .2s;`;
      card.innerHTML = `<div style="font-size:26px;margin-bottom:.3rem;">${prog.emoji}</div><div style="font-family:var(--fh);font-size:.85rem;font-weight:800;color:var(--text);">${prog.label}</div>`;
      card.onclick = () => {
        this._program = key;
        this._subject = null;
        this.save();
        overlay.remove();
        this.openSubjectSheet();
        this.patchQuizSubjectDropdown();
        this.patchWASSCESubjectDropdown();
      };
      grid.appendChild(card);
    });

    // No-program option
    const skip = document.createElement('button');
    skip.type = 'button';
    skip.style.cssText = 'width:100%;padding:12px;border-radius:12px;border:1px solid var(--border2);background:var(--bg2);color:var(--muted);font-size:13px;cursor:pointer;';
    skip.textContent = 'I\'m not SHS / Show all subjects';
    skip.onclick = () => { this._program = null; this.save(); overlay.remove(); this.patchQuizSubjectDropdown(); };

    sheet.appendChild(handle);
    sheet.appendChild(title);
    sheet.appendChild(sub);
    sheet.appendChild(grid);
    sheet.appendChild(skip);
    overlay.appendChild(sheet);
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
    document.body.appendChild(overlay);
  },

  openSubjectSheet() {
    if (!this._program) return;
    const prog = SHS_PROGRAMS[this._program];
    if (!prog) return;

    const overlay = document.createElement('div');
    overlay.id = 'shs-subj-sheet';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.55);display:flex;align-items:flex-end;justify-content:center;';

    const sheet = document.createElement('div');
    sheet.style.cssText = 'background:var(--bg);border-radius:24px 24px 0 0;width:100%;max-width:680px;padding:1.6rem 1.4rem 2.4rem;max-height:90vh;overflow-y:auto;';

    sheet.innerHTML = `
      <div style="width:40px;height:4px;background:var(--border2);border-radius:99px;margin:0 auto 1.2rem;"></div>
      <div style="font-family:var(--fh);font-size:1.1rem;font-weight:800;margin-bottom:.3rem;">${prog.emoji} ${prog.label} — Choose Subject</div>
      <div style="font-size:12px;color:var(--muted);margin-bottom:1rem;">Core subjects + ${prog.label} electives</div>
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--muted);margin-bottom:.6rem;">Core Subjects</div>
      <div id="shs-core-list" style="display:flex;flex-direction:column;gap:8px;margin-bottom:1.2rem;"></div>
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--muted);margin-bottom:.6rem;">${prog.label} Electives</div>
      <div id="shs-elec-list" style="display:flex;flex-direction:column;gap:8px;"></div>
    `;

    const renderList = (listId, keys) => {
      const container = sheet.querySelector('#' + listId);
      keys.forEach(key => {
        const s = SHS_SUBJECTS[key];
        if (!s) return;
        const item = document.createElement('button');
        item.type = 'button';
        item.style.cssText = `background:var(--card);border:1.5px solid ${this._subject===key ? prog.color : 'var(--border)'};border-radius:12px;padding:.8rem 1rem;cursor:pointer;display:flex;align-items:center;gap:10px;text-align:left;width:100%;`;
        item.innerHTML = `<span style="font-size:20px;">${s.emoji}</span><div style="flex:1;"><div style="font-size:13.5px;font-weight:700;color:var(--text);">${s.label}</div><div style="font-size:11px;color:var(--muted);margin-top:2px;">${s.topics.slice(0,3).join(' · ')}</div></div><span style="color:var(--gold);font-size:16px;">→</span>`;
        item.onclick = () => {
          this._subject = key;
          this.save();
          overlay.remove();
          this.patchQuizSubjectDropdown();
          this.patchWASSCESubjectDropdown();
          // Show WAEC tip toast
          if (s.waecTip && window.toast) window.toast('📝 WAEC Tip: ' + s.waecTip.slice(0,80) + '...', '💡', 'gold', 5000);
        };
        container.appendChild(item);
      });
    };

    renderList('shs-core-list', prog.core);
    renderList('shs-elec-list', prog.electives);

    overlay.appendChild(sheet);
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
    document.body.appendChild(overlay);
  },

  // Patch the quiz subject <select> to include SHS subjects
  patchQuizSubjectDropdown() {
    const sel = document.getElementById('q-sub');
    if (!sel) return;
    // Remove previously injected SHS options
    sel.querySelectorAll('[data-shs]').forEach(o => o.remove());

    const keys = this.getSubjectKeys();
    if (keys.length === 0) return;

    const grp = document.createElement('optgroup');
    grp.label = this._program ? (SHS_PROGRAMS[this._program].label + ' — SHS') : 'SHS Subjects';
    grp.setAttribute('data-shs', '1');

    keys.forEach(key => {
      const s = SHS_SUBJECTS[key];
      if (!s) return;
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = s.emoji + ' ' + s.label;
      opt.setAttribute('data-shs', '1');
      grp.appendChild(opt);
    });
    sel.appendChild(grp);

    // Auto-select the chosen subject
    if (this._subject && sel.querySelector(`option[value="${this._subject}"]`)) {
      sel.value = this._subject;
    }
  },

  // Patch WASSCE page subject <select>
  patchWASSCESubjectDropdown() {
    const sel = document.getElementById('wassce-subject');
    if (!sel) return;
    sel.querySelectorAll('[data-shs]').forEach(o => o.remove());
    const keys = this.getSubjectKeys();
    if (keys.length === 0) return;
    const grp = document.createElement('optgroup');
    grp.label = 'Your Programme';
    grp.setAttribute('data-shs', '1');
    keys.forEach(key => {
      const s = SHS_SUBJECTS[key];
      if (!s) return;
      const opt = document.createElement('option');
      opt.value = s.label; // WASSCE page uses label strings in its prompt
      opt.textContent = s.emoji + ' ' + s.label;
      opt.setAttribute('data-shs', '1');
      grp.appendChild(opt);
    });
    // Prepend so programme subjects appear first
    sel.insertBefore(grp, sel.firstChild);
  },
};
SHSSelector.load();

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 5 — AI PROMPT PATCHES
// Wrap existing prompt-building to inject language + subject context
// ─────────────────────────────────────────────────────────────────────────────

// Patch the _prefetch function to include language + SHS subject context in AI prompts
const _origPrefetch = window._prefetch;
// We monkey-patch by wrapping the global function reference used elsewhere
// _prefetch is called inside generateQuestion() which is in global scope.
// We extend the prompt string by overriding the prompt construction in the
// wrapper below. Since _prefetch is async and declared with `var`, we can replace it.
if (typeof window._pfBusy !== 'undefined') {
  // Rebuild _prefetch with language + subject topic injection
  window._prefetch = async function(sub, lvl, mode) {
    if (window._pfBusy || window.usingFallback) return;
    window._pfBusy = true;

    const lang = V5Lang.get();
    const langNote = lang !== 'English' ? ` Respond with explanation in ${lang} where possible, with English in brackets.` : '';
    const subjData = SHS_SUBJECTS[sub];
    const subjectContext = subjData
      ? ` This is a WASSCE ${subjData.label} question. WAEC tip for this subject: ${subjData.waecTip}`
      : '';

    const isW = mode === 'written';
    const p = isW
      ? `Generate a ${lvl} ${sub} short-answer question for a Ghanaian student.${subjectContext}${langNote} Return ONLY JSON: {"question":"...","sampleAnswer":"...","hint":"...","explanation":"..."}`
      : `Generate a unique ${lvl} ${sub} multiple choice question for a Ghanaian student.${subjectContext}${langNote} Return ONLY JSON: {"question":"...","options":["a","b","c","d"],"answer":0,"hint":"...","explanation":"..."}. answer is 0-3.`;

    try {
      const r = await window.ai(p, 700);
      const q = window.parseJSON(r);
      q.subject = sub; q.mode = isW ? 'written' : 'mcq'; q.difficulty = lvl;
      if (window._aiQ.length < 3) window._aiQ.push(q);
    } catch(e) { window.usingFallback = true; }
    window._pfBusy = false;
  };
}

// Patch buildTeachPrompt to inject SHS subject topics + language
if (typeof window.buildTeachPrompt === 'function') {
  const _origBuildTeach = window.buildTeachPrompt;
  window.buildTeachPrompt = function(topic, lang, ageGroup) {
    let base = _origBuildTeach(topic, lang, ageGroup);

    // Add SHS subject structure if a subject is selected
    const subjData = SHSSelector.getSubjectData(SHSSelector.getSubject());
    if (subjData) {
      base += `\n\nSUBJECT CONTEXT: This topic falls under "${subjData.label}" (WASSCE).
Key topics in this subject: ${subjData.topics.join(', ')}.
WAEC examiner note: ${subjData.waecTip}`;
    }

    // Add language instruction (overwrites the simpler one in original)
    if (lang && lang !== 'English') {
      base += getLangInstruction(lang, ageGroup);
    }

    return base;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 6 — PATCH sendChat TO AUTO-SPEAK RESPONSES
// After every AI reply, add a 🔊 listen button to the bubble
// ─────────────────────────────────────────────────────────────────────────────

// We wrap the global sendChat which was already upgraded in v4's learning engine
const _origSendChat = window.sendChat;
window.sendChat = async function() {
  // Sync language selector before calling original
  const tutorLangSel = document.getElementById('tutor-lang');
  if (tutorLangSel) tutorLangSel.value = V5Lang.get();

  try {
    await _origSendChat();
  } catch(e) {
    // original handles its own errors — just don't block the listen-button injection
  }

  // Add 🔊 listen button to the last AI bubble
  const win = document.getElementById('chat-win');
  if (!win) return;
  const bubbles = win.querySelectorAll('.msg-ai');
  const last = bubbles[bubbles.length - 1];
  if (!last || last.querySelector('.v5-listen-btn')) return;

  const text = last.innerText || last.textContent || '';
  const listenBtn = document.createElement('button');
  listenBtn.className = 'v5-listen-btn';
  listenBtn.type = 'button';
  listenBtn.textContent = '🔊';
  listenBtn.title = 'Listen to this response';
  listenBtn.style.cssText = 'margin-top:8px;background:transparent;border:1px solid var(--border2);border-radius:8px;padding:4px 10px;font-size:12px;cursor:pointer;color:var(--muted);';
  listenBtn.onclick = () => Voice.speakBubble(text, listenBtn);
  last.appendChild(listenBtn);

  // If speech-to-speech mode is on, auto-speak
  if (Voice._s2sActive) {
    setTimeout(() => Voice.speak(text, 0.92, 1.0), 300);
    // After speaking, re-trigger listening loop
    const utt = Voice.synth?.speaking;
    setTimeout(() => { if (Voice._s2sActive) Voice._doS2SLoop(); }, 1800);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 7 — TUTOR PAGE UI INJECTION
// Add mic button, language indicator, SHS subject pill to the tutor chat row
// ─────────────────────────────────────────────────────────────────────────────

function injectTutorVoiceUI() {
  const chatRow = document.querySelector('#pg-tutor .chat-row');
  if (!chatRow || document.getElementById('v5-mic-btn')) return;

  const chatInput = document.getElementById('chat-input');

  // Mic button
  const micBtn = document.createElement('button');
  micBtn.id = 'v5-mic-btn';
  micBtn.type = 'button';
  micBtn.textContent = '🎤';
  micBtn.title = 'Speak your question';
  micBtn.style.cssText = 'padding:0 13px;border-radius:var(--r);border:1px solid var(--border2);background:var(--card);cursor:pointer;font-size:17px;flex-shrink:0;min-width:44px;min-height:44px;';
  micBtn.onclick = () => {
    if (!Voice.SpeechRec) {
      if (window.toast) window.toast('Voice input not supported in this browser. Try Chrome.', '🎤', 'gold', 3000);
      return;
    }
    Voice.startListening(chatInput, micBtn, (t) => {
      if (t) { chatInput.value = t; window.sendChat(); }
    });
  };
  chatRow.insertBefore(micBtn, chatRow.firstChild);

  // Speech-to-Speech toggle button (beside Send)
  const s2sBtn = document.createElement('button');
  s2sBtn.id = 'v5-s2s-btn';
  s2sBtn.type = 'button';
  s2sBtn.textContent = '🗣️';
  s2sBtn.title = 'Speech-to-Speech mode (tap, speak, AI answers aloud)';
  s2sBtn.style.cssText = 'padding:0 10px;border-radius:var(--r);border:1px solid var(--border2);background:var(--card);cursor:pointer;font-size:15px;flex-shrink:0;min-width:44px;min-height:44px;';
  s2sBtn.onclick = () => Voice.toggleS2S();
  chatRow.appendChild(s2sBtn);
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 8 — GLOBAL LANGUAGE SELECTOR BAR
// A compact sticky pill shown at the top of tutor + quiz pages
// ─────────────────────────────────────────────────────────────────────────────

function buildLangBar(pageEl) {
  if (!pageEl || pageEl.querySelector('.v5-lang-bar')) return;

  const bar = document.createElement('div');
  bar.className = 'v5-lang-bar';
  bar.style.cssText = 'display:flex;align-items:center;gap:8px;padding:.5rem 1.2rem;background:var(--bg2);border-bottom:1px solid var(--border);flex-wrap:wrap;';

  // Language label
  const lbl = document.createElement('span');
  lbl.style.cssText = 'font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;flex-shrink:0;';
  lbl.textContent = '🌍 Language:';

  // Select
  const sel = document.createElement('select');
  sel.className = 'v5-lang-select';
  sel.style.cssText = 'font-size:12px;padding:4px 8px;border-radius:8px;background:var(--card);border:1px solid var(--border2);color:var(--text);font-family:var(--fb);cursor:pointer;min-height:36px;';
  Object.entries(LANGUAGES).forEach(([key, info]) => {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = info.flag + ' ' + info.nativeName;
    sel.appendChild(opt);
  });
  sel.value = V5Lang.get();
  sel.onchange = () => V5Lang.set(sel.value);

  bar.appendChild(lbl);
  bar.appendChild(sel);

  // SHS Programme button (only on quiz + wassce pages)
  if (pageEl.id === 'pg-quiz' || pageEl.id === 'pg-wassce') {
    const progBtn = document.createElement('button');
    progBtn.type = 'button';
    progBtn.style.cssText = 'margin-left:auto;padding:5px 12px;border-radius:8px;border:1px solid var(--border2);background:var(--card);font-size:12px;cursor:pointer;color:var(--text);font-weight:600;min-height:36px;';
    const prog = SHSSelector.getProgram();
    progBtn.textContent = prog ? (SHS_PROGRAMS[prog].emoji + ' ' + SHS_PROGRAMS[prog].label) : '📚 Set Programme';
    progBtn.title = 'Select your SHS programme to filter subjects';
    progBtn.onclick = () => { SHSSelector.openSheet(); };
    bar.appendChild(progBtn);
  }

  // Insert the bar just after the tnav
  const tnav = pageEl.querySelector('.tnav');
  if (tnav && tnav.nextSibling) {
    pageEl.insertBefore(bar, tnav.nextSibling);
  } else {
    pageEl.insertBefore(bar, pageEl.firstChild);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 9 — SETTINGS PAGE EXTENSION
// Add language preference + voice settings card to the settings page
// ─────────────────────────────────────────────────────────────────────────────

function injectSettingsPanel() {
  const pg = document.getElementById('pg-settings');
  if (!pg || document.getElementById('v5-settings-panel')) return;

  const wrap = pg.querySelector('.wrap');
  if (!wrap) return;

  const panel = document.createElement('div');
  panel.id = 'v5-settings-panel';
  panel.className = 'card cp';
  panel.style.marginBottom = '1rem';
  panel.innerHTML = `
    <div style="font-family:var(--fh);font-size:1rem;font-weight:800;margin-bottom:1rem;">🌍 Language & Voice</div>

    <div class="fd">
      <label class="fl">Display & Tutor Language</label>
      <select class="v5-lang-select" style="font-size:14px;padding:10px 12px;border-radius:var(--r);background:var(--card);border:1px solid var(--border2);color:var(--text);width:100%;">
        ${Object.entries(LANGUAGES).map(([k,v]) => `<option value="${k}">${v.flag} ${v.nativeName}</option>`).join('')}
      </select>
      <div style="font-size:11.5px;color:var(--muted);margin-top:5px;">The AI Tutor will respond in this language where possible.</div>
    </div>

    <div class="fd">
      <label class="fl">SHS Programme</label>
      <button type="button" id="v5-prog-settings-btn" class="btn bs bfull" onclick="if(window.SHSSelector)window.SHSSelector.openSheet()">
        ${SHSSelector.getProgram() ? (SHS_PROGRAMS[SHSSelector.getProgram()].emoji + ' ' + SHS_PROGRAMS[SHSSelector.getProgram()].label) : '📚 Select Your Programme'}
      </button>
      <div style="font-size:11.5px;color:var(--muted);margin-top:5px;">Loads WASSCE-aligned subjects for your programme into Quiz and WASSCE Prep.</div>
    </div>

    <div style="font-size:12px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:.7rem;">Voice Features</div>
    <div class="tog-row">
      <span>🔊 Text-to-Speech (listen to AI answers)</span>
      <label class="tog"><input type="checkbox" id="v5-tts-toggle" ${Voice.synth ? 'checked' : ''} ${!Voice.synth ? 'disabled' : ''}><span class="tog-sl"></span></label>
    </div>
    <div class="tog-row">
      <span>🎤 Speech-to-Text (speak your questions)</span>
      <label class="tog"><input type="checkbox" id="v5-stt-toggle" ${Voice.SpeechRec ? 'checked' : ''} ${!Voice.SpeechRec ? 'disabled' : ''}><span class="tog-sl"></span></label>
    </div>
    ${!Voice.synth ? '<div style="font-size:12px;color:var(--muted);margin-top:4px;">⚠️ Text-to-speech not supported in your browser.</div>' : ''}
    ${!Voice.SpeechRec ? '<div style="font-size:12px;color:var(--muted);">⚠️ Speech input not supported. Try Chrome or Edge.</div>' : ''}
  `;

  // Insert before first card in settings
  const firstCard = wrap.querySelector('.card');
  if (firstCard) wrap.insertBefore(panel, firstCard);
  else wrap.appendChild(panel);

  // Sync language select in settings
  const settingsSel = panel.querySelector('.v5-lang-select');
  if (settingsSel) {
    settingsSel.value = V5Lang.get();
    settingsSel.onchange = () => V5Lang.set(settingsSel.value);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 10 — QUIZ PAGE: add listen button to feedback after each answer
// Wraps recordAnswer to TTS-speak correct answers when TTS is on
// ─────────────────────────────────────────────────────────────────────────────

const _origRecordAnswer = window.recordAnswer;
if (typeof _origRecordAnswer === 'function') {
  window.recordAnswer = function(correct, q, customFb) {
    _origRecordAnswer(correct, q, customFb);

    // TTS + listen button — run after Optimize wrapper's 180ms scroll has settled
    setTimeout(() => {
      const fbEl = document.getElementById('q-feedback');
      if (!fbEl || !fbEl.innerHTML) return;
      if (!fbEl.querySelector('.v5-listen-btn')) {
        const listenBtn = document.createElement('button');
        listenBtn.className = 'v5-listen-btn';
        listenBtn.type = 'button';
        listenBtn.textContent = '🔊 Listen';
        listenBtn.style.cssText = 'margin-top:8px;display:inline-flex;align-items:center;gap:5px;background:var(--card);border:1px solid var(--border2);border-radius:8px;padding:5px 12px;font-size:12px;cursor:pointer;color:var(--muted);';
        listenBtn.onclick = () => { const t = fbEl.innerText||fbEl.textContent||''; Voice.speakBubble(t, listenBtn); };
        fbEl.appendChild(listenBtn);
      }
      const ttsToggle = document.getElementById('v5-tts-toggle');
      if (ttsToggle && ttsToggle.checked && Voice.synth) {
        Voice.speak(fbEl.innerText || fbEl.textContent || '', 0.9, 1.0);
      }
    }, 420);
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 11 — goPage HOOK
// Inject UI components when pages become active
// ─────────────────────────────────────────────────────────────────────────────

const _v5OrigGoPage = window.goPage;
window.goPage = function(name) {
  _v5OrigGoPage(name);

  // Run injections after a short tick so the page is visible
  setTimeout(() => {
    if (name === 'tutor') {
      buildLangBar(document.getElementById('pg-tutor'));
      injectTutorVoiceUI();
    }
    if (name === 'quiz') {
      buildLangBar(document.getElementById('pg-quiz'));
      SHSSelector.patchQuizSubjectDropdown();
    }
    if (name === 'wassce') {
      buildLangBar(document.getElementById('pg-wassce'));
      SHSSelector.patchWASSCESubjectDropdown();
    }
    if (name === 'settings') {
      injectSettingsPanel();
    }
  }, 60);
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 12 — INIT ON LOAD
// ─────────────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function() {
  // Pre-inject on pages that might already be active
  ['pg-tutor','pg-quiz','pg-wassce','pg-settings'].forEach(id => {
    const el = document.getElementById(id);
    if (el && (el.style.display !== 'none' && el.classList.contains('active'))) {
      buildLangBar(el);
    }
  });

  // Sync existing tutor-lang selector with V5Lang store
  const tutorLangSel = document.getElementById('tutor-lang');
  if (tutorLangSel) {
    tutorLangSel.value = V5Lang.get();
    tutorLangSel.addEventListener('change', () => V5Lang.set(tutorLangSel.value));
  }

  // Preload SHS dropdown patches (quiz might be open already)
  SHSSelector.patchQuizSubjectDropdown();
  SHSSelector.patchWASSCESubjectDropdown();

  // Expose SHSSelector globally so onclick attrs in injected HTML can reach it
  window.SHSSelector = SHSSelector;
  window.V5Lang = V5Lang;
  window.Voice = Voice;
});

// Preload voices list (Chrome lazy-loads it)
if (window.speechSynthesis) {
  speechSynthesis.getVoices(); // triggers load
  speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();
}

console.log('%cNyansa AI v5 Extension loaded — SHS Subjects ✓ | 7 Languages ✓ | Voice ✓', 'color:#d4960a;font-weight:700;font-size:13px;');

})(); // end NyansaV5


// Wait until NyansaV5 IIFE's DOMContentLoaded has fired and set globals
document.addEventListener('DOMContentLoaded', function v5Supplemental() {

  // ── S13: Patch buildSimplePrompt & buildSocraticPrompt with language ──────
  ['buildSimplePrompt', 'buildSocraticPrompt'].forEach(function(fnName) {
    if (typeof window[fnName] !== 'function') return;
    var _orig = window[fnName];
    window[fnName] = function(topic, lang, ageGroup) {
      var base = _orig(topic, lang, ageGroup);
      var activeLang = (window.V5Lang ? window.V5Lang.get() : null) || lang || 'English';
      if (activeLang === 'English') return base;
      var inj = '\n\nLANGUAGE: Respond primarily in ' + activeLang + '. For technical terms, add English in parentheses.';
      return base.includes('LANGUAGE:') ? base : base + inj;
    };
  });

  // ── S14: Wrap generateWASSCE for subject-topic + language enrichment ──────
  if (typeof window.generateWASSCE === 'function' && !window._v5WasscePatched) {
    window._v5WasscePatched = true;
    var _origGW = window.generateWASSCE;
    window.generateWASSCE = async function() {
      if (window.SHSSelector) window.SHSSelector.patchWASSCESubjectDropdown();
      window._v5WassceLang    = window.V5Lang ? window.V5Lang.get() : 'English';
      window._v5WassceSubjKey = window.SHSSelector ? window.SHSSelector.getSubject() : null;
      return _origGW.apply(this, arguments);
    };
  }

  // ── S14b: Enrich ai() calls that are WASSCE exam prompts ─────────────────
  // NyansaV5 may already wrap window.ai via its own patch above;
  // here we ensure the enrichment is active even if it ran before DOMContentLoaded.
  if (!window._v5AiPatched) {
    window._v5AiPatched = true;
    var _origAI2 = window.ai;
    window.ai = async function(prompt, maxT, fallback) {
      var injected = prompt;
      if (typeof prompt === 'string' && prompt.includes('WASSCE') && (prompt.includes('examiner') || prompt.includes('past paper'))) {
        var lang2 = window._v5WassceLang || (window.V5Lang ? window.V5Lang.get() : 'English');
        var subjKey2 = window._v5WassceSubjKey;
        var sData = subjKey2 ? (typeof window.SHS_SUBJECTS === 'function' ? window.SHS_SUBJECTS(subjKey2) : null) : null;
        if (sData) {
          injected += '\n\nSUBJECT DETAIL: ' + sData.label + '. Key WASSCE topics: ' + sData.topics.join(', ') + '. ' + sData.waecTip;
        }
        if (lang2 && lang2 !== 'English') {
          injected += '\n\nLANGUAGE NOTE: Add "📖 In ' + lang2 + ':\" section after the English content, translating the key concept into ' + lang2 + '.';
        }
      }
      return _origAI2(injected, maxT, fallback);
    };
    // Expose SHS_SUBJECTS to window so the patch above can reach it
    // (it's defined inside the NyansaV5 IIFE — we re-expose it here)
    if (window.SHSSelector) {
      // Simple lookup function — works on all browsers including older Android WebView
      window.SHS_SUBJECTS = function(key) {
        return window.SHSSelector ? window.SHSSelector.getSubjectData(key) : null;
      };
    }
  }

  // ── S15: SHS onboarding nudge on applySession ─────────────────────────────
  if (typeof window.applySession === 'function' && !window._v5SessionPatched) {
    window._v5SessionPatched = true;
    var _origAS = window.applySession;
    window.applySession = function() {
      _origAS.apply(this, arguments);
      setTimeout(function() {
        if (window.SHSSelector && window.SHSSelector.getProgram()) return;
        var age = (typeof window.getLearnerAge === 'function') ? window.getLearnerAge() : 16;
        if (age < 15) return;
        if (document.getElementById('v5-prog-nudge')) return;
        var nudge = document.createElement('div');
        nudge.id = 'v5-prog-nudge';
        nudge.style.cssText = 'position:fixed;bottom:72px;left:12px;right:12px;z-index:8000;background:var(--card);border:1.5px solid var(--gold);border-radius:14px;padding:12px 16px;display:flex;align-items:center;gap:10px;box-shadow:0 4px 20px rgba(0,0,0,.12);';
        nudge.innerHTML = '<span style="font-size:22px;">📚</span><div style="flex:1;"><div style="font-family:var(--fh);font-size:13px;font-weight:800;color:var(--text);">Set your SHS Programme</div><div style="font-size:11.5px;color:var(--muted);">Load WASSCE subjects for Science, Arts, Business…</div></div><button type="button" onclick="if(window.SHSSelector)window.SHSSelector.openSheet();var n=document.getElementById(\'v5-prog-nudge\');if(n)n.remove();" style="background:var(--gold);color:#fff;border:none;border-radius:8px;padding:7px 14px;font-size:12px;font-weight:700;cursor:pointer;flex-shrink:0;">Set →</button><button type="button" onclick="var n=document.getElementById(\'v5-prog-nudge\');if(n)n.remove();" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--muted);padding:4px;flex-shrink:0;">✕</button>';
        document.body.appendChild(nudge);
        setTimeout(function() { var n = document.getElementById('v5-prog-nudge'); if (n) n.remove(); }, 12000);
      }, 2500);
    };
  }

  // ── S16: CSS for supplemental UI elements ────────────────────────────────
  if (!document.getElementById('v5-supp-styles')) {
    var s = document.createElement('style');
    s.id = 'v5-supp-styles';
    s.textContent = [
      '.v5-lang-bar{flex-shrink:0;}',
      '#v5-mic-btn.listening{background:#ce1126!important;color:#fff!important;animation:micPulse 1s ease infinite;}',
      '@keyframes micPulse{0%,100%{box-shadow:0 0 0 0 rgba(206,17,38,.4);}50%{box-shadow:0 0 0 6px rgba(206,17,38,0);}}',
      '#v5-s2s-btn.s2s-on{background:var(--gold)!important;color:#fff!important;animation:s2sPulse 1.4s ease infinite;}',
      '@keyframes s2sPulse{0%,100%{box-shadow:0 0 0 0 rgba(212,150,10,.4);}50%{box-shadow:0 0 0 7px rgba(212,150,10,0);}}',
      '.v5-listen-btn:hover{background:var(--bg3)!important;color:var(--text)!important;}',
      '#v5-prog-nudge{animation:nudgeIn .35s cubic-bezier(.34,1.56,.64,1);}',
      '@keyframes nudgeIn{from{transform:translateY(20px);opacity:0;}to{transform:none;opacity:1;}}',
    ].join('\n');
    document.head.appendChild(s);
  }

  // ── S17: Wire language into mastery tracking ──────────────────────────────
  if (typeof window.trackTopicStudied === 'function' && !window._v5TrackPatched) {
    window._v5TrackPatched = true;
    var _origTrack = window.trackTopicStudied;
    window.trackTopicStudied = function(topic, lang, ageGroup) {
      var activeLang = window.V5Lang ? window.V5Lang.get() : (lang || 'English');
      _origTrack(topic, activeLang, ageGroup);
    };
  }

  // ── S18: Update SHS programme button label after programme is set ─────────
  // Monkey-patch SHSSelector.save() to refresh any programme buttons in settings
  if (window.SHSSelector && typeof window.SHSSelector.save === 'function') {
    var _origSave = window.SHSSelector.save.bind(window.SHSSelector);
    window.SHSSelector.save = function() {
      _origSave();
      // Refresh settings page programme button if visible
      var btn = document.getElementById('v5-prog-settings-btn');
      if (btn) {
        var p = this.getProgram();
        btn.textContent = p ? ('✅ ' + this.subjectLabel(p) || 'Programme Set') : '📚 Select Your Programme';
      }
    };
  }

  // ── Final: ensure SHS dropdowns are populated if quiz/wassce already open ─
  if (window.SHSSelector) {
    window.SHSSelector.patchQuizSubjectDropdown();
    window.SHSSelector.patchWASSCESubjectDropdown();
  }

  console.log('%cNyansa AI v5 Supplemental ready ✓', 'color:#006b3f;font-weight:700;');
});
