'use strict';

// import packages
require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const SECRET = process.env.SECRET || 'abuNofal59$#$#';

const userSchema = (sequelize, DataTypes) => {
  // create userSchema / Table
  const Schema = sequelize.define('users', {
    email: { type: DataTypes.STRING, required: true, unique: true },
    firstName: { type: DataTypes.STRING, required: true },
    lastName: { type: DataTypes.STRING, required: true },
    password: { type: DataTypes.STRING, required: true },
    role: { type: DataTypes.ENUM('user', 'admin'), defaultValue: 'user', required: true },
    token: {
      type: DataTypes.VIRTUAL,
      get() {
        return jwt.sign({ email: this.email, role: this.role, firstName: this.firstName, lastName: this.lastName , password:this.password,id:this.id}, SECRET);
      },
      set(tokenObj) {
        return jwt.sign(tokenObj, SECRET);
      },
    },
    capabilities: {
      type: DataTypes.VIRTUAL,
      get() {
        let acl = {
          user: ['read-limited', 'write-limited', 'delete-limited'],
          admin: ['read', 'edit', 'write', 'delete'],
        };
        return acl[this.role];
      },
    },
  });

  // before save method
  Schema.beforeCreate(async (user) => {
    if(!user?.password) return;
    try {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      user.password = hashedPassword;
    } catch (error) {
      throw new Error('hash Password on save Failed', error);
    }
  });

  // before update method
  Schema.beforeUpdate(async (user) => {

    // this condition to check if the password did not changed so don't go and hash the hashed pass again, cuz its value will be changed and won't represents the original plain text pass anymore.
    if(user?.passDidnotChanged) return;

    try {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      user.password = hashedPassword;
    } catch (error) {
      throw new Error('hash Password on Update Failed', error);
    }
  });

  // authenticate basic check the user is exists or not, then check the password
  Schema.authenticateBasic = async function (email, password) {
    console.log('email, password',email,password);
    try {
      const user = await this.findOne({ where: { email } });
      const valid = await bcrypt.compare(password, user.password);
      if (valid) {
        return user;
      }

      throw new Error('Invalid User');
    } catch (error) {
      throw new Error('authenticate Basic Faild', error);
    }
  };

  // authenticate token check the user is exists or not, if yes then the token is correct
  Schema.authenticateToken = async function (token) {
    try {
      const parsedToken = await jwt.verify(token, SECRET);
      const user = this.findOne({ where: { email: parsedToken.email } });
      if (user) {
        return user;
      }
      throw new Error('User not found');
    } catch (error) {
      throw new Error('authenticate Token Faild', error);
    }
  };

  return Schema;
};

module.exports = userSchema;
