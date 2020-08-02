<template>
  <nuxt keep-alive />
</template>

<style>
html {
  font-family: 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    'Helvetica Neue', Arial, sans-serif;
  font-size: 16px;
  word-spacing: 1px;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;
}

body,
#__nuxt,
#__layout,
#wrapper {
  height: 100vh;
}

*,
*:before,
*:after {
  box-sizing: border-box;
  margin: 0;
}

.button--green {
  display: inline-block;
  border-radius: 4px;
  border: 1px solid #3b8070;
  color: #3b8070;
  text-decoration: none;
  padding: 10px 30px;
}

.button--green:hover {
  color: #fff;
  background-color: #3b8070;
}

.button--grey {
  display: inline-block;
  border-radius: 4px;
  border: 1px solid #35495e;
  color: #35495e;
  text-decoration: none;
  padding: 10px 30px;
  margin-left: 15px;
}

.button--grey:hover {
  color: #fff;
  background-color: #35495e;
}

@keyframes glowFilter {
  0% {
    -webkit-filter: drop-shadow(-0.75px 0px 6px black);
    filter: drop-shadow(-0.75px 0px 6px black);
    stroke: black;
  }
  25% {
    -webkit-filter: drop-shadow(-0.75px 0px 6px grey);
    filter: drop-shadow(-0.75px 0px 6px grey);
    stroke: grey;
  }
  50% {
    -webkit-filter: drop-shadow(-0.75px 0px 6px white);
    filter: drop-shadow(-0.75px 0px 6px white);
    stroke: white;
  }
  75% {
    -webkit-filter: drop-shadow(-0.75px 0px 6px grey);
    filter: drop-shadow(-0.75px 0px 6px grey);
    stroke: grey;
  }
  100% {
    -webkit-filter: drop-shadow(-0.75px 0px 6px black);
    filter: drop-shadow(-0.75px 0px 6px black);
    stroke: black;
  }
}
</style>
