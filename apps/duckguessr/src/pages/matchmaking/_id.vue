<template>
  <div />
</template>

<script lang="ts">
export default {
  middleware({ route, redirect }: { route: any; redirect: CallableFunction }) {
    return redirect(route.path.replace("matchmaking", "game"));
  },
};
</script>
