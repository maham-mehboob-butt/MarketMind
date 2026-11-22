// ==========================================
// MARKETMIND — BUSINESS GROWTH INTELLIGENCE
// ==========================================

// ELEMENTS

const toast = document.getElementById("toast");
const sidebar = document.getElementById("sidebar");
const overview = document.getElementById("overviewPage");
const profilePage = document.getElementById("profilePage");
const assessmentPage = document.getElementById("assessmentPage");
const strategyPage = document.getElementById("strategyPage");
const businessForm = document.getElementById("businessForm");

let toastTimer;


// ==========================================
// UTILITIES
// ==========================================

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

function safeText(value) {
  return String(value ?? "").trim();
}

function showToast(message) {
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2800);
}

function getElement(id) {
  return document.getElementById(id);
}


// ==========================================
// NAVIGATION
// ==========================================

function navigate(page) {
  const pages = {
    overview: overview,
    profile: profilePage,
    assessment: assessmentPage,
    strategy: strategyPage,
    campaign: getElement("campaignPage"),
    planner: getElement("plannerPage")
  };

  const names = {
    overview: "Overview",
    profile: "Business Profile",
    assessment: "Growth Assessment",
    strategy: "Strategy Builder",
    campaign: "Campaign Studio",
    planner: "Growth Planner"
  };

  if (!pages[page]) {
    showToast("This module is planned for a future build.");
    return;
  }

  Object.values(pages).forEach(section => {
    if (section) section.classList.add("hidden");
  });

  pages[page].classList.remove("hidden");

  document.querySelectorAll(".nav-item").forEach(item => {
    item.classList.toggle("active", item.dataset.page === page);
  });

  const breadcrumb = document.querySelector(".breadcrumb");

  if (breadcrumb) {
    breadcrumb.innerHTML =
      `Workspace <span>/</span> <strong>${names[page]}</strong>`;
  }

  if (sidebar) {
    sidebar.classList.remove("open");
  }
}

document.querySelectorAll(".nav-item").forEach(item => {
  item.addEventListener("click", () => {
    navigate(item.dataset.page);
  });
});

const startAssessmentButton = getElement("startAssessment");
if (startAssessmentButton) {
  startAssessmentButton.addEventListener("click", () => {
    navigate("profile");
  });
}

const bannerAction = getElement("bannerAction");
if (bannerAction) {
  bannerAction.addEventListener("click", () => {
    navigate("profile");
  });
}

const chartAction = getElement("chartAction");
if (chartAction) {
  chartAction.addEventListener("click", () => {
    navigate("profile");
  });
}

const mobileMenu = getElement("mobileMenu");
if (mobileMenu) {
  mobileMenu.addEventListener("click", () => {
    if (sidebar) sidebar.classList.toggle("open");
  });
}


// ==========================================
// BUSINESS PROFILE
// ==========================================

function updateOverview(profile) {
  if (!profile) return;

  const profileStatus = getElement("profileStatus");
  if (profileStatus) {
    profileStatus.textContent = "Saved";
  }

  const bannerTitle = document.querySelector(".notice-banner strong");
  const bannerDescription = document.querySelector(".notice-banner p");

  if (bannerTitle) {
    bannerTitle.textContent =
      `${safeText(profile.businessName) || "Your business"} is ready for analysis.`;
  }

  if (bannerDescription) {
    bannerDescription.textContent =
      "Run your marketing diagnostic to discover growth gaps and opportunities.";
  }
}

if (businessForm) {

  businessForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const formData = new FormData(businessForm);
    const profile = Object.fromEntries(formData.entries());

    profile.channels = formData.getAll("channels");

    localStorage.setItem(
      "marketmind_profile",
      JSON.stringify(profile)
    );

    updateOverview(profile);
    showToast("Business profile saved successfully!");
  });


  businessForm.addEventListener("reset", function() {
    setTimeout(() => {

      localStorage.removeItem("marketmind_profile");
      localStorage.removeItem("marketmind_assessment");
      localStorage.removeItem("marketmind_strategy");

      const assessmentResults = getElement("assessmentResults");
      const strategyResults = getElement("strategyResults");
      const strategyEmpty = getElement("strategyEmpty");

      if (assessmentResults) {
        assessmentResults.classList.add("hidden");
      }

      if (strategyResults) {
        strategyResults.classList.add("hidden");
      }

      if (strategyEmpty) {
        strategyEmpty.classList.remove("hidden");
      }

      const profileStatus = getElement("profileStatus");
      if (profileStatus) {
        profileStatus.textContent = "Not started";
      }

      const readinessValue = getElement("readinessValue");
      const gapsValue = getElement("gapsValue");
      const actionsValue = getElement("actionsValue");

      if (readinessValue) readinessValue.innerHTML = `--<span>/100</span>`;
      if (gapsValue) gapsValue.textContent = "0";
      if (actionsValue) actionsValue.textContent = "0";

      showToast("Profile cleared.");

    }, 0);
  });

}


