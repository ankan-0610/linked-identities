import Contact from "./model";

export interface IdentifyRequest {
  email?: string;
  phoneNumber?: number;
}

export interface ContactPair {
  email?: string;
  phoneNumber?: string;
}

export interface ContactResponse {
  contact: {
    primaryContactId: number;
    emails: string[];
    phoneNumbers: string[];
    secondaryContactIds: number[];
  };
}

export interface ConsolidatedContact {
  primaryContact: Contact;
  secondaryContacts: Contact[];
  contactPairs: Set<ContactPair>;
}