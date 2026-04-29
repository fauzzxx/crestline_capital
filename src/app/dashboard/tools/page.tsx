import { EmiCalculator } from "@/components/tools/EmiCalculator";
import { AppreciationCalculator } from "@/components/tools/AppreciationCalculator";
import { BulkDiscountComparison } from "@/components/tools/BulkDiscountComparison";

export default function ToolsPage() {
  return (
    <div className="section-container">
      <h1 className="text-2xl font-heading font-bold mb-6">
        <span className="gold-gradient-text">Calculators</span>
      </h1>
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mb-12">
        <EmiCalculator />
        <AppreciationCalculator />
      </div>
      <BulkDiscountComparison />
    </div>
  );
}
