<template>
  <v-app>
    <div class="visual">
      <h3 class="visual__text">
        매장 음악 플레이리스트 <br />버비가 대신 만들어 드립니다.
      </h3>
      <p class="visual__description">
        매일 똑같은 음악, 지겨우시죠? 아침마다 음악 고르기, 힘드시죠? <br />
        <strong>매장분위기</strong>와 <strong>영업시간</strong>에 맞게
        <strong>플레이리스트 설정</strong>해 드릴게요!
      </p>
      <a href="#main" class="visual__scroll">SCROLL</a>
    </div>
    <div class="content">
      <div id="main" class="content__main">
        <h3 class="content__main-title">
          <p>버비가 제공하는 인디펜던트 뮤직 서비스</p>
          <strong>INDIE-PENDANT MUSIC</strong>이란?
        </h3>
        <div class="content__main-text">
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
        <p class="content__service-title">서비스는 어떻게 진행하나요?</p>
        <div class="content__service-steps">
          <ul class="service-steps">
            <li class="service-steps__step">
              <strong class="service-steps__step-text">STEP 1</strong>
              <p class="service-steps__step-content">
                아래 <span class="text__blue">연락처</span>혹은 <br />
                <span class="text__blue">‘문의하기'</span> 버튼을 통해
                <br />문의를 남겨주세요.
              </p>
            </li>
            <li class="service-steps__step">
              <strong class="service-steps__step-text">STEP 2</strong>
              <p class="service-steps__step-content">
                매장 방문을 위한 <br /><span class="text__blue">스케쥴</span>을
                조율합니다.
              </p>
            </li>
            <li class="service-steps__step">
              <strong class="service-steps__step-text">STEP 3</strong>
              <p class="service-steps__step-content">
                직접 매장에 방문하여 <br />
                <span class="text__blue">사진 촬영</span> 및
                <span class="text__blue">매장 분석</span>을 <br />진행합니다.
              </p>
            </li>
            <li class="service-steps__step">
              <strong class="service-steps__step-text">STEP 4</strong>
              <p class="service-steps__step-content">
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
          <dl class="contact-details">
            <dt class="hidden">연락처</dt>
            <dd class="contact-details__phone">010-6310-4478</dd>
            <dt class="hidden">메일</dt>
            <dd class="contact-details__mail">verbykorea@gmail.com</dd>
          </dl>
        </div>
      </div>
      <div class="content__place" v-if="!isFirst && !paging.hasNext">
        <p class="content__place-title">
          인디펜던트 뮤직 서비스를 <br />이용하고 있는 공간
        </p>
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
import swiper from "swiper";

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
        breakpoints: {
          1920: {
            slidesPerView: "auto",
          },
          1919: {
            slidesPerView: 4,
          },
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
    window.addEventListener("resize", this.handleResize);
    this.drawStoreList();
  },
  methods: {
    handleResize() {
      //window resize시 스와이프 업데이트
      const swiper = document.querySelector(".swiper-container").swiper;
      swiper.update();
      // //1920보다 작을 때 스와이프 4개 노출 & 업데이트
      // let width = window.innerWidth;
      // if (width < 1920) {
      //   swiper.update();
      // }
    },
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
        .get(`/api/main/stores?page=${this.paging.page}&size=10`)
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
@import "../assets/scss/main.scss";
</style>
