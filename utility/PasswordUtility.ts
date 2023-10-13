import bcrypt from "bcrypt";
import JWT from "jsonwebtoken";
import { vandorPayload } from "../dto/vandor.dto";
import { APP_SECRATE } from "../config";
import { Request } from "express";
import { AuthPayload } from "../dto/AUth.dto";

export const genSalt = async () => {
  return bcrypt.genSalt();
};

export const genPassword = async (password: string, salt: string) => {
  return bcrypt.hash(password, salt);
};

export const ValidatePassword = async (
  enteredPassword: string,
  savedPassword: string,
  salt: string
) => {
  return (await genPassword(enteredPassword, salt)) === savedPassword;
};

export const generateSignature = (payload: AuthPayload) => {
  return JWT.sign(payload, APP_SECRATE, { expiresIn: "1d" });
};

export const validateSignature = async (req: Request) => {
  const signature = req.get("Authorization");
  if (signature) {
    const payload = (await JWT.verify(
      signature.split(" ")[1],
      APP_SECRATE
    )) as AuthPayload;
    req.user = payload;
    return true;
  }
  return false;
};
