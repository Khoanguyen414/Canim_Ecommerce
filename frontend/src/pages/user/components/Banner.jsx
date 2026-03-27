const Banner = () => {
  return (
    <div className="container mt-3">
      <div id="bannerCarousel" className="carousel slide" data-bs-ride="carousel">
        <div className="carousel-inner rounded">
          <div className="carousel-item active">
            <img src="https://picsum.photos/1200/400?1" className="d-block w-100" />
          </div>
          <div className="carousel-item">
            <img src="https://picsum.photos/1200/400?2" className="d-block w-100" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
