<template>
  <div
    v-if="isAnonymous === true"
    class="d-flex align-items-center flex-column"
  >
    <b-alert show variant="warning" class="text-center">
      Vous pouvez seulement choisir un avatar si vous êtes connecté(e).<br />
      {{
        t(
          "Log in on DucksManager then refresh this page to be able to choose your avatar :-)"
        )
      }}
    </b-alert>
  </div>
  <div v-else class="d-flex justify-content-center flex-column text-center">
    <h3>{{ t("Medals") }}</h3>
    <template v-if="currentUserStats">
      <medal-list v-if="hasMedals" with-details :cols="12" />
      <b-row v-else class="justify-content-center">
        <b-col cols="9" class="d-flex justify-content-center">
          <b-alert show variant="info">
            {{
              t(
                "You haven't earned medals yet. Play Duckguessr to unlock medals!"
              )
            }}
          </b-alert>
        </b-col>
      </b-row>
    </template>
    <h3 class="mt-2">{{ t("Avatar") }}</h3>
    <b-row class="justify-content-center">
      <b-col cols="9" class="d-flex justify-content-center">
        <b-alert show variant="info" class="text-center">
          <div>
            {{
              t(
                "Choose an avatar among the characters of the Donald Duck family tree."
              )
            }}
          </div>
          <div>
            {{
              t("Some avatars can be unlocked by earning Duckguessr medals.")
            }}
          </div>
        </b-alert>
      </b-col>
    </b-row>
    <b-row class="justify-content-center">
      <b-col cols="9" class="justify-content-center px-0">
        <img
          ref="tree"
          src="/Donald_Duck_Family_Tree.webp"
          @mousemove="onMouseMove"
          @load="onTreeLoad"
        />
        <div
          v-if="currentAvatar?.localPosition"
          class="position-absolute avatar selected"
          :style="{
            left: `${currentAvatar.localPosition[0]}px`,
            top: `${currentAvatar.localPosition[1]}px`,
            width: `${avatarSize}px`,
            height: `${avatarSize}px`,
          }"
        />
        <div
          v-if="closestAvatar?.localPosition"
          class="position-absolute avatar"
          :style="{
            left: `${closestAvatar.localPosition[0]}px`,
            top: `${closestAvatar.localPosition[1]}px`,
            width: `${avatarSize}px`,
            height: `${avatarSize}px`,
          }"
          @click="onSelectAvatar"
        />
      </b-col>
    </b-row>
  </div>
</template>

<script lang="ts" setup>
import { Avatar } from "~types/avatar";
import { userStore } from "~/stores/user";
const { t } = useI18n();

const isAnonymous = computed(() => userStore().isAnonymous);

import { avatars, avatarDiskDiameter } from "~types/avatar.ts";
const tree = ref(null as any | null);

const treeImageNaturalWidth = ref(null as number | null);

interface AvatarWithLocalPosition extends Avatar {
  localPosition: number[] | null;
}

const currentUserStats = computed(() => userStore().stats);
const hasMedals = computed(
  () =>
    currentUserStats.value &&
    Object.values(currentUserStats.value).filter(({ points }) => points > 0)
      .length
);

const treeImageRatio = computed(
  () => treeImageNaturalWidth.value! / tree.value!.width
);

const currentAvatar = ref(null as AvatarWithLocalPosition | null);
const closestAvatar = ref(null as AvatarWithLocalPosition | null);
const avatarSize = ref(null as number | null);

const resizeAvatars = () => {
  avatarSize.value = avatarDiskDiameter / treeImageRatio.value;
};

const calculateLocalPosition = (avatar: Avatar) =>
  avatar.position.map(
    (coordinate) => coordinate / treeImageRatio.value - avatarSize.value! / 2
  );

watch(
  () => userStore().user?.avatar,
  (avatarName) => {
    const avatar = avatars.find(
      ({ character }: Avatar) => character === avatarName
    )!;
    if (avatar) {
      resizeAvatars();
      currentAvatar.value = {
        ...avatar,
        localPosition: calculateLocalPosition(avatar),
      };
    }
  }
);

const onMouseMove = ({ clientX, clientY, target }: any) => {
  const rect = target.getBoundingClientRect();
  const position = [clientX - rect.left, clientY - rect.top];
  const positionUsingNaturalDimensions = position.map(
    (coordinate) => coordinate * (treeImageNaturalWidth.value! / rect.width)
  );

  const avatar =
    avatars.find(
      ({ position: characterCoordinates }: Avatar) =>
        Math.sqrt(
          Math.pow(
            positionUsingNaturalDimensions[0] - characterCoordinates[0],
            2
          ) +
            Math.pow(
              positionUsingNaturalDimensions[1] - characterCoordinates[1],
              2
            )
        ) <
        avatarDiskDiameter / 2
    ) || null;

  if (avatar) {
    resizeAvatars();
    closestAvatar.value = {
      ...avatar,
      localPosition: calculateLocalPosition(avatar),
    };
  }
};

const onTreeLoad = (event: any) => {
  if (event) {
    treeImageNaturalWidth.value = event.target.naturalWidth;
  }
};

const onSelectAvatar = () => {
  userStore().user!.avatar = closestAvatar.value!.character;
  userStore().loginSocket!.emit(
    "updateUser",
    userStore().user!,
    (updatedUser) => {
      userStore().user = updatedUser;
    }
  );
};
</script>

<style scoped lang="scss">
img {
  width: 100%;
}

.avatar {
  border-radius: 100%;
  outline: 0.5vw solid lightgrey;
  cursor: pointer;

  &.selected {
    outline: 0.5vw solid darkgrey;
  }
}
</style>
