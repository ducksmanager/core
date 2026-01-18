<template>
  <div>
    {{
      $t(
        "Cette page vous permet de trouver près de chez vous des bouquineries qui proposent fréquemment des magazines Disney.",
      )
    }}
    <br /><br />
    <div v-if="!bookstores">
      {{ $t("Chargement...") }}
    </div>
    <div v-else id="map">
      <mapbox-map
        :access-token="accessToken"
        map-style="mapbox://styles/mapbox/light-v10"
        :center="mapCenter"
        :zoom="4"
        @loaded="loaded = true"
      >
        <template v-if="loaded">
          <mapbox-marker
            v-for="currentBookstore in bookstores"
            :key="currentBookstore.id"
            :lng-lat="[currentBookstore.coordY, currentBookstore.coordX]"
            anchor="bottom"
            :color="
              currentBookstore.reportedAsClosed
                ? 'grey'
                : openedPopupId === currentBookstore.id
                  ? 'red'
                  : 'blue'
            "
            :offset="[0, 6]"
          >
            <mapbox-popup
              anchor="top"
              @open="openedPopupId = currentBookstore.id"
              @close="
                openedPopupId = undefined;
                existingBookstore = undefined;
              "
            >
              <div :class="{ 'striped-bg': currentBookstore.reportedAsClosed }">
                <b-alert
                  v-if="currentBookstore.reportedAsClosed"
                  variant="warning"
                  :model-value="true"
                >
                  {{ $t("Cette bouquinerie est fermée.") }}
                </b-alert>
                <h2>{{ decodeText(currentBookstore.name) }}</h2>
                <div>
                  <p class="text-secondary">
                    {{ decodeText(currentBookstore.address) }}
                  </p>
                  <div
                    v-for="{
                      userId,
                      creationDate,
                      ...comment
                    } in currentBookstore.comments.filter(
                      ({ creationDate }) => creationDate,
                    )"
                    :key="`bookstore-${currentBookstore.id}-comment-${creationDate}`"
                    class="mb-2"
                  >
                    <b v-if="userId && userStats[userId]">{{
                      userStats[userId].username
                    }}</b>
                    <span v-else>{{ $t("Un visiteur anonyme") }}</span
                    >&nbsp;<i>{{ formatDate(creationDate) }}</i>
                    <blockquote class="px-3 clearfix">
                      {{ decodeText(comment.comment) }}
                      <BookstoreRatings dark :model-value="comment" readonly />
                    </blockquote>
                    <hr />
                  </div>
                  <template v-if="!currentBookstore.reportedAsClosed">
                    <b-alert
                      v-if="existingBookstoreSent"
                      variant="success"
                      :model-value="true"
                    >
                      {{ $t("Un e-mail vient d'être envoyé au webmaster.") }}
                      {{
                        $t(
                          "Si votre commentaire est valide, il sera ajouté sur le site très prochainement.",
                        )
                      }}
                      {{ $t("Merci pour votre contribution !") }}
                    </b-alert>
                    <b-alert
                      v-else-if="closedBookstoreReportedSent"
                      variant="success"
                      :model-value="true"
                    >
                      {{ $t("Un e-mail vient d'être envoyé au webmaster.") }}
                      {{ $t("Une vérification sera effectuée prochainement.") }}
                      {{ $t("Merci pour votre contribution !") }}
                    </b-alert>
                    <form
                      v-else-if="existingBookstore?.id === currentBookstore.id"
                      class="mb-2"
                      @submit.prevent="suggestComment(currentBookstore)"
                    >
                      <ReuseTemplate dark />
                      <b-row class="mt-4 d-flex flex-row">
                        <b-col cols="6" class="d-flex justify-content-center">
                          <b-button type="submit" variant="primary">
                            {{ $t("Ajouter un commentaire") }}
                          </b-button>
                        </b-col>
                        <b-col cols="6" class="d-flex justify-content-center">
                          <b-button
                            variant="danger"
                            @click="existingBookstore = undefined"
                          >
                            {{ $t("Annuler") }}
                          </b-button>
                        </b-col>
                      </b-row>
                    </form>
                    <b-row v-else>
                      <b-col cols="6" class="d-flex justify-content-center">
                        <b-button
                          v-if="
                            !user ||
                            isAllowedToCreateBookstoreComment(
                              user.id,
                              currentBookstore,
                            )
                          "
                          @click="
                            initCommentOnExistingBookstore(currentBookstore)
                          "
                        >
                          {{ $t("Ajouter un commentaire") }}
                        </b-button>
                        <span
                          v-else
                          v-b-tooltip="
                            'Vous ne pouvez pas ajouter un commentaire sur cette bouquinerie car vous avez déjà ajouté un commentaire il y a moins de 6 mois.'
                          "
                        >
                          <b-button disabled>
                            {{ $t("Ajouter un commentaire") }}
                          </b-button>
                        </span>
                      </b-col>
                      <b-col cols="6" class="d-flex justify-content-center">
                        <b-button
                          variant="warning"
                          @click="reportBookstoreAsClosed(currentBookstore.id)"
                        >
                          {{ $t("Indiquer comme fermée") }}
                        </b-button>
                      </b-col>
                    </b-row>
                  </template>
                </div>
              </div>
            </mapbox-popup>
          </mapbox-marker></template
        >
      </mapbox-map>
    </div>
    <br />
    <br />
    <b-row>
      <b-col cols="6">
        <h2>
          {{ $t("Proposer une bouquinerie") }}
        </h2>
        <b-alert variant="info" :model-value="true">
          <div>
            {{
              $t(
                "Vous connaissez une bouquinerie sympa ? Faites-en profiter d'autres collectionneurs !",
              )
            }}
          </div>
          <div>
            {{
              $t(
                "Entrez ci-dessous les informations sur la bouquinerie que vous connaissez, puis entrez des exemples de prix de magazines.",
              )
            }}
          </div>
          <div>
            {{
              $t(
                "Nous comptons sur votre honnêteté concernant les prix si vous en mentionnez.",
              )
            }}
          </div>
          <div>
            {{
              $t(
                "Vérifiez que la bouquinerie n'existe pas déjà sur la carte. Si c'est le cas, ajoutez un commentaire à la bouquinerie.",
              )
            }}
          </div>
        </b-alert>
        <b-alert
          v-if="newBookstoreSent"
          variant="success"
          :model-value="true"
          class="mt-2"
        >
          {{ $t("Un e-mail vient d'être envoyé au webmaster.") }}
          {{
            $t(
              "Si votre bouquinerie est valide, elle sera ajoutée sur le site très prochainement.",
            )
          }}
          {{ $t("Merci pour votre contribution !") }}
        </b-alert>
        <form v-else @submit.prevent="suggestComment(newBookstore)">
          <input v-model="newBookstore.coordX" type="hidden" />
          <input v-model="newBookstore.coordY" type="hidden" />
          <b-form-input
            v-model="newBookstore.name"
            required
            maxlength="25"
            type="text"
            :placeholder="$t('Nom de la bouquinerie')"
          />

          <div id="address" class="mb-2" />
          <DefineTemplate v-slot="{ dark }">
            <b-form-textarea
              v-model="newComment.comment"
              required
              cols="41"
              rows="5"
              minlength="50"
              maxlength="1000"
              type="text"
              :placeholder="$t('Commentaires')"
            />
            <b-table-simple hover responsive class="mt-2"
              ><b-tbody>
                <BookstoreRatings
                  :dark="dark"
                  :model-value="newComment"
                  :readonly="false"
                />
              </b-tbody>
            </b-table-simple>
          </DefineTemplate>
          <ReuseTemplate :dark="false" />
          <b-button type="submit">
            {{ $t("Ajouter la bouquinerie") }}
          </b-button>
        </form>
      </b-col>
    </b-row>
  </div>
