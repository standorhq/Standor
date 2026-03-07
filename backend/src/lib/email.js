import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const generateEmailHTML = (analysis, sessionData) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background-color: #0f172a; color: #e2e8f0; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 8px; padding: 30px; }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { font-size: 32px; font-weight: bold; background: linear-gradient(to right, #3b82f6, #8b5cf6, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .section { margin: 20px 0; padding: 15px; background-color: #334155; border-radius: 6px; }
    .metric { display: flex; justify-content: space-between; margin: 10px 0; }
    .label { color: #94a3b8; }
    .value { color: #e2e8f0; font-weight: bold; }
    .score { font-size: 48px; font-weight: bold; text-align: center; margin: 20px 0; }
    .score.good { color: #10b981; }
    .score.medium { color: #f59e0b; }
    .score.poor { color: #ef4444; }
    .list { list-style: none; padding: 0; }
    .list li { padding: 8px; margin: 5px 0; background-color: #475569; border-radius: 4px; }
    .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">✨ Standor</div>
      <p style="color: #94a3b8;">Code Together</p>
    </div>

    <h2 style="color: #e2e8f0;">Interview Session Analysis</h2>
    
    <div class="section">
      <h3>Session Details</h3>
      <div class="metric">
        <span class="label">Problem:</span>
        <span class="value">${sessionData.problem}</span>
      </div>
      <div class="metric">
        <span class="label">Difficulty:</span>
        <span class="value">${sessionData.difficulty}</span>
      </div>
      <div class="metric">
        <span class="label">Duration:</span>
        <span class="value">${sessionData.duration}</span>
      </div>
    </div>

    ${analysis ? `
    <div class="section">
      <h3>Overall Score</h3>
      <div class="score ${analysis.overallScore >= 70 ? 'good' : analysis.overallScore >= 50 ? 'medium' : 'poor'}">
        ${analysis.overallScore}/100
      </div>
    </div>

    <div class="section">
      <h3>Complexity Analysis</h3>
      <div class="metric">
        <span class="label">Time Complexity:</span>
        <span class="value">${analysis.timeComplexity}</span>
      </div>
      <div class="metric">
        <span class="label">Space Complexity:</span>
        <span class="value">${analysis.spaceComplexity}</span>
      </div>
      <div class="metric">
        <span class="label">Correctness:</span>
        <span class="value">${analysis.correctness}/100</span>
      </div>
      <div class="metric">
        <span class="label">Code Style:</span>
        <span class="value">${analysis.codeStyle}/100</span>
      </div>
    </div>

    ${analysis.bugs && analysis.bugs.length > 0 ? `
    <div class="section">
      <h3>Bugs Found</h3>
      <ul class="list">
        ${analysis.bugs.map(bug => `<li>⚠️ ${bug}</li>`).join('')}
      </ul>
    </div>
    ` : ''}

    ${analysis.suggestions && analysis.suggestions.length > 0 ? `
    <div class="section">
      <h3>Suggestions</h3>
      <ul class="list">
        ${analysis.suggestions.map(suggestion => `<li>💡 ${suggestion}</li>`).join('')}
      </ul>
    </div>
    ` : ''}

    <div class="section">
      <h3>Summary</h3>
      <p>${analysis.summary}</p>
    </div>
    ` : '<p>Analysis not available for this session.</p>'}

    <div class="footer">
      <p>Standor - The Standard for Technical Interviews</p>
      <p>This is an automated email. Please do not reply.</p>
    </div>
  </div>
</body>
</html>
  `;
};

export const sendSessionFeedback = async (toEmail, analysis, sessionData) => {
  try {
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@standor.dev',
      to: toEmail,
      subject: `Standor Interview Feedback - ${sessionData.problem}`,
      html: generateEmailHTML(analysis, sessionData)
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email error:', error.message);
    return { success: false, error: error.message };
  }
};

export const verifyEmailConfig = async () => {
  try {
    await transporter.verify();
    console.log('Email service is ready');
    return true;
  } catch (error) {
    console.error('Email service error:', error.message);
    return false;
  }
};
