const nodemailer = require('nodemailer');

// Create transporter for Gmail SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD // Use App Password for Gmail
    }
  });
};

const formatUTCDate = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString('en-CA', { timeZone: 'UTC' }); // YYYY-MM-DD
};
const formatUTCTime = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleTimeString('en-GB', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit', hour12: false });
};

const formatLocalDate = (date, timezone) => {
  if (!timezone) return '';
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString('en-CA', { timeZone: timezone });
};
const formatLocalTime = (date, timezone) => {
  if (!timezone) return '';
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleTimeString('en-GB', { timeZone: timezone, hour: '2-digit', minute: '2-digit', hour12: false });
};

// Email templates for different recipient types
const createDoctorEmail = (doctorName, patientName, jitsiLink, appointmentDetails) => {
  const { startTime, endTime, notes, timezone } = appointmentDetails;
  const showLocal = timezone && timezone.length > 0;
  
  return {
    subject: `New Patient Consultation - ${patientName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">New Patient Consultation</h2>
        
        <p>Hello Dr. ${doctorName},</p>
        
        <p>You have a new video consultation appointment scheduled with <strong>${patientName}</strong>.</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #34495e; margin-top: 0;">Appointment Details:</h3>
          <p><strong>Patient:</strong> ${patientName}</p>
          ${showLocal ? `<p><strong>Date (Local):</strong> ${formatLocalDate(startTime, timezone)} <span style='color:#888;'>(${timezone})</span></p>` : ''}
          ${showLocal ? `<p><strong>Time (Local):</strong> ${formatLocalTime(startTime, timezone)} - ${formatLocalTime(endTime, timezone)} <span style='color:#888;'>(${timezone})</span></p>` : ''}
          <p><strong>Date:</strong> ${formatUTCDate(startTime)}  (UTC)</p>
          <p><strong>Time:</strong> ${formatUTCTime(startTime)} - ${formatUTCTime(endTime)}  (UTC)</p>
          ${notes ? `<p><strong>Patient Notes:</strong> ${notes}</p>` : ''}
        </div>
        
        <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #27ae60; margin-top: 0;">Start Your Consultation:</h3>
          <p>Click the link below to join your video consultation:</p>
          <a href="${jitsiLink}" 
             style="display: inline-block; background-color: #27ae60; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Join Video Consultation
          </a>
          <p style="margin-top: 10px; font-size: 14px; color: #666;">
            Or copy this link: <a href="${jitsiLink}">${jitsiLink}</a>
          </p>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 14px;">
            This is an automated message from SageCare. Please do not reply to this email.
          </p>
        </div>
      </div>
    `
  };
};

const createPatientEmail = (patientName, doctorName, jitsiLink, appointmentDetails) => {
  const { startTime, endTime, notes, timezone } = appointmentDetails;
  const showLocal = timezone && timezone.length > 0;
  
  return {
    subject: `Your Video Consultation with Dr. ${doctorName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Your Video Consultation</h2>
        
        <p>Hello ${patientName},</p>
        
        <p>Your video consultation with <strong>Dr. ${doctorName}</strong> has been scheduled.</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #34495e; margin-top: 0;">Appointment Details:</h3>
          <p><strong>Doctor:</strong> Dr. ${doctorName}</p>
          ${showLocal ? `<p><strong>Date (Local):</strong> ${formatLocalDate(startTime, timezone)} <span style='color:#888;'>(${timezone})</span></p>` : ''}
          ${showLocal ? `<p><strong>Time (Local):</strong> ${formatLocalTime(startTime, timezone)} - ${formatLocalTime(endTime, timezone)} <span style='color:#888;'>(${timezone})</span></p>` : ''}
          <p><strong>Date:</strong> ${formatUTCDate(startTime)}  (UTC)</p>
          <p><strong>Time:</strong> ${formatUTCTime(startTime)} - ${formatUTCTime(endTime)}  (UTC)</p>
          ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
        </div>
        
        <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #27ae60; margin-top: 0;">Join Your Consultation:</h3>
          <p>Click the link below to join your video consultation:</p>
          <a href="${jitsiLink}" 
             style="display: inline-block; background-color: #27ae60; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Join Video Consultation
          </a>
          <p style="margin-top: 10px; font-size: 14px; color: #666;">
            Or copy this link: <a href="${jitsiLink}">${jitsiLink}</a>
          </p>
        </div>
        
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <h4 style="color: #856404; margin-top: 0;">Before Your Consultation:</h4>
          <ul style="color: #856404; margin: 10px 0;">
            <li>Ensure you have a stable internet connection</li>
            <li>Test your microphone and camera</li>
            <li>Find a quiet, private location</li>
            <li>Have any relevant medical information ready</li>
          </ul>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 14px;">
            This is an automated message from SageCare. Please do not reply to this email.
          </p>
        </div>
      </div>
    `
  };
};

