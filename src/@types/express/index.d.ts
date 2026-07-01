declare global {
  namespace Express {
    interface Request {
      user_id: string;
      company_id?: string;
      user_role: 'MECHANIC' | 'ADMIN' | 'SUPER_ADMIN';
    }
  }
}

export {};
