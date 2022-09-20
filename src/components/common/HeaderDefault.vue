<template>
  <header>
    <div class="header-default">
      <div class="logo">
        <router-link to="/">
          <img alt="Logo" src="@/assets/img/logo.png" />
        </router-link>
      </div>
      <h1>Archiwum Kobiet</h1>
      <div class="menu">
        <img src="@/assets/img/menu-close.png" @click="toggleMenu()" />
        <div class="menu-content" v-if="showMenu">
          <div>Strona 1</div>
          <div>Strona 2</div>
          <div>Strona 3</div>
          <div>Strona 4</div>
          <div>Strona 5</div>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: "HeaderDefault",
  data() {
    return {
      showMenu: false,
    };
  },
  methods: {
    toggleMenu() {
      this.showMenu = !this.showMenu;
    },
  },
};
</script>
