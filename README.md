# linked-identities-api

### Deployed endpoint


https://linked-identities.onrender.com/identify

### How to test?

```bash
curl -X POST "https://linked-identities.onrender.com/identify" -H "Content-type: application/json" -d '{"email":"abc@gmail.com","phoneNumber":"123"}'
```
### Running Locally?

#### 1. Create a table in postgres db

Use queries mentioned in db-setup.sql

#### 2. Add a .env with the following variables:

```
DB_HOST=localhost
DB_NAME=db_name
DB_USER=db_user
DB_PASS=db_pass
```
#### 3. Build

```bash
npm install && npm run build
```

#### 4. Run

```bash
npm start
```

#### 5. Test

```bash
curl -X POST "http://localhost:3000/identify" -H "Content-type: application/json" -d '{"email":"abc@gmail.com","phoneNumber":"123"}'
```

### My approach?

Initially had a DSA perspective on the problem, in terms of building a Tree data structure to store contact ids, trying to minimize the DB queries. 

Then I realized this is already accomplished via indexing with B-trees in a SQL database. So just neeeded to create indexes for 'email','phoneNumber','linkedId','id'.
Then focused on completing the CRUD functionality for the API.

One challenge was changing a contact's linkPrecedence from primary to secondary, in case a primary Contact gets a re-write. Then consequently the secondary contacts needed re-shuffling, as now the oldest contact in this list becomes primary, not to mention the linkedId for all these entries will change according to the new Primary contact.

Feel free to check the code in src/service.ts containing the whole logic
