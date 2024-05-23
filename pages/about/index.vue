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
    </div>
    <div class="content">
      <p class="content__title">
        <span>BRAND LOGO</span>
        <span>IDENTITY</span>
      </p>
      <div class="content__logo">
        <div class="content__logo-img">
          <img src="/images/logo_about.png" alt="VERBY 로고" />
        </div>
        <div class="content__logo-info">
          <p class="content__logo-info-title">
            단순함 속 우아함, 차분함, 평화로움, 열린 사고, 소통
          </p>
          <p class="content__logo-info-text">
            버비를 상징하는 로고는 클래식 블루 컬러의 단순 텍스트 기반
            레터마크입니다. <br />클래식 블루는 해 질 무렵의 푸르스름한 하늘을
            암시하며, <br />불확실성이 많은 세상에서 보다 차분하고 평화로움을
            느낄 수 있도록 합니다.
          </p>
          <div class="content__logo-info-img">
            <div class="content__logo-info-img-box">
              <img src="/images/img_about01.png" alt="" />
            </div>
            <div class="content__logo-info-img-box">
              <img src="/images/img_about02.png" alt="" />
            </div>
            <div class="content__logo-info-img-box">
              <img src="/images/img_about03.png" alt="" />
            </div>
          </div>
        </div>
      </div>
      <div class="content__logo-style">
        <p class="content__logo-style-title">
          Pantone PMS 19-4052 TCX Classic Blue or Black / Days sans black /
          Regular
        </p>
        <p class="content__logo-style-text">
          버비는 팬톤 컬러의 클래식 블루와 블랙을 활용하며, <br />Day sans black
          폰트의 Regular 사이즈를 사 용합니다.
        </p>
        <div class="content__logo-style-list">
          <div class="content__logo-type">
            <div class="content__logo-type-box content__logo-type-box--white">
              <img src="/images/logo_blue.png" alt="VERBY 클래식 블루 로고" />
            </div>
            <div class="content__logo-type-info">
              <span class="content__logo-type-color">클래식 블루</span>
              <p class="content__logo-type-style">
                CMYK 100 / 76 / 25 / 0 <br />sRGB 15 / 76 / 129 <br />HTML / HEX
                #0f4c81
              </p>
            </div>
          </div>
          <div class="content__logo-type">
            <div class="content__logo-type-box content__logo-type-box--white">
              <img src="/images/logo_black.png" alt="VERBY 클래식 블랙 로고" />
            </div>
            <div class="content__logo-type-info">
              <span class="content__logo-type-color">블랙</span>
              <p class="content__logo-type-style">
                CMYK 0 / 0 / 0 / 100 <br />sRGB 0 / 0 / 0 <br />HTML / HEX
                #000000
              </p>
            </div>
          </div>
          <div class="content__logo-type">
            <div class="content__logo-type-box content__logo-type-box--blue">
              <img
                src="/images/logo_white.png"
                alt="VERBY 클래식 화이트 로고"
              />
            </div>
            <div class="content__logo-type-info">
              <span class="content__logo-type-color">화이트/클래식 블루</span>
              <p class="content__logo-type-style">
                CMYK 0 / 0 / 0 / 0 <br />sRGB 255 / 255 / 255 <br />HTML / HEX
                #ffffff
              </p>
            </div>
          </div>
          <div class="content__logo-type">
            <div class="content__logo-type-box content__logo-type-box--black">
              <img
                src="/images/logo_white.png"
                alt="VERBY 클래식 화이트 로고"
              />
            </div>
            <div class="content__logo-type-info">
              <span class="content__logo-type-color">화이트/블랙</span>
              <p class="content__logo-type-style">
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
@import "../../assets/scss/about.scss";
</style>
