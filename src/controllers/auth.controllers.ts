import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../../config/db.config';
import { IAdmin, IEventSupervisor, ISuperadmin, IUser} from '../models/auth.model';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

const secretKey = 'UGA';

// Super Admin 

export const register = async (req: Request, res: Response) => {
  const { name, username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser: ISuperadmin = {
    _superadmin_id: 0,
    name,
    username,
    password: hashedPassword,
    lastUpdated: new Date(),
    createdOn: new Date(),
  };

  try {
    const [result] = await pool.execute('INSERT INTO superadmin (name, username, password, lastUpdated, createdOn) VALUES (?, ?, ?, ?, ?)', [
      newUser.name,
      newUser.username,
      newUser.password,
      newUser.lastUpdated,
      newUser.createdOn,
    ]);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error });
  }
};

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const [rows]: any = await pool.execute('SELECT * FROM superadmin WHERE username = ?', [username]);

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user: ISuperadmin = rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._superadmin_id }, secretKey, { expiresIn: '1h' });

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error });
  }
};

export const getAllSuperAdmins = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.execute('SELECT  _superadmin_id, name, username, lastUpdated, createdOn FROM superadmin');
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving users', error });
  }
};
export const updateSuperAdmin = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, username, password } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  const fieldsToUpdate: { [key: string]: any } = {
    lastUpdated: new Date(),
  };

  if (name) fieldsToUpdate.name = name;
  if (username) fieldsToUpdate.username = username;
  if (password) fieldsToUpdate.password = await bcrypt.hash(password, 10);

  const fieldKeys = Object.keys(fieldsToUpdate);
  const fieldValues = Object.values(fieldsToUpdate);

  try {
    const [result] = await pool.execute(
      `UPDATE superadmin SET ${fieldKeys.map(key => `${key} = ?`).join(', ')} WHERE _superadmin_id = ?`,
      [...fieldValues, id]
    );

    if (!result) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User updated successfully', name, username, password });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error });
  }
};

export const deleteSuperAdmin = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const [result] = await pool.execute('DELETE FROM superadmin WHERE _superadmin_id = ?', [id]);

    if (!result) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error });
  }
};



export const getSuperAdminById = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: 'Admin ID is required' });
  }

  try {
    const [rows]: any = await pool.execute('SELECT * FROM superadmin WHERE _superadmin_id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = rows[0];

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving user', error });
  }
};


//Admin 


export const registerAdmin = async (req: Request, res: Response) => {
  const { school_group_id, firstName, lastName, email, username, password, isTournamentDirector } = req.body;

  if (!email || !username || !password) {
    return res.status(400).json({ message: 'Email, username, and password are required' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newAdmin: IAdmin = {
    admin_id: 0,
    school_group_id,
    firstName,
    lastName,
    email,
    username,
    password: hashedPassword,
    isTournamentDirector,
  };

  try {
    await pool.execute('INSERT INTO admin (school_group_id, firstName, lastName, email, username, password, isTournamentDirector) VALUES (?, ?, ?, ?, ?, ?, ?)', [
      newAdmin.school_group_id,
      newAdmin.firstName,
      newAdmin.lastName,
      newAdmin.email,
      newAdmin.username,
      newAdmin.password,
      newAdmin.isTournamentDirector,
    ]);

    res.status(201).json({ message: 'Admin registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering admin', error });
  }
};


export const loginAdmin = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const [rows]: any = await pool.execute('SELECT * FROM admin WHERE username = ?', [username]);

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const admin: IAdmin = rows[0];

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: admin.admin_id }, secretKey, { expiresIn: '1h' });

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error });
  }
};

export const getAllAdmins = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.execute('SELECT school_group_id, firstName, lastName, email, username, password, isTournamentDirector FROM admin');
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving admin', error });
  }
};

export const updateAdmin = async (req: Request, res: Response) => {
  const { admin_id, school_group_id, firstName, lastName, email, username, password, isTournamentDirector } = req.body;

  if (!admin_id) {
    return res.status(400).json({ message: 'Admin ID is required' });
  }

  try {
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
    
    await pool.execute('UPDATE admin SET school_group_id = ?, firstName = ?, lastName = ?, email = ?, username = ?, password = ?, isTournamentDirector = ? WHERE admin_id = ?', [
      school_group_id,
      firstName,
      lastName,
      email,
      username,
      hashedPassword,
      isTournamentDirector,
      admin_id
    ]);

    res.status(200).json({ message: 'Admin updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating admin', error });
  }
};

