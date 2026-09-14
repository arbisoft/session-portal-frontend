import { Navigation, Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import { ANALYTICS_CATEGORY, GA_EVENTS, trackEvent } from "@/utils/analytics";

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
        onNavigationNext={(swiper) =>
          trackEvent(GA_EVENTS.FEATURED_SLIDER_NAVIGATE, ANALYTICS_CATEGORY.NAVIGATION, { slide_index: swiper.realIndex })
        }
        onNavigationPrev={(swiper) =>
          trackEvent(GA_EVENTS.FEATURED_SLIDER_NAVIGATE, ANALYTICS_CATEGORY.NAVIGATION, { slide_index: swiper.realIndex })
        }
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>{slide}</SwiperSlide>
        ))}
      </Swiper>
    </StyledSliderContainer>
  );
};
