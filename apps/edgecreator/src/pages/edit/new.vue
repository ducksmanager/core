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
      @change="
        issueData = $event && $event.issuenumber !== null ? $event : null
      "
    />
  </b-modal>
</template>
<script setup lang="ts">
import { onMounted } from "vue";

const router = useRouter();

const showUploadModal = ref<boolean>(false);

const issueData = ref(
  null as {
    editMode: "range" | "single";
    shortIssuecode: string;
    issuenumberEnd: string;
  } | null,
);

const issueSpecification = computed(() =>
  issueData.value === null
    ? null
    : issueData.value.editMode === "range"
      ? `${issueData.value.shortIssuecode} to ${issueData.value.issuenumberEnd}`
      : issueData.value.shortIssuecode,
);

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
