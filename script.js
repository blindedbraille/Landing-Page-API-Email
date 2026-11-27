// 01. Configuration
const subscriptionDialog = document.querySelector("#subscription");
const subscriptionOpeners = document.querySelectorAll("[data-subscription-open]");
const subscriptionCloseButton = subscriptionDialog.querySelector(
  ".subscription-modal__close",
);
const newsletterForm = document.querySelector("#newsletter-form");
const newsletterEmail = document.querySelector("#newsletter-email");
const newsletterFeedback = document.querySelector("#newsletter-form-feedback");
const newsletterSubmitButton = newsletterForm.querySelector(
  ".newsletter-form__submit",
);
const subscriptionForm = document.querySelector("#subscription-form");
const subscriptionEmail = document.querySelector("#subscription-email");
const subscriptionSubmitButton = subscriptionForm.querySelector(
  ".subscription-form__submit",
);
const subscriptionFeedback = document.querySelector("#subscription-feedback");

let returnFocusTarget = null;
let previousBodyOverflow = "";
let previousScrollY = 0;
let isSubmitting = false;
let isNewsletterSubmitting = false;

// 02. EmailJS
// Both signup forms use the same EmailJS template.
function sendSubscriptionEmail(name, email) {
  const templateParams = { name, email };
  return emailjs.send("service_6nt5tnp", "template_bk1wqio", templateParams);
}

// 03. Subscription Modal
function setFeedback(message, state = "default") {
  subscriptionDialog.dataset.state = state;
  subscriptionFeedback.textContent = message;
}

function resetSubscriptionAttempt(email = "") {
  subscriptionForm.reset();
  subscriptionForm.hidden = false;
  subscriptionEmail.value = email;
  subscriptionEmail.removeAttribute("aria-invalid");
  setFeedback("");
}

function showSubscriptionDialog(trigger) {
  returnFocusTarget = trigger;

  if (!subscriptionDialog.open) {
    previousBodyOverflow = document.body.style.overflow;
    previousScrollY = window.scrollY;
    subscriptionDialog.showModal();
    document.body.style.overflow = "hidden";
  }
}

function openModal(trigger, email = "") {
  showSubscriptionDialog(trigger);
  if (!isSubmitting) {
    resetSubscriptionAttempt(email);
  }

  subscriptionEmail.focus({ preventScroll: true });
}

function openConfirmationModal(trigger, state, message) {
  showSubscriptionDialog(trigger);
  subscriptionForm.hidden = true;
  setFeedback(message, state);
  subscriptionCloseButton.focus({ preventScroll: true });
}

function setNewsletterFeedback(message) {
  newsletterFeedback.textContent = message;
}

function restorePageState() {
  if (subscriptionDialog.open) {
    return;
  }

  document.body.style.overflow = previousBodyOverflow;

  const focusTarget = returnFocusTarget;
  const scrollY = previousScrollY;

  if (focusTarget?.isConnected) {
    focusTarget.focus({ preventScroll: true });
  }

  const previousScrollBehavior = document.documentElement.style.scrollBehavior;
  document.documentElement.style.scrollBehavior = "auto";
  window.scrollTo(0, scrollY);
  document.documentElement.style.scrollBehavior = previousScrollBehavior;
}

function closeModal() {
  if (subscriptionDialog.open) {
    subscriptionDialog.close();
    restorePageState();
  }
}

// 04. Form Validation and Feedback
subscriptionOpeners.forEach((opener) => {
  opener.addEventListener("click", (event) => {
    event.preventDefault();
    openModal(opener);
  });
});

newsletterEmail.addEventListener("invalid", () => {
  setNewsletterFeedback(
    newsletterEmail.validationMessage || "Enter a valid email address.",
  );
});

newsletterEmail.addEventListener("input", () => {
  if (!isNewsletterSubmitting) {
    setNewsletterFeedback("");
  }
});

newsletterForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (isNewsletterSubmitting) {
    return;
  }

  if (!newsletterForm.reportValidity()) {
    return;
  }

  isNewsletterSubmitting = true;
  newsletterSubmitButton.disabled = true;
  setNewsletterFeedback("Sending...");

  try {
    await sendSubscriptionEmail("", newsletterEmail.value.trim());
    newsletterForm.reset();
    setNewsletterFeedback("");
    openConfirmationModal(
      newsletterSubmitButton,
      "success",
      "Thanks for subscribing. Your email has been sent.",
    );
  } catch (error) {
    console.error("EmailJS newsletter submission failed:", error);
    setNewsletterFeedback(
      "We couldn't complete your signup. Please try again.",
    );
  } finally {
    isNewsletterSubmitting = false;
    newsletterSubmitButton.disabled = false;
  }
});