// ==========================================
// RESTORE SAVED PROFILE
// ==========================================

function restoreProfile() {
  const savedProfile = localStorage.getItem("marketmind_profile");

  if (!savedProfile || !businessForm) return null;

  try {
    const profile = JSON.parse(savedProfile);

    Object.entries(profile).forEach(([key, value]) => {

      if (key === "channels") {
        const checkboxes = businessForm.querySelectorAll(
          'input[name="channels"]'
        );

        checkboxes.forEach(checkbox => {
          checkbox.checked = Array.isArray(value) &&
            value.includes(checkbox.value);
        });

      } else {
        const field = businessForm.elements.namedItem(key);

        if (field && typeof value === "string") {
          field.value = value;
        }
      }

    });

    updateOverview(profile);
    return profile;

  } catch (error) {
    console.error("Could not restore saved profile:", error);
    return null;
  }
}


// ==========================================
// MARKETING READINESS ASSESSMENT
// ==========================================

function assessBusiness(profile) {

  const channels = Array.isArray(profile.channels)
    ? profile.channels
    : [];

  const valueProposition = safeText(profile.valueProposition);
  const audience = safeText(profile.audience);
  const competitors = safeText(profile.competitors);
  const frequency = safeText(profile.marketingFrequency);

  const dimensions = [

    {
      name: "Brand positioning",

      score: valueProposition.length >= 40 ? 85 :
             valueProposition.length > 0 ? 60 : 30,

      explanation: valueProposition.length >= 40
        ? "You have articulated a value proposition. Further validation with customers can help strengthen differentiation."
        : "Your differentiation is not clearly documented. Define why customers should choose your business."
    },

    {
      name: "Customer clarity",

      score: audience.length >= 60 ? 85 :
             audience.length > 0 ? 60 : 30,

      explanation: audience.length >= 60
        ? "Your customer description provides a useful starting point. Validate it with real customer research."
        : "Your target audience description needs more detail about customer needs, behaviours and buying motivations."
    },

    {
      name: "Digital presence",

      score: channels.includes("Website") && channels.includes("Google Search") ? 90 :
             channels.includes("Website") || channels.includes("Google Search") ? 70 :
             channels.length >= 2 ? 55 : 30,

      explanation: channels.includes("Website") || channels.includes("Google Search")
        ? "You report using a website or search-related channel. Check visibility, website usability and discoverability."
        : "Your selected channels do not include a website or Google Search. Consider improving online discoverability."
    },

    {
      name: "Content marketing",

      score: frequency === "Daily" ? 90 :
             frequency === "3–5 times per week" ? 80 :
             frequency === "1–2 times per week" ? 65 :
             frequency === "Occasionally" ? 45 : 25,

      explanation:
        frequency === "Daily" || frequency === "3–5 times per week"
          ? "You report a frequent publishing schedule. Evaluate content quality, audience response and consistency."
          : "Your reported content frequency suggests an opportunity to establish a more consistent publishing routine."
    },

    {
      name: "Marketing strategy",

      score: profile.primaryGoal && profile.growthChallenge ? 75 : 35,

      explanation: profile.primaryGoal && profile.growthChallenge
        ? "You have identified a growth goal and marketing challenge. Build a measurable plan linking actions to outcomes."
        : "Clarify your growth objectives and marketing challenges before developing a strategy."
    },

    {
      name: "Competitive awareness",

      score: competitors.length >= 30 ? 80 :
             competitors.length > 0 ? 55 : 25,

      explanation: competitors.length >= 30
        ? "You have documented competitive information. Analyse competitor positioning, offers and customer experience."
        : "Your competitor information is limited. Identify alternatives customers use and compare their positioning."
    }

  ];

  const total = dimensions.reduce(
    (sum, item) => sum + item.score,
    0
  );

  const overall = Math.round(total / dimensions.length);

  const gaps = dimensions
    .filter(item => item.score < 70)
    .sort((a, b) => a.score - b.score);

  const actions = {

    "Brand positioning":
      "Write a positioning statement defining your target customer, key need, distinctive offer and reason to believe.",

    "Customer clarity":
      "Interview at least five customers or potential customers to identify their needs, objections and buying motivations.",

    "Digital presence":
      "Audit your digital discoverability. Review your website or business listing, contact information, content and customer journey.",

    "Content marketing":
      "Create a repeatable weekly content plan with educational, product, trust-building and engagement content.",

    "Marketing strategy":
      "Create a 30-day marketing plan with one measurable goal, defined audience, selected channels and weekly KPIs.",

    "Competitive awareness":
      "Review three competitors and compare their offers, messaging, pricing, channels and customer experience."

  };

  const recommendations = gaps.map(item => ({
    title: item.name,
    action: actions[item.name],
    score: item.score
  }));

  return {
    overall,
    dimensions,
    gaps,
    recommendations
  };
}


