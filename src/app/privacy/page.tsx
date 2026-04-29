// TODO: Lawyer review — content below is good-faith boilerplate aligned with DPDP Act 2023.
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28 pb-20 section-container max-w-3xl">
        <h1 className="text-3xl font-heading font-bold mb-8">
          Privacy <span className="gold-gradient-text">Policy</span>
        </h1>
        <div className="space-y-6 text-cream-muted text-sm leading-relaxed">
          <p>Crestline Capital is committed to protecting your personal information. This policy outlines how we collect, use, and safeguard your data.</p>
          <h3 className="text-foreground font-heading text-lg">Information We Collect</h3>
          <p>We collect personal information you provide during membership application including name, contact details, budget preferences, and location interests.</p>
          <h3 className="text-foreground font-heading text-lg">How We Use Your Information</h3>
          <p>Your information is used to evaluate membership eligibility, match you with suitable capital pools, and communicate relevant opportunities. We do not sell your data to third parties.</p>
          <h3 className="text-foreground font-heading text-lg">Data Security</h3>
          <p>We employ industry-standard security measures to protect your data. Access is restricted to authorized personnel only.</p>
          <h3 className="text-foreground font-heading text-lg">Your Rights (DPDP Act 2023)</h3>
          <p>You have the right to access, correct, and erase the personal data you have provided. You may also withdraw consent or lodge a complaint with the Data Protection Board of India. Requests can be made to the contact below.</p>
          <h3 className="text-foreground font-heading text-lg">Jurisdiction</h3>
          <p>This policy is governed by the laws of India. Any dispute is subject to the exclusive jurisdiction of the courts at Hyderabad, Telangana.</p>
          <h3 className="text-foreground font-heading text-lg">Contact</h3>
          <p>For privacy-related inquiries, contact us at info@crestlinecapital.in.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
