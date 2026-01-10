<template>
  <b-button
    v-if="progress || result === 'success'"
    class="save-progress"
    :style="{
      background: `linear-gradient(90deg, #0d6efd ${progress}%, transparent 0)`,
    }"
    disabled
    pill
    :variant="outlineVariant"
    size="sm"
  >
    <i-bi-check v-if="result === 'success'" />
  </b-button>
  <b-button
    v-else-if="result === 'error'"
    disabled
    pill
    variant="outline-danger"
    size="sm"
  >
    <i-bi-x />
  </b-button>
  <b-button
    v-else
    :title="label"
    pill
    :variant="`outline-${variant}`"
    size="sm"
    @click="onClick"
  >
    <i-bi-archive v-if="!action" />
    <template v-else>
      <i-bi-cloud-arrow-up-fill />
      <b-modal
        v-model="showModal"
        :title="
          $t(action === 'export' ? 'Edge publication' : 'Edge validation')
        "
        ok-only
        :ok-disabled="
          !contributorsByContributionType.photographe.size ||
          !contributorsByContributionType.createur.size
        "
        :ok-title="$t(action === 'export' ? 'Export' : 'Submit')"
        @ok="onOK"
      >
        <b-alert :model-value="true" variant="info">
          {{
            $t(
              "Once your edge is ready, indicate the photographers and the designers of the edge. " +
                'When you click "Submit", the edge will be sent to an administrator for validation ' +
                "before it is published on DucksManager",
            )
          }}
        </b-alert>
        <div
          v-for="contributionType of Object.keys(userContributionEnL10n) as contribution[]"
          :key="contributionType"
        >
          <h2>{{ $t(ucFirst(userContributionEnL10n[contributionType])) }}</h2>
          <b-alert
            :model-value="
              !contributorsByContributionType[contributionType].size
            "
            variant="warning"
          >
            {{ $t("You should select at least one user") }} </b-alert
          ><vue3-simple-typeahead
            :items="getUsersWithoutContributors(contributionType)"
            :item-projection="({ username }: SimpleUser) => username"
            :placeholder="$t('Enter a user name').toString()"
            :min-input-length="0"
            @select-item="
              (user: SimpleUser) => {
                contributorsByContributionType[contributionType as contribution].add(user);
              }
            "
          />
          <ul>
            <li
              v-for="contributor in contributorsByContributionType[contributionType as contribution]"
              :key="contributor.username"
            >
              {{ contributor.username }}
              <i-bi-x-square-fill
                class="clickable"
                @click="
                  contributorsByContributionType[contributionType as contribution].delete(
                    contributor,
                  );
                "
              />
            </li>
          </ul>
        </div>
      </b-modal>
    </template>
  </b-button>
</template>
<script setup lang="ts">
import { nextTick } from "vue";
import { useI18n } from "vue-i18n";
import Vue3SimpleTypeahead from "vue3-simple-typeahead";

import saveEdge from "~/composables/useSaveEdge";
import { main } from "~/stores/main";
import { ui } from "~/stores/ui";
import type { contribution } from "~prisma-schemas/schemas/edgecreator";
import type { SimpleUser } from "~types/SimpleUser";
import { stores as webStores } from "~web";

const userContributionEnL10n = {
  photographe: "photographers",
  createur: "designers",
} as const;

const { saveEdgeSvg } = saveEdge();

const { t: $t } = useI18n();
const userStore = webStores.users();
const mainStore = main();
const { issuecodes, contributors } = storeToRefs(mainStore);

const { action } = defineProps<{
  action: "save" | "submit" | "export";
}>();

const showModal = ref(false);
const progress = ref(0);
const issueIndexToSave = ref<number>();
const result = ref<string>();

const contributorsByContributionType = ref({
  photographe: new Set<SimpleUser>(),
  createur: new Set<SimpleUser>(),
} as const);

const label = computed(() => $t(ucFirst(action)));

const variant = computed(() => (action === "save" ? "primary" : "success"));

const outlineVariant = computed(() => `outline-${variant.value}` as const);

watch(progress, (newValue) => {
  if (newValue === 100) {
    window.setTimeout(() => {
      progress.value = 0;
      result.value = "success";
      window.setTimeout(() => {
        result.value = undefined;
      }, 2000);
    }, 1000);
  }
});
watch(issueIndexToSave, (newValue) => {
  const currentIssuecode = issuecodes.value[newValue!];

  if (currentIssuecode === undefined) {
    return;
  }

  ui().zoom = 1.5;
  nextTick(() => {
    saveEdgeSvg(
      currentIssuecode,
      Array.from(contributors.value).filter(
        ({ issuecode }) => issuecode === currentIssuecode,
      ),
      action === "export",
      action === "submit",
    ).then((response) => {
      const isSuccess = response!.paths.svgPath;
      if (isSuccess) {
        progress.value += 100 / issuecodes.value.length;
        issueIndexToSave.value!++;
      } else {
        progress.value = 0;
        result.value = "error";
        issueIndexToSave.value = undefined;
      }
    });
  });
});

const onOK = () => {
  if (action) {
    for (const contributionType of Object.keys(
      contributors.value,
    ) as contribution[]) {
      for (const contributor of contributorsByContributionType.value[
        contributionType
      ]) {
        for (const issuecode of issuecodes.value) {
          mainStore.addContributor({
            issuecode,
            contributionType,
            user: contributor,
          });
        }
      }
    }
    issueIndexToSave.value = 0;
  }
};

const ucFirst = (text: string) =>
  text[0].toUpperCase() + text.substring(1, text.length);

const getUsersWithoutContributors = (contributionType: contribution) =>
  userStore.allUsers!.filter(
    (contributor) =>
      !contributorsByContributionType.value[contributionType].has(contributor),
  );

const onClick = () => {
  if (action === "export" || action === "submit") {
    showModal.value = !showModal.value;
  } else {
    issueIndexToSave.value = 0;
  }
};

onMounted(() => {
  contributorsByContributionType.value = {
    photographe: new Set(
      Array.from(contributors.value)
        .filter(({ contributionType }) => contributionType === "photographe")
        .map(({ user }) => user),
    ),
    createur: new Set(
      Array.from(contributors.value)
        .filter(({ contributionType }) => contributionType === "createur")
        .map(({ user }) => user),
    ),
  };
});
</script>
<style scoped lang="scss">
:deep(.btn) {
  width: 2.25rem;
  height: 2rem;
}

.bi-x-square-fill {
  cursor: pointer;
}

.save-progress {
  width: 32px;
  height: 32px;
}
</style>