// ==========================================
// ASSESSMENT DESCRIPTION
// ==========================================

function getScoreDescription(score) {

  if (score >= 85) {
    return "Your profile indicates strong marketing foundations. Focus on validation, optimisation and measurable growth.";
  }

  if (score >= 70) {
    return "Your business shows promising marketing foundations, with opportunities to strengthen a few key areas.";
  }

  if (score >= 50) {
    return "Your marketing foundations are developing. Prioritised improvements can help create a more structured approach.";
  }

  return "Your marketing foundations need attention. Start with the most important gaps before expanding your marketing activities.";
}


// ==========================================
// DISPLAY ASSESSMENT RESULTS
// ==========================================

function displayAssessment(result) {

  const assessmentResults = getElement("assessmentResults");
  if (assessmentResults) {
    assessmentResults.classList.remove("hidden");
  }

  const overallScore = getElement("overallScore");
  const scoreTitle = getElement("scoreTitle");
  const scoreDescription = getElement("scoreDescription");
  const scoreCircle = getElement("scoreCircle");

  if (overallScore) {
    overallScore.textContent = result.overall;
  }

  if (scoreTitle) {
    scoreTitle.textContent =
      result.overall >= 70 ? "Promising foundations" :
      result.overall >= 50 ? "Developing foundations" :
      "Needs strategic attention";
  }

  if (scoreDescription) {
    scoreDescription.textContent =
      getScoreDescription(result.overall);
  }

  if (scoreCircle) {
    scoreCircle.style.background =
      `conic-gradient(#9b7cff ${result.overall * 3.6}deg, rgba(255,255,255,.08) 0deg)`;
  }


  // Dimension breakdown

  const dimensionResults = getElement("dimensionResults");

  if (dimensionResults) {
    dimensionResults.innerHTML = result.dimensions.map(item => `
      <div class="dimension-row">
        <div class="dimension-top">
          <strong>${escapeHTML(item.name)}</strong>
          <span class="dimension-score">${item.score}/100</span>
        </div>

        <div class="progress-track">
          <div class="progress-fill" style="width:${item.score}%"></div>
        </div>

        <p class="dimension-explanation">
          ${escapeHTML(item.explanation)}
        </p>
      </div>
    `).join("");
  }


  // Priority gaps

  const gapResults = getElement("gapResults");

  if (gapResults) {
    gapResults.innerHTML = result.gaps.length

      ? result.gaps.map(item => `
          <div class="gap-card">
            <span class="gap-priority ${item.score < 40 ? "priority-high" : "priority-medium"}">
              ${item.score < 40 ? "HIGH PRIORITY" : "IMPROVEMENT AREA"}
            </span>

            <h4>${escapeHTML(item.name)} — ${item.score}/100</h4>

            <p>${escapeHTML(item.explanation)}</p>
          </div>
        `).join("")

      : `
          <div class="gap-card">
            <span class="gap-priority priority-low">
              NO LOW-SCORING DIMENSIONS
            </span>

            <h4>Continue validating your marketing foundations</h4>

            <p>
              Even strong profile scores should be validated against actual
              customer feedback and business performance.
            </p>
          </div>
        `;
  }


  // Recommendations

  const recommendationResults = getElement("recommendationResults");

  if (recommendationResults) {
    recommendationResults.innerHTML = result.recommendations.length

      ? result.recommendations.map((item, index) => `
          <div class="recommendation-card">
            <div class="recommendation-number">
              ${String(index + 1).padStart(2, "0")}
            </div>

            <div>
              <h4>${escapeHTML(item.title)}</h4>
              <p>${escapeHTML(item.action)}</p>
            </div>
          </div>
        `).join("")

      : `
          <div class="recommendation-card">
            <div class="recommendation-number">01</div>

            <div>
              <h4>Validate your marketing</h4>
              <p>
                Test your positioning and marketing activities with real
                customers, and monitor measurable outcomes.
              </p>
            </div>
          </div>
        `;
  }


  // Dashboard metrics

  const readinessValue = getElement("readinessValue");
  const gapsValue = getElement("gapsValue");
  const actionsValue = getElement("actionsValue");
  const analysisBadge = getElement("analysisBadge");
  const profileStatus = getElement("profileStatus");

  if (readinessValue) {
    readinessValue.innerHTML =
      `${result.overall}<span>/100</span>`;
  }

  if (gapsValue) {
    gapsValue.textContent = result.gaps.length;
  }

  if (actionsValue) {
    actionsValue.textContent = result.recommendations.length;
  }

  if (analysisBadge) {
    analysisBadge.textContent = "Assessment complete";
    analysisBadge.classList.add("success");
  }

  if (profileStatus) {
    profileStatus.textContent = "Analysed";
  }


  // Dashboard chart

  const chartArea = getElement("chartArea");

  if (chartArea) {
    chartArea.innerHTML = `
      <div class="dimension-results">
        ${result.dimensions.map(item => `
          <div class="dimension-row">
            <div class="dimension-top">
              <strong>${escapeHTML(item.name)}</strong>
              <span class="dimension-score">${item.score}/100</span>
            </div>

            <div class="progress-track">
              <div class="progress-fill" style="width:${item.score}%"></div>
            </div>
          </div>
        `).join("")}
      </div>
    `;
  }


  // Dashboard opportunities

  const opportunitiesList = getElement("opportunitiesList");

  if (opportunitiesList) {
    opportunitiesList.innerHTML = result.gaps.length

      ? result.gaps.slice(0, 3).map(item => `
          <div class="gap-card">
            <h4>${escapeHTML(item.name)}</h4>
            <p>${escapeHTML(item.explanation)}</p>
          </div>
        `).join("")

      : `
          <div class="empty-opportunity">
            <h4>Validate and optimise</h4>
            <p>
              Use real business performance and customer feedback to discover
              further growth opportunities.
            </p>
          </div>
        `;
  }


  // Dashboard action list

  const actionList = getElement("actionList");

  if (actionList) {
    actionList.innerHTML = result.recommendations.length

      ? result.recommendations.slice(0, 3).map((item, index) => `
          <div class="action-row">
            <div class="action-number">
              ${String(index + 1).padStart(2, "0")}
            </div>

            <div class="action-details">
              <strong>${escapeHTML(item.title)}</strong>
              <p>${escapeHTML(item.action)}</p>
            </div>

            <span class="action-tag">PRIORITY</span>
          </div>
        `).join("")

      : `
          <div class="action-row">
            <div class="action-number">01</div>
            <div class="action-details">
              <strong>Validate your marketing</strong>
              <p>Monitor customer feedback and actual business performance.</p>
            </div>
            <span class="action-tag">REVIEW</span>
          </div>
        `;
  }

  localStorage.setItem(
    "marketmind_assessment",
    JSON.stringify(result)
  );
}


