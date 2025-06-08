import { Request, Response } from 'express';
import contactService from './service';
import { ContactResponse } from './types';
import { sendSuccess } from './response';

class ContactController {
  async identify(req: Request, res: Response) {

    console.log('Received request to identify contact:', req.body);
    const { email, phoneNumber } = req.body;
    
    // Convert phoneNumber to string if it's provided as a number
    const phoneNumberStr = phoneNumber ? phoneNumber.toString() : undefined;
    
    const { primaryContact, secondaryContacts, contactPairs } = 
      await contactService.identifyContact(email, phoneNumberStr);

    // get emails and phoneNumbers from contactPairs
    const emails = new Set<string>();
    const phoneNumbers = new Set<string>();
    contactPairs.forEach(pair => {
      if (pair.email) emails.add(pair.email);
      if (pair.phoneNumber) phoneNumbers.add(pair.phoneNumber);
    });
    
    const response: ContactResponse = {
      contact: {
        primaryContactId: primaryContact.id,
        emails: Array.from(emails),
        phoneNumbers: Array.from(phoneNumbers),
        secondaryContactIds: secondaryContacts.map(c => c.id),
      },
    };

    sendSuccess(res, response);
  }
}

export default new ContactController();