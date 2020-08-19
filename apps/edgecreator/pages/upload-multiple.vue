<template>
  <b-container>
    <template>
      <div class="loader" @change="change" @dragover="dragover" @drop="drop">
        <p>
          {{ $t('upload.drag') }}
          <label class="browse">
            {{ $t('upload.browse') }}
            <input id="file" class="sr-only" type="file" accept="image/jpeg" />
          </label>
        </p>
      </div>
    </template>
    <template v-if="uploadedImageData">
      <div id="cropper-wrapper">
        <vue-cropper
          ref="cropper"
          alt="Source Image"
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
      <b-button :disabled="!currentCrop" @click="addCrop">{{ $t('upload.add_edge') }}</b-button>
      <b-container>
        <b-card-group deck columns>
          <b-card v-for="(crop, i) in crops" :key="i" no-body class="edge-card overflow-hidden">
            <b-row no-gutters style="height: 280px;">
              <b-col md="6" class="edge-crop" :style="{ backgroundImage: `url('${crop.url}')` }" />
              <b-col md="6" class="align-items-center d-flex justify-content-center">
                <b-card-body :title="crop.id">
                  <b-card-text>
                    {{ crop.publicationCode }} {{ crop.issueNumber }} <br />
                    {{ crop.width }} x {{ crop.height }} mm</b-card-text
                  >
                  <edge-canvas
                    v-if="crop.filename"
                    :issuenumber="crop.issueNumber"
                    :width="crop.width"
                    :height="crop.height"
                    :steps="[]"
                    :photo-urls="crop.filename"
                    :contributors="{ photographers: [$cookies.get('dm-user')] }"
                  />
                </b-card-body>
              </b-col>
            </b-row>
            <b-button v-if="!crop.sent" pill variant="danger" @click="crops.splice(i, 1)">{{
              $t('upload.delete_edge')
            }}</b-button>
            <div v-else class="text-center">{{ $t('upload.sent') }}</div>
          </b-card>
        </b-card-group>
      </b-container>
      <b-button
        v-if="crops.length"
        style="width: 100%;"
        variant="success"
        :disabled="disableSend"
        @click="uploadAll"
        >{{ $t('upload.send') }}</b-button
      >
    </template>
  </b-container>
</template>

<script>
import Vue from 'vue'
import EdgeCanvas from '@/components/EdgeCanvas'
import IssueSelect from '@/components/IssueSelect'

export default {
  components: { IssueSelect, EdgeCanvas },
  data: () => ({
    currentCrop: null,
    crops: [],
    disableSend: false,
    uploadedImageData: null,
  }),
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

<style scoped>
.edge-crop {
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center;
}
.edge-card {
  max-width: 300px;
  max-height: 300px;
}
.loader {
  display: table;
  height: 100%;
  overflow: hidden;
  width: 100%;
}
.loader > p {
  color: #999;
  display: table-cell;
  text-align: center;
  vertical-align: middle;
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
