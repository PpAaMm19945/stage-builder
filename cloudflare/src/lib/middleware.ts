import { Context } from 'hono';
import { User, Env } from '../types';

export function requireAuth(c: Context): User {
    const user = c.get('user');
    if (!user) {
        throw new Error('Unauthorized');
    }
    return user as User;
}

export function requireParent(c: Context): User {
    const user = requireAuth(c);
    // Default to parent if role is missing (backward compatibility)
    if (user.role && user.role !== 'parent') {
        throw new Error('Unauthorized: Parents only');
    }
    return user;
}

export function requireHouseholdMember(c: Context): User {
    const user = requireAuth(c);
    if (!user.household_id) {
        // If no household_id, they might be a legacy user. 
        // In strict mode, we might want to block or auto-create household.
        // For now, allow legacy users (they are parents effectively)
    }
    return user;
}
