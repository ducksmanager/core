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
    <i-bi-archive v-if="!withExport && !withSubmit" />
    <template v-else>
      <i-bi-cloud-arrow-up-fill />
      <b-modal
        v-model="showModal"
        :title="$t(withExport ? 'Edge publication' : 'Edge validation')"
        ok-only
        :ok-disabled="isOkDisabled"
        :ok-title="$t(withExport ? 'Export' : 'Submit')"
        @ok="issueIndexToSave = 0"
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
            :model-value="!hasAtLeastOneUser(contributionType)"
            variant="warning"
          >
            {{ $t("You should select at least one user") }} </b-alert
          ><vue3-simple-typeahead
            :items="
              getUsersWithoutContributors(
                contributionType as userContributionType
              )
            "
            :item-projection="({ username }: SimpleUser) => username"
            :placeholder="$t('Enter a user name').toString()"
            :min-input-length="0"
            @select-item="
              (user: SimpleUser) => {
                onUserSelect(
                  user.username,
                  contributionType as userContributionType
                )}
            "
          />
          <ul>
            <li
              v-for="contributor in getContributors(
                contributionType as userContributionType
              )"
              :key="contributor.username"
            >
              {{ contributor.username }}
              <i-bi-x-square-fill
                v-if="
                  !(
                    contributor.username === collectionStore.user!.username &&
                    contributionType === 'createur'
                  )
                "
                class="clickable"
                @click="
                  mainStore.removeContributor({
                    contributionType: contributionType as userContributionType,
                    userToRemove: contributor,
                  })
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
import type { contribution } from "~prisma-schemas/client_edgecreator";
import type { userContributionType } from "~prisma-schemas/schemas/dm";
import type { SimpleUser } from "~types/SimpleUser";
import { stores as webStores } from "~web";

const userContributionEnL10n: Record<contribution, string> = {
  photographe: "photographers",
  createur: "designers",
};

const { saveEdgeSvg } = saveEdge();

const { t: $t } = useI18n();
const userStore = webStores.users();
const collectionStore = webStores.collection();
const mainStore = main();

const { withSubmit = false, withExport = false } = defineProps<{
  withSubmit?: boolean;
  withExport?: boolean;
}>();

const showModal = ref(false);
const progress = ref(0);
const issueIndexToSave = ref<number>();
const result = ref<string>();

const label = computed(() =>
  $t(withExport ? "Export" : withSubmit ? "Submit" : "Save"),
);

const variant = computed((): "success" | "primary" =>
  withExport || withSubmit ? "success" : "primary",
);

const outlineVariant = computed(
  (): "outline-success" | "outline-primary" => `outline-${variant.value}`,
);

const isOkDisabled = computed(() =>
  Object.keys(userContributionEnL10n).some(
    (contributionType) => !hasAtLeastOneUser(contributionType as contribution),
  ),
);

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
  const currentIssuecode = mainStore.issuecodes[newValue!];

  if (currentIssuecode === undefined) {
    return;
  }

  ui().zoom = 1.5;
  nextTick(() => {
    saveEdgeSvg(
      currentIssuecode,
      mainStore.contributors.filter(
        ({ issuecode }) => issuecode === currentIssuecode,
      ),
      withExport,
      withSubmit,
    ).then((response) => {
      const isSuccess = response!.paths.svgPath;
      if (isSuccess) {
        progress.value += 100 / mainStore.issuecodes.length;
        issueIndexToSave.value!++;
      } else {
        progress.value = 0;
        result.value = "error";
        issueIndexToSave.value = undefined;
      }
    });
  });
});

watch(showModal, (newValue) => {
  if (newValue && withSubmit) {
    addContributorAllIssues(
      userStore.allUsers!.find(
        (thisUser) => thisUser.username === collectionStore.user!.username,
      )!,
      "createur",
    );
  }
});

const onUserSelect = (
  username: string,
  contributionType: userContributionType,
) => {
  addContributorAllIssues(
    userStore.allUsers!.find((thisUser) => thisUser.username === username)!,
    contributionType,
  );
};

const ucFirst = (text: string) =>
  text[0].toUpperCase() + text.substring(1, text.length);
const getContributors = (contributionType: userContributionType) =>
  userStore.allUsers!.filter((user) => isContributor(user, contributionType));

const getUsersWithoutContributors = (contributionType: userContributionType) =>
  userStore.allUsers!.filter(
    (contributor) => !isContributor(contributor, contributionType),
  );

const isContributor = (
  user: SimpleUser,
  contributionType: userContributionType,
) =>
  mainStore.contributors.some(
    ({ user: thisUser, contributionType: thisContributionType }) =>
      thisUser.id === user.id && thisContributionType === contributionType,
  );
const addContributorAllIssues = (
  user: SimpleUser,
  contributionType: userContributionType,
) =>
  mainStore.issuecodes.forEach((issuecode) =>
    mainStore.addContributor({
      issuecode,
      contributionType,
      user,
    }),
  );
const hasAtLeastOneUser = (contributionType: contribution) =>
  [
    ...new Set(
      mainStore.contributors
        .filter(
          ({ contributionType: thisContributionType }) =>
            contributionType === thisContributionType,
        )
        .map(({ issuecode }) => issuecode),
    ),
  ].length === mainStore.issuecodes.length;

const onClick = () => {
  if (withExport || withSubmit) {
    showModal.value = !showModal.value;
  } else {
    issueIndexToSave.value = 0;
  }
};
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
