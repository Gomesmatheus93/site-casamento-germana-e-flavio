"use client";

import { useEffect, useMemo, useState } from "react";
import { X, ExternalLink, Copy, Check, Loader2, CreditCard } from "lucide-react";
import { initMercadoPago, Payment, StatusScreen } from "@mercadopago/sdk-react";
import type { Gift } from "@/types/gift";
import { formatBRL } from "@/lib/format";

let mpInitialized = false;

declare global {
  interface Window {
    MP_DEVICE_SESSION_ID?: string;
  }
}

// Script antifraude do Mercado Pago: gera o identificador do dispositivo
// (window.MP_DEVICE_SESSION_ID). Sem ele, pagamentos com cartão tendem a ser
// recusados com "cc_rejected_high_risk".
function loadMpSecurityScript() {
  if (document.getElementById("mp-security-js")) return;
  const script = document.createElement("script");
  script.id = "mp-security-js";
  script.src = "https://www.mercadopago.com/v2/security.js";
  script.setAttribute("view", "checkout");
  script.async = true;
  document.body.appendChild(script);
}

function rejectionMessage(statusDetail: string | undefined) {
  switch (statusDetail) {
    case "cc_rejected_bad_filled_card_number":
    case "cc_rejected_bad_filled_date":
    case "cc_rejected_bad_filled_other":
    case "cc_rejected_bad_filled_security_code":
      return "Algum dado do cartão parece incorreto. Confira e tente novamente.";
    case "cc_rejected_insufficient_amount":
      return "O cartão não tem limite suficiente. Tente outro cartão ou pague com Pix.";
    case "cc_rejected_call_for_authorize":
      return "O banco pediu autorização para este pagamento. Autorize com o seu banco e tente novamente.";
    case "cc_rejected_card_disabled":
      return "O cartão está inativo. Ligue para o seu banco para ativá-lo ou use outro cartão.";
    case "cc_rejected_duplicated_payment":
      return "Você já fez um pagamento com esse valor. Se precisar pagar de novo, use outro cartão ou Pix.";
    case "cc_rejected_high_risk":
      return "O pagamento foi recusado pelo sistema antifraude. Tente outro cartão ou pague com Pix.";
    case "cc_rejected_3ds_challenge":
    case "cc_rejected_3ds_mandatory":
      return "A confirmação com o banco não foi concluída. Tente novamente ou pague com Pix.";
    default:
      return "Pagamento recusado. Tente novamente com outro cartão ou pague com Pix.";
  }
}

type Step =
  | "form"
  | "brick"
  | "processing"
  | "pix"
  | "challenge"
  | "success"
  | "pending"
  | "error";

type PixData = {
  qrCodeBase64?: string;
  qrCode?: string;
  ticketUrl?: string;
};

// Dados do desafio 3DS (confirmação no app/SMS do banco).
type ChallengeData = {
  mpPaymentId: string;
  externalResourceURL: string;
  creq: string;
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
  const [challenge, setChallenge] = useState<ChallengeData | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const publicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY;
    if (publicKey && !mpInitialized) {
      initMercadoPago(publicKey, { locale: "pt-BR" });
      mpInitialized = true;
    }
    loadMpSecurityScript();
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if ((step !== "pix" && step !== "challenge" && step !== "pending") || !paymentId) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/payments/${paymentId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.status === "APROVADO") {
          setStep("success");
          onGiftUpdated({ ...gift, status: "COMPRADO" });
        } else if (
          step !== "pix" &&
          (data.status === "RECUSADO" || data.status === "CANCELADO")
        ) {
          setErrorMsg(rejectionMessage(data.statusDetail));
          setStep("error");
        }
      } catch {
        // ignora falhas de rede pontuais durante o polling
      }
    }, 4000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, paymentId]);

  const initialization = useMemo(() => ({ amount: gift.valor }), [gift.valor]);

  const challengeInitialization = useMemo(
    () =>
      challenge
        ? {
            paymentId: challenge.mpPaymentId,
            additionalInfo: {
              externalResourceURL: challenge.externalResourceURL,
              creq: challenge.creq,
            },
          }
        : null,
    [challenge]
  );

  const customization = useMemo(
    () => ({
      // Cartão é pago no checkout do InfinitePay (botão acima); aqui no
      // formulário embutido do Mercado Pago fica só o Pix.
      paymentMethods: {
        bankTransfer: "all" as const,
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
          deviceId: window.MP_DEVICE_SESSION_ID || null,
          formData: param.formData,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        console.error("Falha ao criar pagamento", data);
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

      if (data.challenge && data.mpPaymentId) {
        setChallenge({ mpPaymentId: data.mpPaymentId, ...data.challenge });
        setStep("challenge");
        return;
      }

      if (data.status === "APROVADO") {
        setStep("success");
        onGiftUpdated({ ...gift, status: "COMPRADO" });
      } else if (data.status === "RECUSADO" || data.status === "CANCELADO") {
        setErrorMsg(rejectionMessage(data.statusDetail));
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

  async function handleCardCheckout() {
    setStep("processing");
    setErrorMsg("");
    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          giftId: gift.id,
          guestName,
          guestMessage: guestMessage || null,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.checkoutUrl) {
        console.error("Falha ao iniciar pagamento com cartão", data);
        setErrorMsg(data.error || "Não foi possível iniciar o pagamento com cartão.");
        setStep("error");
        return;
      }
      window.location.href = data.checkoutUrl;
    } catch {
      setErrorMsg("Erro de conexão ao iniciar o pagamento.");
      setStep("error");
    }
  }

  function handleRetry() {
    setBrickKey((k) => k + 1);
    setChallenge(null);
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
                Escolha como presentear, <strong>{guestName}</strong>.
              </p>
              <button
                type="button"
                onClick={handleCardCheckout}
                className="btn-solid flex w-full items-center justify-center gap-2"
              >
                <CreditCard className="h-4 w-4" />
                Pagar com cartão de crédito
              </button>
              <p className="mt-2 text-center text-xs text-[var(--color-muted)]">
                Você será levado ao ambiente seguro do InfinitePay, com parcelamento.
              </p>
              <div className="my-6 flex items-center gap-3 text-[11px] uppercase tracking-[0.16em] text-[var(--color-muted)]">
                <span className="h-px flex-1 bg-[var(--color-border)]" />
                ou pague com Pix
                <span className="h-px flex-1 bg-[var(--color-border)]" />
              </div>
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

          {step === "challenge" && challengeInitialization && (
            <div>
              <p className="mb-5 text-sm text-[var(--color-muted)]">
                Seu banco pediu uma confirmação de segurança. Siga as instruções abaixo
                para concluir o pagamento.
              </p>
              <StatusScreen
                initialization={challengeInitialization}
                onError={(err) => {
                  console.error(err);
                }}
                locale="pt-BR"
              />
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
                O Mercado Pago está analisando o pagamento. Você não precisa fazer nada:
                o resultado aparece aqui assim que a análise terminar, o que pode levar
                alguns minutos.
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