// ==========================================
// RUN ASSESSMENT
// ==========================================

const runAssessmentButton = getElement("runAssessment");

if (runAssessmentButton) {

  runAssessmentButton.addEventListener("click", () => {

    const savedProfile = localStorage.getItem("marketmind_profile");

    if (!savedProfile) {
      showToast("Save your business profile first.");
      navigate("profile");
      return;
    }

    try {
      const profile = JSON.parse(savedProfile);
      const result = assessBusiness(profile);

      displayAssessment(result);

      // A new assessment invalidates the old strategy.

      localStorage.removeItem("marketmind_strategy");

      const strategyResults = getElement("strategyResults");
      const strategyEmpty = getElement("strategyEmpty");

      if (strategyResults) {
        strategyResults.classList.add("hidden");
      }

      if (strategyEmpty) {
        strategyEmpty.classList.remove("hidden");
      }

      showToast("Marketing diagnostic completed.");

    } catch (error) {
      console.error("Assessment error:", error);
      showToast("Unable to complete assessment. Check your profile.");
    }

  });

}


// ==========================================
// STRATEGY BUILDER — GENERATION ENGINE
// ==========================================

function buildStrategy(profile, assessment) {

  const sortedDimensions = [...assessment.dimensions]
    .sort((a, b) => a.score - b.score);

  const priorities = sortedDimensions.slice(0, 3);

  const goal = safeText(profile.primaryGoal) ||
    "Improve overall marketing performance";

  const audience = safeText(profile.audience) ||
    "Your defined target customers";

  const business = safeText(profile.businessName) ||
    "Your business";

  const channels = Array.isArray(profile.channels)
    ? profile.channels
    : [];

    // Channel recommendations

  let channelAdvice;

  if (channels.length === 0) {

    channelAdvice =
      "Begin by selecting one or two channels your target audience actively uses. Establish a consistent presence before expanding.";

  } else {

    channelAdvice =
      `Focus on optimising ${channels.slice(0, 3).join(", ")}${channels.length > 3 ? " and other selected channels" : ""}. Track the performance of each channel and prioritise the ones that contribute to your goal.`;

  }

  // Positioning recommendations

  const valueProposition = safeText(profile.valueProposition);

  const positioning = valueProposition

    ? `Use your current value proposition as a starting point: "${valueProposition}". Refine it to communicate customer value and differentiation.`

    : "Develop a clear value proposition describing the customer problem, your solution and why customers should choose you.";


    // Competitive recommendations

  const competitive = safeText(profile.competitors)

    ? "Use your competitor observations to differentiate your offers, messaging and customer experience instead of copying competitors."

    : "Research at least three competitors or alternatives. Compare their positioning, offers, customer experience and communication.";


  // Actions by dimension

  const priorityActions = {

    "Brand positioning":
      "Refine your brand positioning, value proposition and messaging. Test whether customers understand what makes your business different.",

    "Customer clarity":
      "Conduct customer interviews and define a practical customer segment using needs, buying behaviours, motivations and objections.",

    "Digital presence":
      "Improve online discoverability, profile completeness, website usability, contact details and customer conversion pathways.",

    "Content marketing":
      "Build a content calendar featuring educational, proof-based, product and engagement content. Establish a realistic posting schedule.",

      "Marketing strategy":
      "Convert your growth goal into a measurable marketing plan. Set targets, select channels and review progress weekly.",

    "Competitive awareness":
      "Create a competitor comparison covering pricing, messaging, offers, digital channels and customer experience."

  };


  const priorityDetails = priorities.map((item, index) => ({
    name: item.name,
    score: item.score,
    action: priorityActions[item.name],
    order: index + 1
  }));


  // Marketing objectives

  const objectiveTemplates = [

    {
      title: "Primary growth objective",
      description:
        `Align marketing activities with the business goal: ${goal}. Establish a baseline metric first, then set a realistic target and timeframe.`
    },

    {
      title: "Customer acquisition objective",
      description:
        `Reach and engage ${audience}. Track qualified enquiries, engagement, conversion rate or customer acquisition cost, depending on available data.`
    },

    {
      title: "Brand and trust objective",
      description:
        "Strengthen brand credibility through clear messaging, customer feedback, genuine testimonials, product education and consistent communication."
    }

  ];

  // Execution plan

  const executionSteps = [

    {
      title: "Clarify positioning and audience",
      description: positioning
    },

    {
      title: "Strengthen customer understanding",
      description:
        "Validate customer needs, buying motivations, objections and preferred communication channels through interviews or feedback."
    },

    {
      title: "Prioritise marketing channels",
      description: channelAdvice
    },

    {
      title: "Review the competitive landscape",
      description: competitive
    },

    {
      title: "Establish a measurement routine",
      description:
        "Review enquiries, conversions, engagement, repeat purchases or other goal-relevant indicators weekly. Avoid relying on vanity metrics alone."
    }

  ];


  return {
    business,
    goal,
    priorities: priorityDetails,
    objectives: objectiveTemplates,
    execution: executionSteps
  };

}


