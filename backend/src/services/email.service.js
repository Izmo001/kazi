import nodemailer from "nodemailer";

class EmailService {
  constructor() {
    this.transporter = null;
    this.init();
  }

  init() {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || "smtp.gmail.com",
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
      console.log("✅ Email service initialized");
    } else {
      console.log("⚠️ Email credentials not configured");
    }
  }

  async sendWelcomeEmail(user) {
    if (!this.transporter) return;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Welcome to JobAssist!</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2>Hi ${user.name},</h2>
          <p>Thank you for joining JobAssist! We're excited to help you find your dream job.</p>
          <h3>Next Steps:</h3>
          <ul>
            <li>Complete your profile with skills and experience</li>
            <li>Upload your CV</li>
            <li>Choose a subscription plan</li>
            <li>Let us apply to jobs on your behalf</li>
          </ul>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/profile" style="display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px;">Complete Your Profile</a>
        </div>
        <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
          <p>© 2024 JobAssist. All rights reserved.</p>
        </div>
      </div>
    `;

    await this.send(user.email, "Welcome to JobAssist! 🎉", html);
  }

  async sendSubscriptionConfirmation(user, subscription) {
    if (!this.transporter) return;

    const endDate = subscription.endDate ? new Date(subscription.endDate).toLocaleDateString() : "N/A";

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Subscription Confirmed!</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2>Hi ${user.name},</h2>
          <p>Your <strong>${subscription.plan}</strong> subscription has been activated successfully!</p>
          <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Plan Details:</h3>
            <p><strong>Plan:</strong> ${subscription.plan}</p>
            <p><strong>Applications:</strong> ${subscription.applicationsRemaining} remaining</p>
            <p><strong>Valid Until:</strong> ${endDate}</p>
          </div>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" style="display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px;">Go to Dashboard</a>
        </div>
        <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
          <p>© 2024 JobAssist. All rights reserved.</p>
        </div>
      </div>
    `;

    await this.send(user.email, `Your ${subscription.plan} Plan is Active! 🚀`, html);
  }

  async sendApplicationStatusUpdate(user, application, job) {
    if (!this.transporter) return;

    const statusMessages = {
      pending: "is being reviewed",
      accepted: "has been accepted! 🎉",
      rejected: "has been updated",
    };

    const statusColors = {
      pending: "#f39c12",
      accepted: "#27ae60",
      rejected: "#e74c3c",
    };

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Application Update</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2>Hi ${user.name},</h2>
          <p>Your application for <strong>${job.title}</strong> at <strong>${job.company}</strong> ${statusMessages[application.status]}</p>
          <div style="display: inline-block; padding: 5px 15px; border-radius: 20px; color: white; background: ${statusColors[application.status]}; margin: 10px 0;">
            ${application.status.toUpperCase()}
          </div>
          ${application.status === "accepted" ? '<p>🎉 Congratulations! The employer is interested in your profile. Check your email for next steps.</p>' : ""}
          ${application.status === "rejected" ? '<p>💪 Don\'t be discouraged! Keep applying, the right opportunity is waiting for you.</p>' : ""}
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" style="display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px;">View All Applications</a>
        </div>
        <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
          <p>© 2024 JobAssist. All rights reserved.</p>
        </div>
      </div>
    `;

    await this.send(user.email, `Application Update: ${job.title}`, html);
  }

  async send(to, subject, html) {
    try {
      const info = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || "JobAssist <noreply@jobassist.co.ke>",
        to,
        subject,
        html,
      });
      console.log(`✅ Email sent to ${to}: ${info.messageId}`);
      return { success: true };
    } catch (error) {
      console.error(`❌ Email failed to ${to}:`, error.message);
      return { success: false, error: error.message };
    }
  }
}

export default new EmailService();