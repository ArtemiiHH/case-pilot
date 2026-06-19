import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendCaseCreatedEmail({ firmName, firmEmail, clientEmail, clientFirstName, trackingUrl }) {
  await resend.emails.send({
    from: `${firmName} <${firmEmail}>`,
    to: clientEmail,
    subject: `Your case has been registered — ${firmName}`,
    html: `
      <p>Hi ${clientFirstName},</p>
      <p>Your case has been registered with ${firmName}. You can track its progress at any time using the link below.</p>
      <p><a href="${trackingUrl}">View your case status</a></p>
    `,
  })
}

export async function sendCaseUpdatedEmail({ firmName, firmEmail, clientEmail, clientFirstName, newStage, note, trackingUrl }) {
  const noteHtml = note ? `<p><strong>Note from your lawyer:</strong> ${note}</p>` : ''

  await resend.emails.send({
    from: `${firmName} <${firmEmail}>`,
    to: clientEmail,
    subject: `Update on your case — ${firmName}`,
    html: `
      <p>Hi ${clientFirstName},</p>
      <p>There has been an update on your case.</p>
      <p><strong>Current stage:</strong> ${newStage}</p>
      ${noteHtml}
      <p><a href="${trackingUrl}">View full case status</a></p>
    `,
  })
}
