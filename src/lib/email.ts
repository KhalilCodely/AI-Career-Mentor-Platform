type SendPasswordResetEmailInput = {
  email: string;
  name: string;
  resetUrl: string;
  expiresAt: Date;
};

type ResendPayload = {
  from: string;
  to: string[];
  subject: string;
  html: string;
  text: string;
};

function formatExpiry(expiresAt: Date) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(expiresAt);
}

function buildPasswordResetMessage({ email, name, resetUrl, expiresAt }: SendPasswordResetEmailInput) {
  const expiry = formatExpiry(expiresAt);
  const safeName = name || email;

  return {
    subject: "Reset your Career Mentor password",
    text: [
      `Hi ${safeName},`,
      "",
      "An administrator created a secure password reset link for your Career Mentor account.",
      `Reset your password: ${resetUrl}`,
      `This link expires at ${expiry} UTC and can be used only once.`,
      "",
      "If you did not expect this email, contact your administrator immediately.",
    ].join("\n"),
    html: `
      <div style="font-family:Inter,Arial,sans-serif;background:#f8fafc;padding:32px;color:#0f172a">
        <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:24px;padding:32px;box-shadow:0 20px 40px rgba(15,23,42,.08)">
          <p style="margin:0 0 16px;color:#2563eb;font-weight:700;text-transform:uppercase;letter-spacing:.14em;font-size:12px">Career Mentor Security</p>
          <h1 style="margin:0 0 16px;font-size:28px;line-height:1.2">Reset your password</h1>
          <p style="margin:0 0 20px;color:#475569;line-height:1.6">Hi ${safeName}, an administrator created a secure password reset link for your account.</p>
          <a href="${resetUrl}" style="display:inline-block;background:#020617;color:#ffffff;text-decoration:none;font-weight:700;border-radius:16px;padding:14px 20px">Choose a new password</a>
          <p style="margin:20px 0 0;color:#64748b;line-height:1.6;font-size:14px">This link expires at <strong>${expiry} UTC</strong> and can be used only once.</p>
          <p style="margin:16px 0 0;color:#94a3b8;line-height:1.6;font-size:12px">If the button does not work, copy and paste this link into your browser:<br />${resetUrl}</p>
        </div>
      </div>
    `,
  };
}

export async function sendPasswordResetEmail(input: SendPasswordResetEmailInput) {
  const { subject, text, html } = buildPasswordResetMessage(input);
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.PASSWORD_RESET_EMAIL_FROM?.trim() || "Career Mentor <onboarding@resend.dev>";

  if (!apiKey) {
    console.info("PASSWORD RESET EMAIL (configure RESEND_API_KEY to send automatically):", {
      to: input.email,
      subject,
      resetUrl: input.resetUrl,
      expiresAt: input.expiresAt.toISOString(),
    });

    return { delivered: false, provider: "console" as const };
  }

  const payload: ResendPayload = {
    from,
    to: [input.email],
    subject,
    html,
    text,
  };

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Password reset email failed: ${body}`);
  }

  return { delivered: true, provider: "resend" as const };
}
