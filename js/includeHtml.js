const VIEWS = {
  base: [
    [".js-theme-html-cookie", "theme/html/cookie.html"],
    [".js-theme-html-navigation", "theme/html/navigation.html"],
    [".js-theme-html-footer", "theme/html/footer.html"],
  ],
  home: [
    [".js-theme-html-main", "theme/html/header.html"],
    [".js-theme-html-main", "theme/html/steps.html"],
    [".js-theme-html-main", "theme/html/count.html"],
    [".js-theme-html-main", "theme/html/layout-card.html"],
    [".js-theme-html-main", "theme/html/write_to_us.html"],
    [".js-theme-html-main", "theme/html/layout-grid.html"],
  ],

  layout_card: [[".js-theme-html-main", "theme/html/layout-card.html"]],
  layout_grid: [[".js-theme-html-main", "theme/html/layout-grid.html"]],

  post: [[".js-theme-html-main", "theme/html/post.html"]],

  contact_basic: [[".js-theme-html-main", "theme/html/contact_basic.html"]],
};

const initCookieControls = () => {
  const viewCookie = document.querySelector(".js-cookie-select");
  const elementCookie = document.querySelector(".js-cookie-html");

  viewCookie.addEventListener("change", (e) => {
    const viewType = e.target.value;
    switch (viewType) {
      case "cookie_hidden":
        elementCookie.classList.remove(
          "cookie--full",
          "cookie--modal",
          "cookie--left"
        );
        elementCookie.classList.add("d_none");
        break;

      case "cookie_full":
        elementCookie.classList.remove(
          "d_none",
          "cookie--modal",
          "cookie--left"
        );
        elementCookie.classList.add("cookie--full");
        break;

      case "cookie_modal":
        elementCookie.classList.remove("d_none", "cookie--full");
        elementCookie.classList.add("cookie--modal", "cookie--left");
        break;

      default:
        elementCookie.classList.remove(
          "cookie--full",
          "cookie--modal",
          "cookie--left"
        );
        elementCookie.classList.add("d_none");
    }
  });
};

const includeHTML = async (target, file) => {
  const response = await fetch(file);
  const data = await response.text();
  document.querySelector(target).innerHTML += data;
};

const loadView = async (viewName) => {
  const view = VIEWS[viewName];
  if (!view) return;

  document.querySelector(".js-theme-html-main").innerHTML = "";

  for (const [target, file] of view) {
    await includeHTML(target, file);
  }

  initCookieControls();
};

const init = () => {
  const viewSelect = document.querySelector(".js-view-select");
  const elementMain = document.querySelector(".js-theme-html-main");
  viewSelect.addEventListener("change", (e) => {
    const viewName = e.target.value;
    if (viewName === "home") {
      elementMain.classList.remove("page_top_margin");
    } else {
      elementMain.classList.add("page_top_margin");
    }
    loadView(viewName);
  });

  for (const [target, file] of VIEWS["base"]) {
    includeHTML(target, file);
  }

  loadView(viewSelect.value);
};

init();
