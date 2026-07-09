import { BadRequestError } from "./errors.js";

export const calculateCalculatedStock = (purchaseUnit, purchaseQty, packaging = [], saleUnit) => {
  if (!purchaseQty || purchaseQty <= 0) {
    throw new BadRequestError("Purchase quantity must be greater than zero");
  }

  const pUnit = purchaseUnit.trim().toLowerCase();
  const sUnit = saleUnit.trim().toLowerCase();

  if (pUnit === sUnit) {
    return purchaseQty;
  }

  const visited = new Set([pUnit]);
  let currentUnit = pUnit;
  let currentQty = purchaseQty;

  while (currentUnit !== sUnit) {
    const step = packaging.find((s) => s.from.trim().toLowerCase() === currentUnit);
    if (!step) {
      throw new BadRequestError(
        `Packaging conversion chain is incomplete or cannot convert from '${currentUnit}' to sale unit '${sUnit}'`
      );
    }

    const nextUnit = step.to.trim().toLowerCase();
    const factor = Number(step.factor);

    if (isNaN(factor) || factor <= 0) {
      throw new BadRequestError(`Conversion factor must be greater than zero for step ${step.from} -> ${step.to}`);
    }

    if (visited.has(nextUnit)) {
      throw new BadRequestError(`Cyclic conversion path detected at unit: ${nextUnit}`);
    }

    visited.add(nextUnit);
    currentQty = currentQty * factor;
    currentUnit = nextUnit;
  }

  if (!Number.isInteger(currentQty)) {
    throw new BadRequestError("Final calculated quantity must be an integer");
  }

  return currentQty;
};
