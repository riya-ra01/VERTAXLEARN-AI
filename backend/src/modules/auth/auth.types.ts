export interface RegisterBody {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: "student" | "instructor";
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface RefreshBody {
  refreshToken: string;
}
