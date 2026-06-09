import { Request, Response } from 'express';
export declare const registerUser: (req: Request, res: Response) => Promise<void>;
export declare const loginUser: (req: Request, res: Response) => Promise<void>;
export declare const googleLogin: (req: Request, res: Response) => Promise<void>;
export declare const getMe: (req: Request, res: Response) => Promise<void>;
export declare const updatePassword: (req: Request, res: Response) => Promise<void>;
export declare const forgotPassword: (req: Request, res: Response) => Promise<void>;
export declare const resetPassword: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=auth.d.ts.map