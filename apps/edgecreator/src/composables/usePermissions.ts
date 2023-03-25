import { collection } from "~/stores/collection";

export default () => {
  const hasRole = (thisPrivilege: string) =>
    collection().userPermissions!.some(
      ({ privilege, role }) =>
        role === "EdgeCreator" && privilege === thisPrivilege
    );

  return { hasRole };
};
