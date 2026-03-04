/**
 * GSAP Plugin Registry
 *
 * Central place to import and register GSAP plugins. Import GSAP from this
 * module throughout the app so plugins are never registered more than once.
 *
 * Plugins are only registered on the client side (window check) to keep SSR
 * build happy.
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

// Client-only registration
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
}

export { gsap, ScrollTrigger, ScrollToPlugin };
