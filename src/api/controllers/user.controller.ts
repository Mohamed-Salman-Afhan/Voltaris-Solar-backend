import { NextFunction, Request, Response } from "express";
import { UserRepository } from "../../infrastructure/repositories/user.repository";

const userRepository = new UserRepository();

export const getAllUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const users = await userRepository.findAll();
        res.status(200).json(users);
    } catch (error) {
        next(error);
    }
};