subscriptionCloseButton.addEventListener("click", closeModal);

subscriptionDialog.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    event.preventDefault();
    closeModal();
  }
});

subscriptionDialog.addEventListener("click", (event) => {
  if (event.target !== subscriptionDialog) {
    return;
  }

  const bounds = subscriptionDialog.getBoundingClientRect();
  const clickedOutside =
    event.clientX < bounds.left ||
    event.clientX > bounds.right ||
    event.clientY < bounds.top ||
    event.clientY > bounds.bottom;

  if (clickedOutside) {
    closeModal();
  }
});

subscriptionDialog.addEventListener("close", restorePageState);

subscriptionEmail.addEventListener("invalid", () => {
  subscriptionEmail.setAttribute("aria-invalid", "true");
  setFeedback(
    subscriptionEmail.validationMessage || "Enter a valid email address.",
    "error",
  );
});

subscriptionEmail.addEventListener("input", () => {
  if (subscriptionEmail.hasAttribute("aria-invalid")) {
    subscriptionEmail.removeAttribute("aria-invalid");
    setFeedback("");
  }
});

subscriptionForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (isSubmitting) {
    return;
  }

  if (!subscriptionForm.reportValidity()) {
    return;
  }

  isSubmitting = true;
  subscriptionSubmitButton.disabled = true;
  setFeedback("Sending...");

  try {
    const name = subscriptionForm.elements.namedItem("name").value.trim();
    await sendSubscriptionEmail(name, subscriptionEmail.value.trim());
    subscriptionForm.reset();
    setFeedback("Thanks for subscribing. Your email has been sent.", "success");
    subscriptionForm.hidden = true;
  } catch (error) {
    console.error("EmailJS subscription submission failed:", error);
    setFeedback(
      "We couldn't complete your subscription. Please try again.",
      "error",
    );
  } finally {
    isSubmitting = false;
    subscriptionSubmitButton.disabled = false;
  }
});

// 05. Carousel Configuration
const CAROUSEL_DURATION = 6000;
const WORKS_SHUFFLE_DURATION = 800;
const WORKS_SHUFFLE_EASING = "cubic-bezier(0.65, 0, 0.35, 1)";
const reducedMotionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