const createThirdPartyEmail = (jitsiLink, appointmentDetails) => {
  const { startTime, endTime, notes, timezone } = appointmentDetails;
  const showLocal = timezone && timezone.length > 0;
  
  return {
    subject: 'Video Consultation Invitation',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Video Consultation Invitation</h2>
        
        <p>Hello,</p>
        
        <p>You have been invited to join a video consultation session.</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #34495e; margin-top: 0;">Session Details:</h3>
          ${showLocal ? `<p><strong>Date (Local):</strong> ${formatLocalDate(startTime, timezone)} <span style='color:#888;'>(${timezone})</span></p>` : ''}
          ${showLocal ? `<p><strong>Time (Local):</strong> ${formatLocalTime(startTime, timezone)} - ${formatLocalTime(endTime, timezone)} <span style='color:#888;'>(${timezone})</span></p>` : ''}
          <p><strong>Date:</strong> ${formatUTCDate(startTime)}  (UTC)</p>
          <p><strong>Time:</strong> ${formatUTCTime(startTime)} - ${formatUTCTime(endTime)} (UTC)</p>
          ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
        </div>
        
        <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #27ae60; margin-top: 0;">Join the Consultation:</h3>
          <p>Click the link below to join the video consultation:</p>
          <a href="${jitsiLink}" 
             style="display: inline-block; background-color: #27ae60; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Join Video Consultation
          </a>
          <p style="margin-top: 10px; font-size: 14px; color: #666;">
            Or copy this link: <a href="${jitsiLink}">${jitsiLink}</a>
          </p>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 14px;">
            This is an automated message from SageCare. Please do not reply to this email.
          </p>
        </div>
      </div>
    `
  };
};

// Send email function
const sendEmail = async (to, subject, html) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      html: html
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to}:`, result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
    return { success: false, error: error.message };
  }
};

// Send appointment notifications
const sendAppointmentNotifications = async (appointmentData) => {
  const { doctor, patient, thirdParty, jitsiLink, date, startTime, endTime, notes } = appointmentData;
  
  const appointmentDetails = { date, startTime, endTime, notes };
  
  try {
    // Get doctor and patient details from database
    const Doctor = require('../models/Doctor');
    const User = require('../models/User');
    
    const doctorDoc = await Doctor.findById(doctor);
    const patientDoc = await User.findById(patient);
    
    if (!doctorDoc || !patientDoc) {
      console.error('Doctor or patient not found');
      return;
    }
    
    const results = [];
    
    // Send email to doctor
    if (doctorDoc.email) {
      const doctorEmail = createDoctorEmail(
        `${doctorDoc.first_name} ${doctorDoc.last_name}`,
        `${patientDoc.first_name} ${patientDoc.last_name}`,
        jitsiLink,
        appointmentDetails
      );
      
      const doctorResult = await sendEmail(
        doctorDoc.email,
        doctorEmail.subject,
        doctorEmail.html
      );
      results.push({ recipient: 'doctor', email: doctorDoc.email, result: doctorResult });
    }
    
    // Send email to patient
    if (patientDoc.email) {
      const patientEmail = createPatientEmail(
        `${patientDoc.first_name} ${patientDoc.last_name}`,
        `${doctorDoc.first_name} ${doctorDoc.last_name}`,
        jitsiLink,
        appointmentDetails
      );
      
      const patientResult = await sendEmail(
        patientDoc.email,
        patientEmail.subject,
        patientEmail.html
      );
      results.push({ recipient: 'patient', email: patientDoc.email, result: patientResult });
    }
    
    // Send email to third party if provided
    if (thirdParty) {
      const thirdPartyEmail = createThirdPartyEmail(
        jitsiLink,
        appointmentDetails
      );
      
      const thirdPartyResult = await sendEmail(
        thirdParty,
        thirdPartyEmail.subject,
        thirdPartyEmail.html
      );
      results.push({ recipient: 'thirdParty', email: thirdParty, result: thirdPartyResult });
    }
    
    console.log('Email notification results:', results);
    return results;
    
  } catch (error) {
    console.error('Error sending appointment notifications:', error);
    throw error;
  }
};

module.exports = {
  sendEmail,
  sendAppointmentNotifications
}; 