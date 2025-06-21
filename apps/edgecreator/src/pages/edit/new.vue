<template>
  <b-modal
    ok-only
    :ok-disabled="!issueData"
    :title="$t('Create or edit an edge model')"
    :model-value="showUploadModal"
    @close="toDashboard"
    @ok="startEditing"
  >
    {{ $t("Select the issue that you want to create the edge of.") }}
    <issue-select
      can-be-multiple
      disable-ongoing-or-published
      :disable-not-ongoing-nor-published="false"
      @change="issueData = $event"
    />
  </b-modal>
</template>
<script setup lang="ts">
import { onMounted } from "vue";

const router = useRouter();

const showUploadModal = ref(false);

const issueData = ref<{
  editMode: "range" | "single";
  issuecode: string;
  issuecodeEnd: string;
}>();

const issueSpecification = computed(() => {
  if (!issueData.value?.issuecode) {
    return undefined;
  }
  const issuecode = issueData.value?.issuecode?.replace(/ /g, "_");
  const issuecodeEnd = issueData.value?.issuecodeEnd?.replace(/ /g, "_");
  return issueData.value.editMode === "range"
    ? `${issuecode} to ${issuecodeEnd.replace(/ /g, "_")}`
    : issuecode;
});

const toDashboard = async () => {
  router.push(`/`);
};

const startEditing = async () => {
  router.push(`/edit/${issueSpecification.value!}`);
};

onMounted(() => {
  showUploadModal.value = true;
});
</script>