function createCarousel({
  slides,
  controls,
  activeClass,
  inactiveClass,
  hideInactiveSlides = false,
  onBeforeChange,
  onChange,
}) {
  const buttons = controls.querySelectorAll(":scope > button");
  const indicators = controls.querySelectorAll(":scope > .carousel-status");
  let activeIndex = Math.max(
    0,
    [...slides].findIndex((slide) => slide.classList.contains(activeClass)),
  );
  let autoplayTimer;
  let lastDirection = 1;
  let manualRestartActive = false;

  function slideLabel(slide) {
    const title = slide.querySelector(".artwork__title")?.textContent.trim();
    const artist = slide.querySelector(".artwork__artist")?.textContent.trim();
    return [title, artist].filter(Boolean).join(", ");
  }

  function render() {
    slides.forEach((slide, index) => {
      const isActive = index === activeIndex;
      slide.classList.toggle(activeClass, isActive);
      if (inactiveClass) {
        slide.classList.toggle(inactiveClass, !isActive);
      }
      if (hideInactiveSlides) {
        slide.setAttribute("aria-hidden", String(!isActive));
      }
      if (isActive) {
        slide.setAttribute("aria-current", "true");
      } else {
        slide.removeAttribute("aria-current");
      }
    });

    const activeWidth = 56;
    const inactiveWidth = 14;
    const indicatorGap = 6;
    const indicatorArea = activeWidth + (indicators.length - 1) * (inactiveWidth + indicatorGap);
    let indicatorOffset = 0;

    indicators.forEach((indicator, index) => {
      const isActive = index === activeIndex;
      const width = isActive ? activeWidth : inactiveWidth;
      indicator.style.setProperty("--indicator-offset", `${indicatorOffset}px`);
      indicator.style.setProperty("--indicator-width", `${width}px`);
      indicatorOffset += width + indicatorGap;
      indicator.classList.toggle("is-active", isActive);
      indicator.setAttribute("aria-hidden", String(!isActive));

      const announcement = indicator.querySelector(".visually-hidden");
      if (announcement) {
        announcement.textContent = isActive
          ? `Slide ${index + 1} of ${slides.length}: ${slideLabel(slides[index])}`
          : "";
      }
    });

    controls.style.setProperty("--indicator-area", `${indicatorArea}px`);
    onChange?.(activeIndex, lastDirection);
  }

  function resetProgress() {
    indicators.forEach((indicator) => {
      indicator.classList.remove("is-active");
    });

    const activeIndicator = indicators[activeIndex];
    activeIndicator.style.setProperty("--carousel-duration", `${CAROUSEL_DURATION}ms`);
    void controls.offsetWidth;
    activeIndicator.classList.add("is-active");
  }

  function pause() {
    window.clearTimeout(autoplayTimer);
    manualRestartActive = false;
    controls.classList.add("is-paused");
  }

  function scheduleAutoplay(forceManualRestart = false) {
    window.clearTimeout(autoplayTimer);
    resetProgress();

    const shouldPause =
      reducedMotionPreference.matches ||
      document.hidden ||
      (!forceManualRestart &&
        (controls.matches(":hover") ||
          controls.contains(document.activeElement)));

    controls.classList.toggle("is-paused", shouldPause);
    if (shouldPause) {
      return;
    }

    autoplayTimer = window.setTimeout(() => move(1), CAROUSEL_DURATION);
  }

  function move(direction, isManualChange = false) {
    onBeforeChange?.();
    activeIndex = (activeIndex + direction + slides.length) % slides.length;
    manualRestartActive = isManualChange;
    lastDirection = direction;
    render();
    scheduleAutoplay(isManualChange);
  }

  buttons[0].addEventListener("click", () => move(-1, true));
  buttons[buttons.length - 1].addEventListener("click", () => move(1, true));
  controls.addEventListener("pointerenter", () => {
    if (!manualRestartActive) {
      pause();
    }
  });
  controls.addEventListener("pointerleave", () => scheduleAutoplay(manualRestartActive));
  controls.addEventListener("focusin", () => {
    if (!manualRestartActive) {
      pause();
    }
  });
  controls.addEventListener("focusout", () => {
    window.requestAnimationFrame(() => {
      if (!controls.contains(document.activeElement)) {
        scheduleAutoplay(manualRestartActive);
      }
    });
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      pause();
    } else {
      scheduleAutoplay();
    }
  });
  reducedMotionPreference.addEventListener("change", scheduleAutoplay);

  render();
  scheduleAutoplay();

}

// 06. Hero Carousel
const heroSlides = document.querySelectorAll(".hero__artwork > .artwork--hero");
const heroCaptionTitle = document.querySelector(".hero__caption-copy .artwork__title");
const heroCaptionArtist = document.querySelector(".hero__caption-copy .artwork__artist");

function updateHeroCaption(activeIndex) {
  if (!heroSlides[activeIndex]) return;
  const title = heroSlides[activeIndex].querySelector(".artwork__title")?.textContent.trim();
  const artist = heroSlides[activeIndex].querySelector(".artwork__artist")?.textContent.trim();
  heroCaptionTitle.textContent = title || "";
  heroCaptionArtist.textContent = artist || "";
}

createCarousel({
  slides: heroSlides,
  controls: document.querySelector(".hero__carousel-controls"),
  activeClass: "is-active",
  hideInactiveSlides: true,
  onChange: updateHeroCaption,
});

// 07. Selected Works Carousel
const worksTrack = document.querySelector("#selected-works > .works-carousel__list");
const worksSlides = worksTrack.querySelectorAll(".works-carousel__item");
const worksControls = document.querySelector("#selected-works .works-carousel__controls");
const worksControlsRow = worksControls.closest(".works-carousel");
const worksViewport = document.querySelector("#selected-works");
const worksImages = [...worksSlides].map((slide) =>
  slide.querySelector(".artwork__image"),
);
worksImages.forEach((image) => {
  image.loading = "eager";
});

let worksPositions = new Map();
let worksImagesDecoded = false;
const worksImagesReady = Promise.all(
  worksImages.map((image) => image.decode()),
).then(
  () => {
    worksImagesDecoded = true;
  },
  (error) => {
    console.error("Selected Works image decoding failed:", error);
  },
);

