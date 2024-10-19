import { Router } from 'express';
import { register, login, getAllUsers, registerAdmin, loginAdmin, getAllAdmins, updateAdmin, 
    updateSuperAdmin, deleteSuperAdmin, loginEventSupervisor, registerEventSupervisor, 
    getAllEventSupervisors, updateEventSupervisor, deleteAdmin, deleteEventSupervisor, 
    getAllSuperAdmins, getSuperAdminById, updateUser, registerUser, loginUser, deleteuser, 
    getAdminById, getEventSupervisorById, getUserById, 
    changePassword,
    forgotPassword,
    resetPassword} from '../controllers/auth.controllers';
import { authenticateJWT } from '../middlewares/extractJWT';

const router = Router();

// Super Admin
router.post('/registerSA', register);
router.post('/loginSA', login);
router.delete('/deleteSuperAdmin/:id', deleteSuperAdmin)


// Admin 
router.post('/registerAdmin',registerAdmin);
router.post('/adminLogin', loginAdmin);
router.delete('/deleteAdmin/:id',deleteAdmin)

// EventSupervisor
router.post('/registerES',registerEventSupervisor);
router.post('/esLogin', loginEventSupervisor);
router.delete('/deleteEventSupervisor/:id',deleteEventSupervisor)

//User
router.post('/registeruser', registerUser);
router.post('/userLogin', loginUser);
router.delete('/delteUser/:id',deleteuser);
router.post('/changePassword', changePassword)
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);


// Protected Routes
 // Get All routes
router.get('/getAllSuperAdmins', authenticateJWT, getAllSuperAdmins);
router.get('/admin', authenticateJWT, getAllAdmins);
router.get('/eventsupervisor', authenticateJWT, getAllEventSupervisors)
router.get('/UserId', authenticateJWT, getAllUsers)

// Get By Id
router.get('/SAId/:id', authenticateJWT, getSuperAdminById)
router.get('/AId/:id', authenticateJWT, getAdminById)
router.get('/ESId/:id', authenticateJWT, getEventSupervisorById)
router.get('/UserId/:id', authenticateJWT, getUserById)



 // Update Routes
router.put('/updateSuperAdmin/:id', authenticateJWT, updateSuperAdmin);
router.put('/updateadmin', authenticateJWT, updateAdmin);
router.put('/updateEventSupervisor', authenticateJWT, updateEventSupervisor);
router.put('/updateUsers', authenticateJWT, updateUser);



export default router;
