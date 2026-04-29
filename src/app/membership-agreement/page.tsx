// TODO: Lawyer review — membership agreement is good-faith boilerplate.
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function MembershipAgreementPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28 pb-20 section-container max-w-3xl">
        <h1 className="text-3xl font-heading font-bold mb-8">
          Membership <span className="gold-gradient-text">Agreement</span>
        </h1>
        <div className="space-y-6 text-cream-muted text-sm leading-relaxed">
          <p>
            By requesting membership and participating in Crestline Capital&apos;s member network and Capital Pools,
            you agree to the following terms and confidentiality obligations.
          </p>
          <h3 className="text-foreground font-heading text-lg">1. Eligibility & Approval</h3>
          <p>
            Membership is at the sole discretion of Crestline Capital. You warrant that all information
            provided in your membership application is accurate. Approval may be revoked for breach of
            these terms or for any reason deemed appropriate by Crestline Capital.
          </p>
          <h3 className="text-foreground font-heading text-lg">2. Capital Pool Participation</h3>
          <p>
            Joining a Capital Pool constitutes an expression of interest and soft commitment. Final
            commitments, documentation, and payments are subject to separate builder agreements and
            Crestline Capital&apos;s process. Tier unlock and structured discount levels are indicative until
            deal closure.
          </p>
          <h3 className="text-foreground font-heading text-lg">3. Confidentiality</h3>
          <p>
            All project details, pricing, discount structures, and deal terms shared on the platform are
            strictly confidential. You agree not to disclose, copy, or share any such information with
            any third party without prior written consent from Crestline Capital.
          </p>
          <h3 className="text-foreground font-heading text-lg">4. No Advisory Relationship & Payments</h3>
          <p>
            Crestline Capital is a structured bulk buying platform that aggregates buyers—not a financial
            advisor, investment advisor, or registered real estate broker. We do not provide investment or
            legal advice. All payments and transactions occur directly between you and the builder.
            Crestline Capital acts only as a facilitator. You are responsible for your own due diligence and decisions.
          </p>
          <h3 className="text-foreground font-heading text-lg">5. Modifications</h3>
          <p>
            This agreement may be updated from time to time. Continued use of the platform after
            changes constitutes acceptance of the updated terms.
          </p>
          <h3 className="text-foreground font-heading text-lg">6. Governing Law &amp; Dispute Resolution</h3>
          <p>
            This agreement is governed by the laws of India. Any disputes shall be subject to the
            exclusive jurisdiction of the courts at Hyderabad, Telangana.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
