<template>
  <div>
    <div class="visual">
      <p>안녕하세요, 버비입니다.</p>
      <h3 class="visual__text">
        버비는 음악이라는 마법을 통해 <br />세상을 더 아름답게 만들고자 하는
        <br />비전을 가지고 설립되었습니다.
      </h3>
      <p>
        <strong>음악</strong>으로 <strong>희망, 위로, 감동</strong>을 전하며,
        <br />
        듣는 이를 변화시키고 더 나아가 세상을 아름답게 만들어 보겠습니다.
      </p>
      <p>두근거리는 여정을 버비와 함께하세요!</p>
      <div class="logo__floating">
        <span class="hidden">VERBY</span>
      </div>
    </div>
    <div class="content">
      <p class="content__title">
        <span>BRAND LOGO</span>
        <span>IDENTITY</span>
      </p>
      <div class="content__logo__img">
        <div class="box__logo__img">
          <img src="/images/logo_about.png" alt="VERBY 로고" />
        </div>
        <div class="logo__info">
          <p class="logo__info__title">
            단순함 속 우아함, 차분함, 평화로움, 열린 사고, 소통
          </p>
          <p class="logo__info__text">
            버비를 상징하는 로고는 클래식 블루 컬러의 단순 텍스트 기반
            레터마크입니다. <br />클래식 블루는 해 질 무렵의 푸르스름한 하늘을
            암시하며, <br />불확실성이 많은 세상에서 보다 차분하고 평화로움을
            느낄 수 있도록 합니다.
          </p>
          <div class="logo__info__img">
            <div class="img__box">
              <img src="/images/img_about01.png" alt="" />
            </div>
            <div class="img__box">
              <img src="/images/img_about02.png" alt="" />
            </div>
            <div class="img__box">
              <img src="/images/img_about03.png" alt="" />
            </div>
          </div>
        </div>
      </div>
      <div class="content__logo__style">
        <p class="logo__style__title">
          Pantone PMS 19-4052 TCX Classic Blue or Black / Days sans black /
          Regular
        </p>
        <p class="logo__style__text">
          버비는 팬톤 컬러의 클래식 블루와 블랙을 활용하며, <br />Day sans black
          폰트의 Regular 사이즈를 사 용합니다.
        </p>
        <div class="logo__style__list">
          <div class="logo__type">
            <div class="box white">
              <img src="/images/logo_blue.png" alt="VERBY 클래식 블루 로고" />
            </div>
            <div class="logo__type__info">
              <span class="color">클래식 블루</span>
              <p class="style">
                CMYK 100 / 76 / 25 / 0 <br />sRGB 15 / 76 / 129 <br />HTML / HEX
                #0f4c81
              </p>
            </div>
          </div>
          <div class="logo__type">
            <div class="box white">
              <img src="/images/logo_black.png" alt="VERBY 클래식 블랙 로고" />
            </div>
            <div class="logo__type__info">
              <span class="color">블랙</span>
              <p class="style">
                CMYK 0 / 0 / 0 / 100 <br />sRGB 0 / 0 / 0 <br />HTML / HEX
                #000000
              </p>
            </div>
          </div>
          <div class="logo__type">
            <div class="box blue">
              <img
                src="/images/logo_white.png"
                alt="VERBY 클래식 화이트 로고"
              />
            </div>
            <div class="logo__type__info">
              <span class="color">화이트/클래식 블루</span>
              <p class="style">
                CMYK 0 / 0 / 0 / 0 <br />sRGB 255 / 255 / 255 <br />HTML / HEX
                #ffffff
              </p>
            </div>
          </div>
          <div class="logo__type">
            <div class="box black">
              <img
                src="/images/logo_white.png"
                alt="VERBY 클래식 화이트 로고"
              />
            </div>
            <div class="logo__type__info">
              <span class="color">화이트/블랙</span>
              <p class="style">
                CMYK 0 / 0 / 0 / 0 <br />sRGB 255 / 255 / 255 <br />HTML / HEX
                #ffffff
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "AboutPage",
};
</script>

