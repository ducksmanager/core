<template>
  <form method="post" @submit.prevent="signup">
    <input type="hidden" name="_csrf_token" :value="csrfToken">
    <BRow>
      <BCol lg="4">
        <Errorable id="username">
          <BFormInput
            id="username"
            v-model="signupUsername"
            name="username"
            type="text"
            required
            autofocus
            :placeholder="$t(`Nom d'utilisateur`)"
          />
        </Errorable>
      </BCol>
    </BRow>
    <BRow>
      <BCol lg="4">
        <Errorable id="email">
          <BFormInput
            id="email"
            v-model="email"
            name="email"
            type="text"
            required
            :placeholder="$t('Adresse e-mail')"
          />
        </Errorable>
      </BCol>
    </BRow>
    <BRow>
      <BCol lg="4">
        <Errorable id="password">
          <BFormInput
            id="password"
            v-model="password"
            name="password"
            type="password"
            required
            :placeholder="$t('Mot de passe (au moins 6 caractères)')"
          />
        </Errorable>
      </BCol>
    </BRow>
    <BRow>
      <BCol lg="4">
        <Errorable id="password2">
          <BFormInput
            id="password2"
            v-model="password2"
            name="password2"
            type="password"
            required
            :placeholder="$t('Mot de passe (confirmation)')"
          />
        </Errorable>
      </BCol>
    </BRow>

    <BButton variant="primary" size="xl" type="submit">
      {{ $t("Inscription") }}
    </BButton>
  </form>
</template>

<script setup>
import * as axios from 'axios'
import { BButton, BCol, BFormInput, BRow } from 'bootstrap-vue-3'
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

import { form } from '~/stores/form'
import { l10n } from '~/stores/l10n'
import { validation } from '~/composables/validation'

defineProps({
  lastUsername: { type: String, default: null },
})

let signupUsername = $ref('')
const email = $ref('')
const password = $ref('')
const password2 = $ref('')

const { r } = l10n()
const t = useI18n().t
const csrfToken = document.getElementById('csrf').value
const hasErrors = $computed(() => form().hasErrors)
const signup = async () => {
  const { validatePasswords, validateEmail, validateUsername }
      = validation(t)

  form().clearErrors()
  validatePasswords(password, password2)
  validateEmail(email)
  validateUsername(signupUsername)

  if (hasErrors)
    return

  try {
    await axios.put('/signup', {
      username: signupUsername,
      password,
      password2,
      email,
      _csrf_token: csrfToken,
    })
    window.location.replace(l10n().r('/collection/show'))
  }
  catch (e) {
    form().addErrors({
      username: $t(
        'Ce nom d\'utilisateur ou cette adresse e-mail existe déjà.',
      ),
    })
  }
}

onMounted(() => {
  signupUsername = lastUsername
})
</script>

<style scoped>

</style>
