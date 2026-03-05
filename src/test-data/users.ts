export type UserCredentials = {
  username: string;
  password: string;
};

export const USER_CREDENTIALS = {
  standard_user: {
    username: "standard_user",
    password: "secret_sauce",
  },
  locked_out_user: {
    username: "locked_out_user",
    password: "secret_sauce",
  },
  problem_user: {
    username: "problem_user",
    password: "secret_sauce",
  },
  performance_glitch_user: {
    username: "performance_glitch_user",
    password: "secret_sauce",
  },
  invalid_user: {
    username: "invalid_user",
    password: "invalid_password",
  },
  error_user: {
    username: "error_user",
    password: "secret_sauce",
  },
  visual_user: {
    username: "visual_user",
    password: "secret_sauce",
  },
} as const;
