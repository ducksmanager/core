<route lang="yaml">
  meta:
    public: true
  </route>
  <template>
  <h5>
    <b>{{ $t("Bibliothèque DucksManager de") }} {{ $route.params.username }}</b>
  </h5>
  <ViewBookcase />
</template>
