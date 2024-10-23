"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controllers_1 = require("../controllers/auth.controllers");
const extractJWT_1 = require("../middlewares/extractJWT");
const router = (0, express_1.Router)();
// Super Admin
router.post('/registerSA', auth_controllers_1.register);
router.post('/loginSA', auth_controllers_1.login);
router.delete('/deleteSuperAdmin/:id', auth_controllers_1.deleteSuperAdmin);
// Admin 
router.post('/registerAdmin', auth_controllers_1.registerAdmin);
router.post('/adminLogin', auth_controllers_1.loginAdmin);
router.delete('/deleteAdmin/:id', auth_controllers_1.deleteAdmin);
router.post('/change-admin-password', auth_controllers_1.changePasswordAdmin);
router.post('/forgot-passwordA', auth_controllers_1.forgotPassword);
router.post('/change-passwordA', auth_controllers_1.changePasswordForgot);
// EventSupervisor
router.post('/registerES', auth_controllers_1.registerEventSupervisor);
router.post('/esLogin', auth_controllers_1.loginEventSupervisor);
router.delete('/deleteEventSupervisor/:id', auth_controllers_1.deleteEventSupervisor);
router.post('/change-password', auth_controllers_1.changePasswordEventSupervisor);
router.post('/forgot-passwordEs', auth_controllers_1.forgotPasswordES);
router.post('/change-passwordEs', auth_controllers_1.changePasswordForgotES);
//User
router.post('/registeruser', auth_controllers_1.registerUser);
router.post('/userLogin', auth_controllers_1.loginUser);
router.delete('/delteUser/:id', auth_controllers_1.deleteuser);
router.post('/reset-password', auth_controllers_1.resetPassword);
// Route to change admin password
// Protected Routes
// Get All routes
router.get('/getAllSuperAdmins', extractJWT_1.authenticateJWT, auth_controllers_1.getAllSuperAdmins);
router.get('/admin', extractJWT_1.authenticateJWT, auth_controllers_1.getAllAdmins);
router.get('/eventsupervisor', extractJWT_1.authenticateJWT, auth_controllers_1.getAllEventSupervisors);
router.get('/UserId', extractJWT_1.authenticateJWT, auth_controllers_1.getAllUsers);
// Get By Id
router.get('/SAId/:id', extractJWT_1.authenticateJWT, auth_controllers_1.getSuperAdminById);
router.get('/AId/:id', extractJWT_1.authenticateJWT, auth_controllers_1.getAdminById);
router.get('/ESId/:id', extractJWT_1.authenticateJWT, auth_controllers_1.getEventSupervisorById);
router.get('/UserId/:id', extractJWT_1.authenticateJWT, auth_controllers_1.getUserById);
// Update Routes
router.put('/updateSuperAdmin/:id', extractJWT_1.authenticateJWT, auth_controllers_1.updateSuperAdmin);
router.put('/updateadmin', extractJWT_1.authenticateJWT, auth_controllers_1.updateAdmin);
router.put('/updateEventSupervisor', extractJWT_1.authenticateJWT, auth_controllers_1.updateEventSupervisor);
router.put('/updateUsers', extractJWT_1.authenticateJWT, auth_controllers_1.updateUser);
exports.default = router;
