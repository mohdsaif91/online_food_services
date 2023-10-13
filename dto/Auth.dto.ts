import { vandorPayload } from "./vandor.dto";
import { CustomerPayload } from "./CustomerDetails.dto";

export type AuthPayload = vandorPayload | CustomerPayload;
