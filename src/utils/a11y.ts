import { Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import type { AxeResults, Result } from "axe-core";

// WCAG 2.1 Level AA tags - industry standard for accessibility compliance
const WCAG_21_AA_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

export type KnownViolation = {
  /** The axe-core rule ID (e.g., 'select-name') */
  id: string;
  /** CSS selector matching the element (e.g., 'select', '.product_sort_container') */
  selector: string;
};

export type A11yScanOptions = {
  /** CSS selector to include in scan */
  include?: string;
  /** CSS selector to exclude from scan */
  exclude?: string;
  /** Override default WCAG tags */
  tags?: string[];
  /** Disable specific axe-core rules */
  disableRules?: string[];
  /** Known violations to allow (baseline) */
  knownViolations?: KnownViolation[];
};

/**
 * Run an accessibility scan on the page using axe-core.
 * Defaults to WCAG 2.1 Level AA compliance checks.
 */
export async function runAccessibilityScan(
  page: Page,
  options: A11yScanOptions = {},
): Promise<AxeResults> {
  let builder = new AxeBuilder({ page }).withTags(
    options.tags ?? WCAG_21_AA_TAGS,
  );

  if (options.include) {
    builder = builder.include(options.include);
  }

  if (options.exclude) {
    builder = builder.exclude(options.exclude);
  }

  if (options.disableRules?.length) {
    builder = builder.disableRules(options.disableRules);
  }

  return builder.analyze();
}

/**
 * Check if a violation node matches a known violation
 */
function isKnownViolation(
  ruleId: string,
  target: string[],
  knownViolations: KnownViolation[],
): boolean {
  const selector = target.join(" > ");
  return knownViolations.some(
    (known) => known.id === ruleId && selector.includes(known.selector),
  );
}

/**
 * Format a single violation for readable output
 */
function formatViolation(violation: Result): string {
  const separator = "━".repeat(80);
  const impact = (violation.impact ?? "unknown").toUpperCase();
  const wcagTags = violation.tags
    .filter((tag) => tag.startsWith("wcag"))
    .join(", ");

  const header = [
    separator,
    `${impact}: ${violation.id}`,
    violation.help,
    wcagTags ? `WCAG: ${wcagTags}` : null,
    `Help: ${violation.helpUrl}`,
    "",
  ]
    .filter(Boolean)
    .join("\n");

  const nodes = violation.nodes
    .map((node, nodeIndex) => {
      const selector = node.target.join(" > ");
      const html =
        node.html.length > 120 ? node.html.slice(0, 120) + "..." : node.html;
      const fix = node.failureSummary
        ?.split("\n")
        .map((line) => `       ${line}`)
        .join("\n");

      return [
        `Element ${nodeIndex + 1} of ${violation.nodes.length}:`,
        `  Selector: ${selector}`,
        `  HTML: ${html}`,
        fix ? `  Fix: ${fix.trim()}` : null,
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");

  return `${header}\n${nodes}\n${separator}`;
}

/**
 * Assert that a page has no accessibility violations.
 * Throws with detailed violation information if any are found.
 * Known violations (baseline) can be provided to allow existing issues.
 */
export async function expectNoViolations(
  page: Page,
  options: A11yScanOptions = {},
): Promise<void> {
  const results = await runAccessibilityScan(page, options);
  const knownViolations = options.knownViolations ?? [];

  // Filter out known violations from each rule
  const newViolations = results.violations
    .map((violation) => ({
      ...violation,
      nodes: violation.nodes.filter(
        (node) =>
          !isKnownViolation(
            violation.id,
            node.target as string[],
            knownViolations,
          ),
      ),
    }))
    .filter((violation) => violation.nodes.length > 0);

  if (newViolations.length > 0) {
    const violationDetails = newViolations.map(formatViolation).join("\n\n");

    throw new Error(
      `Found ${newViolations.length} accessibility violation(s):\n\n${violationDetails}`,
    );
  }
}
