//Email

//notification

//OTP
export const GenerateOtp = () => {
  const otp = Math.floor(100000 + Math.random() * 900000);
  let expiry = new Date();
  expiry.setTime(new Date().getTime() + 30 * 60 * 1000);
  return {
    otp,
    expiry,
  };
};

//

export const onRequestOtp = async (otp: number, toPhoneNumber: string) => {
  const accountSid = "";
  const authToken = "";
  const client = require("twilio")(accountSid, authToken);

  return client.messages.create({
    body: `your Otp is ${otp}`,
    from: "+12295525439",
    to: `+91${toPhoneNumber}`,
  });
};

//Payment
