const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendSkillExchangeInvitation = async (invitationData) => {
  const {
    recipientEmail,
    recipientName,
    senderName,
    senderUsername,
    offeredSkills,
    wantedSkills,
    message,
    invitationLink
  } = invitationData;

  try {
    const { data, error } = await resend.emails.send({
      from: `SkillSwapper <${process.env.FROM_EMAIL || 'onboarding@resend.dev'}>`,
      to: [recipientEmail],
      subject: `New Skill Exchange Invitation from ${senderName}`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Skill Exchange Invitation</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              line-height: 1.6;
              color: #1a1a1a;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 40px 20px;
              min-height: 100vh;
            }
            
            .email-wrapper {
              max-width: 600px;
              margin: 0 auto;
              background: rgba(255, 255, 255, 0.95);
              backdrop-filter: blur(20px);
              border-radius: 24px;
              box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
              overflow: hidden;
              border: 1px solid rgba(255, 255, 255, 0.2);
            }
            
            .header {
              background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
              padding: 40px 30px;
              text-align: center;
              position: relative;
              overflow: hidden;
            }
            
            .header::before {
              content: '';
              position: absolute;
              top: 0;
              left: -100%;
              width: 100%;
              height: 100%;
              background: linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.3), transparent);
              animation: shimmer 3s infinite;
            }
            
            @keyframes shimmer {
              0% { left: -100%; }
              100% { left: 100%; }
            }
            
            .logo-container {
              margin-bottom: 20px;
              position: relative;
              z-index: 2;
            }
            
            .logo {
              width: 80px;
              height: 80px;
              background: linear-gradient(135deg, #8b5cf6, #6d28d9);
              border-radius: 20px;
              margin: 0 auto 15px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 32px;
              font-weight: 700;
              color: white;
              box-shadow: 0 10px 30px rgba(139, 92, 246, 0.3);
              animation: float 3s ease-in-out infinite;
            }
            
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-10px); }
            }
            
            .brand-name {
              font-size: 24px;
              font-weight: 700;
              color: white;
              margin-bottom: 10px;
              letter-spacing: -0.5px;
            }
            
            .title {
              font-size: 28px;
              font-weight: 600;
              color: white;
              margin: 0;
              position: relative;
              z-index: 2;
            }
            
            .content {
              padding: 40px 30px;
              background: white;
            }
            
            .greeting {
              font-size: 20px;
              font-weight: 500;
              margin-bottom: 25px;
              color: #1a1a1a;
            }
            
            .sender-info {
              background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
              border: 1px solid #e2e8f0;
              border-radius: 16px;
              padding: 20px;
              margin-bottom: 30px;
              position: relative;
            }
            
            .sender-info::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 4px;
              background: linear-gradient(90deg, #8b5cf6, #6d28d9);
              border-radius: 16px 16px 0 0;
            }
            
            .sender-name {
              font-size: 18px;
              font-weight: 600;
              color: #1a1a1a;
              margin-bottom: 5px;
            }
            
            .sender-username {
              font-size: 14px;
              color: #64748b;
              font-weight: 500;
            }
            
            .skills-container {
              margin: 30px 0;
            }
            
            .skills-section {
              background: #fafafa;
              border-radius: 16px;
              padding: 25px;
              margin-bottom: 20px;
              border: 1px solid #f0f0f0;
              position: relative;
              overflow: hidden;
            }
            
            .skills-section::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 3px;
              background: linear-gradient(90deg, #8b5cf6, #6d28d9);
            }
            
            .skills-title {
              font-size: 16px;
              font-weight: 600;
              color: #1a1a1a;
              margin-bottom: 15px;
              display: flex;
              align-items: center;
            }
            
            .skills-title.offering::before {
              content: '🎁';
              margin-right: 8px;
            }
            
            .skills-title.learning::before {
              content: '🎯';
              margin-right: 8px;
            }
            
            .skill-tags {
              display: flex;
              flex-wrap: wrap;
              gap: 10px;

            }
            
            .skill-tag {
              background: linear-gradient(135deg, #8b5cf6, #7c3aed);
              color:rgb(255, 255, 255);
              padding: 8px 16px;
              border-radius: 25px;
              font-size: 14px;
              font-weight: 500;
              box-shadow: 0 4px 15px rgba(139, 92, 246, 0.2);
              transition: all 0.3s ease;
              animation: slideInUp 0.6s ease forwards;
              opacity: 0;
            }
            
            .skill-tag:nth-child(1) { animation-delay: 0.1s; }
            .skill-tag:nth-child(2) { animation-delay: 0.2s; }
            .skill-tag:nth-child(3) { animation-delay: 0.3s; }
            .skill-tag:nth-child(4) { animation-delay: 0.4s; }
            .skill-tag:nth-child(5) { animation-delay: 0.5s; }
            
            @keyframes slideInUp {
              from {
                opacity: 0;
                transform: translateY(20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            
            .skill-tag.wanted {
              background: linear-gradient(135deg, #1e293b, #334155);
            }
            
            .message-box {
              background: linear-gradient(135deg, #f8f4ff, #f3f0ff);
              border: 1px solid #e9d5ff;
              border-left: 4px solid #8b5cf6;
              border-radius: 12px;
              padding: 20px;
              margin: 25px 0;
              position: relative;
            }
            
            .message-label {
              font-weight: 600;
              color: #5b21b6;
              margin-bottom: 8px;
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .message-text {
              color: #1a1a1a;
              font-style: italic;
              line-height: 1.6;
            }
            
            .cta-container {
              text-align: center;
              margin: 40px 0;
            }
            
            .cta-button {
              display: inline-block;
              background: linear-gradient(135deg, #8b5cf6, #7c3aed);
              color: white;
              padding: 18px 40px;
              text-decoration: none;
              border-radius: 50px;
              font-weight: 600;
              font-size: 16px;
              box-shadow: 0 10px 30px rgba(139, 92, 246, 0.3);
              transition: all 0.3s ease;
              position: relative;
              overflow: hidden;
            }
            
            .cta-button::before {
              content: '';
              position: absolute;
              top: 0;
              left: -100%;
              width: 100%;
              height: 100%;
              background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
              transition: left 0.6s ease;
            }
            
            .cta-button:hover::before {
              left: 100%;
            }
            
            .disclaimer {
              color: #64748b;
              font-size: 13px;
              text-align: center;
              margin-top: 20px;
              line-height: 1.5;
            }
            
            .footer {
              background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
              padding: 30px;
              text-align: center;
              color: #9ca3af;
            }
            
            .footer-message {
              font-size: 16px;
              font-weight: 500;
              margin-bottom: 20px;
              color: white;
            }
            
            .social-links {
              margin: 20px 0;
            }
            
            .social-links a {
              color: #8b5cf6;
              text-decoration: none;
              margin: 0 15px;
              font-weight: 500;
              transition: color 0.3s ease;
            }
            
            .social-links a:hover {
              color: #a78bfa;
            }
            
            .copyright {
              font-size: 12px;
              color: #6b7280;
              margin-top: 20px;
            }
            
            @media (max-width: 600px) {
              body { padding: 20px 10px; }
              .content, .header, .footer { padding: 25px 20px; }
              .title { font-size: 24px; }
              .greeting { font-size: 18px; }
              .cta-button { padding: 16px 32px; }
            }
          </style>
        </head>
        <body>
          <div class="email-wrapper">
            <div class="header">
              <div class="logo-container">
                <img src="https://ibb.co/GQy2wT4k" alt="SkillSwapper Logo" class="logo" />
                <div class="brand-name">SkillSwapper</div>
              </div>
              <h1 class="title">New Skill Exchange Invitation</h1>
            </div>
            
            <div class="content">
              <div class="greeting">
                Hi ${recipientName || 'there'}! 👋
              </div>
              
              <div class="sender-info">
                <div class="sender-name">${senderName}</div>
                <div class="sender-username">@${senderUsername}</div>
                <p style="margin-top: 10px; color: #475569;">wants to exchange skills with you!</p>
              </div>
              
              <div class="skills-container">
                <div class="skills-section">
                  <div class="skills-title offering">Skills they're offering</div>
                  <div class="skill-tags">
                    ${offeredSkills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                  </div>
                </div>
                
                <div class="skills-section">
                  <div class="skills-title learning">Skills they want to learn</div>
                  <div class="skill-tags">
                    ${wantedSkills.map(skill => `<span class="skill-tag wanted">${skill}</span>`).join('')}
                  </div>
                </div>
              </div>
              
              ${message ? `
                <div class="message-box">
                  <div class="message-label">Personal Message</div>
                  <div class="message-text">"${message}"</div>
                </div>
              ` : ''}
              
              <div class="cta-container">
                <a href="${invitationLink}" class="cta-button">
                  View & Respond to Invitation
                </a>
              </div>
              
              <div class="disclaimer">
                This invitation was sent through SkillSwapper. Click the button above to view the full details and respond to this skill exchange request.
              </div>
            </div>
            
            <div class="footer">
              <div class="footer-message">Ready to start skill swapping?</div>
              <div class="social-links">
                <a href="#">Visit SkillSwapper</a>
                <a href="#">Help Center</a>
                <a href="#">Unsubscribe</a>
              </div>
              <div class="copyright">
                © 2024 SkillSwapper. All rights reserved.
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Error sending email:', error);
      return { success: false, error: error.message };
    }

    console.log('Email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error in sendSkillExchangeInvitation:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendSkillExchangeInvitation
};