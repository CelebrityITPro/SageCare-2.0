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

const createThirdPartyEmail = (jitsiLink, appointmentDetails, thirdPartyName = '') => {
  const { startTime, endTime, notes, timezone } = appointmentDetails;
  const showLocal = timezone && timezone.length > 0;
  
  return {
    subject: 'Video Consultation Invitation',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Video Consultation Invitation</h2>
        
        <p>Hello${thirdPartyName ? ` ${thirdPartyName}` : ''},</p>
        
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

// Email templates for appointment updates
const createUpdateDoctorEmail = (doctorName, patientName, jitsiLink, appointmentDetails) => {
  const { startTime, endTime, notes, timezone } = appointmentDetails;
  const showLocal = timezone && timezone.length > 0;
  
  return {
    subject: `Appointment Updated - ${patientName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Appointment Updated</h2>
        
        <p>Hello Dr. ${doctorName},</p>
        
        <p>Your video consultation appointment with <strong>${patientName}</strong> has been updated.</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #34495e; margin-top: 0;">Updated Appointment Details:</h3>
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

const createUpdatePatientEmail = (patientName, doctorName, jitsiLink, appointmentDetails) => {
  const { startTime, endTime, notes, timezone } = appointmentDetails;
  const showLocal = timezone && timezone.length > 0;
  
  return {
    subject: `Your Appointment with Dr. ${doctorName} Has Been Updated`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Appointment Updated</h2>
        
        <p>Hello ${patientName},</p>
        
        <p>Your video consultation with <strong>Dr. ${doctorName}</strong> has been updated.</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #34495e; margin-top: 0;">Updated Appointment Details:</h3>
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

const createUpdateThirdPartyEmail = (jitsiLink, appointmentDetails) => {
  const { startTime, endTime, notes, timezone } = appointmentDetails;
  const showLocal = timezone && timezone.length > 0;
  
  return {
    subject: 'Video Consultation Updated',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Video Consultation Updated</h2>
        
        <p>Hello,</p>
        
        <p>The video consultation session you were invited to has been updated.</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #34495e; margin-top: 0;">Updated Session Details:</h3>
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

// Email templates for appointment cancellations
const createCancellationDoctorEmail = (doctorName, patientName, appointmentDetails) => {
  const { startTime, endTime, notes, timezone } = appointmentDetails;
  const showLocal = timezone && timezone.length > 0;
  
  return {
    subject: `Appointment Cancelled - ${patientName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #e74c3c;">Appointment Cancelled</h2>
        
        <p>Hello Dr. ${doctorName},</p>
        
        <p>Your video consultation appointment with <strong>${patientName}</strong> has been cancelled.</p>
        
        <div style="background-color: #fdf2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #e74c3c;">
          <h3 style="color: #c0392b; margin-top: 0;">Cancelled Appointment Details:</h3>
          <p><strong>Patient:</strong> ${patientName}</p>
          ${showLocal ? `<p><strong>Date (Local):</strong> ${formatLocalDate(startTime, timezone)} <span style='color:#888;'>(${timezone})</span></p>` : ''}
          ${showLocal ? `<p><strong>Time (Local):</strong> ${formatLocalTime(startTime, timezone)} - ${formatLocalTime(endTime, timezone)} <span style='color:#888;'>(${timezone})</span></p>` : ''}
          <p><strong>Date:</strong> ${formatUTCDate(startTime)}  (UTC)</p>
          <p><strong>Time:</strong> ${formatUTCTime(startTime)} - ${formatUTCTime(endTime)}  (UTC)</p>
          ${notes ? `<p><strong>Patient Notes:</strong> ${notes}</p>` : ''}
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

const createCancellationPatientEmail = (patientName, doctorName, appointmentDetails) => {
  const { startTime, endTime, notes, timezone } = appointmentDetails;
  const showLocal = timezone && timezone.length > 0;
  
  return {
    subject: `Your Appointment with Dr. ${doctorName} Has Been Cancelled`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #e74c3c;">Appointment Cancelled</h2>
        
        <p>Hello ${patientName},</p>
        
        <p>Your video consultation with <strong>Dr. ${doctorName}</strong> has been cancelled.</p>
        
        <div style="background-color: #fdf2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #e74c3c;">
          <h3 style="color: #c0392b; margin-top: 0;">Cancelled Appointment Details:</h3>
          <p><strong>Doctor:</strong> Dr. ${doctorName}</p>
          ${showLocal ? `<p><strong>Date (Local):</strong> ${formatLocalDate(startTime, timezone)} <span style='color:#888;'>(${timezone})</span></p>` : ''}
          ${showLocal ? `<p><strong>Time (Local):</strong> ${formatLocalTime(startTime, timezone)} - ${formatLocalTime(endTime, timezone)} <span style='color:#888;'>(${timezone})</span></p>` : ''}
          <p><strong>Date:</strong> ${formatUTCDate(startTime)}  (UTC)</p>
          <p><strong>Time:</strong> ${formatUTCTime(startTime)} - ${formatUTCTime(endTime)}  (UTC)</p>
          ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
        </div>
        
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <h4 style="color: #856404; margin-top: 0;">Next Steps:</h4>
          <ul style="color: #856404; margin: 10px 0;">
            <li>You can book a new appointment through your SageCare dashboard</li>
            <li>If you need to reschedule, please contact your doctor's office</li>
            <li>For urgent medical concerns, please contact your healthcare provider directly</li>
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

const createCancellationThirdPartyEmail = (appointmentDetails, thirdPartyName = '') => {
  const { startTime, endTime, notes, timezone } = appointmentDetails;
  const showLocal = timezone && timezone.length > 0;
  
  return {
    subject: 'Video Consultation Cancelled',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #e74c3c;">Video Consultation Cancelled</h2>
        
        <p>Hello${thirdPartyName ? ` ${thirdPartyName}` : ''},</p>
        
        <p>The video consultation session you were invited to has been cancelled.</p>
        
        <div style="background-color: #fdf2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #e74c3c;">
          <h3 style="color: #c0392b; margin-top: 0;">Cancelled Session Details:</h3>
          ${showLocal ? `<p><strong>Date (Local):</strong> ${formatLocalDate(startTime, timezone)} <span style='color:#888;'>(${timezone})</span></p>` : ''}
          ${showLocal ? `<p><strong>Time (Local):</strong> ${formatLocalTime(startTime, timezone)} - ${formatLocalTime(endTime, timezone)} <span style='color:#888;'>(${timezone})</span></p>` : ''}
          <p><strong>Date:</strong> ${formatUTCDate(startTime)}  (UTC)</p>
          <p><strong>Time:</strong> ${formatUTCTime(startTime)} - ${formatUTCTime(endTime)} (UTC)</p>
          ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
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
  const { 
    doctor, 
    patient, 
    thirdParty, 
    jitsiLink, 
    date, 
    startTime, 
    endTime, 
    notes, 
    timezone,
    isUpdate = false,
    isCancellation = false,
    oldThirdParty = null
  } = appointmentData;
  
  const appointmentDetails = { date, startTime, endTime, notes, timezone };
  
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
    
    // Determine notification type
    let notificationType = 'new';
    if (isCancellation) {
      notificationType = 'cancel';
    } else if (isUpdate) {
      notificationType = 'update';
    }
    
    // Helper function to get third party email and name
    const getThirdPartyInfo = (thirdPartyData) => {
      if (!thirdPartyData) return { email: null, name: '' };
      
      // Handle both old format (string) and new format (object)
      if (typeof thirdPartyData === 'string') {
        return { email: thirdPartyData, name: '' };
      } else if (thirdPartyData.email) {
        const name = thirdPartyData.firstName ? `${thirdPartyData.firstName} ${thirdPartyData.lastName || ''}`.trim() : '';
        return { email: thirdPartyData.email, name };
      }
      return { email: null, name: '' };
    };
    
    // Send email to doctor
    if (doctorDoc.email) {
      let emailHtml;
      let subject;

      if (notificationType === 'new') {
        emailHtml = createDoctorEmail(
          `${doctorDoc.first_name} ${doctorDoc.last_name}`,
          `${patientDoc.first_name} ${patientDoc.last_name}`,
          jitsiLink,
          appointmentDetails
        );
        subject = emailHtml.subject;
      } else if (notificationType === 'update') {
        emailHtml = createUpdateDoctorEmail(
          `${doctorDoc.first_name} ${doctorDoc.last_name}`,
          `${patientDoc.first_name} ${patientDoc.last_name}`,
          jitsiLink,
          appointmentDetails
        );
        subject = emailHtml.subject;
      } else if (notificationType === 'cancel') {
        emailHtml = createCancellationDoctorEmail(
          `${doctorDoc.first_name} ${doctorDoc.last_name}`,
          `${patientDoc.first_name} ${patientDoc.last_name}`,
          appointmentDetails
        );
        subject = emailHtml.subject;
      }

      if (emailHtml) {
        const doctorResult = await sendEmail(
          doctorDoc.email,
          subject,
          emailHtml.html
        );
        results.push({ recipient: 'doctor', email: doctorDoc.email, result: doctorResult });
      }
    }
    
    // Send email to patient
    if (patientDoc.email) {
      let emailHtml;
      let subject;

      if (notificationType === 'new') {
        emailHtml = createPatientEmail(
          `${patientDoc.first_name} ${patientDoc.last_name}`,
          `${doctorDoc.first_name} ${doctorDoc.last_name}`,
          jitsiLink,
          appointmentDetails
        );
        subject = emailHtml.subject;
      } else if (notificationType === 'update') {
        emailHtml = createUpdatePatientEmail(
          `${patientDoc.first_name} ${patientDoc.last_name}`,
          `${doctorDoc.first_name} ${doctorDoc.last_name}`,
          jitsiLink,
          appointmentDetails
        );
        subject = emailHtml.subject;
      } else if (notificationType === 'cancel') {
        emailHtml = createCancellationPatientEmail(
          `${patientDoc.first_name} ${patientDoc.last_name}`,
          `${doctorDoc.first_name} ${doctorDoc.last_name}`,
          appointmentDetails
        );
        subject = emailHtml.subject;
      }

      if (emailHtml) {
        const patientResult = await sendEmail(
          patientDoc.email,
          subject,
          emailHtml.html
        );
        results.push({ recipient: 'patient', email: patientDoc.email, result: patientResult });
      }
    }
    
    // Handle third party emails
    const currentThirdParty = getThirdPartyInfo(thirdParty);
    const oldThirdPartyInfo = getThirdPartyInfo(oldThirdParty);
    
    console.log('Third party email debugging:', {
      notificationType,
      oldThirdParty: oldThirdPartyInfo,
      currentThirdParty: currentThirdParty,
      isUpdate,
      oldThirdPartyRaw: oldThirdParty,
      currentThirdPartyRaw: thirdParty
    });
    
    // Check if third party email has changed
    const oldEmail = oldThirdPartyInfo.email ? oldThirdPartyInfo.email.trim() : '';
    const newEmail = currentThirdParty.email ? currentThirdParty.email.trim() : '';
    const thirdPartyEmailChanged = oldEmail !== newEmail;
    const hasOldThirdParty = oldEmail !== '';
    const hasNewThirdParty = newEmail !== '';
    
    console.log('Email comparison:', {
      oldEmail,
      newEmail,
      thirdPartyEmailChanged,
      hasOldThirdParty,
      hasNewThirdParty
    });
    
    if (notificationType === 'update' && thirdPartyEmailChanged) {
      console.log('Third party email changed - sending appropriate emails');
      
      // Send cancellation email to old third party
      if (hasOldThirdParty) {
        console.log('Sending cancellation email to old third party:', oldThirdPartyInfo.email);
        const oldThirdPartyEmail = createCancellationThirdPartyEmail(appointmentDetails, oldThirdPartyInfo.name);
        const oldThirdPartyResult = await sendEmail(
          oldThirdPartyInfo.email,
          oldThirdPartyEmail.subject,
          oldThirdPartyEmail.html
        );
        results.push({ recipient: 'oldThirdParty', email: oldThirdPartyInfo.email, result: oldThirdPartyResult });
      }
      
      // Send new invitation to new third party
      if (hasNewThirdParty) {
        console.log('Sending invitation email to new third party:', currentThirdParty.email);
        const newThirdPartyEmail = createThirdPartyEmail(jitsiLink, appointmentDetails, currentThirdParty.name);
        const newThirdPartyResult = await sendEmail(
          currentThirdParty.email,
          newThirdPartyEmail.subject,
          newThirdPartyEmail.html
        );
        results.push({ recipient: 'newThirdParty', email: currentThirdParty.email, result: newThirdPartyResult });
      }
    } else {
      // Handle regular third party notifications
      if (hasNewThirdParty) {
        let emailHtml;
        let subject;

        if (notificationType === 'new') {
          emailHtml = createThirdPartyEmail(jitsiLink, appointmentDetails, currentThirdParty.name);
          subject = emailHtml.subject;
        } else if (notificationType === 'update') {
          emailHtml = createUpdateThirdPartyEmail(jitsiLink, appointmentDetails);
          subject = emailHtml.subject;
        } else if (notificationType === 'cancel') {
          emailHtml = createCancellationThirdPartyEmail(appointmentDetails, currentThirdParty.name);
          subject = emailHtml.subject;
        }

        if (emailHtml) {
          console.log('Sending regular third party email:', currentThirdParty.email, 'Type:', notificationType);
          const thirdPartyResult = await sendEmail(
            currentThirdParty.email,
            subject,
            emailHtml.html
          );
          results.push({ recipient: 'thirdParty', email: currentThirdParty.email, result: thirdPartyResult });
        }
      }
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