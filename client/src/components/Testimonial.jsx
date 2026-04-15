import React from "react";

const Testimonial = () => {
  const dummyTestimonialData = [
    {
      image: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200",
      name: "John Doe",
      title: "Marketing Director, TechCorp",
      content: "QuickAi has revolutionized our workflow. The quality of the articles is outstanding, and the new YouTube summary feature saves us hours of research every week.",
      rating: 5,
    },
    {
      image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200",
      name: "Jane Smith",
      title: "Content Creator",
      content: "The object removal and image generation tools are top-tier. I cancelled my other subscriptions because everything I need is right here.",
      rating: 5,
    },
    {
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&h=200&auto=format&fit=crop",
      name: "Sarah Lee",
      title: "University Student",
      content: "The YouTube tutor is actual magic. It took a 2-hour lecture and generated a 40-page study guide with flowcharts. Absolute lifesaver for finals.",
      rating: 5,
    },
  ];

  return (
    <div className="px-4 sm:px-20 xl:px-32 py-24 bg-gray-50/50">
      <div className="text-center">
        <h2 className="text-slate-800 text-3xl sm:text-[42px] font-bold mb-4">Loved by Creators & Students</h2>
        <p className="text-gray-500 max-w-lg mx-auto text-lg">
          Don't just take our word for it. Here is what our users are saying about the platform.
        </p>
      </div>

      <div className="flex flex-wrap mt-16 justify-center gap-6">
        {dummyTestimonialData.map((testimonial, index) => (
          <div
            key={index}
            className="p-8 w-full sm:w-[340px] rounded-2xl bg-white shadow-sm hover:shadow-xl border border-gray-100 hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
                <div className="flex items-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                    <svg
                    key={i}
                    width="18"
                    height="17"
                    viewBox="0 0 16 15"
                    fill={i < testimonial.rating ? "#F59E0B" : "#E5E7EB"}
                    >
                    <path d="M7.04894 0.92705C7.3483 0.00573921 8.6517 0.00573969 8.95106 0.92705L10.0206 4.21885C10.1545 4.63087 10.5385 4.90983 10.9717 4.90983H14.4329C15.4016 4.90983 15.8044 6.14945 15.0207 6.71885L12.2205 8.75329C11.87 9.00793 11.7234 9.4593 11.8572 9.87132L12.9268 13.1631C13.2261 14.0844 12.1717 14.8506 11.388 14.2812L8.58778 12.2467C8.2373 11.9921 7.7627 11.9921 7.41221 12.2467L4.61204 14.2812C3.82833 14.8506 2.77385 14.0844 3.0732 13.1631L4.14277 9.87132C4.27665 9.4593 4.12999 9.00793 3.7795 8.75329L0.979333 6.71885C0.195619 6.14945 0.598395 4.90983 1.56712 4.90983H5.02832C5.46154 4.90983 5.8455 4.63087 5.97937 4.21885L7.04894 0.92705Z" />
                    </svg>
                ))}
                </div>
                <p className="text-gray-600 leading-relaxed italic mb-8">"{testimonial.content}"</p>
            </div>
            
            <div>
                <hr className="mb-5 border-gray-100" />
                <div className="flex items-center gap-4">
                <img
                    src={testimonial.image}
                    className="w-12 h-12 object-cover rounded-full border-2 border-white shadow-sm"
                    alt={testimonial.name}
                />
                <div>
                    <h3 className="font-bold text-gray-800">{testimonial.name}</h3>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">{testimonial.title}</p>
                </div>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Testimonial;