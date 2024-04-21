<template>
  <nav
    v-if="countryNames && hasPublicationNames"
    id="publication-list"
    class="navbar navbar-expand-lg navbar-dark bg-dark flex-row justify-content-between"
  >
    <div class="d-flex flex-row align-items-center">
      <button
        v-b-toggle="'nav-publications'"
        class="navbar-toggler"
        type="button"
      >
        <span class="navbar-toggler-icon" />
      </button>
      <a class="navbar-brand" :href="publicationUrlRoot">
        {{ title }}
      </a>
      <b-collapse id="nav-publications" visible>
        <b-navbar-nav>
          <li
            v-for="country in sortedCountries"
            :key="country"
            class="nav-item dropdown"
          >
            <b-dropdown variant="outline-light">
              <template #button-content
                ><Country
                  :country="country"
                  :country-name="countryNames[country]"
              /></template>
              <b-dropdown-item
                v-for="publicationcode in getSortedPublications(country)"
                :key="publicationcode"
              >
                <router-link
                  class="dropdown-item"
                  :to="`${publicationUrlRoot}/${publicationcode}`"
                >
                  {{
                    publicationNames[publicationcode] ||
                    publicationcode.split("/")[1]
                  }}
                </router-link></b-dropdown-item
              ></b-dropdown
            >
          </li>
          <li v-if="!isPublic" class="nav-item">
            <router-link class="nav-link" :to="'/collection/show/new'">{{
              $t("Nouveau magazine")
            }}</router-link>
          </li>
        </b-navbar-nav>
      </b-collapse>
    </div>
  </nav>
  <div v-else>
    {{ $t("Chargement...") }}
  </div>
  <div class="navbar-nav">
    <form class="d-flex justify-content-end">
      <StorySearch :with-title="false" :is-public="isPublic" />
    </form>
  </div>
</template>

<script setup lang="ts">
import { watch } from "vue";
const { t: $t } = useI18n();

const { isPublic } = defineProps<{
  isPublic?: boolean;
}>();

const route = useRoute();

const username = $computed(() => route.params.username as string);

const { totalPerCountry, totalPerPublication, publicationUrlRoot } =
  storeToRefs(isPublic ? publicCollection() : collection());
const { fetchCountryNames, fetchPublicationNames } = coa();
const { countryNames, publicationNames } = storeToRefs(coa());

const title = $computed(() =>
  isPublic ? $t("Collection de {username}", { username }) : $t("Collection"),
);

let hasPublicationNames = $ref(false as boolean);
const sortedCountries = $computed(
  () =>
    totalPerCountry.value &&
    countryNames.value &&
    Object.keys(totalPerCountry.value).sort(
      (countryCode1, countryCode2) =>
        countryNames.value?.[countryCode1]?.localeCompare(
          countryNames.value?.[countryCode2],
        ) || 0,
    ),
);
const publicationsPerCountry = $computed(
  () =>
    totalPerCountry.value &&
    hasPublicationNames &&
    Object.keys(totalPerCountry.value).reduce(
      (acc, country) => ({
        ...acc,
        [country]: Object.keys(totalPerPublication.value!).filter(
          (publicationcode) => publicationcode.split("/")[0] === country,
        ),
      }),
      {} as { [key: string]: string[] },
    ),
);
const getSortedPublications = (country: string) =>
  publicationsPerCountry?.[country]?.sort((a, b) =>
    (publicationNames.value?.[a] || "").localeCompare(
      publicationNames.value?.[b] || "",
    ),
  ) || [];

watch(
  totalPerPublication,
  async (newValue) => {
    if (newValue) {
      await fetchPublicationNames(Object.keys(newValue));
      hasPublicationNames = true;
    }
  },
  { immediate: true },
);

fetchCountryNames();
</script>

<style scoped lang="scss">
:deep(button.dropdown-toggle) {
  border: 0;
}
.navbar {
  padding: 0.5rem 1rem;

  &#publication-list {
    margin-bottom: 20px;
  }

  .navbar-toggler {
    margin-right: 1rem;
  }

  .navbar-nav {
    flex-wrap: wrap;

    @media (max-width: 992px) {
      width: 100%;
      align-items: end;

      :deep(.collapse) {
        display: initial;

        .navbar-nav {
          align-items: initial !important;
        }
      }
    }

    :deep(ul) {
      max-height: calc(100vh - 100px);
      z-index: 1030;
      overflow-y: auto;
    }
  }

  a {
    border: none;
  }
}
</style>
