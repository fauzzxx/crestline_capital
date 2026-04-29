// TODO: Lawyer review — disclaimer content is good-faith boilerplate.
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28 pb-20 section-container max-w-3xl">
        <h1 className="text-3xl font-heading font-bold mb-8">
          <span className="gold-gradient-text">Disclaimer</span>
        </h1>
        <div className="space-y-6 text-cream-muted text-sm leading-relaxed">
          <p className="text-foreground font-medium">Crestline Capital is NOT a financial advisor, investment advisor, or registered real estate broker.</p>
          <p>The platform operates as a buyer aggregation service: we aggregate buyers into Capital Pools and facilitate structured bulk buying arrangements with residential project builders. Crestline Capital acts only as a facilitator. All payments and sale agreements are between the buyer and the builder.</p>
          <p>All discount percentages, projections, and timelines displayed on the platform are indicative and subject to change. Final deal terms are negotiated and paid directly between the buyer and the builder.</p>
          <p>Members are advised to conduct their own due diligence, seek independent legal and financial counsel, and verify all project details before making any commitments.</p>
          <p>Past performance and historical discount unlocks do not guarantee future results. Property investments carry inherent risks.</p>
          <p>Crestline Capital shall not be held liable for any losses, damages, or disputes arising from transactions facilitated through the platform.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
