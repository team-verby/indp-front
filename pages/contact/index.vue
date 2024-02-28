<template>
  <v-app>
    <div class="content">
      <div class="title">
        <h3>CONTACT</h3>
        <p>문의를 남겨주시면 연락드리도록 하겠습니다.</p>
      </div>
      <v-form ref="form" dark>
        <span class="label">문의 내용 *</span>
        <v-textarea
          v-model="form.question"
          height="300"
          maxlength="150"
          dark
          no-resize
          outlined
          :hide-details="true"
        ></v-textarea>
        <span class="label">문의자(본인) 성함 *</span>
        <v-text-field
          v-model="form.name"
          height="60"
          maxlength="50"
          dark
          outlined
          required
          :hide-details="true"
        ></v-text-field>
        <span class="label">문의자(본인) 연락처 *</span>
        <v-text-field
          :value="form.phone"
          type="text"
          height="60"
          maxlength="50"
          dark
          outlined
          required
          :hide-details="true"
          :hide-spin-buttons="true"
          ref="phoneRef"
          @input="bindInputPhone"
          @keyup.delete="bindDeletePhone"
        ></v-text-field>
        <v-checkbox
          v-model="form.checkbox"
          :label="'개인 정보 수집 및 이용 동의'"
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
        <p
          class="error__text"
          v-show="!form.isFirstValidCheck && showErrorText"
        >
          필수 항목(*) 중 입력되지 않은 영역이 있습니다.
        </p>
        <Button
          text="문의 등록"
          @doAction="validCheck"
          :disabled="!activeFormBtn"
        ></Button>
      </div>
      <div class="logo__floating">
        <span class="hidden">VERBY</span>
      </div>
      <Alert
        title="문의 등록 성공"
        content="문의 남겨주셔서 감사합니다. <br/>
빠른 시일 내 연락드리도록 하겠습니다."
        :dialog="form.alert"
        @doAction="resetForm"
      >
      </Alert></div
  ></v-app>
</template>
<script>
import Button from "@/components/Button";
import Alert from "@/components/Alert";

export default {
  name: "ContactPage",
  data() {
    return {
      form: {
        valid: false,
        isFirstValidCheck: true,
        question: "",
        name: "",
        phone: "",
        checkbox: false,
        alert: false,
      },
      showErrorText: false,
    };
  },
  components: {
    Button,
  },
  computed: {
    activeFormBtn() {
      //문의등록 버튼 활성화 조건
      if (
        this.form.question &&
        this.form.name &&
        this.form.phone &&
        this.form.checkbox
      ) {
        this.showErrorText = false;
        return true;
      } else {
        return false;
      }
    },
  },
  methods: {
    bindInputPhone(value) {
      //연락처필드 숫자 제외 입력 방지
      const latestInputWord = value[value.length - 1];
      const REG_PHONE = /[0-9]+$/;
      if (REG_PHONE.test(latestInputWord)) {
        this.$refs.phoneRef.lazyValue = value;
        this.form.phone = value;
      } else {
        this.$refs.phoneRef.lazyValue = value.replace(latestInputWord, "");
      }
    },
    bindDeletePhone() {
      //연락처필드 backspace 이벤트 감지 후 value binding
      if (this.$refs.phoneRef.value.length === 1) {
        this.form.phone = "";
      } else {
        this.form.phone = this.$refs.phoneRef.value;
      }
    },
    validCheck() {
      this.form.isFirstValidCheck = false; //처음 팝업 진입 시에는 오류 메세지 안 보이고 전송 버튼 눌렀을 때 보이도록
      if (
        this.form.question &&
        this.form.name &&
        this.form.phone &&
        this.form.checkbox
      ) {
        //필수항목 다 입력
        this.form.valid = true;
        this.sendQuestion();
      } else {
        //필수항목 중 미입력값 있음
        this.form.valid = false;
        this.showErrorText = true;
      }
    },
    async sendQuestion() {
      const payload = {
        userName: this.form.name,
        content: this.form.question,
        phoneNumber: this.form.phone,
      };
      const response = await this.$axios
        .post("https://api.verby.co.kr/api/contacts", payload)
        .catch(function (error) {
          alert(error.message);
        });
      if (response.status === 201) {
        this.form.alert = true;
      }
    },
    resetForm() {
      this.form.alert = false;
      this.form.question = "";
      this.form.name = "";
      this.form.phone = "";
      this.form.checkbox = false;
      this.showErrorText = false;
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
  padding-top: 250px;
  padding-bottom: 150px;
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
    .error__text {
      margin-bottom: 40px !important;
    }
  }
}
</style>
