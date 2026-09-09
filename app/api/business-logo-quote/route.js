import { NextResponse } from "next/server";
import { Resend } from "resend";

function getEnv(name) {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : null;
}

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const apiKey = getEnv("RESEND_API_KEY");
    const toEmail = getEnv("RESEND_TO_EMAIL");
    const fromEmail = getEnv("RESEND_FROM_EMAIL") || "Neon Stack <noreply@neonstack.in>";

    if (!apiKey) {
      return NextResponse.json(
        { message: "Email service is not configured. Set RESEND_API_KEY in the environment." },
        { status: 500 }
      );
    }
    if (!toEmail) {
      return NextResponse.json(
        { message: "Email service is not configured. Set RESEND_TO_EMAIL in the environment." },
        { status: 500 }
      );
    }

    const contentType = req.headers.get("content-type") || "";
    let fields = {};
    let artworkFile = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          artworkFile = value;
        } else {
          fields[key] = value;
        }
      }
    } else {
      fields = await req.json();
    }

    const name = String(fields.name || "").trim();
    const email = String(fields.email || "").trim();
    const phone = String(fields.phone || "").trim();
    const signType = String(fields.signType || "").trim();
    const designDetails = String(fields.designDetails || "").trim();
    const budget = String(fields.budget || "").trim();

    if (!name || !email) {
      return NextResponse.json(
        { message: "Name and email are required." },
        { status: 400 }
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { message: "A valid email address is required." },
        { status: 400 }
      );
    }

    const resend = new Resend(apiKey);

    const artworkHtml = artworkFile
      ? `<p><b>Artwork attached:</b> ${artworkFile.name} (${artworkFile.size} bytes, ${artworkFile.type || "unknown type"})</p>`
      : "<p>No artwork attached.</p>";

    const subject = `New Business Logo Quote Request — ${name}`;

    const html = `
      <h2 style="font-family:Space Grotesk,sans-serif;color:#752eff">New Business Logo Quote Request</h2>
      <p>Someone wants a custom business logo neon sign. Details below:</p>
      <table style="border-collapse:collapse;width:100%;max-width:640px;margin-top:16px">
        <tr><td style="padding:8px 12px;font-weight:700;color:#b8bfd8;border-bottom:1px solid #1c212e">Name</td><td style="padding:8px 12px;color:#fff;border-bottom:1px solid #1c212e">${name}</td></tr>
        <tr><td style="padding:8px 12px;font-weight:700;color:#b8bfd8;border-bottom:1px solid #1c212e">Email</td><td style="padding:8px 12px;color:#fff;border-bottom:1px solid #1c212e"><a href="mailto:${email}" style="color:#00ffbc">${email}</a></td></tr>
        <tr><td style="padding:8px 12px;font-weight:700;color:#b8bfd8;border-bottom:1px solid #1c212e">Phone</td><td style="padding:8px 12px;color:#fff;border-bottom:1px solid #1c212e">${phone || "—"}</td></tr>
        <tr><td style="padding:8px 12px;font-weight:700;color:#b8bfd8;border-bottom:1px solid #1c212e">Sign Type</td><td style="padding:8px 12px;color:#fff;border-bottom:1px solid #1c212e">${signType || "—"}</td></tr>
        <tr><td style="padding:8px 12px;font-weight:700;color:#b8bfd8;border-bottom:1px solid #1c212e">Budget</td><td style="padding:8px 12px;color:#fff;border-bottom:1px solid #1c212e">${budget || "—"}</td></tr>
      </table>
      <h3 style="font-family:Space Grotesk,sans-serif;color:#752eff;margin-top:24px">Design Details &amp; Requirements</h3>
      <p style="color:#d8d9e4;line-height:1.6;white-space:pre-wrap;background:#0a0d14;border:1px solid #1c212e;border-radius:8px;padding:16px">${designDetails || "—"}</p>
      ${artworkHtml}
      <p style="color:#8992a5;font-size:12px;margin-top:24px">Submitted from the Neon Stack Business Logo page.</p>
    `;

    const text = `
New Business Logo Quote Request

Name: ${name}
Email: ${email}
Phone: ${phone || "—"}
Sign Type: ${signType || "—"}
Budget: ${budget || "—"}

Design Details & Requirements:
${designDetails || "—"}

${artworkFile ? `Artwork attached: ${artworkFile.name} (${artworkFile.size} bytes, ${artworkFile.type || "unknown type"})` : "No artwork attached."}

Submitted from the Neon Stack Business Logo page.
    `;

    const attachments = [];
    if (artworkFile) {
      const arrayBuffer = await artworkFile.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      attachments.push({
        filename: artworkFile.name,
        content: base64,
        content_type: artworkFile.type || "application/octet-stream",
      });
    }

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      subject,
      html,
      text,
      replyTo: email,
      attachments: attachments.length ? attachments : undefined,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { message: error.message || "Failed to send email." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (err) {
    console.error("Business logo quote error:", err);
    return NextResponse.json(
      { message: err?.message || "Internal server error." },
      { status: 500 }
    );
  }
}