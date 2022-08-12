<template>
  <v-contextmenu-group>
    <li class="header">
      {{
        $tc(
          "{count} numéro sélectionné|{count} numéros sélectionnés",
          selectedIssues.length,
        )
      }}
    </li>
    <BAlert
      v-if="!editingCopies.length"
      class="text-center m-0"
      show
      variant="danger"
    >
      {{
        $t("Vous allez retirer tous les exemplaires\ndes numéros sélectionnés")
      }}
    </BAlert>
    <BAlert
      v-if="copies.length && !isSingleIssueSelected"
      class="text-center m-0"
      show
      variant="warning"
    >
      {{
        $t(
          "Vous possédez certains numéros sélectionnés\nen plusieurs exemplaires.\nSeul le premier exemplaire sera modifié.",
        )
      }}
    </BAlert>
    <BAlert
      v-if="!selectedIssues.length"
      class="text-center m-0"
      show
      variant="warning"
    >
      {{
        $t(
          "Sélectionnez un ou plusieurs numéros dans la liste\npour les ajouter, modifier ou supprimer de votre collection.",
        )
      }}
    </BAlert>
    <template v-else>
      <BTabs
        v-model="currentCopyIndex"
        nav-class="copies-tabs"
        @changed="
          (newTabs) => {
            currentCopyIndex = newTabs.length - 1;
          }
        "
      >
        <BTab
          v-for="(copy, copyIndex) in editingCopies"
          :key="`copy-${copyIndex}`"
        >
          <template #title>
            {{ $t("Exemplaire") }} {{ copyIndex + 1 }}
            <BIconTrash
              @click.stop.prevent="editingCopies.splice(copyIndex, 1)"
            />
          </template>
          <v-contextmenu-group :title="$t('Etat')">
            <v-contextmenu-item
              v-for="(text, id) in conditionStates"
              :key="`condition-${id}`"
              :hide-on-click="false"
              class="clickable" :class="{ selected: copy.condition === id }"
              @click="copy.condition = id"
            >
              <Condition :value="id" />&nbsp;{{ text }}
            </v-contextmenu-item>
            <v-contextmenu-divider v-show="copy.condition !== 'missing'" />
          </v-contextmenu-group>
          <v-contextmenu-group
            v-show="copy.condition !== 'missing'"
            :title="$t('Pile de lecture')"
          >
            <v-contextmenu-item
              v-for="(toReadStateText, toReadStateId) in toReadStates"
              :key="`copy-${copyIndex}-to-read-state-${toReadStateId}`"
              :hide-on-click="false"
              class="clickable read-state" :class="{
                selected: String(copy.isToRead) === toReadStateId,
                [toReadStateId]: true,
              }"
              @click="
                copy.isToRead
                  = toReadStateId === 'do_not_change'
                    ? null
                    : toReadStateId === 'true'
              "
            >
              <BIconBookmarkCheck v-if="toReadStateId === 'true'" />
              <BIconBookmarkX v-if="toReadStateId === 'false'" />
              {{ toReadStateText }}
            </v-contextmenu-item>
            <v-contextmenu-divider v-show="copy.condition !== 'missing'" />
          </v-contextmenu-group>
          <v-contextmenu-group
            v-show="copy.condition !== 'missing'"
            :title="$t('Date d\'achat')"
          >
            <template
              v-for="(purchaseStateText, purchaseStateId) in purchaseStates"
              :key="`copy-${copyIndex}-purchase-state-${purchaseStateId}`"
            >
              <v-contextmenu-item
                v-if="purchaseStateId !== 'link'"
                :hide-on-click="false"
                class="clickable purchase-state" :class="{
                  'selected': copy.purchaseId === purchaseStateId,
                  'v-context__sub': purchaseStateId === 'link',
                  [purchaseStateId]: true,
                }"
                @click="copy.purchaseId = purchaseStateId"
              >
                <BIconCalendarX v-if="purchaseStateId === 'unlink'" />
                {{ purchaseStateText }}
              </v-contextmenu-item>
              <v-contextmenu-submenu
                v-else
                :title="$t(`Date d'achat`)"
                @mouseleave.prevent="() => {}"
              >
                <template #title>
                  <BIconCalendar v-if="purchaseStateId === 'link'" />
                  {{ purchaseStateText }}
                </template>
                <v-contextmenu-group :title="$t('Date d\'achat')">
                  <v-contextmenu-item
                    v-if="!copy.newPurchaseContext"
                    :hide-on-click="false"
                    class="clickable"
                    @click.stop="
                      copy.newPurchaseContext = !copy.newPurchaseContext;
                      copy.newPurchaseDate = today;
                    "
                  >
                    <b>{{ $t("Nouvelle date d'achat...") }}</b>
                  </v-contextmenu-item>
                  <v-contextmenu-item
                    v-else
                    class="purchase-date"
                    @click.stop="() => {}"
                  >
                    <b-form-input
                      v-model="copy.newPurchaseDate"
                      type="text"
                      lazy-formatter
                      :formatter="formatDate"
                      pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}"
                      required
                      class="form-control date px-0"
                      maxlength="10"
                      :placeholder="$t(`Date d'achat`)"
                      @click.stop="() => {}"
                    />
                    <input
                      v-model="copy.newPurchaseDescription"
                      required
                      type="text"
                      class="form-control text-center"
                      maxlength="30"
                      :placeholder="$t('Description')"
                      @click.stop="() => {}"
                    >
                    <b-button
                      variant="success"
                      class="btn-sm"
                      @click.stop="
                        $emit('create-purchase', {
                          date: copy.newPurchaseDate,
                          description: copy.newPurchaseDescription,
                        });
                        copy.newPurchaseDescription = '';
                        copy.newPurchaseDate = today;
                        copy.newPurchaseContext = false;
                      "
                    >
                      <BIconCheck icon="check" />
                    </b-button>
                    <b-button
                      variant="warning"
                      class="btn-sm"
                      @click.stop="copy.newPurchaseContext = false"
                    >
                      <BIconX icon="x" />
                    </b-button>
                  </v-contextmenu-item>
                  <v-contextmenu-item
                    v-for="{ id: purchaseId, date, description } in purchases"
                    :key="`copy-${copyIndex}-purchase-${purchaseId}`"
                    :hide-on-click="false"
                    class="clickable purchase-date" :class="{
                      selected: copy.purchaseId === purchaseId,
                    }"
                    @click.stop="copy.purchaseId = purchaseId"
                  >
                    <small class="date">{{ date }}</small>
                    <div class="mx-2">
                      {{ description }}
                    </div>
                    <b-button
                      class="delete-purchase btn-sm"
                      :title="$t('Supprimer')"
                      @click="
                        $emit('delete-purchase', {
                          id: purchaseId,
                        })
                      "
                    >
                      <BIconTrash />
                    </b-button>
                  </v-contextmenu-item>
                </v-contextmenu-group>
              </v-contextmenu-submenu>
            </template>
          </v-contextmenu-group>
        </BTab>
        <template v-if="!hasMaxCopies" #tabs-end>
          <BNavItem
            v-if="isSingleIssueSelected || hasNoCopies"
            class="p-0"
            role="presentation"
            @click="editingCopies.push({ ...defaultState })"
          >
            {{ $t("Ajouter un exemplaire") }}
          </BNavItem>
          <BNavItem
            v-else
            class="p-0 disabled text-secondary"
            role="presentation"
            :title="
              $t(
                `Vous pouvez seulement ajouter un exemplaire lorsqu'un seul numéro est sélectionné`,
              )
            "
          >
            {{ $t("Ajouter un exemplaire") }}
          </BNavItem>
        </template>
      </BTabs>
      <li class="footer clickable" @click="updateSelectedIssues">
        {{ $t("Enregistrer les changements") }}
      </li>
    </template>
  </v-contextmenu-group>
