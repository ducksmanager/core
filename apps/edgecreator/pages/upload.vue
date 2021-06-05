<template>
  <b-container>
    <div>
      <div
        :class="{ loader: true, 'max-height': !uploadedImageData }"
        @change="change"
        @dragover="dragover"
        @drop="drop"
      >
        <div>
          {{ $t('Drag a file here or')
          }}<label class="browse">
            {{ $t('Browse') }}
            <input id="file" class="sr-only" type="file" accept="image/jpeg" />
          </label>
        </div>
      </div>
      <template v-if="uploadedImageData">
        <div id="cropper-wrapper">
          <vue-cropper
            ref="cropper"
            alt="Source Image"
            :img-style="{ maxHeight: '100vh' }"
            :auto-crop-area="1"
            :src="uploadedImageData"
            :view-mode="1"
            :movable="false"
            :rotatable="false"
            :scalable="false"
            :zoomable="false"
          />
        </div>
        <b-jumbotron>
          {{
            // eslint-disable-next-line max-len
            $t(
              'For each edge present on the picture, please select the part of the picture corresponding to the edge, fill in the information related to the edge hereunder then click on "Add". Once all the edges on the picture have been indicated, click on "Send the edge pictures".'
            )
          }}
        </b-jumbotron>
        <issue-select
          :key="crops.length"
          with-dimensions
          disable-ongoing-or-published
          :disable-not-ongoing-nor-published="false"
          @change="currentCrop = $event && $event.width ? $event : null"
        />
        <b-button :disabled="!currentCrop" class="mt-3 mb-4" @click="addCrop">{{
          $t('Add')
        }}</b-button>
        <b-card-group deck columns>
          <b-card
            v-for="(crop, i) in crops"
            :key="`crop-${i}`"
            class="edge-card overflow-hidden"
            :body-class="['d-flex', 'align-items-center', 'justify-content-around', 'p-1']"
          >
            <template #header>
              <Issue
                :publicationcode="crop.publicationCode"
                :publicationname="publicationNames[crop.publicationCode]"
                :issuenumber="crop.issueNumber"
            /></template>
            <img
              class="edge-crop"
              :src="crop.url"
              :width="crop.width * 1.5"
              :height="crop.height * 1.5"
            />
            <edge-canvas
              :issuenumber="crop.issueNumber"
              :dimensions="{ width: crop.width, height: crop.height }"
              :steps="[]"
              :photo-url="crop.filename"
              :contributors="initialContributors"
            />
            <div>
              <div v-if="crop.error" class="text-center">{{ $t('Error') }}</div>
              <div v-else-if="crop.sent" class="text-center">{{ $t('Sent!') }}</div>
              <div v-else>
                <b-button pill variant="danger" @click="crops.splice(i, 1)"
                  >{{ $t('Delete') }}
                </b-button>
              </div>
            </div>
            <template #footer> {{ crop.width }} x {{ crop.height }} mm </template>
          </b-card>
        </b-card-group>
        <b-button
          v-if="crops.length && crops.some(({ sent }) => !sent)"
          class="my-3"
          style="width: 100%"
          variant="success"
          @click="uploadAll"
          >{{ $t('Send the edge pictures') }}
        </b-button>
        <div v-else-if="crops.length" class="my-3">
          <b-link to="/">{{ $t('Back to home page') }}</b-link>
        </div>
      </template>
    </div></b-container
  >
</template>

<script>
import Vue from 'vue'
import EdgeCanvas from '@/components/EdgeCanvas'
import IssueSelect from '@/components/IssueSelect'
import Issue from 'ducksmanager/assets/js/components/Issue.vue'
import { mapState } from 'vuex'
import saveEdgeMixin from '@/mixins/saveEdgeMixin'

export default {
  components: { Issue, IssueSelect, EdgeCanvas },
  mixins: [saveEdgeMixin],
  middleware: 'authenticated',
  data: () => ({
    currentCrop: null,
    crops: [],
    uploadedImageData: null,
  }),
  computed: {
    ...mapState('coa', ['publicationNames']),
    initialContributors() {
      return { photographers: [{ username: this.$cookies.get('dm-user') }] }
    },
  },
  methods: {
    addCrop() {
      const data = this.$refs.cropper.getData()
      if (data.height < data.width) {
        this.$bvToast.toast(
          this.$t(
            `The width of your selection is bigger than its height! Make sure that the edges appear vertically on the photo.`
          ),
          {
            title: this.$t('Error'),
            autoHideDelay: 5000,
          }
        )
      } else {
        this.crops.push({
          ...this.currentCrop,
          data,
          url: this.$refs.cropper.getCroppedCanvas().toDataURL('image/jpeg'),
        })
        this.currentCrop = null
      }
    },
    async uploadAll() {
      const vm = this
      for (const crop of this.crops.filter(({ sent }) => !sent)) {
        const [country, magazine] = crop.publicationCode.split('/')
        const filename = (
          await this.$axios.$post('/fs/upload-base64', {
            country,
            magazine,
            issuenumber: crop.issueNumber,
            data: crop.url,
          })
        ).filename
        Vue.set(crop, 'filename', filename)
        this.$nextTick().then(() => {
          vm.saveEdgeSvg(country, magazine, crop.issueNumber, this.initialContributors).then(
            (response) => {
              const isSuccess = response && response.svgPath
              Vue.set(crop, 'sent', isSuccess)
              Vue.set(crop, 'error', !isSuccess)
            }
          )
        })
      }
      // window.location.replace('/')
    },
    read(files) {
      return new Promise((resolve, reject) => {
        if (!files || files.length === 0) {
          resolve()
          return
        }
        const file = files[0]
        if (file.type === 'image/jpeg') {
          if (URL) {
            resolve({
              loaded: true,
              name: file.name,
              type: file.type,
              url: URL.createObjectURL(file),
            })
          } else {
            reject(new Error(this.$t('Your browser is not supported ')))
          }
        } else {
          reject(new Error(this.$t('Please choose a JPG or JPEG file')))
        }
      })
    },
    change({ target }) {
      this.read(target.files)
        .then((data) => {
          target.value = ''
          this.update(data)
        })
        .catch((e) => {
          target.value = ''
          this.alert(e)
        })
    },
    dragover(e) {
      e.preventDefault()
    },
    drop(e) {
      e.preventDefault()
      this.read(e.dataTransfer.files)
        .then((data) => {
          this.update(data)
        })
        .catch(this.alert)
    },
    alert(e) {
      window.alert(e && e.message ? e.message : e)
    },
    update(data) {
      this.uploadedImageData = data.url
    },
  },
}
</script>

<style scoped lang="scss">
#cropper-wrapper {
  max-height: 100vh;
}

.edge-card {
  max-width: 300px;
}

.loader {
  display: flex;
  overflow: hidden;
  height: 100%;
  width: 100%;
  justify-content: center;
  align-items: center;
  background: #eee;
  border: 5px dashed lightgray;

  &.max-height {
    height: 100vh;
  }

  > div {
    text-align: center;
    color: #999;
  }
}

.browse {
  color: #0074d9;
  cursor: pointer;
  margin-left: 0.25rem;
}

.loader:drop {
  color: #08f;
}
</style>