// ==========================================
// DISPLAY GENERATED STRATEGY
// ==========================================

function displayStrategy(strategy) {

  const strategyEmpty = getElement("strategyEmpty");
  const strategyResults = getElement("strategyResults");

  if (strategyEmpty) {
    strategyEmpty.classList.add("hidden");
  }

  if (strategyResults) {
    strategyResults.classList.remove("hidden");
  }


  // Strategic direction

  const strategicDirection = getElement("strategicDirection");

  if (strategicDirection) {

    strategicDirection.innerHTML = `
      <div class="strategy-direction-card">

        <span class="strategy-tag">
          RECOMMENDED DIRECTION
        </span>

        <h4>${escapeHTML(strategy.business)}</h4>

        <p>
          Your marketing strategy should focus on achieving
          <strong>${escapeHTML(strategy.goal)}</strong>
          by addressing the highest-priority marketing capability gaps,
          strengthening customer understanding and concentrating resources
          on measurable activities.
        </p>

      </div>
    `;

  }


  // Strategic priorities

  const strategyPriorities = getElement("strategyPriorities");

  if (strategyPriorities) {

    strategyPriorities.innerHTML = strategy.priorities.map(item => `
      <div class="recommendation-card">

        <div class="recommendation-number">
          ${String(item.order).padStart(2, "0")}
        </div>

        <div>
          <span class="strategy-tag">
            PRIORITY · ${item.score}/100
          </span>

          <h4>${escapeHTML(item.name)}</h4>

          <p>${escapeHTML(item.action)}</p>
        </div>

      </div>
    `).join("");

  }


  // Marketing objectives

  const strategyObjectives = getElement("strategyObjectives");

  if (strategyObjectives) {

    strategyObjectives.innerHTML = strategy.objectives.map((item, index) => `
      <div class="gap-card">

        <span class="gap-priority priority-medium">
          OBJECTIVE ${String(index + 1).padStart(2, "0")}
        </span>

        <h4>${escapeHTML(item.title)}</h4>

        <p>${escapeHTML(item.description)}</p>

      </div>
    `).join("");

  }


  // Execution approach

  const strategyExecution = getElement("strategyExecution");

  if (strategyExecution) {

    strategyExecution.innerHTML = strategy.execution.map((item, index) => `
      <div class="action-row">

        <div class="action-number">
          ${String(index + 1).padStart(2, "0")}
        </div>

        <div class="action-details">
          <strong>${escapeHTML(item.title)}</strong>
          <p>${escapeHTML(item.description)}</p>
        </div>

      </div>
    `).join("");

  }


  // Save generated strategy

  localStorage.setItem(
    "marketmind_strategy",
    JSON.stringify(strategy)
  );

}


