import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';
import Contact from './model';
dotenv.config();

const sequelize = new Sequelize({
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  host: process.env.DB_HOST,
  port: parseInt('5432'),
  dialect: 'postgres',
  models: [Contact], 
  logging: false,
});
export default sequelize;