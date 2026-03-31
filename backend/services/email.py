import smtplib
import ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import logging

from backend.database.config import get_settings

logger = logging.getLogger(__name__)


class EmailDeliveryError(RuntimeError):
    pass


def email_delivery_is_configured() -> bool:
    settings = get_settings()
    smtp_host = getattr(settings, "smtp_host", "").strip()
    smtp_username = getattr(settings, "smtp_username", "").strip()
    smtp_password = getattr(settings, "smtp_password", "").strip()
    return bool(smtp_host and smtp_username and smtp_password)


def _wrap_email(content: str) -> str:
    return f"""
    <html>
      <body style="margin:0;padding:0;background:#050814;font-family:Inter,Arial,sans-serif;color:#f5f7ff;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:24px 0;">
          <tr>
            <td align="center">
              <table role="presentation" width="560" cellspacing="0" cellpadding="0" style="max-width:560px;background:#0b1020;border:1px solid #252f4a;border-radius:16px;overflow:hidden;">
                <tr>
                  <td style="background:linear-gradient(90deg,#6f3bff,#2ac7ff);padding:22px 28px;">
                    <div style="font-size:24px;font-weight:700;letter-spacing:0.5px;color:white;">Orbit Intel-AI</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:28px;">
                    {content}
                  </td>
                </tr>
                <tr>
                  <td style="padding:18px 28px;border-top:1px solid #1d2740;color:#8d99c5;font-size:12px;">
                    Orbit Intel-AI | Career Intelligence Platform
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
    """


def _deliver_via_smtp(
    smtp_host: str,
    smtp_port: int,
    smtp_username: str,
    smtp_password: str,
    sender_email: str,
    recipient_email: str,
    message: MIMEMultipart,
    *,
    use_tls: bool,
    use_ssl: bool,
) -> None:
    smtp_client = smtplib.SMTP_SSL if use_ssl else smtplib.SMTP
    with smtp_client(smtp_host, smtp_port, timeout=20) as server:
        if use_tls and not use_ssl:
            server.ehlo()
            server.starttls(context=ssl.create_default_context())
            server.ehlo()
        server.login(smtp_username, smtp_password)
        server.sendmail(sender_email, [recipient_email], message.as_string())


def _send_email(recipient_email: str, subject: str, html_body: str) -> None:
    settings = get_settings()
    smtp_host = getattr(settings, "smtp_host", "").strip()
    smtp_username = getattr(settings, "smtp_username", "").strip()
    smtp_password = getattr(settings, "smtp_password", "").strip()

    if not smtp_host or not smtp_username or not smtp_password:
        raise EmailDeliveryError("Email delivery is not configured yet. Add SMTP_HOST, SMTP_USERNAME, and SMTP_PASSWORD on the backend.")

    smtp_port = int(getattr(settings, "smtp_port", 587))
    sender_email = getattr(settings, "smtp_sender_email", smtp_username).strip() or smtp_username
    sender_name = getattr(settings, "smtp_sender_name", "Orbit Intel-AI").strip() or "Orbit Intel-AI"
    use_tls = bool(getattr(settings, "smtp_use_tls", True))
    use_ssl = bool(getattr(settings, "smtp_use_ssl", False)) or smtp_port == 465

    message = MIMEMultipart("alternative")
    message["Subject"] = subject
    message["From"] = f"{sender_name} <{sender_email}>"
    message["To"] = recipient_email
    message.attach(MIMEText(html_body, "html"))

    try:
        _deliver_via_smtp(
            smtp_host,
            smtp_port,
            smtp_username,
            smtp_password,
            sender_email,
            recipient_email,
            message,
            use_tls=use_tls,
            use_ssl=use_ssl,
        )
    except smtplib.SMTPException as exc:
        logger.exception("SMTP delivery failed for %s", recipient_email)
        raise EmailDeliveryError("We could not send the recovery email right now. Please try again shortly.") from exc
    except OSError as exc:
        fallback_attempted = False

        if smtp_host.lower() == "smtp.gmail.com":
            fallback_attempted = True
            fallback_port = 465 if smtp_port == 587 else 587
            fallback_use_ssl = fallback_port == 465
            fallback_use_tls = not fallback_use_ssl

            try:
                _deliver_via_smtp(
                    smtp_host,
                    fallback_port,
                    smtp_username,
                    smtp_password,
                    sender_email,
                    recipient_email,
                    message,
                    use_tls=fallback_use_tls,
                    use_ssl=fallback_use_ssl,
                )
                return
            except (smtplib.SMTPException, OSError):
                logger.exception("SMTP fallback delivery failed for %s", recipient_email)

        logger.exception("SMTP connection failed for %s", recipient_email)
        if fallback_attempted:
            raise EmailDeliveryError("We could not connect to Gmail from the server. Check Railway SMTP settings, Gmail App Password, and whether port 587 or 465 is allowed.") from exc
        raise EmailDeliveryError("We could not connect to the email service right now. Please try again shortly.") from exc


def _safe_background_email(send_fn, *args: str) -> None:
    try:
        send_fn(*args)
    except EmailDeliveryError:
        logger.exception("Background email delivery failed.")


def send_welcome_email(recipient_email: str, username: str) -> None:
    content = f"""
    <div style="font-size:20px;font-weight:700;margin-bottom:10px;color:#ffffff;">Welcome aboard, {username}</div>
    <p style="font-size:15px;line-height:1.65;margin:0 0 14px;color:#d6ddff;">
      Your account has been created successfully. You are now ready to upload your CV,
      analyze role fit, and get actionable career recommendations.
    </p>
    <p style="font-size:14px;line-height:1.6;margin:0;color:#9da8d3;">
      If you did not create this account, please ignore this email.
    </p>
    """
    _safe_background_email(_send_email, recipient_email, "Welcome to Orbit Intel-AI", _wrap_email(content))


def send_password_reset_email(recipient_email: str, username: str, reset_link: str) -> None:
    content = f"""
    <div style="font-size:20px;font-weight:700;margin-bottom:10px;color:#ffffff;">Reset your password</div>
    <p style="font-size:15px;line-height:1.65;margin:0 0 14px;color:#d6ddff;">
      Hi {username}, we received a request to reset your password.
    </p>
    <p style="margin:22px 0;">
      <a href="{reset_link}" style="display:inline-block;padding:12px 18px;border-radius:10px;background:#2ac7ff;color:#08111f;text-decoration:none;font-weight:700;">
        Choose a new password
      </a>
    </p>
    <p style="font-size:14px;line-height:1.6;margin:0;color:#9da8d3;">
      If you did not request this, you can ignore this email.
    </p>
    """
    _send_email(recipient_email, "Reset your Orbit Intel-AI password", _wrap_email(content))


def send_username_recovery_email(recipient_email: str, username: str) -> None:
    content = f"""
    <div style="font-size:20px;font-weight:700;margin-bottom:10px;color:#ffffff;">Your username reminder</div>
    <p style="font-size:15px;line-height:1.65;margin:0 0 14px;color:#d6ddff;">
      Your username is <strong>{username}</strong>.
    </p>
    <p style="font-size:14px;line-height:1.6;margin:0;color:#9da8d3;">
      You can also log in using your email address if that is easier.
    </p>
    """
    _send_email(recipient_email, "Your Orbit Intel-AI username", _wrap_email(content))
