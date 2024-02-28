<template>
  <v-app>
    <div class="content">
      <h3>
        지금 <strong>인디피</strong>를 이용하는 매장은 <br />어떤
        <strong>음악</strong>이 나오고 있을까?
      </h3>

      <div class="wrapper__tab">
        <v-tabs
          v-model="tab"
          height="auto"
          slider-color="#2686d9"
          :ripple="false"
        >
          <v-tab
            v-for="(item, index) in tabItems"
            :key="index"
            @change="selectTab(item)"
          >
            {{ item }}
          </v-tab>
        </v-tabs>

        <v-window v-model="tab">
          <v-window-item v-for="n in tabItems.length" :key="n">
            <ul class="wrapper__place__list">
              <li v-for="store in stores" :key="store.id">
                <img :src="store.imageUrl" :alt="store.name" />
                <div class="place__tag">
                  <span v-for="theme in store.themes">#{{ theme }}</span>
                </div>
                <div class="place__info">
                  <div class="place">
                    <span class="place__name">{{ store.name }}</span>
                    <p class="place__address">{{ store.address }}</p>
                  </div>
                  <div class="place__playlist">
                    <p class="place__genre">
                      <strong class="text__blue">곡 구성 : </strong>
                      <span v-for="songForm in store.songForms">{{
                        songForm
                      }}</span>
                    </p>
                    <Button
                      text="음악 추천하기"
                      @doAction="openRecommendPopup(store.id)"
                    ></Button>
                  </div>
                </div>
              </li>
            </ul>
          </v-window-item>
        </v-window>
      </div>
      <div class="service__request">
        <p>우리 매장도 <strong>인디피 서비스</strong>를 이용하고 싶어요!</p>
        <Button
          text="이용 문의하기"
          arrow
          @doAction="$router.push({ path: '/contact' })"
        ></Button>
      </div>

      <v-dialog dark v-model="dialog" max-width="1000px">
        <v-card>
          <v-card-title class="d-flex justify-space-between">
            <span>음악 추천하기</span>
            <v-btn
              icon
              @click="
                () => {
                  dialog = false;
                }
              "
            >
              <v-icon x-large aria-label="닫기" role="img">mdi-close</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-form ref="form">
              <span class="label">추천 음악 정보 *</span>
              <v-text-field
                v-model="form.musicInfo"
                maxlength="50"
                height="60"
                :hide-details="true"
                placeholder="매장 테마와 분위기에 어울리는 음악의 가수와 제목을 적어주세요!"
                outlined
                required
              ></v-text-field>
              <span class="label">추천인 연락처 *</span>
              <v-text-field
                :value="form.phone"
                type="text"
                maxlength="50"
                height="60"
                :hide-details="true"
                :hide-spin-buttons="true"
                placeholder="음악을 추천해 주시는 분의 연락처를 적어주세요!"
                outlined
                required
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
                  음악 추천하기 기능과 관련하여 아래와 같이 귀하의 개인정보를
                  수집 및 이용 내용을 개인정보보호법 제 15조(개인정보의
                  수집·이용) 및 통계법 33조(비밀의 보호 등)에 의거하여
                  안내드리니 확인하여 주시기 바랍니다.
                </p>
                <ul>
                  <li>
                    - 개인정보의 수집·이용 목적 : 음악 추천 신청과 연락을 위한
                    연락처 수집
                  </li>
                  <li>- 수집하려는 개인정보의 필수 항목 : 연락처</li>
                  <li>
                    - 개인정보의 보유 및 이용 기간 : 서비스 신청에 대한 절차
                    이후 폐기
                  </li>
                </ul>
              </div>
            </v-form>
          </v-card-text>
          <v-card-actions class="d-flex flex-column justify-center">
            <p
              class="error__text"
              v-show="!form.isFirstValidCheck && showErrorText"
            >
              필수 항목(*) 중 입력되지 않은 영역이 있습니다.
            </p>
            <Button
              text="전송"
              @doAction="validCheck"
              :disabled="!activeFormBtn"
            ></Button>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <Alert
        title="음악 추천 성공"
        content="소중한 선곡 감사합니다.<br/>
더욱 좋은 음악을 선보일 수 있도록 하겠습니다."
        :dialog="form.alert"
        @doAction="resetForm"
      >
      </Alert>
    </div>
  </v-app>
</template>

