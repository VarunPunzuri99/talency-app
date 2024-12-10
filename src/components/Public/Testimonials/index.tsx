import style from './index.module.scss';
import Image from 'next/image';

const Testimonials = () => {
    const testimonialsData = [
        {
            stars: 5,
            imageSrc: '/assets/first/person.png',
            name: 'Martha Cole -1',
            quote: '“Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor” Lorem ipsum dolor sit amet consectetur adipisicing elit. Aperiam impedit recusandae omnis sequi quis culpa ipsam. Laborum eum qui porro consequuntur recusandae possimus, earum aliquid illum eaque, natus est! Ipsum voluptas assumenda eaque?',
        },
        {
            stars: 4,
            imageSrc: '/assets/first/person.png',
            name: 'John Cole -2',
            quote: '“Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor”',
        },
        {
            stars: 5,
            imageSrc: '/assets/first/person.png',
            name: 'Martha Cole-3',
            quote: '“Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor”',
        },
        {
            stars: 4,
            imageSrc: '/assets/first/person.png',
            name: 'Martha Cole-4',
            quote: '“Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor”',
        },
        {
            stars: 4,
            imageSrc: '/assets/first/person.png',
            name: 'John Cole-5',
            quote: '“Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor”',
        },

        {
            stars: 4,
            imageSrc: '/assets/first/person.png',
            name: 'Martha Cole-6',
            quote: '“Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor”',
        },
    ];
    const handleSlide = (side) => {
        if (!window) return;
        const testimonials_list = document.querySelector('#testimonials_list');
        console.log(
            testimonials_list.scrollWidth,
            testimonials_list.scrollLeft
        );
        if (side == 'left') {
            testimonials_list.scrollLeft = testimonials_list.scrollLeft - 1290;
        } else {
            testimonials_list.scrollLeft = testimonials_list.scrollLeft + 1290;
        }
    };
    return (
        <div className={style.Testimonials}>
            <h3>Testimonials</h3>
            <div className={style.list} id="testimonials_list">
                {testimonialsData.map((testimonial, index) => (
                    <div className={style.item} key={index}>
                        <div className={style.stars}>
                            {Array.from({ length: testimonial.stars }).map(
                                (_, starIndex) => (
                                    <i
                                        key={starIndex}
                                        className="pi pi-star-fill"
                                        style={{ color: 'yellow' }}
                                    ></i>
                                )
                            )}
                            {Array.from({ length: 5 - testimonial.stars }).map(
                                (_, starIndex) => (
                                    <i
                                        key={starIndex + testimonial.stars}
                                        className="pi pi-star"
                                        style={{ color: 'yellow' }}
                                    ></i>
                                )
                            )}
                        </div>
                        <Image
                            src={testimonial.imageSrc}
                            height="100"
                            width="100"
                            alt="img"
                        />
                        <h5>{testimonial.name}</h5>
                        <p>{testimonial.quote}</p>
                    </div>
                ))}
            </div>
            <div className={style.actions}>
                <i
                    className="pi pi-arrow-left"
                    onClick={() => handleSlide('left')}
                ></i>
                <i
                    className="pi pi-arrow-right"
                    onClick={() => handleSlide('right')}
                ></i>
            </div>
        </div>
    );
};

export default Testimonials;
