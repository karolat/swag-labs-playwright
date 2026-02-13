export const parseCurrencyFromLabel = (label: string, kind: string): number => {
  const match = label.match(/\$([0-9]+(?:\.[0-9]{2})?)/);
  if (!match) {
    throw new Error(`Unable to parse ${kind} from label: "${label}"`);
  }

  return Number(match[1]);
};