function captureWorksPositions() {
  const viewportLeft = worksViewport.getBoundingClientRect().left;

  return new Map(
    [...worksSlides].map((slide) => {
      const { left, right, width, height } = slide.getBoundingClientRect();
      return [
        slide,
        {
          rect: {
            left: left - viewportLeft,
            right: right - viewportLeft,
            width,
            height,
          },
          opacity: Number.parseFloat(getComputedStyle(slide).opacity),
        },
      ];
    }),
  );
}

function animateWorksShuffle(previousPositions, nextPositions, wrapSlide, direction) {
  const viewportBounds = worksViewport.getBoundingClientRect();
  const viewportRight = viewportBounds.width;
  const restingTransform = "translateX(0px) scale(1, 1)";
  const animations = [];

  worksSlides.forEach((slide) => {
    const previous = previousPositions.get(slide);
    const next = nextPositions.get(slide);
    if (!previous || !next || !next.rect.width || !next.rect.height) {
      return;
    }

    const previousCenterX = previous.rect.left + previous.rect.width / 2;
    const nextCenterX = next.rect.left + next.rect.width / 2;
    const dx = previousCenterX - nextCenterX;
    const scaleX = previous.rect.width / next.rect.width;
    const scaleY = previous.rect.height / next.rect.height;
    const startTransform =
      `translateX(${dx}px) scale(${scaleX}, ${scaleY})`;
    const keyframes =
      slide === wrapSlide
        ? [
            {
              offset: 0,
              transform: startTransform,
              transformOrigin: "center center",
              opacity: previous.opacity,
            },
            {
              offset: 0.45,
              transform:
                `translateX(${direction > 0
                  ? -next.rect.right
                  : viewportRight - next.rect.left}px) ` +
                "scale(1, 1)",
              transformOrigin: "center center",
              opacity: 0,
            },
            {
              offset: 0.55,
              transform: restingTransform,
              transformOrigin: "center center",
              opacity: 0,
            },
            {
              offset: 1,
              transform: restingTransform,
              transformOrigin: "center center",
              opacity: next.opacity,
            },
          ]
        : [
            {
              transform: startTransform,
              transformOrigin: "center center",
              opacity: previous.opacity,
            },
            {
              transform: restingTransform,
              transformOrigin: "center center",
              opacity: next.opacity,
            },
          ];

    slide.style.willChange = "transform, opacity";
    const animation = slide.animate(keyframes, {
      duration: WORKS_SHUFFLE_DURATION,
      easing: WORKS_SHUFFLE_EASING,
      fill: "both",
    });
    animation.pause();
    animation.onfinish = () => {
      animation.cancel();
      slide.style.willChange = "";
    };
    animations.push({ animation, slide });
  });

  worksImagesReady.then(() => {
    animations.forEach(({ animation, slide }) => {
      if (animation.playState !== "paused") {
        return;
      }

      if (worksImagesDecoded) {
        animation.play();
      } else {
        animation.cancel();
        slide.style.willChange = "";
      }
    });
  });
}

function cancelWorksAnimations() {
  worksSlides.forEach((slide) => {
    slide.getAnimations().forEach((animation) => animation.cancel());
    slide.style.willChange = "";
  });
}

function arrangeSelectedWorks(activeIndex, direction = 1) {
  const count = worksSlides.length;
  if (count < 3) return;

  const previousPositions = worksPositions;
  const shouldAnimate =
    previousPositions.size === count && !reducedMotionPreference.matches;
  const previousOrder = [...worksTrack.children];
  const wrapSlide =
    direction > 0 ? previousOrder[0] : previousOrder[previousOrder.length - 1];
  const previousIndex = (activeIndex - 1 + count) % count;
  const nextIndex = (activeIndex + 1) % count;
  const orderedSlides = [
    worksSlides[previousIndex],
    worksSlides[activeIndex],
    worksSlides[nextIndex],
  ];

  orderedSlides.forEach((slide) => worksTrack.appendChild(slide));
  worksTrack.dataset.direction = direction > 0 ? "next" : "previous";
  centerCurrentWork();

  const nextPositions = captureWorksPositions();
  if (shouldAnimate) {
    animateWorksShuffle(previousPositions, nextPositions, wrapSlide, direction);
  }
  worksPositions = nextPositions;
}

