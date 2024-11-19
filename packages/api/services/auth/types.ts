import type { Errorable, ErrorableWithScope } from "~socket.io-services";


type SignupParams = {
  username: string;
  password: string;
  passwordConfirmation: string;
  email: string;
};

export const namespaceEndpoint = "/auth";
export default abstract class {
  static namespaceEndpoint = namespaceEndpoint;

  abstract forgot: (
    token: string,
    callback: (data: { error?: string }) => void,
  ) => void;
  abstract requestTokenForForgotPassword: (
    email: string,
    callback: (data: Errorable<{ token: string }, "Invalid email">) => void,
  ) => void;

  abstract changePassword: (
    data: { password: string; password2: string; token: string },
    callback: (
      value: Errorable<
        { token: string },
        | "Invalid token"
        | "Your password should be at least 6 characters long"
        | "The two passwords should be identical"
        | "Something went wrong"
      >,
    ) => void,
  ) => void;

  abstract login: (
    data: { username: string; password: string },
    callback: (data: Errorable<string, "Invalid username or password">) => void,
  ) => void;
  abstract getCsrf: (callback: (value: string) => void) => void;

  abstract loginAsDemo: (
    callback: (
      data: Errorable<{ token: string }, "No demo user found">,
    ) => void,
  ) => void;

  abstract signup: (
    data: SignupParams,
    callback: (data: ErrorableWithScope<string,
      { name: 'username', message: "Nom d'utilisateur invalide" }
      | { name: 'username', message: "Ce nom d'utilisateur est déjà pris" }
      | { name: 'email', message: "Adresse e-mail invalide" }
      | { name: 'email', message: "Cet e-mail est déjà utilisé par un autre compte" }
    >) => void,
  ) => void;
}
