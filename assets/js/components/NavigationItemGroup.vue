<template>
  <li
    data-toggle="collapse"
    :data-target="`#${path}`"
    :class="{collapsed: true, active }"
  >
    <a href="#"><i :class="{ [icon]: true }" />
      <slot name="text" />
      <span class="arrow" /></a>
    <ul
      :id="path"
      class="sub-menu collapse in show"
    >
      <slot name="items" />
    </ul>
  </li>
</template>

<script>
export default {
  name: "NavigationItemGroup",
  props: {
    path: {type: String, required: true},
    icon: {type: String, required: true}
  },
  computed: {
    active() {
      return window.location.pathname.split('/').includes(this.path)
    }
  },
  methods: {}
}
</script>

<style lang="scss">

ul, li {
  list-style: none;
  padding: 0;
  margin: 0;
  line-height: 25px;
  cursor: pointer;
}

ul .active, li .active {
  border-left: 3px solid rgb(200, 137, 100);
  background-color: #4f5b69;
}

ul .sub-menu li.active, li .sub-menu li.active, ul .sub-menu li.active a, li .sub-menu li.active a {
  color: rgb(200, 137, 100);
}

ul .sub-menu li, li .sub-menu li {
  background-color: #181c20;
  border: none;
  line-height: 28px;
  border-bottom: 1px solid #23282e;
  padding-left: 10px;
  margin-left: 0;
}

ul .sub-menu li:hover {
  background-color: #020203;
}

li {
  padding-left: 3px;

  .sub-menu li:hover {
    background-color: #020203;
  }

  &.empty {
    height: 10px;
  }

  a {
    display: block;
    text-decoration: none !important;
    color: inherit !important;
    border-bottom: 0 !important;

    i {
      padding-left: 10px;
      width: 15px;
      padding-right: 5px;
    }
  }

  &.no-icon a i {
    padding-left: 5px;
  }

  &.non-empty:hover {
    border-left: 3px solid rgb(200, 137, 100);
    background-color: #4f5b69;
    -webkit-transition: all 0.1s ease;
    -moz-transition: all 0.1s ease;
    -o-transition: all 0.1s ease;
    -ms-transition: all 0.1s ease;
    transition: all 0.1s ease;
  }

  &.empty {
    cursor: default;
  }
}

.b-custom {
  display: inline-block;
  background-repeat: no-repeat;
  height: 12px;
  background-size: 12px;
  width: 12px;
  background-position: bottom;
}

@media (max-width: 767px) {
  li.empty {
    display: none;
  }
}

</style>