// Details help while developing; children using the built app never need them in the console.
export function logDevelopmentError(...details: unknown[]) {
  if (import.meta.env.DEV) {
    console.error(...details);
  }
}
