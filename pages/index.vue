<template>
  <v-app>
    <div class="visual">
      <h3 class="visual__text">
        매장 음악 플레이리스트 <br />버비가 대신 만들어 드립니다.
      </h3>
      <p>
        매일 똑같은 음악, 지겨우시죠? 아침마다 음악 고르기, 힘드시죠? <br />
        <strong>매장분위기</strong>와 <strong>영업시간</strong>에 맞게
        <strong>플레이리스트 설정</strong>해 드릴게요!
      </p>
      <a href="#main" class="scroll">SCROLL</a>
      <div class="logo__floating">
        <span class="hidden">VERBY</span>
      </div>
    </div>
    <div class="content">
      <div id="main" class="content__main">
        <h3>
          <p>버비가 제공하는 인디펜던트 뮤직 서비스</p>
          <strong>INDIE-PENDANT MUSIC</strong>이란?
        </h3>
        <div class="content__main__text">
          <p>
            인디펜던트 뮤직은 공간 음악 큐레이팅 서비스입니다. <br />
            매장 분위기와 컨셉에 잘 어울리는 음악으로 당신의 매장을 인테리어
            해보세요.
          </p>
          <p>
            매장 영업 시간, 사용하는 플랫폼에 맞게 플레이리스트를 구성해드리고
            있어요!
          </p>
        </div>
      </div>
      <div class="content__service">
        <p>서비스는 어떻게 진행하나요?</p>
        <div class="wrap__service__step">
          <ul class="service__steps">
            <li>
              <strong class="text__step">STEP 1</strong>
              <p class="cont">
                아래 <span class="text__blue">연락처</span>혹은 <br />
                <span class="text__blue">‘문의하기'</span> 버튼을 통해
                <br />문의를 남겨주세요.
              </p>
            </li>
            <li>
              <strong class="text__step">STEP 2</strong>
              <p class="cont">
                매장 방문을 위한 <br /><span class="text__blue">스케쥴</span>을
                조율합니다.
              </p>
            </li>
            <li>
              <strong class="text__step">STEP 3</strong>
              <p class="cont">
                직접 매장에 방문하여 <br />
                <span class="text__blue">사진 촬영</span> 및
                <span class="text__blue">매장 분석</span>을 <br />진행합니다.
              </p>
            </li>
            <li>
              <strong class="text__step">STEP 4</strong>
              <p class="cont">
                매장 분석이 완료되면 <br />사용하고 계신 플랫폼에 맞게<br />
                <span class="text__blue">플레이리스트</span>를 전달드립니다.
              </p>
            </li>
          </ul>
        </div>
        <Button
          text="문의하기"
          arrow
          @doAction="$router.push({ path: '/contact' })"
        ></Button>
        <div class="service__contact">
          <dl>
            <dt class="hidden">연락처</dt>
            <dd class="contact__phone">010-6310-4478</dd>
            <dt class="hidden">메일</dt>
            <dd class="contact__mail">verbykorea@gmail.com</dd>
          </dl>
        </div>
      </div>
      <div class="content__place" v-if="!isFirst && !paging.hasNext">
        <p>인디펜던트 뮤직 서비스를 <br />이용하고 있는 공간</p>
        <swiper class="swiper" :options="swiperOption">
          <swiper-slide v-for="store in stores" :key="store.id">
            <img :src="store.imageUrl" :alt="store.name" />
            <div class="place__info">
              <span class="place__name">{{ store.name }}</span>
              <p class="place__address">
                {{ store.address }}
              </p>
            </div>
          </swiper-slide>
          <div class="swiper-button-prev" slot="button-prev"></div>
          <div class="swiper-button-next" slot="button-next"></div>
        </swiper>
        <Button
          text="더 많은 공간 보러가기"
          arrow
          @doAction="$router.push({ path: '/playlist' })"
        ></Button>
      </div>
    </div>
  </v-app>
</template>

<script>
import Button from "@/components/Button";
import { Swiper, SwiperSlide } from "vue-awesome-swiper";
import "swiper/css/swiper.css";

