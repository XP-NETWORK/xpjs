export const Emitter =
  typeof window !== "undefined" ? new EventTarget() : undefined;
