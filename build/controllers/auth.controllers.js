"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEventSupervisorsByGroupId = exports.getAdminsByGroupId = exports.validateToken = exports.getUserById = exports.deleteuser = exports.updateUser = exports.getAllUsers = exports.resetPassword = exports.changePassword = exports.loginUser = exports.registerUser = exports.getEventSupervisorById = exports.deleteEventSupervisor = exports.updateEventSupervisor = exports.getAllEventSupervisors = exports.loginEventSupervisor = exports.changePasswordEventSupervisor = exports.changePasswordForgotES = exports.forgotPasswordES = exports.registerEventSupervisor = exports.getAdminById = exports.deleteAdmin = exports.updateAdmin = exports.getAllAdmins = exports.loginAdmin = exports.changePasswordAdmin = exports.changePasswordForgot = exports.forgotPassword = exports.registerAdmin = exports.getSuperAdminById = exports.deleteSuperAdmin = exports.updateSuperAdmin = exports.getAllSuperAdmins = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_config_1 = __importDefault(require("../config/db.config"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const crypto_1 = __importDefault(require("crypto"));
require('dotenv').config();
const secretKey = process.env.secretKey;
// Super Admin 
// Super Admin 
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username, password are required' });
    }
    try {
        // Check if the email or username already exists
        const [rows] = yield db_config_1.default.execute('SELECT username FROM superadmin WHERE username = ? ', [username]); // Explicitly casting the result to an array of rows
        if (rows.length > 0) {
            return res.status(409).json({ message: 'Username  already exists' });
        }
        // Hash the password
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const newUser = {
            _superadmin_id: 0,
            name,
            username,
            password: hashedPassword,
            lastUpdated: new Date(),
            createdOn: new Date(),
        };
        // Insert the new super admin into the database
        yield db_config_1.default.execute('INSERT INTO superadmin (name, username, password, lastUpdated, createdOn) VALUES (?, ?, ?, ?, ?, ?)', [
            newUser.name,
            newUser.username,
            newUser.password,
            newUser.lastUpdated,
            newUser.createdOn,
        ]);
        res.status(201).json({ message: 'User registered successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error registering user', error });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }
    try {
        const [rows] = yield db_config_1.default.execute('SELECT * FROM superadmin WHERE username = ?', [username]);
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const user = rows[0];
        const isMatch = yield bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user._superadmin_id }, secretKey, { expiresIn: '1h' });
        res.status(200).json({ message: 'Login successful', token });
    }
    catch (error) {
        res.status(500).json({ message: 'Error logging in', error });
    }
});
exports.login = login;
const getAllSuperAdmins = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [rows] = yield db_config_1.default.execute('SELECT  _superadmin_id, name, username, lastUpdated, createdOn FROM superadmin');
        res.status(200).json(rows);
    }
    catch (error) {
        res.status(500).json({ message: 'Error retrieving users', error });
    }
});
exports.getAllSuperAdmins = getAllSuperAdmins;
const updateSuperAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name, username, password } = req.body;
    if (!id) {
        return res.status(400).json({ message: 'User ID is required' });
    }
    const fieldsToUpdate = {
        lastUpdated: new Date(),
    };
    if (name)
        fieldsToUpdate.name = name;
    if (username)
        fieldsToUpdate.username = username;
    if (password)
        fieldsToUpdate.password = yield bcrypt_1.default.hash(password, 10);
    const fieldKeys = Object.keys(fieldsToUpdate);
    const fieldValues = Object.values(fieldsToUpdate);
    try {
        const [result] = yield db_config_1.default.execute(`UPDATE superadmin SET ${fieldKeys.map(key => `${key} = ?`).join(', ')} WHERE _superadmin_id = ?`, [...fieldValues, id]);
        if (!result) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User updated successfully', name, username, password });
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating user', error });
    }
});
exports.updateSuperAdmin = updateSuperAdmin;
const deleteSuperAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: 'User ID is required' });
    }
    try {
        const [result] = yield db_config_1.default.execute('DELETE FROM superadmin WHERE _superadmin_id = ?', [id]);
        if (!result) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting user', error });
    }
});
exports.deleteSuperAdmin = deleteSuperAdmin;
const getSuperAdminById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: 'Admin ID is required' });
    }
    try {
        const [rows] = yield db_config_1.default.execute('SELECT * FROM superadmin WHERE _superadmin_id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        const user = rows[0];
        res.status(200).json({ user });
    }
    catch (error) {
        res.status(500).json({ message: 'Error retrieving user', error });
    }
});
exports.getSuperAdminById = getSuperAdminById;
//Admin 
const registerAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { school_group_id, firstName, lastName, email, username, isTournamentDirector } = req.body;
    if (!email || !username) {
        return res.status(400).json({ message: 'Email and username are required' });
    }
    try {
        // Check if the email already exists
        const [rows] = yield db_config_1.default.execute('SELECT * FROM admin WHERE email = ?', [email]);
        if (rows.length > 0) {
            return res.status(409).json({ message: 'Email is already in use' }); // Conflict error
        }
        // Generate a random password
        const randomPassword = crypto_1.default.randomBytes(8).toString('hex');
        const hashedPassword = yield bcrypt_1.default.hash(randomPassword, 10);
        const newAdmin = {
            admin_id: 0,
            school_group_id,
            firstName,
            lastName,
            email,
            username,
            password: hashedPassword,
            isTournamentDirector,
        };
        // Insert the new admin into the database
        yield db_config_1.default.execute('INSERT INTO admin (school_group_id, firstName, lastName, email, username, password, isTournamentDirector) VALUES (?, ?, ?, ?, ?, ?, ?)', [
            newAdmin.school_group_id,
            newAdmin.firstName,
            newAdmin.lastName,
            newAdmin.email,
            newAdmin.username,
            newAdmin.password,
            newAdmin.isTournamentDirector,
        ]);
        // Send an email to the new admin with the random password
        const transporter = nodemailer_1.default.createTransport({
            service: 'Gmail',
            auth: {
                user: 'epochscoringsystem@gmail.com',
                pass: process.env.password, // Use environment variable for security
            },
        });
        const mailOptions = {
            from: '"EPOCH SCORING SYSTEM" <epochscoringsystem@gmail.com>',
            to: newAdmin.email,
            subject: 'Profile Created - Change Your Password',
            text: `Dear ${newAdmin.firstName},\n\nYour admin profile has been created successfully. Please use the following temporary password to log in: ${randomPassword}\n\nPlease change your password immediately after logging in.\n\nThank you!`,
        };
        yield transporter.sendMail(mailOptions);
        res.status(201).json({ message: 'Admin registered successfully and email sent' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error registering admin', error });
    }
});
exports.registerAdmin = registerAdmin;
const forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }
    try {
        // Correct way to extract rows
        const [rows] = yield db_config_1.default.execute('SELECT * FROM admin WHERE email = ?', [email]);
        const user = rows[0]; // Get the first matching user
        if (!user) {
            return res.status(404).json({ message: 'No user found with this email' });
        }
        // Generate token for password reset
        const token = jsonwebtoken_1.default.sign({ email: user.email }, secretKey, { expiresIn: '1h' });
        // Create reset password URL
        const resetUrl = `http://localhost:3001/change-new-password?token=${token}`;
        // Send reset password email
        const transporter = nodemailer_1.default.createTransport({
            service: 'Gmail',
            auth: {
                user: 'epochscoringsystem@gmail.com',
                pass: process.env.password, // Use environment variable for security
            },
        });
        const mailOptions = {
            from: '"EPOCH SCORING SYSTEM" <ecinemabooking387@gmail.com>',
            to: user.email,
            subject: 'Reset Your Password',
            text: `Dear ${user.firstname},\n\nPlease use the following link to reset your password: ${resetUrl}\n\nThis link is valid for 1 hour.\n\nThank you!`,
        };
        yield transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Password reset email sent successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error sending password reset email', error });
    }
});
exports.forgotPassword = forgotPassword;
const changePasswordForgot = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
        return res.status(400).json({ message: 'Token and new password are required' });
    }
    try {
        // Verify the token
        const decoded = jsonwebtoken_1.default.verify(token, secretKey);
        // Check if the token is valid
        if (!decoded || !decoded.email) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }
        // Hash the new password
        const hashedPassword = yield bcrypt_1.default.hash(newPassword, 10);
        // Update the password in the database
        yield db_config_1.default.execute('UPDATE admin SET password = ? WHERE email = ?', [hashedPassword, decoded.email]);
        res.status(200).json({ message: 'Password updated successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating password', error });
    }
});
exports.changePasswordForgot = changePasswordForgot;
const changePasswordAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, oldPassword, newPassword } = req.body;
    if (!email || !oldPassword || !newPassword) {
        return res.status(400).json({ message: 'Email, old password, and new password are required' });
    }
    try {
        const [rows] = yield db_config_1.default.execute('SELECT * FROM admin WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        const admin = rows[0];
        const isMatch = yield bcrypt_1.default.compare(oldPassword, admin.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Old password is incorrect' });
        }
        const hashedNewPassword = yield bcrypt_1.default.hash(newPassword, 10);
        yield db_config_1.default.execute('UPDATE admin SET password = ? WHERE email = ?', [hashedNewPassword, email]);
        res.status(200).json({ message: 'Password changed successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error changing password', error });
    }
});
exports.changePasswordAdmin = changePasswordAdmin;
const loginAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }
    try {
        const [rows] = yield db_config_1.default.execute('SELECT * FROM admin WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const admin = rows[0];
        const isMatch = yield bcrypt_1.default.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ id: admin.admin_id }, secretKey, { expiresIn: '1h' });
        res.status(200).json({ message: 'Login successful', token, school_group_id: admin.school_group_id, isTournamentDirector: admin.isTournamentDirector });
    }
    catch (error) {
        res.status(500).json({ message: 'Error logging in', error });
    }
});
exports.loginAdmin = loginAdmin;
const getAllAdmins = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [rows] = yield db_config_1.default.execute('SELECT admin_id, school_group_id, firstName, lastName, email, username, password, isTournamentDirector FROM admin');
        res.status(200).json(rows);
    }
    catch (error) {
        res.status(500).json({ message: 'Error retrieving admin', error });
    }
});
exports.getAllAdmins = getAllAdmins;
const updateAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { admin_id, school_group_id, firstName, lastName, email, username, password, isTournamentDirector } = req.body;
    if (!admin_id) {
        return res.status(400).json({ message: 'Admin ID is required' });
    }
    try {
        // const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
        yield db_config_1.default.execute('UPDATE admin SET school_group_id = ?, firstName = ?, lastName = ?, email = ?, username = ?, password = ?, isTournamentDirector = ? WHERE admin_id = ?', [
            school_group_id,
            firstName,
            lastName,
            email,
            username,
            password,
            isTournamentDirector,
            admin_id
        ]);
        res.status(200).json({ message: 'Admin updated successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating admin', error });
    }
});
exports.updateAdmin = updateAdmin;
const deleteAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: 'User ID is required' });
    }
    try {
        const [result] = yield db_config_1.default.execute('DELETE FROM admin WHERE admin_id = ?', [id]);
        if (!result) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting user', error });
    }
});
exports.deleteAdmin = deleteAdmin;
const getAdminById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: 'Admin ID is required' });
    }
    try {
        const [rows] = yield db_config_1.default.execute('SELECT * FROM admin WHERE admin_id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        const user = rows[0];
        res.status(200).json({ user });
    }
    catch (error) {
        res.status(500).json({ message: 'Error retrieving user', error });
    }
});
exports.getAdminById = getAdminById;
const registerEventSupervisor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { school_group_id, email, username, firstName, lastName, tournament_id } = req.body;
    if (!email || !username) {
        return res.status(400).json({ message: 'Email and username are required' });
    }
    const [rows] = yield db_config_1.default.execute('SELECT * FROM eventsupervisor WHERE email = ?', [email]);
    if (rows.length > 0) {
        return res.status(409).json({ message: 'Email is already in use' }); // Conflict error
    }
    // Generate a random password
    const randomPassword = crypto_1.default.randomBytes(8).toString('hex');
    const hashedPassword = yield bcrypt_1.default.hash(randomPassword, 10);
    const newEventSupervisor = {
        eventSupervisor_id: 0,
        school_group_id,
        firstName,
        lastName,
        email,
        username,
        password: hashedPassword,
        tournament_id,
    };
    try {
        // Insert the new event supervisor into the database
        yield db_config_1.default.execute('INSERT INTO eventsupervisor (school_group_id, email, username, password, firstName, lastName, tournament_id) VALUES (?, ?, ?, ?, ?, ?, ?)', [
            newEventSupervisor.school_group_id,
            newEventSupervisor.email,
            newEventSupervisor.username,
            newEventSupervisor.password,
            newEventSupervisor.firstName,
            newEventSupervisor.lastName,
            newEventSupervisor.tournament_id,
        ]);
        // Send an email to the new event supervisor with the random password
        const transporter = nodemailer_1.default.createTransport({
            service: 'Gmail',
            auth: {
                user: 'ecinemabooking387@gmail.com',
                pass: "injgdluouhraowjt" // Use environment variable for security
            },
        });
        const mailOptions = {
            from: '"EPOCH SCORING SYSTEM" <ecinemabooking387@gmail.com>',
            to: newEventSupervisor.email,
            subject: 'Event Supervisor Created - Change Your Password',
            text: `Dear ${newEventSupervisor.firstName},\n\nYour event supervisor profile has been created successfully. Please use the following temporary password to log in: ${randomPassword}\n\nPlease change your password immediately after logging in.\n\nThank you!`,
        };
        yield transporter.sendMail(mailOptions);
        res.status(201).json({ message: 'Event Supervisor registered successfully and email sent', eventSupervisor_id: newEventSupervisor.eventSupervisor_id });
    }
    catch (error) {
        res.status(500).json({ message: 'Error registering event supervisor', error });
    }
});
exports.registerEventSupervisor = registerEventSupervisor;
const forgotPasswordES = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }
    try {
        // Correct way to extract rows
        const [rows] = yield db_config_1.default.execute('SELECT * FROM eventsupervisor WHERE email = ?', [email]);
        const user = rows[0]; // Get the first matching user
        if (!user) {
            return res.status(404).json({ message: 'No user found with this email' });
        }
        // Generate token for password reset
        const token = jsonwebtoken_1.default.sign({ email: user.email }, secretKey, { expiresIn: '1h' });
        // Create reset password URL
        const resetUrl = `http://localhost:3001/change-new-password?token=${token}`;
        // Send reset password email
        const transporter = nodemailer_1.default.createTransport({
            service: 'Gmail',
            auth: {
                user: 'epochscoringsystem@gmail.com',
                pass: process.env.password, // Use environment variable for security
            },
        });
        const mailOptions = {
            from: '"EPOCH SCORING SYSTEM" <ecinemabooking387@gmail.com>',
            to: user.email,
            subject: 'Reset Your Password',
            text: `Dear ${user.firstName},\n\nPlease use the following link to reset your password: ${resetUrl}\n\nThis link is valid for 1 hour.\n\nThank you!`,
        };
        yield transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Password reset email sent successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error sending password reset email', error });
    }
});
exports.forgotPasswordES = forgotPasswordES;
const changePasswordForgotES = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
        return res.status(400).json({ message: 'Token and new password are required' });
    }
    try {
        // Verify the token
        const decoded = jsonwebtoken_1.default.verify(token, secretKey);
        // Check if the token is valid
        if (!decoded || !decoded.email) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }
        // Hash the new password
        const hashedPassword = yield bcrypt_1.default.hash(newPassword, 10);
        // Update the password in the database
        yield db_config_1.default.execute('UPDATE eventsupervisor SET password = ? WHERE email = ?', [hashedPassword, decoded.email]);
        res.status(200).json({ message: 'Password updated successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating password', error });
    }
});
exports.changePasswordForgotES = changePasswordForgotES;
const changePasswordEventSupervisor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, oldPassword, newPassword } = req.body;
    if (!email || !oldPassword || !newPassword) {
        return res.status(400).json({ message: 'Email, old password, and new password are required' });
    }
    try {
        const [rows] = yield db_config_1.default.execute('SELECT * FROM eventsupervisor WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Event Supervisor not found' });
        }
        const eventSupervisor = rows[0];
        const isMatch = yield bcrypt_1.default.compare(oldPassword, eventSupervisor.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Old password is incorrect' });
        }
        const hashedNewPassword = yield bcrypt_1.default.hash(newPassword, 10);
        yield db_config_1.default.execute('UPDATE eventsupervisor SET password = ? WHERE email = ?', [hashedNewPassword, email]);
        res.status(200).json({ message: 'Password changed successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error changing password', error });
    }
});
exports.changePasswordEventSupervisor = changePasswordEventSupervisor;
const loginEventSupervisor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }
    try {
        // Modified query to also select school_group_id
        const [rows] = yield db_config_1.default.execute('SELECT * FROM eventsupervisor WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const eventSupervisor = rows[0];
        // Compare the provided password with the stored hashed password
        const isMatch = yield bcrypt_1.default.compare(password, eventSupervisor.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        // Create a JWT token
        const token = jsonwebtoken_1.default.sign({ id: eventSupervisor.eventSupervisor_id }, secretKey, { expiresIn: '1h' });
        // Respond with the token and school_group_id
        res.status(200).json({
            message: 'Login successful',
            token,
            school_group_id: eventSupervisor.school_group_id, // Include school_group_id in the response
            eventSupervisor_id: eventSupervisor.eventSupervisor_id
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error logging in', error });
    }
});
exports.loginEventSupervisor = loginEventSupervisor;
const getAllEventSupervisors = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [rows] = yield db_config_1.default.execute('SELECT eventSupervisor_id, school_group_id, email, username, password,firstName,lastName FROM eventsupervisor');
        res.status(200).json(rows);
    }
    catch (error) {
        res.status(500).json({ message: 'Error retrieving event supervisors', error });
    }
});
exports.getAllEventSupervisors = getAllEventSupervisors;
const updateEventSupervisor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { eventSupervisor_id, school_group_id, email, username, password, firstName, lastName } = req.body;
    if (!eventSupervisor_id) {
        return res.status(400).json({ message: 'Event Supervisor ID is required' });
    }
    try {
        // const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
        yield db_config_1.default.execute('UPDATE eventsupervisor SET school_group_id = ?, firstName = ?, lastName = ?, email = ?, username = ?, password = ? WHERE eventSupervisor_id = ?', [
            school_group_id,
            firstName,
            lastName,
            email,
            username,
            password,
            eventSupervisor_id
        ]);
        res.status(200).json({ message: 'Event Supervisor updated successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating event supervisor', error });
    }
});
exports.updateEventSupervisor = updateEventSupervisor;
const deleteEventSupervisor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: 'Event Supervisors ID is required' });
    }
    try {
        const [result] = yield db_config_1.default.execute('DELETE FROM eventsupervisor WHERE eventSupervisor_id = ?', [id]);
        if (!result) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting user', error });
    }
});
exports.deleteEventSupervisor = deleteEventSupervisor;
const getEventSupervisorById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: 'eventsupervisor ID is required' });
    }
    try {
        const [rows] = yield db_config_1.default.execute('SELECT * FROM eventsupervisor WHERE eventSupervisor_id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        const user = rows[0];
        res.status(200).json({ user });
    }
    catch (error) {
        res.status(500).json({ message: 'Error retrieving user', error });
    }
});
exports.getEventSupervisorById = getEventSupervisorById;
//Users
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, isAttendance, school_id } = req.body;
    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }
    // Generate a random password
    const randomPassword = crypto_1.default.randomBytes(8).toString('hex');
    const hashedPassword = yield bcrypt_1.default.hash(randomPassword, 10);
    const newUser = {
        user_id: 0,
        name,
        email,
        password: hashedPassword,
        isAttendance,
        school_id,
        passwordChanged: false, // Add a flag to check if the user has changed their password
    };
    try {
        // Send an email to the user with the random password first
        const transporter = nodemailer_1.default.createTransport({
            service: 'Gmail',
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // true for port 465, false for other ports
            auth: {
                user: 'ecinemabooking387@gmail.com',
                pass: "injgdluouhraowjt", // Email password from environment variable
            },
        });
        const mailOptions = {
            from: '"EPOCH SCORING SYSTEM" <ecinemabooking387@gmail.com>',
            to: newUser.email,
            subject: 'Profile Created - Change Your Password',
            text: `Dear ${newUser.name},\n\nYour profile has been created successfully. Please use the following temporary password to log in: ${randomPassword}\n\nPlease change your password immediately after logging in.\n\nThank you!`,
        };
        // Send the email
        yield transporter.sendMail(mailOptions);
        // If email sent successfully, insert the new user into the database
        yield db_config_1.default.execute('INSERT INTO users (name, email, password, isAttendance, school_id, passwordChanged) VALUES (?, ?, ?, ?, ?, ?)', [newUser.name, newUser.email, newUser.password, newUser.isAttendance, newUser.school_id, newUser.passwordChanged]);
        res.status(201).json({ message: 'User registered successfully and email sent' });
    }
    catch (error) {
        // If there's an error with sending email or inserting the user, return error response
        res.status(500).json({ message: 'Error registering user', error });
    }
});
exports.registerUser = registerUser;
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }
    try {
        const [rows] = yield db_config_1.default.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const user = rows[0];
        // Check if the password has been changed
        if (!user.passwordChanged) {
            return res.status(403).json({ message: 'Please change your password before logging in' });
        }
        const isMatch = yield bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.user_id }, secretKey, { expiresIn: '1h' });
        res.status(200).json({ message: 'Login successful', token });
    }
    catch (error) {
        res.status(500).json({ message: 'Error logging in', error });
    }
});
exports.loginUser = loginUser;
const changePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, oldPassword, newPassword } = req.body;
    if (!email || !oldPassword || !newPassword) {
        return res.status(400).json({ message: 'Email, old password, and new password are required' });
    }
    try {
        const [rows] = yield db_config_1.default.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        const user = rows[0];
        const isMatch = yield bcrypt_1.default.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Old password is incorrect' });
        }
        const hashedNewPassword = yield bcrypt_1.default.hash(newPassword, 10);
        yield db_config_1.default.execute('UPDATE users SET password = ?, passwordChanged = ? WHERE email = ?', [
            hashedNewPassword,
            true, // Set passwordChanged to true
            email,
        ]);
        res.status(200).json({ message: 'Password changed successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error changing password', error });
    }
});
exports.changePassword = changePassword;
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
        return res.status(400).json({ message: 'Token and new password are required' });
    }
    try {
        // Verify the token
        const decoded = jsonwebtoken_1.default.verify(token, secretKey);
        // If token is valid, hash the new password
        const hashedPassword = yield bcrypt_1.default.hash(newPassword, 10);
        // Update the user's password in the database
        yield db_config_1.default.execute('UPDATE users SET password = ?, passwordChanged = true WHERE user_id = ?', [
            hashedPassword,
            decoded.id,
        ]);
        res.status(200).json({ message: 'Password reset successfully' });
    }
    catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(400).json({ message: 'Password reset link has expired' });
        }
        res.status(500).json({ message: 'Error resetting password', error });
    }
});
exports.resetPassword = resetPassword;
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [rows] = yield db_config_1.default.execute('SELECT user_id, name, email, isAttendance, school_id FROM users');
        res.status(200).json(rows);
    }
    catch (error) {
        res.status(500).json({ message: 'Error retrieving users', error });
    }
});
exports.getAllUsers = getAllUsers;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user_id, name, email, password, isAttendance, school_id } = req.body;
    if (!user_id) {
        return res.status(400).json({ message: 'User ID is required' });
    }
    try {
        const hashedPassword = password ? yield bcrypt_1.default.hash(password, 10) : null;
        yield db_config_1.default.execute('UPDATE users SET name = ?, email = ?, password = ?, isAttendance = ?, school_id = ? WHERE user_id = ?', [
            name,
            email,
            hashedPassword,
            isAttendance,
            school_id,
            user_id
        ]);
        res.status(200).json({ message: 'User updated successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating user', error });
    }
});
exports.updateUser = updateUser;
const deleteuser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: 'User ID is required' });
    }
    try {
        const [result] = yield db_config_1.default.execute('DELETE FROM users WHERE user_id = ?', [id]);
        if (!result) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting user', error });
    }
});
exports.deleteuser = deleteuser;
const getUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: 'User ID is required' });
    }
    try {
        const [rows] = yield db_config_1.default.execute('SELECT * FROM users WHERE user_id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        const user = rows[0];
        res.status(200).json({ user });
    }
    catch (error) {
        res.status(500).json({ message: 'Error retrieving user', error });
    }
});
exports.getUserById = getUserById;
const validateToken = (req, res, next) => {
    var _a;
    const token = (_a = req.headers['authorization']) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Access denied, token missing!' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, secretKey);
        req.body.user = decoded;
        next();
    }
    catch (error) {
        res.status(400).json({ message: 'Invalid token' });
    }
};
exports.validateToken = validateToken;
const getAdminsByGroupId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const groupId = parseInt(req.params.id); // Assuming you will pass the group ID as a route parameter
    try {
        const [rows] = yield db_config_1.default.execute('SELECT admin_id, school_group_id, firstName, lastName, email, username, password, isTournamentDirector FROM admin WHERE school_group_id = ?', [groupId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'No admins found for this group ID' });
        }
        res.status(200).json(rows);
    }
    catch (error) {
        res.status(500).json({ message: 'Error retrieving admins by group ID', error });
    }
});
exports.getAdminsByGroupId = getAdminsByGroupId;
const getEventSupervisorsByGroupId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const groupId = parseInt(req.params.id); // Assuming the group ID is passed as a route parameter
    if (!groupId) {
        return res.status(400).json({ message: 'Group ID is required' });
    }
    try {
        const [rows] = yield db_config_1.default.execute('SELECT * FROM eventsupervisor WHERE school_group_id = ?', [groupId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'No event supervisors found for this group ID' });
        }
        res.status(200).json(rows); // Return all event supervisors for the specified group
    }
    catch (error) {
        res.status(500).json({ message: 'Error retrieving event supervisors', error });
    }
});
exports.getEventSupervisorsByGroupId = getEventSupervisorsByGroupId;
