import { Navigation, Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import { StyledSliderContainer } from "./styled";
import type { FeaturedSliderProps } from "./types";

import "swiper/css";
import "swiper/css/navigation";

export const FeaturedSlider = ({ slides }: FeaturedSliderProps) => {
  return (
    <StyledSliderContainer>
      <Swiper
        modules={[Navigation, Autoplay]}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        loop
        slidesPerView={1}
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>{slide}</SwiperSlide>
        ))}
      </Swiper>
    </StyledSliderContainer>
  );
};