</template>

<script setup lang="ts">
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import { MapboxMap, MapboxMarker, MapboxPopup } from "vue-mapbox-ts";
import type {
  NewBookstore,
  NewComment,
  SimpleBookstore,
} from "~dm-types/SimpleBookstore";
import { socketInjectionKey } from "../composables/useDmSocket";
import { isAllowedToCreateBookstoreComment } from "~dm-services/bookstores/util";
import type { EventOutput } from "socket-call-client";
import type { ClientEvents as BookstoreServices } from "~dm-services/bookstores";
import { createReusableTemplate } from "@vueuse/core";

const [DefineTemplate, ReuseTemplate] = createReusableTemplate({
  props: {
    dark: Boolean,
  },
});

const { bookstore: bookstoreEvents } = inject(socketInjectionKey)!;

const { fetchStats } = users();
const { stats: userStats } = storeToRefs(users());
const { user } = storeToRefs(collection());

let bookstores =
  $shallowRef<EventOutput<BookstoreServices, "getActiveBookstores">>();
let existingBookstore = $ref<SimpleBookstore>();
let newBookstoreSent = $ref(false);
let existingBookstoreSent = $ref(false);
let closedBookstoreReportedSent = $ref(false);

const route = useRoute();
const openedPopupId = $ref<number | undefined>(
  route.query.id ? parseInt(route.query.id as string) : undefined,
);

const { t: $t } = useI18n();
let loaded = $ref(false);

const newBookstoreDefaults = {
  name: "",
  address: "",
  coordX: 0,
  coordY: 0,
} as const;

const newCommentDefaults = {
  comment: "",
  atmosphereRating: 5,
  pricesRating: 5,
  selectionRating: 5,
} as const;

