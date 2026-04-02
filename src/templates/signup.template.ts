export const registerTemplate = ({
  companyName = "Your Company",
  userName = "User",
  dashboardLink = "#",
  companyAddress = "Your Company Address",
  year = new Date().getFullYear(),
  unsubscribeLink = "#"
}) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Welcome to ${companyName}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  </head>

  <body style="margin:0; padding:0; background-color:#0f172a; font-family: Arial, sans-serif;">

    <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" 
           style="background:#111827; margin-top:30px; border-radius:10px; overflow:hidden; border:1px solid #1f2937;">

      <!-- Header -->
      <tr>
        <td align="center" style="background:#1f2937; padding:25px;">
          <h1 style="margin:0; color:#22c55e; font-size:24px;">
            ${companyName}
          </h1>
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="padding:30px;">
          <h2 style="color:#f9fafb; margin-bottom:10px;">
            Welcome, ${userName} 👋
          </h2>

          <p style="color:#d1d5db; line-height:1.6;">
            Thanks for joining <strong>${companyName}</strong>.  
            We're excited to have you on board 🚀
          </p>

          <p style="color:#d1d5db; line-height:1.6;">
            You now have full access to explore and start using our platform.
          </p>

          <!-- CTA Button -->
          <div style="text-align:center; margin:30px 0;">
            <a href="${dashboardLink}" 
               style="background:#22c55e; color:#022c22; padding:12px 26px; 
                      text-decoration:none; border-radius:6px; font-weight:bold; display:inline-block;">
              Get Started
            </a>
          </div>

          <p style="color:#9ca3af;">
            If you have any questions, just reply to this email — we’re happy to help.
          </p>

          <p style="margin-top:30px; color:#f3f4f6;">
            — The ${companyName} Team
          </p>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background:#020617; padding:20px; text-align:center; font-size:12px; color:#6b7280;">
          <p style="margin:5px 0;">
            © ${year} ${companyName}. All rights reserved.
          </p>

          <p style="margin:5px 0;">
            ${companyAddress}
          </p>

          <p style="margin:5px 0;">
            <a href="${unsubscribeLink}" style="color:#9ca3af; text-decoration:underline;">
              Unsubscribe
            </a>
          </p>
        </td>
      </tr>

    </table>

  </body>
  </html>
  `;
};