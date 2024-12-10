// import React from 'react';
// import styles from './CustomRangeSlider.module.scss';

// const generateMarks = (min, max, step) => {
//     const marks = {};
//     for (let i = min; i <= max; i += step) {
//         marks[i] = i.toString();
//     }
//     return marks;
// };


// const CustomRangeSlider = ({ containerStyle = { width: "400px" }, thumbStyle = { height: "30px", width: "30px" },
//     labelStyles = { transform: "translate(-50%, 20px)" }, min = 0, max = 10, step = Math.round(max / 10), marks, value = min, setValue }) => {
//     const marksWithLabel = marks || generateMarks(min, max, step)

//     const handleTrackClick = (event) => {
//         const trackRect = event.target.getBoundingClientRect();
//         const clickPosition = event.clientX - trackRect.left;
//         const percentage = (clickPosition / trackRect.width) * 100;

//         // Calculate the raw value without rounding
//         const rawValue = (percentage / 100) * (max - min) + min;

//         // Snap to the nearest step value
//         const snappedValue = Math.round(rawValue / step) * step;

//         // Ensure the snapped value is within the min and max range
//         const newValue = Math.max(min, Math.min(snappedValue, max));
//         if (setValue) {
//             setValue(newValue);
//         }
//     };

//     return (
//         <div className={styles.sliderContainer} style={containerStyle}>
//             {/* Track */}
//             <div className={styles.slider_track} onClick={handleTrackClick}>
//                 {Object.entries(marksWithLabel).map(([position, label], index) => (
//                     <span
//                         key={position}
//                         className={styles.pointsMarker}
//                         onClick={(e) => {
//                             e.preventDefault();
//                             e.stopPropagation();
//                             console.log("marker value", index)
//                             setValue(index)
//                         }}
//                         style={{ left: `${(position / (max - min)) * 100}%` }}>

//                     </span>
//                 ))}
//             </div>
//             {/* Marks */}
//             <div className={styles.marks}>
//                 {Object.entries(marksWithLabel).map(([position, label]) => (
//                     <span
//                         key={position}
//                         className={`${styles.mark} ${value >= position ? styles.active : ''}`}
//                         style={{ ...labelStyles, left: `${(position / (max - min)) * 100}%` }}>
//                         {label}
//                     </span>
//                 ))}
//             </div>
//             {/* Thumb */}
//             <div
//                 className={styles.slider_thumb}
//                 style={{ ...thumbStyle, left: `${(value - min) / (max - min) * 100 - 1.5}%` }}
//             ></div>
//         </div>
//     );
// };

// export default CustomRangeSlider;
