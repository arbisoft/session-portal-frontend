"use client";
import { faker } from "@faker-js/faker";
import ArrowForward from "@mui/icons-material/ArrowForward";
import StarIcon from "@mui/icons-material/Star";
import Chip from "@mui/material/Chip";
import Rating from "@mui/material/Rating";
import Typography from "@mui/material/Typography";
import { format } from "date-fns";

import MainLayoutContainer from "@/components/containers/MainLayoutContainer";
import RecommendedVideoCard, { RecommendedVideoCardProps } from "@/components/RecommendedVideoCard";
import VideoPlayer from "@/components/VideoPlayer";
import { secondsToTime } from "@/utils/utils";

import { StyledDetailSection, StyledNotesSection, StyledTitleSection, TagsContainer } from "./styled";

const VideoDetail = () => {
  const recommendedVideo: RecommendedVideoCardProps[] = Array(10)
    .fill("")
    .map(() => ({
      date: format(faker.date.past(), "MMM dd, yyyy"),
      duration: secondsToTime(faker.number.int({ min: 100, max: 1000 })),
      imgUrl: "/assets/images/temp-youtube-logo.webp",
      ratingValue: faker.number.int({ min: 1, max: 5 }),
      title: faker.lorem.words(10),
    }));

  return (
    <MainLayoutContainer
      rightSidebar={
        <div>
          <TagsContainer>
            <Chip label="All" size="small" />
            <Chip label="All Hand" variant="outlined" size="small" />
            <Chip label="POD" variant="outlined" size="small" />
            <Chip icon={<ArrowForward />} variant="outlined" size="small" />
          </TagsContainer>
          {recommendedVideo.map((vid, index) => (
            <RecommendedVideoCard
              date={vid.date}
              duration={vid.duration}
              imgUrl={vid.imgUrl}
              key={vid.date + index}
              ratingValue={vid.ratingValue}
              title={vid.title}
            />
          ))}
        </div>
      }
    >
      <VideoPlayer
        {...{
          crossOrigin: true,
          playsInline: true,
          width: "100%",
          title: "Product Perspective: Unlocking Innovation with Design Sprints",
          videoSrc: "https://files.vidstack.io/sprite-fight/720p.mp4",
          posterSrc: "https://files.vidstack.io/sprite-fight/poster.webp",
          posterAlt: "Girl walks into campfire with gnomes surrounding her friend ready for their next meal!",
        }}
      />
      <StyledTitleSection>
        <Typography variant="h4">Product Perspective: Unlocking Innovation with Design Sprints</Typography>
        <Rating readOnly value={3} size="medium" emptyIcon={<StarIcon fontSize="inherit" />} />
      </StyledTitleSection>
      <StyledDetailSection>
        <Typography variant="h6">Organizer name</Typography>
        <Typography>Jan 3, 2024</Typography>
      </StyledDetailSection>
      <StyledNotesSection>
        <Typography variant="h5">Session Notes</Typography>
        <div className="description">
          <Typography color="textSecondary">
            Get ready for another Product Perspective Session by Juniper! This time we&apos;re talking about unlocking innovation
            through Design Sprints! &#x1F9E0; Join us for an enlightening session led by Wajeeha Khalid and Sidra Adil, as they
            unravel the power of Design Sprints and their transformative impact on tech teams and products! In today&apos;s
            fast-paced tech landscape, Design Sprints have emerged as a game-changer, facilitating rapid ideation, prototyping,
            and validation of product concepts. In this engaging session, Wajeeha and Sidra will delve into the fundamentals of
            Design Sprints, why they are essential, and the remarkable impact they can create for tech teams and products.
            &#x1F3AF; Key Highlights: Understanding the concept and methodology behind Design Sprints. Exploring the importance of
            Design Sprints in fostering innovation and problem-solving. Real-world examples and insights from the recent expansive
            Design Sprint at edX/2U. Practical tips and strategies for implementing Design Sprints effectively within your
            organization. &#x1F3AF; Focus:&nbsp; The session focused on introducing the concept of Design Sprints and exploring
            their benefits in eliminating assumptions, ensuring stakeholder alignment, and fostering innovation right from the
            project&apos;s outset. &#x1F50D; Key Insights: Sidra introduced the concept of Design Sprints, emphasizing their role
            in eliminating assumptions and ensuring stakeholder alignment at the project&apos;s inception. Wajeeha shared insights
            from edX&apos;s rebranding journey, highlighting their use of a Design Sprint to understand post-Covid learning trends
            and align their various businesses effectively. User-Centric Approach: The importance of creating user personas and
            empathy maps help gain a deeper understanding of user needs and challenges. Qualitative generated from such practices
            helps in driving tailored experiences. Data-Driven Decision Making: The emphasis on the significance of data-driven
            decision-making in problem identification and solution design can not be overstated. Without having context on who you
            are building for, it is hard to create value for them. &#x1F4A1;Key Takeaways: Design Sprints play a pivotal role in
            fostering innovation and alignment among stakeholders. Understanding user needs through personas and empathy maps is
            crucial for designing impactful solutions. Data-driven decision-making enhances problem identification and solution
            effectiveness. &#x1F4DA;Resources: The slide deck can be found here. It also contains the screenshots of the figjam
            board so we have everything in one place.
          </Typography>
        </div>
      </StyledNotesSection>
    </MainLayoutContainer>
  );
};

export default VideoDetail;