// ==========================================
// GENERATE STRATEGY BUTTON
// ==========================================

const generateStrategyButton = getElement("generateStrategy");

if (generateStrategyButton) {

  generateStrategyButton.addEventListener("click", () => {

    const savedProfile = localStorage.getItem("marketmind_profile");
    const savedAssessment = localStorage.getItem("marketmind_assessment");

    if (!savedProfile) {
      showToast("Save your business profile first.");
      navigate("profile");
      return;
    }

    if (!savedAssessment) {
      showToast("Complete your growth assessment first.");
      navigate("assessment");
      return;
    }

    try {

      const profile = JSON.parse(savedProfile);
      const assessment = JSON.parse(savedAssessment);

      const strategy = buildStrategy(profile, assessment);

      displayStrategy(strategy);

      showToast("Marketing strategy generated successfully!");

    } catch (error) {

      console.error("Strategy generation error:", error);
      showToast("Unable to generate strategy. Please run the assessment again.");

    }

  });

}


// ==========================================
// RESTORE SAVED ASSESSMENT AND STRATEGY
// ==========================================

function restoreSavedResults() {

  const savedProfile = localStorage.getItem("marketmind_profile");
  const savedAssessment = localStorage.getItem("marketmind_assessment");
  const savedStrategy = localStorage.getItem("marketmind_strategy");

  if (!savedProfile) return;

  try {

    const profile = JSON.parse(savedProfile);

    if (savedAssessment) {

      const assessment = JSON.parse(savedAssessment);

      displayAssessment(assessment);

      if (savedStrategy) {

        const strategy = JSON.parse(savedStrategy);

        displayStrategy(strategy);

      }

    }

  } catch (error) {

    console.error("Could not restore saved results:", error);

  }

}


// ==========================================
// INITIALISE MARKETMIND
// ==========================================

function initialiseMarketMind() {

  restoreProfile();

  restoreSavedResults();

  console.log("MarketMind initialised successfully.");

}

initialiseMarketMind();

// ==========================================
// CAMPAIGN STUDIO
// ==========================================

function generateCampaignPlan() {
  const objective = document.getElementById("campaignObjective")?.value;
  const audienceInput = document.getElementById("campaignAudience");
  const channel = document.getElementById("campaignChannel")?.value;
  const duration = document.getElementById("campaignDuration")?.value;

  const audience = audienceInput?.value.trim();

  if (!audience) {
    showToast("Please enter your target audience.");
    audienceInput?.focus();
    return;
  }

  const profile = JSON.parse(
    localStorage.getItem("marketmind_profile") || "{}"
  );

  const businessName =
    profile.businessName ||
    profile.business_name ||
    profile.name ||
    "your business";

  const objectivePlans = {
    awareness: {
      title: "Build Brand Awareness",
      concept: `Introduce ${businessName} to more potential customers through useful, recognisable and consistent content.`,
      message: `Discover what makes ${businessName} valuable. Follow us to learn more about our products and services.`,
      cta: "Discover our brand",
      content: [
        "Create an introductory brand story post.",
        "Publish a short video highlighting your product or service.",
        "Share behind-the-scenes content that builds familiarity."
      ]
    },
    engagement: {
      title: "Strengthen Customer Engagement",
      concept: `Build stronger relationships with the audience through interactive and relevant content.`,
      message: `We want to hear from you! Share your thoughts, questions and experiences with ${businessName}.`,
      cta: "Comment and share your thoughts",
      content: [
        "Publish a question or poll related to customer interests.",
        "Share a customer-focused educational post.",
        "Create a short video inviting audience participation."
      ]
    },
    leads: {
      title: "Generate Qualified Leads",
      concept: `Encourage interested potential customers to contact ${businessName} and explore its offering.`,
      message: `Looking for a solution that meets your needs? Get in touch with ${businessName} to learn more.`,
      cta: "Contact us today",
      content: [
        "Publish a post explaining the problem your offering solves.",
        "Share a clear enquiry or contact invitation.",
        "Create a FAQ post answering common customer questions."
      ]
    },
    sales: {
      title: "Drive Product or Service Sales",
      concept: `Encourage purchase consideration by communicating product value, benefits and clear next steps.`,
      message: `Explore what ${businessName} has to offer and find the right option for your needs.`,
      cta: "Shop or enquire now",
      content: [
        "Highlight a featured product or service and its benefits.",
        "Publish a product demonstration or explainer video.",
        "Share a clear offer or purchase invitation, if available."
      ]
    }
  };

  const plan = objectivePlans[objective];

  const execution = [
    "Preparation: finalise campaign messaging, visuals and target audience.",
    `Launch: publish the campaign on ${channel}.`,
    "Engagement: respond to comments, messages and customer enquiries.",
    "Monitoring: track reach, engagement, enquiries or sales according to the campaign objective.",
    "Evaluation: review results and identify improvements for the next campaign."
  ];

  const escape = (value) =>
    String(value).replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);

  document.getElementById("campaignConcept").innerHTML = `
    <h3>${escape(plan.title)}</h3>
    <p>${escape(plan.concept)}</p>
    <p><strong>Target audience:</strong> ${escape(audience)}</p>
    <p><strong>Channel:</strong> ${escape(channel)}</p>
    <p><strong>Duration:</strong> ${escape(duration)}</p>
  `;

  document.getElementById("campaignMessaging").innerHTML = `
    <p><strong>Core message</strong></p>
    <p>${escape(plan.message)}</p>
    <p><strong>Call to action</strong></p>
    <p>${escape(plan.cta)}</p>
  `;

  document.getElementById("campaignContent").innerHTML = `
    <ul>
      ${plan.content.map(item => `<li>${escape(item)}</li>`).join("")}
    </ul>
  `;

  document.getElementById("campaignExecution").innerHTML = `
    <ol>
      ${execution.map(item => `<li>${escape(item)}</li>`).join("")}
    </ol>
  `;

  document.getElementById("campaignResults").classList.remove("hidden");
  document.getElementById("campaignResults").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

  showToast("Your campaign plan has been generated!");
}