<style lang="scss" scoped>
@import "../../assets/scss/mixin";
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
  background: url(/images/bg_about.png) no-repeat top left/100% 100%;
  .visual__text {
    font-family: $content-font;
    font-size: 58px;
    color: #fff;
    font-weight: 900;
    text-align: center;
    line-height: 72px;
    margin-top: 40px;
    + p {
      margin-top: 60px;
    }
  }
  p {
    font-family: $content-font;
    font-weight: 400;
    color: rgba(255, 255, 255, 0.7);
    font-size: 22px;
    line-height: 32px;
    text-align: center;
    strong {
      font-weight: 800;
    }
    + p {
      margin-top: 36px;
    }
  }
}
.content {
  padding-top: 150px;
  padding-bottom: 150px;
  background-color: #161617;
  text-align: center;
  .content__title {
    span {
      display: inline-block;
      font-size: 54px;
      font-weight: 700;
      line-height: 64px;
      color: #fff;
      + span {
        position: relative;
        padding-left: 36px;
        &:before {
          content: "";
          position: absolute;
          display: block;
          left: 16px;
          top: 0;
          bottom: 0;
          margin: auto;
          width: 4px;
          height: 38px;
          background-color: rgba(255, 255, 255, 0.4);
        }
      }
    }
  }
  .content__logo__img {
    margin-top: 60px;
    .box__logo__img {
      position: relative;
      width: 100%;
      height: 318px;
      border: 1px solid #333;
      border-radius: 10px;
      img {
        position: absolute;
        left: 0;
        right: 0;
        top: 88px;
        margin: auto;
      }
    }
    .logo__info {
      margin: 60px 0;
      font-family: $content-font;
      .logo__info__title {
        font-size: 28px;
        font-weight: 800;
        line-height: 58px;
        color: #fff;
      }
      .logo__info__text {
        font-size: 22px;
        font-weight: 400;
        line-height: 32px;
        color: rgba(255, 255, 255, 0.6);
        margin-top: 30px;
      }
      .logo__info__img {
        display: flex;
        justify-content: space-between;
        margin-top: 60px;
        .img__box {
          width: 410px;
          height: 628px;
          border-radius: 10px;
          overflow: hidden;
          img {
            width: 100%;
            height: 100%;
          }
        }
      }
    }
  }
  .content__logo__style {
    .logo__style__title {
      font-size: 28px;
      font-weight: 700;
      line-height: 48px;
      color: #fff;
    }
    .logo__style__text {
      font-size: 22px;
      font-weight: 400;
      line-height: 32px;
      color: rgba(255, 255, 255, 0.7);
      margin-top: 30px;
    }
    .logo__style__list {
      display: flex;
      flex-wrap: wrap;
      gap: 40px;
      margin-top: 60px;
      .logo__type {
        &:nth-child(n + 3) {
          margin-top: 58px;
        }
        .box {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 630px;
          height: 150px;
          border-radius: 30px;
          &.white {
            background-color: #fff;
          }
          &.black {
            background-color: #000;
          }
          &.blue {
            background-color: #0f4c81;
          }
        }
      }
      .logo__type__info {
        margin-top: 30px;
        .color {
          font-family: $content-font;
          font-size: 26px;
          font-weight: 800;
          line-height: 37px;
          color: #fff;
        }
        .style {
          font-size: 18px;
          font-weight: 500;
          line-height: 27px;
          color: rgba(255, 255, 255, 0.7);
          margin-top: 20px;
        }
      }
    }
  }
}

@include desktopToLaptop {
  .content {
    .content__logo__img {
      .logo__info {
        .logo__info__img {
          .img__box {
            width: calc((100% - 60px) / 3);
          }
        }
      }
    }
    .content__logo__style {
      .logo__style__list {
        .logo__type {
          width: calc((100% - 80px) / 2);
          .box {
            width: 100%;
          }
        }
      }
    }
  }
}
</style>
