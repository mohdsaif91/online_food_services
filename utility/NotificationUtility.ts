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

// account sid AC009ee9c433a0401019c4110b7c6e7ab9

// auth token 465ff231e870c259254adf9e8829e81f
export const onRequestOtp = async (otp: number, toPhoneNumber: string) => {
  const accountSid = "AC009ee9c433a0401019c4110b7c6e7ab9";
  const authToken = "465ff231e870c259254adf9e8829e81f";
  const client = require("twilio")(accountSid, authToken);

  return client.messages.create({
    body: `your Otp is ${otp}`,
    from: "+12295525439",
    to: `+91${toPhoneNumber}`,
  });

  //
  //   const accountSid = "AC009ee9c433a0401019c4110b7c6e7ab9";
  //   const authToken = "465ff231e870c259254adf9e8829e81f";
  //   const twilio = require("twilio");
  //   const client = twilio(accountSid, authToken);
  //   return client.messages({
  //   body: `your Otp is ${otp}`,
  //   from: "+12295525439",
  //   to: `+91${toPhoneNumber}`,
  //   });

  //   console.log(response, " <><>");

  //   return response;
};

//Payment
