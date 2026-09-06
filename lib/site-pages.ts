export const SITE_URL = "https://www.arkansashvacconnect.com";

export type PageSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type SitePage = {
  path: string;
  title: string;
  metaTitle: string;
  description: string;
  eyebrow: string;
  intro: string;
  sections: PageSection[];
  faq?: { question: string; answer: string }[];
  related: { href: string; label: string }[];
  flow?: "repair" | "replacement";
  updated?: string;
  type?: "service" | "location" | "guide" | "information";
  noindex?: boolean;
};

const request = { href: "/#request-help", label: "Start a homeowner HVAC request" };
const repair = { href: "/ac-repair", label: "AC repair request options" };
const replace = { href: "/hvac-replacement", label: "HVAC replacement guidance" };

export const pages: SitePage[] = [
  {
    path: "/ac-repair", type: "service", eyebrow: "Cooling help · Central Arkansas", flow: "repair",
    title: "Find AC Repair Help in Central Arkansas",
    metaTitle: "AC Repair Help in Central Arkansas | Homeowner Referral",
    description: "Describe your cooling problem and request a connection with a participating Central Arkansas HVAC professional. Independent referral platform; not a contractor.",
    intro: "If your air conditioner is not cooling, blowing warm air, freezing, or making a new noise, tell us what is happening. We review homeowner requests and may connect an appropriate request with a participating HVAC professional.",
    sections: [
      { heading: "Common cooling problems", bullets: ["Air from the vents feels warm or airflow is weak", "The system runs for long periods without reaching the thermostat setting", "Ice appears on refrigerant lines or the indoor coil area", "The system will not start, cycles repeatedly, leaks water, or makes an unfamiliar sound"] },
      { heading: "Before you request help", paragraphs: ["Confirm that the thermostat is set to Cool, check whether the filter is visibly dirty, and make sure supply vents are open. Do not open equipment panels or attempt electrical or refrigerant work."], bullets: ["If you smell burning, see smoke, or suspect an electrical hazard, turn the system off if it is safe and contact emergency services when appropriate.", "If the system is frozen, turn cooling off. Continuing to run it can compound the problem."] },
      { heading: "What happens after you submit", paragraphs: ["Arkansas HVAC Connect reviews the service type, location, timing, and contact details. A request may then be shared with a participating professional who independently decides whether to contact you. We do not perform, schedule, price, or guarantee HVAC work."] },
    ],
    faq: [
      { question: "Does Arkansas HVAC Connect repair air conditioners?", answer: "No. Arkansas HVAC Connect is an independent homeowner referral platform, not an HVAC contractor. We review requests and may share them with participating HVAC professionals." },
      { question: "Is a same-day appointment guaranteed?", answer: "No. Availability and response times depend on independent participating professionals. For an urgent safety threat, contact the appropriate emergency service." },
      { question: "What information should I include?", answer: "Include your city and ZIP code, what the system is doing, whether it is running, how urgent the issue is, and a reliable way to contact you." },
    ], related: [{ href: "/guides/ac-not-cooling", label: "Troubleshoot an AC that is not cooling" }, { href: "/guides/ac-blowing-warm-air", label: "Why an AC may blow warm air" }, request],
  },
  {
    path: "/hvac-replacement", type: "service", eyebrow: "Planning a new system", flow: "replacement",
    title: "HVAC Replacement Help for Central Arkansas Homeowners",
    metaTitle: "HVAC Replacement Help in Central Arkansas | Compare Options",
    description: "Understand HVAC replacement considerations and request an estimate connection with a participating Central Arkansas HVAC professional.",
    intro: "A replacement decision should account for the home's needs, the condition of the existing equipment, comfort problems, and the complete scope—not just a headline equipment price.",
    sections: [
      { heading: "What affects a replacement recommendation", bullets: ["A load calculation and the home's size, layout, insulation, windows, and air leakage", "Condition and compatibility of indoor and outdoor equipment, ductwork, electrical service, drainage, and controls", "Efficiency level, equipment type, available rebates or tax incentives, warranties, and installation scope"] },
      { heading: "Repair or replace?", paragraphs: ["Age alone does not decide the answer. Ask for the diagnosis, repair scope, parts availability, warranty coverage, recent repair history, comfort performance, and the expected useful value of the repair. A second estimate can be useful for a major investment."] },
      { heading: "Use the request form effectively", paragraphs: ["Share the system type and approximate age if known, why you are considering replacement, your desired timeline, and any rooms that are difficult to heat or cool. The professional—not Arkansas HVAC Connect—provides recommendations, pricing, and contract terms."] },
    ],
    faq: [
      { question: "Does Arkansas HVAC Connect sell or install HVAC systems?", answer: "No. We are an independent referral platform. Any estimate, recommendation, sale, or installation is offered by an independent participating HVAC professional." },
      { question: "Should I get more than one estimate?", answer: "For a major replacement, comparing written scopes can help. Compare equipment, sizing approach, duct or electrical work, permits when applicable, warranties, and what is excluded—not only the total." },
    ], related: [{ href: "/guides/hvac-repair-vs-replacement", label: "Repair versus replacement decision guide" }, { href: "/guides/hvac-replacement-cost-central-arkansas", label: "Replacement cost considerations" }, request],
  },
  {
    path: "/emergency-ac-repair", type: "service", eyebrow: "Urgent cooling requests", flow: "repair",
    title: "Request Help for an Urgent AC Problem",
    metaTitle: "Urgent AC Repair Requests in Central Arkansas",
    description: "Send an urgent Central Arkansas cooling request for possible connection with a participating HVAC professional. Availability is not guaranteed.",
    intro: "When cooling fails during hot weather, provide clear details about the system and household so we can review the request. This is a referral service, not an emergency dispatch service, and same-day availability is not guaranteed.",
    sections: [
      { heading: "Handle safety first", bullets: ["Call 911 for fire, smoke, carbon-monoxide alarms, or an immediate threat to life or property.", "Leave the home and contact the gas utility or emergency services if you suspect a gas leak.", "People at greater risk from heat may need to relocate to a safe, cool place rather than wait for HVAC availability."] },
      { heading: "Details that help qualify a request", bullets: ["Whether the equipment runs and whether any air reaches the vents", "Any ice, water, odor, noise, breaker trip, or thermostat message", "Your city and ZIP code, best contact method, and requested timing"] },
    ], related: [{ href: "/guides/what-to-check-when-ac-stops-working", label: "Safe checks when AC stops" }, repair, request],
  },
  {
    path: "/heating-repair", type: "service", eyebrow: "Heating help · Central Arkansas", flow: "repair",
    title: "Find Heating Repair Help in Central Arkansas",
    metaTitle: "Heating Repair Help in Central Arkansas | Referral Service",
    description: "Request a connection for a Central Arkansas furnace or heat-pump heating issue. Arkansas HVAC Connect is an independent referral platform.",
    intro: "No heat, short cycling, weak airflow, unusual noises, and heat-pump backup-heat concerns can require a professional diagnosis. Tell us what you observe without opening equipment or bypassing safety controls.",
    sections: [
      { heading: "Safe information to gather", bullets: ["Thermostat setting and displayed messages", "Whether the system starts and whether airflow is present", "Equipment type if known, approximate age, and when the issue began"] },
      { heading: "Gas and carbon-monoxide safety", paragraphs: ["If a carbon-monoxide alarm sounds, or you smell gas or suspect combustion fumes, leave the area and follow instructions from emergency services and your gas utility. The website request form is not an emergency channel."] },
    ], related: [{ href: "/heat-pumps", label: "Heat-pump information" }, request],
  },
  {
    path: "/heat-pumps", type: "service", eyebrow: "Heat pumps in Arkansas", flow: "replacement",
    title: "Heat Pump Help for Central Arkansas Homes",
    metaTitle: "Heat Pumps in Arkansas | Repair & Replacement Requests",
    description: "Learn how heat pumps heat and cool Arkansas homes, then request repair or replacement help from a participating professional.",
    intro: "A heat pump moves heat rather than creating it by combustion and can provide both cooling and heating. System design, sizing, ductwork, controls, and backup heat strategy all affect comfort and operating cost.",
    sections: [
      { heading: "Questions to ask about a heat pump", bullets: ["How was the recommended capacity determined?", "What efficiency ratings apply to the matched indoor and outdoor system?", "How will auxiliary or backup heat operate in colder weather?", "Does the proposal include needed duct, electrical, drainage, thermostat, permit, and commissioning work?"] },
      { heading: "Normal defrost or a problem?", paragraphs: ["An outdoor heat-pump unit may periodically enter a defrost cycle in heating mode. Persistent icing, poor indoor comfort, unusual noises, or frequent reliance on auxiliary heat deserves professional evaluation."] },
      { heading: "Independent information", paragraphs: ["The U.S. Department of Energy provides a homeowner overview of heat-pump systems and efficiency considerations. Use it to prepare questions, then ask a qualified professional to evaluate your home."], bullets: ["energy.gov/energysaver/heat-pump-systems"] },
    ], related: [{ href: "/guides/heat-pumps-in-arkansas", label: "Central Arkansas heat-pump guide" }, replace, request],
  },
];

