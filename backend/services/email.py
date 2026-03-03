import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from backend.database.config import get_settings


def _build_welcome_email_html(username: str) -> str:
    return f"""
    <html>
      <body style=\"margin:0;padding:0;background:#050814;font-family:Inter,Arial,sans-serif;color:#f5f7ff;\">
        <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"padding:24px 0;\">
          <tr>
            <td align=\"center\">
              <table role=\"presentation\" width=\"560\" cellspacing=\"0\" cellpadding=\"0\" style=\"max-width:560px;background:#0b1020;border:1px solid #252f4a;border-radius:16px;overflow:hidden;\">
                <tr>
                  <td style=\"background:linear-gradient(90deg,#6f3bff,#2ac7ff);padding:22px 28px;\">
                    <div style=\"font-size:24px;font-weight:700;letter-spacing:0.5px;color:white;\">Orbit Intel-AI</div>
                  </td>
                </tr>
                <tr>
                  <td style=\"padding:28px;\">
                    <div style=\"font-size:20px;font-weight:700;margin-bottom:10px;color:#ffffff;\">Welcome aboard, {username} 🚀</div>
                    <p style=\"font-size:15px;line-height:1.65;margin:0 0 14px;color:#d6ddff;\">
                      Your account has been created successfully. You're now ready to upload your CV,
                      analyze role fit, and get actionable career recommendations.
                    </p>
                    <p style=\"font-size:14px;line-height:1.6;margin:0;color:#9da8d3;\">
                      If you did not create this account, please ignore this email.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style=\"padding:18px 28px;border-top:1px solid #1d2740;color:#8d99c5;font-size:12px;\">
                    © Orbit Intel-AI · Career Intelligence Platform
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
    """


def send_welcome_email(recipient_email: str, username: str) -> None:
    settings = get_settings()
    smtp_host = getattr(settings, "smtp_host", "").strip()
    smtp_username = getattr(settings, "smtp_username", "").strip()
    smtp_password = getattr(settings, "smtp_password", "").strip()

    if not smtp_host or not smtp_username or not smtp_password:
        return

    smtp_port = int(getattr(settings, "smtp_port", 587))
    sender_email = getattr(settings, "smtp_sender_email", smtp_username).strip() or smtp_username
    sender_name = getattr(settings, "smtp_sender_name", "Orbit Intel-AI").strip() or "Orbit Intel-AI"
    use_tls = bool(getattr(settings, "smtp_use_tls", True))

    message = MIMEMultipart("alternative")
    message["Subject"] = "Welcome to Orbit Intel-AI"
    message["From"] = f"{sender_name} <{sender_email}>"
    message["To"] = recipient_email
    message.attach(MIMEText(_build_welcome_email_html(username=username), "html"))

    with smtplib.SMTP(smtp_host, smtp_port, timeout=20) as server:
        if use_tls:
            server.starttls()
        server.login(smtp_username, smtp_password)
        server.sendmail(sender_email, [recipient_email], message.as_string())
