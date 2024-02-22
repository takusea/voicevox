<template>
  <error-boundary>
    <!-- TODO: メニューバーをEditorHomeから移動する -->
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component
          :is="Component"
          :is-engines-ready="isEnginesReady"
          :project-file-path="projectFilePath"
        />
      </keep-alive>
    </router-view>
  </error-boundary>
</template>

<script setup lang="ts">
import { watch, onMounted, ref, computed, toRaw } from "vue";
import { useGtm } from "@gtm-support/vue-gtm";
import { useRoute } from "vue-router";
import { EngineId } from "@/type/preload";
import ErrorBoundary from "@/components/ErrorBoundary.vue";
import { useStore } from "@/store";
import { useHotkeyManager } from "@/plugins/hotkeyPlugin";

const store = useStore();
const route = useRoute();

// TODO: プロジェクトファイルの読み込みもEditorHomeから移動する
const projectFilePath = computed(() => route.query["projectFilePath"]);

// Google Tag Manager
const gtm = useGtm();
watch(
  () => store.state.acceptRetrieveTelemetry,
  (acceptRetrieveTelemetry) => {
    gtm?.enable(acceptRetrieveTelemetry === "Accepted");
  },
  { immediate: true }
);

// フォントの制御用パラメータを変更する
watch(
  () => store.state.editorFont,
  (editorFont) => {
    document.body.setAttribute("data-editor-font", editorFont);
  },
  { immediate: true }
);

// エディタの切り替えを監視する
watch(
  () => route.path,
  async (unknownPath) => {
    let path: "talk" | "song";
    if (["/talk", "/song"].includes(unknownPath)) {
      path = unknownPath.slice(1) as "talk" | "song";
    } else {
      // 不明なパスの場合はトークエディタにする
      path = "talk";
      window.electron.logWarn(`unknown path: ${unknownPath}`);
    }

    hotkeyManager.onEditorChange(path);
  }
);

// ソフトウェアを初期化
const { hotkeyManager } = useHotkeyManager();
const isEnginesReady = ref(false);
onMounted(async () => {
  await store.dispatch("INIT_VUEX");

  const hotkeySettings = store.state.hotkeySettings;

  hotkeyManager.load(structuredClone(toRaw(hotkeySettings)));

  // エンジンの初期化開始

  // エンジン情報取得
  await store.dispatch("GET_ENGINE_INFOS");

  // URLパラメータに従ってマルチエンジンをオフにする
  const isMultiEngineOffMode = route.query["isMultiEngineOffMode"] === "true";
  store.dispatch("SET_IS_MULTI_ENGINE_OFF_MODE", isMultiEngineOffMode);

  // マルチエンジンオフモードのときはデフォルトエンジンだけにする
  let engineIds: EngineId[];
  if (isMultiEngineOffMode) {
    const main = Object.values(store.state.engineInfos).find(
      (engine) => engine.type === "default"
    );
    if (!main) {
      throw new Error("No main engine found");
    }
    engineIds = [main.uuid];
  } else {
    engineIds = store.state.engineIds;
  }
  await store.dispatch("LOAD_USER_CHARACTER_ORDER");
  await store.dispatch("POST_ENGINE_START", {
    engineIds,
  });

  // 辞書を同期
  await store.dispatch("SYNC_ALL_USER_DICT");

  isEnginesReady.value = true;
});

// TODO: ダイアログ周りをEditorHomeから移動する

// TODO: エンジン起動状態周りの処理と表示をEditorHomeから移動する
</script>