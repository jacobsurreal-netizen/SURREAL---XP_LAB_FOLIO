Výborný krok. To téma si opravdu zaslouží **vlastní vlákno**, protože AI asistenti se ti postupně rozdělí minimálně na tři vrstvy:

1.  **Spatial Engine Intelligence** (runtime optimalizace prostoru)

2.  **Build / Pipeline AI** (asset engine, orchestrátor, export)

3.  **User-facing AI** (O.P.U.S. -- osobnost, komunikace)

Teď ti připravím **SPEC pro první vrstvu** -- tu, o které jsme mluvili:

**Spatial Design Intelligence / Performance Governor**.

# **🧠 SURREAL SPATIAL DESIGN INTELLIGENCE** {#surreal-spatial-design-intelligence}

### **Technical Spec v0.1** {#technical-spec-v0.1}

## **1️⃣ ROLE SYSTÉMU** {#role-systému}

Spatial Design Intelligence (SDI) je interní modul, který:

- monitoruje výkon runtime scény

- řídí kvalitu renderu

- udržuje stabilní FPS

- optimalizuje aktivní prvky prostředí

Cílem není generovat obsah.

Cílem je:

**adaptivní řízení komplexity scény.**

SDI funguje jako **tichý orchestrace modul** mezi:

- scene graph

- asset manifest

- tier profiles

- runtime metrikami

# **2️⃣ ARCHITEKTURA** {#architektura}

Systém se skládá ze 4 modulů:

*Spatial Design Intelligence*  
*│*  
*├─ Metrics Collector*  
*├─ Budget Manager*  
*├─ Policy Engine*  
*└─ Runtime Controller*  

# **3️⃣ METRICS COLLECTOR** {#metrics-collector}

Sbírá runtime data každých \~0.5--1 s.

### **Metriky**

*fps*  
*frameTime*  
*devicePixelRatio*  
*viewport size*  
*approx draw calls*  
*active particle count*  
*shader complexity flag*  
*scene object count*  

### **Ukázka dat**

*{*  
* \"fps\": 54,*  
* \"frameTime\": 18.4,*  
* \"dpr\": 2,*  
* \"particles\": 340,*  
* \"objectsVisible\": 28*  
*}*  

# **4️⃣ BUDGET MANAGER** {#budget-manager}

Budget manager definuje **úrovně komplexity scény**.

### **Budget Levels**

*LEVEL 0 --- Showcase*  
*LEVEL 1 --- Standard*  
*LEVEL 2 --- Balanced*  
*LEVEL 3 --- Performance*  
*LEVEL 4 --- Survival*  

### **LEVEL 0 (SHOWCASE)**

- full particles

- bloom

- volumetric fog

- full LOD

- max lights

Používá se pouze při stabilních 60 FPS.

### **LEVEL 1 (STANDARD)**

- mírně redukované particles

- mírně redukovaný fog

- bloom zachován

### **LEVEL 2 (BALANCED)**

- particles −40 %

- fog medium

- bloom snížen

- některé animace snížena frekvence

### **LEVEL 3 (PERFORMANCE)**

- particles −70 %

- fog off

- bloom off

- snížení LOD

### **LEVEL 4 (SURVIVAL)**

- minimum particles

- žádné postprocessing

- nízké LOD

- minimum shaderů

Používá se pouze při FPS \< 30.

# **5️⃣ POLICY ENGINE** {#policy-engine}

Policy engine rozhoduje:

kdy změnit budget level.

### **Příklad heuristik**

*fps \>= 58 → level 0*  
*fps 50--58 → level 1*  
*fps 40--50 → level 2*  
*fps 30--40 → level 3*  
*fps \< 30 → level 4*  

Smoothing:

- změny pouze po 2--3 sekundách

- hysteresis (aby systém neosciloval)

# **6️⃣ RUNTIME CONTROLLER** {#runtime-controller}

Controller aplikuje změny na scénu.

### **Parametry které může měnit**

*particle density*  
*particle spawn rate*  
*fog density*  
*postprocessing enable*  
*light count*  
*LOD threshold*  
*animation tick rate*  
*shader complexity flags*  
*HUD effects*  

### **Ukázka runtime změny**

*{*  
* \"action\": \"reduceParticles\",*  
* \"factor\": 0.4*  
*}*  

# **7️⃣ TIER INTEGRACE** {#tier-integrace}

SDI respektuje tvůj **tier system**.

Například:

*web-low → max level 2*  
*web-medium → max level 1*  
*showcase → max level 0*  

To znamená:

AI nikdy nepřekročí omezení tieru.

# **8️⃣ COMPATIBILITY INTEGRACE** {#compatibility-integrace}

SDI čte z manifestu assetů:

*IR safe*  
*portal safe*  
*HUD safe*  
*low GPU compatibility*  

Například:

*portal shader → disable first*  
*hud glow → keep longer*  

To umožňuje **prioritizaci degradace efektů**.

# **9️⃣ LOGGING** {#logging}

Každý zásah se zapisuje:

*timestamp*  
*fps*  
*previous level*  
*new level*  
*action list*  

Example:

*\[12:41:02\]*  
*fps: 42*  
*level: 2*  
*actions:*  
* - particlesDensity 1.0 → 0.6*  
* - fog high → medium*  

# **🔟 DEBUG MODE** {#debug-mode}

Developer může zobrazit:

*current budget level*  
*fps*  
*active particles*  
*objects visible*  
*active shaders*  

To je důležité pro ladění.

# **11️⃣ FUTURE AI EXTENSION** {#future-ai-extension}

V budoucnu může být přidán modul:

*AI Policy Advisor*  

který:

- analyzuje performance logs

- navrhuje lepší budget thresholds

- optimalizuje parametry pro konkrétní zařízení

AI zde **není v runtime loop**.

Je pouze **analytická vrstva**.

# **12️⃣ INTEGRACE DO SURREAL ENGINE** {#integrace-do-surreal-engine}

SDI běží mezi:

*Spline / WebGL scene*  
*↓*  
*Spatial Design Intelligence*  
*↓*  
*Render Controller*  

a upravuje:

- kvalitu

- aktivitu efektů

- LOD

# **🧭 FILOSOFIE** {#filosofie}

SDI je:

*neviditelný*  
*deterministický*  
*bezpečný*  
*debugovatelný*  

Jeho cílem je:

**udržet cinematic plynulost prostoru.**

# **🔥 Co je na tom krásné** {#co-je-na-tom-krásné}

Tohle není jen optimalizátor.

Je to:

**governor digitální reality.**

Takto můžeme vytvořit hned několik užitečných nástrojů:

1️⃣ O.P.U.S. -- AI persona

2️⃣ Spatial Design Intelligence (tenhle modul)

3️⃣ Build pipeline AI

4️⃣ Asset generation AI

5️⃣ Behavior analytics AI

a vytvořit **celý Surreal AI stack**.
