import React from 'react';
import './WorkoutAnimations.css';

const WorkoutAnimations: React.FC = () => {
  return (
    <div className="workout-animations">
      {/* Dumbbell Animation */}
      <div className="dumbbell-container">
        <div className="dumbbell">
          <div className="dumbbell-weight left"></div>
          <div className="dumbbell-handle"></div>
          <div className="dumbbell-weight right"></div>
        </div>
      </div>

      {/* Running Person Animation */}
      <div className="running-person">
        <div className="head"></div>
        <div className="body">
          <div className="arm left"></div>
          <div className="arm right"></div>
          <div className="leg left"></div>
          <div className="leg right"></div>
        </div>
      </div>

      {/* Barbell Animation */}
      <div className="barbell-container">
        <div className="barbell">
          <div className="barbell-weight left"></div>
          <div className="barbell-bar"></div>
          <div className="barbell-weight right"></div>
        </div>
      </div>

      {/* Treadmill Animation */}
      <div className="treadmill-container">
        <div className="treadmill">
          <div className="treadmill-belt"></div>
          <div className="treadmill-person">
            <div className="person-head"></div>
            <div className="person-body"></div>
            <div className="person-legs"></div>
          </div>
        </div>
      </div>

      {/* Jumping Rope Animation */}
      <div className="jump-rope-container">
        <div className="rope-person">
          <div className="rope-head"></div>
          <div className="rope-body"></div>
          <div className="rope-arms">
            <div className="rope left"></div>
            <div className="rope right"></div>
          </div>
          <div className="rope-legs"></div>
        </div>
      </div>

      {/* Yoga Pose Animation */}
      <div className="yoga-container">
        <div className="yoga-person">
          <div className="yoga-head"></div>
          <div className="yoga-body">
            <div className="yoga-arm left"></div>
            <div className="yoga-arm right"></div>
          </div>
          <div className="yoga-legs">
            <div className="yoga-leg left"></div>
            <div className="yoga-leg right"></div>
          </div>
        </div>
      </div>

      {/* Cycling Animation */}
      <div className="cycling-container">
        <div className="bike">
          <div className="bike-frame"></div>
          <div className="bike-wheel front"></div>
          <div className="bike-wheel back"></div>
          <div className="bike-person">
            <div className="cyclist-head"></div>
            <div className="cyclist-body"></div>
            <div className="cyclist-legs"></div>
          </div>
        </div>
      </div>

      {/* Swimming Animation */}
      <div className="swimming-container">
        <div className="swimmer">
          <div className="swimmer-head"></div>
          <div className="swimmer-body">
            <div className="swimmer-arm left"></div>
            <div className="swimmer-arm right"></div>
          </div>
          <div className="swimmer-legs"></div>
        </div>
        <div className="water-waves">
          <div className="wave"></div>
          <div className="wave"></div>
          <div className="wave"></div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutAnimations;
