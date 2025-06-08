import Contact from './model';
import { ConsolidatedContact, ContactPair } from './types';
import Sequelize from 'sequelize';

class ContactService {
  async identifyContact(email?: string, phoneNumber?: string): Promise<ConsolidatedContact> {
    // Find all contacts that match either email or phoneNumber
    console.log('Identifying contact with email:', email, 'and phoneNumber:', phoneNumber);
    if (!email || !phoneNumber) {
      throw new Error('Email and phoneNumber is required');
    }

    let matchingContacts: Contact[];
    try {
      matchingContacts = await Contact.findAll({
        where: {
          [Sequelize.Op.or]: [
            ...(email ? [{ email }] : []),
            ...(phoneNumber ? [{ phoneNumber }] : []),
          ]
        },
        order: [['createdAt', 'ASC']],
      });
    } catch (error) {
      console.error('Error fetching matching contacts:', error);
      // Re-throw the error or handle it as appropriate for your application
      throw new Error('Failed to retrieve contact information.');
    }

    if (matchingContacts.length === 0) {
      // Create new primary contact if no matches found
      const newContact = await Contact.create({
        email,
        phoneNumber,
        linkPrecedence: 'primary',
      });
      return {
        primaryContact: newContact,
        secondaryContacts: [],
        contactPairs: new Set<ContactPair>([{ email: newContact.email, phoneNumber: newContact.phoneNumber }]),
      };
    }

    // Find the oldest contact as primary
    let primaryContact = matchingContacts.find(c => c.linkPrecedence === 'primary');

    if (!primaryContact) {
      const newPrimary = await Contact.findOne({
        where: {
          id: matchingContacts[0].linkedId
        },
      });

      primaryContact = newPrimary? newPrimary : matchingContacts[0];
    }

    // Find all secondary contacts linked to this primary
    const secondaryContacts = await Contact.findAll({
      where: {
        linkedId: primaryContact.id,
        id: { [Sequelize.Op.ne]: primaryContact.id },
        deletedAt: null,
      },
    });

    // console.log('Secondary contacts:', secondaryContacts);
    const contactPairs = new Set<ContactPair>();

    if (primaryContact.email && primaryContact.phoneNumber) { 
      contactPairs.add({ email: primaryContact.email, phoneNumber: primaryContact.phoneNumber });
    }

    secondaryContacts.forEach(contact => {
      contactPairs.add({ email: contact.email, phoneNumber: contact.phoneNumber });
    });

    // // Add the new data if it doesn't exist
    // if (email) emails.add(email);
    // if (phoneNumber) phoneNumbers.add(phoneNumber);

    // Check if we need to create a new secondary contact
    const hasNewInfo = (email && phoneNumber && !contactPairs.has({ email, phoneNumber }));
    console.log('Has new info:', hasNewInfo);
    if (hasNewInfo) {
      const newSecondary = await Contact.create({
        email,
        phoneNumber,
        linkedId: primaryContact.id,
        linkPrecedence: 'secondary',
      });
      secondaryContacts.push(newSecondary);
      contactPairs.add({ email: newSecondary.email, phoneNumber: newSecondary.phoneNumber });
    }

    return {
      primaryContact,
      secondaryContacts,
      contactPairs
    };
  }
}

export default new ContactService();