<template>
  <header-default />
  <div class="home">
    <data-viz />
    <data-search />
  </div>
  <footer-default />
</template>

<script>
// @ is an alias to /src
import HeaderDefault from "@/components/common/HeaderDefault.vue";
import FooterDefault from "@/components/common/FooterDefault.vue";
import DataViz from "@/components/DataViz.vue";
import DataSearch from "@/components/DataSearch.vue";

export default {
  name: "HomeView",
  components: {
    HeaderDefault,
    FooterDefault,
    DataViz,
    DataSearch,
  },
};
</script>
