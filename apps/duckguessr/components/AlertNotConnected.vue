<template>
  <b-row class="justify-content-center">
    <b-alert show variant="warning" class="text-center">
      {{ t("You are not connected. You can still play but you won't get any medals.") }}
      <div>
        <a href="https://ducksmanager.net/login" target="_blank">{{
          t('Log in on DucksManager then refresh this page to be able to win medals :-)')
        }}</a>
      </div>
    </b-alert>
  </b-row>
</template>

<script setup lang="ts">
import { useI18n } from 'nuxt-i18n-composable'

const { t } = useI18n()
</script>

<style scoped></style>
