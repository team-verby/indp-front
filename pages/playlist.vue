<template>
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
        <v-tab v-for="item in items" :key="item">
          {{ item }}
        </v-tab>
      </v-tabs>

      <v-tabs-items v-model="tab">
        <v-tab-item v-for="item in items" :key="item">
          <ul class="wrapper__place__list">
            <li>
              <img src="" alt="" />
              <div class="place__tag">
                <span>#잔잔한</span>
                <span>#활기찬</span>
              </div>
              <div class="place__info">
                <div class="place">
                  <span class="place__name"> 카페 공명 홍대점 </span>
                  <p class="place__address">
                    서울시 마포구 와우산로17길 11-8서울시 마포구 와우산로17길
                    11-8서울시 마포구 와우산로17길 11-8
                  </p>
                </div>
                <div class="place__playlist">
                  <p class="place__genre">
                    <strong class="text__blue">곡 구성 : </strong>국내가요, 팝,
                    연주곡
                  </p>
                  <Button text="음악 추천하기"></Button>
                </div>
              </div>
            </li>
            <li>
              <img src="" alt="" />
              <div class="place__tag">
                <span>#잔잔한</span>
                <span>#활기찬</span>
              </div>
              <div class="place__info">
                <div class="place">
                  <span class="place__name"> 카페 공명 홍대점 </span>
                  <p class="place__address">
                    서울시 마포구 와우산로17길 11-8서울시 마포구 와우산로17길
                    11-8서울시 마포구 와우산로17길 11-8
                  </p>
                </div>
                <div class="place__playlist">
                  <p class="place__genre">
                    <strong class="text__blue">곡 구성 : </strong>국내가요, 팝,
                    연주곡
                  </p>
                  <Button text="음악 추천하기"></Button>
                </div>
              </div>
            </li>
            <li>
              <img src="" alt="" />
              <div class="place__tag">
                <span>#잔잔한</span>
                <span>#활기찬</span>
              </div>
              <div class="place__info">
                <div class="place">
                  <span class="place__name"> 카페 공명 홍대점 </span>
                  <p class="place__address">서울시 마포구 와우산로17길 11-8</p>
                </div>
                <div class="place__playlist">
                  <p class="place__genre">
                    <strong class="text__blue">곡 구성 : </strong>국내가요, 팝,
                    연주곡
                  </p>
                  <Button text="음악 추천하기"></Button>
                </div>
              </div>
            </li>
            <li>
              <img src="" alt="" />
              <div class="place__tag">
                <span>#잔잔한</span>
                <span>#활기찬</span>
              </div>
              <div class="place__info">
                <div class="place">
                  <span class="place__name"> 카페 공명 홍대점 </span>
                  <p class="place__address">
                    서울시 마포구 와우산로17길 11-8서울시 마포구 와우산로17길
                    11-8서울시 마포구 와우산로17길 11-8
                  </p>
                </div>
                <div class="place__playlist">
                  <p class="place__genre">
                    <strong class="text__blue">곡 구성 : </strong>국내가요, 팝,
                    연주곡
                  </p>
                  <Button text="음악 추천하기"></Button>
                </div>
              </div>
            </li>
            <li>
              <img src="" alt="" />
              <div class="place__tag">
                <span>#잔잔한</span>
                <span>#활기찬</span>
              </div>
              <div class="place__info">
                <div class="place">
                  <span class="place__name"> 카페 공명 홍대점 </span>
                  <p class="place__address">
                    서울시 마포구 와우산로17길 11-8서울시 마포구 와우산로17길
                    11-8서울시 마포구 와우산로17길 11-8
                  </p>
                </div>
                <div class="place__playlist">
                  <p class="place__genre">
                    <strong class="text__blue">곡 구성 : </strong>국내가요, 팝,
                    연주곡
                  </p>
                  <Button text="음악 추천하기"></Button>
                </div>
              </div>
            </li>
          </ul>
        </v-tab-item>
      </v-tabs-items>
    </div>
    <div class="service__request">
      <p>우리 매장도 <strong>인디피 서비스</strong>를 이용하고 싶어요!</p>
      <Button text="이용 문의하기" arrow></Button>
    </div>
    <div class="logo__floating">
      <span class="hidden">VERBY</span>
    </div>
  </div>
</template>

<script>
import Button from "@/components/Button";
export default {
  data() {
    return {
      tab: null,
      items: ["전체", "서울", "경기"],
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    };
  },
  components: {
    Button,
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
        max-width: 410px;
        height: 628px;
        border-radius: 10px;
        overflow: hidden;
        background-color: #fff;
        img {
          width: 100%;
          height: 300px;
          background-color: blue;
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
            height: 134px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            align-items: center;
            .place__genre {
              font-size: 21px;
              font-weight: 800;
              line-height: 29px;
              .text__blue {
                font-weight: 900;
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
</style>
