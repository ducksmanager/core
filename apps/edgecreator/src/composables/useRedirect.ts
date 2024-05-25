import { useToast } from "bootstrap-vue-next";
import { watch } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

export default () =>
  watch(
    () => route.hash,
    (newValue) => {
      const toastError = (message: string) =>
        useToast().show!({
          props: {
            body: message,
            title: "Error",
          },
        });
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
