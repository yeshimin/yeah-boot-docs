<script setup lang="ts">
import { computed, ref } from "vue";

type SourceProvider = "github" | "gitee";

const props = defineProps<{
  repos: string[];
}>();

const provider = ref<SourceProvider>("github");

const commands = computed(() =>
  props.repos.map(
    (repo) => `git clone https://${provider.value}.com/yeshimin/${repo}.git`,
  ),
);
</script>

<template>
  <div class="repo-clone-tabs">
    <div class="repo-source-switch" role="group" aria-label="选择代码仓库来源">
      <button
        class="repo-source-button"
        :class="{ 'is-active': provider === 'github' }"
        type="button"
        :aria-pressed="provider === 'github'"
        @click="provider = 'github'"
      >
        <img src="/github.favicon.ico" alt="" aria-hidden="true" />
        GitHub
      </button>
      <button
        class="repo-source-button"
        :class="{ 'is-active': provider === 'gitee' }"
        type="button"
        :aria-pressed="provider === 'gitee'"
        @click="provider = 'gitee'"
      >
        <img src="/gitee.favicon.ico" alt="" aria-hidden="true" />
        Gitee
      </button>
    </div>
    <pre class="repo-clone-code"><code><span v-for="command in commands" :key="command">{{ command }}</span></code></pre>
  </div>
</template>
