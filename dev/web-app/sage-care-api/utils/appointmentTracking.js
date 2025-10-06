const Appointment = require('../models/Appointment');

/**
 * Check for missed consultations and update their status
 * This should be run periodically (e.g., every hour) via a cron job
 */
const checkMissedConsultations = async () => {
  try {
    const now = new Date();
    
    // Find appointments that:
    // 1. Are in the past (endTime < now)
    // 2. Have status "pending" or "confirmed"
    // 3. Haven't been marked as completed or missed
    const missedAppointments = await Appointment.find({
      endTime: { $lt: now },
      status: { $in: ['pending', 'confirmed'] },
      meetingOutcome: { $ne: 'completed' }
    });

    console.log(`Found ${missedAppointments.length} potentially missed appointments`);

    for (const appointment of missedAppointments) {
      // Check if anyone actually joined the meeting
      const { participation } = appointment;
      
      if (participation) {
        const { patientJoined, doctorJoined } = participation;
        
        if (patientJoined || doctorJoined) {
          // At least one person joined, mark as completed
          appointment.meetingOutcome = 'completed';
          appointment.status = 'completed';
          
          // Calculate meeting duration if we have join times
          if (participation.patientJoinTime && participation.doctorJoinTime) {
            const patientJoin = new Date(participation.patientJoinTime);
            const doctorJoin = new Date(participation.doctorJoinTime);
            const lastActivity = participation.lastActivity ? new Date(participation.lastActivity) : appointment.endTime;
            
            // Calculate duration based on when both joined and last activity
            const startTime = new Date(Math.max(patientJoin.getTime(), doctorJoin.getTime()));
            const durationMinutes = Math.round((lastActivity.getTime() - startTime.getTime()) / (1000 * 60));
            
            if (durationMinutes > 0) {
              appointment.participation.meetingDuration = durationMinutes;
            }
          }
        } else {
          // No one joined, mark as missed
          appointment.meetingOutcome = 'missed';
          appointment.status = 'missed';
        }
      } else {
        // No participation data, mark as missed
        appointment.meetingOutcome = 'missed';
        appointment.status = 'missed';
      }
      
      await appointment.save();
      console.log(`Updated appointment ${appointment._id} to ${appointment.meetingOutcome}`);
    }
    
    return {
      success: true,
      processed: missedAppointments.length,
      message: `Processed ${missedAppointments.length} appointments`
    };
  } catch (error) {
    console.error('Error checking missed consultations:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get participation statistics for a user
 */
const getUserParticipationStats = async (userId, userType = 'patient') => {
  try {
    const filter = userType === 'patient' ? { patient: userId } : { doctor: userId };
    
    const appointments = await Appointment.find(filter);
    
    const stats = {
      total: appointments.length,
      completed: 0,
      missed: 0,
      pending: 0,
      joined: 0,
      notJoined: 0
    };
    
    appointments.forEach(appointment => {
      // Count by status
      if (appointment.status === 'completed') stats.completed++;
      else if (appointment.status === 'missed') stats.missed++;
      else if (appointment.status === 'pending') stats.pending++;
      
      // Count by participation
      if (appointment.participation) {
        const joined = userType === 'patient' 
          ? appointment.participation.patientJoined 
          : appointment.participation.doctorJoined;
        
        if (joined) stats.joined++;
        else stats.notJoined++;
      }
    });
    
    return stats;
  } catch (error) {
    console.error('Error getting user participation stats:', error);
    throw error;
  }
};

/**
 * Get detailed participation report for an appointment
 */
const getAppointmentParticipationReport = async (appointmentId) => {
  try {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      throw new Error('Appointment not found');
    }
    
    const report = {
      appointmentId: appointment._id,
      date: appointment.date,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      status: appointment.status,
      meetingOutcome: appointment.meetingOutcome,
      participation: appointment.participation || {},
      meetingNotes: appointment.meetingNotes,
      wasMissed: false,
      missedReason: null
    };
    
    // Determine if it was missed and why
    if (appointment.meetingOutcome === 'missed') {
      report.wasMissed = true;
      
      if (appointment.participation) {
        const { patientJoined, doctorJoined } = appointment.participation;
        
        if (!patientJoined && !doctorJoined) {
          report.missedReason = 'No participants joined';
        } else if (!patientJoined) {
          report.missedReason = 'Patient did not join';
        } else if (!doctorJoined) {
          report.missedReason = 'Doctor did not join';
        }
      } else {
        report.missedReason = 'No participation data available';
      }
    }
    
    return report;
  } catch (error) {
    console.error('Error getting appointment participation report:', error);
    throw error;
  }
};

module.exports = {
  checkMissedConsultations,
  getUserParticipationStats,
  getAppointmentParticipationReport
}; 