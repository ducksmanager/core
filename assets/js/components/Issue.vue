<template>
  <div :class="{[`d-${noWrap ? 'inline' : 'block'}`]: true}">
    <a
      :class="{ clickable }"
      :href="`${$r(`/collection/show/{publicationCode:${publicationcode}}`)}#${issuenumber}`"
    >
      <Condition
        v-if="!hideCondition"
        :publicationcode="publicationcode"
        :issuenumber="issuenumber"
      />
      <Publication
        :publicationcode="publicationcode"
        :publicationname="publicationname"
      /><span>{{ issuenumber }}</span>
      <slot name="title-suffix" />
    </a>
    <slot />
  </div>
</template>

<script>
import Publication from "./Publication";
import Condition from "./Condition";
import {mapActions} from "pinia";
import { l10n } from "../stores/l10n";

export default {
  name: "Issue",
  components: {Condition, Publication},
  props: {
    publicationcode: {type: String, required: true},
    publicationname: {type: String, required: true},
    issuenumber: {type: String, required: true},
    clickable: { type: Boolean, default: false },
    hideCondition: { type: Boolean, default: false },
    noWrap: { type: Boolean, default: true }
  },

  methods: {
    ...mapActions(l10n, ["$r"]),
  }
}
</script>

<style scoped lang="scss">
  a {
    display: inline-flex;
    align-items: center;
    line-height: 1rem;
    color: darkgrey;
    pointer-events: none;
    border-bottom: none;

    &.clickable {
      pointer-events: initial;
      border-bottom: initial;
    }

    * {
      margin: 0 2px;
    }
  }
</style>
