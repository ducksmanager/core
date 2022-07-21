import { deleteCookie } from "h3";
import { Ref } from "vue";

import { useCookie } from "#app";
import { User } from "~/server/user";

type _AuthState = {
  loggedIn: boolean;
  user?: User;
  jwt?: string;
};

export type AuthState = Ref<_AuthState> & {
  set(state: _AuthState): void;
  reset(): void;
};

const _defaultAuthState: _AuthState = {
  loggedIn: false,
  user: undefined,
  jwt: undefined,
};

export default function useAuthState(): AuthState {
  const authStateStorage = useCookie<string>("authStateStorage", {
    maxAge: 14 * 24 * 3600,
    default: () => JSON.stringify(_defaultAuthState),
  });

  const authState: Ref<_AuthState> = useState("authState", () =>
    typeof authStateStorage.value === "string"
      ? JSON.parse(authStateStorage.value)
      : authStateStorage.value
  );

  watch(
    authState.value,
    (newState) => (authStateStorage.value = JSON.stringify(newState))
  );

  return Object.assign(authState, {
    set(state: _AuthState): void {
      Object.assign(authState.value, _defaultAuthState, state);
    },

    reset(): void {
      Object.assign(authState.value, _defaultAuthState);
    },
  });
}
