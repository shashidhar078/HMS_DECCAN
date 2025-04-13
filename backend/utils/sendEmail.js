const nodemailer = require("nodemailer");
require("dotenv").config();

const sendEmail = async (to, subject, text, html = null) => {
    // Validate input parameters
    if (!to || !subject || !text) {
        console.error("❌ Missing required email parameters");
        return false;
    }

    // Check environment configuration
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error("❌ Email configuration error: Missing EMAIL_USER or EMAIL_PASS in environment variables");
        return false;
    }

    try {
        console.log(`📧 Attempting to send email to: ${to}`);
        console.log(`🔧 Using SMTP host: smtp.gmail.com`);

        // Create reusable transporter object
        const transporter = nodemailer.createTransport({
            service: 'gmail', // Use service name instead of raw host/port
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: false // Bypass SSL verification (for testing only)
            }
        });

        // Verify connection configuration
        await transporter.verify((error, success) => {
            if (error) {
                console.error('❌ SMTP connection verification failed:', error);
            } else {
                console.log('✅ Server is ready to send emails');
            }
        });

        // Setup email data
        const mailOptions = {
            from: `"Hospital Management System" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: subject,
            text: text,
            html: html || `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    ${text.replace(/\n/g, '<br>')}
                    <br><br>
                    <footer style="margin-top: 20px; padding-top: 10px; border-top: 1px solid #eee;">
                        <p>Regards,<br>Hospital Management Team</p>
                    </footer>
                </div>
            `
        };

        // Send mail with defined transport object
        const info = await transporter.sendMail(mailOptions);
        
        console.log("✅ Email sent successfully");
        console.log(`   Message ID: ${info.messageId}`);
        console.log(`   Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
        
        return true;
    } catch (error) {
        console.error("❌ Email sending failed with error:");
        console.error(error);
        
        // Specific error handling
        if (error.code === 'EAUTH') {
            console.error("Authentication failed - please check your email credentials");
        } else if (error.code === 'EENVELOPE') {
            console.error("Invalid recipient address");
        } else {
            console.error("SMTP error details:", error.responseCode, error.response);
        }
        
        return false;
    }
};

module.exports = sendEmail;