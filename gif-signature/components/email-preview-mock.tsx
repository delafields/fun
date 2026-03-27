"use client";

interface EmailPreviewMockProps {
  children: React.ReactNode; // The signature preview (canvas or image)
  senderName?: string;
}

export default function EmailPreviewMock({
  children,
  senderName = "You",
}: EmailPreviewMockProps) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm max-w-lg">
      {/* Email header */}
      <div className="border-b border-gray-100 px-5 py-3 bg-gray-50/50">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-white">
            {senderName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-800">
              {senderName}
            </div>
            <div className="text-xs text-gray-400">
              to: recipient@example.com
            </div>
          </div>
        </div>
        <div className="text-sm font-medium text-gray-700">
          Re: Quick follow up
        </div>
      </div>

      {/* Email body */}
      <div className="px-5 py-4 text-sm text-gray-600 space-y-3">
        <p>Hey,</p>
        <p>
          Thanks for the great meeting today! I&apos;ll send over the proposal
          by end of week.
        </p>
        <p>Best regards,</p>

        {/* Signature */}
        <div className="pt-1 border-t border-gray-100 mt-3">
          <div className="py-2">{children}</div>
          <div className="text-xs text-gray-400 mt-1">
            <div>{senderName}</div>
            <div>Senior Designer · Acme Corp</div>
          </div>
        </div>
      </div>
    </div>
  );
}
