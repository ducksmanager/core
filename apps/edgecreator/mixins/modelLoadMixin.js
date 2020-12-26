import { mapMutations, mapState } from 'vuex'
import legacyDbMixin from '@/mixins/legacyDbMixin'
import svgUtilsMixin from '@/mixins/svgUtilsMixin'
import stepListMixin from '@/mixins/stepListMixin'

export default {
  computed: {
    ...mapState(['country', 'magazine', 'issuenumbers']),
    ...mapState('renders', ['supportedRenders']),
    ...mapState('user', ['allUsers']),
  },
  mixins: [legacyDbMixin, svgUtilsMixin, stepListMixin],
  data: () => ({
    loadErrors: [],
  }),
  methods: {
    async loadModel(country, magazine, issuenumber, targetIssuenumber) {
      const vm = this
      const onlyLoadStepsAndDimensions = issuenumber !== targetIssuenumber
      let steps

      const loadSvg = async (publishedVersion) => {
        try {
          const { svgElement, svgChildNodes } = await vm.loadSvgFromString(
            country,
            magazine,
            issuenumber,
            publishedVersion
          )

          vm.setDimensionsFromSvg(svgElement)
          steps = vm.getStepsFromSvg(issuenumber, svgChildNodes)
          if (!onlyLoadStepsAndDimensions) {
            vm.setPhotoUrlsFromSvg(issuenumber, svgChildNodes)
            vm.setContributorsFromSvg(issuenumber, svgChildNodes)
            vm.addCurrentUserAsDesigner(issuenumber)
          }
        } catch (e) {}
      }

      try {
        await loadSvg(false)
      } catch {
        const edge = await this.$axios.$get(
          `/api/edgecreator/v2/model/${country}/${magazine}/${issuenumber}`
        )
        if (edge) {
          const apiSteps =
            (await vm.$axios.$get(`/api/edgecreator/v2/model/${edge.id}/steps`)) || []
          vm.setDimensionsFromApi(apiSteps)
          steps = await vm.getStepsFromApi(issuenumber, apiSteps)

          if (!onlyLoadStepsAndDimensions) {
            await vm.setPhotoUrlsFromApi(issuenumber, edge.id)
            await vm.setContributorsFromApi(issuenumber, edge.id)
          }
        } else {
          await loadSvg(true)
        }
      }
      if (steps) {
        this.setSteps(targetIssuenumber, steps)
      } else {
        throw new Error('No model found for issue ' + issuenumber)
      }
    },

    addCurrentUserAsDesigner(issuenumber) {
      const vm = this
      this.addContributor({
        issuenumber,
        contributionType: 'designers',
        user: this.allUsers.find((user) => user.username === vm.$cookies.get('dm-user')),
      })
    },

    setDimensionsFromSvg(svgElement) {
      this.setDimensions({
        width: svgElement.getAttribute('width') / 1.5,
        height: svgElement.getAttribute('height') / 1.5,
      })
    },
    getStepsFromSvg: (issuenumber, svgChildNodes) =>
      svgChildNodes
        .filter(({ nodeName }) => nodeName === 'g')
        .map((group) => ({
          component: group.getAttribute('class'),
          options: JSON.parse(
            (group.getElementsByTagName('metadata')[0] || { textContent: '{}' }).textContent
          ),
        })),
    setPhotoUrlsFromSvg(issuenumber, svgChildNodes) {
      const vm = this
      vm.getSvgMetadata(svgChildNodes, 'photo').forEach((photoUrl) => {
        vm.setPhotoUrl({ issuenumber, filename: photoUrl })
      })
    },
    setContributorsFromSvg(issuenumber, svgChildNodes) {
      const vm = this
      ;['photographer', 'designer'].forEach((contributionType) => {
        vm.getSvgMetadata(svgChildNodes, `contributor-${contributionType}`).forEach((username) => {
          vm.addContributor({
            issuenumber,
            contributionType: `${contributionType}s`,
            user: vm.allUsers.find((user) => user.username === username),
          })
        })
      })
    },

    setDimensionsFromApi(stepData) {
      const dimensions = stepData.find(({ ordre: originalStepNumber }) => originalStepNumber === -1)
      if (dimensions) {
        this.setDimensions({
          width: dimensions.options.Dimension_x,
          height: dimensions.options.Dimension_y,
        })
      }
    },
    async getStepsFromApi(issuenumber, stepData) {
      const vm = this
      return (
        await Promise.all(
          stepData
            .filter(({ ordre: originalStepNumber }) => originalStepNumber !== -1)
            .map(async ({ nomFonction: originalComponentName, options: originalOptions }) => {
              const { component } = vm.supportedRenders.find(
                (component) => component.originalName === originalComponentName
              ) || { component: null }
              if (component) {
                return {
                  component,
                  options: await vm.getOptionsFromDb(component, originalOptions),
                }
              } else {
                this.addWarning(
                  `Unrecognized step name : ${originalComponentName}, step will be ignored.`
                )
                return null
              }
            })
        )
      ).filter((step) => !!step)
    },
    async setPhotoUrlsFromApi(issuenumber, edgeId) {
      const photo = await this.$axios.$get(`/api/edgecreator/model/v2/${edgeId}/photo/main`)
      if (photo) {
        this.setPhotoUrl({ issuenumber, filename: photo.nomfichier })
      }
    },
    async setContributorsFromApi(issuenumber, edgeId) {
      const vm = this
      const contributors = await vm.$axios.$get(`/api/edgecreator/contributors/${edgeId}`)
      contributors.forEach(({ contribution, idUtilisateur }) => {
        vm.addContributor({
          issuenumber,
          contributionType: contribution === 'photographe' ? 'photographers' : 'designers',
          user: vm.allUsers.find((user) => user.id === idUtilisateur),
        })
      })
    },
    ...mapMutations(['setDimensions', 'setPhotoUrl', 'addContributor', 'addWarning']),
  },
}
