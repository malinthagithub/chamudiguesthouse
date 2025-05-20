import React from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate


function HotelBookingPage() {
  const navigate = useNavigate(); // Initialize the navigate function

  // Function to handle Sign In button click
  const handleSignInClick = () => {
    navigate("/login"); // Navigate to the login page
  };
  return (
    <div style={{ fontFamily: "Arial, sans-serif", margin: "0", padding: "0", height: "100%" }}>
      {/* Header */}
      <header
        style={{
          padding: "10px 20px",
          boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
          position: "fixed",
          top: 0,
          width: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          zIndex: 1000,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
          <h1 style={{ fontSize: "20px", fontWeight: "bold", color: "#fff", margin: 0, whiteSpace: "nowrap" }}>
            Chamudi Guest House
          </h1>

          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "15px", flexGrow: 1, position: "relative", left: "380px",color: "#f2f4f5" }}>
            <a href="#hotels" style={{ color: "#f2f4f5", textDecoration: "none" }}>Hotels</a> |
            <a href="#Discovery" style={{ color: "#f2f4f5", textDecoration: "none" }}>Discovery</a> |
            <a href="#Rate" style={{ color: "#f2f4f5", textDecoration: "none" }}>Rate</a> |
            <a href="#blog" style={{ color: "#f2f4f5", textDecoration: "none" }}>Blog</a>
          </div>

          <button
          onClick={handleSignInClick} // Attach the onClick event to navigate
            style={{
              position: "relative",
              left: "430px",
              fontSize: "14px",
              color: "#f2f4f5",
              border: "none",
              background: "none",
            }}
          >
            Sign In
          </button>
        </div>
      </header>

      {/* Hero Section with Video */}
      <section  id="hotels"
        style={{
          position: "relative",
          width: "100vw",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        <video
  width="100%"
  height="100%"
  autoPlay
  muted
  loop
  controls={false}
  style={{
    position: "absolute",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    objectFit: "cover",
    zIndex: -1,
  }}
>
  <source src="vedios/ls.mp4" type="video/mp4" />
  Your browser does not support the video tag.
</video>


        <div
          style={{
            position: "absolute",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            color: "#fff",
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: "48px", fontWeight: "bold", color: "#fff" }}>Chamudi Guest House</h1>
          <p style={{ fontSize: "22px" }}>CITY OF HIKKADUWA | SRI LANKA</p>
        </div>
      </section>

      {/* Cinnamon | Discovery Section */}
      <section  id="Discovery" style={{ padding: "60px 20px", backgroundColor: "#fff", textAlign: "center" }}>
        <h2 style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "20px" }}>
          <span style={{ fontFamily: "'Georgia', serif", fontWeight: "bold" }}>Chamudi</span> | DISCOVERY
        </h2>
        <p style={{ fontSize: "18px", color: "#555", marginBottom: "30px" }}>
         Experience more with our member-only benefits — from special rewards to upgraded stays and flexible check-in times.
        </p>
        <h3 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "30px", color: "#6a0dad" }}>EXCLUSIVE MEMBER BENEFITS</h3>
        <div style={{ display: "flex", justifyContent: "center", gap: "40px", flexWrap: "wrap" }}>
          {[
            { icon: "💰", title: "Member savings" },
            { icon: "🎁", title: "D$ rewards" },
            { icon: "📍", title: "Experiences & local offers" },
            { icon: "🏨", title: "Room upgrades" },
            { icon: "⏰", title: "Early check-in, late check-out" },
          ].map((benefit, index) => (
            <div key={index} style={{ textAlign: "center", width: "150px" }}>
              <div style={{ fontSize: "30px", color: "#6a0dad", marginBottom: "10px" }}>{benefit.icon}</div>
              <p style={{ fontSize: "14px", color: "#555", margin: 0 }}>{benefit.title}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Best Rate Guaranteed Section */}
      <section  id="Rate" style={{ padding: "60px 20px", backgroundColor: "#fff", textAlign: "center" }}>
        <h2 style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "20px", color: "#6a0dad" }}>
          BEST RATE GUARANTEED
        </h2>
        <p style={{ fontSize: "18px", color: "#555", marginBottom: "40px" }}>
          If you find a lower rate elsewhere, we will match it and add an additional 10% off. On top of that, enjoy the
          best free benefit selection and more, when you Book Direct.
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "20px",
            flexWrap: "wrap",
            transition: "transform 0.3s ease, box-shadow 0.3s ease 0.1s",
          }}
        >
          {[
            {
              image: "https://cdn.pixabay.com/photo/2016/04/15/11/43/hotel-1330834_1280.jpg",
              alt: "Poolside Relaxation",
            },
            {
              image: "https://cdn.pixabay.com/photo/2018/06/14/21/15/bedroom-3475656_1280.jpg",
              alt: "Scenic View",
            },
            {
              image: "https://cdn.pixabay.com/photo/2016/03/28/09/34/bedroom-1285156_1280.jpg",
              alt: "Sunset by the Water",
            },
          ].map((item, index) => (
            <div
              key={index}
              style={{
                position: "relative",
                borderRadius: "10px",
                overflow: "hidden",
                width: "300px",
                height: "400px",
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                transition: "transform 0.3s ease, box-shadow 0.3s ease 0.1s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-10px)";
                e.currentTarget.style.boxShadow = "0px 10px 20px rgba(0, 0, 0, 0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0px 4px 8px rgba(0, 0, 0, 0.1)";
              }}
            >
              <img
                src={item.image}
                alt={item.alt}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease 0.1s",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  borderRadius: "50%",
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease 0.1s",
                }}
              >
                <span style={{ fontSize: "18px", color: "#6a0dad" }}>♥</span>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section 
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 20px",
        backgroundColor: "#fff",
      }}
    >
      {/* Left Content */}
      <div
        style={{
          flex: "1",
          maxWidth: "500px",
          backgroundColor: "#f9f9f9",
          borderRadius: "10px",
          padding: "30px",
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: "28px",
            fontWeight: "bold",
            color: "#6a0dad",
            marginBottom: "20px",
          }}
        >
          CHAMUDI Guest House
        </h2>
        <p style={{ fontSize: "16px", color: "#555", marginBottom: "30px" }}>
          <h3 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "10px" }}>
           Contact Information
          </h3>
         📍 657, Narigama, Hikkaduwa, Sri Lanka  
          📞 091-2275937

        </p>
        <button
          style={{
            fontSize: "14px",
            padding: "10px 20px",
            border: "2px solid #6a0dad",
            borderRadius: "5px",
            backgroundColor: "transparent",
            color: "#6a0dad",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          DISCOVER MORE
        </button>
      </div>

      {/* Right Image */}
      <div
        style={{
          flex: "1",
          maxWidth: "500px",
          marginLeft: "20px",
          position: "relative",
        }}
      >
        <img
          src="https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/667e45c5cc530.jpg/1440x800/fit;c:0,1056,2551,2578;fp:59,53/80/8b9df4935145afd703da89205ddcb9ac.jpg" // Replace with actual image URL
          alt="Cinnamon Nature Trails"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: "10px",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "15px",
            right: "15px",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            borderRadius: "50%",
            width: "32px",
            height: "32px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: "18px", color: "#6a0dad" }}>♥</span>
        </div>
      </div>
    </section>

      {/* Blog Section */}
      <section id="blog" style={{ padding: "40px 20px", textAlign: "center" }}>
        <h2 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "10px" }}>Latest Blogs</h2>
        <p style={{ fontSize: "16px", color: "#777", marginBottom: "30px" }}>
          Stay up to date with the latest news and blogs from Chamudi Guest House.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: "30px" }}>
          {[
            {
              image:
                "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/66bde166ebbc1.jpg/600x800/fit/80/770e0ab29a5a6f31470a67645847306f.jpg",
              title: "Top Travel Destinations",
            },
            {
              image:
                "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/66bde0ac2a3e7.jpg/600x800/fit;c:0,401,3271,4905;fp:52,56/80/2af68f4285a8bfaf379feeb96aa695ff.jpg",
              title: "Guest Experience: Feedback & Reviews",
            },
            {
              image:
                "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/66bde0b9db05f.jpg/600x800/fit;c:2270,0,4918,3647;fp:50,50/80/1ed53531ae1f9454f02924d1c225dcc8.jpg",
              title: "Exploring Sri Lanka's Rich Culture",
            },
          ].map((blog, index) => (
            <div key={index} style={{ width: "300px" }}>
              <img
                src={blog.image}
                alt={blog.title}
                style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "10px" }}
              />
              <h3 style={{ fontSize: "20px", marginTop: "10px" }}>{blog.title}</h3>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default HotelBookingPage;