function centerCurrentWork() {
  const currentSlide = worksSlides[[...worksSlides].findIndex((slide) =>
    slide.classList.contains("works-carousel__item--current"),
  )];
  const viewportBounds = worksViewport.getBoundingClientRect();
  const slideBounds = currentSlide.getBoundingClientRect();
  const controlsBounds = worksControlsRow.getBoundingClientRect();
  const viewportCenter = viewportBounds.left + viewportBounds.width / 2;
  const transformValue = getComputedStyle(worksTrack).transform;
  const currentTranslateX =
    transformValue === "none" ? 0 : new DOMMatrixReadOnly(transformValue).m41;
  const slideCenter = slideBounds.left + slideBounds.width / 2 - currentTranslateX;
  const translateX = viewportCenter - slideCenter;
  const activeLeft = viewportCenter - slideBounds.width / 2;

  worksTrack.style.transform = `translate3d(${translateX}px, 0, 0)`;
  worksTrack.classList.add("is-positioned");
  worksControlsRow.style.setProperty(
    "--selected-controls-offset",
    `${Math.max(0, activeLeft - controlsBounds.left)}px`,
  );
}

createCarousel({
  slides: worksSlides,
  controls: worksControls,
  activeClass: "works-carousel__item--current",
  inactiveClass: "works-carousel__item--preview",
  onBeforeChange: () => {
    worksPositions = captureWorksPositions();
    cancelWorksAnimations();
  },
  onChange: arrangeSelectedWorks,
});

let worksLayoutFrame;
window.addEventListener("resize", () => {
  window.cancelAnimationFrame(worksLayoutFrame);
  worksLayoutFrame = window.requestAnimationFrame(() => {
    cancelWorksAnimations();
    centerCurrentWork();
    worksPositions = captureWorksPositions();
  });
});

// 08. Cursor Glow
const cursorGlow = document.querySelector(".cursor-glow");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

if (cursorGlow && finePointer.matches) {
  let cursorFrame;

  window.addEventListener("pointermove", (event) => {
    window.cancelAnimationFrame(cursorFrame);
    cursorFrame = window.requestAnimationFrame(() => {
      cursorGlow.style.left = `${event.clientX}px`;
      cursorGlow.style.top = `${event.clientY}px`;
      cursorGlow.classList.add("is-visible");
    });
  });

  document.documentElement.addEventListener("pointerleave", () => {
    cursorGlow.classList.remove("is-visible");
  });
}

// 09. Artist Interactions
const artistsFrame = document.querySelector(".artwork--artists");
const artistBaseImage = artistsFrame?.querySelector(".artwork__image:not(.artwork__image--preview)");
const artistPreviewImage = artistsFrame?.querySelector(".artwork__image--preview");
const artistSummaries = document.querySelectorAll(".artist-list__summary");
let selectedArtistImage = artistBaseImage?.src || "";
let artistPreviewToken = 0;

function previewArtist(summary) {
  if (!artistsFrame || !artistPreviewImage) return;
  const token = ++artistPreviewToken;
  const src = summary.dataset.artistImage;
  if (!src) return;

  artistPreviewImage.onload = null;
  artistPreviewImage.src = src;
  artistPreviewImage.alt = summary.dataset.artistAlt || "";

  window.requestAnimationFrame(() => {
    if (token === artistPreviewToken) {
      artistsFrame.classList.add("is-previewing");
    }
  });
}

function restoreSelectedArtist() {
  artistPreviewToken++;
  artistsFrame?.classList.remove("is-previewing");
}

function selectArtist(summary) {
  if (!artistsFrame || !artistBaseImage || !artistPreviewImage) return;
  const src = summary.dataset.artistImage;
  if (!src) return;

  const token = ++artistPreviewToken;
  selectedArtistImage = new URL(src, window.location.href).href;
  artistPreviewImage.alt = summary.dataset.artistAlt || "";
  artistPreviewImage.src = src;
  artistsFrame.classList.add("is-previewing");

  window.requestAnimationFrame(() => {
    if (token !== artistPreviewToken) return;
    artistBaseImage.src = src;
    artistBaseImage.alt = summary.dataset.artistAlt || "";
    window.setTimeout(() => {
      if (token === artistPreviewToken) {
        artistsFrame.classList.remove("is-previewing");
      }
    }, 360);
  });
}

// 10. Artist Event Binding
artistSummaries.forEach((summary) => {
  summary.addEventListener("pointerenter", () => previewArtist(summary));
  summary.addEventListener("pointerleave", restoreSelectedArtist);
  summary.addEventListener("focus", () => previewArtist(summary));
  summary.addEventListener("blur", restoreSelectedArtist);
  summary.addEventListener("click", () => selectArtist(summary));
});