const locationData = [
  ["little-rock", "Little Rock", "Pulaski County", "From older neighborhoods with varied duct layouts to newer homes with modern heat pumps, a useful request describes the house and symptoms rather than assuming the diagnosis.", ["Hillcrest and Heights-area older homes may have additions or duct constraints worth mentioning", "West and southwest Little Rock homeowners should note rooms with persistent hot or cold spots", "Provide the property ZIP code so the request can be reviewed for service-area fit"]],
  ["north-little-rock", "North Little Rock", "Pulaski County", "North Little Rock requests can involve central AC, gas heat, electric systems, or heat pumps. Equipment type and the exact symptom help a professional assess fit before making contact.", ["Mention whether the issue affects the whole home or one area", "Include visible icing, drainage, odor, or unusual-noise details", "For properties outside the city core, provide the ZIP code rather than relying on the city label alone"]],
  ["conway", "Conway", "Faulkner County", "Conway homeowners can use one request for a current repair problem or planned system replacement. Include timing and system age when known so the request reaches an appropriate path.", ["Describe performance during the hottest part of the day", "Note additions, upstairs comfort problems, or recent insulation and window changes", "For replacement planning, explain whether the current system is operable"]],
  ["benton", "Benton", "Saline County", "Benton homeowners can describe cooling, heating, airflow, thermostat, or replacement needs through the existing request flow. Arkansas HVAC Connect reviews the request but does not schedule the job.", ["Include your ZIP code and whether the home is within Benton city limits", "Mention recurring repairs or rooms that remain uncomfortable", "Separate urgent loss of cooling from a planned efficiency upgrade"]],
  ["bryant", "Bryant", "Saline County", "Bryant homeowners seeking repair help or replacement estimates can start by documenting the equipment behavior, property location, and desired timing.", ["Say whether the system starts, runs continuously, or cycles frequently", "Mention the approximate equipment age and recent repair history if known", "Use the description field for access or scheduling context"]],
] as const;

