<template>
  <button
    :class="[arrow ? 'arrow' : '', disabled ? 'disabled' : '']"
    @click="$emit('doAction')"
  >
    <span>{{ text }}</span>
  </button>
</template>

<script>
export default {
  props: {
    text: {
      type: String,
      default: "",
    },
    arrow: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    doAction: {
      type: Function,
      default: () => {},
    },
  },
};
</script>

<style lang="scss" scoped>
button {
  width: 340px;
  height: 60px;
  padding: 15px 52px;
  background-color: #216097;
  border-radius: 30px;
  span {
    display: inline-block;
    position: relative;
    color: #fff;
    font-family: "NanumSquareNeo", sans-serif;
    font-size: 22px;
    line-height: 32px;
    font-weight: 800;
  }
  &.arrow {
    width: auto;
    span {
      padding-right: 19px;
      &:after {
        content: "";
        position: absolute;
        right: 0;
        top: 0;
        bottom: 0;
        margin: auto;
        display: block;
        width: 9px;
        height: 15px;
        background: url(/icons/icon_arrow_right.png) no-repeat center/100%;
      }
    }
  }
  &.disabled {
    opacity: 0.4;
  }
}
</style>
