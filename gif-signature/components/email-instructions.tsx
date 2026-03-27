"use client";

import { useState } from "react";

const TABS = ["Gmail", "Outlook", "Apple Mail", "Other"] as const;

export default function EmailInstructions() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Gmail");

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex border-b border-gray-200">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 px-4 py-3 text-sm font-medium transition cursor-pointer ${
              tab === t
                ? "bg-white text-black border-b-2 border-black"
                : "bg-gray-50 text-gray-500 hover:text-gray-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="p-5 text-sm text-gray-700 space-y-3">
        {tab === "Gmail" && (
          <>
            <ol className="list-decimal list-inside space-y-2">
              <li>
                Open Gmail and click the <strong>gear icon</strong> (top right)
                then <strong>See all settings</strong>
              </li>
              <li>
                Scroll down to the <strong>Signature</strong> section
              </li>
              <li>
                Click <strong>Create new</strong> or edit an existing signature
              </li>
              <li>
                Click the <strong>Insert image</strong> icon (small mountain
                icon) in the signature editor toolbar
              </li>
              <li>
                Choose <strong>Upload</strong> and select your downloaded GIF
                file
              </li>
              <li>
                Resize if needed by clicking the image and selecting{" "}
                <strong>Small</strong>, <strong>Medium</strong>, or{" "}
                <strong>Large</strong>
              </li>
              <li>
                Scroll down and click <strong>Save Changes</strong>
              </li>
            </ol>
            <p className="text-xs text-gray-400 mt-3">
              Note: Gmail will animate the GIF in sent emails. The preview in
              settings may show a static image.
            </p>
          </>
        )}

        {tab === "Outlook" && (
          <>
            <ol className="list-decimal list-inside space-y-2">
              <li>
                Open Outlook and go to{" "}
                <strong>File → Options → Mail → Signatures</strong>
              </li>
              <li>
                Create a new signature or edit an existing one
              </li>
              <li>
                Click in the signature editor and then click the{" "}
                <strong>Insert Picture</strong> icon
              </li>
              <li>Browse to and select your downloaded GIF file</li>
              <li>
                Click <strong>OK</strong> to save
              </li>
            </ol>
            <p className="text-xs text-gray-400 mt-3">
              Note: Outlook desktop shows a static preview but the GIF will
              animate when recipients view the email.
            </p>
          </>
        )}

        {tab === "Apple Mail" && (
          <>
            <ol className="list-decimal list-inside space-y-2">
              <li>
                Open Mail and go to{" "}
                <strong>Mail → Settings → Signatures</strong>
              </li>
              <li>Select or create a signature</li>
              <li>
                Drag and drop your GIF file directly into the signature editor
              </li>
              <li>Close the settings window to save</li>
            </ol>
            <p className="text-xs text-gray-400 mt-3">
              Note: Apple Mail fully supports animated GIFs in signatures.
            </p>
          </>
        )}

        {tab === "Other" && (
          <>
            <p>For most email clients:</p>
            <ol className="list-decimal list-inside space-y-2">
              <li>Find the signature settings in your email client</li>
              <li>
                Look for an option to insert an image or HTML
              </li>
              <li>Upload or insert your downloaded GIF file</li>
              <li>Save your signature settings</li>
            </ol>
            <p className="mt-3">
              Alternatively, you can use this HTML snippet in clients that
              support HTML signatures:
            </p>
            <code className="block bg-gray-100 rounded-lg p-3 text-xs font-mono mt-2 break-all">
              {`<img src="[upload your GIF to an image host and paste URL here]" alt="Signature" style="max-width: 300px;" />`}
            </code>
          </>
        )}
      </div>
    </div>
  );
}
