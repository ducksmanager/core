<script setup lang="ts">
import { useRouter } from 'vue-router';
import { CapacitorCookies } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

const router = useRouter();
const token = await Preferences.get({
  key: 'token',
});
if (token.value) {
  router.replace({ path: '/collection' });
} else {
  router.replace({ path: '/login' });
}
</script>