export const deleteAdmin = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const [result] = await pool.execute('DELETE FROM admin WHERE admin_id = ?', [id]);

    if (!result) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error });
  }
};

export const getAdminById = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: 'Admin ID is required' });
  }

  try {
    const [rows]: any = await pool.execute('SELECT * FROM admin WHERE admin_id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = rows[0];

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving user', error });
  }
};


// Event Supervisor
export const registerEventSupervisor = async (req: Request, res: Response) => {
  const { school_group_id, email, username, password,firstName,lastName } = req.body;

  if (!email || !username || !password) {
    return res.status(400).json({ message: 'Email, username, and password are required' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newEventSupervisor: IEventSupervisor = {
    eventSupervisor_id: 0,
    school_group_id,
    firstName,
    lastName,
    email,
    username,
    password: hashedPassword,
  };

  try {
    await pool.execute('INSERT INTO eventsupervisor (school_group_id, email, username, password,firstName,lastName) VALUES (?, ?, ?, ?, ?, ?)', [
      newEventSupervisor.school_group_id,
      newEventSupervisor.email,
      newEventSupervisor.username,
      newEventSupervisor.password,
      newEventSupervisor.firstName,
      newEventSupervisor.lastName,
    ]);

    res.status(200).json({ message: 'Event Supervisor registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering event supervisor', error });
  }
};

export const loginEventSupervisor = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const [rows]: any = await pool.execute('SELECT * FROM eventsupervisor WHERE username = ?', [username]);

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const eventSupervisor: IEventSupervisor = rows[0];

    const isMatch = await bcrypt.compare(password, eventSupervisor.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: eventSupervisor.eventSupervisor_id }, secretKey, { expiresIn: '1h' });

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error });
  }
};

export const getAllEventSupervisors = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.execute('SELECT school_group_id, email, username, password,firstName,lastName FROM eventsupervisor');
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving event supervisors', error });
  }
};

export const updateEventSupervisor = async (req: Request, res: Response) => {
  const { eventSupervisor_id, school_group_id, email, username, password,firstName,lastName} = req.body;

  if (!eventSupervisor_id) {
    return res.status(400).json({ message: 'Event Supervisor ID is required' });
  }

  try {
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
    
    await pool.execute('UPDATE eventsupervisor SET group_id = ?, email = ?, username = ?, password = ? WHERE eventSupervisor_id = ?', [
      school_group_id,
      firstName,
      lastName,
      email,
      username,
      hashedPassword
    ]);

    res.status(200).json({ message: 'Event Supervisor updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating event supervisor', error });
  }
};

export const deleteEventSupervisor = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: 'Event Supervisors ID is required' });
  }

  try {
    const [result] = await pool.execute('DELETE FROM eventsupervisor WHERE eventSupervisor_id = ?', [id]);

    if (!result) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error });
  }
};

export const getEventSupervisorById = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: 'eventsupervisor ID is required' });
  }

  try {
    const [rows]: any = await pool.execute('SELECT * FROM eventsupervisor WHERE eventSupervisor_id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = rows[0];

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving user', error });
  }
};



//Users

export const registerUser = async (req: Request, res: Response) => {
  const { name, email, isAttendance, school_id } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  // Generate a random password
  const randomPassword = crypto.randomBytes(8).toString('hex');
  const hashedPassword = await bcrypt.hash(randomPassword, 10);

  const newUser: IUser = {
    user_id: 0,
    name,
    email,
    password: hashedPassword,
    isAttendance,
    school_id,
    passwordChanged: false,  // Add a flag to check if the user has changed their password
  };

  try {
    // Send an email to the user with the random password first
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // true for port 465, false for other ports
      auth: {
        user: 'ecinemabooking387@gmail.com',
        pass: "injgdluouhraowjt", // Email password from environment variable
      },
    });

    // console.log("EMAIL_USER: ", process.env.EMAIL_USER);
