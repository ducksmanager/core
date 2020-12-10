<template>
  <b-container>
    <div class="loader" @change="change" @dragover="dragover" @drop="drop">
      <p>
        {{ $t('upload.drag')
        }}<label class="browse">
          {{ $t('upload.browse') }}
          <input id="file" class="sr-only" type="file" accept="image/jpeg" />
        </label>
      </p>
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
        {{ $t('upload.description') }}
      </b-jumbotron>
      <issue-select
        :key="crops.length"
        with-dimensions
        disable-ongoing-or-published
        :disable-not-ongoing-nor-published="false"
        @change="currentCrop = $event && $event.width ? $event : null"
      />
      <b-button :disabled="!currentCrop" class="m-3 mb-4" @click="addCrop">{{
        $t('upload.add_edge')
      }}</b-button>
      <b-container>
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
              :width="crop.width"
              :height="crop.height"
              :steps="[]"
              :photo-urls="crop.filename"
              :contributors="{ photographers: [$cookies.get('dm-user')] }"
            />
            <div>
              <div v-if="crop.sent" class="text-center">{{ $t('upload.sent') }}</div>
              <div v-else>
                <b-button pill variant="danger" @click="crops.splice(i, 1)"
                  >{{ $t('upload.delete_edge') }}
                </b-button>
              </div>
            </div>
            <template #footer> {{ crop.width }} x {{ crop.height }} mm </template>
          </b-card>
        </b-card-group>
      </b-container>
      <b-button
        v-if="crops.length"
        class="m-3"
        style="width: 100%"
        variant="success"
        :disabled="disableSend"
        @click="uploadAll"
        >{{ $t('upload.send') }}
      </b-button>
    </template>
  </b-container>
</template>

<script>
import Vue from 'vue'
import EdgeCanvas from '@/components/EdgeCanvas'
import IssueSelect from '@/components/IssueSelect'
import Issue from 'ducksmanager/assets/js/components/Issue.vue'
import { mapState } from 'vuex'

export default {
  components: { Issue, IssueSelect, EdgeCanvas },
  middleware: 'authenticated',
  data: () => ({
    currentCrop: null,
    crops: [],
    disableSend: false,
    uploadedImageData: null,
  }),
  computed: {
    ...mapState('coa', ['publicationNames']),
  },
  methods: {
    addCrop() {
      this.crops.push({
        ...this.currentCrop,
        data: this.$refs.cropper.getData(),
        url: this.$refs.cropper.getCroppedCanvas().toDataURL('image/jpeg'),
      })
      this.currentCrop = null
    },
    async uploadAll() {
      this.disableSend = true
      for (const crop of this.crops) {
        const [country, magazine] = crop.publicationCode.split('/')
        crop.filename = (
          await this.$axios.$post('/fs/upload-base64', {
            country,
            magazine,
            issuenumber: crop.issueNumber,
            data: crop.url,
          })
        ).filename
        Vue.set(crop, 'sent', true)
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
            reject(new Error(this.$t('error.browser_not_supported')))
          }
        } else {
          reject(new Error(this.$t('error.filetype_should_be_jpg')))
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

  .edge-crop {
    object-fit: contain;
  }
}

.loader {
  display: table;
  overflow: hidden;
  height: 100%;
  width: 100%;

  > p {
    color: #999;
    display: table-cell;
    text-align: center;
    vertical-align: middle;
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
