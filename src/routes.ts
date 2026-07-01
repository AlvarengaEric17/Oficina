import { Router, Request, Response } from 'express';
import { validateSchema } from './middlewares/validateSchema';
import { isAuthenticated } from './middlewares/isAuthenticated';
import { isMechanic } from './middlewares/isMechanic';
import { isAdmin, isSuperAdmin } from './middlewares/isAdmin';
import {
  loginRateLimiter,
  registerRateLimiter,
  publicBudgetRateLimiter,
} from './middlewares/rateLimiter';

// User controllers
import {
  CreateUserController,
  SessionController,
  GetMeController,
  UpdateUserController,
} from './controllers/user/userController';

// Part controllers
import {
  CreatePartController,
  ListPartsController,
  UpdatePartController,
} from './controllers/part/partController';

// Budget controllers
import {
  CreateBudgetController,
  AddItemBudgetController,
  GetBudgetShareController,
  ApproveBudgetController,
  UpdateBudgetStatusController,
  GetVehicleHistoryController,
} from './controllers/budget/budgetController';

// Financial controllers
import {
  CreateManualTransactionController,
  GetCashFlowController,
  CalculateTaxController,
} from './controllers/financial/financialController';

// Company controllers
import {
  CreateCompanyController,
  ListCompaniesController,
  UpdateCompanyController,
} from './controllers/company/companyController';

// Schedule controllers
import {
  CreateScheduleSlotController,
  GetPublicScheduleController,
  GetMechanicScheduleController,
  UpdateSlotAvailabilityController,
} from './controllers/schedule/scheduleController';

// Schemas
import { createUserSchema, sessionSchema, updateUserSchema } from './schemas/userSchema';
import { createPartSchema, updatePartSchema } from './schemas/partSchema';
import {
  createBudgetSchema,
  addItemBudgetSchema,
  updateStatusSchema,
} from './schemas/budgetSchema';
import {
  manualTransactionSchema,
  calculateTaxSchema,
} from './schemas/financialSchema';
import { createSlotSchema } from './schemas/scheduleSchema';
import { createCompanySchema, updateCompanySchema } from './schemas/companySchema';

const router = Router();

const createCompanyController = new CreateCompanyController();
const listCompaniesController = new ListCompaniesController();
const updateCompanyController = new UpdateCompanyController();
const createBudgetController = new CreateBudgetController();
const addItemBudgetController = new AddItemBudgetController();
const getBudgetShareController = new GetBudgetShareController();
const approveBudgetController = new ApproveBudgetController();
const updateBudgetStatusController = new UpdateBudgetStatusController();
const getVehicleHistoryController = new GetVehicleHistoryController();
const createPartController = new CreatePartController();
const listPartsController = new ListPartsController();
const updatePartController = new UpdatePartController();
const createManualTransactionController = new CreateManualTransactionController();
const getCashFlowController = new GetCashFlowController();
const calculateTaxController = new CalculateTaxController();
const createScheduleSlotController = new CreateScheduleSlotController();
const getPublicScheduleController = new GetPublicScheduleController();
const getMechanicScheduleController = new GetMechanicScheduleController();
const updateSlotAvailabilityController = new UpdateSlotAvailabilityController();

// Health check
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// ========== USER ROUTES ==========
const createUserController = new CreateUserController();
const sessionController = new SessionController();
const getMeController = new GetMeController();
const updateUserController = new UpdateUserController();

router.post(
  '/users',
  registerRateLimiter,
  validateSchema('body')(createUserSchema),
  (req, res) => createUserController.handle(req, res)
);

router.patch(
  '/users/:id',
  isAuthenticated,
  isSuperAdmin,
  validateSchema('body')(updateUserSchema),
  (req, res) => updateUserController.handle(req, res)
);

router.post(
  '/session',
  loginRateLimiter,
  validateSchema('body')(sessionSchema),
  (req, res) => sessionController.handle(req, res)
);

router.get('/me', isAuthenticated, (req, res) =>
  getMeController.handle(req, res)
);

router.post(
  '/companies',
  isAuthenticated,
  isSuperAdmin,
  validateSchema('body')(createCompanySchema),
  (req, res) => createCompanyController.handle(req, res)
);

router.get(
  '/companies',
  isAuthenticated,
  isSuperAdmin,
  (req, res) => listCompaniesController.handle(req, res)
);

router.patch(
  '/companies/:id',
  isAuthenticated,
  isSuperAdmin,
  validateSchema('body')(updateCompanySchema),
  (req, res) => updateCompanyController.handle(req, res)
);

// ========== PART ROUTES ==========
router.post(
  '/part',
  isAuthenticated,
  isMechanic,
  validateSchema('body')(createPartSchema),
  (req, res) => createPartController.handle(req, res)
);

router.get('/parts', isAuthenticated, isMechanic, (req, res) =>
  listPartsController.handle(req, res)
);

router.put(
  '/part/:id',
  isAuthenticated,
  isMechanic,
  validateSchema('body')(updatePartSchema),
  (req, res) => updatePartController.handle(req, res)
);

// ========== BUDGET ROUTES ==========
router.post(
  '/budget',
  isAuthenticated,
  isMechanic,
  validateSchema('body')(createBudgetSchema),
  (req, res) => createBudgetController.handle(req, res)
);

router.post(
  '/budget/item',
  isAuthenticated,
  isMechanic,
  validateSchema('body')(addItemBudgetSchema),
  (req, res) => addItemBudgetController.handle(req, res)
);

router.get(
  '/budget/share/:id',
  publicBudgetRateLimiter,
  (req, res) => getBudgetShareController.handle(req, res)
);

router.patch(
  '/budget/approve/:id',
  publicBudgetRateLimiter,
  (req, res) => approveBudgetController.handle(req, res)
);

router.patch(
  '/budget/status/:id',
  isAuthenticated,
  isMechanic,
  validateSchema('body')(updateStatusSchema),
  (req, res) => updateBudgetStatusController.handle(req, res)
);

router.get(
  '/vehicles/history',
  isAuthenticated,
  isMechanic,
  (req, res) => getVehicleHistoryController.handle(req, res)
);

// ========== FINANCIAL ROUTES ==========
router.post(
  '/financial/transaction',
  isAuthenticated,
  isAdmin,
  validateSchema('body')(manualTransactionSchema),
  (req, res) => createManualTransactionController.handle(req, res)
);

router.get('/financial/cashflow', isAuthenticated, isAdmin, (req, res) =>
  getCashFlowController.handle(req, res)
);

router.post(
  '/financial/calculate-tax',
  isAuthenticated,
  validateSchema('body')(calculateTaxSchema),
  (req, res) => calculateTaxController.handle(req, res)
);

// ========== SCHEDULE ROUTES ==========
router.post(
  '/schedule/slots',
  isAuthenticated,
  isMechanic,
  validateSchema('body')(createSlotSchema),
  (req, res) => createScheduleSlotController.handle(req, res)
);

router.get('/schedule/public', (req, res) =>
  getPublicScheduleController.handle(req, res)
);

router.get('/schedule/mechanic', isAuthenticated, isMechanic, (req, res) =>
  getMechanicScheduleController.handle(req, res)
);

router.patch(
  '/schedule/slots/:id',
  isAuthenticated,
  isMechanic,
  (req, res) => updateSlotAvailabilityController.handle(req, res)
);

export { router };
