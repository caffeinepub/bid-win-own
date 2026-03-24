export default function Footer() {
  const year = new Date().getFullYear();
  const href = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`;

  return (
    <footer className="border-t border-border mt-24 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="font-display font-bold tracking-widest text-gold text-lg">
          BID. WIN. OWN.
        </div>
        <p className="text-muted-foreground text-sm">
          The premier destination for authenticated sneakers and handbags.
        </p>
        <p className="text-muted-foreground text-xs">
          © {year}.{" "}
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gold transition-colors"
          >
            Built with ♥ using caffeine.ai
          </a>
        </p>
      </div>
    </footer>
  );
}
