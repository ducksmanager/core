<template>
  <b-row class="justify-content-center">
    <b-alert show variant="warning" class="text-center">
      {{
        t(
          "You are not connected. You can still play but you won't get any medals.",
        )
      }}
      <div>
        <a :href="dmUrlWithRedirectToHere" target="_blank">{{
          t("Log in on DucksManager to be able to win medals :-)")
        }}</a>
      </div>
    </b-alert>
  </b-row>
</template>

<script setup lang="ts">
const dmUrlWithRedirectToHere = `https://ducksmanager.net/login?redirect=${
  import.meta.env.VITE_URL
}`;

const { t } = useI18n();
</script>
