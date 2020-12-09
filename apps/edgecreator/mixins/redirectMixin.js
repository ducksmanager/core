export default {
  watch: {
    '$route.hash': {
      immediate: true,
      handler(newValue) {
        const vm = this
        const toastError = (message) => {
          vm.$bvToast.toast(message, {
            title: 'Error',
            autoHideDelay: 3000,
          })
        }
        switch (newValue) {
          case '#401':
            toastError('You are not logged in')
            break
          case '#403':
            toastError("You don't have enough rights to access the requested page")
            break
        }
      },
    },
  },
}
