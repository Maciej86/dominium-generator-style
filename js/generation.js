// Creating a table with sections
const parseThemeWithSections = (text) => {
  const lines = text.split("\n");
  const sections = [];
  let currentSection = { name: "Pozostałe", vars: [] };

  const sectionRegex = /\/\*\s*=\s*(.*?)\s*=\s*\*\//;
  const varRegex = /^--([a-zA-Z0-9-_]+):\s*(.*?);$/;

  lines.forEach((line) => {
    const trimmed = line.trim();

    const sectionMatch = trimmed.match(sectionRegex);
    if (sectionMatch) {
      if (currentSection.vars.length > 0) sections.push(currentSection);
      currentSection = { name: sectionMatch[1], vars: [] };
      return;
    }

    const varMatch = trimmed.match(varRegex);
    if (varMatch) {
      currentSection.vars.push({
        key: `--${varMatch[1]}`,
        val: varMatch[2],
      });
    }
  });

  if (currentSection.vars.length > 0) sections.push(currentSection);

  return sections;
};

// View section global vars
const renderGlobalVars = (vars) => {
  const container = document.querySelector(".js-vars-form");

  const wrapper = document.createElement("div");
  wrapper.classList.add("box_section");

  wrapper.innerHTML = `
    <div class="box_vars_header js-header-vars-global" data-global="true">
      <strong>GLOBALNE ZMIENNE</strong>
    </div>
    <div class="box_vars_body js-body-vars" style="display: none;"></div>
  `;

  const body = wrapper.querySelector(".js-body-vars");

  vars.forEach((v) => {
    const row = document.createElement("div");
    row.innerHTML = `
    <label>${v.key}</label>
    <input data-type="global" data-var="${v.key}" value="${v.val}">
  `;
    body.appendChild(row);
  });

  container.prepend(wrapper);

  const header = wrapper.querySelector(".js-header-vars-global");
  header.addEventListener("click", () => {
    body.style.display = body.style.display === "none" ? "block" : "none";
    header.classList.toggle("active");
  });
};

// Clear old global vars
const clearGlobalVars = () => {
  const container = document.querySelector(".js-vars-form");
  const old = container.querySelector(".js-header-vars-global");

  if (old) {
    old.parentElement.remove(); // usuwa cały wrapper GLOBALNE ZMIENNE
  }
};

// View sections theme
const renderSections = (sections) => {
  const container = document.querySelector(".js-vars-form");

  sections.forEach((section, index) => {
    const wrapper = document.createElement("div");
    wrapper.classList.add("box_section");

    wrapper.innerHTML = `
    <div class="box_vars_header js-header-vars" data-index="${index}">
        <strong>${section.name}</strong>
    </div>
    <div class="box_vars_body js-body-vars js-section-${index}" style="display: none;"></div>
  `;
    container.appendChild(wrapper);

    const body = wrapper.querySelector(".js-body-vars");

    section.vars.forEach((v) => {
      const row = document.createElement("div");
      row.innerHTML = `
      <label>${v.key}</label>
      <input data-type="theme" data-var="${v.key}" value="${v.val}">
    `;
      body.appendChild(row);
    });
  });

  // Obsługa rozwijania sekcji
  document.querySelectorAll(".js-header-vars").forEach((el) => {
    el.addEventListener("click", () => {
      const index = el.dataset.index;
      if (index !== undefined) {
        const body = document.querySelector(".js-section-" + index);
        body.style.display = body.style.display === "none" ? "block" : "none";
        el.classList.toggle("active");
      } else {
        const body = el.nextElementSibling;
        body.style.display = body.style.display === "none" ? "block" : "none";
        el.classList.toggle("active");
      }
    });
  });

  attachListeners();
};

// Input field support
const attachListeners = () => {
  document.querySelectorAll(".js-vars-form input").forEach((input) => {
    input.addEventListener("input", (e) => {
      const key = e.target.dataset.var;
      const val = e.target.value;
      const type = e.target.dataset.type;

      if (type === "global") {
        document.documentElement.style.setProperty(key, val);
      } else {
        document.body.style.setProperty(key, val);
      }
    });
  });
};

// Load global globalne
const loadGlobalVars = () => {
  clearGlobalVars();

  const text = document.querySelector(".js-global-vars").value;
  const lines = text.split("\n");
  const varRegex = /^--([a-zA-Z0-9-_]+):\s*(.*?);$/;
  const vars = [];

  lines.forEach((line) => {
    const trimmed = line.trim();
    const match = trimmed.match(varRegex);
    if (match) {
      const key = `--${match[1]}`;
      const val = match[2];
      vars.push({ key, val });
      document.documentElement.style.setProperty(key, val);
    }
  });

  renderGlobalVars(vars);
  attachListeners();
};

// Load theme vars
const loadThemeVars = () => {
  const text = document.querySelector(".js-theme-vars").value;
  const sections = parseThemeWithSections(text);

  sections.forEach((s) =>
    s.vars.forEach((v) => document.body.style.setProperty(v.key, v.val))
  );

  renderSections(sections);
};

// Generation CSS
const generationCss = () => {
  const themeName =
    document.querySelector(".js-theme-name").value.trim() || "theme-dark";
  let css = `.${themeName} {\n`;

  const allSections = {};

  document.querySelectorAll(".js-vars-form input").forEach((inp) => {
    const parentSection = inp
      .closest(".box_section")
      .querySelector(".box_vars_header strong").textContent;
    if (!allSections[parentSection]) allSections[parentSection] = [];
    allSections[parentSection].push(`  ${inp.dataset.var}: ${inp.value};`);
  });

  for (const sectionName in allSections) {
    css += `  /* = ${sectionName} = */\n`;
    css += allSections[sectionName].join("\n") + "\n";
  }

  css += "}\n";

  document.querySelector(".js-output").textContent = css;
  document.querySelector(".js-modal").style.display = "flex";
};

// Close Modal
const closeModal = () => {
  document.querySelector(".js-modal").style.display = "none";
};

// Download CSS
const downloadCSS = () => {
  const cssContent = document.querySelector(".js-output").textContent;
  const blob = new Blob([cssContent], { type: "text/css" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${
    document.querySelector(".js-theme-name").value || "theme"
  }.css`;
  a.click();

  URL.revokeObjectURL(url); // czyścimy pamięć
};

const initApp = () => {
  const appMain = document.querySelector(".js-app-main");
  if (!appMain) {
    return;
  }

  const actionLoadGlobalVars = document.querySelector(".js-load-global-vars");
  const actionLoadThemeVars = document.querySelector(".js-load-theme-vars");
  const showThemeVars = document.querySelector(".js-show-theme-css");
  const hiddenThemeVars = document.querySelectorAll(".js-hidden-theme-css");
  const elementsDownloadCSS = document.querySelectorAll(".js-download-css");

  actionLoadGlobalVars.addEventListener("click", () => {
    loadGlobalVars();
    actionLoadGlobalVars.textContent = "Odśwież zmienne globalne";
  });

  actionLoadThemeVars.addEventListener("click", () => {
    loadThemeVars();
    actionLoadThemeVars.setAttribute("disabled", true);
  });

  showThemeVars.addEventListener("click", () => {
    generationCss();
  });

  hiddenThemeVars.forEach((item) => {
    item.addEventListener("click", () => {
      closeModal();
    });
  });

  elementsDownloadCSS.forEach((item) => {
    item.addEventListener("click", () => {
      generationCss();
      downloadCSS();
    });
  });
};

initApp();
