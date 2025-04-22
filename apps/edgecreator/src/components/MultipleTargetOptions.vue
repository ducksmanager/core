<template>
  <div class="multiple-target-options d-inline-block mt-2 p-2">
    <div class="header mt-n4 mb-1">
      <i-bi-pencil />
    </div>
    <slot />
  </div>
</template>

<style scoped lang="scss">
.multiple-target-options {
  max-width: 500px;
  border: 1px solid grey;
  border-radius: 0.2rem;

  .header svg {
    background: white;
  }
}
</style>
