<template>
  {{ value.issueNumber }}
</template>

<script setup lang="ts">
import { IssueWithPublicationCode } from "@/types/IssueWithPublicationCode";

defineProps<{
  value: IssueWithPublicationCode;
}>();
</script>

<style scoped></style>
