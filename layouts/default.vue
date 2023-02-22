<script setup>
const route = useRoute()
const { t } = useI18n()
// Dummy meta info setup until copy is ready
const head = useLocaleHead({ addDirAttribute: true, identifierAttribute: 'id', addSeoAttributes: true })
const title = computed(() => t('layouts.title', { title: t(route.meta.title ?? 'TBD') }))

</script>
<template>
  <Html
    :lang="head.htmlAttrs.lang"
    :dir="head.htmlAttrs.dir"
  >
    <Body>
      <slot />
    </Body>
  </Html>
</template>

