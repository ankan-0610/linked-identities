import express from 'express';
import bodyParser from 'body-parser';
import router from './routes';
import sequelize from './database';

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/', router);

// Database connection
sequelize.sync({ force: false }).then(() => {
  console.log('Database connected');
}).catch(err => {
  console.error('Database connection error:', err);
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Internal Server Error' });
});

export default app;