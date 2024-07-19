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
        <b-alert :model-value="true" variant="info">{{
          $t(
            "Once your edge is ready, indicate the photographers and the designers of the edge. " +
              'When you click "Submit", the edge will be sent to an administrator for validation ' +
              "before it is published on DucksManager",
          )
        }}</b-alert>
        <div
          v-for="contributionType of ['photographes', 'createurs']"
          :key="contributionType"
        >
          <h2>{{ $t(ucFirst(userContributionEnL10n[contributionType])) }}</h2>
          <b-alert
            :model-value="
              !hasAtLeastOneUser(contributionType as userContributionType)
            "
            variant="warning"
            >{{ $t("You should select at least one user") }}</b-alert
          ><vue3-simple-typeahead
            :ref="`${userContributionEnL10n[contributionType]}Typeahead`"
            :items="
              getUsersWithoutContributors(
                contributionType as userContributionType
              )
            "
            :item-projection="({ username }: SimpleUser) => username"
            :placeholder="$t('Enter a user name').toString()"
            :min-input-length="0"
            @select-item="
              (user: SimpleUser) =>
                onUserSelect(
                  user.username,
                  contributionType as userContributionType
                )
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
                    contributionType === 'designers'
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
import type { userContributionType } from "~prisma-clients/extended/dm.extends";
import type { SimpleUser } from "~types/SimpleUser";
import { stores as webStores } from "~web";

const userContributionEnL10n: Record<string, string> = {
  photographes: "photographers",
  createurs: "designers",
};

const { saveEdgeSvg } = saveEdge();

const { t: $t } = useI18n();
const userStore = webStores.users();
const collectionStore = webStores.collection();
const mainStore = main();

const props = withDefaults(
  defineProps<{
    withSubmit?: boolean;
    withExport?: boolean;
  }>(),
  {
    withSubmit: false,
    withExport: false,
  },
);

const showModal = ref(false);
const progress = ref(0);
const issueIndexToSave = ref<number | null>(null);
const result = ref<string | null>(null);
const designersTypeahead = ref();
const photographersTypeahead = ref();

// const progressLeft = computed(() => 100 - progress.value);

const label = computed(() =>
  $t(props.withExport ? "Export" : props.withSubmit ? "Submit" : "Save"),
);

const variant = computed((): "success" | "primary" =>
  props.withExport || props.withSubmit ? "success" : "primary",
);

const outlineVariant = computed(
  (): "outline-success" | "outline-primary" => `outline-${variant.value}`,
);

const isOkDisabled = computed(() =>
  Object.keys(["photographers", "designers"]).some(
    (contributionType) =>
      !hasAtLeastOneUser(contributionType as userContributionType),
  ),
);

watch(progress, (newValue) => {
  if (newValue === 100) {
    window.setTimeout(() => {
      progress.value = 0;
      result.value = "success";
      window.setTimeout(() => {
        result.value = null;
      }, 2000);
    }, 1000);
  }
});
watch(issueIndexToSave, (newValue) => {
  const currentIssuenumber = mainStore.issuenumbers[newValue!];

  if (currentIssuenumber === undefined) {
    return;
  }

  ui().zoom = 1.5;
  nextTick(() => {
    saveEdgeSvg(
      mainStore.country!,
      mainStore.magazine!,
      currentIssuenumber,
      mainStore.contributors.filter(
        ({ issuenumber }) => issuenumber === currentIssuenumber,
      ),
      props.withExport,
      props.withSubmit,
    ).then((response) => {
      const isSuccess = response!.paths.svgPath;
      if (isSuccess) {
        progress.value += 100 / mainStore.issuenumbers.length;
        issueIndexToSave.value!++;
      } else {
        progress.value = 0;
        result.value = "error";
        issueIndexToSave.value = null;
      }
    });
  });
});

watch(showModal, (newValue) => {
  if (newValue && props.withSubmit) {
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
  switch (contributionType) {
    case "photographe":
      photographersTypeahead.value.clearValue();
      break;
    case "createur":
      designersTypeahead.value.clearValue();
  }
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
  mainStore.issuenumbers.forEach((issuenumber) =>
    mainStore.addContributor({
      issuenumber,
      contributionType,
      user,
    }),
  );
const hasAtLeastOneUser = (contributionType: userContributionType) =>
  [
    ...new Set(
      mainStore.contributors
        .filter(
          ({ contributionType: thisContributionType }) =>
            contributionType === thisContributionType,
        )
        .map(({ issuenumber }) => issuenumber),
    ),
  ].length === mainStore.issuenumbers.length;

const onClick = () => {
  if (props.withExport || props.withSubmit) {
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
