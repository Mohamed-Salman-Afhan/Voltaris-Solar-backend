import { User, IUser } from "../entities/User";

export class UserRepository {
    async findByClerkId(clerkUserId: string) {
        return User.findOne({ clerkUserId });
    }

    async findByInternalId(id: string): Promise<IUser | null> {
        return User.findById(id);
    }

    async findAll(): Promise<IUser[]> {
        return User.find();
    }
}
