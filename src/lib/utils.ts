import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number, decimals = 2): string {
  return n.toFixed(decimals);
}

export function formatPercent(n: number, decimals = 1): string {
  return `${(n * 100).toFixed(decimals)}%`;
}

export function argmax(arr: number[]): number {
  let maxIdx = 0;
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > arr[maxIdx]) maxIdx = i;
  }
  return maxIdx;
}

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function rollingMean(data: number[], windowSize: number): number[] {
  const result: number[] = [];
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum += data[i];
    if (i >= windowSize) sum -= data[i - windowSize];
    result.push(sum / Math.min(i + 1, windowSize));
  }
  return result;
}

const DEFAULT_ARM_CTRS    = [0.25, 0.45, 0.35, 0.20,  0.28, 0.42, 0.38, 0.18,
                              0.22, 0.40, 0.32, 0.15,  0.26, 0.44, 0.36, 0.19];
const DEFAULT_ARM_REVENUE = [3.00, 0.50, 0.60, 0.70,  2.80, 0.55, 0.65, 0.75,
                              2.60, 0.52, 0.68, 0.72,  2.90, 0.53, 0.62, 0.74];

export function generateDefaultArms(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    label: `Ad Slot ${String.fromCharCode(65 + i)}`,
    trueCTR: DEFAULT_ARM_CTRS[i % DEFAULT_ARM_CTRS.length],
    revenuePerClick: DEFAULT_ARM_REVENUE[i % DEFAULT_ARM_REVENUE.length],
  }));
}
