document.addEventListener("DOMContentLoaded", () => {
  const transition = document.querySelector(".page-transition");
  const currentPath = window.location.pathname;
  const isHome = currentPath === "/" || currentPath === "/index.html";
  const referrer = document.referrer;

  if (isHome && referrer === "") {
    gsap.set(transition, { y: "-100%" });
  } else {
    gsap.to(transition, {
      y: "-100%",
      duration: 0.7,
      ease: "power2.out"
    });
  }

  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute("href");

    if (!href || href.startsWith("http") || href.startsWith("#") || href.startsWith("mailto")) return;

    link.addEventListener("click", (e) => {
      const targetUrl = link.href;
      const targetPath = new URL(targetUrl).pathname;
      const goingToHome = targetPath === "/" || targetPath === "/index.html";

      if (goingToHome) return;

      e.preventDefault();

      gsap.set(transition, { y: "100%" });

      gsap.to(transition, {
        y: "0%",
        duration: 0.7,
        ease: "power2.inOut",
        onComplete: () => {
          window.location.href = targetUrl;
        }
      });
    });
  });
});