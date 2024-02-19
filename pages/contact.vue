<template>
  <div class="content">
    <div class="title">
      <h3>CONTACT</h3>
      <p>문의를 남겨주시면 연락드리도록 하겠습니다.</p>
    </div>
    <v-form ref="form" v-model="valid" lazy-validation>
      <span class="label">문의 내용 *</span>
      <v-textarea
        v-model="question"
        height="300"
        no-resize
        outlined
        :hide-details="true"
        value="The Woodman set to work at once, and so sharp was his axe that the tree was soon chopped nearly through."
      ></v-textarea>
      <span class="label">문의자(본인) 성함 *</span>
      <v-text-field
        v-model="name"
        :rules="emailRules"
        :hide-details="true"
        height="60"
        outlined
        required
      ></v-text-field>
      <span class="label">문의자(본인) 연락처 *</span>
      <v-text-field
        v-model="phone"
        :rules="emailRules"
        :hide-details="true"
        height="60"
        outlined
        required
      ></v-text-field>
      <v-checkbox
        v-model="checkbox"
        :label="'개인 정보 수집 및 이용 동의'"
        color="red"
        :hide-details="true"
        :ripple="false"
      ></v-checkbox>
      <div class="clause">
        <p>
          음악 추천하기 기능과 관련하여 아래와 같이 귀하의 개인정보를 수집 및
          이용 내용을 개인정보보호법 제 15조(개인정보의 수집·이용) 및 통계법
          33조(비밀의 보호 등)에 의거하여 안내드리니 확인하여 주시기 바랍니다.
        </p>
        <ul>
          <li>
            - 개인정보의 수집·이용 목적 : 음악 추천 신청과 연락을 위한 연락처
            수집
          </li>
          <li>- 수집하려는 개인정보의 필수 항목 : 연락처</li>
          <li>
            - 개인정보의 보유 및 이용 기간 : 서비스 신청에 대한 절차 이후 폐기
          </li>
        </ul>
      </div>
    </v-form>
    <div class="form__submit">
      <p :class="['error', !valid ? 'show' : '']">
        필수 항목(*) 중 입력되지 않은 영역이 있습니다.
      </p>
      <Button text="문의 등록"></Button>
    </div>
    <div class="logo__floating">
      <span class="hidden">VERBY</span>
    </div>
  </div>
</template>
<script>
import Button from "@/components/Button";

export default {
  name: "IndexPage",
  data() {
    return {
      valid: false,
      question: "",
      name: "",
      nameRules: [
        (v) => !!v || "Name is required",
        (v) => (v && v.length <= 10) || "Name must be less than 10 characters",
      ],
      phone: "",
      emailRules: [
        (v) => !!v || "E-mail is required",
        (v) => /.+@.+\..+/.test(v) || "E-mail must be valid",
      ],
      select: null,
      items: ["Item 1", "Item 2", "Item 3", "Item 4"],
      checkbox: false,
    };
  },
  components: {
    Button,
  },
  methods: {
    validate() {
      this.$refs.form.validate();
    },
    reset() {
      this.$refs.form.reset();
    },
    resetValidation() {
      this.$refs.form.resetValidation();
    },
  },
};
</script>

<style lang="scss" scoped>
$content-font: "NanumSquareNeo";
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 250px 309px 150px;
  background-color: #161617;
  background-image: url("/images/bg_gradient01.png"),
    url("/images/bg_gradient02.png");
  background-size: 100% 100%, 100% 100%;
  background-position: left top, right bottom;

  .title {
    font-family: $content-font;
    color: #fff;
    text-align: center;
    h3 {
      font-size: 58px;
      font-weight: 900;
      line-height: 74px;
    }
    p {
      font-size: 22px;
      font-weight: 400;
      line-height: 32px;
      margin-top: 40px;
    }
  }
  .v-form {
    width: 100%;
    margin-top: 100px;
    & > * {
      font-family: $content-font;
    }
    .label {
      display: inline-block;
      font-size: 18px;
      font-weight: 800;
      line-height: 32px;
      color: #fff;
      margin-bottom: 20px;
    }
    .v-input {
      + .label {
        margin-top: 38px;
      }
    }
    .v-input--checkbox {
      margin-top: 60px;
      .v-label {
        color: #fff !important;
      }
    }
    .clause {
      font-size: 18px;
      font-weight: 400;
      color: rgba(255, 255, 255, 0.7);
      margin-top: 20px;
      ul {
        margin-top: 12px;
        li {
          + li {
            margin-top: 12px;
          }
        }
      }
    }
  }
  .form__submit {
    margin-top: 120px;
    .error {
      display: none;
      &.show {
        display: block;
        margin-bottom: 40px;
      }
    }
  }
}
</style>
