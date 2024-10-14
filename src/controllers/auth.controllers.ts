import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../../config/db.config';
import { IAdmin, IEventSupervisor, ISuperadmin, IUser} from '../models/auth.model';

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
  const { schoolgroup_id, email, username, password,firstName,lastName,eventSuperVisorEvents_id } = req.body;

  if (!email || !username || !password) {
    return res.status(400).json({ message: 'Email, username, and password are required' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newEventSupervisor: IEventSupervisor = {
    eventSupervisor_id: 0,
    schoolgroup_id,
    firstName,
    lastName,
    eventSuperVisorEvents_id,
    email,
    username,
    password: hashedPassword,
  };

  try {
    await pool.execute('INSERT INTO eventSupervisors (schoolgroup_id, email, username, password, firstName, lastName, eventSueprVisorEvents) VALUES (?, ?, ?, ?, ?, ?, ?)', [
      newEventSupervisor.schoolgroup_id,
      newEventSupervisor.email,
      newEventSupervisor.username,
      newEventSupervisor.password,
      newEventSupervisor.firstName,
      newEventSupervisor.lastName,
      newEventSupervisor.eventSuperVisorEvents_id,
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
    const [rows]: any = await pool.execute('SELECT * FROM eventSupervisors WHERE username = ?', [username]);

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
    const [rows]: any = await pool.execute('SELECT schoolgroup_id, email, username, password,firstName,lastName,eventSuperVisorEvents_id FROM eventSupervisors');
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving event supervisors', error });
  }
};

export const updateEventSupervisor = async (req: Request, res: Response) => {
  const { eventSupervisor_id, schoolgroup_id, email, username, password,firstName,lastName,eventSuperVisorEvents_id} = req.body;

  if (!eventSupervisor_id) {
    return res.status(400).json({ message: 'Event Supervisor ID is required' });
  }

  try {
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
    
    await pool.execute('UPDATE eventSupervisors SET group_id = ?, email = ?, username = ?, password = ? WHERE eventSupervisor_id = ?', [
      schoolgroup_id,
      firstName,
      lastName,
      email,
      username,
      hashedPassword,
      eventSuperVisorEvents_id
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
    const [result] = await pool.execute('DELETE FROM eventSupervisors WHERE eventSupervisor_id = ?', [id]);

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
    return res.status(400).json({ message: 'eventSupervisors ID is required' });
  }

  try {
    const [rows]: any = await pool.execute('SELECT * FROM eventSupervisors WHERE eventSupervisor_id = ?', [id]);

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
  const { name, email, password, isAttendance, school_id } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser: IUser = {
    user_id: 0,
    name,
    email,
    password: hashedPassword,
    isAttendance,
    school_id,
  };

  try {
    await pool.execute('INSERT INTO users (name, email, password, isAttendance, school_id) VALUES (?, ?, ?, ?, ?)', [
      newUser.name,
      newUser.email,
      newUser.password,
      newUser.isAttendance,
      newUser.school_id,
    ]);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
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
