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
