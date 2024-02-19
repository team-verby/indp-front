<template>
  <section id="container">
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
      <div class="visual__logo__floating">
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
        <Button text="문의하기"></Button>
        <div class="service__contact">
          <dl>
            <dt class="hidden">연락처</dt>
            <dd class="contact__phone">010-6310-4478</dd>
            <dt class="hidden">메일</dt>
            <dd class="contact__mail">verbykorea@gmail.com</dd>
          </dl>
        </div>
      </div>
      <div class="content__place">
        <p>인디펜던트 뮤직 서비스를 <br />이용하고 있는 공간</p>
        <swiper class="swiper" :options="swiperOption">
          <swiper-slide>
            <img src="" alt="" />
            <div class="place__info">
              <span class="place__name">카페 공명1</span>
              <p class="place__address">
                서울시 마포구 와우산로17길 11-8서울시 마포구 와우산로17길 11-8
              </p>
            </div>
          </swiper-slide>
          <swiper-slide>
            <img src="" alt="" />
            <div class="place__info">
              <span class="place__name">카페 공명2</span>
              <p class="place__address">
                서울시 마포구 와우산로17길 11-8서울시 마포구 와우산로17길 11-8
              </p>
            </div>
          </swiper-slide>
          <swiper-slide>
            <img src="" alt="" />
            <div class="place__info">
              <span class="place__name">카페 공명3</span>
              <p class="place__address">
                서울시 마포구 와우산로17길 11-8서울시 마포구 와우산로17길 11-8
              </p>
            </div>
          </swiper-slide>
          <swiper-slide>
            <img src="" alt="" />
            <div class="place__info">
              <span class="place__name">카페 공명4</span>
              <p class="place__address">
                서울시 마포구 와우산로17길 11-8서울시 마포구 와우산로17길 11-8
              </p>
            </div>
          </swiper-slide>
          <swiper-slide>
            <img src="" alt="" />
            <div class="place__info">
              <span class="place__name">카페 공명5</span>
              <p class="place__address">
                서울시 마포구 와우산로17길 11-8서울시 마포구 와우산로17길 11-8
              </p>
            </div>
          </swiper-slide>
          <swiper-slide>
            <img src="" alt="" />
            <div class="place__info">
              <span class="place__name">카페 공명6</span>
              <p class="place__address">
                서울시 마포구 와우산로17길 11-8서울시 마포구 와우산로17길 11-8
              </p>
            </div>
          </swiper-slide>
          <div class="swiper-button-prev" slot="button-prev"></div>
          <div class="swiper-button-next" slot="button-next"></div>
        </swiper>
        <Button text="더 많은 공간 보러가기"></Button>
      </div>
    </div>
  </section>
</template>

<script>
import Button from "@/components/Button";
import { Swiper, SwiperSlide } from "vue-awesome-swiper";
import "swiper/css/swiper.css";

export default {
  name: "IndexPage",
  data() {
    return {
      testData: ["props-1", "props-2", "props-3"],
      swiperOption: {
        slidesPerView: 6,
        spaceBetween: 30,
        loop: true,
        navigation: {
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
        },
      },
    };
  },
  components: {
    Button,
    Swiper,
    SwiperSlide,
  },
};
</script>

<style lang="scss" scoped>
$content-font: "NanumSquareNeo";
#container {
  width: 100%;
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

    .visual__logo__floating {
      position: absolute;
      right: 30px;
      bottom: 30px;
      width: 70px;
      height: 70px;
      background: url(/images/logo_floating.png) no-repeat center/100%;
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
      p {
        font-family: $content-font;
        font-size: 40px;
        font-weight: 900;
        line-height: 52px;
        color: #fff;
      }
      .swiper {
        margin: 60px 0;
        .swiper-slide {
          width: 304px !important;
          height: 434px;
          border-radius: 10px;
          background-color: red;
          overflow: hidden;
          img {
            width: 100%;
            height: 300px;
            background-color: yellow;
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
            left: 304px;
            &:after {
              background-image: url(/icons/icon_btn_arrow_left.png);
            }
          }
          &.swiper-button-next {
            &:after {
              background-image: url(/icons/icon_btn_arrow_right.png);
            }
          }
        }
      }
    }
  }
}
</style>
