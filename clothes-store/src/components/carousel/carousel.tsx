import SimpleImageSlider from "react-simple-image-slider";
import { useEffect, useState } from "react";
import carouselService from "../../service/carouselService";

const CarouselImage = () => {
  const [carouselData, setCarouselData] = useState();
  useEffect(() => {
    carouselService.getAllCarousel()
      .then((res) => {
        setCarouselData(res.data.map((data: any) => (
          {
            url: data.image
          }
        )));
      })
      .catch((err) => {
        console.log(err)
      })
  }, [])
  return (
    <div className="relative bg-[#F5F5F5]">
      {
        carouselData ? <SimpleImageSlider
          width={"100%"}
          height={"100%"}
          images={carouselData}
          showBullets={true}
          showNavs={true}
          slideDuration={0.8}
          autoPlay={true}
        /> : null
      }
      <div className="h-[81vh]"></div>
    </div>
  );
};

export default CarouselImage;
