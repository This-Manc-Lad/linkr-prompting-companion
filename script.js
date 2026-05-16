const outputTypes = [
  "Image transformation",
  "Photo enhancement",
  "Product render",
  "Jewellery design",
  "Retail display",
  "Logo/brand visual",
  "Social post",
  "Technical diagram",
  "Video prompt",
  "Correction prompt"
];

const aiTools = [
  "ChatGPT Image",
  "Midjourney",
  "Canva",
  "Firefly",
  "Ideogram",
  "Leonardo",
  "Runway",
  "Other"
];

const visualStyles = [
  "Modern anime",
  "Luxury editorial",
  "Cinematic film still",
  "Graphic novel cover",
  "Renaissance oil painting",
  "Neoclassical marble statue",
  "Future museum exhibit",
  "Sci-fi archive file",
  "Tarot card",
  "Trading card",
  "Product packshot",
  "Technical blueprint",
  "Cosmic fine-art portrait",
  "Retail window display"
];

const fidelityLevels = [
  "Loose inspiration",
  "Balanced transformation",
  "High fidelity",
  "Exact correction",
  "Product accurate",
  "Face accurate"
];

const promptLocks = [
  "Preserve facial identity",
  "Preserve outfit and pose",
  "Preserve product dimensions",
  "Preserve logos/text",
  "Avoid CGI look",
  "Avoid over-smoothing",
  "Avoid random added objects",
  "Use premium lighting",
  "Use realistic textures",
  "Use clean background",
  "Include negative prompt"
];

const failureOptions = [
  "Changed the face",
  "Changed the product",
  "Ignored dimensions",
  "Removed details",
  "Added random objects",
  "Misunderstood style",
  "Too cartoonish",
  "Too CGI",
  "Got the text/logo wrong",
  "Ignored the reference image"
];

const styleDescriptions = {
  "Modern anime": "Expressive, polished character-focused visuals with crisp detail, dramatic lighting and clean colour separation.",
  "Luxury editorial": "High-end magazine finish with controlled reflections, elegant composition and expensive-feeling light.",
  "Cinematic film still": "Movie-grade framing, lens language, atmospheric light and believable production design.",
  "Graphic novel cover": "Bold cover art with dramatic contrast, strong silhouettes and premium illustrated detail.",
  "Renaissance oil painting": "Classical painterly realism, layered shadows, soft skin tones and museum-grade atmosphere.",
  "Neoclassical marble statue": "Sculptural white marble, precise anatomy, gallery lighting and timeless symmetry.",
  "Future museum exhibit": "Speculative artefact display with immaculate cases, glowing labels and archival precision.",
  "Sci-fi archive file": "Classified visual record, technical annotations, dark interface overlays and forensic clarity.",
  "Tarot card": "Mystic symbolic composition with ornate framing, rich textures and iconic central imagery.",
  "Trading card": "Collectible card design with hero subject, premium foil detail, stats space and crisp border structure.",
  "Product packshot": "Clean commercial product image with realistic texture, controlled lighting and accurate proportions.",
  "Technical blueprint": "Precise schematic language, annotation lines, measurements and readable structural layout.",
  "Cosmic fine-art portrait": "Elegant portraiture blended with celestial light, painterly detail and premium surrealism.",
  "Retail window display": "Immersive storefront presentation with arranged products, signage, reflections and display lighting."
};

const storageKey = "linkrData";

const defaultData = {
  recipes: [],
  history: [],
  brandKits: [],
  settings: {
    lastTool: "ChatGPT Image"
  }
};

let linkrData = loadData();
let lastPromptMode = "balanced";

const byId = (id) => document.getElementById(id);

function loadData() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    return {
      recipes: Array.isArray(saved?.recipes) ? saved.recipes : [],
      history: Array.isArray(saved?.history) ? saved.history : [],
      brandKits: Array.isArray(saved?.brandKits) ? saved.brandKits : [],
      settings: saved?.settings && typeof saved.settings === "object" ? saved.settings : defaultData.settings
    };
  } catch {
    return cloneDefaultData();
  }
}

