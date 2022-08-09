<template>
  <main-layout :title="title">
    <strong class="capitalize">{{ title }}</strong>
    <div style="height: 90vh">
      <div style="height: 100%;overflow: scroll" @scroll="updateScrollOffset()" ref="container">
        <ion-card :key="item" v-for="item in items">{{ item.issueNumber }}</ion-card>
      </div>
    </div>
  </main-layout>
</template>
<script setup lang="ts">
import MainLayout from "@/layouts/MainLayout.vue";
import {computed, onMounted, ref} from "vue";
import {IonCard} from '@ionic/vue';
import {collection} from "@/stores/collection";
import {IssueWithPublicationCode} from "@/types/IssueWithPublicationCode";

const store = collection()
const items = computed((): IssueWithPublicationCode[]|null => store.collection);

const scrollOffset = ref(null as number | null)
const container = ref(null)

const updateScrollOffset = () => {
  scrollOffset.value = 0
}

const title = computed(() => store.total === null ? 'My collection' : `My collection (${store.total} issues)`)

onMounted(async () => {
  await store.loadCollection()
})

</script>