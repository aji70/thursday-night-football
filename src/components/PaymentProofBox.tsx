import Link from "next/link";
import { PAYMENT_ACCOUNT, WHATSAPP } from "@/lib/league-db";

/** Shared bank + WhatsApp proof instructions (Payments / Me — not Purse). */
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
        <strong className="text-flood">
          proof of payment with your full name
        </strong>{" "}
        to the WhatsApp group or to Aji on WhatsApp — then tap{" "}
        <strong className="text-flood">I&apos;ve paid</strong> on your dashboard
        so we can confirm it.
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
        Status updates on{" "}
        <Link href="/me" className="text-flood hover:underline">
          your dashboard
        </Link>{" "}
        and the{" "}
        <Link href="/payments" className="text-flood hover:underline">
          payments board
        </Link>
        .
      </p>
    </div>
  );
}