function cloneDefaultData() {
  return JSON.parse(JSON.stringify(defaultData));
}

function newId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `linkr-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function saveData() {
  localStorage.setItem(storageKey, JSON.stringify(linkrData));
}

function createOption(value) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = value;
  return option;
}

function fillSelect(select, values) {
  select.innerHTML = "";
  values.forEach((value) => select.appendChild(createOption(value)));
}

function fillToggleGrid(container, values, name) {
  container.innerHTML = "";
  values.forEach((value) => {
    const label = document.createElement("label");
    label.className = "toggle-card";
    label.innerHTML = `<input type="checkbox" name="${name}" value="${escapeHtml(value)}"><span>${escapeHtml(value)}</span>`;
    container.appendChild(label);
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function getCheckedValues(name) {
  return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map((input) => input.value);
}

function getSelectedBrandKit() {
  const id = byId("brandKitSelect").value;
  return linkrData.brandKits.find((kit) => kit.id === id) || null;
}

function buildPrompt(mode = lastPromptMode) {
  lastPromptMode = mode;
  const outputType = byId("outputType").value;
  const targetTool = byId("targetTool").value;
  const subject = byId("subjectDetails").value.trim() || "Describe the subject, reference image, product or scene here.";
  const style = byId("visualStyle").value;
  const fidelity = byId("fidelityLevel").value;
  const locks = getCheckedValues("locks");
  const brandKit = getSelectedBrandKit();
  const toolGuidance = getToolGuidance(targetTool);
  const modeGuidance = getModeGuidance(mode);
  const lockText = locks.length ? locks.join("; ") : "Keep the result coherent, intentional and free from random additions.";
  const negativePrompt = locks.includes("Include negative prompt")
    ? "\nNegative prompt: distorted anatomy, incorrect text, random extra objects, cheap CGI shine, blurry details, over-smoothed textures, mismatched proportions, messy background."
    : "";
  const brandText = brandKit
    ? `\nBrand kit: ${brandKit.name}. Colours: ${brandKit.colors || "use brand-appropriate colours"}. Tone: ${brandKit.tone || "premium and consistent"}. Audience: ${brandKit.audience || "the intended audience"}. Visual rules: ${brandKit.rules || "keep the brand coherent"}. Avoid: ${brandKit.forbidden || "anything off-brand"}.`
    : "";

  const prompt = [
    `Create a ${outputType.toLowerCase()} for ${targetTool}.`,
    `Subject/details: ${subject}`,
    `Visual style: ${style}. ${styleDescriptions[style]}`,
    `Fidelity level: ${fidelity}. ${getFidelityGuidance(fidelity)}`,
    `Prompt locks: ${lockText}.`,
    brandText.trim(),
    `Quality direction: ${modeGuidance}`,
    `Tool formatting: ${toolGuidance}`,
    `Final result should feel polished, intentional, premium and ready for professional creative use.${negativePrompt}`
  ].filter(Boolean).join("\n\n");

  byId("promptPreview").value = prompt;
  byId("promptMeta").textContent = `${targetTool} / ${mode}`;
  linkrData.settings.lastTool = targetTool;
  saveData();
  addHistory(prompt, "Create Prompt");
  return prompt;
}

function getFidelityGuidance(level) {
  const guidance = {
    "Loose inspiration": "Use the input as creative direction, allowing tasteful interpretation while preserving the core idea.",
    "Balanced transformation": "Improve the image while keeping the original intent, subject and important details recognisable.",
    "High fidelity": "Preserve the main subject, proportions, identity, styling and key details closely.",
    "Exact correction": "Only fix the requested issue and do not redesign unrelated parts.",
    "Product accurate": "Keep product shape, scale, materials, logos, text and dimensions accurate.",
    "Face accurate": "Preserve facial identity, expression, age, features and natural skin texture."
  };
  return guidance[level] || guidance["Balanced transformation"];
}

function getToolGuidance(tool) {
  const guidance = {
    "ChatGPT Image": "Use clear natural language with exact preservation instructions and explain what must not change.",
    "Midjourney": "Use compact descriptive phrases, strong style tokens and end with practical constraints instead of long explanations.",
    "Canva": "Describe layout, readable text areas, brand usage and design purpose clearly.",
    "Firefly": "Emphasise commercial safety, clean composition, realistic materials and precise edit instructions.",
    "Ideogram": "Mention any text or logo requirements clearly and keep wording readable, centred and typo-free.",
    "Leonardo": "Use visual tags, material detail, lighting, camera angle and negative prompt guidance.",
    "Runway": "Describe motion, shot type, camera movement, timing, subject continuity and scene changes.",
    "Other": "Use direct instructions, visual priorities, preservation rules and unwanted-result notes."
  };
  return guidance[tool] || guidance.Other;
}

function getModeGuidance(mode) {
  const guidance = {
    balanced: "Use concise but complete instructions, with strong visual direction and practical constraints.",
    regenerate: "Use an alternate wording with the same intent, more confident phrasing and clearer visual hierarchy.",
    short: "Keep this prompt brief, direct and easy to paste while retaining the essential constraints.",
    detailed: "Add production-level detail about lighting, composition, materials, camera language and finishing quality.",
    premium: "Elevate the result with luxury lighting, refined materials, editorial composition and restrained high-end detail."
  };
  return guidance[mode] || guidance.balanced;
}

function transformCurrentPrompt(mode) {
  const current = byId("promptPreview").value.trim();
  if (!current) {
    buildPrompt(mode);
    return;
  }

  if (mode === "short") {
    byId("promptPreview").value = current
      .split("\n\n")
      .filter((line) => !line.startsWith("Quality direction:"))
      .slice(0, 5)
      .join("\n\n") + "\n\nKeep the result polished, accurate and free from random additions.";
  } else if (mode === "detailed") {
    byId("promptPreview").value = `${current}\n\nAdditional detail: specify refined lighting, camera perspective, material accuracy, realistic texture, clear subject separation, balanced composition and a finished professional look. Preserve all requested identity, product, text and layout constraints.`;
  } else if (mode === "premium") {
    byId("promptPreview").value = `${current}\n\nPremium upgrade: make the final image feel like a high-budget creative direction board, with restrained luxury styling, precise light control, elegant negative space, expensive materials and no clutter.`;
  }

  lastPromptMode = mode;
  byId("promptMeta").textContent = `${byId("targetTool").value} / ${mode}`;
  addHistory(byId("promptPreview").value, `Create Prompt / ${mode}`);
}

function convertPrompt() {
  byId("targetTool").value = byId("convertTool").value;
  buildPrompt("regenerate");
}

async function copyText(text, messageElement) {
  if (!text.trim()) return;
  try {
    if (!navigator.clipboard?.writeText) {
      throw new Error("Clipboard API unavailable");
    }
    await navigator.clipboard.writeText(text);
    messageElement.textContent = "Copied. Paste into your AI tool.";
  } catch {
    const temporary = document.createElement("textarea");
    temporary.value = text;
    document.body.appendChild(temporary);
    temporary.select();
    document.execCommand("copy");
    temporary.remove();
    messageElement.textContent = "Copied. Paste into your AI tool.";
  }
  setTimeout(() => {
    messageElement.textContent = "";
  }, 2800);
}

function addHistory(prompt, type) {
  const item = {
    id: newId(),
    type,
    prompt,
    createdAt: new Date().toISOString()
  };
  linkrData.history.unshift(item);
  linkrData.history = linkrData.history.slice(0, 80);
  saveData();
  renderHistory();
}

function saveRecipe() {
  const recipe = {
    id: newId(),
    name: `${byId("outputType").value} / ${byId("visualStyle").value}`,
    createdAt: new Date().toISOString(),
    fields: {
      outputType: byId("outputType").value,
      targetTool: byId("targetTool").value,
      subjectDetails: byId("subjectDetails").value,
      visualStyle: byId("visualStyle").value,
      fidelityLevel: byId("fidelityLevel").value,
      brandKitId: byId("brandKitSelect").value,
      locks: getCheckedValues("locks")
    },
    prompt: byId("promptPreview").value
  };
  linkrData.recipes.unshift(recipe);
  saveData();
  renderRecipes();
  byId("copyMessage").textContent = "Recipe saved.";
  setTimeout(() => byId("copyMessage").textContent = "", 2200);
}

function loadRecipe(recipe) {
  byId("outputType").value = recipe.fields.outputType;
  byId("targetTool").value = recipe.fields.targetTool;
  byId("subjectDetails").value = recipe.fields.subjectDetails;
  byId("visualStyle").value = recipe.fields.visualStyle;
  byId("fidelityLevel").value = recipe.fields.fidelityLevel;
  byId("brandKitSelect").value = recipe.fields.brandKitId || "";
  document.querySelectorAll('input[name="locks"]').forEach((input) => {
    input.checked = recipe.fields.locks.includes(input.value);
  });
  byId("promptPreview").value = recipe.prompt;
  showSection("create");
}

function generateRescuePrompt() {
  const details = byId("rescueDetails").value.trim() || "Fix the described issue while keeping the current image otherwise unchanged.";
  const failures = getCheckedValues("failures");
  const failureText = failures.length ? failures.join("; ") : "The previous result did not follow the requested direction.";
  const prompt = `Recreate the current image with only the following correction… ${details}\n\nProblems to fix: ${failureText}.\n\nPreserve every other successful part of the image, including composition, subject placement, lighting, colours, identity, product shape, text, logo, outfit, pose and background unless directly related to the correction. Do not add new objects, do not change the style, and do not reinterpret the brief.`;
  byId("rescuePreview").value = prompt;
  addHistory(prompt, "Prompt Rescue");
}

function renderStyleCards() {
  byId("styleCards").innerHTML = visualStyles.map((style, index) => `
    <article class="style-card">
      <div class="style-swatch" style="filter:hue-rotate(${index * 24}deg)"></div>
      <h3>${escapeHtml(style)}</h3>
      <p>${escapeHtml(styleDescriptions[style])}</p>
      <button class="ghost-button" data-use-style="${escapeHtml(style)}">Use Style</button>
    </article>
  `).join("");
}

function renderRecipes() {
  const list = byId("recipeList");
  if (!linkrData.recipes.length) {
    list.innerHTML = `<div class="empty-state">No recipes saved yet. Generate a prompt and press Save Recipe.</div>`;
    return;
  }
  list.innerHTML = linkrData.recipes.map((recipe) => `
    <article class="data-card">
      <div>
        <h3>${escapeHtml(recipe.name)}</h3>
        <p>${formatDate(recipe.createdAt)}</p>
      </div>
      <pre>${escapeHtml(recipe.prompt || "No prompt saved.")}</pre>
      <div class="inline-actions">
        <button class="primary-button" data-load-recipe="${recipe.id}">Load</button>
        <button class="ghost-button" data-copy-recipe="${recipe.id}">Copy</button>
        <button class="ghost-button" data-delete-recipe="${recipe.id}">Delete</button>
      </div>
    </article>
  `).join("");
}

function renderBrands() {
  const select = byId("brandKitSelect");
  const selected = select.value;
  select.innerHTML = `<option value="">No brand kit</option>`;
  linkrData.brandKits.forEach((kit) => select.appendChild(createOptionWithValue(kit.id, kit.name)));
  select.value = selected;

  const list = byId("brandList");
  if (!linkrData.brandKits.length) {
    list.innerHTML = `<div class="empty-state">No brand kits yet. Add one here, then use it in Create Prompt.</div>`;
    return;
  }

  list.innerHTML = linkrData.brandKits.map((kit) => `
    <article class="data-card">
      <h3>${escapeHtml(kit.name)}</h3>
      <p><strong>Colours:</strong> ${escapeHtml(kit.colors || "Not set")}</p>
      <p><strong>Tone:</strong> ${escapeHtml(kit.tone || "Not set")}</p>
      <p><strong>Audience:</strong> ${escapeHtml(kit.audience || "Not set")}</p>
      <pre>${escapeHtml([kit.rules, kit.forbidden ? `Avoid: ${kit.forbidden}` : ""].filter(Boolean).join("\n\n") || "No extra rules yet.")}</pre>
      <div class="inline-actions">
        <button class="primary-button" data-use-brand="${kit.id}">Use</button>
        <button class="ghost-button" data-delete-brand="${kit.id}">Delete</button>
      </div>
    </article>
  `).join("");
}

function createOptionWithValue(value, label) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = label;
  return option;
}

function renderHistory() {
  const list = byId("historyList");
  if (!linkrData.history.length) {
    list.innerHTML = `<div class="empty-state">No prompt history yet. Generated prompts will appear here automatically.</div>`;
    return;
  }
  list.innerHTML = linkrData.history.map((item) => `
    <article class="data-card">
      <div>
        <h3>${escapeHtml(item.type)}</h3>
        <p>${formatDate(item.createdAt)}</p>
      </div>
      <pre>${escapeHtml(item.prompt)}</pre>
      <div class="inline-actions">
        <button class="primary-button" data-reuse-history="${item.id}">Reuse</button>
        <button class="ghost-button" data-copy-history="${item.id}">Copy</button>
        <button class="ghost-button" data-delete-history="${item.id}">Delete</button>
      </div>
    </article>
  `).join("");
}

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function showSection(section) {
  document.querySelectorAll(".section-view").forEach((view) => view.classList.remove("active"));
  document.querySelectorAll(".nav-button[data-section]").forEach((button) => button.classList.remove("active"));
  byId(`section-${section}`).classList.add("active");
  document.querySelector(`[data-section="${section}"]`).classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function exportData() {
  const blob = new Blob([JSON.stringify(linkrData, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `linkr-backup-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function importData(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      const isValid = imported
        && Array.isArray(imported.recipes)
        && Array.isArray(imported.history)
        && Array.isArray(imported.brandKits)
        && imported.settings
        && typeof imported.settings === "object";
      if (!isValid) {
        window.alert("That file does not look like a LINKr JSON backup.");
        return;
      }
      linkrData = {
        recipes: imported.recipes,
        history: imported.history,
        brandKits: imported.brandKits,
        settings: imported.settings
      };
      saveData();
      renderAll();
      window.alert("LINKr data imported.");
    } catch {
      window.alert("The JSON file could not be read.");
    }
  };
  reader.readAsText(file);
}

