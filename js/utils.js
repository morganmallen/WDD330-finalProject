export function renderWithTemplate(template, parentElement, data, callback) {
  parentElement.innerHTML = template;

  fixPaths();

  if (callback) {
    callback(data);
  }
}

export async function loadTemplate(path) {
  const res = await fetch(path);
  const template = await res.text();
  return template;
}
//Displays the header and the footer on each page. Also ensures that the header and footer partials are found in the project.
export async function loadHeaderFooter() {
  const isInRoot = !window.location.pathname.includes("/pages/");

  const pathPrefix = isInRoot ? "./" : "../";

  const headerTemplate = await loadTemplate(
    `${pathPrefix}partials/header.html`
  );
  const footerTemplate = await loadTemplate(
    `${pathPrefix}partials/footer.html`
  );

  const headerElement = document.querySelector("#header");
  const footerElement = document.querySelector("#footer");

  if (headerElement) {
    renderWithTemplate(headerTemplate, headerElement);
  }

  if (footerElement) {
    renderWithTemplate(footerTemplate, footerElement);
  }
}

//fixes paths for navigation based on current location
function fixPaths() {
  const isInRoot = !window.location.pathname.includes("/pages/");
  const pathPrefix = isInRoot ? "./" : "../";

  const pathElements = document.querySelectorAll(".js-root-path");

  pathElements.forEach((element) => {
    const relativePath = element.getAttribute("data-path");

    if (relativePath) {
      if (element.tagName === "A") {
        element.href = `${pathPrefix}${relativePath}`;
      } else if (element.tagName === "IMG") {
        element.src = `${pathPrefix}${relativePath}`;
      }
    }
  });
}
