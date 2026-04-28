import Link from "next/link";

const Footer = () => {
  return (
    <footer className="border-t border-border py-16">
      <div className="section-container">
        <div className="grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg maroon-gradient-bg flex items-center justify-center">
                <span className="font-heading text-lg font-bold gold-gradient-text">CC</span>
              </div>
              <span className="font-heading text-xl font-semibold text-foreground">
                Crestline <span className="gold-gradient-text">Capital</span>
              </span>
            </div>
            <p className="text-sm text-cream-muted leading-relaxed max-w-md">
              India&apos;s premier membership-based structured bulk residential buying platform.
              Pooling serious buyers to unlock builder-level pricing.
            </p>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-foreground mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-cream-muted">
              <li><a href="#how-it-works" className="hover:text-gold transition-colors">How It Works</a></li>
              <li><a href="#opportunities" className="hover:text-gold transition-colors">Opportunities</a></li>
              <li><Link href="/membership" className="hover:text-gold transition-colors">Request Membership</Link></li>
              <li><Link href="/contact" className="hover:text-gold transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-cream-muted">
              <li><Link href="/terms" className="hover:text-gold transition-colors">Terms & Conditions</Link></li>
              <li><Link href="/privacy" className="hover:text-gold transition-colors">Privacy Policy</Link></li>
              <li><Link href="/disclaimer" className="hover:text-gold transition-colors">Disclaimer</Link></li>
              <li><Link href="/membership-agreement" className="hover:text-gold transition-colors">Membership Agreement</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-cream-muted">
            © {new Date().getFullYear()} Crestline Capital. All rights reserved.
          </p>
          <p className="text-xs text-cream-muted">
            Operating in Hyderabad · Phase 1
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