</template>

<script setup>
import {
  BIconBookmarkCheck,
  BIconBookmarkX,
  BIconCalendar,
  BIconCalendarX,
  BIconCheck,
  BIconTrash,
  BIconX,
} from 'bootstrap-icons-vue'
import { BAlert, BNavItem, BTab, BTabs } from 'bootstrap-vue-3'
import { watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { collection } from '~/stores/collection'
import { l10n } from '~/stores/l10n'
import { condition } from '~/composables/condition'

const { copies, publicationCode, selectedIssues } = defineProps({
  publicationCode: {
    type: String,
    required: true,
  },
  selectedIssues: {
    type: Array,
    required: true,
  },
  copies: {
    type: Array,
    required: true,
  },
})
const emit = defineEmits([
  'update-issues',
  'create-purchase',
  'delete-purchase',
  'close',
])
const { conditions } = condition()

const defaultState = $ref({
  condition: 'do_not_change',
  isToSell: 'do_not_change',
  purchaseId: 'do_not_change',
  isToRead: 'do_not_change',
})
const today = new Date().toISOString().slice(0, 10)
const { t: $t } = useI18n()
const newPurchaseDescription = $ref('')
const newPurchaseDate = $ref(today)
let editingCopies = $ref([])
const currentCopyIndex = $ref(0)
const purchases = $computed(() => collection().purchases)
const conditionStates = $computed(() => ({
  ...(isSingleIssueSelected
    ? {}
    : {
        do_not_change: $t('Conserver l\'état actuel'),
      }),
  missing: $t('Marquer comme non-possédé(s)'),
  possessed: $t('Marquer comme possédé(s)'),
  bad: $t('Marquer comme en mauvais état'),
  notsogood: $t('Marquer comme en état moyen'),
  good: $t('Marquer comme en bon état'),
}))
const purchaseStates = $computed(() => ({
  ...(isSingleIssueSelected
    ? {}
    : {
        do_not_change: $t('Conserver la date d\'achat'),
      }),
  link: $t('Associer avec une date d\'achat'),
  unlink: $t('Désassocier de la date d\'achat'),
}))
const toReadStates = $computed(() => ({
  ...(isSingleIssueSelected
    ? {}
    : {
        do_not_change: $t('Conserver la pile de lecture'),
      }),
  true: $t('Inclus dans la pile de lecture'),
  false: $t('Exclus de la pile de lecture'),
}))
let isSingleIssueSelected = $computed(() => selectedIssues.length === 1)
const hasNoCopies = $computed(() => !editingCopies.length)
const hasMaxCopies = $computed(() => editingCopies.length >= 3)
const r = l10n().r
const formatDate = value => (/\d{4}-\d{2}-\d{2}/.test(value) ? value : today)
const updateEditingCopies = () => {
  if (selectedIssues.length === 1) {
    if (copies.length)
      editingCopies = JSON.parse(JSON.stringify(copies))
    else
      editingCopies = [{ ...defaultState, condition: 'missing' }]
  }
  else {
    editingCopies = [{ ...defaultState }]
  }
}
const convertConditionToDbValue = condition =>
  (conditions.find(({ value }) => value === condition) || { dbValue: null })
    .dbValue
const updateSelectedIssues = async () => {
  let issueDetails = {
    condition: editingCopies.map(({ condition }) =>
      convertConditionToDbValue(condition),
    ),
    istoread: editingCopies.map(({ isToRead }) => isToRead),
    istosell: editingCopies.map(({ isToSell }) => isToSell),
    purchaseId: editingCopies.map(({ purchaseId }) => purchaseId),
  }
  if (!isSingleIssueSelected) {
    issueDetails = Object.keys(issueDetails).reduce(
      (acc, detailKey) => ({
        ...acc,
        [detailKey]: issueDetails[detailKey][0],
      }),
      {},
    )
  }

  emit('update-issues', {
    publicationCode,
    issueNumbers: selectedIssues,
    ...issueDetails,
  })
}
const createPurchaseDate = async () =>
  emit('create-purchase', {
    date: newPurchaseDate,
    description: newPurchaseDescription,
  })

watch(
  () => selectedIssues,
  () => updateEditingCopies(),
  { immediate: true },
)
watch(
  () => copies,
  () => updateEditingCopies(),
  { immediate: true },
)
</script>

<style lang="scss">
.v-contextmenu-inner {
  &,
  li,
  .v-contextmenu-group__menus {
    padding: 0 !important;
  }

  :deep(.copies-tabs) {
    position: initial;
    display: flex;
    padding-bottom: 0;
    padding-top: 0;
  }

  .nav-item:not(.disabled) .nav-link {
    color: #212529 !important;
    cursor: pointer;
  }

  li {
    &.disabled {
      a {
        background: initial;
        border: initial;
        color: inherit;
        cursor: not-allowed;
      }
    }

    &.clickable:hover {
      background-color: #4f5b69 !important;
      color: #fff;
      cursor: pointer;
    }

    &.header,
    &.clone,
    &.footer {
      height: 30px;
      line-height: 25px;
      font-size: 14px;
      background-color: #3d4b5f;
      color: white;
      padding: 2px;
      font-weight: bold;
      text-align: center;

      &.clone {
        background-color: #308290;
        cursor: pointer;

        &.disabled:hover {
          cursor: default;
        }
      }

      &.footer {
        background-color: green;
        border-top: 3px solid #e6e6e6;
      }
    }

    &.menu-separator {
      color: black;
      font-size: 12px;
      font-weight: bold;
      line-height: 20px;
      text-align: center;
      border: 1px solid #e6e6e6;
      border-top-width: 3px;
      padding: 0.2em;
    }

    .v-contextmenu-item {
      display: flex;
      align-items: center;
      color: black;
      line-height: 25px;
      background-position: left center;
      padding: 0 12px !important;

      &.selected {
        background-color: #a52a2a;
        color: white;
      }

      &.purchase-state {
        &.link {
          &:after {
            position: absolute;
            font-weight: bold;
            right: 10px;
            content: ">";
          }
        }
      }

      &.purchase-date {
        justify-content: space-between;
        background-repeat: no-repeat;
        background-size: 12px;
        background-position-x: 10px;
        line-height: 25px;

        .date {
          width: 70px;
        }
      }

      :deep(.issue-condition) {
        margin-right: 8px;
      }

      > svg {
        margin-right: 8px;
        font-size: 16px;
      }
    }
  }
}
</style>
