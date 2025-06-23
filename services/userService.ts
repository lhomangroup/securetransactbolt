
import pool from './database';
import { User } from '@/contexts/AuthContext';

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  userType: 'buyer' | 'seller' | 'both';
}

export class UserService {
  static async createUser(userData: CreateUserData): Promise<User> {
    const query = `
      INSERT INTO users (email, password, name, phone, user_type, rating, total_transactions, joined_date)
      VALUES ($1, $2, $3, $4, $5, 0, 0, CURRENT_DATE)
      RETURNING id, email, name, phone, user_type as userType, rating, total_transactions as totalTransactions, joined_date as joinedDate
    `;
    
    const values = [userData.email, userData.password, userData.name, userData.phone, userData.userType];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    const query = `
      SELECT id, email, name, phone, user_type as userType, rating, total_transactions as totalTransactions, joined_date as joinedDate
      FROM users WHERE email = $1
    `;
    
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  }

  static async getUserById(id: string): Promise<User | null> {
    const query = `
      SELECT id, email, name, phone, user_type as userType, rating, total_transactions as totalTransactions, joined_date as joinedDate
      FROM users WHERE id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const fields = Object.keys(userData).filter(key => key !== 'id');
    const values = fields.map(field => userData[field as keyof User]);
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    
    const query = `
      UPDATE users SET ${setClause}
      WHERE id = $1
      RETURNING id, email, name, phone, user_type as userType, rating, total_transactions as totalTransactions, joined_date as joinedDate
    `;
    
    const result = await pool.query(query, [id, ...values]);
    return result.rows[0];
  }
}
