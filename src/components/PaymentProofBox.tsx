import Link from "next/link";
import { PAYMENT_ACCOUNT, WHATSAPP } from "@/lib/league-db";

/** Shared pay + proof-of-payment instructions. */
export function PaymentProofBox({ className = "" }: { className?: string }) {
  return (
    <div
      className={`border border-flood/35 bg-black/20 px-4 py-4 ${className}`.trim()}
    >
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-flood">
        Pay into
      </p>
      <p className="mt-2 text-lg font-semibold text-chalk">
        {PAYMENT_ACCOUNT.accountNumber}
      </p>
      <p className="text-muted">
        {PAYMENT_ACCOUNT.accountName} · {PAYMENT_ACCOUNT.bank}
      </p>
      <p className="mt-4 text-sm text-chalk">
        After you transfer, send{" "}
        <strong className="text-flood">proof of payment with your full name</strong>{" "}
        to the WhatsApp group or to Aji on WhatsApp.
      </p>
      <ul className="mt-3 space-y-2 text-sm">
        <li>
          <a
            href={WHATSAPP.groupUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-flood hover:underline"
          >
            Join {WHATSAPP.groupName}
          </a>
        </li>
        <li>
          <a
            href={WHATSAPP.adminChatUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-flood hover:underline"
          >
            WhatsApp Aji · {WHATSAPP.adminPhone}
          </a>
        </li>
      </ul>
      <p className="mt-3 text-xs text-muted">
        Admin can mark you as a regular before payment clears — still send proof
        so the purse stays accurate.{" "}
        <Link href="/payments" className="text-flood hover:underline">
          Payments board
        </Link>
      </p>
    </div>
  );
}
