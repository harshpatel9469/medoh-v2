import React from "react";
import Image from "next/image";
import "./components.css";
import { useRouter } from "next/navigation";

const data = [
  {
    id: "01",
    title: "Find Your Topic",
    desc: "Whatever your concern, get advice from experienced and trusted medical professionals.",
    highlight: "Your",
    img: "/Find-Your-Topic.jpg",
    page: "/dashboard/search",
  },
  {
    id: "02",
    title: "Easy Access",
    desc: "Conveniently access video answers anytime, anywhere, on any platform.",
    highlight: "Easy",
    img: "/Easy-Access.png",
    reverse: true,
    page: "/dashboard/home",
  },
  {
    id: "03",
    title: "Get the Right Treatments",
    desc: "Receive information specific to your health concerns.",
    highlight: "Right",
    img: "/Get-the-Right-Treatments.jpg",
    page: "/dashboard/search",
  },
];

const Build = () => {
  const router = useRouter()
  return (
    <section className="build-section">
      <div className="max-w-6xl mx-auto">
        <div className="flex-row grid-cols-3 mb-5">
          <div className="col-span-3">
            <h2 className="title">
              Built For <span>You</span>
            </h2>
          </div>
        </div>

        {data.map((item, index) => (
          <div
            key={index}
            className={`grid grid-cols-2 items-center bg-gray sticky-top  ${
              item.reverse ? "direction-rtl my-5 " : ""
            }`}
            onClick={()=>{
              router.push(item.page)
            }}
          >
            <div className="p-0 m-0 w-50">
              <div className="build-text">
                <div className="build-badge">{item.id}</div>
                <h4 className="build-heading">
                  {item.title.replace(item.highlight, "")}
                  <span> {item.highlight}</span>
                </h4>
                <p className="build-desc">{item.desc}</p>
              </div>
            </div>
            <div className="image-wrapper p-0 m-0 w-50">
              <div className="p-3">
                <img
                  src={item.img}
                  alt={item.title}
                  className=" rounded w-100"
                  //   width={600}
                  //   height={400}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Build;
