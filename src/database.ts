import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';
import Contact from './model';
dotenv.config();

const sequelize = new Sequelize({
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  dialect: 'postgres',
  models: [__dirname + '/../models'],
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  }
});
export default sequelize;