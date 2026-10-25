import { initTheme } from './theme-mode.ts';

/* A separate, blocking entry point, loaded in the head before the stylesheet,
   so the first paint already uses the visitor's scheme. Hugo compiles this on
   its own; the deferred bundle in index.ts re-applies it and wires the button. */
initTheme();