const campaignButton = document.getElementById("generateCampaign");

if (campaignButton) {
  campaignButton.addEventListener("click", generateCampaignPlan);
}

// ==========================================
// GROWTH PLANNER
// ==========================================

function generateGrowthPlan(profile, assessment, goal) {

  const businessName =
    safeText(profile.businessName) || "Your Business";

  const audience =
    safeText(profile.audience) || "your target customers";

  const channels = Array.isArray(profile.channels)
    ? profile.channels
    : [];

  const gaps = assessment && Array.isArray(assessment.gaps)
    ? assessment.gaps.map(item => item.name)
    : [];

  const priorities = gaps.length
    ? gaps.slice(0, 3)
    : ["Brand positioning", "Customer clarity", "Digital presence"];

  const goalActions = {
    awareness: [
      "Define a clear brand message and identify your strongest differentiators.",
      "Publish educational and brand-awareness content consistently.",
      "Collaborate with relevant creators or complementary businesses.",
      "Review reach, impressions and audience growth."
    ],
    leads: [
      "Create a clear customer offer and lead-generation message.",
      "Develop a simple enquiry or lead-capture process.",
      "Publish content that addresses customer problems and objections.",
      "Review enquiries, conversion rates and lead quality."
    ],
    sales: [
      "Review your product offer, pricing and customer buying journey.",
      "Create product-focused content and clear calls to action.",
      "Test a relevant promotional campaign.",
      "Review sales, conversion rates and customer feedback."
    ],
    engagement: [
      "Research the topics and formats your audience responds to.",
      "Publish interactive, educational and conversation-led content.",
      "Respond consistently to comments, messages and enquiries.",
      "Review engagement rates and audience interactions."
    ],
    retention: [
      "Identify what makes existing customers return.",
      "Introduce follow-up messages and useful customer support content.",
      "Develop a customer feedback and loyalty initiative.",
      "Review repeat purchases and customer satisfaction."
    ]
  };

  const actions = goalActions[goal] || goalActions.awareness;

  const phase1 = [
    `Review your ${priorities[0]} and document three improvement opportunities.`,
    `Define your ideal customer profile, focusing on ${audience}.`,
    "Set a measurable baseline for your current marketing performance.",
    `Audit your existing marketing channels: ${channels.join(", ") || "identify suitable channels"}.`
  ];

  const phase2 = [
    actions[0],
    actions[1],
    `Address the ${priorities[1] || "next priority area"} identified in your assessment.`,
    actions[2]
  ];

  const phase3 = [
    actions[3],
    "Compare campaign performance against your starting baseline.",
    "Identify the most effective marketing activities and prioritise them.",
    "Prepare the next 90-day roadmap using performance evidence."
  ];

  const kpis = {
    awareness: [
      "Reach and impressions",
      "Audience growth",
      "Website or profile visits",
      "Brand-related enquiries"
    ],
    leads: [
      "Number of qualified leads",
      "Enquiry conversion rate",
      "Cost per lead (if paid campaigns are used)",
      "Lead follow-up rate"
    ],
    sales: [
      "Total sales and revenue",
      "Conversion rate",
      "Average order value",
      "Customer acquisition cost (if measurable)"
    ],
    engagement: [
      "Engagement rate",
      "Comments and shares",
      "Saves and meaningful interactions",
      "Audience growth"
    ],
    retention: [
      "Repeat purchase rate",
      "Customer satisfaction",
      "Customer retention rate",
      "Customer feedback"
    ]
  };

  return {
    businessName,
    goal,
    phase1,
    phase2,
    phase3,
    kpis: kpis[goal] || kpis.awareness
  };
}


