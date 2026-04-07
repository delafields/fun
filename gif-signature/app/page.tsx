import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <svg
              className="w-7 h-7"
              viewBox="0 0 28 28"
              fill="none"
            >
              {/* Swoosh stroke */}
              <path
                d="M3 21c3-2 7-6 11-6s5 3 8 1.5c1.5-.75 2.5-2 3-3.5"
                stroke="#1F5CF7"
                strokeWidth={2.5}
                strokeLinecap="round"
                fill="none"
              />
              {/* Pen nib */}
              <path
                d="M22 3l3 3-2 2-3-3 2-2z"
                fill="#1F5CF7"
              />
              <path
                d="M20 5l3 3-9 9-4 1 1-4 9-9z"
                stroke="#1F5CF7"
                strokeWidth={1.5}
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
            <span className="text-lg font-bold tracking-tight text-[#1C1917]">
              GIF Signature
            </span>
          </Link>
          <Link
            href="/create"
            className="px-5 py-2.5 bg-[#1F5CF7] text-white text-sm font-semibold rounded-xl hover:bg-[#1a4fd4] transition-colors"
          >
            Create yours
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-white pt-20 pb-24 md:pt-28 md:pb-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#EEF5FF] text-[#1F5CF7] text-sm font-medium rounded-full mb-8">
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" />
            </svg>
            The last thing they read matters
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-[-0.04em] text-[#1C1917] mb-6 leading-[1.05]">
            Sign off with
            <br />
            <span className="text-[#A8A29E]">personality.</span>
          </h1>

          <p className="text-lg md:text-xl text-[#79716B] max-w-2xl mx-auto mb-10 leading-relaxed">
            Turn your name into an animated signature that actually feels like
            you. Pick a style, make it yours, and let every email leave an impression.
          </p>

          <Link
            href="/create"
            className="inline-block px-8 py-4 bg-[#1F5CF7] text-white text-lg font-semibold rounded-xl hover:bg-[#1a4fd4] transition-colors shadow-lg shadow-blue-500/20"
          >
            Create Your Signature
          </Link>

          <p className="text-sm text-[#A8A29E] mt-4">
            $7 one-time purchase &middot; No account needed
          </p>

          {/* Star rating */}
          <div className="flex items-center justify-center gap-1.5 mt-6">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className="w-5 h-5 text-amber-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" />
              </svg>
            ))}
            <span className="text-sm text-[#79716B] ml-1">
              Loved by 1,000+ users
            </span>
          </div>

          {/* Demo area */}
          <div className="mt-16 flex justify-center">
            <div className="bg-white rounded-2xl shadow-xl shadow-black/5 border border-gray-100 p-8 md:p-10 max-w-xl w-full">
              <div className="text-left space-y-2 text-sm text-[#A8A29E]">
                <p>Best regards,</p>
                <div className="py-3">
                  <span className="text-3xl md:text-4xl font-bold italic text-[#1C1917] block animate-pulse">
                    Your Name Here
                  </span>
                </div>
                <p className="text-xs text-[#A8A29E]">
                  VP of Marketing, Acme Corp
                </p>
                <p className="text-xs text-[#A8A29E]">
                  john@acme.com &middot; (555) 123-4567
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-[#F0ECE9] py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-sm font-medium text-[#1F5CF7] text-center mb-3">
            Simple as 1-2-3
          </p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-[-0.03em] text-center text-[#1C1917] mb-16">
            How it works
          </h2>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-14 h-14 bg-[#1F5CF7] text-white rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-5 shadow-lg shadow-blue-500/20">
                1
              </div>
              <h3 className="font-bold text-lg text-[#1C1917] mb-2">
                Type your name
              </h3>
              <p className="text-[#79716B] text-sm leading-relaxed">
                Enter the name you want animated. First name, full name, or
                initials — whatever you use to sign off.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-14 h-14 bg-[#1F5CF7] text-white rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-5 shadow-lg shadow-blue-500/20">
                2
              </div>
              <h3 className="font-bold text-lg text-[#1C1917] mb-2">
                Pick a style
              </h3>
              <p className="text-[#79716B] text-sm leading-relaxed">
                Choose from curated presets — elegant, bold, creative, and more.
                Fine-tune colors and speed if you want.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-14 h-14 bg-[#1F5CF7] text-white rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-5 shadow-lg shadow-blue-500/20">
                3
              </div>
              <h3 className="font-bold text-lg text-[#1C1917] mb-2">
                Download &amp; use
              </h3>
              <p className="text-[#79716B] text-sm leading-relaxed">
                Get your GIF instantly after checkout. We show you exactly how to
                add it to Gmail, Outlook, or Apple Mail.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What you get — Feature cards */}
      <section className="py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-sm font-medium text-[#1F5CF7] text-center mb-3">
            Everything included
          </p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-[-0.03em] text-center text-[#1C1917] mb-16">
            What you get
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-2.625 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5m0-5.25v5.25m0-5.25C6 5.004 6.504 4.5 7.125 4.5h9.75c.621 0 1.125.504 1.125 1.125m1.125 2.625h1.5m-1.5 0A1.125 1.125 0 0118 7.125v-1.5m1.125 2.625c-.621 0-1.125.504-1.125 1.125v1.5m2.625-2.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M18 5.625v5.25M7.125 12h9.75m-9.75 0A1.125 1.125 0 016 10.875M7.125 12C6.504 12 6 12.504 6 13.125m0-2.25c0 .621.504 1.125 1.125 1.125M18 10.875c0 .621-.504 1.125-1.125 1.125M18 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m-12 5.25v-5.25m0 5.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125m-12 0v-1.5c0-.621-.504-1.125-1.125-1.125M18 18.375v-5.25m0 5.25v-1.5c0-.621.504-1.125 1.125-1.125M18 13.125v1.5c0 .621.504 1.125 1.125 1.125M18 13.125c0-.621.504-1.125 1.125-1.125M6 13.125v1.5c0 .621-.504 1.125-1.125 1.125M6 13.125C6 12.504 5.496 12 4.875 12m-1.5 0h1.5m-1.5 0c-.621 0-1.125-.504-1.125-1.125v-1.5c0-.621.504-1.125 1.125-1.125m1.5 3.75c-.621 0-1.125-.504-1.125-1.125v-1.5c0-.621.504-1.125 1.125-1.125"
                  />
                ),
                title: "Animated GIF",
                desc: "A looping signature animation that plays in any email client",
              },
              {
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                  />
                ),
                title: "Optimized for email",
                desc: "Small file size (<500KB) that loads instantly on any device",
              },
              {
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.745 3.745 0 011.043 3.296A3.745 3.745 0 0121 12z"
                  />
                ),
                title: "Works everywhere",
                desc: "Compatible with Gmail, Outlook, Apple Mail, and more",
              },
              {
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                ),
                title: "Transparent background",
                desc: "Blends seamlessly into any email design or template",
              },
              {
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
                  />
                ),
                title: "Setup instructions",
                desc: "Step-by-step guide for adding to your email client",
              },
              {
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15M9 12l3 3m0 0l3-3m-3 3V2.25"
                  />
                ),
                title: "Instant delivery",
                desc: "Download immediately after payment — no waiting",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg hover:shadow-black/5 transition-shadow"
              >
                <div className="w-10 h-10 bg-[#EEF5FF] text-[#1F5CF7] rounded-xl flex items-center justify-center mb-4">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    {feature.icon}
                  </svg>
                </div>
                <h3 className="font-bold text-[#1C1917] mb-1">
                  {feature.title}
                </h3>
                <p className="text-sm text-[#79716B] leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-[#F0ECE9] py-20 md:py-28">
        <div className="max-w-md mx-auto px-6 text-center">
          <p className="text-sm font-medium text-[#1F5CF7] mb-3">Pricing</p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-[-0.03em] text-[#1C1917] mb-10">
            Simple, one-time price
          </h2>

          <div className="bg-white rounded-2xl shadow-xl shadow-black/5 p-8 md:p-10">
            <div className="text-6xl font-bold text-[#1C1917] mb-1">$7</div>
            <div className="text-[#79716B] mb-8">per signature</div>

            <ul className="text-sm text-[#79716B] space-y-3 mb-8 text-left">
              {[
                "Animated GIF file",
                "Instant download",
                "Email setup guide",
                "No account required",
                "Works in all email clients",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-50 text-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  {item}
                </li>
              ))}
            </ul>

            <Link
              href="/create"
              className="block w-full px-6 py-3.5 bg-[#1F5CF7] text-white font-semibold rounded-xl hover:bg-[#1a4fd4] transition-colors text-center shadow-lg shadow-blue-500/20"
            >
              Create Your Signature
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 md:py-28">
        <div className="max-w-2xl mx-auto px-6">
          <p className="text-sm font-medium text-[#1F5CF7] text-center mb-3">
            FAQ
          </p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-[-0.03em] text-center text-[#1C1917] mb-14">
            Common questions
          </h2>

          <div className="space-y-8">
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
                'Can I add my job title or company?',
                'Yes! There\'s an optional "Title / Company" field in the fine-tune options. It appears below your animated name.',
              ],
            ].map(([q, a]) => (
              <div key={q} className="border-b border-gray-100 pb-8">
                <h3 className="font-bold text-lg text-[#1C1917] mb-2">{q}</h3>
                <p className="text-[#79716B] text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-[#F0ECE9] py-20 md:py-28">
        <div className="max-w-xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-bold tracking-[-0.03em] text-[#1C1917] mb-4 leading-tight">
            Make your emails
            <br />
            memorable
          </h2>
          <p className="text-[#79716B] text-lg mb-8">
            Join thousands of professionals who sign off with style.
          </p>
          <Link
            href="/create"
            className="inline-block px-8 py-4 bg-[#1F5CF7] text-white text-lg font-semibold rounded-xl hover:bg-[#1a4fd4] transition-colors shadow-lg shadow-blue-500/20"
          >
            Create Your Signature
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-10">
            {/* Logo & tagline */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 28 28"
                  fill="none"
                >
                  <path
                    d="M3 21c3-2 7-6 11-6s5 3 8 1.5c1.5-.75 2.5-2 3-3.5"
                    stroke="#1F5CF7"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d="M22 3l3 3-2 2-3-3 2-2z"
                    fill="#1F5CF7"
                  />
                  <path
                    d="M20 5l3 3-9 9-4 1 1-4 9-9z"
                    stroke="#1F5CF7"
                    strokeWidth={1.5}
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
                <span className="text-lg font-bold tracking-tight text-[#1C1917]">
                  GIF Signature
                </span>
              </div>
              <p className="text-sm text-[#A8A29E] max-w-xs">
                Beautiful animated signatures for your emails. Stand out in
                every inbox.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold text-[#1C1917] text-sm mb-4">
                Product
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <Link
                    href="/create"
                    className="text-sm text-[#79716B] hover:text-[#1F5CF7] transition-colors"
                  >
                    Create signature
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-[#79716B] hover:text-[#1F5CF7] transition-colors"
                  >
                    How it works
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-[#79716B] hover:text-[#1F5CF7] transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold text-[#1C1917] text-sm mb-4">
                Support
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <Link
                    href="#"
                    className="text-sm text-[#79716B] hover:text-[#1F5CF7] transition-colors"
                  >
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-[#79716B] hover:text-[#1F5CF7] transition-colors"
                  >
                    Email setup guide
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-[#79716B] hover:text-[#1F5CF7] transition-colors"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-100 mt-10 pt-8 text-center">
            <p className="text-sm text-[#A8A29E]">
              GIF Signature. Made with care.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