function renderAll() {
  renderStyleCards();
  renderBrands();
  renderRecipes();
  renderHistory();
}

function setupEvents() {
  document.querySelectorAll(".nav-button[data-section]").forEach((button) => {
    button.addEventListener("click", () => showSection(button.dataset.section));
  });

  byId("generatePrompt").addEventListener("click", () => buildPrompt("balanced"));
  byId("targetTool").addEventListener("change", () => {
    byId("convertTool").value = byId("targetTool").value;
  });
  byId("regeneratePrompt").addEventListener("click", () => buildPrompt("regenerate"));
  byId("shorterPrompt").addEventListener("click", () => transformCurrentPrompt("short"));
  byId("detailedPrompt").addEventListener("click", () => transformCurrentPrompt("detailed"));
  byId("premiumPrompt").addEventListener("click", () => transformCurrentPrompt("premium"));
  byId("convertPrompt").addEventListener("click", convertPrompt);
  byId("saveRecipe").addEventListener("click", saveRecipe);
  byId("copyPrompt").addEventListener("click", () => copyText(byId("promptPreview").value, byId("copyMessage")));

  byId("generateRescue").addEventListener("click", generateRescuePrompt);
  byId("copyRescue").addEventListener("click", () => copyText(byId("rescuePreview").value, byId("rescueCopyMessage")));
  byId("saveRescueHistory").addEventListener("click", () => {
    if (byId("rescuePreview").value.trim()) addHistory(byId("rescuePreview").value, "Prompt Rescue");
  });

  byId("brandForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const name = byId("brandName").value.trim();
    if (!name) return;
    linkrData.brandKits.unshift({
      id: newId(),
      name,
      colors: byId("brandColors").value.trim(),
      tone: byId("brandTone").value.trim(),
      audience: byId("brandAudience").value.trim(),
      rules: byId("brandRules").value.trim(),
      forbidden: byId("brandForbidden").value.trim(),
      createdAt: new Date().toISOString()
    });
    saveData();
    event.target.reset();
    renderBrands();
  });

  byId("exportData").addEventListener("click", exportData);
  byId("importData").addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) importData(file);
    event.target.value = "";
  });

  byId("clearHistory").addEventListener("click", () => {
    if (!window.confirm("Clear all prompt history?")) return;
    linkrData.history = [];
    saveData();
    renderHistory();
  });

  document.body.addEventListener("click", (event) => {
    const target = event.target;
    const style = target.dataset.useStyle;
    const recipeLoad = target.dataset.loadRecipe;
    const recipeCopy = target.dataset.copyRecipe;
    const recipeDelete = target.dataset.deleteRecipe;
    const brandUse = target.dataset.useBrand;
    const brandDelete = target.dataset.deleteBrand;
    const historyReuse = target.dataset.reuseHistory;
    const historyCopy = target.dataset.copyHistory;
    const historyDelete = target.dataset.deleteHistory;

    if (style) {
      byId("visualStyle").value = style;
      showSection("create");
      buildPrompt("balanced");
    }

    if (recipeLoad) {
      const recipe = linkrData.recipes.find((item) => item.id === recipeLoad);
      if (recipe) loadRecipe(recipe);
    }

    if (recipeCopy) {
      const recipe = linkrData.recipes.find((item) => item.id === recipeCopy);
      if (recipe) copyText(recipe.prompt, byId("copyMessage"));
    }

    if (recipeDelete) {
      linkrData.recipes = linkrData.recipes.filter((item) => item.id !== recipeDelete);
      saveData();
      renderRecipes();
    }

    if (brandUse) {
      byId("brandKitSelect").value = brandUse;
      showSection("create");
    }

    if (brandDelete) {
      linkrData.brandKits = linkrData.brandKits.filter((item) => item.id !== brandDelete);
      saveData();
      renderBrands();
    }

    if (historyReuse) {
      const item = linkrData.history.find((entry) => entry.id === historyReuse);
      if (item) {
        byId("promptPreview").value = item.prompt;
        showSection("create");
      }
    }

    if (historyCopy) {
      const item = linkrData.history.find((entry) => entry.id === historyCopy);
      if (item) copyText(item.prompt, byId("copyMessage"));
    }

    if (historyDelete) {
      linkrData.history = linkrData.history.filter((item) => item.id !== historyDelete);
      saveData();
      renderHistory();
    }
  });

  byId("promptForm").addEventListener("reset", () => {
    setTimeout(() => {
      document.querySelectorAll('input[name="locks"]').forEach((input) => input.checked = false);
      byId("promptPreview").value = "";
      byId("promptMeta").textContent = "Ready";
    });
  });
}

function init() {
  fillSelect(byId("outputType"), outputTypes);
  fillSelect(byId("targetTool"), aiTools);
  fillSelect(byId("convertTool"), aiTools);
  fillSelect(byId("visualStyle"), visualStyles);
  fillSelect(byId("fidelityLevel"), fidelityLevels);
  fillToggleGrid(byId("lockGrid"), promptLocks, "locks");
  fillToggleGrid(byId("failureGrid"), failureOptions, "failures");
  byId("targetTool").value = linkrData.settings.lastTool || "ChatGPT Image";
  byId("convertTool").value = byId("targetTool").value;
  renderAll();
  setupEvents();
  buildPrompt("balanced");
}

init();