for (const [slug, city, county, intro, bullets] of locationData) pages.push({
  path: `/${slug}`, type: "location", eyebrow: `${county} homeowner requests`, flow: "repair",
  title: `HVAC Help for ${city} Homeowners`,
  metaTitle: `${city} HVAC Help | Homeowner Referral Service`,
  description: `Request AC repair, heating, heat-pump, or HVAC replacement help in ${city}, Arkansas through an independent homeowner referral platform.`,
  intro,
  sections: [
    { heading: `Repair and replacement requests in ${city}`, paragraphs: [`Start with the symptom and goal. We may share a qualified ${city} homeowner request with a participating HVAC professional. That independent business decides availability, diagnosis, recommendations, pricing, and whether to accept any work.`] },
    { heading: "Make your request more useful", bullets: [...bullets] },
    { heading: "No contractor claims", paragraphs: ["Arkansas HVAC Connect does not perform HVAC work, employ or dispatch technicians, quote jobs, hold itself out as a licensed HVAC contractor, or guarantee service. It provides a request and referral path for homeowners."] },
  ],
  faq: [{ question: `Does Arkansas HVAC Connect provide HVAC service in ${city}?`, answer: `No. It is an independent referral platform. A ${city} request may be shared with a participating HVAC professional, subject to fit and availability.` }, { question: "Can I request either repair or replacement help?", answer: "Yes. Choose the path that matches your current need and provide enough detail for the request to be reviewed." }],
  related: [repair, replace, request],
});

