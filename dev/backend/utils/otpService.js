// const client = require('twilio')(
//     process.env.TWILIO_SID,
//     process.env.TWILIO_AUTH
//   );
  
//   async function sendOTP(phone, otp) {
//     // console.log instead of SMS while you configure Twilio:
//   console.log(`⏳ [MOCK SMS] would send to ${phone}: ${otp}`);
//     // return client.messages.create({
//     //   from: process.env.TWILIO_PHONE,
//     //   to:   phone,
//     //   body: `Your SageCare OTP is: ${otp}`
//     // });
//   }
  
//   module.exports = { sendOTP };
  


// remove the require() entirely, or comment it out:
// const client = require('twilio')(…);

async function sendOTP(phone, otp) {
    console.log(`⏳ [MOCK SMS] OTP for ${phone}: ${otp}`);
    // when ready, restore:
    // return client.messages.create({ ... });
  }
  
  module.exports = { sendOTP };
  