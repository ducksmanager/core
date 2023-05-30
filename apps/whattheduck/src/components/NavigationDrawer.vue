<template>
  <ion-menu content-id="main-content" type="overlay">
    <ion-content>
      <ion-list id="header">
        <ion-list-header>{{ t('app_name') }}</ion-list-header>
        <template v-if="user">
          <ion-row> Medals </ion-row>
          <ion-note>{{ user.username }}</ion-note>
          <ion-menu-toggle :auto-hide="false" v-for="(p, i) in appPages" :key="i">
            <ion-item
              @click="selectedIndex = i"
              router-direction="root"
              :router-link="p.url"
              lines="none"
              :detail="false"
              :class="{ selected: selectedIndex === i }"
            >
              <ion-icon aria-hidden="true" slot="start" :ios="p.iosIcon" :md="p.mdIcon"></ion-icon>
              <ion-label>{{ p.title }}</ion-label>
            </ion-item>
          </ion-menu-toggle></template
        >
      </ion-list>
      <ion-list id="footer">
        <ion-menu-toggle :auto-hide="false" v-for="(p, i) in appFooterPages" :key="i">
          <ion-item
            @click="selectedIndex = i"
            router-direction="root"
            :router-link="p.url"
            lines="full"
            :detail="false"
          >
            <ion-label>{{ p.title }}</ion-label>
          </ion-item>
        </ion-menu-toggle>
      </ion-list>
    </ion-content>
  </ion-menu>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue';
import { listOutline, listSharp, searchOutline, searchSharp } from 'ionicons/icons';
import { collection } from '~/stores/collection';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const collectionStore = collection();

const selectedIndex = ref(0);
const appPages = [
  {
    title: t('search'),
    url: '/search',
    iosIcon: searchOutline,
    mdIcon: searchSharp,
  },
  {
    title: t('my_collection'),
    url: '/collection',
    iosIcon: listOutline,
    mdIcon: listSharp,
  },
];

const path = window.location.pathname;
if (path !== undefined) {
  selectedIndex.value = appPages.findIndex((page) => page.url.toLowerCase() === path.toLowerCase());
}
const appFooterPages = [
  {
    title: t('report'),
    url: '/Report',
  },
  {
    title: t('logout'),
    url: '/Logout',
  },
];

const user = computed(() => collectionStore.user);
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
    ion-content {
      --padding-start: 8px;
      --padding-end: 8px;
      --padding-top: 20px;
      --padding-bottom: 20px;
    }

    ion-list:first-child {
      padding: 20px 0;
    }

    ion-note {
      margin-bottom: 30px;
    }

    ion-list-header,
    ion-note {
      padding-left: 10px;
    }

    ion-list#header {
      border-bottom: 1px solid var(--ion-color-step-150, #d7d8da);

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
        margin-bottom: 20px;
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