const guideData: Array<[string,string,string,string,PageSection[],SitePage["faq"],SitePage["related"]]> = [
  ["ac-not-cooling", "AC Running but Not Cooling? Safe Checks Before Requesting Help", "AC Not Cooling in Arkansas? Safe Homeowner Checks", "Use this Central Arkansas homeowner checklist when the AC runs but does not cool. Learn safe checks, warning signs, and when to request professional help.", [
    { heading: "Start with thermostat and airflow", bullets: ["Set the thermostat to Cool and below the measured room temperature.", "Replace a visibly dirty filter with the correct size and airflow direction.", "Confirm supply registers are open and return grilles are not blocked.", "Look for an obvious thermostat alert or loss of power without removing equipment panels."] },
    { heading: "Check the outdoor unit from a safe distance", paragraphs: ["Remove loose leaves or objects blocking normal airflow around the unit, but do not open it, spray electrical components, or reach through its guard. A silent outdoor unit while the indoor fan runs can have several causes and needs diagnosis."] },
    { heading: "Stop if you see ice", paragraphs: ["Ice can result from restricted airflow or other faults. Turn cooling off and do not chip ice from the equipment. Thawing does not fix the underlying cause; request an evaluation if icing occurs."] },
    { heading: "When a professional evaluation makes sense", bullets: ["The system still produces warm air after basic settings and filter checks", "Cooling performance has declined or the system runs continuously", "Ice, leaking water, breaker trips, burning odors, or unfamiliar sounds occur"] },
  ], [{ question: "Should I keep lowering the thermostat?", answer: "No. A much lower setting will not make a malfunctioning system cool faster and may encourage longer operation." }, { question: "Can I add refrigerant myself?", answer: "No. Refrigerant problems require trained, appropriately certified service personnel, and low charge can indicate a leak that needs diagnosis." }], [repair, { href: "/guides/ac-freezing-up", label: "Why an AC may freeze" }, request]],
  ["ac-blowing-warm-air", "Why Is My AC Blowing Warm Air?", "AC Blowing Warm Air in Arkansas: What to Check", "Learn common categories behind warm AC airflow, safe homeowner checks, and what details to provide when requesting HVAC repair help.", [
    { heading: "Rule out simple settings", bullets: ["Verify Cool mode rather than Fan-only mode", "Check the temperature setting and replace a visibly dirty filter", "Wait after a recent setting change; many systems include a short protective delay"] },
    { heading: "Warm air has multiple possible causes", paragraphs: ["Restricted airflow, an outdoor-unit problem, a frozen coil, controls, electrical faults, or a refrigerant-system issue can produce similar symptoms. Avoid assuming that refrigerant is the answer without a diagnosis."] },
    { heading: "Useful details for a repair request", bullets: ["Whether airflow is strong but warm or weak and warm", "Whether the outdoor equipment runs", "When the problem began and whether ice, water, odor, noise, or breaker trips appeared"] },
  ], undefined, [{ href: "/guides/ac-not-cooling", label: "Complete not-cooling checklist" }, repair, request]],
  ["ac-freezing-up", "Why an Air Conditioner Freezes Up", "AC Freezing Up? Safe Steps for Arkansas Homeowners", "See safe steps for visible AC ice, possible airflow-related causes, and when to request an HVAC professional in Central Arkansas.", [
    { heading: "Turn cooling off", paragraphs: ["Continuing to cool while ice is present can worsen icing and prevent meaningful diagnosis. Do not chip or scrape the ice. If safe, use the thermostat to turn cooling off and allow the equipment to thaw."] },
    { heading: "Check only homeowner-accessible items", bullets: ["Check whether the filter is dirty or incorrectly installed", "Make sure return grilles and supply registers are not blocked", "Notice whether the indoor fan is operating"] },
    { heading: "Why diagnosis matters", paragraphs: ["Airflow restrictions, blower problems, coil conditions, controls, and refrigerant-system faults are among the categories a professional may evaluate. Ice melting does not prove the problem is resolved."] },
  ], undefined, [repair, { href: "/guides/ac-running-constantly", label: "AC running constantly" }, request]],
  ["ac-running-constantly", "Why Your AC May Be Running Constantly", "AC Running Constantly in Arkansas? What It Can Mean", "Understand why an AC may run for long periods in Arkansas heat, what to observe, and when ongoing poor comfort warrants professional evaluation.", [
    { heading: "Long run time is not automatically a failure", paragraphs: ["On a very hot afternoon, a correctly operating system may run longer to offset the home's heat gain. The more important clues are whether indoor temperature remains reasonably stable, humidity feels controlled, and performance has changed from normal."] },
    { heading: "Check airflow and heat gain", bullets: ["Replace a dirty filter and keep returns and supplies clear", "Close exterior doors and windows and use blinds where direct sun is strong", "Record indoor and thermostat temperatures and the time of day performance declines"] },
    { heading: "Request an evaluation when", bullets: ["The home never approaches the thermostat setting", "Run time or energy use changed suddenly", "Airflow is weak, the coil ices, or the system cycles off on a breaker"] },
  ], undefined, [{ href: "/guides/ac-struggling-arkansas-summer", label: "Cooling during Arkansas summer heat" }, repair, request]],
  ["ac-struggling-arkansas-summer", "When AC Struggles During Arkansas Summer Heat", "AC Struggling in Arkansas Heat? Homeowner Guide", "Practical steps for Central Arkansas homeowners when AC struggles in summer heat, plus signs that call for professional HVAC evaluation.", [
    { heading: "Reduce avoidable load safely", bullets: ["Keep exterior doors and windows closed while cooling", "Use shades on sun-exposed windows and postpone major heat-producing activities when practical", "Keep filters, returns, and supply vents clear", "Avoid repeated large thermostat changes"] },
    { heading: "Document the pattern", paragraphs: ["Note outdoor conditions, indoor temperature, thermostat setting, run time, airflow, humidity, and whether performance recovers after sunset. This helps distinguish a one-time extreme condition from a persistent capacity or system problem."] },
    { heading: "Avoid quick conclusions about size", paragraphs: ["Poor performance can involve the equipment, ducts, controls, airflow, installation, maintenance, or the building envelope. Oversizing also creates comfort and humidity tradeoffs, so replacement sizing should be based on a proper load calculation rather than matching an old nameplate automatically."] },
  ], undefined, [{ href: "/little-rock", label: "HVAC requests in Little Rock" }, repair, request]],
  ["hvac-repair-vs-replacement", "HVAC Repair vs. Replacement: A Homeowner Decision Guide", "HVAC Repair vs Replacement in Central Arkansas", "Compare diagnosis, system condition, comfort, repair history, efficiency, scope, and written estimates before deciding whether to repair or replace HVAC equipment.", [
    { heading: "Begin with a documented diagnosis", paragraphs: ["Ask what failed, why the proposed work addresses it, what is covered by warranty, and whether other known conditions affect the repair. A system's age is context, not a diagnosis."] },
    { heading: "Compare the full decision", bullets: ["Current repair cost and likely remaining value", "Frequency and type of recent repairs", "Comfort, humidity, noise, and energy-performance concerns", "Parts availability and equipment compatibility", "Replacement scope, financing terms, warranties, and expected ownership horizon"] },
    { heading: "Get comparable replacement scopes", paragraphs: ["A useful written estimate identifies matched equipment, sizing method, efficiency ratings, duct or electrical changes, controls, drainage, permits when applicable, startup checks, warranty responsibilities, exclusions, and payment terms."] },
  ], undefined, [replace, { href: "/guides/signs-hvac-may-need-replacement", label: "Signs replacement may be worth evaluating" }, request]],
  ["hvac-replacement-cost-central-arkansas", "HVAC Replacement Cost Considerations in Central Arkansas", "Central Arkansas HVAC Replacement Cost Factors", "Learn what shapes an HVAC replacement estimate in Central Arkansas and how to compare written scopes without relying on misleading one-price claims.", [
    { heading: "Why there is no responsible one-price answer", paragraphs: ["The right equipment and installation scope depend on the home and existing system. We do not publish an invented local average or quote work. Participating professionals independently inspect, recommend, and price their services."] },
    { heading: "Common scope and cost variables", bullets: ["Heating and cooling load, system capacity, and matched equipment", "Efficiency level and equipment type", "Duct repairs or modifications, electrical work, gas or venting work, drainage, pad, controls, and filtration", "Access, removal, permits when applicable, labor, commissioning, and warranty terms"] },
    { heading: "Compare estimates line by line", paragraphs: ["Ask each bidder to clarify included model numbers, efficiency ratings, sizing approach, auxiliary heat when relevant, non-equipment work, exclusions, payment schedule, labor and manufacturer warranties, and responsibility for registration or permits."] },
    { heading: "Check current incentives independently", paragraphs: ["Programs and tax rules change. Verify current federal information through IRS.gov and Energy.gov and ask utilities about current programs; confirm eligibility with a qualified tax professional rather than relying on a sales claim."] },
  ], undefined, [replace, { href: "/guides/hvac-repair-vs-replacement", label: "Repair versus replacement" }, request]],
  ["signs-hvac-may-need-replacement", "Signs an HVAC System May Need Replacement Evaluation", "Signs Your HVAC May Need Replacement | Arkansas Guide", "Learn which recurring HVAC symptoms justify a replacement evaluation—and why no single sign automatically means a new system is required.", [
    { heading: "Patterns worth evaluating", bullets: ["Frequent or increasingly expensive repairs", "Persistent comfort or humidity problems despite appropriate maintenance and repairs", "Unavailable major parts or compatibility complications", "A failed major component combined with other poor-condition findings", "A planned renovation that substantially changes the home's heating and cooling load"] },
    { heading: "What is not proof by itself", paragraphs: ["Age, one high bill, one repair, or a sales rule of thumb does not by itself prove replacement is necessary. Weather, rates, thermostat behavior, ducts, envelope changes, and equipment faults all affect results."] },
    { heading: "Ask for evidence", paragraphs: ["Request the diagnosis, repair option when practical, load calculation for replacement, matched equipment details, complete scope, and warranty terms. Consider a second opinion for an expensive or unclear recommendation."] },
  ], undefined, [replace, { href: "/guides/hvac-replacement-cost-central-arkansas", label: "Replacement cost factors" }, request]],
  ["heat-pumps-in-arkansas", "Heat Pumps in Arkansas: A Homeowner Planning Guide", "Heat Pumps in Arkansas: Homeowner Planning Guide", "Explore heat-pump operation, sizing, backup heat, efficiency ratings, and estimate questions for Central Arkansas homes.", [
    { heading: "One system can heat and cool", paragraphs: ["Air-source heat pumps transfer heat between indoors and outdoors and reverse direction for heating and cooling. Available equipment and cold-weather performance vary, so the proposed matched system and design matter."] },
    { heading: "Arkansas planning questions", bullets: ["How will the system meet the home's calculated heating and cooling loads?", "When and how will auxiliary heat run?", "Are existing ducts appropriately sized and sealed?", "Which published efficiency ratings apply to the exact matched combination?", "What maintenance, filter, thermostat, and warranty requirements should the homeowner understand?"] },
    { heading: "Use authoritative references", paragraphs: ["For general education, review the U.S. Department of Energy's Energy Saver heat-pump overview and ENERGY STAR heat-pump guidance. A site-specific recommendation still requires an independent professional evaluation."], bullets: ["energy.gov/energysaver/heat-pump-systems", "energystar.gov/products/heat_pumps"] },
  ], undefined, [{ href: "/heat-pumps", label: "Request heat-pump help" }, replace, request]],
  ["what-to-check-when-ac-stops-working", "What to Check When Your AC Stops Working", "What to Check When AC Stops Working | Arkansas", "Follow a safe homeowner checklist when an AC stops working, recognize hazards, and gather useful details for a Central Arkansas repair request.", [
    { heading: "Five safe checks", bullets: ["Confirm the thermostat display is on, set to Cool, and set below room temperature", "Check the filter without opening a service panel", "Confirm vents and returns are open and unobstructed", "Look at the electrical panel for a visibly tripped breaker; do not repeatedly reset a breaker", "From a safe distance, observe whether the indoor fan and outdoor unit appear to run"] },
    { heading: "Stop and escalate hazards", paragraphs: ["Do not troubleshoot smoke, sparking, burning odors, damaged wiring, standing water near electrical equipment, or repeated breaker trips. Turn equipment off if that can be done safely and seek appropriate emergency or professional help."] },
    { heading: "Prepare a useful request", bullets: ["Record what runs, what does not, and when it changed", "Mention thermostat messages, ice, water, sounds, smells, and breaker behavior", "Provide the service ZIP code and whether anyone in the home has an urgent heat-related vulnerability"] },
  ], undefined, [repair, { href: "/emergency-ac-repair", label: "Urgent cooling request information" }, request]],
];