const newBookstore = $ref<NewBookstore>(newBookstoreDefaults);
const newComment = $ref<NewComment>(newCommentDefaults);

const accessToken =
  "pk.eyJ1IjoiYnBlcmVsIiwiYSI6ImNqbmhubHVrdDBlZ20zcG8zYnQydmZwMnkifQ.suaRi8ln1w_DDDlTlQH0vQ";
const mapCenter = [1.73584, 46.754917];

const bookstoreCommentsUserIds = $computed(
  () =>
    bookstores?.reduce<number[]>(
      (acc, bookstore: SimpleBookstore) => [
        ...new Set([
          ...acc,
          ...bookstore.comments
            .map(({ userId }) => userId)
            .filter((userId): userId is number => userId !== null),
        ]),
      ],
      [],
    ) || null,
);

const decodeText = (value: string) => {
  try {
    return decodeURIComponent(escape(value));
  } catch (_e) {
    return value;
  }
};
const fetchBookstores = async () => {
  bookstores = await bookstoreEvents.getActiveBookstores();
};
const suggestComment = async (bookstore: NewBookstore | SimpleBookstore) => {
  if (!bookstore.coordX) {
    window.alert(
      $t(
        'Vous devez sélectionner une adresse dans la liste lorsque vous l\'entrez dans le champ "Adresse"',
      ),
    );
    return false;
  }
  await bookstoreEvents.createBookstoreComment(bookstore, newComment);
  if ("id" in bookstore) {
    existingBookstoreSent = true;
    existingBookstore = undefined;
    setTimeout(() => {
      existingBookstoreSent = false;
    }, 10000);
  } else {
    newBookstoreSent = true;
  }
};
const formatDate = (date: string | Date | null) =>
  date === null
    ? $t("il y a longtemps")
    : $t("le {date}", {
        date: (typeof date === "string"
          ? new Date(date)
          : date
        ).toLocaleDateString(),
      });

const initCommentOnExistingBookstore = (bookstore: SimpleBookstore) => {
  existingBookstore = bookstore;
  if (!existingBookstore.comments.some(({ comment }) => !comment)) {
    existingBookstore.comments.push({
      comment: "",
      creationDate: null,
      userId: null,
    });
  }
};
const reportBookstoreAsClosed = async (bookstoreId: number) => {
  if (
    window.confirm(
      $t("Voulez-vous vraiment indiquer cette bouquinerie comme fermée ?"),
    )
  ) {
    await bookstoreEvents.reportBookstoreAsClosed(bookstoreId);
    closedBookstoreReportedSent = true;
    setTimeout(() => {
      closedBookstoreReportedSent = false;
    }, 10000);
  }
};
watch(
  $$(bookstoreCommentsUserIds),
  async (value) => {
    if (value) {
      await fetchStats(value);
    }
  },
  { immediate: true },
);

const geocoder = new MapboxGeocoder({
  accessToken,
  placeholder: $t("Adresse"),
  types: "address",
  proximity: { latitude: 46.754917, longitude: 1.73584 },
  enableEventLogging: false,
});

onMounted(async () => {
  await fetchBookstores();
  geocoder.addTo("#address");
  let element = window.document.querySelector(".mapboxgl-ctrl-geocoder--input");
  if (element) {
    element.setAttribute("required", "true");
  }
  geocoder.on("result", ({ result: { place_name, center } }) => {
    newBookstore.address = place_name;
    [newBookstore.coordY, newBookstore.coordX] = center;
  });
});
</script>

<style lang="scss">
.striped-bg {
  background-image: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 10px,
    rgba(0, 0, 0, 0.05) 10px,
    rgba(0, 0, 0, 0.05) 20px
  );
}

#map {
  height: 500px;

  .mapboxgl-marker {
    cursor: pointer;
  }

  .mapboxgl-popup-content {
    padding: 0;
    color: black;

    > div > div {
      padding: 10px 10px 15px;
    }
  }
}

#address {
  z-index: 1;
  width: 100%;
  text-align: left;
  top: 20px;

  svg {
    display: none;
  }

  .mapboxgl-ctrl-geocoder {
    min-width: 100%;

    .mapboxgl-ctrl-geocoder--input {
      width: 100%;
      height: initial;
      padding: 0.375rem 0.75rem;
      font-size: 1rem;
    }

    .suggestions-wrapper {
      position: absolute;
      width: 100%;
      margin-top: -5px;

      ul.suggestions {
        list-style-type: none;

        li {
          background: #ddd;
          color: black;
          padding: 5px;
          border: 1px solid white;
          min-width: 250px;
          cursor: pointer;
        }
      }
    }

    .mapboxgl-ctrl-geocoder--pin-right {
      display: none;
    }
  }
}
</style>
