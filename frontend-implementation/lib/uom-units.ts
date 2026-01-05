// Comprehensive list of all UOM units - Bangladesh RMG Industry Standard
export const uomUnits = [
  // Length & Linear Measurements
  "Meter (M)",
  "Centimeter (CM)",
  "Kilometer (KM)",
  "Yard (YD)",
  "Inch (IN)",
  "Foot (FT)",

  // Weight & Mass Measurements
  "Kilogram (KG)",
  "Gram (G)",
  "Milligram (MG)",
  "Metric Ton (MT)",
  "Pound (LB)",
  "Ounce (OZ)",

  // Quantity Units (Counting/Pieces)
  "Piece (Pcs)",
  "Set (SET)",
  "Dozen (DZN)",
  "Gross (GRO)",
  "Great Gross (GG)",
  "Ream (RM)",

  // Packaging & Shipping Units
  "Carton (CTN)",
  "Box (BOX)",
  "Pallet (PAL)",
  "Bag (BAG)",
  "Polybag (PB)",
  "Pack (PCK)",
  "Roll (REL)",
  "Drum (DRM)",
  "Container (CNT)",
  "Cone (CON)",

  // Textile/Fabric Specific Units
  "GSM (Grams per Square Meter)",
  "OZ/YD² (Ounce per Square Yard)",
  "OZ/YD (Ounce per Yard)",
  "Linear Yard (LY)",
  "Liger Yard (L)",
  "Tex (Tex)",
  "Denier (DEN)",
  "Kilotext (KTEX)",
  "Hank (HANK)",
  "Lea (LEA)",
  "Micron (µ)",

  // Area Measurements
  "Square Meter (M²)",
  "Square Centimeter (CM²)",
  "Square Yard (YD²)",

  // Volume Measurements
  "Liter (L)",
  "Milliliter (ML)",
  "Cubic Meter (M³)",
  "Gallon (GAL)",

  // Quantity Standards & Conventions
  "KG/DZN",
  "1000 units (K / THD)",
  "Lot (LOT)",

  // Time & Production Units
  "Standard Minute Value (SMV)",
  "Minute (MIN)",
  "Hour (HR)",

  // Additional Textile Units
  "Pair",
  "Bundle (BDL)",
  "Spool (SPL)",
  "Cone (for thread)",
  "Card (CRD)",
  "Sheet",
  "Tube",
  "Coil",
  "Reel",
  "Count (for Yarn)",
  "Ne (English Count)",
  "Nm (Metric Count)",
] as const;

export type UomUnit = typeof uomUnits[number];

// UOM Conversion factors (base unit conversions)
export const uomConversions: Record<string, { base: string; factor: number }> = {
  // Length conversions (base: Meter)
  "Meter (M)": { base: "Meter (M)", factor: 1 },
  "Centimeter (CM)": { base: "Meter (M)", factor: 0.01 },
  "Kilometer (KM)": { base: "Meter (M)", factor: 1000 },
  "Yard (YD)": { base: "Meter (M)", factor: 0.9144 },
  "Inch (IN)": { base: "Meter (M)", factor: 0.0254 },
  "Foot (FT)": { base: "Meter (M)", factor: 0.3048 },

  // Weight conversions (base: Kilogram)
  "Kilogram (KG)": { base: "Kilogram (KG)", factor: 1 },
  "Gram (G)": { base: "Kilogram (KG)", factor: 0.001 },
  "Milligram (MG)": { base: "Kilogram (KG)", factor: 0.000001 },
  "Metric Ton (MT)": { base: "Kilogram (KG)", factor: 1000 },
  "Pound (LB)": { base: "Kilogram (KG)", factor: 0.453592 },
  "Ounce (OZ)": { base: "Kilogram (KG)", factor: 0.0283495 },

  // Area conversions (base: Square Meter)
  "Square Meter (M²)": { base: "Square Meter (M²)", factor: 1 },
  "Square Centimeter (CM²)": { base: "Square Meter (M²)", factor: 0.0001 },
  "Square Yard (YD²)": { base: "Square Meter (M²)", factor: 0.836127 },

  // Volume conversions (base: Liter)
  "Liter (L)": { base: "Liter (L)", factor: 1 },
  "Milliliter (ML)": { base: "Liter (L)", factor: 0.001 },
  "Cubic Meter (M³)": { base: "Liter (L)", factor: 1000 },
  "Gallon (GAL)": { base: "Liter (L)", factor: 3.78541 },

  // Quantity conversions (base: Piece)
  "Piece (Pcs)": { base: "Piece (Pcs)", factor: 1 },
  "Dozen (DZN)": { base: "Piece (Pcs)", factor: 12 },
  "Gross (GRO)": { base: "Piece (Pcs)", factor: 144 },
  "Great Gross (GG)": { base: "Piece (Pcs)", factor: 1728 },
};

// Get compatible UOMs for conversion (same base unit)
export function getCompatibleUoms(uom: string): string[] {
  const conversion = uomConversions[uom];
  if (!conversion) return [];

  return Object.keys(uomConversions).filter(
    (key) => uomConversions[key].base === conversion.base && key !== uom
  );
}

// Convert value from one UOM to another
export function convertUom(value: number, fromUom: string, toUom: string): number | null {
  const fromConversion = uomConversions[fromUom];
  const toConversion = uomConversions[toUom];

  if (!fromConversion || !toConversion) return null;
  if (fromConversion.base !== toConversion.base) return null;

  // Convert to base unit first, then to target unit
  const baseValue = value * fromConversion.factor;
  return baseValue / toConversion.factor;
}
