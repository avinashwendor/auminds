if (window.innerWidth > 780) {

var _____WB$wombat$assign$function_____ = function(name) {return (self._wb_wombat && self._wb_wombat.local_init && self._wb_wombat.local_init(name)) || self[name]; };
if (!self.__WB_pmw) { self.__WB_pmw = function(obj) { this.__WB_source = obj; return this; } }
{
  let window = _____WB$wombat$assign$function_____("window");
  let self = _____WB$wombat$assign$function_____("self");
  let document = _____WB$wombat$assign$function_____("document");
  let location = _____WB$wombat$assign$function_____("location");
  let top = _____WB$wombat$assign$function_____("top");
  let parent = _____WB$wombat$assign$function_____("parent");
  let frames = _____WB$wombat$assign$function_____("frames");
  let opener = _____WB$wombat$assign$function_____("opener");

gsap.registerPlugin(ScrollTrigger);
Splitting();

// Lenis smooth scrolling
let lenis;

// Initialize Lenis smooth scrolling
const initSmoothScrolling = () => {
  lenis = new Lenis({
    lerp: 0.2,
    smooth: true
  });

  lenis.on("scroll", () => ScrollTrigger.update());

  const scrollFn = (time) => {
    lenis.raf(time);
    requestAnimationFrame(scrollFn);
  };

  requestAnimationFrame(scrollFn);
};

const type1 = [...document.querySelectorAll("[data-splitting][data-effect1]")];

const type2 = [...document.querySelectorAll("[data-splitting][data-effect2]")];

const type3 = [...document.querySelectorAll("[data-splitting][data-effect3]")];

const type4 = [...document.querySelectorAll("[data-splitting][data-effect4]")];

const type5 = [...document.querySelectorAll("[data-splitting][data-effect5]")];

const type6 = [...document.querySelectorAll("[data-splitting][data-effect6]")];

const type7 = [...document.querySelectorAll("[data-splitting][data-effect7]")];

const type8 = [...document.querySelectorAll("[data-splitting][data-effect8]")];

const type9 = [...document.querySelectorAll("[data-splitting][data-effect9]")];

const type10 = [
  ...document.querySelectorAll("[data-splitting][data-effect10]")
];

const scroll = () => {
  type1.forEach((title) => {
    gsap.fromTo(
      title,
      {
        transformOrigin: "0% 50%",
        rotate: 3
      },
      {
        ease: "none",
        rotate: 0,
        scrollTrigger: {
          trigger: title,
          start: "top bottom",
          end: "top top",
          scrub: true
        }
      }
    );

    gsap.fromTo(
      title.querySelectorAll(".word"),
      {
        "will-change": "opacity",
        opacity: 0.1
      },
      {
        ease: "none",
        opacity: 1,
        stagger: 0.05,
        scrollTrigger: {
          trigger: title,
          start: "top bottom-=20%",
          end: "center top+=20%",
          scrub: true
        }
      }
    );
  });

  type2.forEach((title) => {
    const chars = title.querySelectorAll(".char");

    chars.forEach((char) => gsap.set(char.parentNode, { perspective: 1000 }));

    gsap.fromTo(
      chars,
      {
        "will-change": "opacity, transform",
        opacity: 0,
        rotateX: () => gsap.utils.random(-120, 120),
        z: () => gsap.utils.random(-200, 200)
      },
      {
        ease: "none",
        opacity: 1,
        rotateX: 0,
        z: 0,
        stagger: 0.02,
        scrollTrigger: {
          trigger: title,
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      }
    );
  });

  type3.forEach((title) => {
    const chars = title.querySelectorAll(".char");

    chars.forEach((char) => gsap.set(char.parentNode, { perspective: 1000 }));

    gsap.fromTo(
      chars,
      {
        "will-change": "opacity, transform",
        opacity: 0.2,
        z: -800
      },
      {
        ease: "back.out(1.2)",
        opacity: 1,
        z: 0,
        stagger: 0.04,
        scrollTrigger: {
          trigger: title,
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      }
    );
  });

  type4.forEach((title) => {
    const chars = title.querySelectorAll(".char");

    chars.forEach((char) => gsap.set(char.parentNode, { perspective: 1000 }));

    gsap.fromTo(
      chars,
      {
        "will-change": "opacity, transform",
        transformOrigin: "50% 0%",
        opacity: 0,
        rotationX: -90,
        z: -200
      },
      {
        ease: "power1",
        opacity: 1,
        stagger: 0.05,
        rotationX: 0,
        z: 0,
        scrollTrigger: {
          trigger: title,
          start: "center bottom",
          end: "bottom top+=20%",
          scrub: true
        }
      }
    );
  });

  type5.forEach((title) => {
    const chars = title.querySelectorAll(".char");

    chars.forEach((char) => gsap.set(char.parentNode, { perspective: 1000 }));

    gsap.fromTo(
      chars,
      {
        "will-change": "opacity, transform",
        transformOrigin: "50% 100%",
        opacity: 0,
        rotationX: 90
      },
      {
        ease: "power4",
        opacity: 1,
        stagger: {
          each: 0.03,
          from: "random"
        },
        rotationX: 0,
        scrollTrigger: {
          trigger: title,
          start: "center bottom",
          end: "bottom top+=20%",
          scrub: true
        }
      }
    );
  });

  type6.forEach((title) => {
    const words = [...title.querySelectorAll(".word")];

    for (const word of words) {
      const chars = word.querySelectorAll(".char");

      chars.forEach((char) => gsap.set(char.parentNode, { perspective: 2000 }));

      gsap.fromTo(
        chars,
        {
          "will-change": "opacity, transform",
          opacity: 0,
          y: (position, _, arr) => -40 * Math.abs(position - arr.length / 2),
          z: () => gsap.utils.random(-1500, -600),
          rotationX: () => gsap.utils.random(-500, -200)
        },
        {
          ease: "power1.inOut",
          opacity: 1,
          y: 0,
          z: 0,
          rotationX: 0,
          stagger: {
            each: 0.06,
            from: "center"
          },
          scrollTrigger: {
            trigger: word,
            start: "top bottom",
            end: "top top+=15%",
            scrub: true
          }
        }
      );
    }
  });

  type7.forEach((title) => {
    const chars = title.querySelectorAll(".char");
    const charsTotal = chars.length;

    gsap.fromTo(
      chars,
      {
        "will-change": "transform",
        y: (position) => {
          const factor =
            position < Math.ceil(charsTotal / 2)
              ? position
              : Math.ceil(charsTotal / 2) -
                Math.abs(Math.floor(charsTotal / 2) - position) -
                1;
          return (charsTotal / 2 - factor + 6) * 130;
        }
      },
      {
        ease: "elastic.out(.4)",
        y: 0,
        stagger: {
          amount: 0.1,
          from: "center"
        },
        scrollTrigger: {
          trigger: title,
          start: "top bottom",
          end: "bottom top-=50%",
          scrub: true
        }
      }
    );
  });

  type8.forEach((title) => {
    gsap.fromTo(
      title.querySelectorAll(".char"),
      {
        "will-change": "transform",
        transformOrigin: "50% 100%",
        scaleY: 0
      },
      {
        ease: "power3.in",
        opacity: 1,
        scaleY: 1,
        stagger: 0.05,
        scrollTrigger: {
          trigger: title,
          start: "center center",
          end: "+=500%",
          scrub: true,
          pin: title.parentNode
        }
      }
    );
  });

  type9.forEach((title) => {
    const words = [...title.querySelectorAll(".word")];

    for (const word of words) {
      const chars = word.querySelectorAll(".char");
      const charsTotal = chars.length;

      gsap.fromTo(
        chars,
        {
          "will-change": "transform, filter",
          transformOrigin: "50% 100%",
          scale: (position) => {
            const factor =
              position < Math.ceil(charsTotal / 2)
                ? position
                : Math.ceil(charsTotal / 2) -
                  Math.abs(Math.floor(charsTotal / 2) - position) -
                  1;
            return gsap.utils.mapRange(
              0,
              Math.ceil(charsTotal / 2),
              0.5,
              2.1,
              factor
            );
          },
          y: (position) => {
            const factor =
              position < Math.ceil(charsTotal / 2)
                ? position
                : Math.ceil(charsTotal / 2) -
                  Math.abs(Math.floor(charsTotal / 2) - position) -
                  1;
            return gsap.utils.mapRange(
              0,
              Math.ceil(charsTotal / 2),
              0,
              60,
              factor
            );
          },
          rotation: (position) => {
            const factor =
              position < Math.ceil(charsTotal / 2)
                ? position
                : Math.ceil(charsTotal / 2) -
                  Math.abs(Math.floor(charsTotal / 2) - position) -
                  1;
            return position < charsTotal / 2
              ? gsap.utils.mapRange(0, Math.ceil(charsTotal / 2), -4, 0, factor)
              : gsap.utils.mapRange(0, Math.ceil(charsTotal / 2), 0, 4, factor);
          },
          filter: "blur(12px) opacity(0)"
        },
        {
          ease: "power2.inOut",
          y: 0,
          rotation: 0,
          scale: 1,
          filter: "blur(0px) opacity(1)",
          scrollTrigger: {
            trigger: word,
            start: "top bottom+=40%",
            end: "top top+=15%",
            scrub: true
          },
          stagger: {
            amount: 0.15,
            from: "center"
          }
        }
      );
    }
  });

  type10.forEach((title) => {
    const words = [...title.querySelectorAll(".word")];

    words.forEach((word) => gsap.set(word.parentNode, { perspective: 1000 }));

    gsap.fromTo(
      words,
      {
        "will-change": "opacity, transform",
        z: () => gsap.utils.random(500, 950),
        opacity: 0,
        xPercent: (pos) => gsap.utils.random(-100, 100),
        yPercent: (pos) => gsap.utils.random(-10, 10),
        rotationX: () => gsap.utils.random(-90, 90)
      },
      {
        ease: "expo",
        opacity: 1,
        rotationX: 0,
        rotationY: 0,
        xPercent: 0,
        yPercent: 0,
        z: 0,
        scrollTrigger: {
          trigger: title,
          start: "center center",
          end: "+=300%",
          scrub: true,
          pin: title.parentNode
        },
        stagger: {
          each: 0.006,
          from: "random"
        }
      }
    );
  });
};

initSmoothScrolling();
// GSAP Scroll Triggers
scroll();

}
  };