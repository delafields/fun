import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="text-xl font-bold tracking-tight">
            GIF Signature
          </span>
          <Link
            href="/create"
            className="px-5 py-2 bg-black text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition"
          >
            Create yours
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 pt-16 pb-20 md:pt-24 md:pb-28 text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
          Your name, <span className="italic">animated.</span>
          <br />
          <span className="text-gray-400">In every email you send.</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10">
          Create a beautiful animated signature GIF in 30 seconds. Type your
          name, pick a style, and stand out in every inbox.
        </p>
        <Link
          href="/create"
          className="inline-block px-8 py-4 bg-black text-white text-lg font-semibold rounded-xl hover:bg-gray-800 transition"
        >
          Create Your Signature
        </Link>
        <p className="text-sm text-gray-400 mt-3">
          $7 per signature. No account needed.
        </p>

        {/* Animated demo area */}
        <div className="mt-14 flex justify-center">
          <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 bg-gray-50/50 max-w-xl w-full">
            <div className="text-left space-y-2 text-sm text-gray-400">
              <p>Best regards,</p>
              <div className="py-2">
                <span className="text-3xl font-bold italic text-gray-800 block animate-pulse">
                  Your Name Here
                </span>
              </div>
              <p className="text-xs">VP of Marketing, Acme Corp</p>
              <p className="text-xs">john@acme.com | (555) 123-4567</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            How it works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="font-bold text-lg mb-2">Type your name</h3>
              <p className="text-gray-500 text-sm">
                Enter the name you want animated. First name, full name, or
                initials — whatever you use to sign off.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="font-bold text-lg mb-2">Pick a style</h3>
              <p className="text-gray-500 text-sm">
                Choose from curated presets — elegant, bold, creative, and more.
                Fine-tune colors and speed if you want.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="font-bold text-lg mb-2">Download & use</h3>
              <p className="text-gray-500 text-sm">
                Get your GIF instantly after checkout. We show you exactly how to
                add it to Gmail, Outlook, or Apple Mail.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            What you get
          </h2>
          <div className="space-y-4">
            {[
              [
                "Animated GIF",
                "A looping signature animation that plays in any email client",
              ],
              [
                "Optimized for email",
                "Small file size (<500KB) that loads instantly on any device",
              ],
              [
                "Works everywhere",
                "Compatible with Gmail, Outlook, Apple Mail, and more",
              ],
              [
                "Transparent background",
                "Blends seamlessly into any email design",
              ],
              [
                "Setup instructions",
                "Step-by-step guide for adding to your email client",
              ],
              [
                "Instant delivery",
                "Download immediately after payment — no waiting",
              ],
            ].map(([title, desc]) => (
              <div
                key={title}
                className="flex items-start gap-3 p-4 rounded-xl hover:bg-gray-50 transition"
              >
                <div className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold">{title}</div>
                  <div className="text-sm text-gray-500">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-gray-50 py-16 md:py-20">
        <div className="max-w-md mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Simple pricing
          </h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="text-5xl font-bold mb-2">$7</div>
            <div className="text-gray-500 mb-6">per signature</div>
            <ul className="text-sm text-gray-600 space-y-2 mb-8 text-left">
              <li className="flex items-center gap-2">
                <span className="text-green-600">&#10003;</span> Animated GIF
                file
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">&#10003;</span> Instant
                download
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">&#10003;</span> Email setup
                guide
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">&#10003;</span> No account
                required
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">&#10003;</span> Works in all
                email clients
              </li>
            </ul>
            <Link
              href="/create"
              className="block w-full px-6 py-3 bg-black text-white font-semibold rounded-xl hover:bg-gray-800 transition text-center"
            >
              Create Your Signature
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-20">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            FAQ
          </h2>
          <div className="space-y-6">
            {[
              [
                "Will the GIF animate in emails?",
                "Yes! Animated GIFs work in Gmail, Outlook, Apple Mail, Yahoo Mail, and most other email clients. The signature will loop continuously when the recipient opens your email.",
              ],
              [
                "How big is the GIF file?",
                "Our signatures are optimized to be under 500KB, ensuring they load quickly even on slow connections. Most are between 100-300KB.",
              ],
              [
                "Do I need to create an account?",
                "No! Just create your signature, pay once, and download. No sign-up, no subscription, no recurring charges.",
              ],
              [
                "Can I create multiple signatures?",
                "Absolutely. Each signature is a separate one-time purchase. Want one for work and one for personal? Just create two.",
              ],
              [
                "What if I'm not happy with it?",
                "You can preview your signature before paying. Play with different styles until you find the perfect one, then check out.",
              ],
              [
                "Can I add my job title or company?",
                'Yes! There\'s an optional "Title / Company" field in the fine-tune options. It appears below your animated name.',
              ],
            ].map(([q, a]) => (
              <div key={q} className="border-b border-gray-100 pb-6">
                <h3 className="font-bold text-lg mb-2">{q}</h3>
                <p className="text-gray-500 text-sm">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-20 text-center">
        <div className="max-w-xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Make your emails memorable
          </h2>
          <p className="text-gray-500 mb-8">
            Join thousands of professionals who sign off with style.
          </p>
          <Link
            href="/create"
            className="inline-block px-8 py-4 bg-black text-white text-lg font-semibold rounded-xl hover:bg-gray-800 transition"
          >
            Create Your Signature
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-5xl mx-auto px-4 text-center text-sm text-gray-400">
          <p>GIF Signature. Made with care.</p>
        </div>
      </footer>
    </div>
  );
}
