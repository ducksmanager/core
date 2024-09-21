<template>
  <ion-menu :max-edge-start="50" content-id="main-content" type="overlay">
    <ion-content class="ion-padding-top">
      <ion-list id="header" class="ion-no-padding">
        <ion-list-header
          ><div class="ion-text-center" style="width: 100%">{{ t('What The Duck') }}</div></ion-list-header
        >
        <template v-if="user">
          <ion-row class="ion-justify-content-center ion-padding"
            ><ion-note class="ion-no-padding">{{ user.username }}</ion-note>
          </ion-row>
          <ion-row class="ion-padding-vertical">
            <Medal
              v-for="(numberOfPoints, contribution) in points[user.id] || {}"
              :key="contribution"
              :contribution="contribution"
              :user-level-points="numberOfPoints"
            />
          </ion-row>
          <ion-menu-toggle v-for="p in appPages" :key="p.url" :auto-hide="false">
            <ion-item
              router-direction="root"
              :router-link="p.url"
              :disabled="p.isDisabled && isOffline"
              lines="none"
              :detail="false"
              :class="{ selected: p.url.indexOf(route.path) === 0 }"
            >
              <ion-icon slot="start" aria-hidden="true" :ios="p.iosIcon" :md="p.mdIcon" />
              <ion-label>{{ p.title }}</ion-label>
              <ion-chip slot="end" v-if="p.chip" outline>{{ p.chip }}</ion-chip>
            </ion-item>
          </ion-menu-toggle>
        </template>
      </ion-list>
      <ion-list id="footer">
        <ion-menu-toggle v-for="p in appFooterPages" :key="p.url" :auto-hide="false">
          <ion-item
            router-direction="root"
            :disabled="p.disabledOnOfflineMode && isOffline"
            :router-link="p.url"
            lines="none"
            :detail="false"
            :class="{ selected: route.path === p.url }"
            @click="router.push(p.url)"
          >
            <ion-icon slot="start" aria-hidden="true" :ios="p.iosIcon" :md="p.mdIcon" />
            <ion-label>{{ p.title }}</ion-label>
          </ion-item>
        </ion-menu-toggle>
      </ion-list>
    </ion-content>
  </ion-menu>
</template>
<script setup lang="ts">
import {
  listOutline,
  listSharp,
  searchOutline,
  searchSharp,
  starOutline,
  starSharp,
  statsChartOutline,
  statsChartSharp,
  flameOutline,
  flameSharp,
  warningOutline,
  warningSharp,
  logOutOutline,
  logOutSharp,
  helpOutline,
  helpSharp,
} from 'ionicons/icons';
import { stores as webStores } from '~web';

import { app } from '~/stores/app';
import { wtdcollection } from '~/stores/wtdcollection';

const { t } = useI18n();
const { token, isOffline } = storeToRefs(app());
const collectionStore = wtdcollection();
const points = computed(() => webStores.users().points);

interface AppPage {
  title: string;
  url: string;
  disabledOnOfflineMode?: boolean;
  iosIcon: string;
  mdIcon: string;
  chip?: number;
}

const mapIsDisabled = (page: AppPage) => ({
  ...page,
  isDisabled: routes.find(({ path }) => path === page.url)?.meta.onOffline === 'unavailable',
});

const routes = useRouter().getRoutes();

const appPages = computed(() =>
  [
    {
      title: t('Rechercher une histoire'),
      url: '/search',
      iosIcon: searchOutline,
      mdIcon: searchSharp,
    },
    {
      title: t('Ma collection'),
      url: '/collection#',
      iosIcon: listOutline,
      mdIcon: listSharp,
      chip: collectionStore.total,
    },
    {
      title: t('Mes auteurs favoris'),
      url: '/authors',
      iosIcon: starOutline,
      mdIcon: starSharp,
    },
    {
      title: t('Mes suggestions'),
      url: '/suggestions',
      iosIcon: flameOutline,
      mdIcon: flameSharp,
    },
    {
      title: t('Statistiques'),
      url: '/stats',
      iosIcon: statsChartOutline,
      mdIcon: statsChartSharp,
    },
    {
      title: t('A propos'),
      url: '/about',
      iosIcon: helpOutline,
      mdIcon: helpSharp,
    },
  ].map(mapIsDisabled),
);

const router = useRouter();
const route = useRoute();

router.beforeEach((to) => {
  if (to.path === '/login') {
    token.value = null;
  }
});

const appFooterPages = computed(() =>
  [
    {
      iosIcon: warningOutline,
      mdIcon: warningSharp,
      title: t('Signaler un problème'),
      url: '/report',
    },
    ...(token.value
      ? [
          {
            iosIcon: logOutOutline,
            mdIcon: logOutSharp,
            title: t('Déconnexion'),
            url: '/login',
          },
        ]
      : []),
  ].map(mapIsDisabled),
);

const { user } = storeToRefs(collectionStore);
</script>
<style scoped lang="scss">
ion-menu {
  ion-content {
    --background: var(--ion-item-background, var(--ion-background-color, #fff));

    &::part(scroll) {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      bottom: 0;
      padding-bottom: 0;
    }
  }

  &.md {
    ::part(open) {
      color: red;
    }
    ion-content {
      --padding-start: 8px;
      --padding-end: 8px;
    }

    ion-list-header,
    ion-note {
      padding-left: 10px;
    }

    ion-list#header {
      display: flex;
      flex-direction: column;

      ion-list-header {
        font-size: 22px;
        font-weight: 600;

        min-height: 20px;
      }
    }

    ion-list#labels-list ion-list-header {
      font-size: 16px;

      margin-bottom: 18px;

      color: #757575;

      min-height: 26px;
    }

    ion-list#footer {
      border-top: 1px solid var(--ion-color-step-150, #d7d8da);
    }

    ion-item {
      --padding-start: 10px;
      --padding-end: 10px;
      border-radius: 4px;

      &.selected {
        --background: rgba(var(--ion-color-primary-rgb), 0.14);

        ion-icon {
          color: var(--ion-color-primary);
        }

        ion-icon {
          color: #616e7e;
        }
        ion-label {
          font-weight: 500;
        }
      }
    }
    &.ios {
      ion-content {
        --padding-bottom: 20px;
      }

      ion-list {
        padding: 20px 0 0 0;
      }

      ion-note {
        line-height: 24px;
      }

      ion-item {
        --padding-start: 16px;
        --padding-end: 16px;
        --min-height: 50px;

        &.selected ion-icon {
          color: var(--ion-color-primary);
        }

        ion-icon {
          font-size: 24px;
          color: #73849a;
        }

        ion-list#labels-list ion-list-header {
          margin-bottom: 8px;
        }

        ion-list-header,
        ion-note {
          padding-left: 16px;
          padding-right: 16px;
        }

        ion-note {
          margin-bottom: 8px;
        }
      }
    }
  }
}

ion-note {
  display: inline-block;
  font-size: 16px;

  color: var(--ion-color-medium-shade);
}

ion-item.selected {
  --color: var(--ion-color-primary);
}
</style>
