export const verifyTemplate = ({
  companyName = "Your Company",
  userName = "User",
  otp = "000000",
  expiryMinutes = 10,
  companyAddress = "Your Company Address",
  year = new Date().getFullYear(),
  unsubscribeLink = "#"
}) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Email Verification - ${companyName}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  </head>

  <body style="margin:0; padding:0; background-color:#0f172a; font-family: Arial, sans-serif;">

    <table align="center" width="600" cellpadding="0" cellspacing="0"
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
        <td style="padding:30px; text-align:center;">
          
          <h2 style="color:#f9fafb; margin-bottom:10px;">
            Verify your email 🔐
          </h2>

          <p style="color:#d1d5db; line-height:1.6;">
            Hi ${userName},<br/>
            Use the OTP below to complete your verification.
          </p>

          <!-- OTP BOX -->
          <div style="
            margin:30px auto;
            padding:20px;
            background:#020617;
            border:1px dashed #22c55e;
            border-radius:10px;
            width:fit-content;
          ">
            <span style="
              font-size:32px;
              letter-spacing:8px;
              font-weight:bold;
              color:#22c55e;
            ">
              ${otp}
            </span>
          </div>

          <p style="color:#9ca3af; font-size:14px;">
            This OTP is valid for <strong>${expiryMinutes} minutes</strong>.
          </p>

          <p style="color:#6b7280; font-size:13px; margin-top:20px;">
            Do not share this code with anyone.
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