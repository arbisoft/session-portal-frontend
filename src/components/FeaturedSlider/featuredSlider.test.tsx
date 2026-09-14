import React from "react";

import { sendGTMEvent } from "@next/third-parties/google";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";

import { ANALYTICS_CATEGORY, GA_EVENTS } from "@/utils/analytics";

import { FeaturedSlider } from "./featuredSlider";

jest.mock("@next/third-parties/google", () => ({
  sendGTMEvent: jest.fn(),
}));

let capturedSwiperProps: Record<string, unknown> = {};

jest.mock("swiper/react", () => ({
  Swiper: (props: Record<string, unknown> & { children?: React.ReactNode }) => {
    capturedSwiperProps = props;
    return <div data-testid="swiper">{props.children}</div>;
  },
  SwiperSlide: ({ children }: { children: React.ReactNode }) => <div data-testid="swiper-slide">{children}</div>,
}));

jest.mock("swiper/modules", () => ({
  Navigation: "Navigation",
  Autoplay: "Autoplay",
}));

jest.mock("swiper/css", () => ({}));
jest.mock("swiper/css/navigation", () => ({}));

describe("FeaturedSlider", () => {
  const mockSwiper = { realIndex: 2 };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should track featured_slider_navigate when the next arrow is used", () => {
    render(<FeaturedSlider slides={[<div key="1">Slide 1</div>, <div key="2">Slide 2</div>]} />);

    (capturedSwiperProps.onNavigationNext as (swiper: typeof mockSwiper) => void)(mockSwiper);

    expect(sendGTMEvent).toHaveBeenCalledWith({
      event: GA_EVENTS.FEATURED_SLIDER_NAVIGATE,
      event_category: ANALYTICS_CATEGORY.NAVIGATION,
      slide_index: 2,
    });
  });

  it("should track featured_slider_navigate when the previous arrow is used", () => {
    render(<FeaturedSlider slides={[<div key="1">Slide 1</div>, <div key="2">Slide 2</div>]} />);

    (capturedSwiperProps.onNavigationPrev as (swiper: typeof mockSwiper) => void)(mockSwiper);

    expect(sendGTMEvent).toHaveBeenCalledWith({
      event: GA_EVENTS.FEATURED_SLIDER_NAVIGATE,
      event_category: ANALYTICS_CATEGORY.NAVIGATION,
      slide_index: 2,
    });
  });

  it("should not track on plain render without navigation interaction", () => {
    render(<FeaturedSlider slides={[<div key="1">Slide 1</div>]} />);

    expect(sendGTMEvent).not.toHaveBeenCalled();
  });
});
