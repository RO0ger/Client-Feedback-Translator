import { render } from '../helpers/render';
import { mockAuthenticatedUser as mockAuthUser } from '../mocks/server';

// Re-export everything from React Testing Library and our custom render
export * from '@testing-library/react';
export { render };

// Re-export test helpers and factories
export * from '../helpers';

// Re-export mock user function with both names for compatibility
export { mockAuthenticatedUser as mockAuthUser };
export const mockAuthenticatedUser = mockAuthUser;