<script>
import Button from "@/components/Button";
import Alert from "@/components/Alert";
export default {
  name: "PlaylistPage",
  data() {
    return {
      tab: 0,
      tabItems: ["전체", "서울", "경기"],
      selectedRegion: "전체",
      stores: [],
      isFirst: true,
      paging: {
        page: 0,
        hasNext: false,
      },
      selectedStoreId: null,
      form: {
        valid: false,
        isFirstValidCheck: true,
        musicInfo: "",
        phone: "",
        checkbox: false,
        alert: false,
        filledAll: false,
      },
      dialog: false,
      showErrorText: false,
    };
  },
  components: {
    Button,
  },
  watch: {
    dialog: {
      //음악추천 팝업 닫히면 form 리셋
      handler(value, oldValue) {
        !value && this.resetForm();
      },
      immediate: true,
    },
  },
  computed: {
    activeFormBtn() {
      //음악 추천 팝업 > 전송 버튼 활성화 조건
      if (this.form.musicInfo && this.form.phone && this.form.checkbox) {
        this.showErrorText = false;
        return true;
      } else {
        return false;
      }
    },
  },
  mounted() {
    this.drawStoreList();
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
    selectTab(tabItem) {
      this.selectedRegion = tabItem;
      //탭 선택 시 리스트 관련 데이터 초기화
      this.isFirst = true;
      this.paging.page = 0;
      this.paging.hasNext = false;
      this.stores = [];
      this.drawStoreList();
    },
    async getStoreList() {
      const url =
        this.selectedRegion === this.tabItems[0] //"전체"
          ? `https://api.verby.co.kr/api/stores?page=${this.paging.page}&size=10`
          : `https://api.verby.co.kr/api/stores?page=${this.paging.page}&size=10&region=${this.selectedRegion}`;
      const { data } = await this.$axios.get(url).catch(function (error) {
        alert(error.message);
      });
      this.paging.hasNext = data.pageInfo.hasNext;
      return data.stores;
    },
    async drawStoreList() {
      if (this.isFirst) {
        this.stores = await this.getStoreList();
        this.isFirst = false;
        this.paging.hasNext && this.drawStoreList();
      } else {
        if (this.paging.hasNext) {
          this.paging.page++;
          const stores = await this.getStoreList();
          this.stores = [...this.stores, ...stores];
          this.paging.hasNext && this.drawStoreList();
        } else {
          return;
        }
      }
    },
    openRecommendPopup(storeId) {
      this.dialog = true;
      this.selectedStoreId = storeId;
    },
    validCheck() {
      this.form.isFirstValidCheck = false; //처음 팝업 진입 시에는 오류 메세지 안 보이고 전송 버튼 눌렀을 때 보이도록
      if (this.form.musicInfo && this.form.phone && this.form.checkbox) {
        //필수항목 다 입력
        this.form.valid = true;
        this.showErrorText = false;
        this.sendRecommend();
      } else {
        //필수항목 중 미입력값 있음
        this.errorTextFirstShow = false;
        this.form.valid = false;
        this.showErrorText = true;
      }
    },
    async sendRecommend() {
      const payload = {
        storeId: this.selectedStoreId,
        information: this.form.musicInfo,
        phoneNumber: this.form.phone,
      };
      const response = await this.$axios.post(
        "https://api.verby.co.kr/api/music/recommendations",
        payload
      );
      if (response.status === 201) {
        this.form.alert = true;
      }
    },
    resetForm() {
      this.form.alert = false;
      this.form.musicInfo = "";
      this.form.phone = "";
      this.form.checkbox = false;
      this.showErrorText = false;
      this.dialog = false;
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../../assets/scss/mixin";
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
  h3 {
    font-family: $content-font;
    font-size: 58px;
    font-weight: 400;
    line-height: 74px;
    color: #fff;
    text-align: center;
    strong {
      font-weight: 900;
    }
  }
  .wrapper__tab {
    width: 100%;
    margin-top: 100px;

    .wrapper__place__list {
      display: flex;
      gap: 35px;
      flex-wrap: wrap;
      margin-top: 55px;
      li {
        position: relative;
        width: 410px;
        height: 628px;
        border-radius: 10px;
        overflow: hidden;
        background-color: #fff;
        img {
          display: block;
          width: 100%;
          height: 300px;
        }
        .place__tag {
          position: absolute;
          left: 20px;
          top: 20px;
          span {
            display: inline-block;
            width: 106px;
            height: 40px;
            border-radius: 20.5px;
            background-color: rgba(255, 255, 255, 0.7);
            font-family: $content-font;
            font-size: 18px;
            font-weight: 800;
            line-height: 40px;
            text-align: center;
            + span {
              margin-left: 6px;
            }
            &:nth-child(3n + 1) {
              margin-left: 0;
            }
            &:nth-child(n + 4) {
              margin-top: 10px;
            }
          }
        }
        .place__info {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          height: calc(100% - 300px);
          padding: 40px 35px;
          font-family: $content-font;
          color: #000;
          .place {
            display: flex;
            flex-direction: column;
            align-items: center;
            .place__name {
              font-size: 26px;
              font-weight: 800;
            }
            .place__address {
              margin-top: 20px;
              font-size: 18px;
              font-weight: 400;
              overflow: hidden;
              display: -webkit-box;
              -webkit-box-orient: vertical;
              -webkit-line-clamp: 2;
            }
          }
          .place__playlist {
            width: 100%;
            height: 134px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            align-items: center;
            text-align: center;
            .place__genre {
              font-size: 21px;
              font-weight: 800;
              line-height: 29px;
              display: -webkit-box;
              -webkit-box-orient: vertical;
              -webkit-line-clamp: 2;
              .text__blue {
                font-weight: 900;
              }
              span {
                display: inline-block;
                position: relative;
                + span {
                  padding-left: 8px;
                  &:before {
                    content: ",";
                    display: block;
                    position: absolute;
                    left: 0;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  .service__request {
    display: flex;
    gap: 40px;
    margin-top: 100px;
    p {
      font-family: $content-font;
      font-size: 48px;
      font-weight: 400;
      line-height: 64px;
      color: #fff;
      strong {
        font-weight: 900;
      }
    }
  }
}

.v-dialog {
  .v-card {
    .v-card__title {
      font-family: $content-font;
      font-size: 32px;
      font-weight: 800;
      padding: 64px;
    }
    .v-card__text {
      padding: 0 64px;
      .v-form {
        width: 100%;
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
    }
    .v-card__actions {
      padding: 64px;
      .error__text {
        margin-bottom: 16px !important;
      }
    }
  }
}

@include desktopToLaptop {
  .content {
    .wrapper__tab {
      .wrapper__place__list {
        display: flex;
        gap: 30px;
        flex-wrap: wrap;
        margin-top: 55px;
        li {
          width: calc((100% - 60px) / 3);
          .place__info {
            padding: 40px 25px;
            .place__playlist {
              button {
                width: 100% !important;
              }
            }
          }
        }
      }
    }
    .service__request p {
      font-size: 38px;
    }
  }
}
</style>
