import { mapActions, mapState } from 'pinia'
import dimensionsMixin from './dimensionsMixin'
import legacyDbMixin from '@/mixins/legacyDbMixin'
import svgUtilsMixin from '@/mixins/svgUtilsMixin'
import stepListMixin from '@/mixins/stepListMixin'
import { edgeCatalog } from '~/stores/edgeCatalog'
import { main } from '~/stores/main'
import { user } from '~/stores/user'
import { renders } from '~/stores/renders'

export default {
  computed: {
    ...mapState(main, ['country', 'magazine', 'issuenumbers']),
    ...mapState(renders, ['supportedRenders']),
    ...mapState(user, ['allUsers']),
    ...mapState(edgeCatalog, ['publishedEdgesSteps']),
  },
  mixins: [legacyDbMixin, svgUtilsMixin, dimensionsMixin, stepListMixin],
  data: () => ({
    loadErrors: [],
  }),
  methods: {
    async loadModel(country, magazine, issuenumber, targetIssuenumber) {
      const vm = this
      const onlyLoadStepsAndDimensions = issuenumber !== targetIssuenumber
      let steps
      let dimensions

      const loadSvg = async (publishedVersion) => {
        const { svgElement, svgChildNodes } = await vm.loadSvgFromString(
          country,
          magazine,
          issuenumber,
          publishedVersion
        )

        dimensions = vm.getDimensionsFromSvg(svgElement)
        steps = vm.getStepsFromSvg(svgChildNodes)
        if (!onlyLoadStepsAndDimensions) {
          vm.setPhotoUrlsFromSvg(issuenumber, svgChildNodes)
          vm.setContributorsFromSvg(issuenumber, svgChildNodes)
        }
      }

      try {
        await loadSvg(false)
      } catch {
        try {
          await loadSvg(true)
        } catch {
          const publicationcode = `${country}/${magazine}`
          const edge = await this.$axios.$get(
            `/api/edgecreator/v2/model/${publicationcode}/${issuenumber}`
          )
          if (edge) {
            await this.getPublishedEdgesSteps({
              publicationcode,
              edgeModelIds: [edge.id],
            })
            const apiSteps =
              this.publishedEdgesSteps[publicationcode][issuenumber]
            dimensions = vm.getDimensionsFromApi(apiSteps)
            steps = await vm.getStepsFromApi(
              issuenumber,
              apiSteps,
              dimensions,
              true,
              (error) => {
                vm.addWarning(error)
              }
            )

            if (!onlyLoadStepsAndDimensions) {
              await vm.setPhotoUrlsFromApi(issuenumber, edge.id)
              await vm.setContributorsFromApi(issuenumber, edge.id)
            }
          } else {
            await loadSvg(true)
          }
        }
      }
      if (steps) {
        this.setDimensions(dimensions, targetIssuenumber)
        this.setSteps(targetIssuenumber, steps)
      } else {
        throw new Error('No model found for issue ' + issuenumber)
      }
    },

    getDimensionsFromSvg(svgElement) {
      return {
        width: svgElement.getAttribute('width') / 1.5,
        height: svgElement.getAttribute('height') / 1.5,
      }
    },
    getStepsFromSvg: (svgChildNodes) =>
      svgChildNodes
        .filter(({ nodeName }) => nodeName === 'g')
        .map((group) => ({
          component: group.getAttribute('class'),
          options: JSON.parse(
            (group.getElementsByTagName('metadata')[0] || { textContent: '{}' })
              .textContent
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
        vm.getSvgMetadata(
          svgChildNodes,
          `contributor-${contributionType}`
        ).forEach((username) => {
          vm.addContributor({
            issuenumber,
            contributionType: `${contributionType}s`,
            user: vm.allUsers.find((user) => user.username === username),
          })
        })
      })
    },

    getDimensionsFromApi(
      stepData,
      defaultDimensions = { width: 15, height: 200 }
    ) {
      const dimensions = Object.values(stepData).find(
        ({ stepNumber: originalStepNumber }) => originalStepNumber === -1
      )
      if (dimensions) {
        return {
          width: dimensions.options.Dimension_x,
          height: dimensions.options.Dimension_y,
        }
      }
      return defaultDimensions
    },
    async getStepsFromApi(
      issuenumber,
      stepData,
      dimensions,
      calculateBase64,
      onError
    ) {
      const vm = this
      return (
        await Promise.all(
          Object.values(stepData)
            .filter(
              ({ stepNumber: originalStepNumber }) => originalStepNumber !== -1
            )
            .map(
              async ({
                stepNumber: originalStepNumber,
                functionName: originalComponentName,
                options: originalOptions,
              }) => {
                const { component } = vm.supportedRenders.find(
                  (component) =>
                    component.originalName === originalComponentName
                ) || { component: null }
                if (component) {
                  try {
                    return {
                      component,
                      options: await vm.getOptionsFromDb(
                        component,
                        originalOptions,
                        dimensions,
                        issuenumber,
                        calculateBase64
                      ),
                    }
                  } catch (e) {
                    onError(
                      `Invalid step ${originalStepNumber} (${component}) : ${e}, step will be ignored.`,
                      originalStepNumber
                    )
                    return null
                  }
                } else {
                  onError(
                    `Unrecognized step name : ${originalComponentName}, step will be ignored.`,
                    originalStepNumber
                  )
                  return null
                }
              }
            )
        )
      ).filter((step) => !!step)
    },
    async setPhotoUrlsFromApi(issuenumber, edgeId) {
      const photo = await this.$axios.$get(
        `/api/edgecreator/model/v2/${edgeId}/photo/main`
      )
      if (photo) {
        this.setPhotoUrl({ issuenumber, filename: photo.nomfichier })
      }
    },
    async setContributorsFromApi(issuenumber, edgeId) {
      const vm = this
      const contributors = await vm.$axios.$get(
        `/api/edgecreator/contributors/${edgeId}`
      )
      contributors.forEach(({ contribution, idUtilisateur }) => {
        vm.addContributor({
          issuenumber,
          contributionType:
            contribution === 'photographe' ? 'photographers' : 'designers',
          user: vm.allUsers.find((user) => user.id === idUtilisateur),
        })
      })
    },
    ...mapActions(main, ['setPhotoUrl', 'addContributor', 'addWarning']),
    ...mapActions(edgeCatalog, ['getPublishedEdgesSteps']),
  },
}
