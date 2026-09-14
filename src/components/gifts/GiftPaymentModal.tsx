"use client";

import { useEffect, useMemo, useState } from "react";
import { X, ExternalLink, Copy, Check, Loader2 } from "lucide-react";
import { initMercadoPago, Payment } from "@mercadopago/sdk-react";
import type { Gift } from "@/types/gift";
import { formatBRL } from "@/lib/format";

let mpInitialized = false;

type Step = "form" | "brick" | "processing" | "pix" | "success" | "pending" | "error";

type PixData = {
  qrCodeBase64?: string;
  qrCode?: string;
  ticketUrl?: string;
};

export default function GiftPaymentModal({
  gift,
  onClose,
  onGiftUpdated,
}: {
  gift: Gift;
  onClose: () => void;
  onGiftUpdated: (gift: Gift) => void;
}) {
  const [step, setStep] = useState<Step>("form");
  const [guestName, setGuestName] = useState("");
  const [guestMessage, setGuestMessage] = useState("");
  const [brickKey, setBrickKey] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const publicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY;
    if (publicKey && !mpInitialized) {
      initMercadoPago(publicKey, { locale: "pt-BR" });
      mpInitialized = true;
    }
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (step !== "pix" || !paymentId) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/payments/${paymentId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.status === "APROVADO") {
          setStep("success");
          onGiftUpdated({ ...gift, status: "COMPRADO" });
        }
      } catch {
        // ignora falhas de rede pontuais durante o polling
      }
    }, 4000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, paymentId]);

  const initialization = useMemo(() => ({ amount: gift.valor }), [gift.valor]);

  const customization = useMemo(
    () => ({
      paymentMethods: {
        creditCard: "all" as const,
        debitCard: "all" as const,
        bankTransfer: "all" as const,
        maxInstallments: 3,
      },
    }),
    []
  );

  async function handleSubmit(param: { formData: unknown }): Promise<void> {
    setStep("processing");
    setErrorMsg("");
    try {
      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          giftId: gift.id,
          guestName,
          guestMessage: guestMessage || null,
          formData: param.formData,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Não foi possível processar o pagamento.");
        setStep("error");
        return;
      }

      setPaymentId(data.paymentId);

      if (data.pix) {
        setPixData(data.pix);
        setStep("pix");
        onGiftUpdated({ ...gift, status: "RESERVADO" });
        return;
      }

      if (data.status === "APROVADO") {
        setStep("success");
        onGiftUpdated({ ...gift, status: "COMPRADO" });
      } else if (data.status === "RECUSADO" || data.status === "CANCELADO") {
        setErrorMsg("Pagamento recusado. Tente novamente com outro cartão.");
        setStep("error");
      } else {
        setStep("pending");
        onGiftUpdated({ ...gift, status: "RESERVADO" });
      }
    } catch {
      setErrorMsg("Erro de conexão ao processar o pagamento.");
      setStep("error");
    }
  }

  function handleRetry() {
    setBrickKey((k) => k + 1);
    setStep("brick");
    setErrorMsg("");
  }

  function copyPixCode() {
    if (!pixData?.qrCode) return;
    navigator.clipboard.writeText(pixData.qrCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--foreground)]/60 p-4">
      <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-y-auto bg-[var(--background)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 z-10 text-[var(--foreground)]"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="border-b border-[var(--color-border)] p-7">
          <p className="eyebrow">{formatBRL(gift.valor)}</p>
          <h2 className="mt-2 font-serif-display text-2xl italic text-[var(--foreground)]">
            {gift.nome}
          </h2>
        </div>

        <div className="flex-1 p-7">
          {step === "form" && (
            <form
              className="flex flex-col gap-6"
              onSubmit={(e) => {
                e.preventDefault();
                if (!guestName.trim()) return;
                setStep("brick");
              }}
            >
              <div>
                <label className="text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--color-muted)]">
                  Seu nome
                </label>
                <input
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="mt-2 w-full border-0 border-b border-[var(--color-border)] bg-transparent px-0 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
                  placeholder="Como você quer ser identificado"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--color-muted)]">
                  Mensagem para os noivos (opcional)
                </label>
                <textarea
                  value={guestMessage}
                  onChange={(e) => setGuestMessage(e.target.value)}
                  rows={3}
                  className="mt-2 w-full resize-none border-0 border-b border-[var(--color-border)] bg-transparent px-0 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
                  placeholder="Deixe um recado carinhoso :)"
                />
              </div>

              {gift.linkExterno && (
                <a
                  href={gift.linkExterno}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tracked-link flex items-center justify-center gap-2 border border-[var(--color-border)] py-3"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Prefiro comprar direto na loja parceira
                </a>
              )}

              <button type="submit" className="btn-solid mt-2">
                Continuar para pagamento
              </button>
            </form>
          )}

          {step === "brick" && (
            <div>
              <p className="mb-5 text-sm text-[var(--color-muted)]">
                Escolha Pix ou cartão para presentear <strong>{guestName}</strong>.
              </p>
              <Payment
                key={brickKey}
                initialization={initialization}
                customization={customization}
                onSubmit={handleSubmit}
                onError={(err) => {
                  console.error(err);
                }}
                locale="pt-BR"
              />
            </div>
          )}

          {step === "processing" && (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <Loader2 className="h-6 w-6 animate-spin text-[var(--color-primary)]" />
              <p className="text-sm text-[var(--color-muted)]">Processando pagamento...</p>
            </div>
          )}

          {step === "pix" && pixData && (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <p className="text-sm text-[var(--foreground)]/80">
                Escaneie o QR Code no app do seu banco ou copie o código Pix abaixo.
              </p>
              {pixData.qrCodeBase64 && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`data:image/png;base64,${pixData.qrCodeBase64}`}
                  alt="QR Code Pix"
                  className="h-56 w-56 border border-[var(--color-border)]"
                />
              )}
              {pixData.qrCode && (
                <button type="button" onClick={copyPixCode} className="btn-outline w-full">
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5" /> Código copiado
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" /> Copiar código Pix
                    </>
                  )}
                </button>
              )}
              <p className="text-xs text-[var(--color-muted)]">
                Assim que o pagamento for confirmado, esta janela atualiza automaticamente.
              </p>
            </div>
          )}

          {step === "success" && (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <p className="eyebrow">Obrigado</p>
              <p className="font-serif-display text-2xl italic text-[var(--foreground)]">
                Muito obrigado, {guestName || "querido(a)"}
              </p>
              <p className="text-sm text-[var(--color-muted)]">
                Seu presente foi confirmado com sucesso.
              </p>
              <button type="button" onClick={onClose} className="btn-solid mt-3">
                Fechar
              </button>
            </div>
          )}

          {step === "pending" && (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <Loader2 className="h-6 w-6 animate-spin text-[var(--color-primary)]" />
              <p className="font-serif-display text-xl italic text-[var(--foreground)]">
                Pagamento em análise
              </p>
              <p className="text-sm text-[var(--color-muted)]">
                Assim que for aprovado pelo Mercado Pago, o presente é confirmado
                automaticamente.
              </p>
              <button type="button" onClick={onClose} className="btn-outline mt-3">
                Fechar
              </button>
            </div>
          )}

          {step === "error" && (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <p className="font-serif-display text-xl italic text-[var(--foreground)]">
                Ops, algo deu errado
              </p>
              <p className="text-sm text-[var(--color-muted)]">{errorMsg}</p>
              <button type="button" onClick={handleRetry} className="btn-solid mt-3">
                Tentar novamente
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