console.log("EMAIL_PASS: ", process.env.password);

    const mailOptions = {
      from: '"EPOCH SCORING SYSTEM" <ecinemabooking387@gmail.com>',
      to: newUser.email,
      subject: 'Profile Created - Change Your Password',
      text: `Dear ${newUser.name},\n\nYour profile has been created successfully. Please use the following temporary password to log in: ${randomPassword}\n\nPlease change your password immediately after logging in.\n\nThank you!`,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    // If email sent successfully, insert the new user into the database
    await pool.execute(
      'INSERT INTO users (name, email, password, isAttendance, school_id, passwordChanged) VALUES (?, ?, ?, ?, ?, ?)',
      [newUser.name, newUser.email, newUser.password, newUser.isAttendance, newUser.school_id, newUser.passwordChanged]
    );

    res.status(201).json({ message: 'User registered successfully and email sent' });

  } catch (error) {
    // If there's an error with sending email or inserting the user, return error response
    res.status(500).json({ message: 'Error registering user', error });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const [rows]: any = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user: IUser = rows[0];

    // Check if the password has been changed
    if (!user.passwordChanged) {
      return res.status(403).json({ message: 'Please change your password before logging in' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.user_id }, secretKey, { expiresIn: '1h' });

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error });
  }
};


export const changePassword = async (req: Request, res: Response) => {
  const { email, oldPassword, newPassword } = req.body;

  if (!email || !oldPassword || !newPassword) {
    return res.status(400).json({ message: 'Email, old password, and new password are required' });
  }

  try {
    const [rows]: any = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user: IUser = rows[0];

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Old password is incorrect' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await pool.execute('UPDATE users SET password = ?, passwordChanged = ? WHERE email = ?', [
      hashedNewPassword,
      true, // Set passwordChanged to true
      email,
    ]);

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error changing password', error });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  // Check if email is provided
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    // Fetch the user from the database using email
    const [rows]: any = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No user found with this email' });
    }

    const user = rows[0];

    // Generate a token (JWT) with a short expiration time (e.g., 1 hour)
    const token = jwt.sign({ id: user.user_id, email: user.email }, secretKey, { expiresIn: '1h' });

    // Create the password reset link
    const resetLink = `http://localhost:3000/reset-password?token=${token}`;

    // Send email with the reset link
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'ecinemabooking387@gmail.com',
        pass: "injgdluouhraowjt",
      },
    });

    const mailOptions = {
      from: '"EPOCH SCORING SYSTEM" <ecinemabooking387@gmail.com>',
      to: email,
      subject: 'Password Reset Request',
      text: `Hi ${user.name},\n\nYou requested a password reset. Click the link below to reset your password:\n\n${resetLink}\n\nThis link will expire in 1 hour.\n\nIf you did not request this, please ignore this email.`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Password reset email sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending password reset email', error });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: 'Token and new password are required' });
  }

  try {
    // Verify the token
    const decoded: any = jwt.verify(token, secretKey);

    // If token is valid, hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password in the database
    await pool.execute('UPDATE users SET password = ?, passwordChanged = true WHERE user_id = ?', [
      hashedPassword,
      decoded.id,
    ]);

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'Password reset link has expired' });
    }
    res.status(500).json({ message: 'Error resetting password', error });
  }
};



export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.execute('SELECT user_id, name, email, isAttendance, school_id FROM users');
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving users', error });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const { user_id, name, email, password, isAttendance, school_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
    
    await pool.execute('UPDATE users SET name = ?, email = ?, password = ?, isAttendance = ?, school_id = ? WHERE user_id = ?', [
      name,
      email,
      hashedPassword,
      isAttendance,
      school_id,
      user_id
    ]);

    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error });
  }
};

export const deleteuser = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const [result] = await pool.execute('DELETE FROM users WHERE user_id = ?', [id]);

    if (!result) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const [rows]: any = await pool.execute('SELECT * FROM users WHERE user_id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = rows[0];

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving user', error });
  }
};


export const validateToken = (req: Request, res: Response, next: Function) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access denied, token missing!' });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    req.body.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token' });
  }
};
