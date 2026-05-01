<template>
  <v-dialog dark v-model="dialog" persistent max-width="380">
    <v-card>
      <v-card-title>
        {{ title }}
      </v-card-title>
      <v-card-text v-html="content"></v-card-text>
      <v-card-actions>
        <Button text="확인" @doAction="$emit('doAction')"></Button>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import Button from "@/components/Button";
export default {
  props: {
    dialog: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: "",
    },
    content: {
      type: String,
      default: "",
    },
    doAction: {
      type: Function,
      default: () => {},
    },
  },
  data() {
    return {};
  },
  components: {
    Button,
  },
};
</script>

<style lang="scss" scoped>
.v-card {
  font-family: "NanumSquareNeo", sans-serif;
  .v-card__title {
    font-size: 22px;
    line-height: 32px;
    font-weight: 800;
    justify-content: center;
    padding: 24px;
  }
  .v-card__text {
    font-size: 16px;
    line-height: 32px;
    color: rgba(255, 255, 255, 0.8);
    text-align: center;
    padding: 0 24px;
  }
  .v-card__actions {
    padding: 24px;
  }
}
</style>