export default {
  name: "MainPage",
  data() {
    return {
      swiperOption: {
        slidesPerView: "auto",
        spaceBetween: 30,
        loop: true,
        navigation: {
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
        },
      },
      isFirst: true,
      paging: {
        page: 0,
        hasNext: false,
      },
      stores: [],
    };
  },
  components: {
    Button,
    Swiper,
    SwiperSlide,
  },
  watch: {
    isFirst: {
      //첫번쨰 조회가 끝나고 data 개수가 6개보다 적으면 swiper-item 복제
      handler(value) {
        !value && !this.paging.hasNext && this.copySwiperItem();
      },
      immediate: true,
    },
  },
  mounted() {
    this.drawStoreList();
  },
  methods: {
    copySwiperItem() {
      //swiper item 개수가 6개보다 작을 때 복제해서 사용
      if (this.stores.length < 6) {
        for (let i = 0; i < 2; i++) {
          if (this.stores.length > 8) {
            break;
          }
          this.stores = this.stores.concat(this.stores);
        }
        this.stores = this.stores.map((store, index) => {
          return { ...store, id: index };
        });
      }
    },
    async getStoreList() {
      const { data } = await this.$axios
        .get(`/api/main/stores?page=${this.paging.page}&size=2`)
        .catch(function (error) {
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
  },
};
</script>

<style lang="scss" scoped>
$content-font: "NanumSquareNeo";
.visual {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 100%;
  height: 950px;
  padding: 0 309px;
  background: url(/images/bg_main01.png) no-repeat top left/100% 100%;
  .visual__text {
    font-size: 68px;
    color: #fff;
    font-weight: 800;
    text-align: center;
    line-height: 82px;
    & + p {
      font-family: $content-font;
      font-weight: 400;
      margin-top: 60px;
      color: rgba(255, 255, 255, 0.8);
      font-size: 22px;
      line-height: 32px;
      strong {
        font-weight: 800;
      }
    }
  }
  .scroll {
    position: absolute;
    bottom: 40px;
    left: 0;
    right: 0;
    text-align: center;
    font-family: $content-font;
    font-weight: 400;
    line-height: 32px;
    color: #fff;
    &:after {
      content: "";
      display: block;
      width: 15px;
      height: 18px;
      margin: 0 auto;
      background: url(/icons/icon_scroll.png) no-repeat center/100%;
    }
  }
}
.content {
  text-align: center;
  & > div {
    padding: 0 309px;
  }
  .content__main {
    padding: 150px 0;
    background-color: #010a14;
    background-image: url(/images/bg_main02.png);
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
    h3 {
      font-weight: 800;
      font-size: 54px;
      line-height: 32px;
      color: rgba(255, 255, 255, 0.7);
      p {
        font-family: $content-font;
        font-weight: 400;
        font-size: 22px;
        line-height: 32px;
        color: rgba(255, 255, 255, 0.8);
        margin-bottom: 20px;
      }
      strong {
        font-weight: 800;
        font-size: 70px;
        line-height: 32px;
        color: #2686d9;
        margin-right: 15px;
      }
    }
    .content__main__text {
      margin-top: 100px;
      p {
        font-family: $content-font;
        &:first-of-type {
          font-weight: 800;
          font-size: 36px;
          line-height: 46px;
          color: rgba(255, 255, 255, 0.8);
        }
        &:last-of-type {
          font-weight: 400;
          font-size: 22px;
          line-height: 32px;
          color: #fff;
          margin-top: 40px;
        }
      }
    }
  }
  .content__service {
    padding-top: 150px;
    padding-bottom: 80px;
    background-color: #09121b;
    p {
      font-family: $content-font;
      font-size: 42px;
      font-weight: 900;
      line-height: 54px;
      color: #fff;
    }
    .wrap__service__step {
      margin-top: 60px;
      .service__steps {
        display: flex;
        justify-content: space-between;
        gap: 34px;
        li {
          display: flex;
          flex-direction: column;
          width: 300px;
          height: 300px;
          padding: 39px 0 45px;
          background-color: #172028;
          border: 1px solid #2e3d4a;
          border-radius: 10px;
          .text__step {
            font-family: $content-font;
            font-size: 24px;
            line-height: 28px;
            font-weight: 900;
            color: #fff;
            &:after {
              content: "";
              display: block;
              width: 50px;
              height: 50px;
              margin: 42px auto 0;
              background-repeat: no-repeat;
              background-size: 100%;
            }
          }
          .cont {
            font-size: 18px;
            font-weight: 400;
            line-height: 28px;
            color: #fff;
            margin-top: 29px;
            .text__blue {
              font-weight: 800;
            }
          }
        }
        @for $i from 1 through 4 {
          li:nth-child(#{$i}) {
            .text__step {
              &:after {
                background-image: url(/icons/icon_step0#{$i}.png);
              }
            }
          }
        }
      }
    }
    button {
      margin-top: 40px;
    }
    .service__contact {
      margin-top: 48px;
      dl {
        display: flex;
        justify-content: center;
        gap: 27px;
        dd {
          position: relative;
          padding-left: 34px;
          font-family: $content-font;
          font-size: 18px;
          line-height: 32px;
          font-weight: 400;
          color: #fff;
          &:before {
            content: "";
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            margin: auto;
            display: block;
            width: 24px;
            background-repeat: no-repeat;
            background-size: 100%;
          }
          &.contact__phone {
            &:before {
              height: 24px;
              background-image: url(/icons/icon_phone.png);
            }
          }
          &.contact__mail {
            &:before {
              height: 18px;
              background-image: url(/icons/icon_email.png);
            }
          }
        }
      }
    }
  }
  .content__place {
    background: url(/images/bg_main03.png) no-repeat top left/100% 100%;
    padding: 150px 0;
    overflow: hidden;
    p {
      font-family: $content-font;
      font-size: 40px;
      font-weight: 900;
      line-height: 52px;
      color: #fff;
    }
    .swiper {
      margin: 60px -25px;
      .swiper-slide {
        width: 304px !important;
        height: 434px;
        border-radius: 10px;
        background-color: #fff;
        overflow: hidden;
        &.swiper-slide-active {
          opacity: 0.7;
          + .swiper-slide
            + .swiper-slide
            + .swiper-slide
            + .swiper-slide
            + .swiper-slide {
            opacity: 0.7;
          }
        }
        img {
          display: block;
          width: 100%;
          height: 300px;
        }
        .place__info {
          height: calc(100% - 300px);
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 0 36px;
          .place__name {
            font-family: $content-font;
            font-size: 18px;
            font-weight: 800;
            line-height: 32px;
            color: #000;
          }
          .place__address {
            font-family: $content-font;
            font-size: 16px;
            font-weight: 400;
            line-height: 24px;
            color: #000;
            overflow: hidden;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
          }
        }
      }
      div[class^="swiper-button"] {
        width: 72px;
        height: 72px;
        border-radius: 50%;
        background-color: #fff;
        &:after {
          content: "";
          width: 18px;
          height: 28px;
        }
        &.swiper-button-prev {
          justify-content: flex-start;
          padding-left: 24px;
          left: 298px;
          &:after {
            background-image: url(/icons/icon_btn_arrow_left.png);
          }
        }
        &.swiper-button-next {
          justify-content: flex-start;
          padding-left: 30px;
          right: 284px;
          &:after {
            background-image: url(/icons/icon_btn_arrow_right.png);
          }
        }
      }
    }
  }
}
</style>
