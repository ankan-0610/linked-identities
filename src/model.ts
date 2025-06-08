import {
  Table, Column, Model,
  BeforeCreate, BeforeUpdate,
  DataType, PrimaryKey, AutoIncrement, Default, HasMany
} from 'sequelize-typescript';
import sequelize from './database';
import { fileFromPath } from 'openai';
import { all } from 'axios';

@Table({ tableName: 'contact' })
class Contact extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true
  })
  id!: number;

  @Column(DataType.STRING)
  email?: string;

  @Column({
    type: DataType.STRING,
    field: 'phonenumber' // Explicitly sets the database column name
  })
  phoneNumber?: string;

  @Column({
    type: DataType.INTEGER,
    field: 'linkedid' // Explicitly sets the database column name
  })
  linkedId?: number;

  @Column({
    type: DataType.ENUM('primary', 'secondary'),
    defaultValue: 'primary',
    field: 'linkprecedence' // Explicitly sets the database column name
  })
  linkPrecedence!: 'primary' | 'secondary';

  @Column({
    type: DataType.DATE,
    field: 'createdat', // Explicitly sets the database column name
    defaultValue: DataType.NOW
  })
  createdAt!: Date;

  @Column({
    type: DataType.DATE,
    field: 'updatedat'
  })
  updatedAt!: Date;

  @Column({
    type: DataType.DATE,
    field: 'deletedat', // Explicitly sets the database column name
    allowNull: true,
  })
  deletedAt?: Date;

  @HasMany(() => Contact, 'linkedId')
  secondaryContacts?: Contact[];
}

export default Contact;