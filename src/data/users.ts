export const SAUCE_USERS = {
  standard: {
    username: process.env.SAUCE_USERNAME ?? 'standard_user',
    password: process.env.SAUCE_PASSWORD ?? 'secret_sauce',
  },
  locked: {
    username: 'locked_out_user',
    password: 'secret_sauce',
  },
  problem: {
    username: 'problem_user',
    password: 'secret_sauce',
  },
  performance: {
    username: 'performance_glitch_user',
    password: 'secret_sauce',
  },
} as const;

export type SauceUser = keyof typeof SAUCE_USERS;
