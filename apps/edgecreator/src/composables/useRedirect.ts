import { useToast } from "bootstrap-vue-next";

const route = useRoute();

export default () => {
  const toast = useToast();
  return watch(
    () => route.hash,
    (newValue) => {
      const toastError = (message: string) =>
        toast!.show(
          { body: message, title: "Error" },
          {
            delay: 3000,
            autoHide: true,
          },
        );
      switch (newValue) {
        case "#401":
          toastError("You are not logged in");
          break;
        case "#403":
          toastError(
            "You don't have enough rights to access the requested page",
          );
          break;
      }
    },
    { immediate: true },
  );
};
