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
  const accountSid = "AC009ee9c433a0401019c4110b7c6e7ab9";
  const authToken = "00ef52fb1ad35fdc7e1f08259d355ed2";
  const client = require("twilio")(accountSid, authToken);

  return client.messages.create({
    body: `your Otp is ${otp}`,
    from: "+12295525439",
    to: `+91${toPhoneNumber}`,
  });
};

//Payment
