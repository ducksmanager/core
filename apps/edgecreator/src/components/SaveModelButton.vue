<template>
  <b-button
    v-if="progress || result === 'success'"
    disabled
    pill
    :variant="outlineVariant"
    size="sm"
  >
    <b-progress
      v-if="progress"
      animated
      :value="progress"
      :max="100"
      :variant="variant"
    />
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
              "before it is published on DucksManager"
          )
        }}</b-alert>
        <div
          v-for="contributionType of ['photographers', 'designers']"
          :key="contributionType"
        >
          <h2>{{ $t(ucFirst(contributionType)) }}</h2>
          <b-alert
            v-if="!hasAtLeastOneUser(contributionType as ContributionType)"
            :model-value="true"
            variant="warning"
            >{{ $t("You should select at least one user") }}</b-alert
          ><vue3-simple-typeahead
            :ref="`${contributionType}Typeahead`"
            :items="getUsersWithoutContributors(contributionType as ContributionType)"
            :item-projection="({ username }: SimpleUser) => username"
            :placeholder="$t('Enter a user name').toString()"
            :min-input-length="0"
            @select-item="(username: string) => onUserSelect(username, contributionType as ContributionType)"
          />
          <ul>
            <li
              v-for="contributor in getContributors(contributionType as ContributionType)"
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
                @click="
                  mainStore.removeContributor({
                    contributionType: contributionType as ContributionType,
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

import saveEdge from "~/composables/useSaveEdge";
import { collection } from "~/stores/collection";
import { main } from "~/stores/main";
import { ui } from "~/stores/ui";
import { users } from "~/stores/users";
import { SimpleUser } from "~types/SimpleUser";

const { saveEdgeSvg } = saveEdge();

const { t: $t } = useI18n();
const userStore = users();
const collectionStore = collection();
const mainStore = main();

type ContributionType = "photographers" | "designers";

const props = withDefaults(
  defineProps<{
    withSubmit?: boolean;
    withExport?: boolean;
  }>(),
  {
    withSubmit: false,
    withExport: false,
  }
);

const showModal = ref(false as boolean);
const progress = ref(0 as number);
const issueIndexToSave = ref(null as number | null);
const result = ref(null as any);
const designersTypeahead = ref<HTMLInputElement>();
const photographersTypeahead = ref<HTMLInputElement>();

const label = computed(() =>
  $t(props.withExport ? "Export" : props.withSubmit ? "Submit" : "Save")
);

const variant = computed((): "success" | "primary" =>
  props.withExport || props.withSubmit ? "success" : "primary"
);

const outlineVariant = computed(
  (): "outline-success" | "outline-primary" => `outline-${variant.value}`
);

const isOkDisabled = computed(() =>
  Object.keys(["photographers", "designers"]).some(
    (contributionType) =>
      !hasAtLeastOneUser(contributionType as ContributionType)
  )
);

watch(
  () => progress.value,
  (newValue) => {
    if (newValue === 100) {
      window.setTimeout(() => {
        progress.value = 0;
        result.value = "success";
        window.setTimeout(() => {
          result.value = null;
        }, 2000);
      }, 1000);
    }
  }
);
watch(
  () => issueIndexToSave.value,
  (newValue) => {
    const currentIssueNumber = mainStore.issuenumbers[newValue!];

    if (currentIssueNumber === undefined) {
      return;
    }

    ui().zoom = 1.5;
    nextTick(() =>
      saveEdgeSvg(
        mainStore.country!,
        mainStore.magazine!,
        currentIssueNumber,
        mainStore.contributors[currentIssueNumber],
        props.withExport,
        props.withSubmit
      ).then((response) => {
        const isSuccess = response.paths && response.paths.svgPath;
        if (isSuccess) {
          progress.value += 100 / mainStore.issuenumbers.length;
          issueIndexToSave.value!++;
        } else {
          progress.value = 0;
          result.value = "error";
          issueIndexToSave.value = null;
        }
      })
    );
  }
);

watch(
  () => showModal.value,
  (newValue) => {
    if (newValue && props.withSubmit) {
      addContributorAllIssues(
        userStore.allUsers!.find(
          (thisUser) => thisUser.username === collectionStore.user!.username
        )!,
        "designers"
      );
    }
  }
);

const onUserSelect = (username: string, contributionType: ContributionType) => {
  addContributorAllIssues(
    userStore.allUsers!.find((thisUser) => thisUser.username === username)!,
    contributionType
  );
  switch (contributionType) {
    case "photographers":
      photographersTypeahead.value!.value = "";
    case "designers":
      designersTypeahead.value!.value = "";
  }
};

const ucFirst = (text: string) =>
  text[0].toUpperCase() + text.substring(1, text.length);
const getContributors = (contributionType: ContributionType) =>
  userStore.allUsers!.filter((user) => isContributor(user, contributionType));

const getUsersWithoutContributors = (contributionType: ContributionType) =>
  userStore.allUsers!.filter(
    (contributor) => !isContributor(contributor, contributionType)
  );

const isContributor = (user: SimpleUser, contributionType: ContributionType) =>
  Object.keys(mainStore.contributors).reduce(
    (acc, issueNumber) =>
      acc ||
      mainStore.contributors[issueNumber][contributionType]
        .map(({ username }) => username)
        .includes(user.username),
    false
  );
const addContributorAllIssues = (
  user: SimpleUser,
  contributionType: ContributionType
) =>
  mainStore.issuenumbers.forEach((issuenumber) =>
    mainStore.addContributor({
      issuenumber,
      contributionType,
      user,
    })
  );
const hasAtLeastOneUser = (contributionType: ContributionType) =>
  Object.values(mainStore.contributors).every(
    (contributionsForIssue) => contributionsForIssue[contributionType]?.length
  );
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
</style>
