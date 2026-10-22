import axe from 'axe-core';

// index.html sets lang="en"; the jsdom test document does not.
// jsdom does not render, so axe cannot compute colors; contrast is checked separately (see AI_LOG.md).
export async function axeViolations(context: Element | Document = document) {
  document.documentElement.lang = 'en';
  const results = await axe.run(context, {
    rules: { 'color-contrast': { enabled: false } },
  });
  return results.violations.map(
    (violation) =>
      `${violation.id}: ${violation.help} (${violation.nodes.map((node) => node.target.join(' ')).join(', ')})`,
  );
}