function displayGrowthPlan(plan) {

  const results = getElement("plannerResults");

  if (!results) return;

  getElement("plannerBusinessName").textContent =
    `${plan.businessName} — Growth Roadmap`;

  getElement("plannerSummary").textContent =
    "A structured 90-day roadmap designed to turn your marketing priorities into practical business actions. Review progress regularly and adjust activities using actual performance data.";

    const progressHTML = `
    <div id="plannerTaskProgress" style="margin-top:20px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
        <strong>Roadmap Progress</strong>
        <span id="plannerProgressText"></span>
      </div>
      <div style="height:10px;background:#eee7f3;border-radius:20px;overflow:hidden;">
        <div id="plannerProgressBar" style="height:100%;width:0%;background:#7651a6;border-radius:20px;transition:width 0.3s;"></div>
      </div>
    </div>
  `;

  const plannerIntro = results.querySelector(".planner-intro");

  if (plannerIntro && !getElement("plannerTaskProgress")) {
    plannerIntro.insertAdjacentHTML("beforeend", progressHTML);
  }

    const completionKey =
    `marketmind_planner_completed_${plan.businessName}_${plan.goal}`;

  let completedTasks = [];

  try {
completedTasks = JSON.parse(
  localStorage.getItem(completionKey)
) || [];

completedTasks = completedTasks.map(Number);
  } catch (error) {
    completedTasks = [];
  }

function renderTasks(tasks, containerId, startIndex) {

    const container = getElement(containerId);

    if (!container) return;

    container.innerHTML = tasks.map((task, index) => {
      const taskId = startIndex + index;
      const completed = completedTasks.includes(taskId);

      return `
        <div class="planner-task ${completed ? "completed" : ""}">
          <input
            type="checkbox"
            class="planner-checkbox"
            data-task-id="${taskId}"
            ${completed ? "checked" : ""}
          >
          <div class="planner-task-number">
            ${String(index + 1).padStart(2, "0")}
          </div>
          <div>
            <strong>Action ${index + 1}</strong>
            <p>${escapeHTML(task)}</p>
          </div>
        </div>
      `;
    }).join("");
  }
  results.classList.remove("hidden");
  renderTasks(plan.phase1, "plannerPhase1", 0);
  renderTasks(plan.phase2, "plannerPhase2", 4);
  renderTasks(plan.phase3, "plannerPhase3", 8);
  results.onchange = function(event) {

    if (!event.target.classList.contains("planner-checkbox")) {
      return;
    }

    const taskId = Number(event.target.dataset.taskId);

const taskRow = event.target.closest(".planner-task");

    if (event.target.checked) {
      if (!completedTasks.includes(taskId)) {
        completedTasks.push(taskId);
      }

      taskRow.classList.add("completed");

    } else {
      completedTasks = completedTasks.filter(id => id !== taskId);

      taskRow.classList.remove("completed");
    }

    localStorage.setItem(
      completionKey,
      JSON.stringify(completedTasks)
    );
    updateProgress();

  };
  const kpiContainer = getElement("plannerKPIs");

  if (kpiContainer) {
    kpiContainer.innerHTML = plan.kpis.map(kpi => `
      <div class="planner-kpi">
        <strong>${escapeHTML(kpi)}</strong>
      </div>
    `).join("");
  }
  function updateProgress() {

    const totalTasks = 12;
    const completedCount = completedTasks.length;
    const percentage = (completedCount / totalTasks) * 100;

    const progressText = getElement("plannerProgressText");
    const progressBar = getElement("plannerProgressBar");

    if (progressText) {
      progressText.textContent =
        `${completedCount} of ${totalTasks} tasks completed`;
    }

    if (progressBar) {
      progressBar.style.width = `${percentage}%`;
    }
  }

  updateProgress();

  results.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}


const generatePlannerButton = getElement("generatePlanner");

if (generatePlannerButton) {

  generatePlannerButton.addEventListener("click", () => {

    const savedProfile = localStorage.getItem("marketmind_profile");

    if (!savedProfile) {
      showToast("Save your business profile first.");
      navigate("profile");
      return;
    }

    try {

      const profile = JSON.parse(savedProfile);

      const savedAssessment =
        localStorage.getItem("marketmind_assessment");

      const assessment = savedAssessment
        ? JSON.parse(savedAssessment)
        : null;

      const goal = getElement("plannerGoal").value;

      const plan = generateGrowthPlan(
        profile,
        assessment,
        goal
      );

      displayGrowthPlan(plan);

      localStorage.setItem(
        "marketmind_growth_plan",
        JSON.stringify(plan)
      );

      showToast("90-day growth plan generated!");

    } catch (error) {

      console.error("Growth Planner error:", error);

      showToast("Unable to generate growth plan.");

    }

  });

}