for (const [slug,title,metaTitle,description,sections,faq,related] of guideData) pages.push({
  path: `/guides/${slug}`, type: "guide", eyebrow: "Central Arkansas homeowner guide", title, metaTitle, description,
  intro: description, sections, faq, related, flow: slug.includes("replacement") ? "replacement" : "repair", updated: "September 6, 2026",
});

pages.push({
  path: "/guides", type: "information", eyebrow: "Homeowner resource center", title: "Central Arkansas HVAC Homeowner Guides", metaTitle: "HVAC Guides for Central Arkansas Homeowners", description: "Practical, safety-first HVAC troubleshooting and replacement planning guides for Central Arkansas homeowners.", intro: "Use these plain-language resources to understand symptoms, prepare questions, and decide when to request an independent professional evaluation.",
  sections: [{ heading: "Cooling troubleshooting", bullets: ["AC not cooling or blowing warm air", "Frozen equipment and constant operation", "Performance during intense summer heat"] }, { heading: "Replacement planning", bullets: ["Repair-versus-replacement questions", "Complete estimate and cost factors", "Heat-pump planning for Arkansas homes"] }], related: guideData.map(([slug,title]) => ({ href: `/guides/${slug}`, label: title })),
});

for (const page of [
  { path: "/how-it-works", title: "How Arkansas HVAC Connect Works", metaTitle: "How Our HVAC Referral Process Works", description: "Learn how Arkansas HVAC Connect reviews Central Arkansas homeowner HVAC requests and may share them with independent participating professionals.", eyebrow: "A clear referral process", intro: "Arkansas HVAC Connect gives homeowners a simple way to describe an HVAC need. We review requests for fit and may share them with an independent participating professional.", sections: [{ heading: "1. You submit a request", paragraphs: ["Choose repair or replacement and provide the service location, system details, timing, and contact information. Review the consent language before submitting."] }, { heading: "2. We review the information", paragraphs: ["We assess whether the request is complete and appears to fit the service area and request categories. Submission does not create an appointment or contractor relationship."] }, { heading: "3. A participating professional may contact you", paragraphs: ["When appropriate, information may be shared with an independent HVAC professional. That business—not Arkansas HVAC Connect—controls contact timing, availability, diagnosis, pricing, licensing, insurance, contracts, warranties, and the work itself."] }, { heading: "Homeowner responsibilities", bullets: ["Evaluate any professional and verify credentials appropriate to the proposed work", "Review written scope, pricing, warranties, and contract terms before authorizing work", "Use emergency services rather than this form for immediate threats to life or property"] }], related: [{ href: "/guides", label: "Browse homeowner guides" }, request], type: "information" as const },
  { path: "/contact", title: "Contact Arkansas HVAC Connect", metaTitle: "Contact Arkansas HVAC Connect", description: "Contact the Arkansas HVAC Connect homeowner referral platform or begin a Central Arkansas HVAC request.", eyebrow: "Contact", intro: "For a homeowner HVAC need, use the request form so we receive the service details needed for review. HVAC companies can use the partner application path.", sections: [{ heading: "Homeowner requests", paragraphs: ["Start a repair or replacement request through the secure form. Do not use the form for fires, gas leaks, carbon-monoxide alarms, or other emergencies."] }, { heading: "Partner inquiries", paragraphs: ["HVAC businesses can review the partner program and send an application. General partner inquiries may be sent to partners@arkansashvacconnect.com."] }], related: [request, { href: "/partners", label: "Information for HVAC companies" }], type: "information" as const },
  { path: "/privacy", title: "Privacy Policy", metaTitle: "Privacy Policy | Arkansas HVAC Connect", description: "How Arkansas HVAC Connect collects, uses, and shares homeowner request and website information.", eyebrow: "Last updated September 6, 2026", intro: "This policy explains information handling by Arkansas HVAC Connect. It should be read with the consent shown when a request is submitted.", sections: [{ heading: "Information we collect", paragraphs: ["We collect information you provide, such as contact details, property location, HVAC need, timing, homeowner status, and free-text descriptions. We may also collect request-page, referral, campaign, and technical data used to operate and understand the service."] }, { heading: "How information is used and shared", paragraphs: ["We use information to review, qualify, route, administer, protect, and improve requests and partner operations. A submitted request may be shared with participating HVAC professionals for the purpose described in the form. We may also use service providers that process data on our behalf and disclose information when legally required or needed to protect rights and safety."] }, { heading: "Choices and security", paragraphs: ["Do not submit information you do not want reviewed for this purpose. You may ask a professional who contacts you about its own privacy practices. No transmission or storage method is guaranteed completely secure."] }, { heading: "Contact", paragraphs: ["Privacy questions may be directed to partners@arkansashvacconnect.com. This email is not an HVAC dispatch channel."] }], related: [{ href: "/terms", label: "Website terms" }, { href: "/how-it-works", label: "How requests work" }], type: "information" as const, noindex: true },
  { path: "/terms", title: "Website Terms", metaTitle: "Website Terms | Arkansas HVAC Connect", description: "Terms governing use of the Arkansas HVAC Connect homeowner HVAC referral platform.", eyebrow: "Last updated September 6, 2026", intro: "By using this site, you acknowledge the platform role and limits described below.", sections: [{ heading: "Referral platform only", paragraphs: ["Arkansas HVAC Connect is not an HVAC contractor, does not employ or dispatch HVAC technicians, and does not perform, supervise, warrant, or guarantee HVAC services. It does not guarantee that a request will be accepted or that anyone will contact you."] }, { heading: "Independent professionals", paragraphs: ["Participating businesses are independent. Homeowners are responsible for evaluating any business, credentials, proposed diagnosis, estimate, agreement, financing, and completed work. Any service relationship is between the homeowner and that business."] }, { heading: "Request accuracy and consent", paragraphs: ["Submit accurate information that you are authorized to provide. By submitting, you agree to the consent presented in the request flow, including contact about the request and possible sharing with relevant participating professionals. Consent is not a condition of purchase."] }, { heading: "No emergency service or professional advice", paragraphs: ["The site does not provide emergency dispatch, remote diagnosis, engineering, legal, tax, or other professional advice. Contact appropriate emergency services for immediate hazards."] }], related: [{ href: "/privacy", label: "Privacy policy" }, { href: "/how-it-works", label: "How requests work" }], type: "information" as const, noindex: true },
]) pages.push(page);
export const pageMap = new Map(pages.map((page) => [page.path, page]));
