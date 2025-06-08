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

    // Check if we need to create a new secondary contact
    const hasNewInfo = !Array.from(contactPairs)
      .some(pair => pair.email === email
        && pair.phoneNumber === phoneNumber);
    
    // console.log('Has new info:', hasNewInfo);
    // console.log('Contact pairs:', contactPairs);

    let newSecondary;
    if (hasNewInfo) {
      newSecondary = await Contact.create({
        email,
        phoneNumber,
        linkedId: primaryContact.id,
        linkPrecedence: 'secondary',
      });
      
    }else {
      // console.log('Attempting to delete contact with email:', email, 'and phoneNumber:', phoneNumber);
      
      // remove current contact to update createdAt
      await Contact.destroy({
        where: {
          email: email, 
          phoneNumber: phoneNumber
        }
      })

      if (secondaryContacts.length === 0) {
        newSecondary = await Contact.create({
          email,
          phoneNumber,
          linkPrecedence: 'primary',
        });
      }
      else {
        if (primaryContact.email === email && primaryContact.phoneNumber === phoneNumber) { 
          
          const prevPrimaryId = primaryContact.id;
          
          // find oldest in secondary Contacts, make that primary
          const newPrimary = secondaryContacts.reduce((oldest, current) => {
            return (oldest.createdAt < current.createdAt) ? oldest : current;
          });
          
          // update primary contact in db
          await Contact.update(
            { linkPrecedence: 'primary' },
            { where: { id: newPrimary.id } }
          );

          // update linkedId of all secondary contacts to the new primary contact
          await Contact.update(
            { linkedId: newPrimary.id },
            { where: { linkedId: prevPrimaryId } }
          );
          // remove the new primary contact from secondary contacts
          secondaryContacts.splice(secondaryContacts.indexOf(newPrimary), 1);

          // remove the old primary contact from contactPairs
          contactPairs.delete({ email: newPrimary.email, phoneNumber: newPrimary.phoneNumber });

          primaryContact = newPrimary;
        }
        newSecondary = await Contact.create({
          email,
          phoneNumber,
          linkedId: primaryContact.id,
          linkPrecedence: 'secondary',
        });
      }
    }
    secondaryContacts.push(newSecondary);
    contactPairs.add({ email: newSecondary.email, phoneNumber: newSecondary.phoneNumber });

    return {
      primaryContact,
      secondaryContacts,
      contactPairs
    };
  }
}

export default new ContactService();